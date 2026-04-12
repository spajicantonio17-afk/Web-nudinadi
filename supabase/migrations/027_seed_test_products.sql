-- ============================================================================
-- 027_seed_test_products.sql
-- Seed test/fake products for NudiNadi marketplace
-- Inserts 1 product per Level-2 subcategory (with extras for cars, iphones, apartments)
-- All titles/descriptions in Bosnian/Croatian
-- ============================================================================

-- ── Cleanup: Delete existing test products for idempotency ──────────────────
DELETE FROM products WHERE seller_id = '00000000-0000-0000-0000-000000000001';

-- ── Create test seller ──────────────────────────────────────────────────────
INSERT INTO auth.users (id, email, email_confirmed_at, created_at, updated_at, raw_app_meta_data, raw_user_meta_data)
VALUES (
  '00000000-0000-0000-0000-000000000001',
  'test-seller@nudinadi.ba',
  now(),
  now(),
  now(),
  '{"provider":"email","providers":["email"]}'::jsonb,
  '{"full_name":"Test Prodavač"}'::jsonb
)
ON CONFLICT (id) DO NOTHING;

INSERT INTO profiles (id, username, full_name, avatar_url, bio, location)
VALUES (
  '00000000-0000-0000-0000-000000000001',
  'test_prodavac',
  'Test Prodavač',
  'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?auto=format&fit=crop&q=80&w=200&h=200',
  'Test korisnički profil za seed podatke.',
  'Sarajevo'
)
ON CONFLICT (id) DO UPDATE SET username = EXCLUDED.username;

-- ============================================================================
-- 1. VOZILA
-- ============================================================================
DO $$
DECLARE
  seller UUID := '00000000-0000-0000-0000-000000000001';
  cat UUID;
BEGIN
  -- vozila-osobni-automobili (Product 1: BMW)
  SELECT id INTO cat FROM categories WHERE slug = 'vozila-osobni-automobili';
  IF cat IS NOT NULL THEN
    INSERT INTO products (seller_id, title, description, price, category_id, condition, images, status, location, views_count, favorites_count, attributes, tags)
    VALUES (seller, 'BMW 320d F30 2017 godište', 'Odlično očuvan BMW 320d, redovno servisiran, garažiran. Bez ulaganja.', 18500.00, cat, 'used',
      ARRAY['https://loremflickr.com/800/600/bmw,320d?lock=101'],
      'active', 'Sarajevo', 187, 12,
      '{"marka":"BMW","model":"320d","godiste":2017,"km":145000,"gorivo":"Dizel","mjenjac":"Automatik","karoserija":"Limuzina","boja":"Crna","snaga":190,"pogon":"Zadnji","kubikaza":1995,"registracija":"2025-06","klima":true,"autoKlima":true,"tempomat":true,"adaptivniTempomat":false,"parkSenzori":true,"kameraNazad":true,"kamera360":false,"navigacija":true,"bluetooth":true,"appleCarPlay":false,"androidAuto":false,"kozenaSjed":true,"grejanaSjed":true,"xenon":true,"matrixLed":false,"panoramskiKrov":false,"abs":true,"esp":true,"laneAssist":false,"autoKocenje":false,"servisnaKnjiga":true,"udareno":false,"registriran":true,"turbo":true,"aluFelge":true,"touchscreen":true,"digKokpit":false,"headUpDisplay":false,"bezKljucPokr":true,"startStop":true,"grijaniVolan":false,"elProzori":true,"elRetrovizori":true,"kukaPrivez":false,"isofix":true,"ocarinjen":true,"alarm":true,"centralnaBrava":true,"voznoStanje":true,"uKompletu":false}'::jsonb,
      ARRAY['bmw','320d','f30','dizel','limuzina','automatik']);
  END IF;

  -- vozila-osobni-automobili (Product 2: VW Golf)
  IF cat IS NOT NULL THEN
    INSERT INTO products (seller_id, title, description, price, category_id, condition, images, status, location, views_count, favorites_count, attributes, tags)
    VALUES (seller, 'VW Golf 7 1.6 TDI 2015', 'Golf 7 u odličnom stanju, mali potrošač, idealan za grad i cestu.', 13200.00, cat, 'used',
      ARRAY['https://loremflickr.com/800/600/volkswagen,golf?lock=102'],
      'active', 'Mostar', 134, 8,
      '{"marka":"Volkswagen","model":"Golf 7","godiste":2015,"km":178000,"gorivo":"Dizel","mjenjac":"Manual","karoserija":"Hatchback","boja":"Siva","snaga":110,"pogon":"Prednji","kubikaza":1598,"registracija":"2025-09","klima":true,"autoKlima":true,"tempomat":true,"adaptivniTempomat":false,"parkSenzori":true,"kameraNazad":false,"kamera360":false,"navigacija":false,"bluetooth":true,"appleCarPlay":false,"androidAuto":false,"kozenaSjed":false,"grejanaSjed":false,"xenon":false,"matrixLed":false,"panoramskiKrov":false,"abs":true,"esp":true,"laneAssist":false,"autoKocenje":false,"servisnaKnjiga":true,"udareno":false,"registriran":true,"turbo":true,"aluFelge":true,"touchscreen":false,"digKokpit":false,"headUpDisplay":false,"bezKljucPokr":false,"startStop":true,"grijaniVolan":false,"elProzori":true,"elRetrovizori":true,"kukaPrivez":false,"isofix":true,"ocarinjen":true,"alarm":false,"centralnaBrava":true,"voznoStanje":true,"uKompletu":false}'::jsonb,
      ARRAY['golf','vw','tdi','golf7','dizel','hatchback']);
  END IF;

  -- vozila-motocikli-i-skuteri
  SELECT id INTO cat FROM categories WHERE slug = 'vozila-motocikli-i-skuteri';
  IF cat IS NOT NULL THEN
    INSERT INTO products (seller_id, title, description, price, category_id, condition, images, status, location, views_count, favorites_count, attributes, tags)
    VALUES (seller, 'Yamaha MT-07 2020', 'Yamaha MT-07 u izvrsnom stanju, redovno servisirana. Idealan naked bike.', 6800.00, cat, 'used',
      ARRAY['https://loremflickr.com/800/600/yamaha,motorcycle,naked?lock=103'],
      'active', 'Tuzla', 89, 6,
      '{"marka":"Yamaha","model":"MT-07","godiste":2020,"km":12000,"kubikaza":689,"tip":"Naked","snaga":75,"boja":"Plava"}'::jsonb,
      ARRAY['yamaha','mt07','naked','motocikl','689cc']);
  END IF;

  -- vozila-teretna-vozila
  SELECT id INTO cat FROM categories WHERE slug = 'vozila-teretna-vozila';
  IF cat IS NOT NULL THEN
    INSERT INTO products (seller_id, title, description, price, category_id, condition, images, status, location, views_count, favorites_count, attributes, tags)
    VALUES (seller, 'Mercedes Actros 1845 2018', 'Mercedes Actros sa punom opremom, redovno servisiran u ovlaštenom servisu.', 45000.00, cat, 'used',
      ARRAY['https://loremflickr.com/800/600/mercedes,actros,truck?lock=104'],
      'active', 'Banja Luka', 56, 4,
      '{"marka":"Mercedes-Benz","model":"Actros 1845","godiste":2018,"km":520000,"nosivost":18000,"gorivo":"Dizel","mjenjac":"Automatik","tip":"Tegljač"}'::jsonb,
      ARRAY['mercedes','actros','tegljac','kamion','teretno']);
  END IF;

  -- vozila-autobusi-i-minibusi
  SELECT id INTO cat FROM categories WHERE slug = 'vozila-autobusi-i-minibusi';
  IF cat IS NOT NULL THEN
    INSERT INTO products (seller_id, title, description, price, category_id, condition, images, status, location, views_count, favorites_count, attributes, tags)
    VALUES (seller, 'Mercedes Sprinter 519 CDI Minibus 2019', 'Sprinter minibus sa 19 sjedišta, klima, idealan za prijevoz putnika.', 38000.00, cat, 'used',
      ARRAY['https://loremflickr.com/800/600/mercedes,sprinter,minibus?lock=105'],
      'active', 'Zenica', 42, 2,
      '{"marka":"Mercedes-Benz","godiste":2019,"km":185000,"brojMjesta":19,"gorivo":"Dizel","tip":"Minibus"}'::jsonb,
      ARRAY['sprinter','minibus','mercedes','prijevoz','putnici']);
  END IF;

  -- vozila-bicikli
  SELECT id INTO cat FROM categories WHERE slug = 'vozila-bicikli';
  IF cat IS NOT NULL THEN
    INSERT INTO products (seller_id, title, description, price, category_id, condition, images, status, location, views_count, favorites_count, attributes, tags)
    VALUES (seller, 'Specialized Rockhopper MTB 29"', 'Mountain bike Specialized Rockhopper, veličina okvira L, odlično stanje.', 450.00, cat, 'like_new',
      ARRAY['https://loremflickr.com/800/600/specialized,mountain,bike?lock=106'],
      'active', 'Zagreb', 67, 5,
      '{"marka":"Specialized","tip":"Mountain bike","velicinaOkvira":"L","materijal":"Aluminij"}'::jsonb,
      ARRAY['specialized','mtb','bicikl','mountain','29er']);
  END IF;

  -- vozila-kamperi
  SELECT id INTO cat FROM categories WHERE slug = 'vozila-kamperi';
  IF cat IS NOT NULL THEN
    INSERT INTO products (seller_id, title, description, price, category_id, condition, images, status, location, views_count, favorites_count, attributes, tags)
    VALUES (seller, 'Fiat Ducato Kamper 2016', 'Potpuno opremljen kamper na bazi Fiat Ducato, kuhinja, kupaonica, spavanje za 4 osobe.', 32000.00, cat, 'used',
      ARRAY['https://loremflickr.com/800/600/campervan,fiat,ducato?lock=107'],
      'active', 'Split', 78, 9,
      '{"marka":"Fiat","godiste":2016,"km":95000,"duzina":7.2,"brojLezajeva":4,"tip":"Kamper van"}'::jsonb,
      ARRAY['kamper','fiat','ducato','kampovanje','putovanje']);
  END IF;

  -- vozila-prikolice
  SELECT id INTO cat FROM categories WHERE slug = 'vozila-prikolice';
  IF cat IS NOT NULL THEN
    INSERT INTO products (seller_id, title, description, price, category_id, condition, images, status, location, views_count, favorites_count, attributes, tags)
    VALUES (seller, 'Auto prikolica 750kg nosivosti', 'Jednoosovisnka prikolica sa ceradom, idealna za transport. Registrovana.', 800.00, cat, 'used',
      ARRAY['https://loremflickr.com/800/600/car,trailer?lock=108'],
      'active', 'Travnik', 34, 1,
      '{"tipPrikolice":"Teretna","nosivost":750,"duzina":2.5}'::jsonb,
      ARRAY['prikolica','teretna','750kg','transport']);
  END IF;

  -- vozila-nautika
  SELECT id INTO cat FROM categories WHERE slug = 'vozila-nautika';
  IF cat IS NOT NULL THEN
    INSERT INTO products (seller_id, title, description, price, category_id, condition, images, status, location, views_count, favorites_count, attributes, tags)
    VALUES (seller, 'Gumeni čamac Zodiac 4.2m sa motorom', 'Zodiac gumeni čamac sa Yamaha 40KS vanbrodskim motorom. Komplet sa prikolicom.', 5500.00, cat, 'used',
      ARRAY['https://loremflickr.com/800/600/zodiac,inflatable,boat?lock=109'],
      'active', 'Split', 45, 3,
      '{"tip":"Gumeni čamac","duzina":4.2,"snagaMotora":40,"godiste":2018,"gorivo":"Benzin"}'::jsonb,
      ARRAY['camac','zodiac','yamaha','nautika','more']);
  END IF;

  -- vozila-atv-quad-utv
  SELECT id INTO cat FROM categories WHERE slug = 'vozila-atv-quad-utv';
  IF cat IS NOT NULL THEN
    INSERT INTO products (seller_id, title, description, price, category_id, condition, images, status, location, views_count, favorites_count, attributes, tags)
    VALUES (seller, 'Can-Am Outlander 650 XT 2021', 'Can-Am quad u odličnom stanju, malo korišten, sa vitlom i zaštitom.', 9500.00, cat, 'like_new',
      ARRAY['https://loremflickr.com/800/600/can-am,atv,quad?lock=110'],
      'active', 'Bihać', 53, 7,
      '{"marka":"Can-Am","godiste":2021,"km":3200,"kubikaza":650,"snaga":62}'::jsonb,
      ARRAY['canam','quad','atv','outlander','offroad']);
  END IF;

  -- vozila-ostala-vozila
  SELECT id INTO cat FROM categories WHERE slug = 'vozila-ostala-vozila';
  IF cat IS NOT NULL THEN
    INSERT INTO products (seller_id, title, description, price, category_id, condition, images, status, location, views_count, favorites_count, attributes, tags)
    VALUES (seller, 'Električni trotinet Xiaomi Pro 2', 'Xiaomi električni trotinet, domet do 45km, max brzina 25km/h.', 350.00, cat, 'like_new',
      ARRAY['https://loremflickr.com/800/600/xiaomi,electric,scooter?lock=111'],
      'active', 'Bijeljina', 91, 4,
      '{"marka":"Xiaomi","godiste":2023}'::jsonb,
      ARRAY['trotinet','xiaomi','elektricni','eskuter']);
  END IF;
END $$;

-- ============================================================================
-- 2. DIJELOVI
-- ============================================================================
DO $$
DECLARE
  seller UUID := '00000000-0000-0000-0000-000000000001';
  cat UUID;
BEGIN
  -- dij-auto-motor
  SELECT id INTO cat FROM categories WHERE slug = 'dij-auto-motor';
  IF cat IS NOT NULL THEN
    INSERT INTO products (seller_id, title, description, price, category_id, condition, images, status, location, views_count, favorites_count, attributes, tags)
    VALUES (seller, 'Turbina za VW Golf 7 1.6 TDI', 'Originalna turbina u ispravnom stanju, skinuta sa auta sa 120.000km.', 280.00, cat, 'used',
      ARRAY['https://images.unsplash.com/photo-1486262715619-67b85e0b08d3?w=800&h=600&fit=crop'],
      'active', 'Sarajevo', 67, 3,
      '{"markaVozila":"Volkswagen","model":"Golf 7","godisteVozila":2015}'::jsonb,
      ARRAY['turbina','golf7','tdi','motor','vw']);
  END IF;

  -- dij-auto-elektrika
  SELECT id INTO cat FROM categories WHERE slug = 'dij-auto-elektrika';
  IF cat IS NOT NULL THEN
    INSERT INTO products (seller_id, title, description, price, category_id, condition, images, status, location, views_count, favorites_count, attributes, tags)
    VALUES (seller, 'Alternator za BMW E90 320d', 'Ispravni alternator, skinut sa auta koje ide u otpad. Testiran.', 120.00, cat, 'used',
      ARRAY['https://images.unsplash.com/photo-1486262715619-67b85e0b08d3?w=800&h=600&fit=crop'],
      'active', 'Mostar', 45, 2,
      '{"markaVozila":"BMW","model":"E90 320d","godisteVozila":2010}'::jsonb,
      ARRAY['alternator','bmw','e90','elektrika','320d']);
  END IF;

  -- dij-auto-karoserija
  SELECT id INTO cat FROM categories WHERE slug = 'dij-auto-karoserija';
  IF cat IS NOT NULL THEN
    INSERT INTO products (seller_id, title, description, price, category_id, condition, images, status, location, views_count, favorites_count, attributes, tags)
    VALUES (seller, 'Prednji branik za Audi A4 B8', 'Prednji branik u crnoj boji, bez oštećenja. Odgovara modele 2008-2012.', 150.00, cat, 'used',
      ARRAY['https://images.unsplash.com/photo-1486262715619-67b85e0b08d3?w=800&h=600&fit=crop'],
      'active', 'Tuzla', 38, 1,
      '{"markaVozila":"Audi","model":"A4 B8","godisteVozila":2010,"boja":"Crna"}'::jsonb,
      ARRAY['branik','audi','a4','b8','karoserija']);
  END IF;

  -- dij-auto-unutrasnjost
  SELECT id INTO cat FROM categories WHERE slug = 'dij-auto-unutrasnjost';
  IF cat IS NOT NULL THEN
    INSERT INTO products (seller_id, title, description, price, category_id, condition, images, status, location, views_count, favorites_count, attributes, tags)
    VALUES (seller, 'Kožna sjedišta za Mercedes C klasa W204', 'Komplet kožnih sjedišta u crnoj boji, grijana. Bez oštećenja.', 600.00, cat, 'used',
      ARRAY['https://images.unsplash.com/photo-1486262715619-67b85e0b08d3?w=800&h=600&fit=crop'],
      'active', 'Banja Luka', 52, 4,
      '{"markaVozila":"Mercedes-Benz","model":"C klasa W204","godisteVozila":2012,"boja":"Crna"}'::jsonb,
      ARRAY['sjedista','mercedes','kozna','w204','unutrasnjost']);
  END IF;

  -- dij-auto-ovjes
  SELECT id INTO cat FROM categories WHERE slug = 'dij-auto-ovjes';
  IF cat IS NOT NULL THEN
    INSERT INTO products (seller_id, title, description, price, category_id, condition, images, status, location, views_count, favorites_count, attributes, tags)
    VALUES (seller, 'Amortizeri prednji za Opel Astra J', 'Par prednjih amortizera, novi, u originalnom pakovanju.', 95.00, cat, 'new',
      ARRAY['https://images.unsplash.com/photo-1486262715619-67b85e0b08d3?w=800&h=600&fit=crop'],
      'active', 'Zenica', 29, 2,
      '{"markaVozila":"Opel","model":"Astra J","godisteVozila":2014}'::jsonb,
      ARRAY['amortizeri','opel','astra','ovjes','prednji']);
  END IF;

  -- dij-auto-felge
  SELECT id INTO cat FROM categories WHERE slug = 'dij-auto-felge';
  IF cat IS NOT NULL THEN
    INSERT INTO products (seller_id, title, description, price, category_id, condition, images, status, location, views_count, favorites_count, attributes, tags)
    VALUES (seller, 'Zimske gume Michelin 205/55 R16', 'Set od 4 zimske gume, profil 6mm, jedna sezona korištene.', 200.00, cat, 'used',
      ARRAY['https://images.unsplash.com/photo-1578844251758-2f71da645217?w=800&h=600&fit=crop'],
      'active', 'Zagreb', 73, 5,
      '{"markaVozila":"Univerzalno","dimenzija":"205/55 R16","sezona":"Zimska","promjerFelge":16}'::jsonb,
      ARRAY['gume','zimske','michelin','r16','205/55']);
  END IF;

  -- dij-auto-tuning
  SELECT id INTO cat FROM categories WHERE slug = 'dij-auto-tuning';
  IF cat IS NOT NULL THEN
    INSERT INTO products (seller_id, title, description, price, category_id, condition, images, status, location, views_count, favorites_count, attributes, tags)
    VALUES (seller, 'Sportski auspuh za Golf 5 GTI', 'Dupli sportski auspuh od nehrđajućeg čelika. Brutalan zvuk.', 180.00, cat, 'like_new',
      ARRAY['https://images.unsplash.com/photo-1486262715619-67b85e0b08d3?w=800&h=600&fit=crop'],
      'active', 'Split', 61, 7,
      '{"markaVozila":"Volkswagen","model":"Golf 5 GTI","godisteVozila":2008}'::jsonb,
      ARRAY['auspuh','tuning','golf','gti','sportski']);
  END IF;

  -- dij-auto-akustika
  SELECT id INTO cat FROM categories WHERE slug = 'dij-auto-akustika';
  IF cat IS NOT NULL THEN
    INSERT INTO products (seller_id, title, description, price, category_id, condition, images, status, location, views_count, favorites_count, attributes, tags)
    VALUES (seller, 'Pioneer auto radio sa Bluetooth', 'Pioneer DEH-S420BT, Bluetooth, USB, AUX. Odlično stanje.', 75.00, cat, 'used',
      ARRAY['https://images.unsplash.com/photo-1486262715619-67b85e0b08d3?w=800&h=600&fit=crop'],
      'active', 'Travnik', 33, 2,
      '{"markaVozila":"Univerzalno","model":"Univerzalno","godisteVozila":2020}'::jsonb,
      ARRAY['radio','pioneer','bluetooth','akustika','auto']);
  END IF;

  -- dij-auto-ulja
  SELECT id INTO cat FROM categories WHERE slug = 'dij-auto-ulja';
  IF cat IS NOT NULL THEN
    INSERT INTO products (seller_id, title, description, price, category_id, condition, images, status, location, views_count, favorites_count, attributes, tags)
    VALUES (seller, 'Castrol EDGE 5W-30 5L', 'Potpuno sintetičko motorno ulje, novo, zapakovano. Rok trajanja 2027.', 45.00, cat, 'new',
      ARRAY['https://images.unsplash.com/photo-1486262715619-67b85e0b08d3?w=800&h=600&fit=crop'],
      'active', 'Bihać', 88, 3,
      '{"markaVozila":"Univerzalno","model":"Univerzalno","godisteVozila":2024}'::jsonb,
      ARRAY['ulje','castrol','5w30','motorno','sinteticko']);
  END IF;

  -- dij-moto-motor
  SELECT id INTO cat FROM categories WHERE slug = 'dij-moto-motor';
  IF cat IS NOT NULL THEN
    INSERT INTO products (seller_id, title, description, price, category_id, condition, images, status, location, views_count, favorites_count, attributes, tags)
    VALUES (seller, 'Karburator za Honda CBR 600', 'Originalni karburator, radi ispravno. Skinut sa motora sa 35.000km.', 150.00, cat, 'used',
      ARRAY['https://images.unsplash.com/photo-1558981806-ec527fa84c39?w=800&h=600&fit=crop'],
      'active', 'Bijeljina', 27, 1,
      '{"markaMotocikla":"Honda","model":"CBR 600"}'::jsonb,
      ARRAY['karburator','honda','cbr600','moto','motor']);
  END IF;

  -- dij-moto-karoserija
  SELECT id INTO cat FROM categories WHERE slug = 'dij-moto-karoserija';
  IF cat IS NOT NULL THEN
    INSERT INTO products (seller_id, title, description, price, category_id, condition, images, status, location, views_count, favorites_count, attributes, tags)
    VALUES (seller, 'Bočne obloge za Kawasaki Z750', 'Set bočnih plastika u zelenoj boji. Bez pukotina.', 90.00, cat, 'used',
      ARRAY['https://images.unsplash.com/photo-1558981806-ec527fa84c39?w=800&h=600&fit=crop'],
      'active', 'Sarajevo', 19, 0,
      '{"markaMotocikla":"Kawasaki","model":"Z750"}'::jsonb,
      ARRAY['obloge','kawasaki','z750','plastike','karoserija']);
  END IF;

  -- dij-moto-elektrika
  SELECT id INTO cat FROM categories WHERE slug = 'dij-moto-elektrika';
  IF cat IS NOT NULL THEN
    INSERT INTO products (seller_id, title, description, price, category_id, condition, images, status, location, views_count, favorites_count, attributes, tags)
    VALUES (seller, 'CDI modul za Suzuki GSX-R 600', 'Originalni CDI, ispravan. Testiran prije skidanja.', 70.00, cat, 'used',
      ARRAY['https://images.unsplash.com/photo-1558981806-ec527fa84c39?w=800&h=600&fit=crop'],
      'active', 'Mostar', 15, 0,
      '{"markaMotocikla":"Suzuki","model":"GSX-R 600"}'::jsonb,
      ARRAY['cdi','suzuki','gsxr','elektrika','moto']);
  END IF;

  -- dij-moto-ovjes
  SELECT id INTO cat FROM categories WHERE slug = 'dij-moto-ovjes';
  IF cat IS NOT NULL THEN
    INSERT INTO products (seller_id, title, description, price, category_id, condition, images, status, location, views_count, favorites_count, attributes, tags)
    VALUES (seller, 'Zadnji amortizer za Yamaha R6', 'Originalni amortizer u dobrom stanju. Nema curenja ulja.', 85.00, cat, 'used',
      ARRAY['https://images.unsplash.com/photo-1558981806-ec527fa84c39?w=800&h=600&fit=crop'],
      'active', 'Tuzla', 22, 1,
      '{"markaMotocikla":"Yamaha","model":"R6"}'::jsonb,
      ARRAY['amortizer','yamaha','r6','ovjes','zadnji']);
  END IF;

  -- dij-moto-felge
  SELECT id INTO cat FROM categories WHERE slug = 'dij-moto-felge';
  IF cat IS NOT NULL THEN
    INSERT INTO products (seller_id, title, description, price, category_id, condition, images, status, location, views_count, favorites_count, attributes, tags)
    VALUES (seller, 'Moto guma Pirelli Diablo Rosso 180/55 ZR17', 'Nova guma, nikad montirana. Ljetna sezona.', 110.00, cat, 'new',
      ARRAY['https://images.unsplash.com/photo-1578844251758-2f71da645217?w=800&h=600&fit=crop'],
      'active', 'Banja Luka', 41, 3,
      '{"dimenzija":"180/55 ZR17","sezona":"Ljetna"}'::jsonb,
      ARRAY['guma','pirelli','moto','180/55','zr17']);
  END IF;

  -- dij-moto-oprema
  SELECT id INTO cat FROM categories WHERE slug = 'dij-moto-oprema';
  IF cat IS NOT NULL THEN
    INSERT INTO products (seller_id, title, description, price, category_id, condition, images, status, location, views_count, favorites_count, attributes, tags)
    VALUES (seller, 'Moto kaciga Shoei NXR2 vel. L', 'Premium kaciga, korištena jednu sezonu. Bez padova.', 280.00, cat, 'like_new',
      ARRAY['https://images.unsplash.com/photo-1558981806-ec527fa84c39?w=800&h=600&fit=crop'],
      'active', 'Zenica', 55, 6,
      '{"velicina":"L"}'::jsonb,
      ARRAY['kaciga','shoei','moto','nxr2','oprema']);
  END IF;

  -- dij-moto-kofera
  SELECT id INTO cat FROM categories WHERE slug = 'dij-moto-kofera';
  IF cat IS NOT NULL THEN
    INSERT INTO products (seller_id, title, description, price, category_id, condition, images, status, location, views_count, favorites_count, attributes, tags)
    VALUES (seller, 'Givi top case 47L sa nosačem', 'Givi kofer za motocikl, 47 litara, sa montažnim nosačem. Malo korišten.', 120.00, cat, 'like_new',
      ARRAY['https://images.unsplash.com/photo-1558981806-ec527fa84c39?w=800&h=600&fit=crop'],
      'active', 'Zagreb', 30, 2,
      '{"markaMotocikla":"Univerzalno","model":"Univerzalno"}'::jsonb,
      ARRAY['kofer','givi','top-case','moto','47l']);
  END IF;

  -- dij-bic-dijelovi
  SELECT id INTO cat FROM categories WHERE slug = 'dij-bic-dijelovi';
  IF cat IS NOT NULL THEN
    INSERT INTO products (seller_id, title, description, price, category_id, condition, images, status, location, views_count, favorites_count, attributes, tags)
    VALUES (seller, 'Shimano Deore XT mjenjač zadnji', 'Shimano XT RD-M8100, 12 brzina, novo u kutiji.', 85.00, cat, 'new',
      ARRAY['https://images.unsplash.com/photo-1485965120184-e220f721d03e?w=800&h=600&fit=crop'],
      'active', 'Split', 44, 5,
      '{}'::jsonb,
      ARRAY['shimano','xt','mjenjac','bicikl','deore']);
  END IF;

  -- dij-teretna
  SELECT id INTO cat FROM categories WHERE slug = 'dij-teretna';
  IF cat IS NOT NULL THEN
    INSERT INTO products (seller_id, title, description, price, category_id, condition, images, status, location, views_count, favorites_count, attributes, tags)
    VALUES (seller, 'Kočione obloge za MAN TGA', 'Set kočionih obloga za prednju osovinu. Novi, u kutiji.', 95.00, cat, 'new',
      ARRAY['https://images.unsplash.com/photo-1486262715619-67b85e0b08d3?w=800&h=600&fit=crop'],
      'active', 'Travnik', 18, 0,
      '{"markaVozila":"MAN","model":"TGA","godisteVozila":2012}'::jsonb,
      ARRAY['kocione','obloge','man','tga','teretna']);
  END IF;

  -- dij-autobusi
  SELECT id INTO cat FROM categories WHERE slug = 'dij-autobusi';
  IF cat IS NOT NULL THEN
    INSERT INTO products (seller_id, title, description, price, category_id, condition, images, status, location, views_count, favorites_count, attributes, tags)
    VALUES (seller, 'Sjedišta za autobus Setra', 'Komplet od 10 sjedišta za turistički autobus. Tkanina, bez oštećenja.', 500.00, cat, 'used',
      ARRAY['https://images.unsplash.com/photo-1570125909232-eb263c188f7e?w=800&h=600&fit=crop'],
      'active', 'Bihać', 12, 0,
      '{"markaVozila":"Setra","model":"S415","godisteVozila":2010}'::jsonb,
      ARRAY['sjedista','autobus','setra','turisticki']);
  END IF;

  -- dij-nautika
  SELECT id INTO cat FROM categories WHERE slug = 'dij-nautika';
  IF cat IS NOT NULL THEN
    INSERT INTO products (seller_id, title, description, price, category_id, condition, images, status, location, views_count, favorites_count, attributes, tags)
    VALUES (seller, 'Propeler za vanbrodski motor Yamaha', 'Aluminijski propeler 13x17, za Yamaha 60-90KS. Kao nov.', 95.00, cat, 'like_new',
      ARRAY['https://images.unsplash.com/photo-1544551763-46a013bb70d5?w=800&h=600&fit=crop'],
      'active', 'Bijeljina', 16, 1,
      '{"markaVozila":"Yamaha","model":"60-90KS"}'::jsonb,
      ARRAY['propeler','yamaha','nautika','vanbrodski','motor']);
  END IF;

  -- dij-kamperi
  SELECT id INTO cat FROM categories WHERE slug = 'dij-kamperi';
  IF cat IS NOT NULL THEN
    INSERT INTO products (seller_id, title, description, price, category_id, condition, images, status, location, views_count, favorites_count, attributes, tags)
    VALUES (seller, 'Markiza za kamper Thule 3.5m', 'Thule Omnistor markiza, 3.5m, sa montažnim priborom. Korištena 2 sezone.', 350.00, cat, 'used',
      ARRAY['https://images.unsplash.com/photo-1523987355523-c7b5b0dd90a7?w=800&h=600&fit=crop'],
      'active', 'Sarajevo', 25, 2,
      '{"markaVozila":"Univerzalno","model":"Univerzalno"}'::jsonb,
      ARRAY['markiza','thule','kamper','oprema','3.5m']);
  END IF;

  -- dij-atv
  SELECT id INTO cat FROM categories WHERE slug = 'dij-atv';
  IF cat IS NOT NULL THEN
    INSERT INTO products (seller_id, title, description, price, category_id, condition, images, status, location, views_count, favorites_count, attributes, tags)
    VALUES (seller, 'Vitlo za ATV 3000lbs', 'Električno vitlo sa žičanim užetom, 3000lbs kapacitet. Novo.', 130.00, cat, 'new',
      ARRAY['https://images.unsplash.com/photo-1568772585407-9361f9bf3a87?w=800&h=600&fit=crop'],
      'active', 'Mostar', 21, 1,
      '{"markaVozila":"Univerzalno","model":"Univerzalno"}'::jsonb,
      ARRAY['vitlo','atv','quad','3000lbs','elektricno']);
  END IF;

  -- dij-gradev-strojevi
  SELECT id INTO cat FROM categories WHERE slug = 'dij-gradev-strojevi';
  IF cat IS NOT NULL THEN
    INSERT INTO products (seller_id, title, description, price, category_id, condition, images, status, location, views_count, favorites_count, attributes, tags)
    VALUES (seller, 'Hidraulična pumpa za mini bager', 'Hidraulična pumpa za Kubota mini bager KX61-3. Ispravna.', 450.00, cat, 'used',
      ARRAY['https://images.unsplash.com/photo-1581578731548-c64695cc6952?w=800&h=600&fit=crop'],
      'active', 'Tuzla', 14, 0,
      '{"markaVozila":"Kubota","model":"KX61-3"}'::jsonb,
      ARRAY['pumpa','hidraulicna','bager','kubota','gradevinski']);
  END IF;

  -- dij-prikolice
  SELECT id INTO cat FROM categories WHERE slug = 'dij-prikolice';
  IF cat IS NOT NULL THEN
    INSERT INTO products (seller_id, title, description, price, category_id, condition, images, status, location, views_count, favorites_count, attributes, tags)
    VALUES (seller, 'Spojka za prikolicu 50mm', 'Nova kuglasta spojka za prikolicu. Univerzalna.', 25.00, cat, 'new',
      ARRAY['https://images.unsplash.com/photo-1486262715619-67b85e0b08d3?w=800&h=600&fit=crop'],
      'active', 'Banja Luka', 42, 1,
      '{}'::jsonb,
      ARRAY['spojka','prikolica','kugla','50mm']);
  END IF;

  -- dij-ostalo
  SELECT id INTO cat FROM categories WHERE slug = 'dij-ostalo';
  IF cat IS NOT NULL THEN
    INSERT INTO products (seller_id, title, description, price, category_id, condition, images, status, location, views_count, favorites_count, attributes, tags)
    VALUES (seller, 'OBD2 dijagnostički uređaj', 'Bluetooth OBD2 skener, radi sa Android i iOS aplikacijama. Nov.', 20.00, cat, 'new',
      ARRAY['https://images.unsplash.com/photo-1486262715619-67b85e0b08d3?w=800&h=600&fit=crop'],
      'active', 'Zenica', 96, 8,
      '{}'::jsonb,
      ARRAY['obd2','dijagnostika','skener','bluetooth','auto']);
  END IF;
END $$;

-- ============================================================================
-- 3. NEKRETNINE
-- ============================================================================
DO $$
DECLARE
  seller UUID := '00000000-0000-0000-0000-000000000001';
  cat UUID;
BEGIN
  -- nekr-stanovi (Product 1: Prodaja)
  SELECT id INTO cat FROM categories WHERE slug = 'nekr-stanovi';
  IF cat IS NOT NULL THEN
    INSERT INTO products (seller_id, title, description, price, category_id, condition, images, status, location, views_count, favorites_count, attributes, tags)
    VALUES (seller, 'Trosoban stan 72m² Centar Sarajevo', 'Renoviran trosoban stan u strogom centru, 3. sprat, lift, balkon. Useljiv odmah.', 185000.00, cat, 'like_new',
      ARRAY['https://images.unsplash.com/photo-1522708323590-d24dbb6b0267?w=800&h=600&fit=crop'],
      'active', 'Sarajevo', 198, 18,
      '{"povrsina":72,"brojSoba":3,"brojKupatila":1,"kat":3,"grijanje":"Centralno","namjestenost":"Nenamješteno","parking":"Ulično","energetskirazred":"C","lift":true,"balkon":true,"klimatizovano":false,"internet":true,"podrum":true,"alarm":false,"blindiranaVrata":true,"videoNadzor":false,"uknjizeno":true}'::jsonb,
      ARRAY['stan','trosoban','centar','sarajevo','prodaja','renoviran']);
  END IF;

  -- nekr-stanovi (Product 2: Najam)
  IF cat IS NOT NULL THEN
    INSERT INTO products (seller_id, title, description, price, category_id, condition, images, status, location, views_count, favorites_count, attributes, tags)
    VALUES (seller, 'Dvosoban stan za najam Mostar 55m²', 'Namješten dvosoban stan na Bulevaru. Klima, internet, parking. Cijena mjesečno.', 400.00, cat, 'used',
      ARRAY['https://images.unsplash.com/photo-1522708323590-d24dbb6b0267?w=800&h=600&fit=crop'],
      'active', 'Mostar', 156, 11,
      '{"povrsina":55,"brojSoba":2,"brojKupatila":1,"kat":1,"grijanje":"Klima","namjestenost":"Namješteno","parking":"Vlastito","energetskirazred":"D","lift":false,"balkon":true,"klimatizovano":true,"internet":true,"podrum":false,"alarm":false,"blindiranaVrata":false,"videoNadzor":false,"uknjizeno":true}'::jsonb,
      ARRAY['stan','dvosoban','najam','mostar','namjesten']);
  END IF;

  -- nekr-kuce
  SELECT id INTO cat FROM categories WHERE slug = 'nekr-kuce';
  IF cat IS NOT NULL THEN
    INSERT INTO products (seller_id, title, description, price, category_id, condition, images, status, location, views_count, favorites_count, attributes, tags)
    VALUES (seller, 'Kuća sa dvorištem 180m² Ilidža', 'Porodična kuća na dva sprata, garaža, veliko dvorište, mirna lokacija.', 250000.00, cat, 'used',
      ARRAY['https://images.unsplash.com/photo-1564013799919-ab600027ffc6?w=800&h=600&fit=crop'],
      'active', 'Sarajevo', 145, 14,
      '{"povrsina":180,"povrsinaZemljista":500,"brojSoba":5,"brojKupatila":2,"brojEtaza":2,"grijanje":"Plin","parking":"Garaža","energetskirazred":"D","garaza":true,"dvoriste":true,"bazen":false,"klimatizovano":false,"uknjizeno":true}'::jsonb,
      ARRAY['kuca','ilidza','dvoriste','garaza','porodicna']);
  END IF;

  -- nekr-zemljista
  SELECT id INTO cat FROM categories WHERE slug = 'nekr-zemljista';
  IF cat IS NOT NULL THEN
    INSERT INTO products (seller_id, title, description, price, category_id, condition, images, status, location, views_count, favorites_count, attributes, tags)
    VALUES (seller, 'Građevinsko zemljište 800m² Rajlovac', 'Ravno građevinsko zemljište sa svim priključcima. Pristupni put asfaltirani.', 65000.00, cat, 'new',
      ARRAY['https://images.unsplash.com/photo-1500382017468-9049fed747ef?w=800&h=600&fit=crop'],
      'active', 'Sarajevo', 87, 6,
      '{"povrsina":800,"namjena":"Građevinsko","pristupniPut":"Asfaltirani","uknjizeno":true,"komunalije":true}'::jsonb,
      ARRAY['zemljiste','gradevinsko','rajlovac','parcela']);
  END IF;

  -- nekr-poslovni
  SELECT id INTO cat FROM categories WHERE slug = 'nekr-poslovni';
  IF cat IS NOT NULL THEN
    INSERT INTO products (seller_id, title, description, price, category_id, condition, images, status, location, views_count, favorites_count, attributes, tags)
    VALUES (seller, 'Poslovni prostor 120m² Ferhadija', 'Poslovni prostor u prizemlju, pogodan za kancelariju ili trgovinu. Frekventna lokacija.', 320000.00, cat, 'used',
      ARRAY['https://images.unsplash.com/photo-1497366216548-37526070297c?w=800&h=600&fit=crop'],
      'active', 'Sarajevo', 112, 9,
      '{"povrsina":120,"kat":0,"namjena":"Kancelarija","parking":"Ulično","lift":false,"klimatizovano":true,"uknjizeno":true}'::jsonb,
      ARRAY['poslovni','prostor','ferhadija','kancelarija','centar']);
  END IF;

  -- nekr-garaze
  SELECT id INTO cat FROM categories WHERE slug = 'nekr-garaze';
  IF cat IS NOT NULL THEN
    INSERT INTO products (seller_id, title, description, price, category_id, condition, images, status, location, views_count, favorites_count, attributes, tags)
    VALUES (seller, 'Garaža u zgradi Čengić Vila', 'Garažno mjesto u podzemnoj garaži, 15m². Video nadzor, rampa.', 18000.00, cat, 'used',
      ARRAY['https://images.unsplash.com/photo-1497366216548-37526070297c?w=800&h=600&fit=crop'],
      'active', 'Sarajevo', 43, 3,
      '{"povrsina":15,"tip":"Podzemna"}'::jsonb,
      ARRAY['garaza','parking','cengic-vila','podzemna']);
  END IF;

  -- nekr-turisticki
  SELECT id INTO cat FROM categories WHERE slug = 'nekr-turisticki';
  IF cat IS NOT NULL THEN
    INSERT INTO products (seller_id, title, description, price, category_id, condition, images, status, location, views_count, favorites_count, attributes, tags)
    VALUES (seller, 'Apartman na Jahorini 45m²', 'Apartman u ski resortu, potpuno namješten, 2 spavaće sobe, pogled na stazu.', 95000.00, cat, 'like_new',
      ARRAY['https://images.unsplash.com/photo-1522708323590-d24dbb6b0267?w=800&h=600&fit=crop'],
      'active', 'Sarajevo', 167, 15,
      '{"povrsina":45,"brojSoba":2,"brojLezajeva":6,"namjestenost":"Namješteno","klimatizovano":true,"wifi":true,"parking":true,"balkon":true}'::jsonb,
      ARRAY['apartman','jahorina','ski','turisticki','smjestaj']);
  END IF;

  -- nekr-luksuzne
  SELECT id INTO cat FROM categories WHERE slug = 'nekr-luksuzne';
  IF cat IS NOT NULL THEN
    INSERT INTO products (seller_id, title, description, price, category_id, condition, images, status, location, views_count, favorites_count, attributes, tags)
    VALUES (seller, 'Luksuzna vila sa bazenom Neum', 'Vila od 350m² sa pogledom na more, privatni bazen, garaža za 3 auta.', 680000.00, cat, 'like_new',
      ARRAY['https://images.unsplash.com/photo-1564013799919-ab600027ffc6?w=800&h=600&fit=crop'],
      'active', 'Mostar', 199, 20,
      '{"povrsina":350}'::jsonb,
      ARRAY['vila','luksuzna','neum','bazen','more','pogled']);
  END IF;

  -- nekr-ostale
  SELECT id INTO cat FROM categories WHERE slug = 'nekr-ostale';
  IF cat IS NOT NULL THEN
    INSERT INTO products (seller_id, title, description, price, category_id, condition, images, status, location, views_count, favorites_count, attributes, tags)
    VALUES (seller, 'Vikendica sa okućnicom Vlašić', 'Drvena vikendica od 60m² sa 2000m² okućnice. Idealna za odmor u prirodi.', 45000.00, cat, 'used',
      ARRAY['https://images.unsplash.com/photo-1564013799919-ab600027ffc6?w=800&h=600&fit=crop'],
      'active', 'Travnik', 76, 8,
      '{"povrsina":60}'::jsonb,
      ARRAY['vikendica','vlasic','priroda','odmor','drvena']);
  END IF;
END $$;

-- ============================================================================
-- 4. MOBITELI
-- ============================================================================
DO $$
DECLARE
  seller UUID := '00000000-0000-0000-0000-000000000001';
  cat UUID;
BEGIN
  -- mob-iphone (Product 1: iPhone 15 Pro Max)
  SELECT id INTO cat FROM categories WHERE slug = 'mob-iphone';
  IF cat IS NOT NULL THEN
    INSERT INTO products (seller_id, title, description, price, category_id, condition, images, status, location, views_count, favorites_count, attributes, tags)
    VALUES (seller, 'iPhone 15 Pro Max 256GB Natural Titanium', 'Kupljen u iStyle, garancija do 2025. Stanje baterije 98%. Bez ogrebotina.', 1150.00, cat, 'like_new',
      ARRAY['https://images.unsplash.com/photo-1592750475338-74b7b21085ab?w=800&h=600&fit=crop'],
      'active', 'Sarajevo', 189, 16,
      '{"memorija":"256GB","boja":"Natural Titanium","zdravljeBaterije":98,"stanjeEkrana":"Bez ogrebotina","fabrickaKutija":true,"punjac":true,"ostecen":false}'::jsonb,
      ARRAY['iphone','15promax','apple','titanium','256gb']);
  END IF;

  -- mob-iphone (Product 2: iPhone 13)
  IF cat IS NOT NULL THEN
    INSERT INTO products (seller_id, title, description, price, category_id, condition, images, status, location, views_count, favorites_count, attributes, tags)
    VALUES (seller, 'iPhone 13 128GB Midnight', 'Korišten godinu dana, očuvan. Baterija 87%, sitne ogrebotine na poleđini.', 480.00, cat, 'used',
      ARRAY['https://images.unsplash.com/photo-1592750475338-74b7b21085ab?w=800&h=600&fit=crop'],
      'active', 'Tuzla', 134, 9,
      '{"memorija":"128GB","boja":"Midnight","zdravljeBaterije":87,"stanjeEkrana":"Sitne ogrebotine","fabrickaKutija":false,"punjac":true,"ostecen":false}'::jsonb,
      ARRAY['iphone','13','apple','128gb','midnight']);
  END IF;

  -- mob-samsung
  SELECT id INTO cat FROM categories WHERE slug = 'mob-samsung';
  IF cat IS NOT NULL THEN
    INSERT INTO products (seller_id, title, description, price, category_id, condition, images, status, location, views_count, favorites_count, attributes, tags)
    VALUES (seller, 'Samsung Galaxy S24 Ultra 256GB', 'Flagship Samsung, korišten 3 mjeseca. Sve u kompletu. Titanium Gray.', 950.00, cat, 'like_new',
      ARRAY['https://images.unsplash.com/photo-1610945415295-d9bbf067e59c?w=800&h=600&fit=crop'],
      'active', 'Mostar', 145, 12,
      '{"memorija":"256GB","ram":"12GB","boja":"Titanium Gray","stanjeEkrana":"Bez ogrebotina","fabrickaKutija":true,"punjac":true,"ostecen":false}'::jsonb,
      ARRAY['samsung','galaxy','s24ultra','256gb','flagship']);
  END IF;

  -- mob-xiaomi
  SELECT id INTO cat FROM categories WHERE slug = 'mob-xiaomi';
  IF cat IS NOT NULL THEN
    INSERT INTO products (seller_id, title, description, price, category_id, condition, images, status, location, views_count, favorites_count, attributes, tags)
    VALUES (seller, 'Xiaomi 14 256GB Crni', 'Xiaomi 14 u odličnom stanju. Leica kamera. Bez ogrebotina.', 520.00, cat, 'like_new',
      ARRAY['https://images.unsplash.com/photo-1610945415295-d9bbf067e59c?w=800&h=600&fit=crop'],
      'active', 'Banja Luka', 78, 5,
      '{"memorija":"256GB","ram":"12GB","boja":"Crna","stanjeEkrana":"Bez ogrebotina","fabrickaKutija":true,"punjac":true,"ostecen":false}'::jsonb,
      ARRAY['xiaomi','14','leica','256gb','crni']);
  END IF;

  -- mob-huawei
  SELECT id INTO cat FROM categories WHERE slug = 'mob-huawei';
  IF cat IS NOT NULL THEN
    INSERT INTO products (seller_id, title, description, price, category_id, condition, images, status, location, views_count, favorites_count, attributes, tags)
    VALUES (seller, 'Huawei P60 Pro 256GB', 'Huawei P60 Pro, odlična kamera, korišten 6 mjeseci.', 450.00, cat, 'used',
      ARRAY['https://images.unsplash.com/photo-1610945415295-d9bbf067e59c?w=800&h=600&fit=crop'],
      'active', 'Zenica', 56, 3,
      '{"memorija":"256GB","ram":"8GB","boja":"Crna","stanjeEkrana":"Sitne ogrebotine","fabrickaKutija":true,"punjac":true,"ostecen":false}'::jsonb,
      ARRAY['huawei','p60pro','256gb','kamera']);
  END IF;

  -- mob-oneplus
  SELECT id INTO cat FROM categories WHERE slug = 'mob-oneplus';
  IF cat IS NOT NULL THEN
    INSERT INTO products (seller_id, title, description, price, category_id, condition, images, status, location, views_count, favorites_count, attributes, tags)
    VALUES (seller, 'OnePlus 12 256GB Silky Black', 'OnePlus 12, brzo punjenje 100W. Sve u kompletu.', 580.00, cat, 'like_new',
      ARRAY['https://images.unsplash.com/photo-1610945415295-d9bbf067e59c?w=800&h=600&fit=crop'],
      'active', 'Zagreb', 42, 4,
      '{"memorija":"256GB","ram":"16GB","boja":"Crna","stanjeEkrana":"Bez ogrebotina","fabrickaKutija":true,"punjac":true,"ostecen":false}'::jsonb,
      ARRAY['oneplus','12','256gb','100w','brzo-punjenje']);
  END IF;

  -- mob-nokia
  SELECT id INTO cat FROM categories WHERE slug = 'mob-nokia';
  IF cat IS NOT NULL THEN
    INSERT INTO products (seller_id, title, description, price, category_id, condition, images, status, location, views_count, favorites_count, attributes, tags)
    VALUES (seller, 'Nokia G60 5G 128GB', 'Nokia G60, 3 godine garancija na ažuriranja. Korišten 4 mjeseca.', 180.00, cat, 'like_new',
      ARRAY['https://images.unsplash.com/photo-1610945415295-d9bbf067e59c?w=800&h=600&fit=crop'],
      'active', 'Split', 23, 1,
      '{"memorija":"128GB","ram":"6GB","boja":"Siva","stanjeEkrana":"Bez ogrebotina","fabrickaKutija":true,"punjac":true,"ostecen":false}'::jsonb,
      ARRAY['nokia','g60','5g','128gb']);
  END IF;

  -- mob-ostale
  SELECT id INTO cat FROM categories WHERE slug = 'mob-ostale';
  IF cat IS NOT NULL THEN
    INSERT INTO products (seller_id, title, description, price, category_id, condition, images, status, location, views_count, favorites_count, attributes, tags)
    VALUES (seller, 'Google Pixel 8 128GB Obsidian', 'Pixel 8 sa najboljom kamerom na tržištu. Korišten 2 mjeseca.', 420.00, cat, 'like_new',
      ARRAY['https://images.unsplash.com/photo-1610945415295-d9bbf067e59c?w=800&h=600&fit=crop'],
      'active', 'Travnik', 35, 3,
      '{"memorija":"128GB","ram":"8GB","boja":"Crna","stanjeEkrana":"Bez ogrebotina","fabrickaKutija":true,"punjac":true,"ostecen":false}'::jsonb,
      ARRAY['google','pixel','8','128gb','kamera']);
  END IF;

  -- mob-tableti
  SELECT id INTO cat FROM categories WHERE slug = 'mob-tableti';
  IF cat IS NOT NULL THEN
    INSERT INTO products (seller_id, title, description, price, category_id, condition, images, status, location, views_count, favorites_count, attributes, tags)
    VALUES (seller, 'iPad Air M1 64GB WiFi Space Gray', 'iPad Air 5. generacija, M1 čip. Korišten za učenje, očuvan.', 420.00, cat, 'used',
      ARRAY['https://images.unsplash.com/photo-1544244015-0df4b3ffc6b0?w=800&h=600&fit=crop'],
      'active', 'Bihać', 67, 5,
      '{"memorija":"64GB","dijagonala":"10.9\"","boja":"Space Gray","fabrickaKutija":true,"punjac":true,"ostecen":false}'::jsonb,
      ARRAY['ipad','air','m1','apple','tablet']);
  END IF;

  -- mob-pametni-satovi
  SELECT id INTO cat FROM categories WHERE slug = 'mob-pametni-satovi';
  IF cat IS NOT NULL THEN
    INSERT INTO products (seller_id, title, description, price, category_id, condition, images, status, location, views_count, favorites_count, attributes, tags)
    VALUES (seller, 'Apple Watch Series 9 45mm', 'Apple Watch S9, GPS, Midnight aluminij. Korišten 3 mjeseca.', 350.00, cat, 'like_new',
      ARRAY['https://images.unsplash.com/photo-1523275335684-37898b6baf30?w=800&h=600&fit=crop'],
      'active', 'Bijeljina', 54, 4,
      '{"marka":"Apple","boja":"Midnight","punjac":true}'::jsonb,
      ARRAY['apple','watch','series9','pametni','sat']);
  END IF;

  -- mob-slusalice
  SELECT id INTO cat FROM categories WHERE slug = 'mob-slusalice';
  IF cat IS NOT NULL THEN
    INSERT INTO products (seller_id, title, description, price, category_id, condition, images, status, location, views_count, favorites_count, attributes, tags)
    VALUES (seller, 'AirPods Pro 2. generacija', 'Apple AirPods Pro sa USB-C kućištem. Odlična ANC funkcija.', 180.00, cat, 'used',
      ARRAY['https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=800&h=600&fit=crop'],
      'active', 'Sarajevo', 87, 7,
      '{"tip":"In-ear","marka":"Apple","bezicne":true}'::jsonb,
      ARRAY['airpods','pro','apple','bezicne','anc']);
  END IF;

  -- mob-punjaci
  SELECT id INTO cat FROM categories WHERE slug = 'mob-punjaci';
  IF cat IS NOT NULL THEN
    INSERT INTO products (seller_id, title, description, price, category_id, condition, images, status, location, views_count, favorites_count, attributes, tags)
    VALUES (seller, 'Anker 65W GaN punjač USB-C', 'Kompaktan GaN punjač, 65W. Odličan za laptop i mobitel. Nov, u kutiji.', 35.00, cat, 'new',
      ARRAY['https://images.unsplash.com/photo-1610945415295-d9bbf067e59c?w=800&h=600&fit=crop'],
      'active', 'Mostar', 45, 2,
      '{"tip":"Zidni","prikljucak":"USB-C"}'::jsonb,
      ARRAY['punjac','anker','65w','gan','usbc']);
  END IF;

  -- mob-maske
  SELECT id INTO cat FROM categories WHERE slug = 'mob-maske';
  IF cat IS NOT NULL THEN
    INSERT INTO products (seller_id, title, description, price, category_id, condition, images, status, location, views_count, favorites_count, attributes, tags)
    VALUES (seller, 'Silikonska maska za iPhone 15 Pro', 'Apple originalna silikonska maska, Storm Blue boja. Kao nova.', 25.00, cat, 'like_new',
      ARRAY['https://images.unsplash.com/photo-1592750475338-74b7b21085ab?w=800&h=600&fit=crop'],
      'active', 'Tuzla', 32, 1,
      '{"modelTelefona":"iPhone 15 Pro"}'::jsonb,
      ARRAY['maska','iphone','15pro','silikonska','apple']);
  END IF;

  -- mob-dijelovi
  SELECT id INTO cat FROM categories WHERE slug = 'mob-dijelovi';
  IF cat IS NOT NULL THEN
    INSERT INTO products (seller_id, title, description, price, category_id, condition, images, status, location, views_count, favorites_count, attributes, tags)
    VALUES (seller, 'Ekran za Samsung Galaxy S21', 'Originalni AMOLED ekran sa okvirom. Nov, testiran.', 120.00, cat, 'new',
      ARRAY['https://images.unsplash.com/photo-1610945415295-d9bbf067e59c?w=800&h=600&fit=crop'],
      'active', 'Banja Luka', 28, 2,
      '{"modelTelefona":"Samsung Galaxy S21","tipDijela":"Ekran"}'::jsonb,
      ARRAY['ekran','samsung','s21','amoled','dio']);
  END IF;

  -- mob-ostalo
  SELECT id INTO cat FROM categories WHERE slug = 'mob-ostalo';
  IF cat IS NOT NULL THEN
    INSERT INTO products (seller_id, title, description, price, category_id, condition, images, status, location, views_count, favorites_count, attributes, tags)
    VALUES (seller, 'Ringlight 26cm sa stativom', 'LED ring light za snimanje, 3 boje svjetla, stativ 180cm. Novo.', 25.00, cat, 'new',
      ARRAY['https://images.unsplash.com/photo-1610945415295-d9bbf067e59c?w=800&h=600&fit=crop'],
      'active', 'Zenica', 41, 3,
      '{}'::jsonb,
      ARRAY['ringlight','led','stativ','snimanje','selfie']);
  END IF;
END $$;

-- ============================================================================
-- 5. RACUNALA
-- ============================================================================
DO $$
DECLARE
  seller UUID := '00000000-0000-0000-0000-000000000001';
  cat UUID;
BEGIN
  -- rac-laptopi
  SELECT id INTO cat FROM categories WHERE slug = 'rac-laptopi';
  IF cat IS NOT NULL THEN
    INSERT INTO products (seller_id, title, description, price, category_id, condition, images, status, location, views_count, favorites_count, attributes, tags)
    VALUES (seller, 'MacBook Air M2 16GB 512GB', 'MacBook Air M2 čip, Midnight boja. Korišten za programiranje, očuvan.', 1100.00, cat, 'used',
      ARRAY['https://images.unsplash.com/photo-1496181133206-80ce9b88a853?w=800&h=600&fit=crop'],
      'active', 'Sarajevo', 176, 14,
      '{"ram":"16GB","ssd":"512GB","dijagonala":"13.6\"","procesor":"Apple M2","gpu":"Integrisana","marka":"Apple","touchscreen":false,"ostecen":false}'::jsonb,
      ARRAY['macbook','air','m2','apple','laptop','programiranje']);
  END IF;

  -- rac-desktop
  SELECT id INTO cat FROM categories WHERE slug = 'rac-desktop';
  IF cat IS NOT NULL THEN
    INSERT INTO products (seller_id, title, description, price, category_id, condition, images, status, location, views_count, favorites_count, attributes, tags)
    VALUES (seller, 'Gaming PC RTX 4070 i7-13700K', 'Komplet gaming setup. RTX 4070, 32GB RAM, 1TB NVMe. Idealan za gaming.', 1200.00, cat, 'like_new',
      ARRAY['https://images.unsplash.com/photo-1593062096033-9a26b09da705?w=800&h=600&fit=crop'],
      'active', 'Mostar', 143, 11,
      '{"ram":"32GB","ssd":"1TB NVMe","procesor":"Intel i7-13700K","gpu":"NVIDIA RTX 4070","marka":"Custom","ostecen":false}'::jsonb,
      ARRAY['gaming','pc','rtx4070','i7','desktop','custom']);
  END IF;

  -- rac-monitori
  SELECT id INTO cat FROM categories WHERE slug = 'rac-monitori';
  IF cat IS NOT NULL THEN
    INSERT INTO products (seller_id, title, description, price, category_id, condition, images, status, location, views_count, favorites_count, attributes, tags)
    VALUES (seller, 'LG UltraWide 34" QHD 144Hz', 'LG 34WP65C, curved monitor. Idealan za produktivnost i gaming.', 320.00, cat, 'used',
      ARRAY['https://images.unsplash.com/photo-1527443224154-c4a3942d3acf?w=800&h=600&fit=crop'],
      'active', 'Tuzla', 89, 7,
      '{"dijagonala":"34\"","rezolucija":"3440x1440","panel":"VA","refreshRate":144,"tip":"Curved"}'::jsonb,
      ARRAY['monitor','lg','ultrawide','34','qhd','144hz']);
  END IF;

  -- rac-komponente
  SELECT id INTO cat FROM categories WHERE slug = 'rac-komponente';
  IF cat IS NOT NULL THEN
    INSERT INTO products (seller_id, title, description, price, category_id, condition, images, status, location, views_count, favorites_count, attributes, tags)
    VALUES (seller, 'AMD Ryzen 7 5800X procesor', 'Ryzen 7 5800X, korišten godinu dana, bez problema. Sa hladnjakom.', 150.00, cat, 'used',
      ARRAY['https://images.unsplash.com/photo-1593062096033-9a26b09da705?w=800&h=600&fit=crop'],
      'active', 'Banja Luka', 65, 5,
      '{"tip":"Procesor"}'::jsonb,
      ARRAY['amd','ryzen','5800x','procesor','am4']);
  END IF;

  -- rac-mrezna
  SELECT id INTO cat FROM categories WHERE slug = 'rac-mrezna';
  IF cat IS NOT NULL THEN
    INSERT INTO products (seller_id, title, description, price, category_id, condition, images, status, location, views_count, favorites_count, attributes, tags)
    VALUES (seller, 'TP-Link Archer AX73 WiFi 6 Router', 'Brzi WiFi 6 router, AX5400. Korišten 6 mjeseci, kao nov.', 65.00, cat, 'like_new',
      ARRAY['https://images.unsplash.com/photo-1593062096033-9a26b09da705?w=800&h=600&fit=crop'],
      'active', 'Zenica', 34, 2,
      '{"tip":"Router"}'::jsonb,
      ARRAY['router','tplink','wifi6','ax5400','mrezna']);
  END IF;

  -- rac-printeri
  SELECT id INTO cat FROM categories WHERE slug = 'rac-printeri';
  IF cat IS NOT NULL THEN
    INSERT INTO products (seller_id, title, description, price, category_id, condition, images, status, location, views_count, favorites_count, attributes, tags)
    VALUES (seller, 'HP LaserJet Pro M404dn', 'Laserski crno-bijeli printer, duplex štampa. Malo korišten.', 180.00, cat, 'used',
      ARRAY['https://images.unsplash.com/photo-1593062096033-9a26b09da705?w=800&h=600&fit=crop'],
      'active', 'Zagreb', 27, 1,
      '{"tip":"Laserski","marka":"HP"}'::jsonb,
      ARRAY['printer','hp','laserjet','laserski','duplex']);
  END IF;

  -- rac-serveri
  SELECT id INTO cat FROM categories WHERE slug = 'rac-serveri';
  IF cat IS NOT NULL THEN
    INSERT INTO products (seller_id, title, description, price, category_id, condition, images, status, location, views_count, favorites_count, attributes, tags)
    VALUES (seller, 'Dell PowerEdge T440 Server', 'Dell server, 2x Xeon Silver, 64GB RAM, 4TB storage. Iz ureda.', 1500.00, cat, 'used',
      ARRAY['https://images.unsplash.com/photo-1593062096033-9a26b09da705?w=800&h=600&fit=crop'],
      'active', 'Split', 18, 2,
      '{"ram":"64GB","brojProcesora":2,"kapacitetDiska":"4TB"}'::jsonb,
      ARRAY['server','dell','poweredge','xeon','enterprise']);
  END IF;

  -- rac-softver
  SELECT id INTO cat FROM categories WHERE slug = 'rac-softver';
  IF cat IS NOT NULL THEN
    INSERT INTO products (seller_id, title, description, price, category_id, condition, images, status, location, views_count, favorites_count, attributes, tags)
    VALUES (seller, 'Microsoft Office 2021 Professional', 'Originalna licenca, doživotna. Aktivacija na jednom računaru.', 45.00, cat, 'new',
      ARRAY['https://images.unsplash.com/photo-1496181133206-80ce9b88a853?w=800&h=600&fit=crop'],
      'active', 'Travnik', 112, 6,
      '{"platforma":"Windows","tip":"Uredski"}'::jsonb,
      ARRAY['office','microsoft','licenca','2021','professional']);
  END IF;

  -- rac-gaming
  SELECT id INTO cat FROM categories WHERE slug = 'rac-gaming';
  IF cat IS NOT NULL THEN
    INSERT INTO products (seller_id, title, description, price, category_id, condition, images, status, location, views_count, favorites_count, attributes, tags)
    VALUES (seller, 'Steam Deck 256GB', 'Steam Deck sa 256GB SSD, korišten par mjeseci. Sa torbicom.', 320.00, cat, 'like_new',
      ARRAY['https://images.unsplash.com/photo-1612287230202-1ff1d85d1bdf?w=800&h=600&fit=crop'],
      'active', 'Bihać', 98, 9,
      '{"platforma":"PC"}'::jsonb,
      ARRAY['steamdeck','valve','gaming','handheld','portable']);
  END IF;

  -- rac-dronovi
  SELECT id INTO cat FROM categories WHERE slug = 'rac-dronovi';
  IF cat IS NOT NULL THEN
    INSERT INTO products (seller_id, title, description, price, category_id, condition, images, status, location, views_count, favorites_count, attributes, tags)
    VALUES (seller, 'DJI Mini 3 Pro sa RC kontrolerom', 'DJI Mini 3 Pro, 4K kamera, 34min let. Korišten 5 puta. Komplet.', 650.00, cat, 'like_new',
      ARRAY['https://images.unsplash.com/photo-1473968512647-3e447244af8f?w=800&h=600&fit=crop'],
      'active', 'Bijeljina', 76, 8,
      '{"marka":"DJI","tip":"Foto/Video"}'::jsonb,
      ARRAY['dji','mini3pro','dron','4k','snimanje']);
  END IF;

  -- rac-ostalo
  SELECT id INTO cat FROM categories WHERE slug = 'rac-ostalo';
  IF cat IS NOT NULL THEN
    INSERT INTO products (seller_id, title, description, price, category_id, condition, images, status, location, views_count, favorites_count, attributes, tags)
    VALUES (seller, 'USB-C Hub 7u1 za laptop', 'Hub sa HDMI, 3x USB-A, SD, microSD, USB-C PD. Kompatibilan sa svim laptopima.', 25.00, cat, 'new',
      ARRAY['https://images.unsplash.com/photo-1496181133206-80ce9b88a853?w=800&h=600&fit=crop'],
      'active', 'Sarajevo', 53, 3,
      '{}'::jsonb,
      ARRAY['hub','usbc','hdmi','adapter','laptop']);
  END IF;
END $$;

-- ============================================================================
-- 6. TEHNIKA
-- ============================================================================
DO $$
DECLARE
  seller UUID := '00000000-0000-0000-0000-000000000001';
  cat UUID;
BEGIN
  -- teh-televizori
  SELECT id INTO cat FROM categories WHERE slug = 'teh-televizori';
  IF cat IS NOT NULL THEN
    INSERT INTO products (seller_id, title, description, price, category_id, condition, images, status, location, views_count, favorites_count, attributes, tags)
    VALUES (seller, 'Samsung 55" QLED 4K Smart TV', 'Samsung QE55Q60C, QLED, HDR10+. Kupljen 2023, garancija do 2025.', 550.00, cat, 'like_new',
      ARRAY['https://images.unsplash.com/photo-1593359677879-a4bb92f829d1?w=800&h=600&fit=crop'],
      'active', 'Mostar', 123, 10,
      '{"dijagonala":"55\"","tip":"QLED","rezolucija":"4K","marka":"Samsung","smartTv":true}'::jsonb,
      ARRAY['samsung','tv','qled','55','4k','smart']);
  END IF;

  -- teh-audio
  SELECT id INTO cat FROM categories WHERE slug = 'teh-audio';
  IF cat IS NOT NULL THEN
    INSERT INTO products (seller_id, title, description, price, category_id, condition, images, status, location, views_count, favorites_count, attributes, tags)
    VALUES (seller, 'JBL Charge 5 Bluetooth zvučnik', 'Vodootporni Bluetooth zvučnik, odlican bas. Crna boja. Korišten ljeto.', 95.00, cat, 'used',
      ARRAY['https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=800&h=600&fit=crop'],
      'active', 'Tuzla', 67, 5,
      '{"tip":"Bluetooth zvučnik","marka":"JBL"}'::jsonb,
      ARRAY['jbl','charge5','bluetooth','zvucnik','vodootporni']);
  END IF;

  -- teh-foto-video
  SELECT id INTO cat FROM categories WHERE slug = 'teh-foto-video';
  IF cat IS NOT NULL THEN
    INSERT INTO products (seller_id, title, description, price, category_id, condition, images, status, location, views_count, favorites_count, attributes, tags)
    VALUES (seller, 'Canon EOS R6 Mark II body', 'Canon mirrorless, 24.2MP, 4K60. Korišten profesionalno, odlično stanje.', 1800.00, cat, 'used',
      ARRAY['https://images.unsplash.com/photo-1516035069371-29a1b244cc32?w=800&h=600&fit=crop'],
      'active', 'Banja Luka', 89, 7,
      '{"tip":"Mirrorless fotoaparat","marka":"Canon"}'::jsonb,
      ARRAY['canon','eos','r6','mirrorless','fullframe','4k']);
  END IF;

  -- teh-bijela
  SELECT id INTO cat FROM categories WHERE slug = 'teh-bijela';
  IF cat IS NOT NULL THEN
    INSERT INTO products (seller_id, title, description, price, category_id, condition, images, status, location, views_count, favorites_count, attributes, tags)
    VALUES (seller, 'Bosch perilica rublja 8kg A+++', 'Bosch WAN28262BY, 8kg, 1400 obrtaja. Korištena 2 godine, ispravna.', 350.00, cat, 'used',
      ARRAY['https://images.unsplash.com/photo-1626806787461-102c1bfaaea1?w=800&h=600&fit=crop'],
      'active', 'Zenica', 54, 3,
      '{"tip":"Perilica rublja","marka":"Bosch","energetskirazred":"A+++"}'::jsonb,
      ARRAY['perilica','bosch','8kg','bijela-tehnika']);
  END IF;

  -- teh-mali-aparati
  SELECT id INTO cat FROM categories WHERE slug = 'teh-mali-aparati';
  IF cat IS NOT NULL THEN
    INSERT INTO products (seller_id, title, description, price, category_id, condition, images, status, location, views_count, favorites_count, attributes, tags)
    VALUES (seller, 'De''Longhi Magnifica S espresso aparat', 'Automatski espresso aparat, mlin za kafu. Redovno čišćen i održavan.', 280.00, cat, 'used',
      ARRAY['https://images.unsplash.com/photo-1626806787461-102c1bfaaea1?w=800&h=600&fit=crop'],
      'active', 'Zagreb', 98, 8,
      '{"tip":"Espresso aparat","marka":"De''Longhi"}'::jsonb,
      ARRAY['espresso','delonghi','magnifica','kafa','aparat']);
  END IF;

  -- teh-smart-home
  SELECT id INTO cat FROM categories WHERE slug = 'teh-smart-home';
  IF cat IS NOT NULL THEN
    INSERT INTO products (seller_id, title, description, price, category_id, condition, images, status, location, views_count, favorites_count, attributes, tags)
    VALUES (seller, 'Philips Hue Starter Kit E27', 'Starter kit sa 3 sijalice i Hue Bridge. Kontrola putem aplikacije.', 85.00, cat, 'like_new',
      ARRAY['https://images.unsplash.com/photo-1593062096033-9a26b09da705?w=800&h=600&fit=crop'],
      'active', 'Split', 43, 3,
      '{"tip":"Pametna rasvjeta","marka":"Philips"}'::jsonb,
      ARRAY['hue','philips','smart','rasvjeta','pametna']);
  END IF;

  -- teh-solarna
  SELECT id INTO cat FROM categories WHERE slug = 'teh-solarna';
  IF cat IS NOT NULL THEN
    INSERT INTO products (seller_id, title, description, price, category_id, condition, images, status, location, views_count, favorites_count, attributes, tags)
    VALUES (seller, 'Solarni panel 400W monokristalni', 'Novi solarni panel, 400W, monokristalni. Garancija 25 godina na snagu.', 120.00, cat, 'new',
      ARRAY['https://images.unsplash.com/photo-1581578731548-c64695cc6952?w=800&h=600&fit=crop'],
      'active', 'Travnik', 56, 4,
      '{"tip":"Solarni panel","snaga":400}'::jsonb,
      ARRAY['solar','panel','400w','monokristalni','energija']);
  END IF;

  -- teh-medicinska
  SELECT id INTO cat FROM categories WHERE slug = 'teh-medicinska';
  IF cat IS NOT NULL THEN
    INSERT INTO products (seller_id, title, description, price, category_id, condition, images, status, location, views_count, favorites_count, attributes, tags)
    VALUES (seller, 'Omron M3 digitalni tlakomjer', 'Automatski tlakomjer za nadlakticu. Korišten par puta, kao nov.', 45.00, cat, 'like_new',
      ARRAY['https://images.unsplash.com/photo-1581578731548-c64695cc6952?w=800&h=600&fit=crop'],
      'active', 'Bihać', 22, 1,
      '{"tip":"Tlakomjer"}'::jsonb,
      ARRAY['tlakomjer','omron','digitalni','zdravlje']);
  END IF;

  -- teh-ostala
  SELECT id INTO cat FROM categories WHERE slug = 'teh-ostala';
  IF cat IS NOT NULL THEN
    INSERT INTO products (seller_id, title, description, price, category_id, condition, images, status, location, views_count, favorites_count, attributes, tags)
    VALUES (seller, 'Električni trotinet sklopivi', 'Električni trotinet, domet 25km, max 25km/h. Idealan za gradski prevoz.', 250.00, cat, 'used',
      ARRAY['https://images.unsplash.com/photo-1593062096033-9a26b09da705?w=800&h=600&fit=crop'],
      'active', 'Bijeljina', 73, 5,
      '{}'::jsonb,
      ARRAY['trotinet','elektricni','sklopivi','grad','prevoz']);
  END IF;
END $$;

-- ============================================================================
-- 7. DOM
-- ============================================================================
DO $$
DECLARE
  seller UUID := '00000000-0000-0000-0000-000000000001';
  cat UUID;
BEGIN
  -- dom-nj-dnevna
  SELECT id INTO cat FROM categories WHERE slug = 'dom-nj-dnevna';
  IF cat IS NOT NULL THEN
    INSERT INTO products (seller_id, title, description, price, category_id, condition, images, status, location, views_count, favorites_count, attributes, tags)
    VALUES (seller, 'Kožna ugaona garnitura siva', 'Moderna ugaona garnitura od prave kože, siva boja. Dimenzije 280x200cm.', 850.00, cat, 'used',
      ARRAY['https://images.unsplash.com/photo-1555041469-a586c61ea9bc?w=800&h=600&fit=crop'],
      'active', 'Sarajevo', 112, 9,
      '{"tip":"Garnitura","materijal":"Koža","boja":"Siva"}'::jsonb,
      ARRAY['garnitura','kozna','ugaona','dnevna','soba']);
  END IF;

  -- dom-nj-spavaca
  SELECT id INTO cat FROM categories WHERE slug = 'dom-nj-spavaca';
  IF cat IS NOT NULL THEN
    INSERT INTO products (seller_id, title, description, price, category_id, condition, images, status, location, views_count, favorites_count, attributes, tags)
    VALUES (seller, 'Bračni krevet 180x200 sa madracem', 'Drveni bračni krevet sa kvalitetnim madracem. Korišten 2 godine.', 400.00, cat, 'used',
      ARRAY['https://images.unsplash.com/photo-1505693416388-ac5ce068fe85?w=800&h=600&fit=crop'],
      'active', 'Mostar', 78, 5,
      '{"tip":"Krevet","materijal":"Drvo","dimKreveta":"180x200"}'::jsonb,
      ARRAY['krevet','bracni','madrac','spavaca','180x200']);
  END IF;

  -- dom-nj-kuhinja
  SELECT id INTO cat FROM categories WHERE slug = 'dom-nj-kuhinja';
  IF cat IS NOT NULL THEN
    INSERT INTO products (seller_id, title, description, price, category_id, condition, images, status, location, views_count, favorites_count, attributes, tags)
    VALUES (seller, 'Kuhinja po mjeri bijela 3m', 'Kompletna kuhinja sa gornjim i donjim elementima. Bijela mat. Sa aparatima.', 2500.00, cat, 'like_new',
      ARRAY['https://images.unsplash.com/photo-1556909114-f6e7ad7d3136?w=800&h=600&fit=crop'],
      'active', 'Tuzla', 95, 7,
      '{"tip":"Kuhinjski elementi","materijal":"MDF","boja":"Bijela"}'::jsonb,
      ARRAY['kuhinja','elementi','bijela','kompletna','aparati']);
  END IF;

  -- dom-nj-djecja
  SELECT id INTO cat FROM categories WHERE slug = 'dom-nj-djecja';
  IF cat IS NOT NULL THEN
    INSERT INTO products (seller_id, title, description, price, category_id, condition, images, status, location, views_count, favorites_count, attributes, tags)
    VALUES (seller, 'Dječji krevet kućica 160x80', 'Drveni krevet u obliku kućice, sa zaštitnom ogradicom. Bijeli.', 220.00, cat, 'like_new',
      ARRAY['https://images.unsplash.com/photo-1505693416388-ac5ce068fe85?w=800&h=600&fit=crop'],
      'active', 'Banja Luka', 56, 4,
      '{"tip":"Dječji krevet","materijal":"Drvo","boja":"Bijela"}'::jsonb,
      ARRAY['krevet','djecji','kucica','drveni','160x80']);
  END IF;

  -- dom-nj-radna
  SELECT id INTO cat FROM categories WHERE slug = 'dom-nj-radna';
  IF cat IS NOT NULL THEN
    INSERT INTO products (seller_id, title, description, price, category_id, condition, images, status, location, views_count, favorites_count, attributes, tags)
    VALUES (seller, 'Radni sto IKEA BEKANT 160x80', 'Podesiv po visini, bijela ploča, crne noge. Odlično stanje.', 180.00, cat, 'used',
      ARRAY['https://images.unsplash.com/photo-1497366216548-37526070297c?w=800&h=600&fit=crop'],
      'active', 'Zenica', 67, 3,
      '{"tip":"Radni sto","materijal":"Laminat","boja":"Bijela"}'::jsonb,
      ARRAY['sto','ikea','bekant','radni','podesiv']);
  END IF;

  -- dom-nj-kupaonica
  SELECT id INTO cat FROM categories WHERE slug = 'dom-nj-kupaonica';
  IF cat IS NOT NULL THEN
    INSERT INTO products (seller_id, title, description, price, category_id, condition, images, status, location, views_count, favorites_count, attributes, tags)
    VALUES (seller, 'Tuš kabina 90x90 staklena', 'Staklena tuš kabina sa kliznim vratima. Nova, u kutiji.', 280.00, cat, 'new',
      ARRAY['https://images.unsplash.com/photo-1556909114-f6e7ad7d3136?w=800&h=600&fit=crop'],
      'active', 'Zagreb', 34, 2,
      '{"tip":"Tuš kabina","materijal":"Staklo"}'::jsonb,
      ARRAY['tus','kabina','staklena','kupaonica','90x90']);
  END IF;

  -- dom-rasvjeta
  SELECT id INTO cat FROM categories WHERE slug = 'dom-rasvjeta';
  IF cat IS NOT NULL THEN
    INSERT INTO products (seller_id, title, description, price, category_id, condition, images, status, location, views_count, favorites_count, attributes, tags)
    VALUES (seller, 'Luster kristalni za dnevnu sobu', 'Elegantan kristalni luster, 5 sijalica. Prečnik 60cm.', 150.00, cat, 'like_new',
      ARRAY['https://images.unsplash.com/photo-1555041469-a586c61ea9bc?w=800&h=600&fit=crop'],
      'active', 'Split', 45, 3,
      '{"tip":"Luster"}'::jsonb,
      ARRAY['luster','kristalni','rasvjeta','dnevna','elegantan']);
  END IF;

  -- dom-tekstil
  SELECT id INTO cat FROM categories WHERE slug = 'dom-tekstil';
  IF cat IS NOT NULL THEN
    INSERT INTO products (seller_id, title, description, price, category_id, condition, images, status, location, views_count, favorites_count, attributes, tags)
    VALUES (seller, 'Posteljina saten 200x220 komplet', 'Luksuzna saten posteljina, komplet sa jastučnicama. Bež boja. Nova.', 55.00, cat, 'new',
      ARRAY['https://images.unsplash.com/photo-1505693416388-ac5ce068fe85?w=800&h=600&fit=crop'],
      'active', 'Travnik', 38, 2,
      '{"tip":"Posteljina","materijal":"Saten","boja":"Bež"}'::jsonb,
      ARRAY['posteljina','saten','luksuzna','200x220','komplet']);
  END IF;

  -- dom-dekoracije
  SELECT id INTO cat FROM categories WHERE slug = 'dom-dekoracije';
  IF cat IS NOT NULL THEN
    INSERT INTO products (seller_id, title, description, price, category_id, condition, images, status, location, views_count, favorites_count, attributes, tags)
    VALUES (seller, 'Zidno ogledalo okruglo 80cm', 'Moderno okruglo ogledalo sa zlatnim okvirom. Prečnik 80cm.', 65.00, cat, 'new',
      ARRAY['https://images.unsplash.com/photo-1555041469-a586c61ea9bc?w=800&h=600&fit=crop'],
      'active', 'Bihać', 52, 4,
      '{"tip":"Ogledalo"}'::jsonb,
      ARRAY['ogledalo','okruglo','zlatni','okvir','dekoracija']);
  END IF;

  -- dom-grijanje
  SELECT id INTO cat FROM categories WHERE slug = 'dom-grijanje';
  IF cat IS NOT NULL THEN
    INSERT INTO products (seller_id, title, description, price, category_id, condition, images, status, location, views_count, favorites_count, attributes, tags)
    VALUES (seller, 'Pelet peć Alfa Plam 12kW', 'Peć na pelet, automatsko paljenje, daljinski upravljač. Korištena jednu sezonu.', 650.00, cat, 'like_new',
      ARRAY['https://images.unsplash.com/photo-1581578731548-c64695cc6952?w=800&h=600&fit=crop'],
      'active', 'Bijeljina', 87, 6,
      '{"tip":"Peć na pelet"}'::jsonb,
      ARRAY['pec','pelet','grijanje','12kw','alfa-plam']);
  END IF;

  -- dom-vrt
  SELECT id INTO cat FROM categories WHERE slug = 'dom-vrt';
  IF cat IS NOT NULL THEN
    INSERT INTO products (seller_id, title, description, price, category_id, condition, images, status, location, views_count, favorites_count, attributes, tags)
    VALUES (seller, 'Vrtna garnitura ratan 4+1', 'Set od 4 stolice i stola, sintetički ratan. Sa jastucima. Smeđa boja.', 350.00, cat, 'like_new',
      ARRAY['https://images.unsplash.com/photo-1416879595882-3373a0480b5b?w=800&h=600&fit=crop'],
      'active', 'Sarajevo', 65, 5,
      '{"tip":"Vrtna garnitura","materijal":"Ratan"}'::jsonb,
      ARRAY['vrtna','garnitura','ratan','stolice','sto']);
  END IF;

  -- dom-bazeni
  SELECT id INTO cat FROM categories WHERE slug = 'dom-bazeni';
  IF cat IS NOT NULL THEN
    INSERT INTO products (seller_id, title, description, price, category_id, condition, images, status, location, views_count, favorites_count, attributes, tags)
    VALUES (seller, 'Intex bazen 366x76cm sa pumpom', 'Nadzemni okrugli bazen sa filter pumpom. Korišten jedno ljeto.', 120.00, cat, 'used',
      ARRAY['https://images.unsplash.com/photo-1416879595882-3373a0480b5b?w=800&h=600&fit=crop'],
      'active', 'Mostar', 43, 3,
      '{"tip":"Nadzemni bazen"}'::jsonb,
      ARRAY['bazen','intex','nadzemni','ljeto','366cm']);
  END IF;

  -- dom-sigurnost
  SELECT id INTO cat FROM categories WHERE slug = 'dom-sigurnost';
  IF cat IS NOT NULL THEN
    INSERT INTO products (seller_id, title, description, price, category_id, condition, images, status, location, views_count, favorites_count, attributes, tags)
    VALUES (seller, 'Hikvision video nadzor komplet 4 kamere', 'Komplet sa 4 kamere, DVR, kablovi. 2MP rezolucija, noćni vid.', 250.00, cat, 'new',
      ARRAY['https://images.unsplash.com/photo-1581578731548-c64695cc6952?w=800&h=600&fit=crop'],
      'active', 'Tuzla', 56, 4,
      '{"tip":"Video nadzor"}'::jsonb,
      ARRAY['hikvision','nadzor','kamere','dvr','sigurnost']);
  END IF;

  -- dom-vodoinstalacije
  SELECT id INTO cat FROM categories WHERE slug = 'dom-vodoinstalacije';
  IF cat IS NOT NULL THEN
    INSERT INTO products (seller_id, title, description, price, category_id, condition, images, status, location, views_count, favorites_count, attributes, tags)
    VALUES (seller, 'Bojler Gorenje 80L', 'Električni bojler 80 litara, vertikalni. Korišten 3 godine, ispravan.', 95.00, cat, 'used',
      ARRAY['https://images.unsplash.com/photo-1581578731548-c64695cc6952?w=800&h=600&fit=crop'],
      'active', 'Banja Luka', 29, 1,
      '{"tip":"Bojler"}'::jsonb,
      ARRAY['bojler','gorenje','80l','elektricni','voda']);
  END IF;

  -- dom-alati
  SELECT id INTO cat FROM categories WHERE slug = 'dom-alati';
  IF cat IS NOT NULL THEN
    INSERT INTO products (seller_id, title, description, price, category_id, condition, images, status, location, views_count, favorites_count, attributes, tags)
    VALUES (seller, 'Bosch akumulatorska bušilica 18V', 'Bosch Professional GSR 18V-55, sa 2 baterije i punjačem u koferu.', 150.00, cat, 'like_new',
      ARRAY['https://images.unsplash.com/photo-1581578731548-c64695cc6952?w=800&h=600&fit=crop'],
      'active', 'Zenica', 72, 5,
      '{"tip":"Bušilica"}'::jsonb,
      ARRAY['bosch','busilica','18v','akumulatorska','professional']);
  END IF;

  -- dom-ostalo
  SELECT id INTO cat FROM categories WHERE slug = 'dom-ostalo';
  IF cat IS NOT NULL THEN
    INSERT INTO products (seller_id, title, description, price, category_id, condition, images, status, location, views_count, favorites_count, attributes, tags)
    VALUES (seller, 'Usisivač robot Xiaomi Roborock S7', 'Robot usisivač sa funkcijom pranja. Odlično navigira. Korišten 6 mjeseci.', 280.00, cat, 'used',
      ARRAY['https://images.unsplash.com/photo-1626806787461-102c1bfaaea1?w=800&h=600&fit=crop'],
      'active', 'Zagreb', 88, 7,
      '{}'::jsonb,
      ARRAY['usisivac','robot','xiaomi','roborock','pranje']);
  END IF;
END $$;

-- ============================================================================
-- 8. ODJECA
-- ============================================================================
DO $$
DECLARE
  seller UUID := '00000000-0000-0000-0000-000000000001';
  cat UUID;
BEGIN
  -- odj-zenska-odjeca
  SELECT id INTO cat FROM categories WHERE slug = 'odj-zenska-odjeca';
  IF cat IS NOT NULL THEN
    INSERT INTO products (seller_id, title, description, price, category_id, condition, images, status, location, views_count, favorites_count, attributes, tags)
    VALUES (seller, 'Zara zimska jakna ženska M', 'Puffer jakna crna, topla za zimu. Nošena jednu sezonu.', 45.00, cat, 'used',
      ARRAY['https://images.unsplash.com/photo-1595777457583-95e059d581b8?w=800&h=600&fit=crop'],
      'active', 'Sarajevo', 89, 6,
      '{"velicina":"M","boja":"Crna","sezona":"Zima","stil":"Casual"}'::jsonb,
      ARRAY['zara','jakna','zimska','zenska','puffer']);
  END IF;

  -- odj-zenska-obuca
  SELECT id INTO cat FROM categories WHERE slug = 'odj-zenska-obuca';
  IF cat IS NOT NULL THEN
    INSERT INTO products (seller_id, title, description, price, category_id, condition, images, status, location, views_count, favorites_count, attributes, tags)
    VALUES (seller, 'Nike Air Max 270 ženske 39', 'Nike tenisice u ružičastoj boji. Nošene par puta, kao nove.', 75.00, cat, 'like_new',
      ARRAY['https://images.unsplash.com/photo-1542291026-7eec264c27ff?w=800&h=600&fit=crop'],
      'active', 'Mostar', 67, 5,
      '{"velicina":"39","boja":"Ružičasta","tip":"Tenisice"}'::jsonb,
      ARRAY['nike','airmax','270','zenske','tenisice']);
  END IF;

  -- odj-muska-odjeca
  SELECT id INTO cat FROM categories WHERE slug = 'odj-muska-odjeca';
  IF cat IS NOT NULL THEN
    INSERT INTO products (seller_id, title, description, price, category_id, condition, images, status, location, views_count, favorites_count, attributes, tags)
    VALUES (seller, 'Hugo Boss odijelo muško 50/L', 'Tamno plavo odijelo, slim fit. Nošeno dva puta na svadbi.', 250.00, cat, 'like_new',
      ARRAY['https://images.unsplash.com/photo-1507679799987-c73779587ccf?w=800&h=600&fit=crop'],
      'active', 'Tuzla', 76, 4,
      '{"velicina":"50/L","boja":"Tamno plava","stil":"Elegantno"}'::jsonb,
      ARRAY['hugo-boss','odijelo','musko','slim-fit','elegantno']);
  END IF;

  -- odj-muska-obuca
  SELECT id INTO cat FROM categories WHERE slug = 'odj-muska-obuca';
  IF cat IS NOT NULL THEN
    INSERT INTO products (seller_id, title, description, price, category_id, condition, images, status, location, views_count, favorites_count, attributes, tags)
    VALUES (seller, 'Adidas Superstar muške 43', 'Klasične Adidas Superstar bijele. Nošene, u dobrom stanju.', 45.00, cat, 'used',
      ARRAY['https://images.unsplash.com/photo-1542291026-7eec264c27ff?w=800&h=600&fit=crop'],
      'active', 'Banja Luka', 54, 3,
      '{"velicina":"43","boja":"Bijela","tip":"Tenisice"}'::jsonb,
      ARRAY['adidas','superstar','muske','bijele','43']);
  END IF;

  -- odj-djecja
  SELECT id INTO cat FROM categories WHERE slug = 'odj-djecja';
  IF cat IS NOT NULL THEN
    INSERT INTO products (seller_id, title, description, price, category_id, condition, images, status, location, views_count, favorites_count, attributes, tags)
    VALUES (seller, 'Dječja zimska jakna 128', 'Topla zimska jakna za dječaka, vel. 128. Nošena jednu sezonu.', 25.00, cat, 'used',
      ARRAY['https://images.unsplash.com/photo-1595777457583-95e059d581b8?w=800&h=600&fit=crop'],
      'active', 'Zenica', 34, 2,
      '{"velicina":"128","boja":"Plava","sezona":"Zima","uzrast":"4-6 godina","spol":"Dječaci"}'::jsonb,
      ARRAY['djecja','jakna','zimska','128','djecak']);
  END IF;

  -- odj-sportska
  SELECT id INTO cat FROM categories WHERE slug = 'odj-sportska';
  IF cat IS NOT NULL THEN
    INSERT INTO products (seller_id, title, description, price, category_id, condition, images, status, location, views_count, favorites_count, attributes, tags)
    VALUES (seller, 'Nike Dri-FIT trenerka komplet L', 'Nike komplet trenerke, crna. Za trening ili slobodno vrijeme.', 65.00, cat, 'like_new',
      ARRAY['https://images.unsplash.com/photo-1534438327276-14e5300c3a48?w=800&h=600&fit=crop'],
      'active', 'Zagreb', 45, 3,
      '{"velicina":"L","boja":"Crna","sport":"Fitness","materijal":"Poliester"}'::jsonb,
      ARRAY['nike','trenerka','drifit','sportska','komplet']);
  END IF;

  -- odj-nakit
  SELECT id INTO cat FROM categories WHERE slug = 'odj-nakit';
  IF cat IS NOT NULL THEN
    INSERT INTO products (seller_id, title, description, price, category_id, condition, images, status, location, views_count, favorites_count, attributes, tags)
    VALUES (seller, 'Srebrna ogrlica sa privjeskom srce', 'Sterling srebro 925, ogrlica 45cm sa privjeskom u obliku srca.', 35.00, cat, 'new',
      ARRAY['https://images.unsplash.com/photo-1515562141589-67f0d7b90fb2?w=800&h=600&fit=crop'],
      'active', 'Split', 78, 6,
      '{"tip":"Ogrlica","materijal":"Srebro 925"}'::jsonb,
      ARRAY['ogrlica','srebrna','srce','925','nakit']);
  END IF;

  -- odj-torbe
  SELECT id INTO cat FROM categories WHERE slug = 'odj-torbe';
  IF cat IS NOT NULL THEN
    INSERT INTO products (seller_id, title, description, price, category_id, condition, images, status, location, views_count, favorites_count, attributes, tags)
    VALUES (seller, 'Michael Kors ženska torba', 'MK torbica, smeđa boja sa zlatnim detaljima. Korištena, u odličnom stanju.', 120.00, cat, 'used',
      ARRAY['https://images.unsplash.com/photo-1595777457583-95e059d581b8?w=800&h=600&fit=crop'],
      'active', 'Travnik', 56, 4,
      '{"tip":"Ručna torba","materijal":"Koža"}'::jsonb,
      ARRAY['michael-kors','torba','zenska','smeda','mk']);
  END IF;

  -- odj-naocale
  SELECT id INTO cat FROM categories WHERE slug = 'odj-naocale';
  IF cat IS NOT NULL THEN
    INSERT INTO products (seller_id, title, description, price, category_id, condition, images, status, location, views_count, favorites_count, attributes, tags)
    VALUES (seller, 'Ray-Ban Aviator sunčane naočale', 'Originalne Ray-Ban Aviator, zlatni okvir, zelena stakla. Sa etuijem.', 95.00, cat, 'like_new',
      ARRAY['https://images.unsplash.com/photo-1515562141589-67f0d7b90fb2?w=800&h=600&fit=crop'],
      'active', 'Bihać', 43, 3,
      '{"tip":"Sunčane","materijal":"Metal"}'::jsonb,
      ARRAY['rayban','aviator','suncane','naocale','zlatne']);
  END IF;

  -- odj-radna
  SELECT id INTO cat FROM categories WHERE slug = 'odj-radna';
  IF cat IS NOT NULL THEN
    INSERT INTO products (seller_id, title, description, price, category_id, condition, images, status, location, views_count, favorites_count, attributes, tags)
    VALUES (seller, 'Radne cipele S3 čelični vrh 44', 'Sigurnosne radne cipele, čelični vrh, vodootporne. Nove u kutiji.', 55.00, cat, 'new',
      ARRAY['https://images.unsplash.com/photo-1542291026-7eec264c27ff?w=800&h=600&fit=crop'],
      'active', 'Bijeljina', 27, 1,
      '{"velicina":"44","tip":"Radne cipele"}'::jsonb,
      ARRAY['radne','cipele','s3','celicni','sigurnosne']);
  END IF;

  -- odj-maskare
  SELECT id INTO cat FROM categories WHERE slug = 'odj-maskare';
  IF cat IS NOT NULL THEN
    INSERT INTO products (seller_id, title, description, price, category_id, condition, images, status, location, views_count, favorites_count, attributes, tags)
    VALUES (seller, 'Halloween kostim vještica M', 'Komplet kostim za Halloween, vještica sa šeširom. Nošen jednom.', 20.00, cat, 'like_new',
      ARRAY['https://images.unsplash.com/photo-1595777457583-95e059d581b8?w=800&h=600&fit=crop'],
      'active', 'Sarajevo', 15, 1,
      '{"velicina":"M","tip":"Kostim"}'::jsonb,
      ARRAY['halloween','kostim','vjestica','maskara','sesir']);
  END IF;

  -- odj-ostalo
  SELECT id INTO cat FROM categories WHERE slug = 'odj-ostalo';
  IF cat IS NOT NULL THEN
    INSERT INTO products (seller_id, title, description, price, category_id, condition, images, status, location, views_count, favorites_count, attributes, tags)
    VALUES (seller, 'Kišobran automatski veliki', 'Veliki automatski kišobran, otporan na vjetar. Crni. Nov.', 15.00, cat, 'new',
      ARRAY['https://images.unsplash.com/photo-1595777457583-95e059d581b8?w=800&h=600&fit=crop'],
      'active', 'Mostar', 21, 0,
      '{}'::jsonb,
      ARRAY['kisobran','automatski','crni','vjetar']);
  END IF;
END $$;

-- ============================================================================
-- 9. SPORT
-- ============================================================================
DO $$
DECLARE
  seller UUID := '00000000-0000-0000-0000-000000000001';
  cat UUID;
BEGIN
  -- spt-fitness
  SELECT id INTO cat FROM categories WHERE slug = 'spt-fitness';
  IF cat IS NOT NULL THEN
    INSERT INTO products (seller_id, title, description, price, category_id, condition, images, status, location, views_count, favorites_count, attributes, tags)
    VALUES (seller, 'Set bučica 2x20kg podesive', 'Podesive bučice od 2 do 20kg. Čelične, sa gumenim oblogama.', 120.00, cat, 'like_new',
      ARRAY['https://images.unsplash.com/photo-1534438327276-14e5300c3a48?w=800&h=600&fit=crop'],
      'active', 'Sarajevo', 87, 7,
      '{"tip":"Bučice","sport":"Fitness"}'::jsonb,
      ARRAY['bucice','podesive','20kg','fitness','celicne']);
  END IF;

  -- spt-biciklizam
  SELECT id INTO cat FROM categories WHERE slug = 'spt-biciklizam';
  IF cat IS NOT NULL THEN
    INSERT INTO products (seller_id, title, description, price, category_id, condition, images, status, location, views_count, favorites_count, attributes, tags)
    VALUES (seller, 'Biciklistička kaciga Giro vel. L', 'Giro Register MIPS kaciga, bijela. Korištena jednu sezonu.', 45.00, cat, 'used',
      ARRAY['https://images.unsplash.com/photo-1485965120184-e220f721d03e?w=800&h=600&fit=crop'],
      'active', 'Mostar', 34, 2,
      '{"tip":"Kaciga","velicina":"L","sport":"Biciklizam"}'::jsonb,
      ARRAY['kaciga','giro','bicikl','mips','bijela']);
  END IF;

  -- spt-nogomet
  SELECT id INTO cat FROM categories WHERE slug = 'spt-nogomet';
  IF cat IS NOT NULL THEN
    INSERT INTO products (seller_id, title, description, price, category_id, condition, images, status, location, views_count, favorites_count, attributes, tags)
    VALUES (seller, 'Adidas Predator kopačke 42', 'Adidas Predator Edge.1 FG, crne. Korištene jednu sezonu.', 85.00, cat, 'used',
      ARRAY['https://images.unsplash.com/photo-1431324155629-1a6deb1dec8d?w=800&h=600&fit=crop'],
      'active', 'Tuzla', 76, 5,
      '{"tip":"Kopačke","velicina":"42","sport":"Nogomet"}'::jsonb,
      ARRAY['adidas','predator','kopacke','42','nogomet']);
  END IF;

  -- spt-timski
  SELECT id INTO cat FROM categories WHERE slug = 'spt-timski';
  IF cat IS NOT NULL THEN
    INSERT INTO products (seller_id, title, description, price, category_id, condition, images, status, location, views_count, favorites_count, attributes, tags)
    VALUES (seller, 'Spalding NBA košarkaška lopta', 'Originalna Spalding lopta, veličina 7. Korištena za trening.', 30.00, cat, 'used',
      ARRAY['https://images.unsplash.com/photo-1431324155629-1a6deb1dec8d?w=800&h=600&fit=crop'],
      'active', 'Banja Luka', 43, 2,
      '{"tip":"Lopta","sport":"Košarka"}'::jsonb,
      ARRAY['spalding','lopta','kosarka','nba','trening']);
  END IF;

  -- spt-tenis
  SELECT id INTO cat FROM categories WHERE slug = 'spt-tenis';
  IF cat IS NOT NULL THEN
    INSERT INTO products (seller_id, title, description, price, category_id, condition, images, status, location, views_count, favorites_count, attributes, tags)
    VALUES (seller, 'Wilson Blade 98 teniski reket', 'Wilson Blade v8, 305g. Korišten 6 mjeseci. Sa torbicom.', 120.00, cat, 'used',
      ARRAY['https://images.unsplash.com/photo-1534438327276-14e5300c3a48?w=800&h=600&fit=crop'],
      'active', 'Zenica', 56, 4,
      '{"tip":"Reket","sport":"Tenis"}'::jsonb,
      ARRAY['wilson','blade','reket','tenis','305g']);
  END IF;

  -- spt-zimski
  SELECT id INTO cat FROM categories WHERE slug = 'spt-zimski';
  IF cat IS NOT NULL THEN
    INSERT INTO products (seller_id, title, description, price, category_id, condition, images, status, location, views_count, favorites_count, attributes, tags)
    VALUES (seller, 'Atomic skije 170cm sa vezovima', 'Atomic Redster X7, 170cm, sa Atomic vezovima. Korištene 2 sezone.', 250.00, cat, 'used',
      ARRAY['https://images.unsplash.com/photo-1551524559-8af4e6624178?w=800&h=600&fit=crop'],
      'active', 'Sarajevo', 98, 8,
      '{"tip":"Skije","velicina":"170cm","sport":"Skijanje"}'::jsonb,
      ARRAY['atomic','skije','170cm','redster','vezovi']);
  END IF;

  -- spt-vodeni
  SELECT id INTO cat FROM categories WHERE slug = 'spt-vodeni';
  IF cat IS NOT NULL THEN
    INSERT INTO products (seller_id, title, description, price, category_id, condition, images, status, location, views_count, favorites_count, attributes, tags)
    VALUES (seller, 'SUP daska na napuhavanje 320cm', 'Stand-up paddle daska sa veslom i pumpom. Korištena jedno ljeto.', 180.00, cat, 'used',
      ARRAY['https://images.unsplash.com/photo-1544551763-46a013bb70d5?w=800&h=600&fit=crop'],
      'active', 'Split', 67, 5,
      '{"tip":"SUP daska","sport":"Vodeni sportovi"}'::jsonb,
      ARRAY['sup','daska','paddle','napuhavanje','veslo']);
  END IF;

  -- spt-planinarenje
  SELECT id INTO cat FROM categories WHERE slug = 'spt-planinarenje';
  IF cat IS NOT NULL THEN
    INSERT INTO products (seller_id, title, description, price, category_id, condition, images, status, location, views_count, favorites_count, attributes, tags)
    VALUES (seller, 'Deuter ruksak 50+10L', 'Planinarski ruksak Deuter Aircontact Lite, 50+10L. Odlično stanje.', 95.00, cat, 'used',
      ARRAY['https://images.unsplash.com/photo-1551524559-8af4e6624178?w=800&h=600&fit=crop'],
      'active', 'Zagreb', 45, 3,
      '{"tip":"Ruksak","sport":"Planinarenje"}'::jsonb,
      ARRAY['deuter','ruksak','50l','planinarski','aircontact']);
  END IF;

  -- spt-ribolov
  SELECT id INTO cat FROM categories WHERE slug = 'spt-ribolov';
  IF cat IS NOT NULL THEN
    INSERT INTO products (seller_id, title, description, price, category_id, condition, images, status, location, views_count, favorites_count, attributes, tags)
    VALUES (seller, 'Shimano štap za ribolov 3.6m', 'Shimano Catana teleskopski štap, 3.6m. Sa Shimano rolom. Korišten.', 75.00, cat, 'used',
      ARRAY['https://images.unsplash.com/photo-1544551763-46a013bb70d5?w=800&h=600&fit=crop'],
      'active', 'Travnik', 32, 2,
      '{"tip":"Štap","sport":"Ribolov"}'::jsonb,
      ARRAY['shimano','stap','ribolov','catana','teleskopski']);
  END IF;

  -- spt-borilacki
  SELECT id INTO cat FROM categories WHERE slug = 'spt-borilacki';
  IF cat IS NOT NULL THEN
    INSERT INTO products (seller_id, title, description, price, category_id, condition, images, status, location, views_count, favorites_count, attributes, tags)
    VALUES (seller, 'Venum bokserske rukavice 12oz', 'Venum Challenger 3.0, crno-zlatne. Korištene za trening.', 40.00, cat, 'used',
      ARRAY['https://images.unsplash.com/photo-1534438327276-14e5300c3a48?w=800&h=600&fit=crop'],
      'active', 'Bihać', 28, 1,
      '{"tip":"Rukavice","velicina":"12oz","sport":"Boks"}'::jsonb,
      ARRAY['venum','rukavice','boks','12oz','challenger']);
  END IF;

  -- spt-golf
  SELECT id INTO cat FROM categories WHERE slug = 'spt-golf';
  IF cat IS NOT NULL THEN
    INSERT INTO products (seller_id, title, description, price, category_id, condition, images, status, location, views_count, favorites_count, attributes, tags)
    VALUES (seller, 'Callaway golf set komplet', 'Callaway Strata komplet sa 12 palica i torbom. Za početnike.', 350.00, cat, 'like_new',
      ARRAY['https://images.unsplash.com/photo-1534438327276-14e5300c3a48?w=800&h=600&fit=crop'],
      'active', 'Bijeljina', 19, 2,
      '{"tip":"Komplet palica","sport":"Golf"}'::jsonb,
      ARRAY['callaway','golf','set','palice','pocetnik']);
  END IF;

  -- spt-airsoft
  SELECT id INTO cat FROM categories WHERE slug = 'spt-airsoft';
  IF cat IS NOT NULL THEN
    INSERT INTO products (seller_id, title, description, price, category_id, condition, images, status, location, views_count, favorites_count, attributes, tags)
    VALUES (seller, 'Airsoft puška M4 električna', 'G&G CM16 Raider, AEG. Sa baterijom i punjačem. Odlično stanje.', 150.00, cat, 'used',
      ARRAY['https://images.unsplash.com/photo-1534438327276-14e5300c3a48?w=800&h=600&fit=crop'],
      'active', 'Sarajevo', 54, 4,
      '{"tip":"Puška","sport":"Airsoft"}'::jsonb,
      ARRAY['airsoft','m4','gg','aeg','elektricna']);
  END IF;

  -- spt-koturaljke
  SELECT id INTO cat FROM categories WHERE slug = 'spt-koturaljke';
  IF cat IS NOT NULL THEN
    INSERT INTO products (seller_id, title, description, price, category_id, condition, images, status, location, views_count, favorites_count, attributes, tags)
    VALUES (seller, 'Roleri Rollerblade Zetrablade 43', 'Inline roleri, vel. 43. Korišteni jednu sezonu, očuvani.', 65.00, cat, 'used',
      ARRAY['https://images.unsplash.com/photo-1534438327276-14e5300c3a48?w=800&h=600&fit=crop'],
      'active', 'Mostar', 34, 2,
      '{"tip":"Roleri","velicina":"43"}'::jsonb,
      ARRAY['roleri','rollerblade','43','inline','zetrablade']);
  END IF;

  -- spt-dresovi
  SELECT id INTO cat FROM categories WHERE slug = 'spt-dresovi';
  IF cat IS NOT NULL THEN
    INSERT INTO products (seller_id, title, description, price, category_id, condition, images, status, location, views_count, favorites_count, attributes, tags)
    VALUES (seller, 'FK Sarajevo dres 2024 L', 'Originalni dres FK Sarajevo, sezona 2023/24. Veličina L. Nov sa etiketom.', 55.00, cat, 'new',
      ARRAY['https://images.unsplash.com/photo-1431324155629-1a6deb1dec8d?w=800&h=600&fit=crop'],
      'active', 'Sarajevo', 87, 7,
      '{"tip":"Dres","velicina":"L","sport":"Nogomet"}'::jsonb,
      ARRAY['dres','fk-sarajevo','2024','nogomet','originalni']);
  END IF;

  -- spt-ostalo
  SELECT id INTO cat FROM categories WHERE slug = 'spt-ostalo';
  IF cat IS NOT NULL THEN
    INSERT INTO products (seller_id, title, description, price, category_id, condition, images, status, location, views_count, favorites_count, attributes, tags)
    VALUES (seller, 'Šator za kampovanje 4 osobe', 'Iglu šator za 4 osobe, vodootporan. Sa podlogom i torbom.', 85.00, cat, 'used',
      ARRAY['https://images.unsplash.com/photo-1523987355523-c7b5b0dd90a7?w=800&h=600&fit=crop'],
      'active', 'Tuzla', 43, 3,
      '{}'::jsonb,
      ARRAY['sator','kampovanje','4osobe','iglu','vodootporan']);
  END IF;
END $$;

-- ============================================================================
-- 10. DJECA I BEBE
-- ============================================================================
DO $$
DECLARE
  seller UUID := '00000000-0000-0000-0000-000000000001';
  cat UUID;
BEGIN
  -- djc-oprema-bebe
  SELECT id INTO cat FROM categories WHERE slug = 'djc-oprema-bebe';
  IF cat IS NOT NULL THEN
    INSERT INTO products (seller_id, title, description, price, category_id, condition, images, status, location, views_count, favorites_count, attributes, tags)
    VALUES (seller, 'Chicco kolica 3u1 komplet', 'Chicco Trio Best Friend, kolica + auto sjedalica + nosiljka. Siva boja.', 350.00, cat, 'used',
      ARRAY['https://images.unsplash.com/photo-1586048018645-f4e8e5b0b4cd?w=800&h=600&fit=crop'],
      'active', 'Sarajevo', 123, 10,
      '{"tip":"Kolica","marka":"Chicco","uzrast":"0-3 godine"}'::jsonb,
      ARRAY['chicco','kolica','3u1','beba','sjedalica']);
  END IF;

  -- djc-igracke
  SELECT id INTO cat FROM categories WHERE slug = 'djc-igracke';
  IF cat IS NOT NULL THEN
    INSERT INTO products (seller_id, title, description, price, category_id, condition, images, status, location, views_count, favorites_count, attributes, tags)
    VALUES (seller, 'LEGO Technic Ferrari 488 GTE', 'LEGO Technic set 42125, novo u zatvorenoj kutiji. Odličan poklon.', 45.00, cat, 'new',
      ARRAY['https://images.unsplash.com/photo-1558060370-d644479cb6f7?w=800&h=600&fit=crop'],
      'active', 'Mostar', 89, 7,
      '{"tip":"LEGO","marka":"LEGO","uzrast":"10+ godina"}'::jsonb,
      ARRAY['lego','technic','ferrari','igracka','poklon']);
  END IF;

  -- djc-bicikli
  SELECT id INTO cat FROM categories WHERE slug = 'djc-bicikli';
  IF cat IS NOT NULL THEN
    INSERT INTO products (seller_id, title, description, price, category_id, condition, images, status, location, views_count, favorites_count, attributes, tags)
    VALUES (seller, 'Dječji bicikl 16" sa pomoćnim kotačima', 'Bicikl za djecu 4-6 godina, plavi. Sa pomoćnim kotačima i košaricom.', 65.00, cat, 'used',
      ARRAY['https://images.unsplash.com/photo-1485965120184-e220f721d03e?w=800&h=600&fit=crop'],
      'active', 'Tuzla', 56, 4,
      '{"tip":"Bicikl","velicina":"16\"","uzrast":"4-6 godina","boja":"Plava","spol":"Dječaci"}'::jsonb,
      ARRAY['bicikl','djecji','16','pomocni-kotaci','plavi']);
  END IF;

  -- djc-odjeca
  SELECT id INTO cat FROM categories WHERE slug = 'djc-odjeca';
  IF cat IS NOT NULL THEN
    INSERT INTO products (seller_id, title, description, price, category_id, condition, images, status, location, views_count, favorites_count, attributes, tags)
    VALUES (seller, 'Paket dječje odjeće 92-98', 'Paket od 15 komada, majice, hlače, piđame. Za djevojčicu.', 30.00, cat, 'used',
      ARRAY['https://images.unsplash.com/photo-1586048018645-f4e8e5b0b4cd?w=800&h=600&fit=crop'],
      'active', 'Banja Luka', 45, 3,
      '{"tip":"Paket odjeće","velicina":"92-98","uzrast":"2-3 godine","spol":"Djevojčice"}'::jsonb,
      ARRAY['djecja','odjeca','paket','92-98','djevojcica']);
  END IF;

  -- djc-knjige
  SELECT id INTO cat FROM categories WHERE slug = 'djc-knjige';
  IF cat IS NOT NULL THEN
    INSERT INTO products (seller_id, title, description, price, category_id, condition, images, status, location, views_count, favorites_count, attributes, tags)
    VALUES (seller, 'Set dječjih knjiga - Bajke 10 komada', 'Set od 10 ilustrovanih bajki na bosanskom jeziku. Očuvane.', 20.00, cat, 'used',
      ARRAY['https://images.unsplash.com/photo-1495446815901-a7297e633e8d?w=800&h=600&fit=crop'],
      'active', 'Zenica', 34, 2,
      '{"tip":"Knjige","uzrast":"3-6 godina"}'::jsonb,
      ARRAY['knjige','djecje','bajke','ilustrovane','bosanski']);
  END IF;

  -- djc-ostalo
  SELECT id INTO cat FROM categories WHERE slug = 'djc-ostalo';
  IF cat IS NOT NULL THEN
    INSERT INTO products (seller_id, title, description, price, category_id, condition, images, status, location, views_count, favorites_count, attributes, tags)
    VALUES (seller, 'Dječji trampolina 140cm', 'Trampolina sa zaštitnom mrežom, prečnik 140cm. Za unutra i vani.', 75.00, cat, 'like_new',
      ARRAY['https://images.unsplash.com/photo-1558060370-d644479cb6f7?w=800&h=600&fit=crop'],
      'active', 'Zagreb', 43, 3,
      '{}'::jsonb,
      ARRAY['trampolina','djecja','140cm','mreza','igra']);
  END IF;
END $$;

-- ============================================================================
-- 11. GLAZBA
-- ============================================================================
DO $$
DECLARE
  seller UUID := '00000000-0000-0000-0000-000000000001';
  cat UUID;
BEGIN
  -- glz-gitare
  SELECT id INTO cat FROM categories WHERE slug = 'glz-gitare';
  IF cat IS NOT NULL THEN
    INSERT INTO products (seller_id, title, description, price, category_id, condition, images, status, location, views_count, favorites_count, attributes, tags)
    VALUES (seller, 'Fender Stratocaster MIM električna gitara', 'Fender Player Stratocaster, 3-Color Sunburst. Meksički model. Odlično stanje.', 650.00, cat, 'used',
      ARRAY['https://images.unsplash.com/photo-1510915361894-db8b60106cb1?w=800&h=600&fit=crop'],
      'active', 'Sarajevo', 112, 9,
      '{"tip":"Električna gitara","marka":"Fender"}'::jsonb,
      ARRAY['fender','stratocaster','gitara','elektricna','sunburst']);
  END IF;

  -- glz-bubnjevi
  SELECT id INTO cat FROM categories WHERE slug = 'glz-bubnjevi';
  IF cat IS NOT NULL THEN
    INSERT INTO products (seller_id, title, description, price, category_id, condition, images, status, location, views_count, favorites_count, attributes, tags)
    VALUES (seller, 'Yamaha DTX402K elektronski bubnjevi', 'Yamaha elektronski set, idealan za učenje. Sa stolcem i palicama.', 350.00, cat, 'used',
      ARRAY['https://images.unsplash.com/photo-1510915361894-db8b60106cb1?w=800&h=600&fit=crop'],
      'active', 'Mostar', 67, 5,
      '{"tip":"Elektronski bubnjevi","marka":"Yamaha"}'::jsonb,
      ARRAY['yamaha','bubnjevi','elektronski','dtx','ucenje']);
  END IF;

  -- glz-klavijature
  SELECT id INTO cat FROM categories WHERE slug = 'glz-klavijature';
  IF cat IS NOT NULL THEN
    INSERT INTO products (seller_id, title, description, price, category_id, condition, images, status, location, views_count, favorites_count, attributes, tags)
    VALUES (seller, 'Yamaha P-125 digitalni klavir', 'Yamaha P-125 sa GHS tipkama, 88 tipki. Sa stalkom i pedalom.', 450.00, cat, 'like_new',
      ARRAY['https://images.unsplash.com/photo-1520523839897-bd0b52f945a0?w=800&h=600&fit=crop'],
      'active', 'Tuzla', 78, 6,
      '{"tip":"Digitalni klavir","marka":"Yamaha","brojTipki":88}'::jsonb,
      ARRAY['yamaha','p125','klavir','digitalni','88tipki']);
  END IF;

  -- glz-puhacki
  SELECT id INTO cat FROM categories WHERE slug = 'glz-puhacki';
  IF cat IS NOT NULL THEN
    INSERT INTO products (seller_id, title, description, price, category_id, condition, images, status, location, views_count, favorites_count, attributes, tags)
    VALUES (seller, 'Yamaha YAS-280 alt saksofon', 'Yamaha studentski alt saksofon, zlatni lak. Sa koferom.', 550.00, cat, 'used',
      ARRAY['https://images.unsplash.com/photo-1510915361894-db8b60106cb1?w=800&h=600&fit=crop'],
      'active', 'Banja Luka', 34, 3,
      '{"tip":"Saksofon","marka":"Yamaha"}'::jsonb,
      ARRAY['yamaha','saksofon','alt','studentski','puhacki']);
  END IF;

  -- glz-gudacki
  SELECT id INTO cat FROM categories WHERE slug = 'glz-gudacki';
  IF cat IS NOT NULL THEN
    INSERT INTO products (seller_id, title, description, price, category_id, condition, images, status, location, views_count, favorites_count, attributes, tags)
    VALUES (seller, 'Violina 4/4 sa koferom', 'Kompletna violina 4/4, sa gudalom i koferom. Za studente.', 180.00, cat, 'used',
      ARRAY['https://images.unsplash.com/photo-1510915361894-db8b60106cb1?w=800&h=600&fit=crop'],
      'active', 'Zenica', 23, 1,
      '{"tip":"Violina","velicina":"4/4"}'::jsonb,
      ARRAY['violina','4/4','gudacki','kofer','student']);
  END IF;

  -- glz-tambure
  SELECT id INTO cat FROM categories WHERE slug = 'glz-tambure';
  IF cat IS NOT NULL THEN
    INSERT INTO products (seller_id, title, description, price, category_id, condition, images, status, location, views_count, favorites_count, attributes, tags)
    VALUES (seller, 'Tamburica bisernica ručni rad', 'Ručno rađena bisernica od javora. Prelijep zvuk. Očuvana.', 200.00, cat, 'used',
      ARRAY['https://images.unsplash.com/photo-1510915361894-db8b60106cb1?w=800&h=600&fit=crop'],
      'active', 'Split', 28, 2,
      '{"tip":"Bisernica","marka":"Ručni rad"}'::jsonb,
      ARRAY['tamburica','bisernica','rucni-rad','javor','narodna']);
  END IF;

  -- glz-pa-sustavi
  SELECT id INTO cat FROM categories WHERE slug = 'glz-pa-sustavi';
  IF cat IS NOT NULL THEN
    INSERT INTO products (seller_id, title, description, price, category_id, condition, images, status, location, views_count, favorites_count, attributes, tags)
    VALUES (seller, 'QSC K12.2 aktivni zvučnik', 'QSC K12.2, 2000W, 12". Korišten za svirke. Par komada.', 800.00, cat, 'used',
      ARRAY['https://images.unsplash.com/photo-1510915361894-db8b60106cb1?w=800&h=600&fit=crop'],
      'active', 'Travnik', 45, 4,
      '{"tip":"Aktivni zvučnik","marka":"QSC","snaga":2000}'::jsonb,
      ARRAY['qsc','k12','zvucnik','pa','aktivni']);
  END IF;

  -- glz-studio
  SELECT id INTO cat FROM categories WHERE slug = 'glz-studio';
  IF cat IS NOT NULL THEN
    INSERT INTO products (seller_id, title, description, price, category_id, condition, images, status, location, views_count, favorites_count, attributes, tags)
    VALUES (seller, 'Focusrite Scarlett 2i2 3rd Gen', 'USB audio interface, 2 ulaza, 2 izlaza. Sa kablom. Kao nov.', 110.00, cat, 'like_new',
      ARRAY['https://images.unsplash.com/photo-1510915361894-db8b60106cb1?w=800&h=600&fit=crop'],
      'active', 'Bihać', 56, 3,
      '{"tip":"Audio interface","marka":"Focusrite"}'::jsonb,
      ARRAY['focusrite','scarlett','2i2','interface','studio']);
  END IF;

  -- glz-dj
  SELECT id INTO cat FROM categories WHERE slug = 'glz-dj';
  IF cat IS NOT NULL THEN
    INSERT INTO products (seller_id, title, description, price, category_id, condition, images, status, location, views_count, favorites_count, attributes, tags)
    VALUES (seller, 'Pioneer DDJ-400 DJ kontroler', 'Pioneer DJ kontroler za Rekordbox. Idealan za početnike. Sa licencom.', 180.00, cat, 'used',
      ARRAY['https://images.unsplash.com/photo-1510915361894-db8b60106cb1?w=800&h=600&fit=crop'],
      'active', 'Bijeljina', 67, 5,
      '{"tip":"DJ kontroler","marka":"Pioneer"}'::jsonb,
      ARRAY['pioneer','ddj400','dj','kontroler','rekordbox']);
  END IF;

  -- glz-ostalo
  SELECT id INTO cat FROM categories WHERE slug = 'glz-ostalo';
  IF cat IS NOT NULL THEN
    INSERT INTO products (seller_id, title, description, price, category_id, condition, images, status, location, views_count, favorites_count, attributes, tags)
    VALUES (seller, 'Stalak za note sklopivi', 'Metalni stalak za note, podesiva visina. Nov u kutiji.', 15.00, cat, 'new',
      ARRAY['https://images.unsplash.com/photo-1510915361894-db8b60106cb1?w=800&h=600&fit=crop'],
      'active', 'Sarajevo', 19, 0,
      '{}'::jsonb,
      ARRAY['stalak','note','sklopivi','metalni','muzika']);
  END IF;
END $$;

-- ============================================================================
-- 12. LITERATURA
-- ============================================================================
DO $$
DECLARE
  seller UUID := '00000000-0000-0000-0000-000000000001';
  cat UUID;
BEGIN
  -- lit-beletristika
  SELECT id INTO cat FROM categories WHERE slug = 'lit-beletristika';
  IF cat IS NOT NULL THEN
    INSERT INTO products (seller_id, title, description, price, category_id, condition, images, status, location, views_count, favorites_count, attributes, tags)
    VALUES (seller, 'Meša Selimović - Derviš i smrt', 'Klasik bosanske književnosti. Tvrdi uvez, očuvano izdanje.', 12.00, cat, 'used',
      ARRAY['https://images.unsplash.com/photo-1495446815901-a7297e633e8d?w=800&h=600&fit=crop'],
      'active', 'Sarajevo', 78, 5,
      '{"zanr":"Romani","jezik":"Bosanski","pismo":"Latinica"}'::jsonb,
      ARRAY['selimovic','dervis','smrt','roman','klasik']);
  END IF;

  -- lit-strucna
  SELECT id INTO cat FROM categories WHERE slug = 'lit-strucna';
  IF cat IS NOT NULL THEN
    INSERT INTO products (seller_id, title, description, price, category_id, condition, images, status, location, views_count, favorites_count, attributes, tags)
    VALUES (seller, 'Udžbenik Elektrotehnike za fakultet', 'Komplet udžbenika iz osnova elektrotehnike. 3 knjige.', 25.00, cat, 'used',
      ARRAY['https://images.unsplash.com/photo-1495446815901-a7297e633e8d?w=800&h=600&fit=crop'],
      'active', 'Mostar', 34, 2,
      '{"podrucje":"Elektrotehnika","jezik":"Bosanski","pismo":"Latinica"}'::jsonb,
      ARRAY['udzbenici','elektrotehnika','fakultet','strucna']);
  END IF;

  -- lit-djecje
  SELECT id INTO cat FROM categories WHERE slug = 'lit-djecje';
  IF cat IS NOT NULL THEN
    INSERT INTO products (seller_id, title, description, price, category_id, condition, images, status, location, views_count, favorites_count, attributes, tags)
    VALUES (seller, 'Harry Potter komplet 1-7 bosanski', 'Komplet svih 7 knjiga Harry Pottera na bosanskom jeziku. Očuvane.', 45.00, cat, 'used',
      ARRAY['https://images.unsplash.com/photo-1495446815901-a7297e633e8d?w=800&h=600&fit=crop'],
      'active', 'Tuzla', 98, 8,
      '{"zanr":"Fantastika","jezik":"Bosanski","uzrast":"8+ godina"}'::jsonb,
      ARRAY['harry-potter','komplet','bosanski','djecje','fantastika']);
  END IF;

  -- lit-antikvarne
  SELECT id INTO cat FROM categories WHERE slug = 'lit-antikvarne';
  IF cat IS NOT NULL THEN
    INSERT INTO products (seller_id, title, description, price, category_id, condition, images, status, location, views_count, favorites_count, attributes, tags)
    VALUES (seller, 'Ivo Andrić - Na Drini ćuprija 1945', 'Prvo izdanje iz 1945. godine. Kolekcionarski primjerak.', 150.00, cat, 'used',
      ARRAY['https://images.unsplash.com/photo-1495446815901-a7297e633e8d?w=800&h=600&fit=crop'],
      'active', 'Banja Luka', 45, 6,
      '{"zanr":"Romani","jezik":"Srpski","pismo":"Ćirilica"}'::jsonb,
      ARRAY['andric','drina','cuprija','antikvarno','1945']);
  END IF;

  -- lit-casopisi
  SELECT id INTO cat FROM categories WHERE slug = 'lit-casopisi';
  IF cat IS NOT NULL THEN
    INSERT INTO products (seller_id, title, description, price, category_id, condition, images, status, location, views_count, favorites_count, attributes, tags)
    VALUES (seller, 'National Geographic kolekcija 2020-2023', 'Komplet National Geographic časopisa, 36 brojeva. Očuvani.', 40.00, cat, 'used',
      ARRAY['https://images.unsplash.com/photo-1495446815901-a7297e633e8d?w=800&h=600&fit=crop'],
      'active', 'Zenica', 23, 1,
      '{"tip":"Časopis","jezik":"Engleski"}'::jsonb,
      ARRAY['national-geographic','casopis','kolekcija','2020','engleski']);
  END IF;

  -- lit-stripovi
  SELECT id INTO cat FROM categories WHERE slug = 'lit-stripovi';
  IF cat IS NOT NULL THEN
    INSERT INTO products (seller_id, title, description, price, category_id, condition, images, status, location, views_count, favorites_count, attributes, tags)
    VALUES (seller, 'Alan Ford kolekcija 50 brojeva', 'Kolekcija Alan Ford stripova, brojevi 1-50. Dobro očuvani.', 80.00, cat, 'used',
      ARRAY['https://images.unsplash.com/photo-1495446815901-a7297e633e8d?w=800&h=600&fit=crop'],
      'active', 'Zagreb', 56, 4,
      '{"zanr":"Humor","jezik":"Hrvatski"}'::jsonb,
      ARRAY['alan-ford','strip','kolekcija','humor','50brojeva']);
  END IF;

  -- lit-filmovi
  SELECT id INTO cat FROM categories WHERE slug = 'lit-filmovi';
  IF cat IS NOT NULL THEN
    INSERT INTO products (seller_id, title, description, price, category_id, condition, images, status, location, views_count, favorites_count, attributes, tags)
    VALUES (seller, 'Blu-ray kolekcija Marvel MCU 20 filmova', 'Komplet MCU filmova na Blu-ray. Infinity Saga. Originalni.', 120.00, cat, 'like_new',
      ARRAY['https://images.unsplash.com/photo-1612287230202-1ff1d85d1bdf?w=800&h=600&fit=crop'],
      'active', 'Split', 67, 5,
      '{"format":"Blu-ray","zanr":"Akcija"}'::jsonb,
      ARRAY['marvel','mcu','bluray','kolekcija','filmovi']);
  END IF;

  -- lit-glazba-mediji
  SELECT id INTO cat FROM categories WHERE slug = 'lit-glazba-mediji';
  IF cat IS NOT NULL THEN
    INSERT INTO products (seller_id, title, description, price, category_id, condition, images, status, location, views_count, favorites_count, attributes, tags)
    VALUES (seller, 'Vinyl kolekcija rock klasika 20LP', 'Kolekcija od 20 vinyl ploča - Led Zeppelin, Pink Floyd, Beatles itd.', 200.00, cat, 'used',
      ARRAY['https://images.unsplash.com/photo-1510915361894-db8b60106cb1?w=800&h=600&fit=crop'],
      'active', 'Travnik', 89, 7,
      '{"format":"Vinyl","zanr":"Rock"}'::jsonb,
      ARRAY['vinyl','ploce','rock','kolekcija','klasika']);
  END IF;
END $$;

-- ============================================================================
-- 13. VIDEOIGRE
-- ============================================================================
DO $$
DECLARE
  seller UUID := '00000000-0000-0000-0000-000000000001';
  cat UUID;
BEGIN
  -- vig-playstation
  SELECT id INTO cat FROM categories WHERE slug = 'vig-playstation';
  IF cat IS NOT NULL THEN
    INSERT INTO products (seller_id, title, description, price, category_id, condition, images, status, location, views_count, favorites_count, attributes, tags)
    VALUES (seller, 'PlayStation 5 Disc Edition + 2 igre', 'PS5 sa čitačem diskova, 2 kontrolera, Spider-Man 2 i FC24. Korišten 6 mjeseci.', 450.00, cat, 'used',
      ARRAY['https://images.unsplash.com/photo-1612287230202-1ff1d85d1bdf?w=800&h=600&fit=crop'],
      'active', 'Sarajevo', 178, 15,
      '{"generacija":"PS5","zanr":"Razno","platforma":"PlayStation"}'::jsonb,
      ARRAY['ps5','playstation','spiderman','fc24','konzola']);
  END IF;

  -- vig-xbox
  SELECT id INTO cat FROM categories WHERE slug = 'vig-xbox';
  IF cat IS NOT NULL THEN
    INSERT INTO products (seller_id, title, description, price, category_id, condition, images, status, location, views_count, favorites_count, attributes, tags)
    VALUES (seller, 'Xbox Series X 1TB', 'Xbox Series X, 1TB. Sa Game Pass Ultimate 3 mjeseca. Kao nov.', 380.00, cat, 'like_new',
      ARRAY['https://images.unsplash.com/photo-1612287230202-1ff1d85d1bdf?w=800&h=600&fit=crop'],
      'active', 'Mostar', 98, 7,
      '{"generacija":"Series X","zanr":"Razno","platforma":"Xbox"}'::jsonb,
      ARRAY['xbox','seriesx','gamepass','microsoft','konzola']);
  END IF;

  -- vig-nintendo
  SELECT id INTO cat FROM categories WHERE slug = 'vig-nintendo';
  IF cat IS NOT NULL THEN
    INSERT INTO products (seller_id, title, description, price, category_id, condition, images, status, location, views_count, favorites_count, attributes, tags)
    VALUES (seller, 'Nintendo Switch OLED bijeli', 'Switch OLED, bijeli. Sa 3 igre (Zelda, Mario, Pokemon). Korišten.', 280.00, cat, 'used',
      ARRAY['https://images.unsplash.com/photo-1612287230202-1ff1d85d1bdf?w=800&h=600&fit=crop'],
      'active', 'Tuzla', 87, 6,
      '{"generacija":"Switch OLED","zanr":"Razno","platforma":"Nintendo"}'::jsonb,
      ARRAY['nintendo','switch','oled','zelda','mario']);
  END IF;

  -- vig-pc
  SELECT id INTO cat FROM categories WHERE slug = 'vig-pc';
  IF cat IS NOT NULL THEN
    INSERT INTO products (seller_id, title, description, price, category_id, condition, images, status, location, views_count, favorites_count, attributes, tags)
    VALUES (seller, 'Cyberpunk 2077 Ultimate Edition PC', 'Fizička kopija sa kodom za Steam. Neotvorena.', 35.00, cat, 'new',
      ARRAY['https://images.unsplash.com/photo-1612287230202-1ff1d85d1bdf?w=800&h=600&fit=crop'],
      'active', 'Banja Luka', 56, 3,
      '{"zanr":"RPG","platforma":"PC","tip":"Igra"}'::jsonb,
      ARRAY['cyberpunk','2077','pc','steam','rpg']);
  END IF;

  -- vig-retro
  SELECT id INTO cat FROM categories WHERE slug = 'vig-retro';
  IF cat IS NOT NULL THEN
    INSERT INTO products (seller_id, title, description, price, category_id, condition, images, status, location, views_count, favorites_count, attributes, tags)
    VALUES (seller, 'Game Boy Advance SP sa igrama', 'Nintendo GBA SP, AGS-101 ekran. Sa 5 igara (Pokemon, Mario). Radi odlično.', 85.00, cat, 'used',
      ARRAY['https://images.unsplash.com/photo-1612287230202-1ff1d85d1bdf?w=800&h=600&fit=crop'],
      'active', 'Zenica', 78, 8,
      '{"generacija":"Game Boy Advance","platforma":"Nintendo"}'::jsonb,
      ARRAY['gameboy','advance','sp','retro','pokemon','nintendo']);
  END IF;

  -- vig-gaming-oprema
  SELECT id INTO cat FROM categories WHERE slug = 'vig-gaming-oprema';
  IF cat IS NOT NULL THEN
    INSERT INTO products (seller_id, title, description, price, category_id, condition, images, status, location, views_count, favorites_count, attributes, tags)
    VALUES (seller, 'Razer DeathAdder V3 gaming miš', 'Razer gaming miš, 30K senzor, ultralagani 59g. Korišten 3 mjeseca.', 55.00, cat, 'like_new',
      ARRAY['https://images.unsplash.com/photo-1612287230202-1ff1d85d1bdf?w=800&h=600&fit=crop'],
      'active', 'Zagreb', 67, 4,
      '{"tip":"Miš","platforma":"PC"}'::jsonb,
      ARRAY['razer','deathadder','gaming','mis','30k']);
  END IF;
END $$;

-- ============================================================================
-- 14. ZIVOTINJE
-- ============================================================================
DO $$
DECLARE
  seller UUID := '00000000-0000-0000-0000-000000000001';
  cat UUID;
BEGIN
  -- ziv-psi
  SELECT id INTO cat FROM categories WHERE slug = 'ziv-psi';
  IF cat IS NOT NULL THEN
    INSERT INTO products (seller_id, title, description, price, category_id, condition, images, status, location, views_count, favorites_count, attributes, tags)
    VALUES (seller, 'Štenci njemački ovčar sa rodovnikom', 'Čistokrvni štenci njemačkog ovčara, vakcinisani, čipirani. 2 mjeseca starosti.', 500.00, cat, 'new',
      ARRAY['https://images.unsplash.com/photo-1587300003388-59208cc962cb?w=800&h=600&fit=crop'],
      'active', 'Sarajevo', 167, 14,
      '{"pasmina":"Njemački ovčar","spol":"Mužjak","starost":"2 mjeseca","sRodovnicom":true,"vakcinisan":true,"cipiran":true,"cistokrvna":true}'::jsonb,
      ARRAY['njemacki-ovcar','stenci','rodovnik','vakcinisani','cipirani']);
  END IF;

  -- ziv-macke
  SELECT id INTO cat FROM categories WHERE slug = 'ziv-macke';
  IF cat IS NOT NULL THEN
    INSERT INTO products (seller_id, title, description, price, category_id, condition, images, status, location, views_count, favorites_count, attributes, tags)
    VALUES (seller, 'Britanska kratkodlaka mačka', 'Britanska kratkodlaka, plava boja. Vakcinisana i čipirana. 4 mjeseca.', 300.00, cat, 'new',
      ARRAY['https://images.unsplash.com/photo-1514888286974-6c03e2ca1dba?w=800&h=600&fit=crop'],
      'active', 'Mostar', 134, 11,
      '{"pasmina":"Britanska kratkodlaka","spol":"Ženka","starost":"4 mjeseca","sRodovnicom":true,"vakcinisana":true,"cipirana":true,"cistokrvna":true}'::jsonb,
      ARRAY['britanska','kratkodlaka','macka','plava','vakcinisana']);
  END IF;

  -- ziv-ptice
  SELECT id INTO cat FROM categories WHERE slug = 'ziv-ptice';
  IF cat IS NOT NULL THEN
    INSERT INTO products (seller_id, title, description, price, category_id, condition, images, status, location, views_count, favorites_count, attributes, tags)
    VALUES (seller, 'Par tigrica papagaja', 'Par tigrica (budgie), zelena i plava. Sa kavezom i opremom.', 35.00, cat, 'new',
      ARRAY['https://images.unsplash.com/photo-1452570053594-1b985d6ea890?w=800&h=600&fit=crop'],
      'active', 'Tuzla', 56, 4,
      '{"vrsta":"Tigrica","spol":"Par"}'::jsonb,
      ARRAY['papagaj','tigrica','par','kavez','ptica']);
  END IF;

  -- ziv-glodavci
  SELECT id INTO cat FROM categories WHERE slug = 'ziv-glodavci';
  IF cat IS NOT NULL THEN
    INSERT INTO products (seller_id, title, description, price, category_id, condition, images, status, location, views_count, favorites_count, attributes, tags)
    VALUES (seller, 'Patuljasti zec mini lop', 'Patuljasti zec, mini lop. Vakcinisan. Vrlo prijateljski.', 25.00, cat, 'new',
      ARRAY['https://images.unsplash.com/photo-1585110396000-c9ffd4e4b308?w=800&h=600&fit=crop'],
      'active', 'Banja Luka', 67, 5,
      '{"vrsta":"Zec","spol":"Mužjak","starost":"3 mjeseca"}'::jsonb,
      ARRAY['zec','patuljasti','mini-lop','vakcinisan']);
  END IF;

  -- ziv-ribe
  SELECT id INTO cat FROM categories WHERE slug = 'ziv-ribe';
  IF cat IS NOT NULL THEN
    INSERT INTO products (seller_id, title, description, price, category_id, condition, images, status, location, views_count, favorites_count, attributes, tags)
    VALUES (seller, 'Akvarijum 120L sa komplet opremom', 'Akvarijum 120L, filter, grijač, LED rasvjeta, dekoracije. Sa ribicama.', 150.00, cat, 'used',
      ARRAY['https://images.unsplash.com/photo-1522069169874-c58ec4b76be5?w=800&h=600&fit=crop'],
      'active', 'Zenica', 43, 3,
      '{"vrsta":"Tropske ribe"}'::jsonb,
      ARRAY['akvarijum','120l','tropske','ribe','komplet']);
  END IF;

  -- ziv-terariji
  SELECT id INTO cat FROM categories WHERE slug = 'ziv-terariji';
  IF cat IS NOT NULL THEN
    INSERT INTO products (seller_id, title, description, price, category_id, condition, images, status, location, views_count, favorites_count, attributes, tags)
    VALUES (seller, 'Leopard gekon sa terarijumom', 'Leopard gekon, pripitomljen. Sa kompletnim terarijumom 60x40x40.', 80.00, cat, 'new',
      ARRAY['https://images.unsplash.com/photo-1522069169874-c58ec4b76be5?w=800&h=600&fit=crop'],
      'active', 'Zagreb', 34, 2,
      '{"vrsta":"Gekon"}'::jsonb,
      ARRAY['gekon','leopard','terarijum','guster','egzoticni']);
  END IF;

  -- ziv-konji
  SELECT id INTO cat FROM categories WHERE slug = 'ziv-konji';
  IF cat IS NOT NULL THEN
    INSERT INTO products (seller_id, title, description, price, category_id, condition, images, status, location, views_count, favorites_count, attributes, tags)
    VALUES (seller, 'Bosanski brdski konj 5 godina', 'Bosanski brdski konj, mužjak, 5 godina. Miran i obučen za jahanje.', 2500.00, cat, 'new',
      ARRAY['https://images.unsplash.com/photo-1553284965-83fd3e82fa5a?w=800&h=600&fit=crop'],
      'active', 'Travnik', 78, 6,
      '{"pasmina":"Bosanski brdski","spol":"Mužjak","starost":"5 godina"}'::jsonb,
      ARRAY['konj','bosanski','brdski','jahanje','5godina']);
  END IF;

  -- ziv-domace
  SELECT id INTO cat FROM categories WHERE slug = 'ziv-domace';
  IF cat IS NOT NULL THEN
    INSERT INTO products (seller_id, title, description, price, category_id, condition, images, status, location, views_count, favorites_count, attributes, tags)
    VALUES (seller, 'Kokoši nesilice 10 komada', 'Kokoši nesilice, zdrave, aktivno nesu. 10 komada. Cijena za sve.', 80.00, cat, 'new',
      ARRAY['https://images.unsplash.com/photo-1504674900247-0877df9cc836?w=800&h=600&fit=crop'],
      'active', 'Bihać', 34, 2,
      '{"vrsta":"Kokoši"}'::jsonb,
      ARRAY['kokosi','nesilice','domace','jaja','zivina']);
  END IF;

  -- ziv-oprema
  SELECT id INTO cat FROM categories WHERE slug = 'ziv-oprema';
  IF cat IS NOT NULL THEN
    INSERT INTO products (seller_id, title, description, price, category_id, condition, images, status, location, views_count, favorites_count, attributes, tags)
    VALUES (seller, 'GPS ogrlica za pse Tractive', 'GPS tracker za pse, real-time praćenje putem aplikacije. Novo u kutiji.', 45.00, cat, 'new',
      ARRAY['https://images.unsplash.com/photo-1587300003388-59208cc962cb?w=800&h=600&fit=crop'],
      'active', 'Bijeljina', 56, 4,
      '{"tip":"GPS ogrlica"}'::jsonb,
      ARRAY['gps','ogrlica','tractive','pas','tracker']);
  END IF;

  -- ziv-udoml-psi (PRICE 0 - adoption)
  SELECT id INTO cat FROM categories WHERE slug = 'ziv-udoml-psi';
  IF cat IS NOT NULL THEN
    INSERT INTO products (seller_id, title, description, price, category_id, condition, images, status, location, views_count, favorites_count, attributes, tags)
    VALUES (seller, 'Rex traži dom - mješanac 2 godine', 'Miran i obučen pas, mješanac srednje veličine. Vakcinisan i kastriran. Traži topli dom.', 0.00, cat, 'new',
      ARRAY['https://images.unsplash.com/photo-1587300003388-59208cc962cb?w=800&h=600&fit=crop'],
      'active', 'Sarajevo', 145, 18,
      '{"pasmina":"Mješanac","spol":"Mužjak","starost":"2 godine","vakcinisan":true,"cipiran":true}'::jsonb,
      ARRAY['udomljavanje','pas','mjesanac','vakcinisan','dom']);
  END IF;

  -- ziv-udoml-macke (PRICE 0 - adoption)
  SELECT id INTO cat FROM categories WHERE slug = 'ziv-udoml-macke';
  IF cat IS NOT NULL THEN
    INSERT INTO products (seller_id, title, description, price, category_id, condition, images, status, location, views_count, favorites_count, attributes, tags)
    VALUES (seller, 'Maca Luna traži dom', 'Prelijepa šarena maca, sterilisana i vakcinisana. 1 godina. Mazna i igrljiva.', 0.00, cat, 'new',
      ARRAY['https://images.unsplash.com/photo-1514888286974-6c03e2ca1dba?w=800&h=600&fit=crop'],
      'active', 'Mostar', 123, 15,
      '{"pasmina":"Domaća","spol":"Ženka","starost":"1 godina","vakcinisana":true,"cipirana":true}'::jsonb,
      ARRAY['udomljavanje','macka','sterilisana','mazna','dom']);
  END IF;

  -- ziv-udoml-ostalo (PRICE 0 - adoption)
  SELECT id INTO cat FROM categories WHERE slug = 'ziv-udoml-ostalo';
  IF cat IS NOT NULL THEN
    INSERT INTO products (seller_id, title, description, price, category_id, condition, images, status, location, views_count, favorites_count, attributes, tags)
    VALUES (seller, 'Zamorčić traži novi dom', 'Zamorčić, mužjak, 1 godina. Dolazi sa kavezom i opremom. Besplatno udomljavanje.', 0.00, cat, 'new',
      ARRAY['https://images.unsplash.com/photo-1585110396000-c9ffd4e4b308?w=800&h=600&fit=crop'],
      'active', 'Tuzla', 67, 8,
      '{"vrsta":"Zamorčić","spol":"Mužjak"}'::jsonb,
      ARRAY['zamorcic','udomljavanje','besplatno','kavez']);
  END IF;
END $$;

-- ============================================================================
-- 15. HRANA
-- ============================================================================
DO $$
DECLARE
  seller UUID := '00000000-0000-0000-0000-000000000001';
  cat UUID;
BEGIN
  -- hran-biljni
  SELECT id INTO cat FROM categories WHERE slug = 'hran-biljni';
  IF cat IS NOT NULL THEN
    INSERT INTO products (seller_id, title, description, price, category_id, condition, images, status, location, views_count, favorites_count, attributes, tags)
    VALUES (seller, 'Domaći med livadski 1kg', 'Čist livadski med sa planine Bjelašnice. Domaća proizvodnja, bez aditiva.', 15.00, cat, 'new',
      ARRAY['https://images.unsplash.com/photo-1587049352846-4a222e784d38?w=800&h=600&fit=crop'],
      'active', 'Sarajevo', 112, 9,
      '{"tip":"Med","domace":true,"organsko":true}'::jsonb,
      ARRAY['med','domaci','livadski','bjelasnica','prirodni']);
  END IF;

  -- hran-dezerti
  SELECT id INTO cat FROM categories WHERE slug = 'hran-dezerti';
  IF cat IS NOT NULL THEN
    INSERT INTO products (seller_id, title, description, price, category_id, condition, images, status, location, views_count, favorites_count, attributes, tags)
    VALUES (seller, 'Domaća baklava po narudžbi', 'Ručno rađena baklava sa orasima. Narudžba minimum 1kg. Dostava po dogovoru.', 20.00, cat, 'new',
      ARRAY['https://images.unsplash.com/photo-1504674900247-0877df9cc836?w=800&h=600&fit=crop'],
      'active', 'Mostar', 87, 7,
      '{"tip":"Baklava","domace":true}'::jsonb,
      ARRAY['baklava','domaca','orasi','desert','narudzba']);
  END IF;

  -- hran-pica
  SELECT id INTO cat FROM categories WHERE slug = 'hran-pica';
  IF cat IS NOT NULL THEN
    INSERT INTO products (seller_id, title, description, price, category_id, condition, images, status, location, views_count, favorites_count, attributes, tags)
    VALUES (seller, 'Domaća rakija šljiva 10 godina', 'Prepečenica od šljive, 10 godina staračenja. 45% alkohola. 1L boca.', 25.00, cat, 'new',
      ARRAY['https://images.unsplash.com/photo-1504674900247-0877df9cc836?w=800&h=600&fit=crop'],
      'active', 'Tuzla', 76, 5,
      '{"tip":"Rakija","domace":true}'::jsonb,
      ARRAY['rakija','sljiva','prepečenica','domaca','10godina']);
  END IF;

  -- hran-zivotinjski
  SELECT id INTO cat FROM categories WHERE slug = 'hran-zivotinjski';
  IF cat IS NOT NULL THEN
    INSERT INTO products (seller_id, title, description, price, category_id, condition, images, status, location, views_count, favorites_count, attributes, tags)
    VALUES (seller, 'Domaća suha govedina 1kg', 'Suho meso od domaće govedine, dimljeno na bukovini. Tradicionalna priprema.', 35.00, cat, 'new',
      ARRAY['https://images.unsplash.com/photo-1504674900247-0877df9cc836?w=800&h=600&fit=crop'],
      'active', 'Banja Luka', 56, 4,
      '{"tip":"Suho meso","domace":true}'::jsonb,
      ARRAY['suho-meso','govedina','dimljeno','domace','bukovina']);
  END IF;

  -- hran-mlijecni
  SELECT id INTO cat FROM categories WHERE slug = 'hran-mlijecni';
  IF cat IS NOT NULL THEN
    INSERT INTO products (seller_id, title, description, price, category_id, condition, images, status, location, views_count, favorites_count, attributes, tags)
    VALUES (seller, 'Domaći livanjski sir 1kg', 'Originalni livanjski sir, dozrijevao 3 mjeseca. Polutvrdi. Cijena po kg.', 18.00, cat, 'new',
      ARRAY['https://images.unsplash.com/photo-1504674900247-0877df9cc836?w=800&h=600&fit=crop'],
      'active', 'Travnik', 67, 5,
      '{"tip":"Sir","domace":true,"organsko":false}'::jsonb,
      ARRAY['sir','livanjski','domaci','polutvrdi','mlijecni']);
  END IF;

  -- hran-paketi
  SELECT id INTO cat FROM categories WHERE slug = 'hran-paketi';
  IF cat IS NOT NULL THEN
    INSERT INTO products (seller_id, title, description, price, category_id, condition, images, status, location, views_count, favorites_count, attributes, tags)
    VALUES (seller, 'Poklon paket domaćih proizvoda', 'Paket: med 500g, ajvar 370g, pekmez 370g, čaj planinski. Idealan poklon.', 35.00, cat, 'new',
      ARRAY['https://images.unsplash.com/photo-1504674900247-0877df9cc836?w=800&h=600&fit=crop'],
      'active', 'Zenica', 89, 8,
      '{"tip":"Poklon paket","domace":true}'::jsonb,
      ARRAY['poklon','paket','domace','med','ajvar','pekmez']);
  END IF;

  -- hran-prerada
  SELECT id INTO cat FROM categories WHERE slug = 'hran-prerada';
  IF cat IS NOT NULL THEN
    INSERT INTO products (seller_id, title, description, price, category_id, condition, images, status, location, views_count, favorites_count, attributes, tags)
    VALUES (seller, 'Domaći ajvar ljuti 370g', 'Ručno rađen ajvar od pečenih paprika. Ljuta verzija. Bez konzervansa.', 8.00, cat, 'new',
      ARRAY['https://images.unsplash.com/photo-1504674900247-0877df9cc836?w=800&h=600&fit=crop'],
      'active', 'Bihać', 45, 3,
      '{"tip":"Ajvar","domace":true,"organsko":true}'::jsonb,
      ARRAY['ajvar','ljuti','domaci','paprika','bez-konzervansa']);
  END IF;

  -- hran-ulja-zacini
  SELECT id INTO cat FROM categories WHERE slug = 'hran-ulja-zacini';
  IF cat IS NOT NULL THEN
    INSERT INTO products (seller_id, title, description, price, category_id, condition, images, status, location, views_count, favorites_count, attributes, tags)
    VALUES (seller, 'Domaće maslinovo ulje 1L', 'Ekstra djevičansko maslinovo ulje iz Hercegovine. Ručni berba.', 20.00, cat, 'new',
      ARRAY['https://images.unsplash.com/photo-1504674900247-0877df9cc836?w=800&h=600&fit=crop'],
      'active', 'Mostar', 78, 6,
      '{"tip":"Maslinovo ulje","domace":true,"organsko":true}'::jsonb,
      ARRAY['maslinovo','ulje','hercegovina','djevicansko','domace']);
  END IF;
END $$;

-- ============================================================================
-- 16. STROJEVI
-- ============================================================================
DO $$
DECLARE
  seller UUID := '00000000-0000-0000-0000-000000000001';
  cat UUID;
BEGIN
  -- str-rucni-alati
  SELECT id INTO cat FROM categories WHERE slug = 'str-rucni-alati';
  IF cat IS NOT NULL THEN
    INSERT INTO products (seller_id, title, description, price, category_id, condition, images, status, location, views_count, favorites_count, attributes, tags)
    VALUES (seller, 'Set ručnog alata 108 dijelova', 'Profesionalni set alata u koferu. Gedore, vilasti, nasadni ključevi. Novo.', 85.00, cat, 'new',
      ARRAY['https://images.unsplash.com/photo-1581578731548-c64695cc6952?w=800&h=600&fit=crop'],
      'active', 'Sarajevo', 67, 4,
      '{"tip":"Set alata","marka":"Kraft"}'::jsonb,
      ARRAY['alat','set','108','gedore','kofer']);
  END IF;

  -- str-elektricni-alati
  SELECT id INTO cat FROM categories WHERE slug = 'str-elektricni-alati';
  IF cat IS NOT NULL THEN
    INSERT INTO products (seller_id, title, description, price, category_id, condition, images, status, location, views_count, favorites_count, attributes, tags)
    VALUES (seller, 'Makita brusilica kutna 230mm', 'Makita GA9060 brusilica, 2200W. Korištena na par poslova. Ispravna.', 120.00, cat, 'used',
      ARRAY['https://images.unsplash.com/photo-1581578731548-c64695cc6952?w=800&h=600&fit=crop'],
      'active', 'Mostar', 45, 3,
      '{"tip":"Brusilica","marka":"Makita","snaga":2200}'::jsonb,
      ARRAY['makita','brusilica','kutna','230mm','2200w']);
  END IF;

  -- str-gradev-strojevi
  SELECT id INTO cat FROM categories WHERE slug = 'str-gradev-strojevi';
  IF cat IS NOT NULL THEN
    INSERT INTO products (seller_id, title, description, price, category_id, condition, images, status, location, views_count, favorites_count, attributes, tags)
    VALUES (seller, 'Mini bager Kubota KX61-3 2015', 'Kubota mini bager, 2.5 tone. 3500 radnih sati. Redovno servisiran.', 22000.00, cat, 'used',
      ARRAY['https://images.unsplash.com/photo-1581578731548-c64695cc6952?w=800&h=600&fit=crop'],
      'active', 'Tuzla', 89, 7,
      '{"tip":"Mini bager","marka":"Kubota","radniSati":3500,"snaga":40}'::jsonb,
      ARRAY['bager','kubota','mini','kx61','gradevinski']);
  END IF;

  -- str-poljopriv
  SELECT id INTO cat FROM categories WHERE slug = 'str-poljopriv';
  IF cat IS NOT NULL THEN
    INSERT INTO products (seller_id, title, description, price, category_id, condition, images, status, location, views_count, favorites_count, attributes, tags)
    VALUES (seller, 'Traktor IMT 539 DeLuxe', 'IMT 539, 39KS. Potpuno ispravan, novi akumulator i gume.', 4500.00, cat, 'used',
      ARRAY['https://images.unsplash.com/photo-1530267981375-f0de937f5f13?w=800&h=600&fit=crop'],
      'active', 'Banja Luka', 134, 10,
      '{"tip":"Traktor","marka":"IMT","radniSati":8000,"snaga":39}'::jsonb,
      ARRAY['imt','539','traktor','poljoprivreda','39ks']);
  END IF;

  -- str-vrtni
  SELECT id INTO cat FROM categories WHERE slug = 'str-vrtni';
  IF cat IS NOT NULL THEN
    INSERT INTO products (seller_id, title, description, price, category_id, condition, images, status, location, views_count, favorites_count, attributes, tags)
    VALUES (seller, 'Husqvarna kosilica za travu 46cm', 'Husqvarna benzinska kosilica, 46cm rez. Korištena 2 sezone.', 250.00, cat, 'used',
      ARRAY['https://images.unsplash.com/photo-1416879595882-3373a0480b5b?w=800&h=600&fit=crop'],
      'active', 'Zenica', 56, 3,
      '{"tip":"Kosilica","marka":"Husqvarna","snaga":3.5}'::jsonb,
      ARRAY['husqvarna','kosilica','trava','benzinska','46cm']);
  END IF;

  -- str-viljuskari
  SELECT id INTO cat FROM categories WHERE slug = 'str-viljuskari';
  IF cat IS NOT NULL THEN
    INSERT INTO products (seller_id, title, description, price, category_id, condition, images, status, location, views_count, favorites_count, attributes, tags)
    VALUES (seller, 'Toyota viljuškar 2.5t dizel', 'Toyota 8FD25, dizel, 2.5 tone nosivost. 5000 radnih sati. Ispravan.', 12000.00, cat, 'used',
      ARRAY['https://images.unsplash.com/photo-1581578731548-c64695cc6952?w=800&h=600&fit=crop'],
      'active', 'Zagreb', 34, 2,
      '{"tip":"Viljuškar","marka":"Toyota","radniSati":5000,"nosivost":2500}'::jsonb,
      ARRAY['viljuskar','toyota','2.5t','dizel','skladiste']);
  END IF;

  -- str-industrijski
  SELECT id INTO cat FROM categories WHERE slug = 'str-industrijski';
  IF cat IS NOT NULL THEN
    INSERT INTO products (seller_id, title, description, price, category_id, condition, images, status, location, views_count, favorites_count, attributes, tags)
    VALUES (seller, 'CNC glodalica 3-osna', 'CNC glodalica za obradu metala, 3 ose. Radna površina 600x400mm.', 8500.00, cat, 'used',
      ARRAY['https://images.unsplash.com/photo-1581578731548-c64695cc6952?w=800&h=600&fit=crop'],
      'active', 'Split', 23, 2,
      '{"tip":"CNC glodalica","marka":"Haas"}'::jsonb,
      ARRAY['cnc','glodalica','metal','3osna','industrijski']);
  END IF;

  -- str-ostalo
  SELECT id INTO cat FROM categories WHERE slug = 'str-ostalo';
  IF cat IS NOT NULL THEN
    INSERT INTO products (seller_id, title, description, price, category_id, condition, images, status, location, views_count, favorites_count, attributes, tags)
    VALUES (seller, 'Kompresor 200L 3KS', 'Klipni kompresor 200 litara, 3KS. Za automehaničarsku radionicu. Ispravan.', 350.00, cat, 'used',
      ARRAY['https://images.unsplash.com/photo-1581578731548-c64695cc6952?w=800&h=600&fit=crop'],
      'active', 'Travnik', 45, 3,
      '{}'::jsonb,
      ARRAY['kompresor','200l','3ks','klipni','radionica']);
  END IF;
END $$;

-- ============================================================================
-- 17. POSLOVI (price = 0)
-- ============================================================================
DO $$
DECLARE
  seller UUID := '00000000-0000-0000-0000-000000000001';
  cat UUID;
BEGIN
  -- pos-it
  SELECT id INTO cat FROM categories WHERE slug = 'pos-it';
  IF cat IS NOT NULL THEN
    INSERT INTO products (seller_id, title, description, price, category_id, condition, images, status, location, views_count, favorites_count, attributes, tags)
    VALUES (seller, 'Tražimo Full Stack Developera', 'IT firma traži Full Stack developera (React/Node.js). Remote rad, fleksibilno radno vrijeme.', 0.00, cat, 'new',
      ARRAY['https://images.unsplash.com/photo-1496181133206-80ce9b88a853?w=800&h=600&fit=crop'],
      'active', 'Sarajevo', 198, 12,
      '{"tipPosla":"Puno radno vrijeme","iskustvo":"3+ godine","obrazovanje":"VSS","rad":"Remote","oblast":"Web development"}'::jsonb,
      ARRAY['developer','fullstack','react','nodejs','remote']);
  END IF;

  -- pos-gradevinarstvo
  SELECT id INTO cat FROM categories WHERE slug = 'pos-gradevinarstvo';
  IF cat IS NOT NULL THEN
    INSERT INTO products (seller_id, title, description, price, category_id, condition, images, status, location, views_count, favorites_count, attributes, tags)
    VALUES (seller, 'Potreban majstor za fasade', 'Građevinska firma traži iskusnog fasadera. Stalni radni odnos.', 0.00, cat, 'new',
      ARRAY['https://images.unsplash.com/photo-1581578731548-c64695cc6952?w=800&h=600&fit=crop'],
      'active', 'Mostar', 87, 5,
      '{"tipPosla":"Puno radno vrijeme","iskustvo":"2+ godine","obrazovanje":"SSS","rad":"Na terenu"}'::jsonb,
      ARRAY['fasader','gradjevina','majstor','stalni','posao']);
  END IF;

  -- pos-promet
  SELECT id INTO cat FROM categories WHERE slug = 'pos-promet';
  IF cat IS NOT NULL THEN
    INSERT INTO products (seller_id, title, description, price, category_id, condition, images, status, location, views_count, favorites_count, attributes, tags)
    VALUES (seller, 'Vozač kamiona C+E kategorija', 'Transportna firma traži vozače kamiona sa C+E kategorijom. Međunarodni transport.', 0.00, cat, 'new',
      ARRAY['https://images.unsplash.com/photo-1601584115197-04ecc0da31d7?w=800&h=600&fit=crop'],
      'active', 'Tuzla', 134, 8,
      '{"tipPosla":"Puno radno vrijeme","iskustvo":"1+ godina","vozacka":"C+E","rad":"Na terenu"}'::jsonb,
      ARRAY['vozac','kamion','ce','medjunarodni','transport']);
  END IF;

  -- pos-turizam
  SELECT id INTO cat FROM categories WHERE slug = 'pos-turizam';
  IF cat IS NOT NULL THEN
    INSERT INTO products (seller_id, title, description, price, category_id, condition, images, status, location, views_count, favorites_count, attributes, tags)
    VALUES (seller, 'Konobar/ica za sezonu 2024', 'Hotel u Neumu traži konobara za ljetnu sezonu. Smještaj i hrana obezbijedeni.', 0.00, cat, 'new',
      ARRAY['https://images.unsplash.com/photo-1497366216548-37526070297c?w=800&h=600&fit=crop'],
      'active', 'Mostar', 156, 10,
      '{"tipPosla":"Sezonski","iskustvo":"Nije potrebno","rad":"Na lokaciji","jezici":"Engleski"}'::jsonb,
      ARRAY['konobar','sezona','neum','hotel','turizam']);
  END IF;

  -- pos-zdravstvo
  SELECT id INTO cat FROM categories WHERE slug = 'pos-zdravstvo';
  IF cat IS NOT NULL THEN
    INSERT INTO products (seller_id, title, description, price, category_id, condition, images, status, location, views_count, favorites_count, attributes, tags)
    VALUES (seller, 'Medicinska sestra - privatna klinika', 'Privatna klinika traži medicinsku sestru sa položenim stručnim ispitom.', 0.00, cat, 'new',
      ARRAY['https://images.unsplash.com/photo-1497366216548-37526070297c?w=800&h=600&fit=crop'],
      'active', 'Banja Luka', 89, 6,
      '{"tipPosla":"Puno radno vrijeme","iskustvo":"1+ godina","obrazovanje":"VŠS","rad":"Na lokaciji"}'::jsonb,
      ARRAY['medicinska','sestra','klinika','zdravstvo','posao']);
  END IF;

  -- pos-obrazovanje
  SELECT id INTO cat FROM categories WHERE slug = 'pos-obrazovanje';
  IF cat IS NOT NULL THEN
    INSERT INTO products (seller_id, title, description, price, category_id, condition, images, status, location, views_count, favorites_count, attributes, tags)
    VALUES (seller, 'Profesor engleskog jezika', 'Škola stranih jezika traži profesora engleskog. Certifikat obavezan.', 0.00, cat, 'new',
      ARRAY['https://images.unsplash.com/photo-1495446815901-a7297e633e8d?w=800&h=600&fit=crop'],
      'active', 'Zenica', 67, 4,
      '{"tipPosla":"Puno radno vrijeme","iskustvo":"2+ godine","obrazovanje":"VSS","jezici":"Engleski C2"}'::jsonb,
      ARRAY['profesor','engleski','skola','obrazovanje','certifikat']);
  END IF;

  -- pos-financije
  SELECT id INTO cat FROM categories WHERE slug = 'pos-financije';
  IF cat IS NOT NULL THEN
    INSERT INTO products (seller_id, title, description, price, category_id, condition, images, status, location, views_count, favorites_count, attributes, tags)
    VALUES (seller, 'Računovođa - stalni radni odnos', 'Tražimo iskusnog računovođu za vođenje kompletnog knjigovodstva.', 0.00, cat, 'new',
      ARRAY['https://images.unsplash.com/photo-1497366216548-37526070297c?w=800&h=600&fit=crop'],
      'active', 'Zagreb', 45, 3,
      '{"tipPosla":"Puno radno vrijeme","iskustvo":"3+ godine","obrazovanje":"VSS","rad":"Hibridno"}'::jsonb,
      ARRAY['racunovodja','financije','knjigovodstvo','stalni']);
  END IF;

  -- pos-marketing
  SELECT id INTO cat FROM categories WHERE slug = 'pos-marketing';
  IF cat IS NOT NULL THEN
    INSERT INTO products (seller_id, title, description, price, category_id, condition, images, status, location, views_count, favorites_count, attributes, tags)
    VALUES (seller, 'Social Media Manager', 'Digital agencija traži SMM-a za vođenje kampanja na društvenim mrežama.', 0.00, cat, 'new',
      ARRAY['https://images.unsplash.com/photo-1496181133206-80ce9b88a853?w=800&h=600&fit=crop'],
      'active', 'Split', 112, 7,
      '{"tipPosla":"Puno radno vrijeme","iskustvo":"1+ godina","rad":"Remote","oblast":"Marketing"}'::jsonb,
      ARRAY['smm','marketing','social','media','agencija']);
  END IF;

  -- pos-prodaja
  SELECT id INTO cat FROM categories WHERE slug = 'pos-prodaja';
  IF cat IS NOT NULL THEN
    INSERT INTO products (seller_id, title, description, price, category_id, condition, images, status, location, views_count, favorites_count, attributes, tags)
    VALUES (seller, 'Prodavač u showroomu automobila', 'Auto salon traži iskusnog prodavača. Osnovna plata + provizija.', 0.00, cat, 'new',
      ARRAY['https://images.unsplash.com/photo-1555215695-3004980ad54e?w=800&h=600&fit=crop'],
      'active', 'Travnik', 56, 3,
      '{"tipPosla":"Puno radno vrijeme","iskustvo":"2+ godine","rad":"Na lokaciji"}'::jsonb,
      ARRAY['prodavac','automobili','salon','prodaja','provizija']);
  END IF;

  -- pos-administracija
  SELECT id INTO cat FROM categories WHERE slug = 'pos-administracija';
  IF cat IS NOT NULL THEN
    INSERT INTO products (seller_id, title, description, price, category_id, condition, images, status, location, views_count, favorites_count, attributes, tags)
    VALUES (seller, 'Administrativni asistent/ica', 'Firma traži administrativnog asistenta. Poznavanje MS Office obavezno.', 0.00, cat, 'new',
      ARRAY['https://images.unsplash.com/photo-1497366216548-37526070297c?w=800&h=600&fit=crop'],
      'active', 'Bihać', 78, 4,
      '{"tipPosla":"Puno radno vrijeme","iskustvo":"Nije potrebno","obrazovanje":"SSS","rad":"Na lokaciji"}'::jsonb,
      ARRAY['asistent','administracija','office','kancelarija']);
  END IF;

  -- pos-poljoprivreda
  SELECT id INTO cat FROM categories WHERE slug = 'pos-poljoprivreda';
  IF cat IS NOT NULL THEN
    INSERT INTO products (seller_id, title, description, price, category_id, condition, images, status, location, views_count, favorites_count, attributes, tags)
    VALUES (seller, 'Radnik na farmi - berba voća', 'Potrebni radnici za berbu jabuka. Sezonski rad, plaća dnevno.', 0.00, cat, 'new',
      ARRAY['https://images.unsplash.com/photo-1416879595882-3373a0480b5b?w=800&h=600&fit=crop'],
      'active', 'Bijeljina', 34, 1,
      '{"tipPosla":"Sezonski","iskustvo":"Nije potrebno","rad":"Na terenu"}'::jsonb,
      ARRAY['berba','voca','farma','sezonski','jabuke']);
  END IF;

  -- pos-elektrotehnika
  SELECT id INTO cat FROM categories WHERE slug = 'pos-elektrotehnika';
  IF cat IS NOT NULL THEN
    INSERT INTO products (seller_id, title, description, price, category_id, condition, images, status, location, views_count, favorites_count, attributes, tags)
    VALUES (seller, 'Elektroinstalater - stalni posao', 'Traži se elektroinstalater za rad na stambenim i poslovnim objektima.', 0.00, cat, 'new',
      ARRAY['https://images.unsplash.com/photo-1581578731548-c64695cc6952?w=800&h=600&fit=crop'],
      'active', 'Sarajevo', 56, 3,
      '{"tipPosla":"Puno radno vrijeme","iskustvo":"2+ godine","obrazovanje":"SSS","rad":"Na terenu"}'::jsonb,
      ARRAY['elektricar','instalater','elektrotehnika','stalni','posao']);
  END IF;

  -- pos-tekstil
  SELECT id INTO cat FROM categories WHERE slug = 'pos-tekstil';
  IF cat IS NOT NULL THEN
    INSERT INTO products (seller_id, title, description, price, category_id, condition, images, status, location, views_count, favorites_count, attributes, tags)
    VALUES (seller, 'Švelja za tekstilnu radionicu', 'Tekstilna radionica traži iskusnu švelju za šivanje odjeće.', 0.00, cat, 'new',
      ARRAY['https://images.unsplash.com/photo-1595777457583-95e059d581b8?w=800&h=600&fit=crop'],
      'active', 'Mostar', 23, 1,
      '{"tipPosla":"Puno radno vrijeme","iskustvo":"2+ godine","rad":"Na lokaciji"}'::jsonb,
      ARRAY['svelja','tekstil','sivanje','radionica','odjeca']);
  END IF;

  -- pos-sigurnost
  SELECT id INTO cat FROM categories WHERE slug = 'pos-sigurnost';
  IF cat IS NOT NULL THEN
    INSERT INTO products (seller_id, title, description, price, category_id, condition, images, status, location, views_count, favorites_count, attributes, tags)
    VALUES (seller, 'Zaštitar - TC Sarajevo', 'Agencija traži zaštitare za rad u tržnom centru. Licenca obavezna.', 0.00, cat, 'new',
      ARRAY['https://images.unsplash.com/photo-1497366216548-37526070297c?w=800&h=600&fit=crop'],
      'active', 'Sarajevo', 45, 2,
      '{"tipPosla":"Puno radno vrijeme","iskustvo":"1+ godina","rad":"Na lokaciji"}'::jsonb,
      ARRAY['zastitar','sigurnost','tc','licenca','agencija']);
  END IF;

  -- pos-ostali
  SELECT id INTO cat FROM categories WHERE slug = 'pos-ostali';
  IF cat IS NOT NULL THEN
    INSERT INTO products (seller_id, title, description, price, category_id, condition, images, status, location, views_count, favorites_count, attributes, tags)
    VALUES (seller, 'Dostavljač za food delivery', 'Potrebni dostavljači sa vlastitim vozilom. Fleksibilno radno vrijeme.', 0.00, cat, 'new',
      ARRAY['https://images.unsplash.com/photo-1601584115197-04ecc0da31d7?w=800&h=600&fit=crop'],
      'active', 'Tuzla', 67, 4,
      '{"tipPosla":"Honorarno","iskustvo":"Nije potrebno","vozacka":"B","rad":"Na terenu"}'::jsonb,
      ARRAY['dostavljac','delivery','hrana','fleksibilno','vozilo']);
  END IF;
END $$;

-- ============================================================================
-- 18. USLUGE
-- ============================================================================
DO $$
DECLARE
  seller UUID := '00000000-0000-0000-0000-000000000001';
  cat UUID;
BEGIN
  -- usl-vozila
  SELECT id INTO cat FROM categories WHERE slug = 'usl-vozila';
  IF cat IS NOT NULL THEN
    INSERT INTO products (seller_id, title, description, price, category_id, condition, images, status, location, views_count, favorites_count, attributes, tags)
    VALUES (seller, 'Automehaničar - servis na adresi', 'Dolazim na vašu adresu za popravke automobila. 15 godina iskustva.', 30.00, cat, 'new',
      ARRAY['https://images.unsplash.com/photo-1486262715619-67b85e0b08d3?w=800&h=600&fit=crop'],
      'active', 'Sarajevo', 145, 10,
      '{"tip":"Mehanički servis","dolazak":"Na adresu","nacin":"Uživo"}'::jsonb,
      ARRAY['automehanicar','servis','popravka','dolazak','iskustvo']);
  END IF;

  -- usl-gradevinske
  SELECT id INTO cat FROM categories WHERE slug = 'usl-gradevinske';
  IF cat IS NOT NULL THEN
    INSERT INTO products (seller_id, title, description, price, category_id, condition, images, status, location, views_count, favorites_count, attributes, tags)
    VALUES (seller, 'Molerski radovi - kvalitetno i povoljno', 'Nudim molerske usluge: krečenje, gletovanje, farbanje. Besplatna procjena.', 25.00, cat, 'new',
      ARRAY['https://images.unsplash.com/photo-1581578731548-c64695cc6952?w=800&h=600&fit=crop'],
      'active', 'Mostar', 112, 8,
      '{"tip":"Molerski radovi","dolazak":"Na adresu","nacin":"Uživo"}'::jsonb,
      ARRAY['moler','krecenje','gletovanje','farbanje','usluga']);
  END IF;

  -- usl-it
  SELECT id INTO cat FROM categories WHERE slug = 'usl-it';
  IF cat IS NOT NULL THEN
    INSERT INTO products (seller_id, title, description, price, category_id, condition, images, status, location, views_count, favorites_count, attributes, tags)
    VALUES (seller, 'Izrada web stranica po mjeri', 'Profesionalna izrada web stranica, responsive dizajn, SEO optimizacija.', 50.00, cat, 'new',
      ARRAY['https://images.unsplash.com/photo-1496181133206-80ce9b88a853?w=800&h=600&fit=crop'],
      'active', 'Tuzla', 89, 6,
      '{"tip":"Web development","dolazak":"Nije potreban","nacin":"Online"}'::jsonb,
      ARRAY['web','stranica','izrada','seo','responsive']);
  END IF;

  -- usl-ljepota
  SELECT id INTO cat FROM categories WHERE slug = 'usl-ljepota';
  IF cat IS NOT NULL THEN
    INSERT INTO products (seller_id, title, description, price, category_id, condition, images, status, location, views_count, favorites_count, attributes, tags)
    VALUES (seller, 'Frizerske usluge u vašem domu', 'Profesionalna frizerka dolazi na vašu adresu. Šišanje, farbanje, frizure.', 20.00, cat, 'new',
      ARRAY['https://images.unsplash.com/photo-1595777457583-95e059d581b8?w=800&h=600&fit=crop'],
      'active', 'Banja Luka', 78, 5,
      '{"tip":"Frizerske usluge","dolazak":"Na adresu","nacin":"Uživo"}'::jsonb,
      ARRAY['frizer','sisanje','farbanje','dolazak','ljepota']);
  END IF;

  -- usl-edukacija
  SELECT id INTO cat FROM categories WHERE slug = 'usl-edukacija';
  IF cat IS NOT NULL THEN
    INSERT INTO products (seller_id, title, description, price, category_id, condition, images, status, location, views_count, favorites_count, attributes, tags)
    VALUES (seller, 'Instrukcije iz matematike online', 'Profesor matematike daje instrukcije za srednju školu i fakultet. Online putem Zoom-a.', 15.00, cat, 'new',
      ARRAY['https://images.unsplash.com/photo-1495446815901-a7297e633e8d?w=800&h=600&fit=crop'],
      'active', 'Zenica', 134, 9,
      '{"tip":"Instrukcije","dolazak":"Nije potreban","nacin":"Online"}'::jsonb,
      ARRAY['instrukcije','matematika','online','profesor','zoom']);
  END IF;

  -- usl-transport
  SELECT id INTO cat FROM categories WHERE slug = 'usl-transport';
  IF cat IS NOT NULL THEN
    INSERT INTO products (seller_id, title, description, price, category_id, condition, images, status, location, views_count, favorites_count, attributes, tags)
    VALUES (seller, 'Selidbe i transport po BiH', 'Nudim usluge selidbe i transporta. Kombi i kamion. Radna snaga obezbijedena.', 40.00, cat, 'new',
      ARRAY['https://images.unsplash.com/photo-1601584115197-04ecc0da31d7?w=800&h=600&fit=crop'],
      'active', 'Zagreb', 98, 7,
      '{"tip":"Selidbe","dolazak":"Na adresu","nacin":"Uživo"}'::jsonb,
      ARRAY['selidbe','transport','kombi','kamion','bih']);
  END IF;

  -- usl-ciscenje
  SELECT id INTO cat FROM categories WHERE slug = 'usl-ciscenje';
  IF cat IS NOT NULL THEN
    INSERT INTO products (seller_id, title, description, price, category_id, condition, images, status, location, views_count, favorites_count, attributes, tags)
    VALUES (seller, 'Čišćenje stanova i poslovnih prostora', 'Profesionalno čišćenje sa opremom. Stanovi, kuće, kancelarije. Cijena po satu.', 15.00, cat, 'new',
      ARRAY['https://images.unsplash.com/photo-1626806787461-102c1bfaaea1?w=800&h=600&fit=crop'],
      'active', 'Split', 67, 4,
      '{"tip":"Čišćenje","dolazak":"Na adresu","nacin":"Uživo"}'::jsonb,
      ARRAY['ciscenje','stan','kancelarija','profesionalno','usluga']);
  END IF;

  -- usl-dizajn
  SELECT id INTO cat FROM categories WHERE slug = 'usl-dizajn';
  IF cat IS NOT NULL THEN
    INSERT INTO products (seller_id, title, description, price, category_id, condition, images, status, location, views_count, favorites_count, attributes, tags)
    VALUES (seller, 'Grafički dizajn - logo i vizual', 'Izrada logotipa, vizit karti, letaka, social media vizuala. Cijena po projektu.', 50.00, cat, 'new',
      ARRAY['https://images.unsplash.com/photo-1579783902614-a3fb3927b6a5?w=800&h=600&fit=crop'],
      'active', 'Travnik', 56, 3,
      '{"tip":"Grafički dizajn","dolazak":"Nije potreban","nacin":"Online"}'::jsonb,
      ARRAY['dizajn','logo','graficki','vizual','vizitka']);
  END IF;

  -- usl-pravne
  SELECT id INTO cat FROM categories WHERE slug = 'usl-pravne';
  IF cat IS NOT NULL THEN
    INSERT INTO products (seller_id, title, description, price, category_id, condition, images, status, location, views_count, favorites_count, attributes, tags)
    VALUES (seller, 'Pravni savjeti i zastupanje', 'Advokat sa 10 godina iskustva nudi pravne savjete i zastupanje pred sudom.', 50.00, cat, 'new',
      ARRAY['https://images.unsplash.com/photo-1497366216548-37526070297c?w=800&h=600&fit=crop'],
      'active', 'Bihać', 45, 3,
      '{"tip":"Pravne usluge","dolazak":"U kancelariji","nacin":"Uživo"}'::jsonb,
      ARRAY['advokat','pravne','usluge','zastupanje','savjeti']);
  END IF;

  -- usl-iznajmljivanje
  SELECT id INTO cat FROM categories WHERE slug = 'usl-iznajmljivanje';
  IF cat IS NOT NULL THEN
    INSERT INTO products (seller_id, title, description, price, category_id, condition, images, status, location, views_count, favorites_count, attributes, tags)
    VALUES (seller, 'Rent-a-car - VW Golf 8 dnevno', 'Iznajmljivanje VW Golf 8 sa punim osiguranjem. Cijena po danu.', 35.00, cat, 'new',
      ARRAY['https://images.unsplash.com/photo-1555215695-3004980ad54e?w=800&h=600&fit=crop'],
      'active', 'Bijeljina', 89, 6,
      '{"tip":"Rent-a-car","dolazak":"Na lokaciji","nacin":"Uživo"}'::jsonb,
      ARRAY['rentacar','golf8','iznajmljivanje','auto','dnevno']);
  END IF;

  -- usl-event
  SELECT id INTO cat FROM categories WHERE slug = 'usl-event';
  IF cat IS NOT NULL THEN
    INSERT INTO products (seller_id, title, description, price, category_id, condition, images, status, location, views_count, favorites_count, attributes, tags)
    VALUES (seller, 'DJ za svadbe i proslave', 'Profesionalni DJ sa kompletnom opremom. 10 godina iskustva. Svi žanrovi.', 100.00, cat, 'new',
      ARRAY['https://images.unsplash.com/photo-1510915361894-db8b60106cb1?w=800&h=600&fit=crop'],
      'active', 'Sarajevo', 112, 8,
      '{"tip":"DJ usluge","dolazak":"Na lokaciji","nacin":"Uživo"}'::jsonb,
      ARRAY['dj','svadba','proslava','muzika','oprema']);
  END IF;

  -- usl-ljubimci
  SELECT id INTO cat FROM categories WHERE slug = 'usl-ljubimci';
  IF cat IS NOT NULL THEN
    INSERT INTO products (seller_id, title, description, price, category_id, condition, images, status, location, views_count, favorites_count, attributes, tags)
    VALUES (seller, 'Dog sitting - čuvanje pasa', 'Čuvanje pasa u svom domu dok ste na putovanju. Iskustvo, veliki vrt.', 20.00, cat, 'new',
      ARRAY['https://images.unsplash.com/photo-1587300003388-59208cc962cb?w=800&h=600&fit=crop'],
      'active', 'Mostar', 67, 5,
      '{"tip":"Čuvanje životinja","dolazak":"U mom domu","nacin":"Uživo"}'::jsonb,
      ARRAY['dog-sitting','cuvanje','pas','ljubimac','vrt']);
  END IF;

  -- usl-ostale
  SELECT id INTO cat FROM categories WHERE slug = 'usl-ostale';
  IF cat IS NOT NULL THEN
    INSERT INTO products (seller_id, title, description, price, category_id, condition, images, status, location, views_count, favorites_count, attributes, tags)
    VALUES (seller, 'Prevod dokumentacije EN/DE/BS', 'Sudski tumač za engleski i njemački jezik. Prevod i ovjera dokumenata.', 25.00, cat, 'new',
      ARRAY['https://images.unsplash.com/photo-1495446815901-a7297e633e8d?w=800&h=600&fit=crop'],
      'active', 'Tuzla', 56, 3,
      '{"tip":"Prevoditeljske usluge","dolazak":"Nije potreban","nacin":"Online"}'::jsonb,
      ARRAY['prevod','engleski','njemacki','tumac','ovjera']);
  END IF;
END $$;

-- ============================================================================
-- 19. UMJETNOST
-- ============================================================================
DO $$
DECLARE
  seller UUID := '00000000-0000-0000-0000-000000000001';
  cat UUID;
BEGIN
  -- umj-slike
  SELECT id INTO cat FROM categories WHERE slug = 'umj-slike';
  IF cat IS NOT NULL THEN
    INSERT INTO products (seller_id, title, description, price, category_id, condition, images, status, location, views_count, favorites_count, attributes, tags)
    VALUES (seller, 'Ulje na platnu - Stari Mostar', 'Originalna slika starog Mostara, ulje na platnu. 60x80cm. Sa okvirom.', 250.00, cat, 'new',
      ARRAY['https://images.unsplash.com/photo-1579783902614-a3fb3927b6a5?w=800&h=600&fit=crop'],
      'active', 'Mostar', 89, 7,
      '{"tip":"Ulje na platnu","dimenzija":"60x80cm","uokvireno":true}'::jsonb,
      ARRAY['slika','ulje','platno','mostar','originalna']);
  END IF;

  -- umj-fotografije
  SELECT id INTO cat FROM categories WHERE slug = 'umj-fotografije';
  IF cat IS NOT NULL THEN
    INSERT INTO products (seller_id, title, description, price, category_id, condition, images, status, location, views_count, favorites_count, attributes, tags)
    VALUES (seller, 'Umjetnička fotografija - Sarajevo noću', 'Limitirano izdanje, 1/50. Štampa na Hahnemühle papiru. 40x60cm.', 120.00, cat, 'new',
      ARRAY['https://images.unsplash.com/photo-1579783902614-a3fb3927b6a5?w=800&h=600&fit=crop'],
      'active', 'Sarajevo', 56, 4,
      '{"tip":"Umjetnička fotografija","dimenzija":"40x60cm","uokvireno":false}'::jsonb,
      ARRAY['fotografija','sarajevo','noc','limitirano','umjetnicka']);
  END IF;

  -- umj-antikviteti
  SELECT id INTO cat FROM categories WHERE slug = 'umj-antikviteti';
  IF cat IS NOT NULL THEN
    INSERT INTO products (seller_id, title, description, price, category_id, condition, images, status, location, views_count, favorites_count, attributes, tags)
    VALUES (seller, 'Stari bakreni džezva set', 'Ručno kovani bakreni set: džezva, fildžani (6 kom), šećerluk. Iz 19. vijeka.', 180.00, cat, 'used',
      ARRAY['https://images.unsplash.com/photo-1579783902614-a3fb3927b6a5?w=800&h=600&fit=crop'],
      'active', 'Sarajevo', 123, 10,
      '{"tip":"Bakreni predmeti","starost":"19. vijek","zemlja":"Bosna"}'::jsonb,
      ARRAY['dzezva','bakar','antikvarno','fildzani','rucni-rad']);
  END IF;

  -- umj-numizmatika
  SELECT id INTO cat FROM categories WHERE slug = 'umj-numizmatika';
  IF cat IS NOT NULL THEN
    INSERT INTO products (seller_id, title, description, price, category_id, condition, images, status, location, views_count, favorites_count, attributes, tags)
    VALUES (seller, 'Srebrnjak 1 KM 1998 proof', 'Srebrni kovanik 1 KM iz 1998. godine, proof kvaliteta. U kapsuli.', 45.00, cat, 'like_new',
      ARRAY['https://images.unsplash.com/photo-1621155346337-1d19476ba7d4?w=800&h=600&fit=crop'],
      'active', 'Banja Luka', 67, 5,
      '{"tip":"Kovanice","godina":1998,"zemlja":"Bosna i Hercegovina"}'::jsonb,
      ARRAY['srebrnjak','km','1998','proof','numizmatika']);
  END IF;

  -- umj-filatelija
  SELECT id INTO cat FROM categories WHERE slug = 'umj-filatelija';
  IF cat IS NOT NULL THEN
    INSERT INTO products (seller_id, title, description, price, category_id, condition, images, status, location, views_count, favorites_count, attributes, tags)
    VALUES (seller, 'Kolekcija poštanskih markica SFRJ', 'Kolekcija od 200+ markica iz perioda SFRJ. U albumu.', 60.00, cat, 'used',
      ARRAY['https://images.unsplash.com/photo-1621155346337-1d19476ba7d4?w=800&h=600&fit=crop'],
      'active', 'Tuzla', 34, 3,
      '{"tip":"Poštanske markice","period":"SFRJ","zemlja":"Jugoslavija"}'::jsonb,
      ARRAY['markice','sfrj','kolekcija','filatelija','album']);
  END IF;

  -- umj-militarija
  SELECT id INTO cat FROM categories WHERE slug = 'umj-militarija';
  IF cat IS NOT NULL THEN
    INSERT INTO products (seller_id, title, description, price, category_id, condition, images, status, location, views_count, favorites_count, attributes, tags)
    VALUES (seller, 'Austrougarski vojni orden', 'Originalni vojni orden iz perioda Austro-Ugarske. Sa vrpcom. Dobro očuvan.', 120.00, cat, 'used',
      ARRAY['https://images.unsplash.com/photo-1621155346337-1d19476ba7d4?w=800&h=600&fit=crop'],
      'active', 'Zenica', 45, 4,
      '{"tip":"Ordenje","period":"Austro-Ugarska","zemlja":"Austro-Ugarska"}'::jsonb,
      ARRAY['orden','austrougarska','vojni','militarija','vrpca']);
  END IF;

  -- umj-modelarstvo
  SELECT id INTO cat FROM categories WHERE slug = 'umj-modelarstvo';
  IF cat IS NOT NULL THEN
    INSERT INTO products (seller_id, title, description, price, category_id, condition, images, status, location, views_count, favorites_count, attributes, tags)
    VALUES (seller, 'Model aviona Spitfire 1:48', 'Sklopljeni i obojeni model Spitfire Mk.IX. Mjerilo 1:48. Na postolju.', 35.00, cat, 'new',
      ARRAY['https://images.unsplash.com/photo-1579783902614-a3fb3927b6a5?w=800&h=600&fit=crop'],
      'active', 'Zagreb', 28, 2,
      '{"tip":"Model aviona","mjerilo":"1:48"}'::jsonb,
      ARRAY['model','spitfire','avion','1:48','modelarstvo']);
  END IF;

  -- umj-razglednice
  SELECT id INTO cat FROM categories WHERE slug = 'umj-razglednice';
  IF cat IS NOT NULL THEN
    INSERT INTO products (seller_id, title, description, price, category_id, condition, images, status, location, views_count, favorites_count, attributes, tags)
    VALUES (seller, 'Stare razglednice Sarajeva 1920-1940', 'Set od 10 originalnih razglednica Sarajeva iz međuratnog perioda.', 50.00, cat, 'used',
      ARRAY['https://images.unsplash.com/photo-1579783902614-a3fb3927b6a5?w=800&h=600&fit=crop'],
      'active', 'Sarajevo', 56, 4,
      '{"tip":"Razglednice","period":"1920-1940","zemlja":"Kraljevina Jugoslavija"}'::jsonb,
      ARRAY['razglednice','sarajevo','stare','1920','meduratni']);
  END IF;

  -- umj-ostale
  SELECT id INTO cat FROM categories WHERE slug = 'umj-ostale';
  IF cat IS NOT NULL THEN
    INSERT INTO products (seller_id, title, description, price, category_id, condition, images, status, location, views_count, favorites_count, attributes, tags)
    VALUES (seller, 'Ručno rađena keramička vaza', 'Autorska keramička vaza, ručno rađena na vitlu. Glazirana. Visina 30cm.', 45.00, cat, 'new',
      ARRAY['https://images.unsplash.com/photo-1579783902614-a3fb3927b6a5?w=800&h=600&fit=crop'],
      'active', 'Mostar', 34, 2,
      '{}'::jsonb,
      ARRAY['keramika','vaza','rucni-rad','autorska','glazirana']);
  END IF;
END $$;

-- ============================================================================
-- 20. OSTALO
-- ============================================================================
DO $$
DECLARE
  seller UUID := '00000000-0000-0000-0000-000000000001';
  cat UUID;
BEGIN
  -- ost-karte
  SELECT id INTO cat FROM categories WHERE slug = 'ost-karte';
  IF cat IS NOT NULL THEN
    INSERT INTO products (seller_id, title, description, price, category_id, condition, images, status, location, views_count, favorites_count, attributes, tags)
    VALUES (seller, 'Karte za koncert Dinu Merlina Arena', 'Dvije karte za Dinu Merlina, Zetra Arena, parter. Originalne.', 120.00, cat, 'new',
      ARRAY['https://images.unsplash.com/photo-1510915361894-db8b60106cb1?w=800&h=600&fit=crop'],
      'active', 'Sarajevo', 178, 15,
      '{"tip":"Koncertne karte"}'::jsonb,
      ARRAY['karte','koncert','merlin','zetra','parter']);
  END IF;

  -- ost-kozmetika
  SELECT id INTO cat FROM categories WHERE slug = 'ost-kozmetika';
  IF cat IS NOT NULL THEN
    INSERT INTO products (seller_id, title, description, price, category_id, condition, images, status, location, views_count, favorites_count, attributes, tags)
    VALUES (seller, 'Dior Sauvage parfem 100ml', 'Originalni Dior Sauvage EDT, 100ml. Korišten 10ml. Sa kutijom.', 75.00, cat, 'like_new',
      ARRAY['https://images.unsplash.com/photo-1541643600914-78b084683601?w=800&h=600&fit=crop'],
      'active', 'Mostar', 98, 7,
      '{"tip":"Parfem"}'::jsonb,
      ARRAY['dior','sauvage','parfem','originalni','100ml']);
  END IF;

  -- ost-medicinska
  SELECT id INTO cat FROM categories WHERE slug = 'ost-medicinska';
  IF cat IS NOT NULL THEN
    INSERT INTO products (seller_id, title, description, price, category_id, condition, images, status, location, views_count, favorites_count, attributes, tags)
    VALUES (seller, 'Invalidska kolica sklopiva', 'Lagana invalidska kolica, sklopiva, sa kočnicama. Korištena kratko.', 200.00, cat, 'like_new',
      ARRAY['https://images.unsplash.com/photo-1581578731548-c64695cc6952?w=800&h=600&fit=crop'],
      'active', 'Tuzla', 34, 2,
      '{"tip":"Invalidska kolica"}'::jsonb,
      ARRAY['kolica','invalidska','sklopiva','lagana','kocnice']);
  END IF;

  -- ost-vjencanja
  SELECT id INTO cat FROM categories WHERE slug = 'ost-vjencanja';
  IF cat IS NOT NULL THEN
    INSERT INTO products (seller_id, title, description, price, category_id, condition, images, status, location, views_count, favorites_count, attributes, tags)
    VALUES (seller, 'Vjenčanica Pronovias vel. 38', 'Pronovias vjenčanica, A-linija, čipka. Nošena jednom. Profesionalno očišćena.', 500.00, cat, 'like_new',
      ARRAY['https://images.unsplash.com/photo-1519741497674-611481863552?w=800&h=600&fit=crop'],
      'active', 'Banja Luka', 145, 12,
      '{"tip":"Vjenčanica"}'::jsonb,
      ARRAY['vjencanica','pronovias','cipka','38','svadba']);
  END IF;

  -- ost-zlato
  SELECT id INTO cat FROM categories WHERE slug = 'ost-zlato';
  IF cat IS NOT NULL THEN
    INSERT INTO products (seller_id, title, description, price, category_id, condition, images, status, location, views_count, favorites_count, attributes, tags)
    VALUES (seller, 'Zlatna narukvica 585 18K 12g', 'Zlatna narukvica 585 proba, 18K, 12 grama. Ručni rad. Sa certifikatom.', 650.00, cat, 'new',
      ARRAY['https://images.unsplash.com/photo-1515562141589-67f0d7b90fb2?w=800&h=600&fit=crop'],
      'active', 'Zenica', 87, 6,
      '{"tip":"Narukvica"}'::jsonb,
      ARRAY['zlato','narukvica','585','18k','12g','certifikat']);
  END IF;

  -- ost-grobna
  SELECT id INTO cat FROM categories WHERE slug = 'ost-grobna';
  IF cat IS NOT NULL THEN
    INSERT INTO products (seller_id, title, description, price, category_id, condition, images, status, location, views_count, favorites_count, attributes, tags)
    VALUES (seller, 'Nadgrobni spomenik mermerni', 'Mermerni nadgrobni spomenik, komplet sa postoljem. Izrada po mjeri.', 1500.00, cat, 'new',
      ARRAY['https://images.unsplash.com/photo-1581578731548-c64695cc6952?w=800&h=600&fit=crop'],
      'active', 'Zagreb', 15, 0,
      '{"tip":"Nadgrobni spomenik"}'::jsonb,
      ARRAY['spomenik','nadgrobni','mermer','izrada','postolje']);
  END IF;

  -- ost-poklanjam (PRICE 0 - free)
  SELECT id INTO cat FROM categories WHERE slug = 'ost-poklanjam';
  IF cat IS NOT NULL THEN
    INSERT INTO products (seller_id, title, description, price, category_id, condition, images, status, location, views_count, favorites_count, attributes, tags)
    VALUES (seller, 'Poklanjam stari namještaj', 'Trosjed, dvosjed i fotelja. Stari ali funkcionalni. Morate sami preuzeti.', 0.00, cat, 'used',
      ARRAY['https://images.unsplash.com/photo-1555041469-a586c61ea9bc?w=800&h=600&fit=crop'],
      'active', 'Split', 156, 8,
      '{}'::jsonb,
      ARRAY['poklanjam','besplatno','namjestaj','trosjed','preuzimanje']);
  END IF;

  -- ost-sve-ostalo
  SELECT id INTO cat FROM categories WHERE slug = 'ost-sve-ostalo';
  IF cat IS NOT NULL THEN
    INSERT INTO products (seller_id, title, description, price, category_id, condition, images, status, location, views_count, favorites_count, attributes, tags)
    VALUES (seller, 'Vatromet za proslave 50 komada', 'Veliki set vatrometa, 50 komada raznih vrsta. Za Nova Godina ili svadbu.', 150.00, cat, 'new',
      ARRAY['https://images.unsplash.com/photo-1504674900247-0877df9cc836?w=800&h=600&fit=crop'],
      'active', 'Travnik', 43, 3,
      '{}'::jsonb,
      ARRAY['vatromet','proslava','nova-godina','svadba','set']);
  END IF;
END $$;

-- ============================================================================
-- VERIFICATION
-- ============================================================================
DO $$
DECLARE
  product_count INTEGER;
  category_count INTEGER;
BEGIN
  SELECT COUNT(*) INTO product_count
  FROM products WHERE seller_id = '00000000-0000-0000-0000-000000000001';

  SELECT COUNT(DISTINCT category_id) INTO category_count
  FROM products WHERE seller_id = '00000000-0000-0000-0000-000000000001';

  RAISE NOTICE '====================================';
  RAISE NOTICE 'Test Products Seed Verification:';
  RAISE NOTICE '  Total products inserted: %', product_count;
  RAISE NOTICE '  Categories covered: %', category_count;
  RAISE NOTICE '====================================';
END $$;
