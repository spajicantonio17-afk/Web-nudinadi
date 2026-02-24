# NudiNadi Marketplace - Project Rules

## DESIGN FREEZE (ACTIVE)

The UI design is **FROZEN** as of commit `e980bd9`. The following rules apply to ALL agents:

### Protected Files - DO NOT MODIFY without explicit user approval:
- `src/app/page.tsx` (Home page)
- `src/app/messages/page.tsx` (Messages/Chat page)
- `src/app/profile/page.tsx` (Profile page)
- `src/app/menu/page.tsx` (Menu/Settings page)
- `src/app/upload/page.tsx` (Upload/New Listing page)
- `src/components/layout/MainLayout.tsx` (Shared layout)
- `src/components/ProductCard.tsx` (Product card component)
- `src/components/CategoryButton.tsx` (Category button component)
- `src/app/globals.css` (Global styles & CSS variables)
- `src/app/layout.tsx` (Root layout)
- `tailwind.config.ts` (Tailwind configuration)

### Rules:
1. **NEVER** change CSS classes, colors, spacing, fonts, or any visual styling in protected files
2. **NEVER** remove, reorder, or restructure HTML/JSX elements in protected files
3. **NEVER** change Tailwind config values (colors, fonts, plugins)
4. **NEVER** modify globals.css custom utility classes (.blue-gradient, .glass-nav, .btn-plus-shadow, .no-scrollbar, .bg-card)
5. When adding new features, create **NEW components/files** instead of editing protected files
6. If a feature MUST modify a protected file, **ASK the user first** and explain exactly what will change
7. Any PR that touches protected files must be flagged as "DESIGN CHANGE" in the title

### What IS allowed:
- Adding new pages in `src/app/` (e.g., `/upload`, `/product/[id]`, `/onboarding`)
- Adding new components in `src/components/`
- Adding new utility files in `src/lib/`
- Adding backend/API routes in `src/app/api/`
- Installing new packages
- Modifying `package.json` for dependencies

### Design Recovery:
If the design gets accidentally broken, restore with:
```
git checkout e980bd9 -- src/app/page.tsx src/app/messages/page.tsx src/app/profile/page.tsx src/app/menu/page.tsx src/components/layout/MainLayout.tsx src/components/ProductCard.tsx src/components/CategoryButton.tsx src/app/globals.css src/app/layout.tsx tailwind.config.ts
```

## Project Info
- **Stack:** Next.js 16 (App Router), Tailwind CSS, shadcn/ui, TypeScript
- **Theme:** Permanent dark mode (`bg-[#060E14]`)
- **Icons:** Font Awesome 6 Free (CDN)
- **Design Source:** `C:\Users\spaji\Desktop\copy-of-nudinadji1` (Vite+React prototype from AI Studio)
- **Languages:** Bosnian/Croatian/Serbian (primary), German, English

## Development Phases
1. **Phase 1 (COMPLETE):** UI Design - All 4 pages ported 1:1
2. **Phase 2 (NEXT):** Features - Filters, search, upload page, product detail
3. **Phase 3:** Backend - Supabase, auth, real data
