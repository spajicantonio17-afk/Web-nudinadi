// ─── Mock Data for Moderation Dashboard ─────────────
// Toggle USE_MOCK to switch between mock and real Supabase data
export const USE_MOCK = false;

import type {
  ModerationReport,
  ModerationAction,
  UserWarning,
  UserBan,
  AiModerationLog,
  Profile,
} from '@/lib/database.types';

// ─── Mock Profiles (for joins) ──────────────────────

export const MOCK_ADMIN_PROFILE: Profile = {
  id: 'admin_01',
  username: 'admin',
  full_name: 'Admin NudiNadi',
  avatar_url: null,
  bio: null,
  phone: null,
  email_verified: true,
  level: 10,
  xp: 50000,
  total_sales: 0,
  total_purchases: 0,
  rating_average: null,
  location: 'Sarajevo',
  instagram_url: null,
  facebook_url: null,
  is_admin: true,
  created_at: '2025-01-01T00:00:00Z',
  updated_at: '2025-01-01T00:00:00Z',
};

export const MOCK_USERS: Profile[] = [
  {
    id: 'user_01', username: 'marko_bh', full_name: 'Marko Petrović', avatar_url: null,
    bio: 'Prodajem rabljenu elektroniku', phone: '+387 61 123 456', email_verified: true, level: 3, xp: 350, total_sales: 12, total_purchases: 5,
    rating_average: 4.2, location: 'Banja Luka', instagram_url: null, facebook_url: null, is_admin: false,
    created_at: '2025-06-15T10:00:00Z', updated_at: '2026-02-20T10:00:00Z',
  },
  {
    id: 'user_02', username: 'amina_sa', full_name: 'Amina Hadžić', avatar_url: null,
    bio: 'Dizajnerska odjeća i aksesori', phone: null, email_verified: true, level: 5, xp: 1200, total_sales: 38, total_purchases: 15,
    rating_average: 4.8, location: 'Sarajevo', instagram_url: null, facebook_url: null, is_admin: false,
    created_at: '2025-03-10T08:00:00Z', updated_at: '2026-02-22T14:00:00Z',
  },
  {
    id: 'user_03', username: 'dejan_mo', full_name: 'Dejan Jovanović', avatar_url: null,
    bio: null, phone: null, email_verified: false, level: 1, xp: 20, total_sales: 1, total_purchases: 0,
    rating_average: 2.0, location: 'Mostar', instagram_url: null, facebook_url: null, is_admin: false,
    created_at: '2026-02-01T12:00:00Z', updated_at: '2026-02-23T09:00:00Z',
  },
  {
    id: 'user_04', username: 'lejla_tz', full_name: 'Lejla Mujić', avatar_url: null,
    bio: 'Knjige i vintage stvari', phone: '+387 62 789 012', email_verified: true, level: 4, xp: 700, total_sales: 22, total_purchases: 30,
    rating_average: 4.9, location: 'Tuzla', instagram_url: null, facebook_url: null, is_admin: false,
    created_at: '2025-05-20T14:00:00Z', updated_at: '2026-02-24T08:00:00Z',
  },
  {
    id: 'user_05', username: 'spam_bot_99', full_name: '', avatar_url: null,
    bio: 'BUY NOW CHEAP!!!', phone: null, email_verified: false, level: 1, xp: 0, total_sales: 0, total_purchases: 0,
    rating_average: null, location: null, instagram_url: null, facebook_url: null, is_admin: false,
    created_at: '2026-02-23T22:00:00Z', updated_at: '2026-02-23T22:00:00Z',
  },
  {
    id: 'user_06', username: 'emir_ze', full_name: 'Emir Begović', avatar_url: null,
    bio: 'Auto dijelovi originalni', phone: null, email_verified: false, level: 2, xp: 150, total_sales: 6, total_purchases: 2,
    rating_average: 3.5, location: 'Zenica', instagram_url: null, facebook_url: null, is_admin: false,
    created_at: '2025-09-01T10:00:00Z', updated_at: '2026-02-21T16:00:00Z',
  },
];

// ─── Mock Moderation Reports ────────────────────────

export const MOCK_REPORTS: (ModerationReport & {
  product_title?: string;
  product_image?: string;
  reported_user_name?: string;
  reporter_name?: string;
})[] = [
  {
    id: 'report_01',
    product_id: 'prod_01',
    reported_user_id: 'user_03',
    reporter_id: null,
    reason: 'scam',
    description: 'AI detektovao sumnjiv obrazac cijena — preniska cijena za kategoriju.',
    ai_moderation_result: { score: 25, isBlocked: false, level: 'Upozorenje', warnings: ['Cijena značajno ispod tržišne vrijednosti'], blockedReasons: [], recommendation: 'Provjeri' },
    ai_score: 25,
    status: 'pending',
    priority: 2,
    assigned_admin_id: null,
    resolved_at: null,
    resolution_note: null,
    created_at: '2026-02-24T08:30:00Z',
    updated_at: '2026-02-24T08:30:00Z',
    product_title: 'iPhone 15 Pro Max — HITNO',
    product_image: 'https://picsum.photos/seed/iphone15/100/100',
    reported_user_name: 'dejan_mo',
    reporter_name: undefined,
  },
  {
    id: 'report_02',
    product_id: 'prod_02',
    reported_user_id: 'user_05',
    reporter_id: 'user_01',
    reason: 'spam',
    description: 'Korisnik objavio 20 istih oglasa u 5 minuta.',
    ai_moderation_result: null,
    ai_score: null,
    status: 'pending',
    priority: 3,
    assigned_admin_id: null,
    resolved_at: null,
    resolution_note: null,
    created_at: '2026-02-24T07:15:00Z',
    updated_at: '2026-02-24T07:15:00Z',
    product_title: 'CHEAP ELECTRONICS BUY NOW!!!',
    product_image: 'https://picsum.photos/seed/spam/100/100',
    reported_user_name: 'spam_bot_99',
    reporter_name: 'marko_bh',
  },
  {
    id: 'report_03',
    product_id: 'prod_03',
    reported_user_id: 'user_03',
    reporter_id: null,
    reason: 'prohibited_content',
    description: 'AI detektovao zabranjeni sadržaj u opisu oglasa.',
    ai_moderation_result: { score: 10, isBlocked: true, level: 'Opasan', warnings: ['Zabranjeni predmet'], blockedReasons: ['Prodaja zabranjenih supstanci'], recommendation: 'Blokiraj' },
    ai_score: 10,
    status: 'pending',
    priority: 3,
    assigned_admin_id: null,
    resolved_at: null,
    resolution_note: null,
    created_at: '2026-02-24T06:00:00Z',
    updated_at: '2026-02-24T06:00:00Z',
    product_title: 'Posebna ponuda — privatna poruka',
    product_image: 'https://picsum.photos/seed/prohibited/100/100',
    reported_user_name: 'dejan_mo',
    reporter_name: undefined,
  },
  {
    id: 'report_04',
    product_id: 'prod_04',
    reported_user_id: 'user_06',
    reporter_id: 'user_04',
    reason: 'fake_listing',
    description: 'Slike ne odgovaraju opisu. Koristi stock fotografije.',
    ai_moderation_result: null,
    ai_score: null,
    status: 'reviewing',
    priority: 1,
    assigned_admin_id: 'admin_01',
    resolved_at: null,
    resolution_note: null,
    created_at: '2026-02-23T14:20:00Z',
    updated_at: '2026-02-24T09:00:00Z',
    product_title: 'BMW 320d 2020 — kao novo',
    product_image: 'https://picsum.photos/seed/bmw320/100/100',
    reported_user_name: 'emir_ze',
    reporter_name: 'lejla_tz',
  },
  {
    id: 'report_05',
    product_id: 'prod_05',
    reported_user_id: 'user_01',
    reporter_id: 'user_02',
    reason: 'inappropriate',
    description: 'Neprimjeren jezik u opisu artikla.',
    ai_moderation_result: { score: 45, isBlocked: false, level: 'Upozorenje', warnings: ['Neprimjeren rječnik'], blockedReasons: [], recommendation: 'Provjeri' },
    ai_score: 45,
    status: 'approved',
    priority: 0,
    assigned_admin_id: 'admin_01',
    resolved_at: '2026-02-23T16:00:00Z',
    resolution_note: 'Opis uređen, oglas odobren.',
    created_at: '2026-02-23T10:00:00Z',
    updated_at: '2026-02-23T16:00:00Z',
    product_title: 'Gaming stolica — rabljena',
    product_image: 'https://picsum.photos/seed/chair/100/100',
    reported_user_name: 'marko_bh',
    reporter_name: 'amina_sa',
  },
  {
    id: 'report_06',
    product_id: null,
    reported_user_id: 'user_05',
    reporter_id: 'user_02',
    reason: 'scam',
    description: 'Korisnik šalje phishing linkove u porukama.',
    ai_moderation_result: null,
    ai_score: null,
    status: 'pending',
    priority: 3,
    assigned_admin_id: null,
    resolved_at: null,
    resolution_note: null,
    created_at: '2026-02-24T09:45:00Z',
    updated_at: '2026-02-24T09:45:00Z',
    product_title: undefined,
    reported_user_name: 'spam_bot_99',
    reporter_name: 'amina_sa',
  },
  {
    id: 'report_07',
    product_id: 'prod_07',
    reported_user_id: 'user_06',
    reporter_id: null,
    reason: 'duplicate',
    description: 'AI detektovao duplikat — isti oglas objavljen 3 puta.',
    ai_moderation_result: { isDuplicate: true, confidence: 92, reason: 'Identičan naslov i opis', recommendation: 'Blokiraj' },
    ai_score: 92,
    status: 'rejected',
    priority: 1,
    assigned_admin_id: 'admin_01',
    resolved_at: '2026-02-22T11:30:00Z',
    resolution_note: 'Duplikat potvrđen, oglasi uklonjeni.',
    created_at: '2026-02-22T08:00:00Z',
    updated_at: '2026-02-22T11:30:00Z',
    product_title: 'Audi A4 2018 — hitna prodaja',
    product_image: 'https://picsum.photos/seed/audi/100/100',
    reported_user_name: 'emir_ze',
    reporter_name: undefined,
  },
  {
    id: 'report_08',
    product_id: 'prod_08',
    reported_user_id: 'user_01',
    reporter_id: null,
    reason: 'personal_info',
    description: 'AI detektovao osobne podatke u opisu — IBAN broj.',
    ai_moderation_result: { score: 30, isBlocked: false, level: 'Upozorenje', warnings: ['IBAN broj u opisu'], blockedReasons: [], recommendation: 'Provjeri' },
    ai_score: 30,
    status: 'approved',
    priority: 1,
    assigned_admin_id: 'admin_01',
    resolved_at: '2026-02-21T15:00:00Z',
    resolution_note: 'Korisnik upozoren, IBAN uklonjen iz opisa.',
    created_at: '2026-02-21T12:00:00Z',
    updated_at: '2026-02-21T15:00:00Z',
    product_title: 'Samsung Galaxy S24 Ultra',
    product_image: 'https://picsum.photos/seed/samsung/100/100',
    reported_user_name: 'marko_bh',
    reporter_name: undefined,
  },
  {
    id: 'report_09',
    product_id: 'prod_09',
    reported_user_id: 'user_03',
    reporter_id: 'user_04',
    reason: 'scam',
    description: 'Traži uplatu unaprijed bez mogućnosti pregleda artikla.',
    ai_moderation_result: null,
    ai_score: null,
    status: 'escalated',
    priority: 3,
    assigned_admin_id: 'admin_01',
    resolved_at: null,
    resolution_note: null,
    created_at: '2026-02-20T18:00:00Z',
    updated_at: '2026-02-23T10:00:00Z',
    product_title: 'PlayStation 5 — samo uplata',
    product_image: 'https://picsum.photos/seed/ps5/100/100',
    reported_user_name: 'dejan_mo',
    reporter_name: 'lejla_tz',
  },
  {
    id: 'report_10',
    product_id: 'prod_10',
    reported_user_id: 'user_02',
    reporter_id: null,
    reason: 'inappropriate',
    description: 'AI flag — oglas kategorija ne odgovara sadržaju.',
    ai_moderation_result: { score: 55, isBlocked: false, level: 'Upozorenje', warnings: ['Kategorija ne odgovara'], blockedReasons: [], recommendation: 'Provjeri' },
    ai_score: 55,
    status: 'approved',
    priority: 0,
    assigned_admin_id: 'admin_01',
    resolved_at: '2026-02-19T14:00:00Z',
    resolution_note: 'Kategorija ispravljena, oglas OK.',
    created_at: '2026-02-19T10:00:00Z',
    updated_at: '2026-02-19T14:00:00Z',
    product_title: 'Zara haljina — nova s etiketom',
    product_image: 'https://picsum.photos/seed/dress/100/100',
    reported_user_name: 'amina_sa',
    reporter_name: undefined,
  },
];

// ─── Mock Warnings ──────────────────────────────────

export const MOCK_WARNINGS: UserWarning[] = [
  {
    id: 'warn_01', user_id: 'user_03', admin_id: 'admin_01', report_id: 'report_09',
    reason: 'Zahtijevanje uplate unaprijed bez mogućnosti pregleda artikla. Ovo krši pravila platforme.',
    severity: 2, acknowledged: false, created_at: '2026-02-23T10:00:00Z',
  },
  {
    id: 'warn_02', user_id: 'user_01', admin_id: 'admin_01', report_id: 'report_08',
    reason: 'Objavljivanje osobnih podataka (IBAN) u opisu oglasa.',
    severity: 1, acknowledged: true, created_at: '2026-02-21T15:00:00Z',
  },
  {
    id: 'warn_03', user_id: 'user_06', admin_id: 'admin_01', report_id: 'report_07',
    reason: 'Objavljivanje duplikata oglasa. Molimo objavljujte svaki oglas samo jednom.',
    severity: 1, acknowledged: true, created_at: '2026-02-22T11:30:00Z',
  },
];

// ─── Mock Bans ──────────────────────────────────────

export const MOCK_BANS: UserBan[] = [
  {
    id: 'ban_01', user_id: 'user_05', admin_id: 'admin_01',
    reason: 'Spam bot — automatsko objavljivanje i phishing linkovi u porukama.',
    banned_at: '2026-02-24T10:00:00Z', expires_at: null, is_active: true,
    unbanned_at: null, unbanned_by: null, created_at: '2026-02-24T10:00:00Z',
  },
];

// ─── Mock AI Moderation Logs ────────────────────────

export const MOCK_AI_LOGS: AiModerationLog[] = [
  {
    id: 'ailog_01', product_id: 'prod_01', user_id: 'user_03', action: 'moderate',
    input_data: { title: 'iPhone 15 Pro Max — HITNO', price: 200, category: 'mobiteli' },
    result_data: { score: 25, isBlocked: false, level: 'Upozorenje', warnings: ['Cijena značajno ispod tržišne vrijednosti'] },
    score: 25, is_flagged: true, processing_time_ms: 1240, created_at: '2026-02-24T08:29:00Z',
  },
  {
    id: 'ailog_02', product_id: 'prod_03', user_id: 'user_03', action: 'moderate',
    input_data: { title: 'Posebna ponuda — privatna poruka', price: 0, category: 'ostalo' },
    result_data: { score: 10, isBlocked: true, level: 'Opasan', warnings: ['Zabranjeni predmet'], blockedReasons: ['Prodaja zabranjenih supstanci'] },
    score: 10, is_flagged: true, processing_time_ms: 980, created_at: '2026-02-24T05:59:00Z',
  },
  {
    id: 'ailog_03', product_id: 'prod_07', user_id: 'user_06', action: 'duplicate',
    input_data: { title: 'Audi A4 2018 — hitna prodaja', category: 'vozila' },
    result_data: { isDuplicate: true, confidence: 92, reason: 'Identičan naslov i opis', recommendation: 'Blokiraj' },
    score: 92, is_flagged: true, processing_time_ms: 1500, created_at: '2026-02-22T07:59:00Z',
  },
  {
    id: 'ailog_04', product_id: 'prod_08', user_id: 'user_01', action: 'moderate',
    input_data: { title: 'Samsung Galaxy S24 Ultra', price: 850, category: 'mobiteli', description: 'Prodajem... IBAN: BA39...' },
    result_data: { score: 30, isBlocked: false, level: 'Upozorenje', warnings: ['IBAN broj u opisu'] },
    score: 30, is_flagged: true, processing_time_ms: 1100, created_at: '2026-02-21T11:59:00Z',
  },
  {
    id: 'ailog_05', product_id: 'prod_10', user_id: 'user_02', action: 'moderate',
    input_data: { title: 'Zara haljina — nova s etiketom', price: 45, category: 'tehnika' },
    result_data: { score: 55, isBlocked: false, level: 'Upozorenje', warnings: ['Kategorija ne odgovara'] },
    score: 55, is_flagged: true, processing_time_ms: 870, created_at: '2026-02-19T09:59:00Z',
  },
  {
    id: 'ailog_06', product_id: 'prod_11', user_id: 'user_02', action: 'moderate',
    input_data: { title: 'Nike Air Max 90 — original', price: 120, category: 'odjeca' },
    result_data: { score: 85, isBlocked: false, level: 'Bezbedan', warnings: [] },
    score: 85, is_flagged: false, processing_time_ms: 650, created_at: '2026-02-24T07:00:00Z',
  },
  {
    id: 'ailog_07', product_id: 'prod_12', user_id: 'user_04', action: 'moderate',
    input_data: { title: 'Harry Potter komplet — svih 7 knjiga', price: 60, category: 'literatura' },
    result_data: { score: 95, isBlocked: false, level: 'Bezbedan', warnings: [] },
    score: 95, is_flagged: false, processing_time_ms: 720, created_at: '2026-02-24T06:30:00Z',
  },
  {
    id: 'ailog_08', product_id: null, user_id: 'user_02', action: 'trust',
    input_data: { totalListings: 38, successfulSales: 35, rating: 4.8, reviewCount: 28, accountAgeDays: 350, hasAvatar: true, hasPhone: true, hasEmail: true },
    result_data: { score: 88, level: 'Provjereni prodavač', badge: '🛡️ Provjereni', breakdown: { activity: 90, reputation: 95, verification: 100, history: 85 } },
    score: 88, is_flagged: false, processing_time_ms: 1300, created_at: '2026-02-23T12:00:00Z',
  },
];

// ─── Mock Actions (Audit Log) ───────────────────────

export const MOCK_ACTIONS: ModerationAction[] = [
  {
    id: 'action_01', report_id: 'report_07', admin_id: 'admin_01', action_type: 'reject',
    target_user_id: 'user_06', target_product_id: 'prod_07',
    reason: 'Duplikat potvrđen, oglasi uklonjeni.', metadata: null, created_at: '2026-02-22T11:30:00Z',
  },
  {
    id: 'action_02', report_id: 'report_07', admin_id: 'admin_01', action_type: 'warn',
    target_user_id: 'user_06', target_product_id: null,
    reason: 'Duplikati oglasa', metadata: null, created_at: '2026-02-22T11:30:00Z',
  },
  {
    id: 'action_03', report_id: 'report_08', admin_id: 'admin_01', action_type: 'approve',
    target_user_id: 'user_01', target_product_id: 'prod_08',
    reason: 'IBAN uklonjen, oglas ispravan.', metadata: null, created_at: '2026-02-21T15:00:00Z',
  },
  {
    id: 'action_04', report_id: 'report_08', admin_id: 'admin_01', action_type: 'warn',
    target_user_id: 'user_01', target_product_id: null,
    reason: 'Osobni podaci u opisu', metadata: null, created_at: '2026-02-21T15:00:00Z',
  },
  {
    id: 'action_05', report_id: 'report_05', admin_id: 'admin_01', action_type: 'approve',
    target_user_id: 'user_01', target_product_id: 'prod_05',
    reason: 'Opis uređen, oglas odobren.', metadata: null, created_at: '2026-02-23T16:00:00Z',
  },
  {
    id: 'action_06', report_id: 'report_10', admin_id: 'admin_01', action_type: 'approve',
    target_user_id: 'user_02', target_product_id: 'prod_10',
    reason: 'Kategorija ispravljena.', metadata: null, created_at: '2026-02-19T14:00:00Z',
  },
];

// ─── Mock Stats ─────────────────────────────────────

export const MOCK_STATS = {
  pendingReports: 5,
  resolvedToday: 3,
  activeBans: 1,
  aiFlagsToday: 4,
  totalReports: 142,
  avgResolutionMinutes: 47,
  reportsByReason: [
    { reason: 'spam', label: 'Spam', count: 45, color: '#6366f1' },
    { reason: 'scam', label: 'Prevara', count: 32, color: '#ef4444' },
    { reason: 'duplicate', label: 'Duplikat', count: 28, color: '#f59e0b' },
    { reason: 'prohibited_content', label: 'Zabranjeno', count: 15, color: '#dc2626' },
    { reason: 'inappropriate', label: 'Neprimjereno', count: 12, color: '#f97316' },
    { reason: 'fake_listing', label: 'Lažni oglas', count: 8, color: '#8b5cf6' },
    { reason: 'personal_info', label: 'Osobni podaci', count: 5, color: '#06b6d4' },
    { reason: 'other', label: 'Ostalo', count: 3, color: '#94a3b8' },
  ],
  reportsOverTime: [
    { date: '18.02.', count: 12 },
    { date: '19.02.', count: 18 },
    { date: '20.02.', count: 15 },
    { date: '21.02.', count: 22 },
    { date: '22.02.', count: 19 },
    { date: '23.02.', count: 25 },
    { date: '24.02.', count: 12 },
  ],
};

// ─── Helper: reason label mapping ───────────────────

export const REASON_LABELS: Record<string, string> = {
  spam: 'Spam',
  scam: 'Prevara',
  prohibited_content: 'Zabranjeno',
  duplicate: 'Duplikat',
  inappropriate: 'Neprimjereno',
  fake_listing: 'Lažni oglas',
  personal_info: 'Osobni podaci',
  other: 'Ostalo',
};

export const STATUS_LABELS: Record<string, string> = {
  pending: 'Na čekanju',
  reviewing: 'U pregledu',
  approved: 'Odobreno',
  rejected: 'Odbijeno',
  escalated: 'Eskalirano',
};

export const ACTION_LABELS: Record<string, string> = {
  approve: 'Odobri',
  reject: 'Odbij',
  warn: 'Upozori',
  ban: 'Blokiraj',
  unban: 'Deblokiraj',
  escalate: 'Eskaliraj',
  dismiss: 'Odbaci',
};
