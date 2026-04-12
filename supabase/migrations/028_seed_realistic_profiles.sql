-- ============================================================================
-- 028_seed_realistic_profiles.sql
-- Realistični seed: 3 Business + 10 Pro + 15 Normal prodavača = 87 artikala
-- Svi naslovi/opisi na bosanskom/hrvatskom
-- Slike: picsum.photos (stabilne, bez 404)
-- ============================================================================

-- ── Cleanup svih test UUID-ova ──────────────────────────────────────────────
DELETE FROM products
  WHERE seller_id::text LIKE '00000000-0000-000%';
DELETE FROM profiles
  WHERE id::text LIKE '00000000-0000-000%';
DELETE FROM auth.users
  WHERE id::text LIKE '00000000-0000-000%';

-- ============================================================================
-- AUTH USERS
-- ============================================================================
INSERT INTO auth.users (id, email, email_confirmed_at, created_at, updated_at, raw_app_meta_data, raw_user_meta_data)
VALUES
  -- BUSINESS (3)
  ('00000000-0000-0001-0000-000000000001','autostep@nudinadi.ba',now(),now()-interval'180 days',now(),'{"provider":"email","providers":["email"]}'::jsonb,'{"full_name":"AutoStep Auto Salon","username":"autostep_salon"}'::jsonb),
  ('00000000-0000-0001-0000-000000000002','techstore@nudinadi.ba',now(),now()-interval'200 days',now(),'{"provider":"email","providers":["email"]}'::jsonb,'{"full_name":"TechStore BiH","username":"techstore_bih"}'::jsonb),
  ('00000000-0000-0001-0000-000000000003','modacentar@nudinadi.ba',now(),now()-interval'150 days',now(),'{"provider":"email","providers":["email"]}'::jsonb,'{"full_name":"Moda Centar d.o.o.","username":"moda_centar"}'::jsonb),
  -- PRO (10)
  ('00000000-0000-0002-0000-000000000001','marko.petrovic@email.ba',now(),now()-interval'90 days',now(),'{"provider":"email","providers":["email"]}'::jsonb,'{"full_name":"Marko Petrović","username":"marko_petrovic"}'::jsonb),
  ('00000000-0000-0002-0000-000000000002','ajna.hasanovic@email.ba',now(),now()-interval'75 days',now(),'{"provider":"email","providers":["email"]}'::jsonb,'{"full_name":"Ajna Hasanović","username":"ajna_moda"}'::jsonb),
  ('00000000-0000-0002-0000-000000000003','ivan.kovicevic@email.hr',now(),now()-interval'110 days',now(),'{"provider":"email","providers":["email"]}'::jsonb,'{"full_name":"Ivan Kovičević","username":"ivan_split"}'::jsonb),
  ('00000000-0000-0002-0000-000000000004','jasmina.begic@email.ba',now(),now()-interval'60 days',now(),'{"provider":"email","providers":["email"]}'::jsonb,'{"full_name":"Jasmina Begić","username":"jasmina_tuzla"}'::jsonb),
  ('00000000-0000-0002-0000-000000000005','damir.djozic@email.ba',now(),now()-interval'55 days',now(),'{"provider":"email","providers":["email"]}'::jsonb,'{"full_name":"Damir Đozić","username":"damir_sport"}'::jsonb),
  ('00000000-0000-0002-0000-000000000006','nina.juric@email.hr',now(),now()-interval'45 days',now(),'{"provider":"email","providers":["email"]}'::jsonb,'{"full_name":"Nina Jurić","username":"nina_mama"}'::jsonb),
  ('00000000-0000-0002-0000-000000000007','emir.mehmedovic@email.ba',now(),now()-interval'80 days',now(),'{"provider":"email","providers":["email"]}'::jsonb,'{"full_name":"Emir Mehmedović","username":"emir_tech"}'::jsonb),
  ('00000000-0000-0002-0000-000000000008','sara.nikolic@email.ba',now(),now()-interval'40 days',now(),'{"provider":"email","providers":["email"]}'::jsonb,'{"full_name":"Sara Nikolić","username":"sara_knjige"}'::jsonb),
  ('00000000-0000-0002-0000-000000000009','tomo.maric@email.hr',now(),now()-interval'95 days',now(),'{"provider":"email","providers":["email"]}'::jsonb,'{"full_name":"Tomislav Marić","username":"tomo_alati"}'::jsonb),
  ('00000000-0000-0002-0000-000000000010','lejla.softic@email.ba',now(),now()-interval'30 days',now(),'{"provider":"email","providers":["email"]}'::jsonb,'{"full_name":"Lejla Softić","username":"lejla_beauty"}'::jsonb),
  -- NORMAL (15)
  ('00000000-0000-0003-0000-000000000001','haris.causevic@email.ba',now(),now()-interval'20 days',now(),'{"provider":"email","providers":["email"]}'::jsonb,'{"full_name":"Haris Čaušević","username":"haris_sa"}'::jsonb),
  ('00000000-0000-0003-0000-000000000002','petra.maric@email.hr',now(),now()-interval'15 days',now(),'{"provider":"email","providers":["email"]}'::jsonb,'{"full_name":"Petra Marić","username":"petra_zg"}'::jsonb),
  ('00000000-0000-0003-0000-000000000003','alen.basic@email.ba',now(),now()-interval'25 days',now(),'{"provider":"email","providers":["email"]}'::jsonb,'{"full_name":"Alen Bašić","username":"alen_tz"}'::jsonb),
  ('00000000-0000-0003-0000-000000000004','maja.stojanovic@email.hr',now(),now()-interval'18 days',now(),'{"provider":"email","providers":["email"]}'::jsonb,'{"full_name":"Maja Stojanović","username":"maja_st"}'::jsonb),
  ('00000000-0000-0003-0000-000000000005','muhamed.kurtovic@email.ba',now(),now()-interval'12 days',now(),'{"provider":"email","providers":["email"]}'::jsonb,'{"full_name":"Muhamed Kurtović","username":"muhamed_ze"}'::jsonb),
  ('00000000-0000-0003-0000-000000000006','andrea.vukovic@email.hr',now(),now()-interval'30 days',now(),'{"provider":"email","providers":["email"]}'::jsonb,'{"full_name":"Andrea Vuković","username":"andrea_ri"}'::jsonb),
  ('00000000-0000-0003-0000-000000000007','emina.hamidovic@email.ba',now(),now()-interval'8 days',now(),'{"provider":"email","providers":["email"]}'::jsonb,'{"full_name":"Emina Hamidović","username":"emina_sa2"}'::jsonb),
  ('00000000-0000-0003-0000-000000000008','nikola.petrovic@email.ba',now(),now()-interval'22 days',now(),'{"provider":"email","providers":["email"]}'::jsonb,'{"full_name":"Nikola Petrović","username":"nikola_bl"}'::jsonb),
  ('00000000-0000-0003-0000-000000000009','selma.osmic@email.ba',now(),now()-interval'10 days',now(),'{"provider":"email","providers":["email"]}'::jsonb,'{"full_name":"Selma Osmić","username":"selma_mo"}'::jsonb),
  ('00000000-0000-0003-0000-000000000010','luka.horvat@email.hr',now(),now()-interval'35 days',now(),'{"provider":"email","providers":["email"]}'::jsonb,'{"full_name":"Luka Horvat","username":"luka_zg"}'::jsonb),
  ('00000000-0000-0003-0000-000000000011','fatima.alic@email.ba',now(),now()-interval'5 days',now(),'{"provider":"email","providers":["email"]}'::jsonb,'{"full_name":"Fatima Alić","username":"fatima_sa3"}'::jsonb),
  ('00000000-0000-0003-0000-000000000012','goran.djukic@email.ba',now(),now()-interval'28 days',now(),'{"provider":"email","providers":["email"]}'::jsonb,'{"full_name":"Goran Đukić","username":"goran_bl2"}'::jsonb),
  ('00000000-0000-0003-0000-000000000013','vesna.tadic@email.ba',now(),now()-interval'16 days',now(),'{"provider":"email","providers":["email"]}'::jsonb,'{"full_name":"Vesna Tadić","username":"vesna_ze2"}'::jsonb),
  ('00000000-0000-0003-0000-000000000014','denis.imamovic@email.ba',now(),now()-interval'7 days',now(),'{"provider":"email","providers":["email"]}'::jsonb,'{"full_name":"Denis Imamović","username":"denis_tz2"}'::jsonb),
  ('00000000-0000-0003-0000-000000000015','ana.mlinar@email.hr',now(),now()-interval'14 days',now(),'{"provider":"email","providers":["email"]}'::jsonb,'{"full_name":"Ana Mlinar","username":"ana_ri2"}'::jsonb)
ON CONFLICT (id) DO NOTHING;

-- ============================================================================
-- PROFILES
-- ============================================================================
INSERT INTO profiles (id, username, full_name, avatar_url, bio, location)
VALUES
  -- BUSINESS
  ('00000000-0000-0001-0000-000000000001','autostep_salon','AutoStep Auto Salon',
   'https://picsum.photos/seed/biz1/200/200',
   'Ovlašteni salon za prodaju rabljenih vozila. Garaža sa 80+ vozila u ponudi. Sarajevo.','Sarajevo'),
  ('00000000-0000-0001-0000-000000000002','techstore_bih','TechStore BiH',
   'https://picsum.photos/seed/biz2/200/200',
   'Prodaja i otkup mobitela, laptopa i elektronike. Garancija na sve uređaje. Banja Luka.','Banja Luka'),
  ('00000000-0000-0001-0000-000000000003','moda_centar','Moda Centar d.o.o.',
   'https://picsum.photos/seed/biz3/200/200',
   'Multibrand fashion store. Original brendovi po pristupačnim cijenama. Zagreb.','Zagreb'),
  -- PRO
  ('00000000-0000-0002-0000-000000000001','marko_petrovic','Marko Petrović',
   'https://i.pravatar.cc/200?img=11',
   'Pasionat automobila, prodajem isključivo vozila koja osobno poznajem.','Sarajevo'),
  ('00000000-0000-0002-0000-000000000002','ajna_moda','Ajna Hasanović',
   'https://i.pravatar.cc/200?img=5',
   'Fashion enthusiast. Prodajem odjeću i obuću koju sam lično koristila.','Mostar'),
  ('00000000-0000-0002-0000-000000000003','ivan_split','Ivan Kovičević',
   'https://i.pravatar.cc/200?img=8',
   'Radim u IT-u, prodajem tehničku opremu. Split.','Split'),
  ('00000000-0000-0002-0000-000000000004','jasmina_tuzla','Jasmina Begić',
   'https://i.pravatar.cc/200?img=1',
   'Renovirala stan, prodajem kvalitetan namještaj.','Tuzla'),
  ('00000000-0000-0002-0000-000000000005','damir_sport','Damir Đozić',
   'https://i.pravatar.cc/200?img=15',
   'Sportaš i outdoor ljubitelj. Prodajem opremu koju više ne koristim.','Zenica'),
  ('00000000-0000-0002-0000-000000000006','nina_mama','Nina Jurić',
   'https://i.pravatar.cc/200?img=3',
   'Mama dvoje djece. Prodajem dječju opremu u odličnom stanju.','Zagreb'),
  ('00000000-0000-0002-0000-000000000007','emir_tech','Emir Mehmedović',
   'https://i.pravatar.cc/200?img=12',
   'Mobilna tehnika je moja strast. Svi uređaji testirani i funkcionalni.','Sarajevo'),
  ('00000000-0000-0002-0000-000000000008','sara_knjige','Sara Nikolić',
   'https://i.pravatar.cc/200?img=4',
   'Čitam puno, prodajem puno. Knjige u odličnom stanju.','Banja Luka'),
  ('00000000-0000-0002-0000-000000000009','tomo_alati','Tomislav Marić',
   'https://i.pravatar.cc/200?img=20',
   'Majstor s 20 godina iskustva. Prodajem rezervne alate.','Osijek'),
  ('00000000-0000-0002-0000-000000000010','lejla_beauty','Lejla Softić',
   'https://i.pravatar.cc/200?img=6',
   'Beauty & lifestyle. Prodajem kozmetiku i aparate za uljepšavanje.','Mostar'),
  -- NORMAL
  ('00000000-0000-0003-0000-000000000001','haris_sa','Haris Čaušević',
   'https://i.pravatar.cc/200?img=22','Pozdrav! Prodajem par stvari koje mi više ne trebaju.','Sarajevo'),
  ('00000000-0000-0003-0000-000000000002','petra_zg','Petra Marić',
   'https://i.pravatar.cc/200?img=2','Redovito osvježavam garderobni ormar.','Zagreb'),
  ('00000000-0000-0003-0000-000000000003','alen_tz','Alen Bašić',
   'https://i.pravatar.cc/200?img=16','Sport i fitnes su moj život.','Tuzla'),
  ('00000000-0000-0003-0000-000000000004','maja_st','Maja Stojanović',
   'https://i.pravatar.cc/200?img=7','Fotografkinja, prodajem staru opremu.','Split'),
  ('00000000-0000-0003-0000-000000000005','muhamed_ze','Muhamed Kurtović',
   'https://i.pravatar.cc/200?img=18','Majstor za male popravke. Prodajem višak alata.','Zenica'),
  ('00000000-0000-0003-0000-000000000006','andrea_ri','Andrea Vuković',
   'https://i.pravatar.cc/200?img=9','Gamer i filmski fan.','Rijeka'),
  ('00000000-0000-0003-0000-000000000007','emina_sa2','Emina Hamidović',
   'https://i.pravatar.cc/200?img=14','Mlada mama, dječja oprema u top stanju.','Sarajevo'),
  ('00000000-0000-0003-0000-000000000008','nikola_bl','Nikola Petrović',
   'https://i.pravatar.cc/200?img=24','Muzičar amater, prodajem gitaru.','Banja Luka'),
  ('00000000-0000-0003-0000-000000000009','selma_mo','Selma Osmić',
   'https://i.pravatar.cc/200?img=10','Ljubiteljica kućnog uređenja.','Mostar'),
  ('00000000-0000-0003-0000-000000000010','luka_zg','Luka Horvat',
   'https://i.pravatar.cc/200?img=17','Prodajem štenad zlatnog retrivera.','Zagreb'),
  ('00000000-0000-0003-0000-000000000011','fatima_sa3','Fatima Alić',
   'https://i.pravatar.cc/200?img=13','Kupujem pa prodajem. Sve u odličnom stanju.','Sarajevo'),
  ('00000000-0000-0003-0000-000000000012','goran_bl2','Goran Đukić',
   'https://i.pravatar.cc/200?img=23','Čitatelj, prodajem knjige.','Banja Luka'),
  ('00000000-0000-0003-0000-000000000013','vesna_ze2','Vesna Tadić',
   'https://i.pravatar.cc/200?img=19','Vrtlarka i domaćica.','Zenica'),
  ('00000000-0000-0003-0000-000000000014','denis_tz2','Denis Imamović',
   'https://i.pravatar.cc/200?img=21','Planinarski entuzijast.','Tuzla'),
  ('00000000-0000-0003-0000-000000000015','ana_ri2','Ana Mlinar',
   'https://i.pravatar.cc/200?img=25','Nakit je moja strast.','Rijeka')
ON CONFLICT (id) DO UPDATE SET
  username = EXCLUDED.username,
  full_name = EXCLUDED.full_name,
  avatar_url = EXCLUDED.avatar_url,
  bio = EXCLUDED.bio,
  location = EXCLUDED.location;

-- ============================================================================
-- PRODUCTS
-- Koristimo subquery za dohvat category_id po slugu.
-- Ako slug ne postoji → red se ne umeće (sigurno).
-- ============================================================================

-- ────────────────────────────────────────────────────────────────────────────
-- BUSINESS 1: AutoStep Auto Salon — 12 vozila
-- ────────────────────────────────────────────────────────────────────────────
INSERT INTO products (seller_id,title,description,price,category_id,condition,images,status,location,views_count,favorites_count,attributes,tags,created_at)
SELECT '00000000-0000-0001-0000-000000000001','BMW X5 xDrive30d 2020','Odlično očuvan BMW X5, full oprema, panoramski krov, kamera 360°. Jedno vlasništvo, servisna knjiga kompletna.',52000,c.id,'used',ARRAY['https://picsum.photos/seed/s101/800/600'],'active','Sarajevo',534,38,'{"marka":"BMW","model":"X5 xDrive30d","godiste":2020,"km":68000,"gorivo":"Dizel","mjenjac":"Automatik","karoserija":"SUV","boja":"Crna","snaga":265}'::jsonb,ARRAY['bmw','x5','suv','dizel','automatik','xdrive'],now()-interval'60 days'
FROM categories c WHERE c.slug='vozila-osobni-automobili';

INSERT INTO products (seller_id,title,description,price,category_id,condition,images,status,location,views_count,favorites_count,attributes,tags,created_at)
SELECT '00000000-0000-0001-0000-000000000001','Mercedes-Benz C200 Avantgarde 2019','Elegantni Mercedesov sedan, 1.5T benzinski motor, idealan za poslovne klijente. Servisiran u ovlaštenom servisu.',34500,c.id,'used',ARRAY['https://picsum.photos/seed/s102/800/600'],'active','Sarajevo',312,22,'{"marka":"Mercedes-Benz","model":"C200","godiste":2019,"km":89000,"gorivo":"Benzin","mjenjac":"Automatik","karoserija":"Limuzina","boja":"Bijela","snaga":184}'::jsonb,ARRAY['mercedes','c200','sedan','benzin','automatik'],now()-interval'55 days'
FROM categories c WHERE c.slug='vozila-osobni-automobili';

INSERT INTO products (seller_id,title,description,price,category_id,condition,images,status,location,views_count,favorites_count,attributes,tags,created_at)
SELECT '00000000-0000-0001-0000-000000000001','VW Passat B8 2.0 TDI 2017','Passat u odličnom stanju, digitalni kokpit, LED farovi, tempomat. Idealan porodični auto.',21000,c.id,'used',ARRAY['https://picsum.photos/seed/s103/800/600'],'active','Sarajevo',287,19,'{"marka":"Volkswagen","model":"Passat B8","godiste":2017,"km":142000,"gorivo":"Dizel","mjenjac":"DSG","karoserija":"Karavan","boja":"Siva","snaga":150}'::jsonb,ARRAY['passat','vw','karavan','tdi','dsg'],now()-interval'50 days'
FROM categories c WHERE c.slug='vozila-osobni-automobili';

INSERT INTO products (seller_id,title,description,price,category_id,condition,images,status,location,views_count,favorites_count,attributes,tags,created_at)
SELECT '00000000-0000-0001-0000-000000000001','Audi A4 2.0 TDI S-Line 2018','A4 u S-Line paketu, sportski izgled, kožna unutrašnjost, 4 zone klima. Bez ulaganja.',24500,c.id,'used',ARRAY['https://picsum.photos/seed/s104/800/600'],'active','Sarajevo',445,31,'{"marka":"Audi","model":"A4","godiste":2018,"km":118000,"gorivo":"Dizel","mjenjac":"S-tronic","karoserija":"Limuzina","boja":"Plava","snaga":190}'::jsonb,ARRAY['audi','a4','sline','tdi','limuzina'],now()-interval'45 days'
FROM categories c WHERE c.slug='vozila-osobni-automobili';

INSERT INTO products (seller_id,title,description,price,category_id,condition,images,status,location,views_count,favorites_count,attributes,tags,created_at)
SELECT '00000000-0000-0001-0000-000000000001','Toyota RAV4 Hybrid 2021','Najprodavaniji SUV u Europi! Hibridni motor, AWD, praktičan i ekonomičan. Pogon na sve kotače.',38000,c.id,'like_new',ARRAY['https://picsum.photos/seed/s105/800/600'],'active','Sarajevo',689,52,'{"marka":"Toyota","model":"RAV4 Hybrid","godiste":2021,"km":34000,"gorivo":"Hibrid","mjenjac":"Automatik","karoserija":"SUV","boja":"Srebrna","snaga":218}'::jsonb,ARRAY['toyota','rav4','hibrid','suv','awd','ekolosko'],now()-interval'40 days'
FROM categories c WHERE c.slug='vozila-osobni-automobili';

INSERT INTO products (seller_id,title,description,price,category_id,condition,images,status,location,views_count,favorites_count,attributes,tags,created_at)
SELECT '00000000-0000-0001-0000-000000000001','Opel Astra K 1.6 CDTI Innovation 2017','Astra u Innovation opremi, full LED, parking kamera, lane assist. Ekonomičan i pouzdan.',13500,c.id,'used',ARRAY['https://picsum.photos/seed/s106/800/600'],'active','Sarajevo',198,11,'{"marka":"Opel","model":"Astra K","godiste":2017,"km":165000,"gorivo":"Dizel","mjenjac":"Manual","karoserija":"Hatchback","boja":"Crvena","snaga":110}'::jsonb,ARRAY['opel','astra','cdti','hatchback','dizel'],now()-interval'35 days'
FROM categories c WHERE c.slug='vozila-osobni-automobili';

INSERT INTO products (seller_id,title,description,price,category_id,condition,images,status,location,views_count,favorites_count,attributes,tags,created_at)
SELECT '00000000-0000-0001-0000-000000000001','Škoda Octavia 2.0 TDI DSG 2019','Octavia karavan, DSG mjenjač, velki gepek, idealan za porodice. Servisna knjiga kompletna.',18500,c.id,'used',ARRAY['https://picsum.photos/seed/s107/800/600'],'active','Sarajevo',334,24,'{"marka":"Škoda","model":"Octavia","godiste":2019,"km":97000,"gorivo":"Dizel","mjenjac":"DSG","karoserija":"Karavan","boja":"Siva","snaga":150}'::jsonb,ARRAY['skoda','octavia','karavan','tdi','dsg'],now()-interval'30 days'
FROM categories c WHERE c.slug='vozila-osobni-automobili';

INSERT INTO products (seller_id,title,description,price,category_id,condition,images,status,location,views_count,favorites_count,attributes,tags,created_at)
SELECT '00000000-0000-0001-0000-000000000001','Ford Focus 1.5 EcoBoost ST-Line 2018','Focus ST-Line s 19" alufelgama, Bi-Xenon farovima i B&O audio sistemom. Odlično stanje.',14500,c.id,'used',ARRAY['https://picsum.photos/seed/s108/800/600'],'active','Mostar',167,9,'{"marka":"Ford","model":"Focus","godiste":2018,"km":128000,"gorivo":"Benzin","mjenjac":"Automatik","karoserija":"Hatchback","boja":"Narandžasta","snaga":150}'::jsonb,ARRAY['ford','focus','stline','benzin','automatik'],now()-interval'25 days'
FROM categories c WHERE c.slug='vozila-osobni-automobili';

INSERT INTO products (seller_id,title,description,price,category_id,condition,images,status,location,views_count,favorites_count,attributes,tags,created_at)
SELECT '00000000-0000-0001-0000-000000000001','Renault Megane 1.5 dCi Zen 2016','Ekonomičan i pouzdan. Mali potrošač (4.5L/100km), idealan za grad i duže relacije.',10800,c.id,'used',ARRAY['https://picsum.photos/seed/s109/800/600'],'active','Mostar',143,7,'{"marka":"Renault","model":"Megane","godiste":2016,"km":189000,"gorivo":"Dizel","mjenjac":"Manual","karoserija":"Hatchback","boja":"Bijela","snaga":110}'::jsonb,ARRAY['renault','megane','dcI','dizel','ekonomican'],now()-interval'22 days'
FROM categories c WHERE c.slug='vozila-osobni-automobili';

INSERT INTO products (seller_id,title,description,price,category_id,condition,images,status,location,views_count,favorites_count,attributes,tags,created_at)
SELECT '00000000-0000-0001-0000-000000000001','Peugeot 3008 GT Line 1.5 BlueHDi 2019','SUV kupé design, full LED Matrix farovi, masažna sjedala, HUD. Reprezentativan auto.',26500,c.id,'used',ARRAY['https://picsum.photos/seed/s110/800/600'],'active','Sarajevo',278,18,'{"marka":"Peugeot","model":"3008","godiste":2019,"km":102000,"gorivo":"Dizel","mjenjac":"Automatik","karoserija":"SUV","boja":"Crna","snaga":130}'::jsonb,ARRAY['peugeot','3008','gtline','bluehdi','suv'],now()-interval'18 days'
FROM categories c WHERE c.slug='vozila-osobni-automobili';

INSERT INTO products (seller_id,title,description,price,category_id,condition,images,status,location,views_count,favorites_count,attributes,tags,created_at)
SELECT '00000000-0000-0001-0000-000000000001','Hyundai Tucson 2.0 CRDi 4WD 2020','Tucson u odličnom stanju, pogon 4x4, zimske gume u kompletu. Provjerena povijest vozila.',28000,c.id,'used',ARRAY['https://picsum.photos/seed/s111/800/600'],'active','Sarajevo',392,28,'{"marka":"Hyundai","model":"Tucson","godiste":2020,"km":76000,"gorivo":"Dizel","mjenjac":"Automatik","karoserija":"SUV","boja":"Zelena","snaga":185}'::jsonb,ARRAY['hyundai','tucson','crdi','4wd','suv'],now()-interval'15 days'
FROM categories c WHERE c.slug='vozila-osobni-automobili';

INSERT INTO products (seller_id,title,description,price,category_id,condition,images,status,location,views_count,favorites_count,attributes,tags,created_at)
SELECT '00000000-0000-0001-0000-000000000001','Honda Civic 1.0 VTEC Turbo 2019','Sportski i ekonomičan Civic s turbomotorem. Niska potrošnja, visoka pouzdanost.',16500,c.id,'used',ARRAY['https://picsum.photos/seed/s112/800/600'],'active','Sarajevo',234,15,'{"marka":"Honda","model":"Civic","godiste":2019,"km":91000,"gorivo":"Benzin","mjenjac":"Manual","karoserija":"Hatchback","boja":"Bijela","snaga":129}'::jsonb,ARRAY['honda','civic','vtec','turbo','benzin'],now()-interval'12 days'
FROM categories c WHERE c.slug='vozila-osobni-automobili';

-- ────────────────────────────────────────────────────────────────────────────
-- BUSINESS 2: TechStore BiH — 10 artikala elektronike
-- ────────────────────────────────────────────────────────────────────────────
INSERT INTO products (seller_id,title,description,price,category_id,condition,images,status,location,views_count,favorites_count,attributes,tags,created_at)
SELECT '00000000-0000-0001-0000-000000000002','Apple iPhone 14 Pro 256GB Deep Purple','Kao nov, korišten 3 mjeseca. Kompletan komplet: kutija, punjač, zaštitno staklo. Garancija do 2025.',750,c.id,'like_new',ARRAY['https://picsum.photos/seed/s113/800/600'],'active','Banja Luka',456,34,'{"marka":"Apple","model":"iPhone 14 Pro","memorija":"256GB","boja":"Deep Purple","baterija":94}'::jsonb,ARRAY['iphone','apple','14pro','256gb','iOS'],now()-interval'60 days'
FROM categories c WHERE c.slug='mob-iphone';

INSERT INTO products (seller_id,title,description,price,category_id,condition,images,status,location,views_count,favorites_count,attributes,tags,created_at)
SELECT '00000000-0000-0001-0000-000000000002','Apple iPhone 13 128GB Midnight','Odlično stanje, bez ogrebotina. Baterija 91%. Unlock za sve mreže.',480,c.id,'used',ARRAY['https://picsum.photos/seed/s114/800/600'],'active','Banja Luka',324,22,'{"marka":"Apple","model":"iPhone 13","memorija":"128GB","boja":"Midnight","baterija":91}'::jsonb,ARRAY['iphone','apple','13','128gb','iOS'],now()-interval'55 days'
FROM categories c WHERE c.slug='mob-iphone';

INSERT INTO products (seller_id,title,description,price,category_id,condition,images,status,location,views_count,favorites_count,attributes,tags,created_at)
SELECT '00000000-0000-0001-0000-000000000002','Samsung Galaxy S24 Ultra 256GB Titanium','Samsung flagship, S Pen uključen, AI kamera sistema. Garancija. Kao nov.',890,c.id,'like_new',ARRAY['https://picsum.photos/seed/s115/800/600'],'active','Banja Luka',512,41,'{"marka":"Samsung","model":"Galaxy S24 Ultra","memorija":"256GB","boja":"Titanium Black","baterija":98}'::jsonb,ARRAY['samsung','s24ultra','galaxy','android','spen'],now()-interval'50 days'
FROM categories c WHERE c.slug='mob-samsung';

INSERT INTO products (seller_id,title,description,price,category_id,condition,images,status,location,views_count,favorites_count,attributes,tags,created_at)
SELECT '00000000-0000-0001-0000-000000000002','Samsung Galaxy A54 5G 128GB','Odličan mid-range Samsung s 5G podrškom. Velika baterija, Super AMOLED ekran.',280,c.id,'used',ARRAY['https://picsum.photos/seed/s116/800/600'],'active','Banja Luka',187,12,'{"marka":"Samsung","model":"Galaxy A54","memorija":"128GB","boja":"Grafitna","baterija":89}'::jsonb,ARRAY['samsung','a54','5g','galaxy','android'],now()-interval'45 days'
FROM categories c WHERE c.slug='mob-samsung';

INSERT INTO products (seller_id,title,description,price,category_id,condition,images,status,location,views_count,favorites_count,attributes,tags,created_at)
SELECT '00000000-0000-0001-0000-000000000002','Apple MacBook Pro M2 14" 512GB','M2 čip, 16GB RAM, 512GB SSD. Kupljen u Beču, račun dostupan. Savršen za programere i dizajnere.',1450,c.id,'like_new',ARRAY['https://picsum.photos/seed/s117/800/600'],'active','Banja Luka',345,29,'{"marka":"Apple","model":"MacBook Pro 14","procesor":"M2","ram":"16GB","ssd":"512GB","boja":"Space Grey"}'::jsonb,ARRAY['macbook','apple','m2','laptop','macos','programiranje'],now()-interval'40 days'
FROM categories c WHERE c.slug='rac-laptopi';

INSERT INTO products (seller_id,title,description,price,category_id,condition,images,status,location,views_count,favorites_count,attributes,tags,created_at)
SELECT '00000000-0000-0001-0000-000000000002','Dell XPS 15 9530 Intel i7 2023','Dell XPS 15 s OLED ekranom, i7-13700H, 32GB RAM, NVIDIA RTX 4060. Premium laptop.',980,c.id,'used',ARRAY['https://picsum.photos/seed/s118/800/600'],'active','Banja Luka',234,18,'{"marka":"Dell","model":"XPS 15 9530","procesor":"i7-13700H","ram":"32GB","gpu":"RTX 4060","ekran":"OLED 3.5K"}'::jsonb,ARRAY['dell','xps15','laptop','oled','rtx4060','gaming'],now()-interval'35 days'
FROM categories c WHERE c.slug='rac-laptopi';

INSERT INTO products (seller_id,title,description,price,category_id,condition,images,status,location,views_count,favorites_count,attributes,tags,created_at)
SELECT '00000000-0000-0001-0000-000000000002','Samsung 55" QLED 4K QE55Q80C','Samsung QLED TV, 4K, 100Hz, Google TV, AirSlim dizajn. Savršen za dnevnu sobu.',620,c.id,'used',ARRAY['https://picsum.photos/seed/s119/800/600'],'active','Banja Luka',289,21,'{"marka":"Samsung","model":"QE55Q80C","dijagonala":"55 inča","rezolucija":"4K","tip":"QLED","hdmi":4}'::jsonb,ARRAY['samsung','qled','tv','4k','55incha','smart'],now()-interval'30 days'
FROM categories c WHERE c.slug='teh-televizori';

INSERT INTO products (seller_id,title,description,price,category_id,condition,images,status,location,views_count,favorites_count,attributes,tags,created_at)
SELECT '00000000-0000-0001-0000-000000000002','LG OLED 65" C3 2023','LG OLED evo, kinematska slika, Dolby Vision/Atmos, gaming mode 120Hz. Jako malo korišten.',1100,c.id,'like_new',ARRAY['https://picsum.photos/seed/s120/800/600'],'active','Banja Luka',412,35,'{"marka":"LG","model":"OLED65C3","dijagonala":"65 inča","rezolucija":"4K","tip":"OLED","hdmi":4,"refresh":"120Hz"}'::jsonb,ARRAY['lg','oled','65incha','4k','dolby','gaming'],now()-interval'25 days'
FROM categories c WHERE c.slug='teh-televizori';

INSERT INTO products (seller_id,title,description,price,category_id,condition,images,status,location,views_count,favorites_count,attributes,tags,created_at)
SELECT '00000000-0000-0001-0000-000000000002','PlayStation 5 Disc Edition + 2 džojstika','PS5 u odličnom stanju, 2 DualSense kontrolera, FIFA 25 uključen. Bez ogrebotina.',450,c.id,'used',ARRAY['https://picsum.photos/seed/s121/800/600'],'active','Banja Luka',678,58,'{"marka":"Sony","model":"PlayStation 5","tip":"Disc","verzija":"CFI-1200A"}'::jsonb,ARRAY['ps5','playstation','sony','gaming','konzola'],now()-interval'20 days'
FROM categories c WHERE c.slug='vig-playstation';

INSERT INTO products (seller_id,title,description,price,category_id,condition,images,status,location,views_count,favorites_count,attributes,tags,created_at)
SELECT '00000000-0000-0001-0000-000000000002','Apple AirPods Pro 2. generacija','Aktivno poništavanje šuma, MagSafe case. Kupljeni u Beču, garancija do 2025.',180,c.id,'like_new',ARRAY['https://picsum.photos/seed/s122/800/600'],'active','Banja Luka',234,19,'{"marka":"Apple","model":"AirPods Pro 2","tip":"In-ear","baterija":96}'::jsonb,ARRAY['airpods','apple','slusalice','anc','bluetooth'],now()-interval'15 days'
FROM categories c WHERE c.slug='mob-slusalice';

-- ────────────────────────────────────────────────────────────────────────────
-- BUSINESS 3: Moda Centar — 8 modnih artikala
-- ────────────────────────────────────────────────────────────────────────────
INSERT INTO products (seller_id,title,description,price,category_id,condition,images,status,location,views_count,favorites_count,attributes,tags,created_at)
SELECT '00000000-0000-0001-0000-000000000003','Tommy Hilfiger zimska jakna muška M','Original Tommy Hilfiger, kupljena u TH shopu u Beču. Nosena samo jednu sezonu. Savršen poklon.',85,c.id,'like_new',ARRAY['https://picsum.photos/seed/s123/800/600'],'active','Zagreb',178,14,'{"brend":"Tommy Hilfiger","veličina":"M","boja":"Navy"}'::jsonb,ARRAY['tommy','hilfiger','jakna','muska','zimska'],now()-interval'55 days'
FROM categories c WHERE c.slug='odj-muska-odjeca';

INSERT INTO products (seller_id,title,description,price,category_id,condition,images,status,location,views_count,favorites_count,attributes,tags,created_at)
SELECT '00000000-0000-0001-0000-000000000003','Zara ženski kaput wool-blend L','Elegantni kaput dugih linija, 60% vuna. Nosena jednu sezonu, bez ikakvih oštećenja.',65,c.id,'used',ARRAY['https://picsum.photos/seed/s124/800/600'],'active','Zagreb',134,11,'{"brend":"Zara","veličina":"L","boja":"Kamel","materijal":"Vuna 60%"}'::jsonb,ARRAY['zara','kaput','zenska','vuna','elegantno'],now()-interval'50 days'
FROM categories c WHERE c.slug='odj-zenska-odjeca';

INSERT INTO products (seller_id,title,description,price,category_id,condition,images,status,location,views_count,favorites_count,attributes,tags,created_at)
SELECT '00000000-0000-0001-0000-000000000003','Nike Air Max 270 bijele vel. 42','Nike Air Max 270, bijelo/crna kombinacija, veličina 42. Nosene samo 2-3 puta. Kao nove.',95,c.id,'like_new',ARRAY['https://picsum.photos/seed/s125/800/600'],'active','Zagreb',267,22,'{"brend":"Nike","model":"Air Max 270","veličina":42,"boja":"Bijela/Crna"}'::jsonb,ARRAY['nike','airmax','tenisice','muske','bijele'],now()-interval'45 days'
FROM categories c WHERE c.slug='odj-muska-obuca';

INSERT INTO products (seller_id,title,description,price,category_id,condition,images,status,location,views_count,favorites_count,attributes,tags,created_at)
SELECT '00000000-0000-0001-0000-000000000003','Adidas Ultraboost 22 ženske vel. 38','Adidas Ultraboost, roze/bijele, veličina 38. Super za trčanje i casual nošenje.',75,c.id,'used',ARRAY['https://picsum.photos/seed/s126/800/600'],'active','Zagreb',189,16,'{"brend":"Adidas","model":"Ultraboost 22","veličina":38,"boja":"Roze/Bijela"}'::jsonb,ARRAY['adidas','ultraboost','tenisice','zenske','trčanje'],now()-interval'40 days'
FROM categories c WHERE c.slug='odj-zenska-obuca';

INSERT INTO products (seller_id,title,description,price,category_id,condition,images,status,location,views_count,favorites_count,attributes,tags,created_at)
SELECT '00000000-0000-0001-0000-000000000003','Michael Kors crossbody torba smeđa','Original Michael Kors torba, crossbody dizajn, unutrašnji džepovi. Malo korišćena, bez oštećenja.',120,c.id,'used',ARRAY['https://picsum.photos/seed/s127/800/600'],'active','Zagreb',312,28,'{"brend":"Michael Kors","tip":"Crossbody","boja":"Smeđa","materijal":"Koža"}'::jsonb,ARRAY['michaelkors','torba','crossbody','kozna','dizajner'],now()-interval'35 days'
FROM categories c WHERE c.slug='odj-torbe';

INSERT INTO products (seller_id,title,description,price,category_id,condition,images,status,location,views_count,favorites_count,attributes,tags,created_at)
SELECT '00000000-0000-0001-0000-000000000003','Guess ručni sat muški GW0203G1','Guess quartz sat, mineralno staklo, vodootpornost 30m. U originalnoj kutiji. Kao nov.',180,c.id,'like_new',ARRAY['https://picsum.photos/seed/s128/800/600'],'active','Zagreb',198,17,'{"brend":"Guess","model":"GW0203G1","tip":"Quartz","boja":"Zlatna/Plava"}'::jsonb,ARRAY['guess','sat','muski','quartz','zlatni'],now()-interval'30 days'
FROM categories c WHERE c.slug='odj-nakit';

INSERT INTO products (seller_id,title,description,price,category_id,condition,images,status,location,views_count,favorites_count,attributes,tags,created_at)
SELECT '00000000-0000-0001-0000-000000000003','Calvin Klein jeans muške slim 32/32','Original CK jeans, slim fit, nosene par puta. U odličnom stanju.',55,c.id,'used',ARRAY['https://picsum.photos/seed/s129/800/600'],'active','Zagreb',145,9,'{"brend":"Calvin Klein","tip":"Slim fit","veličina":"32/32","boja":"Tamno plava"}'::jsonb,ARRAY['calvinklein','jeans','traperice','muske','slim'],now()-interval'25 days'
FROM categories c WHERE c.slug='odj-muska-odjeca';

INSERT INTO products (seller_id,title,description,price,category_id,condition,images,status,location,views_count,favorites_count,attributes,tags,created_at)
SELECT '00000000-0000-0001-0000-000000000003','H&M haljina ljetna maxi L floralni print','Lagana ljetna haljina, 100% viskoza, veličina L. Nosena par puta za odmor.',25,c.id,'used',ARRAY['https://picsum.photos/seed/s130/800/600'],'active','Zagreb',123,8,'{"brend":"H&M","tip":"Maxi haljina","veličina":"L","boja":"Floralni print"}'::jsonb,ARRAY['hm','haljina','zenska','maxi','ljeto','floralni'],now()-interval'20 days'
FROM categories c WHERE c.slug='odj-zenska-odjeca';

-- ────────────────────────────────────────────────────────────────────────────
-- PRO 1: Marko Petrović — 4 automobila
-- ────────────────────────────────────────────────────────────────────────────
INSERT INTO products (seller_id,title,description,price,category_id,condition,images,status,location,views_count,favorites_count,attributes,tags,created_at)
SELECT '00000000-0000-0002-0000-000000000001','VW Golf 8 1.5 eTSI DSG 2022','Golf 8 u Life opremi, eTSI mild hibrid, DSG automat. Niske emissions, economičan i komforan. Jedno vlasništvo.',24900,c.id,'used',ARRAY['https://picsum.photos/seed/s131/800/600'],'active','Sarajevo',445,32,'{"marka":"Volkswagen","model":"Golf 8","godiste":2022,"km":31000,"gorivo":"Benzin/Hibrid","mjenjac":"DSG","karoserija":"Hatchback","boja":"Siva","snaga":150}'::jsonb,ARRAY['golf','vw','etsi','hibrid','dsg','2022'],now()-interval'45 days'
FROM categories c WHERE c.slug='vozila-osobni-automobili';

INSERT INTO products (seller_id,title,description,price,category_id,condition,images,status,location,views_count,favorites_count,attributes,tags,created_at)
SELECT '00000000-0000-0002-0000-000000000001','BMW 320d G20 xDrive 2021','Svježi uvoz iz Austrije, full servisna knjiga BMW, M paket spolja. Bez ulaganja.',32000,c.id,'used',ARRAY['https://picsum.photos/seed/s132/800/600'],'active','Sarajevo',378,27,'{"marka":"BMW","model":"320d G20","godiste":2021,"km":58000,"gorivo":"Dizel","mjenjac":"Automatik","karoserija":"Limuzina","boja":"Crna","snaga":190}'::jsonb,ARRAY['bmw','320d','g20','xdrive','mpaket'],now()-interval'40 days'
FROM categories c WHERE c.slug='vozila-osobni-automobili';

INSERT INTO products (seller_id,title,description,price,category_id,condition,images,status,location,views_count,favorites_count,attributes,tags,created_at)
SELECT '00000000-0000-0002-0000-000000000001','Audi Q3 2.0 TDI S-Tronic 2020','Kompaktni SUV sa panoramskim krovom i virtual cockpitom. Savršen za grad i autoput.',30500,c.id,'used',ARRAY['https://picsum.photos/seed/s133/800/600'],'active','Sarajevo',312,23,'{"marka":"Audi","model":"Q3","godiste":2020,"km":72000,"gorivo":"Dizel","mjenjac":"S-tronic","karoserija":"SUV","boja":"Bijela","snaga":150}'::jsonb,ARRAY['audi','q3','suv','tdi','stronic'],now()-interval'35 days'
FROM categories c WHERE c.slug='vozila-osobni-automobili';

INSERT INTO products (seller_id,title,description,price,category_id,condition,images,status,location,views_count,favorites_count,attributes,tags,created_at)
SELECT '00000000-0000-0002-0000-000000000001','Toyota Yaris 1.5 Hybrid 2022','Najpouzdaniji mali auto! Hibrid, gradska vožnja skoro besplatna. 0-60km/h čisto električno.',19500,c.id,'used',ARRAY['https://picsum.photos/seed/s134/800/600'],'active','Sarajevo',289,20,'{"marka":"Toyota","model":"Yaris Hybrid","godiste":2022,"km":22000,"gorivo":"Hibrid","mjenjac":"CVT","karoserija":"Hatchback","boja":"Plava","snaga":116}'::jsonb,ARRAY['toyota','yaris','hibrid','cvt','malo','ekonomican'],now()-interval'30 days'
FROM categories c WHERE c.slug='vozila-osobni-automobili';

-- ────────────────────────────────────────────────────────────────────────────
-- PRO 2: Ajna Hasanović — 4 modna artikla
-- ────────────────────────────────────────────────────────────────────────────
INSERT INTO products (seller_id,title,description,price,category_id,condition,images,status,location,views_count,favorites_count,attributes,tags,created_at)
SELECT '00000000-0000-0002-0000-000000000002','Mango crni blazer oversized XS/S','Mango blazer u oversized kroju, nosena jednom za svadbu. Savršen za poslovne prilike.',40,c.id,'like_new',ARRAY['https://picsum.photos/seed/s135/800/600'],'active','Mostar',145,12,'{"brend":"Mango","veličina":"XS/S","boja":"Crna","stil":"Blazer"}'::jsonb,ARRAY['mango','blazer','zenska','oversized','crni'],now()-interval'30 days'
FROM categories c WHERE c.slug='odj-zenska-odjeca';

INSERT INTO products (seller_id,title,description,price,category_id,condition,images,status,location,views_count,favorites_count,attributes,tags,created_at)
SELECT '00000000-0000-0002-0000-000000000002','Zara cipele na petu vel. 37 nude','Zara kitten heel cipele, boja nude, veličina 37. Nosene dva puta.',35,c.id,'like_new',ARRAY['https://picsum.photos/seed/s136/800/600'],'active','Mostar',112,9,'{"brend":"Zara","veličina":37,"boja":"Nude","tip":"Kitten heel"}'::jsonb,ARRAY['zara','cipele','stikle','nude','zenske'],now()-interval'25 days'
FROM categories c WHERE c.slug='odj-zenska-obuca';

INSERT INTO products (seller_id,title,description,price,category_id,condition,images,status,location,views_count,favorites_count,attributes,tags,created_at)
SELECT '00000000-0000-0002-0000-000000000002','Reserved zimska jakna puffer M','Topla puffer jakna u bordo boji. Nosena jednu zimu, u odličnom stanju.',45,c.id,'used',ARRAY['https://picsum.photos/seed/s137/800/600'],'active','Mostar',98,7,'{"brend":"Reserved","veličina":"M","boja":"Bordo","tip":"Puffer"}'::jsonb,ARRAY['reserved','jakna','puffer','zenska','zimska'],now()-interval'20 days'
FROM categories c WHERE c.slug='odj-zenska-odjeca';

INSERT INTO products (seller_id,title,description,price,category_id,condition,images,status,location,views_count,favorites_count,attributes,tags,created_at)
SELECT '00000000-0000-0002-0000-000000000002','Guess torbica crossbody siva','Guess crossbody torbica u sivoj boji sa zlatnim detaljima. Jako malo korišćena.',55,c.id,'used',ARRAY['https://picsum.photos/seed/s138/800/600'],'active','Mostar',134,11,'{"brend":"Guess","tip":"Crossbody","boja":"Siva/Zlatna"}'::jsonb,ARRAY['guess','torba','crossbody','siva','zlatna'],now()-interval'15 days'
FROM categories c WHERE c.slug='odj-torbe';

-- ────────────────────────────────────────────────────────────────────────────
-- PRO 3: Ivan Kovičević — 4 tehničke artikle
-- ────────────────────────────────────────────────────────────────────────────
INSERT INTO products (seller_id,title,description,price,category_id,condition,images,status,location,views_count,favorites_count,attributes,tags,created_at)
SELECT '00000000-0000-0002-0000-000000000003','Lenovo ThinkPad X1 Carbon Gen10 2022','Poslovni ultrabook, i7-1260P, 16GB LPDDR5, 512GB SSD, 14" IPS 2.8K. Idealan za rad na terenu.',820,c.id,'used',ARRAY['https://picsum.photos/seed/s139/800/600'],'active','Split',267,19,'{"marka":"Lenovo","model":"ThinkPad X1 Carbon G10","procesor":"i7-1260P","ram":"16GB","ssd":"512GB"}'::jsonb,ARRAY['lenovo','thinkpad','x1carbon','laptop','poslovni'],now()-interval'50 days'
FROM categories c WHERE c.slug='rac-laptopi';

INSERT INTO products (seller_id,title,description,price,category_id,condition,images,status,location,views_count,favorites_count,attributes,tags,created_at)
SELECT '00000000-0000-0002-0000-000000000003','Xiaomi 13 Pro 256GB crni','Xiaomi flagship s Leica kameram sistemom. 50MP Summilux objektiv, Snapdragon 8 Gen2. Kao nov.',480,c.id,'like_new',ARRAY['https://picsum.photos/seed/s140/800/600'],'active','Split',198,15,'{"marka":"Xiaomi","model":"13 Pro","memorija":"256GB","boja":"Crna","baterija":96}'::jsonb,ARRAY['xiaomi','13pro','leica','snapdragon','android'],now()-interval'45 days'
FROM categories c WHERE c.slug='mob-xiaomi';

INSERT INTO products (seller_id,title,description,price,category_id,condition,images,status,location,views_count,favorites_count,attributes,tags,created_at)
SELECT '00000000-0000-0002-0000-000000000003','Sony 50" Bravia 4K X85K Google TV','Sony 4K HDR TV, Google TV, Triluminos Pro, Acoustic Multi-Audio. Savršena slika i zvuk.',480,c.id,'used',ARRAY['https://picsum.photos/seed/s141/800/600'],'active','Split',223,16,'{"marka":"Sony","model":"X85K","dijagonala":"50 inča","rezolucija":"4K","tip":"LED","hdmi":4}'::jsonb,ARRAY['sony','tv','bravia','4k','googletv'],now()-interval'40 days'
FROM categories c WHERE c.slug='teh-televizori';

INSERT INTO products (seller_id,title,description,price,category_id,condition,images,status,location,views_count,favorites_count,attributes,tags,created_at)
SELECT '00000000-0000-0002-0000-000000000003','Asus ROG Zephyrus G14 2023 gaming laptop','Ryzen 9 7940HS, RTX 4060, 16GB RAM, 1TB SSD. Idealan za gaming i kreativni rad.',1100,c.id,'used',ARRAY['https://picsum.photos/seed/s142/800/600'],'active','Split',389,31,'{"marka":"Asus","model":"ROG Zephyrus G14","procesor":"Ryzen 9 7940HS","ram":"16GB","gpu":"RTX 4060","ssd":"1TB"}'::jsonb,ARRAY['asus','rog','gaming','laptop','rtx4060','ryzen9'],now()-interval'35 days'
FROM categories c WHERE c.slug='rac-laptopi';

-- ────────────────────────────────────────────────────────────────────────────
-- PRO 4: Jasmina Begić — 3 namještaja
-- ────────────────────────────────────────────────────────────────────────────
INSERT INTO products (seller_id,title,description,price,category_id,condition,images,status,location,views_count,favorites_count,attributes,tags,created_at)
SELECT '00000000-0000-0002-0000-000000000004','IKEA garnitura 3+1 sjedišta + stolić','Siva tkanina, izuzetno udobna. Demontovana za transport, samopreuzimanje Tuzla.',380,c.id,'used',ARRAY['https://picsum.photos/seed/s143/800/600'],'active','Tuzla',167,13,'{"brend":"IKEA","boja":"Siva","materijal":"Tkanina","sjedista":"3+1"}'::jsonb,ARRAY['ikea','garnitura','kauč','sofa','siva'],now()-interval'40 days'
FROM categories c WHERE c.slug='dom-nj-dnevna';

INSERT INTO products (seller_id,title,description,price,category_id,condition,images,status,location,views_count,favorites_count,attributes,tags,created_at)
SELECT '00000000-0000-0002-0000-000000000004','Bračni krevet 160x200 s madracem','Drveni okvir (hrast), madrac pocket spring 20cm, u odličnom stanju. Bez ogrebotina.',450,c.id,'used',ARRAY['https://picsum.photos/seed/s144/800/600'],'active','Tuzla',145,11,'{"veličina":"160x200","materijal":"Hrast","madrac":"Pocket spring 20cm"}'::jsonb,ARRAY['krevet','bracni','160x200','hrast','madrac'],now()-interval'35 days'
FROM categories c WHERE c.slug='dom-nj-spavaca';

INSERT INTO products (seller_id,title,description,price,category_id,condition,images,status,location,views_count,favorites_count,attributes,tags,created_at)
SELECT '00000000-0000-0002-0000-000000000004','Kuhinjska garnitura bijela L-oblik','Moderna bijela kuhinja s granitnom pločom, ugrađeni sudoper i armatura. Veoma dobro stanje.',890,c.id,'used',ARRAY['https://picsum.photos/seed/s145/800/600'],'active','Tuzla',234,18,'{"boja":"Bijela","oblik":"L","ploča":"Granit","ugradbeni":"Sudoper i armatura"}'::jsonb,ARRAY['kuhinja','garnitura','bijela','granit','ugradnja'],now()-interval'30 days'
FROM categories c WHERE c.slug='dom-nj-kuhinja';

-- ────────────────────────────────────────────────────────────────────────────
-- PRO 5: Damir Đozić — 3 sportska artikla
-- ────────────────────────────────────────────────────────────────────────────
INSERT INTO products (seller_id,title,description,price,category_id,condition,images,status,location,views_count,favorites_count,attributes,tags,created_at)
SELECT '00000000-0000-0002-0000-000000000005','Trek Marlin 7 MTB 29" vel. L 2022','Trek Marlin 7 u odličnom stanju. Hydraulic disc brakovi, 24 brzine. Veličina okvira L.',680,c.id,'used',ARRAY['https://picsum.photos/seed/s146/800/600'],'active','Zenica',198,16,'{"marka":"Trek","model":"Marlin 7","veličinaOkvira":"L","kotači":"29 inča","brzine":24}'::jsonb,ARRAY['trek','marlin7','mtb','bicikl','mountain','29er'],now()-interval'40 days'
FROM categories c WHERE c.slug='vozila-bicikli';

INSERT INTO products (seller_id,title,description,price,category_id,condition,images,status,location,views_count,favorites_count,attributes,tags,created_at)
SELECT '00000000-0000-0002-0000-000000000005','Bowflex SelectTech 552 bučice set','Adjustable bučice 2-24kg svaka. Idealne za kućni gym. Malo korišćene, kao nove.',280,c.id,'like_new',ARRAY['https://picsum.photos/seed/s147/800/600'],'active','Zenica',156,13,'{"marka":"Bowflex","model":"SelectTech 552","tezina":"2-24kg","kom":2}'::jsonb,ARRAY['bowflex','bucice','fitness','kucni','gym','adjustable'],now()-interval'30 days'
FROM categories c WHERE c.slug='spt-fitness';

INSERT INTO products (seller_id,title,description,price,category_id,condition,images,status,location,views_count,favorites_count,attributes,tags,created_at)
SELECT '00000000-0000-0002-0000-000000000005','Rossignol Experience 80 ski set 170cm','Skijaški set Rossignol 170cm, Look vezovi, boots Salomon vel. 42. Korišćen 3 sezone.',320,c.id,'used',ARRAY['https://picsum.photos/seed/s148/800/600'],'active','Zenica',134,10,'{"marka":"Rossignol","model":"Experience 80","duzina":"170cm","vezovi":"Look","cipele":"Salomon 42"}'::jsonb,ARRAY['rossignol','ski','skijanje','salomon','zimski'],now()-interval'25 days'
FROM categories c WHERE c.slug='spt-zimski';

-- ────────────────────────────────────────────────────────────────────────────
-- PRO 6: Nina Jurić — 3 dječja artikla
-- ────────────────────────────────────────────────────────────────────────────
INSERT INTO products (seller_id,title,description,price,category_id,condition,images,status,location,views_count,favorites_count,attributes,tags,created_at)
SELECT '00000000-0000-0002-0000-000000000006','Cybex Priam 2022 kolica za bebe','Premium Cybex Priam kolica, sive boje, kompleta s košarom. Nosača za autosjedalicu. Odlično stanje.',320,c.id,'used',ARRAY['https://picsum.photos/seed/s149/800/600'],'active','Zagreb',178,15,'{"marka":"Cybex","model":"Priam","boja":"Siva","godiste":2022}'::jsonb,ARRAY['cybex','kolica','beba','priam','premium'],now()-interval'35 days'
FROM categories c WHERE c.slug='djc-oprema-bebe';

INSERT INTO products (seller_id,title,description,price,category_id,condition,images,status,location,views_count,favorites_count,attributes,tags,created_at)
SELECT '00000000-0000-0002-0000-000000000006','LEGO Technic 42141 McLaren Formula 1','Kompletan set, sve dijelovi, uputstvo u odličnom stanju. Slagan jednom.',85,c.id,'used',ARRAY['https://picsum.photos/seed/s150/800/600'],'active','Zagreb',212,19,'{"marka":"LEGO","set":"42141","tema":"Technic","komada":1432}'::jsonb,ARRAY['lego','technic','42141','mclaren','f1','konstruktor'],now()-interval'30 days'
FROM categories c WHERE c.slug='djc-igracke';

INSERT INTO products (seller_id,title,description,price,category_id,condition,images,status,location,views_count,favorites_count,attributes,tags,created_at)
SELECT '00000000-0000-0002-0000-000000000006','Kinderkraft Vado autosjedalica 9-36kg','Isofix auto sjedalica, rotating 360°, reclining. Korišćena 1 godinu, bez ikakvog pada.',150,c.id,'used',ARRAY['https://picsum.photos/seed/s151/800/600'],'active','Zagreb',145,12,'{"marka":"Kinderkraft","model":"Vado","tezina":"9-36kg","isofix":true,"rotating":true}'::jsonb,ARRAY['kinderkraft','autosjedalica','isofix','360','beba'],now()-interval'25 days'
FROM categories c WHERE c.slug='djc-oprema-bebe';

-- ────────────────────────────────────────────────────────────────────────────
-- PRO 7: Emir Mehmedović — 4 mobitela
-- ────────────────────────────────────────────────────────────────────────────
INSERT INTO products (seller_id,title,description,price,category_id,condition,images,status,location,views_count,favorites_count,attributes,tags,created_at)
SELECT '00000000-0000-0002-0000-000000000007','Apple iPhone 12 64GB crni','iPhone 12, baterija 88%, bez ogrebotina na ekranu. FaceID radi savršeno.',350,c.id,'used',ARRAY['https://picsum.photos/seed/s152/800/600'],'active','Sarajevo',289,21,'{"marka":"Apple","model":"iPhone 12","memorija":"64GB","boja":"Crna","baterija":88}'::jsonb,ARRAY['iphone','apple','12','64gb','iOS'],now()-interval'50 days'
FROM categories c WHERE c.slug='mob-iphone';

INSERT INTO products (seller_id,title,description,price,category_id,condition,images,status,location,views_count,favorites_count,attributes,tags,created_at)
SELECT '00000000-0000-0002-0000-000000000007','Apple iPhone 15 128GB Crni','iPhone 15, Dynamic Island, USB-C, baterija 97%. Korišten 2 mjeseca. Sa zaštitnom maskom.',680,c.id,'like_new',ARRAY['https://picsum.photos/seed/s153/800/600'],'active','Sarajevo',412,34,'{"marka":"Apple","model":"iPhone 15","memorija":"128GB","boja":"Crna","baterija":97}'::jsonb,ARRAY['iphone','apple','15','usbc','dynamisland'],now()-interval'45 days'
FROM categories c WHERE c.slug='mob-iphone';

INSERT INTO products (seller_id,title,description,price,category_id,condition,images,status,location,views_count,favorites_count,attributes,tags,created_at)
SELECT '00000000-0000-0002-0000-000000000007','Samsung Galaxy S23 256GB Phantom Black','Samsung S23, Snapdragon 8 Gen2, 50MP kamera. Baterija 94%. Kao nov, svaki dan u maskici.',580,c.id,'like_new',ARRAY['https://picsum.photos/seed/s154/800/600'],'active','Sarajevo',323,25,'{"marka":"Samsung","model":"Galaxy S23","memorija":"256GB","boja":"Phantom Black","baterija":94}'::jsonb,ARRAY['samsung','s23','galaxy','snapdragon','android'],now()-interval'40 days'
FROM categories c WHERE c.slug='mob-samsung';

INSERT INTO products (seller_id,title,description,price,category_id,condition,images,status,location,views_count,favorites_count,attributes,tags,created_at)
SELECT '00000000-0000-0002-0000-000000000007','Xiaomi Redmi Note 12 Pro 256GB','Odlican mid-range mobitel, 200MP kamera, 5000mAh baterija, 67W punjenje.',220,c.id,'used',ARRAY['https://picsum.photos/seed/s155/800/600'],'active','Sarajevo',178,12,'{"marka":"Xiaomi","model":"Redmi Note 12 Pro","memorija":"256GB","baterija":92}'::jsonb,ARRAY['xiaomi','redmi','note12pro','200mp','android'],now()-interval'35 days'
FROM categories c WHERE c.slug='mob-xiaomi';

-- ────────────────────────────────────────────────────────────────────────────
-- PRO 8: Sara Nikolić — 3 knjige
-- ────────────────────────────────────────────────────────────────────────────
INSERT INTO products (seller_id,title,description,price,category_id,condition,images,status,location,views_count,favorites_count,attributes,tags,created_at)
SELECT '00000000-0000-0002-0000-000000000008','Komplet Ivo Andrić 5 knjiga tvrdi uvez','Na Drini ćuprija, Prokleta avlija, Travnička hronika, Gospođica, Znakovi pored puta. Tvrdi uvez, odlično stanje.',25,c.id,'used',ARRAY['https://picsum.photos/seed/s156/800/600'],'active','Banja Luka',98,8,'{"autor":"Ivo Andrić","kom":5,"povez":"Tvrdi"}'::jsonb,ARRAY['andric','knjige','roman','bosanski','knjizevnost'],now()-interval'30 days'
FROM categories c WHERE c.slug='lit-beletristika';

INSERT INTO products (seller_id,title,description,price,category_id,condition,images,status,location,views_count,favorites_count,attributes,tags,created_at)
SELECT '00000000-0000-0002-0000-000000000008','Školski udžbenici 8. razred BiH','Komplet udžbenika za 8. razred osnovne škole (BiH plan). Svi predmeti, odlično stanje.',15,c.id,'used',ARRAY['https://picsum.photos/seed/s157/800/600'],'active','Banja Luka',67,5,'{"razred":"8. razred","zemlja":"BiH","predmeti":"Svi"}'::jsonb,ARRAY['udzbenici','skolski','8razred','osnovna','bih'],now()-interval'25 days'
FROM categories c WHERE c.slug='lit-djecje';

INSERT INTO products (seller_id,title,description,price,category_id,condition,images,status,location,views_count,favorites_count,attributes,tags,created_at)
SELECT '00000000-0000-0002-0000-000000000008','Learning Python 5th Edition – Mark Lutz','Kompletna referenca za Python programere, 1648 stranica. Englesko izdanje, odlično stanje.',30,c.id,'used',ARRAY['https://picsum.photos/seed/s158/800/600'],'active','Banja Luka',112,9,'{"autor":"Mark Lutz","jezik":"Engleski","stranice":1648,"god":2013}'::jsonb,ARRAY['python','programiranje','knjiga','lutz','oreilly'],now()-interval'20 days'
FROM categories c WHERE c.slug='lit-strucna';

-- ────────────────────────────────────────────────────────────────────────────
-- PRO 9: Tomislav Marić — 3 alata
-- ────────────────────────────────────────────────────────────────────────────
INSERT INTO products (seller_id,title,description,price,category_id,condition,images,status,location,views_count,favorites_count,attributes,tags,created_at)
SELECT '00000000-0000-0002-0000-000000000009','Makita DHP484Z akumulatorska bušilica 18V','Makita LXT 18V bušilica, 2 baterije 5Ah, punjač i kofer u kompletu. Jako malo korišćena.',120,c.id,'like_new',ARRAY['https://picsum.photos/seed/s159/800/600'],'active','Osijek',134,11,'{"marka":"Makita","model":"DHP484Z","napon":"18V","baterija":"2x5Ah"}'::jsonb,ARRAY['makita','busilica','18v','lxt','akumulatorska'],now()-interval'40 days'
FROM categories c WHERE c.slug='str-elektricni-alati';

INSERT INTO products (seller_id,title,description,price,category_id,condition,images,status,location,views_count,favorites_count,attributes,tags,created_at)
SELECT '00000000-0000-0002-0000-000000000009','Bosch PWS 850-125 kutna brusilica','Bosch kutna brusilica 850W, ploča 125mm. U odličnom stanju, malo korišćena.',85,c.id,'used',ARRAY['https://picsum.photos/seed/s160/800/600'],'active','Osijek',98,7,'{"marka":"Bosch","model":"PWS 850-125","snaga":"850W","ploca":"125mm"}'::jsonb,ARRAY['bosch','brusilica','kutna','125mm','elektricni'],now()-interval'35 days'
FROM categories c WHERE c.slug='str-elektricni-alati';

INSERT INTO products (seller_id,title,description,price,category_id,condition,images,status,location,views_count,favorites_count,attributes,tags,created_at)
SELECT '00000000-0000-0002-0000-000000000009','Stanley set ručnih alata 200 kom STMT0-74101','Kompletan set ručnih alata, sve u metalnoj kutiji. Ključevi, odvijači, kliješta, čekić.',95,c.id,'used',ARRAY['https://picsum.photos/seed/s161/800/600'],'active','Osijek',112,8,'{"marka":"Stanley","model":"STMT0-74101","kom":200}'::jsonb,ARRAY['stanley','alati','set','rucni','kljucevi','odvijaci'],now()-interval'30 days'
FROM categories c WHERE c.slug='str-rucni-alati';

-- ────────────────────────────────────────────────────────────────────────────
-- PRO 10: Lejla Softić — 3 beauty artikla
-- ────────────────────────────────────────────────────────────────────────────
INSERT INTO products (seller_id,title,description,price,category_id,condition,images,status,location,views_count,favorites_count,attributes,tags,created_at)
SELECT '00000000-0000-0002-0000-000000000010','Dyson Airwrap Complete Long 2023','Dyson Airwrap s kompletnom opremom za sve tipove kose. Korišten par puta. Savršen poklon.',380,c.id,'like_new',ARRAY['https://picsum.photos/seed/s162/800/600'],'active','Mostar',312,28,'{"marka":"Dyson","model":"Airwrap Complete Long","tip":"Stilizator"}'::jsonb,ARRAY['dyson','airwrap','friziranje','kosa','beauty'],now()-interval'25 days'
FROM categories c WHERE c.slug='teh-mali-aparati';

INSERT INTO products (seller_id,title,description,price,category_id,condition,images,status,location,views_count,favorites_count,attributes,tags,created_at)
SELECT '00000000-0000-0002-0000-000000000010','Chanel No.5 100ml EDP original','Original Chanel No.5 Eau de Parfum 100ml, kupljen u Dufy duty free. Jako malo potrošen (~90ml).',280,c.id,'used',ARRAY['https://picsum.photos/seed/s163/800/600'],'active','Mostar',245,22,'{"brend":"Chanel","naziv":"No.5","ml":100,"ostalo":"~90ml","tip":"EDP"}'::jsonb,ARRAY['chanel','parfem','no5','edp','original','luxury'],now()-interval'20 days'
FROM categories c WHERE c.slug='ost-kozmetika';

INSERT INTO products (seller_id,title,description,price,category_id,condition,images,status,location,views_count,favorites_count,attributes,tags,created_at)
SELECT '00000000-0000-0002-0000-000000000010','Philips Satinelle Advanced epilator','Philips BRE625 epilator, wet&dry, masažni nastavci. U kompletu sa torbom. Malo korišten.',65,c.id,'used',ARRAY['https://picsum.photos/seed/s164/800/600'],'active','Mostar',145,11,'{"marka":"Philips","model":"BRE625","tip":"Wet&Dry"}'::jsonb,ARRAY['philips','epilator','satinelle','wetdry','beauty'],now()-interval'15 days'
FROM categories c WHERE c.slug='teh-mali-aparati';

-- ────────────────────────────────────────────────────────────────────────────
-- NORMAL SELLERS — 23 artikala
-- ────────────────────────────────────────────────────────────────────────────

-- N1: Haris Čaušević — 2 artikla
INSERT INTO products (seller_id,title,description,price,category_id,condition,images,status,location,views_count,favorites_count,tags,created_at)
SELECT '00000000-0000-0003-0000-000000000001','Garsonjera 31m² Grbavica Sarajevo – prodaja','Garsonjera 31m2 na 3. katu, centralno grijanje, liftu. Dobra lokacija, blizu tramvaja.',78000,c.id,'new',ARRAY['https://picsum.photos/seed/s165/800/600'],'active','Sarajevo',456,38,ARRAY['stan','garsonjera','sarajevo','grbavica','prodaja'],now()-interval'20 days'
FROM categories c WHERE c.slug='nekr-stanovi';

INSERT INTO products (seller_id,title,description,price,category_id,condition,images,status,location,views_count,favorites_count,tags,created_at)
SELECT '00000000-0000-0003-0000-000000000001','Uredska stolica IKEA MARKUS crna','IKEA Markus, lumbar podrška, nasloni za ruke. Korišćena 1 godinu u odličnom stanju.',60,c.id,'used',ARRAY['https://picsum.photos/seed/s166/800/600'],'active','Sarajevo',89,6,ARRAY['ikea','markus','stolica','uredska','crna'],now()-interval'15 days'
FROM categories c WHERE c.slug='dom-nj-radna';

-- N2: Petra Marić — 1 artkal
INSERT INTO products (seller_id,title,description,price,category_id,condition,images,status,location,views_count,favorites_count,tags,created_at)
SELECT '00000000-0000-0003-0000-000000000002','Zara midi suknja leopard print M','Zara suknja s leopard printom, veličina M. Nosena jednom. Trend komad sezone.',22,c.id,'like_new',ARRAY['https://picsum.photos/seed/s167/800/600'],'active','Zagreb',98,8,ARRAY['zara','suknja','leopard','print','midi','zenska'],now()-interval'10 days'
FROM categories c WHERE c.slug='odj-zenska-odjeca';

-- N3: Alen Bašić — 2 artikla
INSERT INTO products (seller_id,title,description,price,category_id,condition,images,status,location,views_count,favorites_count,tags,created_at)
SELECT '00000000-0000-0003-0000-000000000003','Treadmill / Traka za trčanje Kettler','Kettler Run 6, brzina 1-18 km/h, nagib 12%, programi. Malo korišćena. Preuzimanje Tuzla.',340,c.id,'used',ARRAY['https://picsum.photos/seed/s168/800/600'],'active','Tuzla',134,10,ARRAY['traka','trcanje','kettler','treadmill','fitnes'],now()-interval'22 days'
FROM categories c WHERE c.slug='spt-fitness';

INSERT INTO products (seller_id,title,description,price,category_id,condition,images,status,location,views_count,favorites_count,tags,created_at)
SELECT '00000000-0000-0003-0000-000000000003','Biciklistička kaciga Scott ARX Plus M','Lagana kaciga za cestovni biciklizam, veličina M 52-58cm. Nosena jednu sezonu.',55,c.id,'used',ARRAY['https://picsum.photos/seed/s169/800/600'],'active','Tuzla',78,6,ARRAY['scott','kaciga','bicikl','cestovni','arx'],now()-interval'18 days'
FROM categories c WHERE c.slug='spt-biciklizam';

-- N4: Maja Stojanović — 1 artkal
INSERT INTO products (seller_id,title,description,price,category_id,condition,images,status,location,views_count,favorites_count,tags,created_at)
SELECT '00000000-0000-0003-0000-000000000004','Canon EOS 250D + 18-55mm objektiv','Ulazni DSLR za početnike. 24MP, video 4K, live view. U odličnom stanju s torbom i memorijskom karticom.',420,c.id,'used',ARRAY['https://picsum.photos/seed/s170/800/600'],'active','Split',178,15,ARRAY['canon','dslr','250d','kamera','foto','1855'],now()-interval'28 days'
FROM categories c WHERE c.slug='teh-foto-video';

-- N5: Muhamed Kurtović — 2 artikla
INSERT INTO products (seller_id,title,description,price,category_id,condition,images,status,location,views_count,favorites_count,tags,created_at)
SELECT '00000000-0000-0003-0000-000000000005','Dewalt DCD796N bušilica 18V (solo)','Dewalt XR brushless bušilica, bez baterije i punjača (solo). Odlično stanje.',75,c.id,'used',ARRAY['https://picsum.photos/seed/s171/800/600'],'active','Zenica',89,7,ARRAY['dewalt','busilica','18v','xr','brushless'],now()-interval'14 days'
FROM categories c WHERE c.slug='str-elektricni-alati';

INSERT INTO products (seller_id,title,description,price,category_id,condition,images,status,location,views_count,favorites_count,tags,created_at)
SELECT '00000000-0000-0003-0000-000000000005','Vrtna garnitura aluminium 4 stolice + stol','Aluminijska vrtna garnitura sive boje, 4 stolice sa jastucima i okrugli stol. Odlično stanje.',280,c.id,'used',ARRAY['https://picsum.photos/seed/s172/800/600'],'active','Zenica',112,9,ARRAY['vrtna','garnitura','aluminij','stolice','stol','basta'],now()-interval'12 days'
FROM categories c WHERE c.slug='dom-vrt';

-- N6: Andrea Vuković — 1 artkal
INSERT INTO products (seller_id,title,description,price,category_id,condition,images,status,location,views_count,favorites_count,tags,created_at)
SELECT '00000000-0000-0003-0000-000000000006','Xbox Series X 1TB + 2 kontrolera','Microsoft Xbox Series X, 2 bežična kontrolera, sve kablove. Odlično stanje.',420,c.id,'used',ARRAY['https://picsum.photos/seed/s173/800/600'],'active','Rijeka',234,19,ARRAY['xbox','seriesx','microsoft','gaming','konzola'],now()-interval'25 days'
FROM categories c WHERE c.slug='vig-xbox';

-- N7: Emina Hamidović — 2 artikla
INSERT INTO products (seller_id,title,description,price,category_id,condition,images,status,location,views_count,favorites_count,tags,created_at)
SELECT '00000000-0000-0003-0000-000000000007','LEGO Duplo Farma 10869 + extra blokovi','Duplo farma set s dodatnim blokovima, sve čisto i kompletno. Za djecu 2-5 god.',35,c.id,'used',ARRAY['https://picsum.photos/seed/s174/800/600'],'active','Sarajevo',89,7,ARRAY['lego','duplo','farma','djeca','konstruktor'],now()-interval'8 days'
FROM categories c WHERE c.slug='djc-igracke';

INSERT INTO products (seller_id,title,description,price,category_id,condition,images,status,location,views_count,favorites_count,tags,created_at)
SELECT '00000000-0000-0003-0000-000000000007','Odjeća za djevojčicu 3-4 god — 10 komada','10 kom dječje odjeće za djevojčicu, veličina 98-104. Sve brendovi (Zara, H&M, LC Waikiki). Odlično.',30,c.id,'used',ARRAY['https://picsum.photos/seed/s175/800/600'],'active','Sarajevo',67,5,ARRAY['djecja','odjeca','djevojcica','98104','zara','hm'],now()-interval'6 days'
FROM categories c WHERE c.slug='djc-odjeca';

-- N8: Nikola Petrović — 1 artkal
INSERT INTO products (seller_id,title,description,price,category_id,condition,images,status,location,views_count,favorites_count,tags,created_at)
SELECT '00000000-0000-0003-0000-000000000008','Yamaha C40 klasična gitara s torbom','Yamaha C40 klasična gitara, idealna za početnike. Žice zamijenjene nedavno. S torbom.',85,c.id,'used',ARRAY['https://picsum.photos/seed/s176/800/600'],'active','Banja Luka',123,10,ARRAY['yamaha','gitara','klasicna','pocetnik','akusticna'],now()-interval'22 days'
FROM categories c WHERE c.slug='glz-gitare';

-- N9: Selma Osmić — 2 artikla
INSERT INTO products (seller_id,title,description,price,category_id,condition,images,status,location,views_count,favorites_count,tags,created_at)
SELECT '00000000-0000-0003-0000-000000000009','Plišani tepih 140x200cm krem boja','Mekan i debeo plišani tepih, veličina 140x200, krem boja. Jednom pran, odlično stanje.',65,c.id,'used',ARRAY['https://picsum.photos/seed/s177/800/600'],'active','Mostar',89,7,ARRAY['tepih','plisani','140x200','krem','dnevna'],now()-interval'12 days'
FROM categories c WHERE c.slug='dom-tekstil';

INSERT INTO products (seller_id,title,description,price,category_id,condition,images,status,location,views_count,favorites_count,tags,created_at)
SELECT '00000000-0000-0003-0000-000000000009','Set od 3 vaze keramika bijela Zara Home','Set 3 dekorativne keramičke vaze raznih veličina, bijele boje. Zara Home kolekcija.',35,c.id,'like_new',ARRAY['https://picsum.photos/seed/s178/800/600'],'active','Mostar',67,5,ARRAY['vaza','keramika','zarahome','dekoracija','bijela'],now()-interval'8 days'
FROM categories c WHERE c.slug='dom-dekoracije';

-- N10: Luka Horvat — 1 artkal
INSERT INTO products (seller_id,title,description,price,category_id,condition,images,status,location,views_count,favorites_count,tags,created_at)
SELECT '00000000-0000-0003-0000-000000000010','Zlatni retrijer štenad — 2 ženke','Čistokrvni zlatni retrijer, s rodovnicom, zdravstveni pregled obavljen, vakcinisani. Preuzimanje Zagreb.',350,c.id,'new',ARRAY['https://picsum.photos/seed/s179/800/600'],'active','Zagreb',412,38,ARRAY['zlatniretrijer','stene','psi','srodovnicom','retrijer'],now()-interval'30 days'
FROM categories c WHERE c.slug='ziv-psi';

-- N11: Fatima Alić — 2 artikla
INSERT INTO products (seller_id,title,description,price,category_id,condition,images,status,location,views_count,favorites_count,tags,created_at)
SELECT '00000000-0000-0003-0000-000000000011','Estée Lauder Advanced Night Repair 50ml','Original Estée Lauder serum za lice, nov u kutiji. Kupljen u BeautyRingi.',45,c.id,'new',ARRAY['https://picsum.photos/seed/s180/800/600'],'active','Sarajevo',134,11,ARRAY['esteelauder','serum','lice','kozmetika','skincare'],now()-interval'5 days'
FROM categories c WHERE c.slug='ost-kozmetika';

INSERT INTO products (seller_id,title,description,price,category_id,condition,images,status,location,views_count,favorites_count,tags,created_at)
SELECT '00000000-0000-0003-0000-000000000011','Xiaomi Mi Band 8 Pro fitness narukvica','Mi Band 8 Pro, AMOLED ekran, GPS, 150+ sportskih modova. Malo korišćena.',40,c.id,'like_new',ARRAY['https://picsum.photos/seed/s181/800/600'],'active','Sarajevo',98,8,ARRAY['xiaomi','miband8','fitness','narukvica','gps','smartband'],now()-interval'3 days'
FROM categories c WHERE c.slug='mob-pametni-satovi';

-- N12: Goran Đukić — 1 artkal
INSERT INTO products (seller_id,title,description,price,category_id,condition,images,status,location,views_count,favorites_count,tags,created_at)
SELECT '00000000-0000-0003-0000-000000000012','Paulo Coelho komplet 7 knjiga','Alkemičar, Veronika, Zatvorenik, Hodočasnik, Priručnik ratnika, Brida, Valkirija. Odlično stanje.',20,c.id,'used',ARRAY['https://picsum.photos/seed/s182/800/600'],'active','Banja Luka',89,7,ARRAY['coelho','knjige','alkemicar','komplet','roman'],now()-interval'28 days'
FROM categories c WHERE c.slug='lit-beletristika';

-- N13: Vesna Tadić — 2 artikla
INSERT INTO products (seller_id,title,description,price,category_id,condition,images,status,location,views_count,favorites_count,tags,created_at)
SELECT '00000000-0000-0003-0000-000000000013','Pelargonija ruska – 5 lonaca','Domaće pelargonija u cvatu, 5 lonaca, raznih boja. Preuzimanje Zenica.',8,c.id,'new',ARRAY['https://picsum.photos/seed/s183/800/600'],'active','Zenica',56,4,ARRAY['pelargonija','biljke','cvijece','lonce','vrt'],now()-interval'16 days'
FROM categories c WHERE c.slug='dom-vrt';

INSERT INTO products (seller_id,title,description,price,category_id,condition,images,status,location,views_count,favorites_count,tags,created_at)
SELECT '00000000-0000-0003-0000-000000000013','EK Aqua 3 peć na pelete 12kW','Pelletna peć 12kW, automatsko punjenje, WiFi upravljanje. Malo korišćena, u odličnom stanju.',680,c.id,'used',ARRAY['https://picsum.photos/seed/s184/800/600'],'active','Zenica',167,13,ARRAY['pec','pelete','grijanje','12kw','wifi','automatska'],now()-interval'14 days'
FROM categories c WHERE c.slug='dom-grijanje';

-- N14: Denis Imamović — 1 artkal
INSERT INTO products (seller_id,title,description,price,category_id,condition,images,status,location,views_count,favorites_count,tags,created_at)
SELECT '00000000-0000-0003-0000-000000000014','Deuter Futura 32L planinarski ruksak','Deuter Futura 32L s vazdušnim sustavom Aircomfort. Nosena par izleta. Odlično stanje.',80,c.id,'used',ARRAY['https://picsum.photos/seed/s185/800/600'],'active','Tuzla',112,9,ARRAY['deuter','ruksak','32l','planinarenje','aircomfort'],now()-interval'7 days'
FROM categories c WHERE c.slug='spt-planinarenje';

-- N15: Ana Mlinar — 1 artkal
INSERT INTO products (seller_id,title,description,price,category_id,condition,images,status,location,views_count,favorites_count,tags,created_at)
SELECT '00000000-0000-0003-0000-000000000015','Srebrna ogrlica s privjeskom – handmade','Ručno rađena ogrlica od 925 srebra sa privjeskom srce + zirkon. S certifikatom.',45,c.id,'new',ARRAY['https://picsum.photos/seed/s186/800/600'],'active','Rijeka',89,8,ARRAY['ogrlica','srebro','925','handmade','nakit','srce'],now()-interval'14 days'
FROM categories c WHERE c.slug='odj-nakit';
