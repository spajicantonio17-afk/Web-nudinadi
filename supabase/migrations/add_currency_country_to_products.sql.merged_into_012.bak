-- ── Migration: Add currency + country to products ──────────────────
-- Run this in your Supabase SQL editor.
-- Each product now stores its native currency (no EUR conversion).

-- 1. Add currency column (default EUR for existing products)
ALTER TABLE products
  ADD COLUMN IF NOT EXISTS currency TEXT NOT NULL DEFAULT 'EUR'
  CHECK (currency IN ('EUR', 'BAM', 'RSD'));

-- 2. Add country column (nullable for legacy products)
ALTER TABLE products
  ADD COLUMN IF NOT EXISTS country TEXT
  CHECK (country IN ('ba', 'hr', 'rs', 'de', 'at'));

-- 3. Backfill country for existing products based on location string
--    (matches cities from the BiH and HR lists)
UPDATE products SET country = 'ba'
WHERE country IS NULL AND location IS NOT NULL
  AND lower(location) IN (
    'sarajevo','ilidža','vogošća','hadžići','ilijaš','trnovo',
    'bihać','cazin','velika kladuša','bosanska krupa','sanski most','ključ','bužim','bosanski petrovac',
    'tuzla','živinice','lukavac','gračanica','gradačac','srebrenik','banovići','kalesija','kladanj',
    'zenica','visoko','kakanj','tešanj','maglaj','žepče','zavidovići','breza','vareš','olovo',
    'travnik','bugojno','vitez','jajce','novi travnik','gornji vakuf-uskoplje','fojnica','kiseljak',
    'mostar','konjic','jablanica','čapljina','čitluk','stolac','neum','prozor-rama',
    'široki brijeg','grude','ljubuški','posušje',
    'orašje','odžak',
    'goražde',
    'livno','tomislavgrad','glamoč','kupres','drvar','bosansko grahovo',
    'banja luka','bijeljina','prijedor','doboj','trebinje','zvornik','gradiška','laktaši','prnjavor',
    'mrkonjić grad','derventa','modriča','kozarska dubica','novi grad','šamac','foča','višegrad',
    'rogatica','pale','sokolac','istočno sarajevo','vlasenica','srebrenica','bratunac','milići',
    'teslić','čelinac','kotor varoš','kneževo','nevesinje','gacko','bileća','ljubinje',
    'ugljevik','lopare','petrovo','kostajnica','brčko'
  );

UPDATE products SET country = 'hr'
WHERE country IS NULL AND location IS NOT NULL
  AND lower(location) IN (
    'zagreb','velika gorica','samobor','zaprešić',
    'split','kaštela','solin','sinj','makarska','omiš','imotski',
    'rijeka','opatija','osijek','đakovo','našice','zadar','slavonski brod',
    'pula','dubrovnik','metković','ploče','šibenik','knin','varaždin',
    'karlovac','sisak','čakovec','koprivnica','bjelovar','požega','virovitica',
    'vukovar','vinkovci','gospić'
  );

-- 4. Existing products with no matched location keep country = NULL
--    The app handles NULL gracefully (shows in all-markets view).
