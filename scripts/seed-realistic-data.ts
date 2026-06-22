/**
 * NudiNadi — Realistic Seed Script
 *
 * Creates 30 realistic-looking profiles and ~90 product listings
 * in your Supabase project via the Admin API.
 *
 * Usage:
 *   npx tsx scripts/seed-realistic-data.ts
 *   npx tsx scripts/seed-realistic-data.ts --cleanup   (removes all seeded data)
 *
 * Requires: SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY in .env.local
 */

import { createClient } from '@supabase/supabase-js';
import { readFileSync } from 'fs';
import { resolve } from 'path';
import { SEED_PROFILES } from './seed-data/profiles.js';
import { CAR_PRODUCTS } from './seed-data/products-cars.js';
import { REALESTATE_PRODUCTS } from './seed-data/products-real-estate.js';
import { TECH_PRODUCTS } from './seed-data/products-tech.js';
import { FASHION_PRODUCTS } from './seed-data/products-fashion.js';
import { MISC_PRODUCTS } from './seed-data/products-misc.js';
import type { SeedProduct } from './seed-data/types.js';

// ── Load env ──────────────────────────────────────────────
function loadEnv() {
  try {
    const raw = readFileSync(resolve(process.cwd(), '.env.local'), 'utf-8');
    for (const line of raw.split('\n')) {
      const m = line.match(/^([^#=]+)=(.*)$/);
      if (m) process.env[m[1].trim()] = m[2].trim().replace(/^["']|["']$/g, '');
    }
  } catch {
    // already in env
  }
}
loadEnv();

const SUPABASE_URL = (process.env.SUPABASE_URL ?? process.env.NEXT_PUBLIC_SUPABASE_URL)!;
const SERVICE_KEY  = process.env.SUPABASE_SERVICE_ROLE_KEY!;

if (!SUPABASE_URL || !SERVICE_KEY) {
  console.error('❌  SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY must be set in .env.local');
  process.exit(1);
}

const supabase = createClient(SUPABASE_URL, SERVICE_KEY, {
  auth: { autoRefreshToken: false, persistSession: false },
});

// ── Helpers ───────────────────────────────────────────────
function daysAgo(n: number): string {
  const d = new Date();
  d.setDate(d.getDate() - n);
  return d.toISOString();
}

// Map karoserija value to category slug
const KAROSERIJA_SLUG: Record<string, string> = {
  'Sedan':    'vozila-osobni-sedan',
  'Karavan':  'vozila-osobni-karavan',
  'Hatchback':'vozila-osobni-hatchback',
  'Coupe':    'vozila-osobni-coupe',
  'Kabriolet':'vozila-osobni-coupe',
  'SUV':      'vozila-osobni-suv',
  'Crossover':'vozila-osobni-suv',
  'Pickup':   'vozila-osobni-pickup',
  'Van':      'vozila-osobni-van',
  'Minivan':  'vozila-osobni-van',
  'Limuzina': 'vozila-osobni-sedan',
};

/** Resolve category UUID by slug (cached) */
const categoryCache: Record<string, string> = {};
async function getCategoryId(slug: string, attributes?: Record<string, unknown>): Promise<string | null> {
  // Auto-resolve car category from karoserija attribute
  let resolvedSlug = slug;
  if (slug === 'vozila-osobni-rabljeni' && attributes?.karoserija) {
    resolvedSlug = KAROSERIJA_SLUG[attributes.karoserija as string] ?? 'vozila-osobni-automobili';
  }
  if (categoryCache[resolvedSlug]) return categoryCache[resolvedSlug];
  const { data } = await supabase
    .from('categories')
    .select('id')
    .eq('slug', resolvedSlug)
    .single();
  if (data?.id) categoryCache[resolvedSlug] = data.id;
  return data?.id ?? null;
}

// ── Cleanup mode ──────────────────────────────────────────
async function cleanup() {
  console.log('🧹  Cleaning up seeded data…');
  const { data: profiles } = await supabase
    .from('profiles')
    .select('id')
    .like('id', '%'); // we'll filter via auth.users email

  // Find seeded users by email pattern
  const { data: users } = await supabase.auth.admin.listUsers({ perPage: 1000 });
  const seeded = users?.users.filter(u => u.email?.endsWith('@mailtest.nudinadi.ba')) ?? [];

  for (const u of seeded) {
    // Delete products first (FK)
    await supabase.from('products').delete().eq('seller_id', u.id);
    // Delete profile
    await supabase.from('profiles').delete().eq('id', u.id);
    // Delete auth user
    await supabase.auth.admin.deleteUser(u.id);
    console.log(`  🗑  Deleted ${u.email}`);
  }
  console.log(`✅  Cleanup done — removed ${seeded.length} users`);
}

// ── All products keyed by sellerKey ──────────────────────
const ALL_PRODUCTS: SeedProduct[] = [
  ...CAR_PRODUCTS,
  ...REALESTATE_PRODUCTS,
  ...TECH_PRODUCTS,
  ...FASHION_PRODUCTS,
  ...MISC_PRODUCTS,
];

// ── Main seed ─────────────────────────────────────────────
async function seed() {
  console.log('🌱  Starting seed…\n');

  let createdProfiles = 0;
  let createdProducts = 0;
  const sellerIdMap: Record<string, string> = {}; // username → uuid

  for (const profile of SEED_PROFILES) {
    // Check if already exists
    const { data: existing } = await supabase
      .from('profiles')
      .select('id')
      .eq('username', profile.username)
      .single();

    let userId: string;

    if (existing?.id) {
      console.log(`  ⏭  ${profile.username} already exists, skipping`);
      userId = existing.id;
    } else {
      // Create auth user
      const { data: authData, error: authErr } = await supabase.auth.admin.createUser({
        email: profile.email,
        password: 'NudiNadi2024!Seed',
        email_confirm: true,
        user_metadata: { full_name: profile.full_name },
      });

      if (authErr || !authData.user) {
        console.error(`  ❌  Auth error for ${profile.username}:`, authErr?.message);
        continue;
      }

      userId = authData.user.id;

      // Update profile (trigger auto-created it)
      const profileUpdate: Record<string, unknown> = {
        username: profile.username,
        full_name: profile.full_name,
        avatar_url: profile.avatar_url,
        bio: profile.bio,
        phone: profile.phone,
        location: profile.location,
        account_type: profile.account_type,
        email_verified: profile.email_verified,
        phone_verified: profile.phone_verified,
        level: profile.level,
        xp: profile.xp,
        total_sales: profile.total_sales,
        total_purchases: profile.total_purchases,
        rating_average: profile.rating_average,
        followers_count: profile.followers_count,
        following_count: profile.following_count,
        promoted_credits: profile.promoted_credits,
        created_at: daysAgo(profile.createdDaysAgo),
        updated_at: daysAgo(Math.max(0, profile.createdDaysAgo - 5)),
      };

      if (profile.company_name) profileUpdate.company_name = profile.company_name;
      if (profile.company_logo) profileUpdate.company_logo = profile.company_logo;
      if (profile.business_verified !== undefined) profileUpdate.business_verified = profile.business_verified;
      if (profile.business_category) profileUpdate.business_category = profile.business_category;
      if (profile.website_url) profileUpdate.website_url = profile.website_url;

      const { error: profErr } = await supabase
        .from('profiles')
        .update(profileUpdate)
        .eq('id', userId);

      if (profErr) {
        console.error(`  ❌  Profile update error for ${profile.username}:`, profErr.message);
      } else {
        console.log(`  ✅  Created profile: ${profile.username} (${profile.account_type})`);
        createdProfiles++;
      }
    }

    sellerIdMap[profile.username] = userId;
  }

  console.log(`\n📦  Creating products…\n`);

  for (const product of ALL_PRODUCTS) {
    const sellerId = sellerIdMap[product.sellerKey];
    if (!sellerId) {
      console.warn(`  ⚠  No seller found for key: ${product.sellerKey}`);
      continue;
    }

    const categoryId = await getCategoryId(product.categorySlug, product.attributes);
    if (!categoryId) {
      console.warn(`  ⚠  Category not found: ${product.categorySlug}`);
    }

    const promotedUntil = product.promoted
      ? new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString()
      : null;

    const { error: prodErr } = await supabase.from('products').insert({
      seller_id: sellerId,
      title: product.title,
      description: product.description,
      price: product.price,
      currency: product.currency,
      country: product.country,
      category_id: categoryId,
      condition: product.condition,
      listing_type: product.listing_type,
      images: product.images,
      location: product.location,
      tags: product.tags,
      attributes: product.attributes,
      status: 'active',
      views_count: product.views_count,
      favorites_count: product.favorites_count,
      promoted_until: promotedUntil,
      created_at: daysAgo(product.createdDaysAgo),
      updated_at: daysAgo(Math.max(0, product.createdDaysAgo - 1)),
    });

    if (prodErr) {
      console.error(`  ❌  Product error "${product.title.slice(0, 40)}…":`, prodErr.message);
    } else {
      console.log(`  ✅  ${product.title.slice(0, 55)}…`);
      createdProducts++;
    }
  }

  console.log(`\n🎉  Done!`);
  console.log(`    Profiles created: ${createdProfiles}`);
  console.log(`    Products created: ${createdProducts}`);
}

// ── Entry point ───────────────────────────────────────────
const isCleanup = process.argv.includes('--cleanup');
if (isCleanup) {
  cleanup().catch(console.error);
} else {
  seed().catch(console.error);
}
