import { Product, User, Category } from './types';

/** Fixed EUR → BAM (Convertible Mark) exchange rate */
export const BAM_RATE = 1.95583;

export const CATEGORIES: Category[] = [
  // ─── 1. VOZILA ────────────────────────────────────────────
  {
    id: 'vozila', name: 'Vozila', icon: 'fa-car',
    subCategories: [
      { name: 'Osobni automobili', items: ['Automobili s garancijom', 'Električni automobili', 'Hibridni automobili', 'Karambolirani i neispravni automobili', 'Novi automobili (od autokuće)', 'Oldtimeri', 'Polovni automobili'] },
      { name: 'Motocikli i skuteri', items: ['Cruiser / chopper', 'Električni motocikli i skuteri', 'Enduro i cross', 'Naked / streetfighter', 'Skuteri i mopedi', 'Sport motocikli', 'Tricikli i quadricikli'] },
      { name: 'Teretna vozila', items: ['Cisterne', 'Hladnjače', 'Kamioni (3.5t – 7.5t)', 'Kiperi i kiper prikolice', 'Kombiji i dostavna vozila (do 3.5t)', 'Tegljači i vučna vozila', 'Teški kamioni (7.5t+)'] },
      { name: 'Autobusi i minibusi', items: ['Gradski autobusi', 'Minibusi (do 20 mjesta)', 'Školski autobusi', 'Turistički autobusi'] },
      { name: 'Bicikli', items: ['BMX', 'Cestovni (road) bicikli', 'Dječji bicikli', 'Električni bicikli (e-bike)', 'Gravel bicikli', 'MTB / Mountain bike', 'Sklopivi bicikli', 'Trekking i city bicikli'] },
      { name: 'Kamper i kamp prikolice', items: ['Alkoven kamperi', 'Kamp prikolice / karavani', 'Kamperi (integrirani)', 'Krovni šatori i oprema', 'Polu-integrirani kamperi'] },
      { name: 'Prikolice', items: ['Hladnjačke i frigorifik prikolice', 'Kiper prikolice', 'Ostale prikolice', 'Prikolice za automobile (osobne)', 'Prikolice za bicikle', 'Prikolice za čamce / nautiku', 'Prikolice za drva i biomasu', 'Prikolice za građevinu i šutu', 'Prikolice za konje i stoku', 'Prikolice za motocikle'] },
      { name: 'Nautika i plovila', items: ['Brodovi', 'Čamci na motor', 'Gumenjaci i RIB čamci', 'Jahte', 'Jedrilice', 'Jet ski i vodeni skuteri', 'Kajaci i kanui', 'Ribarski čamci', 'SUP daske'] },
      { name: 'ATV / Quad / UTV' },
      { name: 'Ostala vozila', items: ['Kolica za golf', 'Segway i električni romobili za odrasle', 'Traktori (cestovni)'] },
    ]
  },

  // ─── 2. DIJELOVI ZA VOZILA ───────────────────────────────
  {
    id: 'dijelovi', name: 'Dijelovi za automobile', icon: 'fa-gears',
    subCategories: [
      { name: 'Za automobile – Motor i mjenjač', items: ['Automatski mjenjač (kompletan)', 'Blok motora', 'Bregaste i koljenaste osovine', 'Brizgači i common rail', 'Diferencijal i mostovi', 'DSG / CVT mjenjač', 'EGR ventili i moduli', 'Glava motora i brtve', 'Hladnjaci vode i ulja', 'Intercooleri i hladnjaci punjenja', 'Ispušni kolektori i lonci', 'Karburatori i usisne grane', 'Kardansko vratilo', 'Katalizatori i DPF filteri', 'Klipovi i prstenovi', 'Kompresori (mehanički)', 'Kvačilo, lamela i zamašnjak', 'Motor (kompletan agregat)', 'Ostali dijelovi motora', 'Pogonske osovine i homokineti', 'Pumpe goriva i injektori', 'Pumpe rashladne vode i termostati', 'Pumpe ulja i filteri ulja', 'Ručni mjenjač (kompletan)', 'Turbine i turbopunjači', 'Usisni sustav i filteri zraka', 'Zupčasti i klinasti remeni, lanci'] },
      { name: 'Za automobile – Elektrika i elektronika', items: ['ABS pumpa i upravljačka jedinica', 'Airbag modul upravljačke jedinice', 'Airbag pojasevi i punjači', 'Akumulator', 'Alternatori', 'Centralina mjenjača', 'Centralna brava i aktuatori', 'Dnevna svjetla (DRL)', 'ECU / Motorna jedinica', 'Električni prozori motori i regulator', 'ESP / ASR modul', 'Farovi (prednji – halogeni, LED, xenon)', 'Grijanje sjedala i upravljača', 'Instrument tabla', 'Kablovski snopovi i instalacije', 'Klima kompresor i dijelovi', 'Maglenke prednje i zadnje', 'Multimedija i ekrani (OEM)', 'Ostala elektrika i elektronika', 'Releji i kutija osigurača', 'Senzori (lambda, MAP, MAF, NOx...)', 'Senzori ABS kotača', 'Senzori paljenja i položaja radilice', 'Parking senzori i kamera', 'Senzori temperature i pritiska', 'Starter / Alnaser', 'Stop svjetla i žmigavci'] },
      { name: 'Za automobile – Karoserija i stakla', items: ['Bočna stakla', 'Brave i ručice vrata', 'Brisači i motori brisača', 'Gepek vrata / hauba prtljažnika', 'Karoserija u dijelovima (škart)', 'Krov i panoramski krov', 'Ostali karoserijski dijelovi', 'Poklopac motora / hauba', 'Pragovi i lajsne', 'Prednja vrata (lijeva/desna)', 'Prednji blatobrani (lijevi/desni)', 'Prednji branik / odbojnik', 'Retrovizori vanjski (lijevi/desni)', 'Zadnja vrata (lijeva/desna)', 'Zadnje staklo', 'Zadnji blatobrani', 'Zadnji branik / odbojnik', 'Šine i klizni mehanizmi vrata', 'Vjetrobransko staklo'] },
      { name: 'Za automobile – Unutrašnjost i sjedala', items: ['Nasloni za glavu', 'Obloge vrata (unutrašnje) - Tapacirung', 'Ostala unutrašnjost', 'Prednja sjedala (vozač/suvozač)', 'Prekidači i dugmad (stakla, svjetla...)', 'Lijevi / Desni Retrovizor', 'Ručica mjenjača', 'Ručna kočnica i obloga', 'Sigurnosni pojasevi i kopče', 'Središnja konzola', 'Zadnja sjedala / klupa', 'Sjenilo za sunce / Vizir', 'Tepisi i gumene podne obloge', 'Volan', 'Ostali dijelovi'] },
      { name: 'Za automobile – Ovjes i kočnice', items: ['Prednji amortizeri', 'Zadnji amortizeri', 'Prednja kočiona kliješta', 'Zadnja kočiona kliješta', 'Federbajn/Opruga', 'Kočiona tekućina i rezervoar', 'Kočione čeljusti', 'Prednje disk pločice', 'Zadnje disk pločice', 'Pakne', 'Kočioni cilindri i crijevca', 'Krajevi upravljača', 'Kuglični zglobovi', 'Ležajevi kotača i glavčine', 'Opruge (spiralne, lisnate)', 'Ostali ovjes i kočnice', 'Ramena ovjesa i poluge', 'Ručna kočnica dijelovi', 'Servo pumpa upravljača', 'Stabilizatori i gumice stabilizatora', 'Upravljačka letva / servo pumpa'] },
      { name: 'Za automobile – Felge i gume', items: ['Aluminijske / alu felge', 'Cijelogodišnje gume / All-Season', 'Čelične felge', 'Distanceri za felge', 'Lanci za snijeg', 'Ljetne gume', 'Matice i vijci kotača', 'Rezervni kotač (stepnica)', 'Zimske gume', 'Ostali dijelovi'] },
      { name: 'Za automobile – Tuning i oprema', items: ['Bodykit i pragovi', 'Chip tuning i upravljačke jedinice (aftermarket)', 'Zadnji difuzori', 'Karbonski dijelovi', 'Krovni nosači i šine', 'Kuka za vuču / towbar', 'LED trake i dekorativna svjetla', 'Nosači za bicikle i skijaška oprema', 'Ostali tuning', 'Spojleri i lip spojleri', 'Sportska sjedala', 'Sportski filteri zraka', 'Sportski ispuh i down pipe', 'Sportski volan', 'Zaštitne folije i wrap'] },
      { name: 'Za automobile – Navigacija i auto akustika', items: ['Aftermarket navigacija i ekrani', 'Auto alarm i imobilajzer', 'Dash kamere', 'GPS lokatori', 'Hands-free i Bluetooth moduli', 'Pojačala', 'Radio i OEM multimedija', 'Zadnje i 360° kamere', 'Subwooferi i bass', 'Zvučnici prednji i zadnji'] },
      { name: 'Za automobile – Kozmetika i ulja', items: ['Čistači unutrašnjosti', 'Kočiona tekućina', 'Mjenjačka i diferencijalna ulja', 'Motorna ulja i aditivi', 'Rashladna tekućina (antifriz)', 'Servo tekućina', 'Šamponi i voskovi', 'Tekućina za brisače', 'Zaštita podvozja i antikoro'] },
      { name: 'Za motocikle – Motor i transmisija', items: ['Cilindar i glava cilindra', 'Ispuh i lonac', 'Karburator i injektor', 'Klipovi i segmenti', 'Kvačilo i lamele', 'Lanci i zupčanici', 'Mjenjač', 'Motorni dijelovi', 'Usisna grana i filtar'] },
      { name: 'Za motocikle – Karoserija i oklopi', items: ['Bočni oklopi', 'Nasloni i kutije', 'Prednja maska i oklopi', 'Prednji i zadnji blatobran', 'Rezervoar goriva', 'Zadnji oklop i sjedište'] },
      { name: 'Za motocikle – Elektrika i paljenje', items: ['Alternator i regulator', 'Baterija / akumulator', 'ECU / centralina', 'Farovi i stop svjetla', 'Svjećice i bobine paljenja', 'Žmigavci'] },
      { name: 'Za motocikle – Ovjes i kočnice', items: ['Kočiona kliješta', 'Disk pločice', 'Ležajevi kotača', 'Prednja viljuška i opruge', 'Zadnji amortizer'] },
      { name: 'Za motocikle – Felge i gume', items: ['Enduro i off-road gume', 'Ljetne / sportske gume', 'Prednje felge', 'Zadnje felge'] },
      { name: 'Za motocikle – Zaštitna oprema i odjeća', items: ['Kacige (integralne, open face, off-road)', 'Moto čizme i cipele', 'Moto hlače', 'Moto jakne i kombinezon', 'Moto rukavice', 'Oklopi i protektori', 'Reflektirajuća oprema'] },
      { name: 'Za motocikle – Koferi, torbe i nosači' },
      { name: 'Za bicikle – Dijelovi', items: ['Lanci', 'Ručke', 'Kočiona kliješta (hidraulička/mehanička)', 'Kotači i gume', 'Zaštitna odjeća i obuća', 'Ostali dijelovi'] },
      { name: 'Za teretna vozila', items: ['Auspuhi i AdBlue sustav', 'Elektrika i ECU', 'Felge i gume (teretne)', 'Hladnjaci i ostali dijelovi', 'Kabina i dijelovi kabine', 'Karoserija i nadogradnja', 'Kočnice i ovjes', 'Motor i mjenjač', 'Tachografi'] },
      { name: 'Za autobuse i minibuse', items: ['Karoserija i stakla', 'Motor i mjenjač', 'Ostali dijelovi', 'Sjedala i unutrašnjost', 'Vrata i mehanizmi'] },
      { name: 'Za nautiku i plovila', items: ['Brodski motori (unutarbrodski)', 'Brodski motori (vanbrodski)', 'Jedra i jarbolna oprema', 'Kormila i upravljanje', 'Navigacijska elektronika', 'Ostali nautički dijelovi', 'Propeleri', 'Pumpe i bilge pumpe', 'Sidrena i vezna oprema'] },
      { name: 'Za kampere i prikolice', items: ['Kreveti i namještaj za kampere', 'Plinski sustavi', 'Prikolična kuka i spojnice', 'Prozori i vrata', 'Solarna oprema za kampere', 'Vodeni sistemi'] },
      { name: 'Za ATV / Quad', items: ['Gume i felge (off-road)', 'Karoserija i plastika', 'Motor i mjenjač', 'Ovjes i kočnice'] },
      { name: 'Za građevinske strojeve', items: ['Donji postroj', 'Radni alati', 'Hidraulika', 'Motor i filteri', 'Prijenos snage', 'Elektrika i elektronika', 'Elementi kabine i sigurnosti', 'Ostali dijelovi'] },
      { name: 'Za prikolice (dijelovi)', items: ['Kočioni sustav prikolice', 'Osovine i ovjesi', 'Podovi i bočne stranice', 'Prikolična kuka i glava', 'Rasvjeta prikolice'] },
      { name: 'Ostali dijelovi za vozila' },
    ]
  },

  // ─── 3. NEKRETNINE ──────────────────────────────────────
  {
    id: 'nekretnine', name: 'Nekretnine', icon: 'fa-building',
    subCategories: [
      { name: 'Stanovi', items: ['Luksuzni stanovi', 'Najam stanova (dugoročni)', 'Prodaja stanova', 'Stan na dan (kratkoročni)', 'Stanovi – novogradnja'] },
      { name: 'Kuće', items: ['Montažne kuće i objekti', 'Najam kuća', 'Prodaja kuća', 'Vikendice i seoske kuće'] },
      { name: 'Zemljišta', items: ['Građevinsko zemljište', 'Ostalo zemljište', 'Poljoprivredno zemljište', 'Šumsko zemljište'] },
      { name: 'Poslovni prostori', items: ['Industrijski objekti', 'Najam poslovnih prostora', 'Prodaja poslovnih prostora', 'Skladišta i hale', 'Ugostiteljski prostori', 'Uredi'] },
      { name: 'Garaže i parkirna mjesta', items: ['Najam garaža', 'Parkirna mjesta', 'Prodaja garaža'] },
      { name: 'Turistički smještaj', items: ['Apartmani na dan', 'Hosteli', 'Kuće za odmor', 'Sobe na dan'] },
      { name: 'Luksuzne nekretnine' },
      { name: 'Ostale nekretnine' },
    ]
  },

  // ─── 4. MOBITELI I OPREMA ───────────────────────────────
  {
    id: 'mobiteli', name: 'Mobiteli i oprema', icon: 'fa-mobile-screen',
    subCategories: [
      { name: 'Mobiteli – Apple iPhone', items: ['iPhone 12 i stariji', 'iPhone 13 serija', 'iPhone 14 serija', 'iPhone 15 serija', 'iPhone 16 serija'] },
      { name: 'Mobiteli – Samsung', items: ['Galaxy A serija', 'Galaxy S serija', 'Galaxy Z Fold/Flip', 'Ostali Samsung'] },
      { name: 'Mobiteli – Xiaomi / Redmi / POCO' },
      { name: 'Mobiteli – Huawei / Honor' },
      { name: 'Mobiteli – OnePlus / Oppo / Realme' },
      { name: 'Mobiteli – Nokia / Motorola / Sony' },
      { name: 'Mobiteli – Ostale marke' },
      { name: 'Tableti', items: ['Apple iPad', 'Huawei MatePad', 'Ostali tableti', 'Samsung Galaxy Tab'] },
      { name: 'Pametni satovi i fitness narukvice' },
      { name: 'Slušalice i Bluetooth zvučnici', items: ['Bluetooth zvučnici', 'Gaming headset', 'In-ear slušalice', 'Over-ear slušalice'] },
      { name: 'Punjači, powerbanke i kabeli' },
      { name: 'Maske, stakla i zaštitne folije' },
      { name: 'Dijelovi mobitela (ekrani, baterije...)' },
      { name: 'Ostala mobilna oprema' },
    ]
  },

  // ─── 5. RAČUNALA I IT ───────────────────────────────────
  {
    id: 'racunala', name: 'Računala i IT', icon: 'fa-laptop',
    subCategories: [
      { name: 'Laptopi', items: ['Apple MacBook', 'Asus / Acer / MSI', 'Dell / HP / Lenovo', 'Dijelovi laptopa', 'Gaming laptopi', 'Oštećeni laptopi (za dijelove)', 'Poslovni laptopi'] },
      { name: 'Desktop računala', items: ['Gaming PC-evi', 'Kompletni desktop računala', 'Mini PC i NUC'] },
      { name: 'Monitori', items: ['Uredski (Office/Home)', 'Gaming monitori', 'Grafički/Profesionalni monitori', 'LCD - (IPS/VA/TN)', 'OLED', 'Mini-LED', 'Standardni (16:9)', 'Ultrawide (21:9 ili 32:9)', 'Zakrivljeni (Curved)'] },
      { name: 'Komponente', items: ['CPU hladnjaci i vodeno hlađenje', 'Grafičke kartice (GPU)', 'HDD diskovi', 'Kućišta', 'Matične ploče', 'Napajanja (PSU)', 'Optički uređaji', 'Procesori (CPU)', 'RAM memorija', 'SSD diskovi'] },
      { name: 'Mrežna oprema', items: ['Mrežne kartice', 'NAS serveri', 'Routeri i modemi', 'Switchevi i hubovi', 'WiFi extenderi'] },
      { name: 'Printeri i skeneri', items: ['3D printeri', 'Inkjet printeri', 'Laser printeri', 'Multifunkcijski uređaji', 'Toner i tinta'] },
      { name: 'Serveri' },
      { name: 'Softver i licence' },
      { name: 'Gaming i konzole', items: ['Gaming oprema (miševi, tipkovnice, podloge, gamepadovi)', 'Nintendo Switch', 'PC igre (fizičke i ključevi)', 'PlayStation 4 i stariji', 'PlayStation 5', 'Retro konzole', 'VR naočale i oprema', 'Xbox Series X/S'] },
      { name: 'Dronovi i oprema', items: ['Dijelovi i baterije za dronove', 'DJI dronovi', 'FPV dronovi', 'Ostali dronovi'] },
      { name: 'Ostala IT oprema', items: ['Docking stanice', 'Kablovi i adapteri', 'Tipkovnice i miševi', 'UPS uređaji', 'USB i memorijske kartice', 'Web kamere'] },
    ]
  },

  // ─── 6. TEHNIKA I ELEKTRONIKA ───────────────────────────
  {
    id: 'tehnika', name: 'Tehnika i elektronika', icon: 'fa-tv',
    subCategories: [
      { name: 'Televizori', items: ['Dijelovi za TV', 'OLED TV', 'Projektori', 'QLED / LED TV', 'Smart TV', 'TV stalci i nosači'] },
      { name: 'Audio oprema', items: ['CD i kazetofoni', 'Gramofoni i ploče', 'Hi-Fi pojačala i receiveri', 'Slušalice audiophile', 'Soundbar', 'Zvučnici za dom'] },
      { name: 'Foto i video oprema', items: ['Action kamere (GoPro i sl.)', 'Analogi / film fotoaparati', 'Bljeskalice i rasvjeta', 'Digitalni fotoaparati (kompaktni)', 'Drone kamere', 'DSLR fotoaparati', 'Foto i video oprema – ostalo', 'Mirrorless fotoaparati', 'Objektivi', 'Stative i gimbal', 'Video kamere'] },
      { name: 'Bijela tehnika', items: ['Aparati za klimu (split sustav)', 'Hladnjaci i zamrzivači', 'Mikrovalne pećnice', 'Ostala bijela tehnika', 'Pećnice', 'Perilice posuđa', 'Perilice rublja', 'Sušilice rublja', 'Štednjaci i ploče za kuhanje'] },
      { name: 'Mali kućanski aparati', items: ['Aparati za kavu', 'Aparati za kosu', 'Blenderi i mikseri', 'Električni aparati za brijanje', 'Glačala i centri za glačanje', 'Ostali mali aparati', 'Parni čistači', 'Robotski usisavači', 'Tosteri i mini pećnice', 'Usisavači'] },
      { name: 'Smart home i IoT', items: ['Pametna zvona i brave', 'Pametne žarulje i rasvjeta', 'Pametni prekidači i utičnice', 'Pametni termostati', 'Sigurnosne kamere (smart)', 'Smart hub i centrali'] },
      { name: 'Solarna i alternativna energija', items: ['Baterije za solarni sustav', 'Inverteri i regulatori', 'Solarne ploče', 'Vjetroturbine (male)'] },
      { name: 'Medicinska oprema', items: ['Aparati za šećer u krvi', 'Inhalatori', 'Invalidska kolica i pomagala', 'Mjerači krvnog tlaka', 'Ostala medicinska oprema', 'Termometri'] },
      { name: 'Ostala tehnika', items: ['Baterije i punjači', 'Električne cigarete i vapori', 'Električni materijal', 'Kabelske role i instalacijski materijal', 'Mjerači i mjerni instrumenti', 'Walkie talkie i radio amater'] },
    ]
  },

  // ─── 7. DOM I VRTNI ─────────────────────────────────────
  {
    id: 'dom', name: 'Dom i vrtne garniture', icon: 'fa-house',
    subCategories: [
      { name: 'Namještaj – Dnevna soba', items: ['Fotelje', 'Police i regali', 'Sofe i garniture', 'Stolovi za dnevnu sobu', 'TV komode i police', 'Vitrine'] },
      { name: 'Namještaj – Spavaća soba', items: ['Kreveti i okviri', 'Madraci', 'Noćni ormarići', 'Ormarci za odjeću', 'Toaletni stolovi'] },
      { name: 'Namještaj – Kuhinja i blagovaonica', items: ['Barovi i barski stolci', 'Blagovaoničke garniture (stol + stolice)', 'Kuhinjske garniture', 'Kuhinjske police i ormari'] },
      { name: 'Namještaj – Dječja soba', items: ['Dječje police i ormari', 'Dječji kreveti i krevetići', 'Dječji stolovi i stolice', 'Kreveti na kat'] },
      { name: 'Namještaj – Radna soba i ured', items: ['Konferencijski stolovi', 'Radni stolovi', 'Uredske stolice', 'Uredski ormari i police'] },
      { name: 'Namještaj – Kupaonica', items: ['Kupaonski ormarići i police', 'Ogledala', 'Police za tuš'] },
      { name: 'Rasvjeta', items: ['LED paneli i trake', 'Lusteri i plafonske lampe', 'Podne i stolne lampe', 'Vanjska rasvjeta', 'Zidne lampe', 'Žarulje i grla'] },
      { name: 'Tepisi, zavjese i tekstil', items: ['Deke i pokrivači', 'Jastuci i jastučnice', 'Posteljina', 'Ručnici i kupaonski tekstil', 'Tepisi i sagovi', 'Zavjese i rolete'] },
      { name: 'Dekoracije i ukrasi', items: ['Božićne dekoracije', 'Ostale dekoracije', 'Slike i platna', 'Svjećnjaci i svijeće', 'Vaze i dekorativne figure', 'Zidni satovi'] },
      { name: 'Grijanje i hlađenje', items: ['Klima uređaji (split)', 'Kotlovi i bojleri', 'Mobilne klime', 'Peći na drva i pelete', 'Radijatori', 'Ventilatori'] },
      { name: 'Vrt i balkon', items: ['Balkoni zasloni i tende', 'Biljke i cvijeće', 'Prskalice i natapanje', 'Saksije i posude', 'Sjemenke i luk', 'Vrtne fontane', 'Vrtne ljuljačke i hamaci', 'Vrtni alati (lopate, grablje, škare...)', 'Vrtni namještaj (garniture, stolice, stolovi)', 'Vrtni roštilji i pizze pećnice', 'Zemlja i gnojiva'] },
      { name: 'Bazeni, jacuzzi i saune', items: ['Finska sauna', 'Infracrvena sauna', 'Jacuzzi i whirlpool', 'Nadzemni bazeni', 'Oprema za bazen (pumpe, filteri, kemija)'] },
      { name: 'Sigurnosni sustavi', items: ['Alarmi i senzori', 'Nadzorne kamere', 'Pametne brave', 'Vatrodojave i senzori dima'] },
      { name: 'Vodoinstalacije i sanitarije', items: ['Bojleri i grijalice vode', 'Cijevi i spojevi', 'Filteri za vodu', 'Kade i tuš kabine', 'Slavine i armature', 'Sudoperi', 'WC školjke i bide'] },
      { name: 'Alati i pribor za dom', items: ['Brusilice', 'Bušilice i odvijači', 'Mjerači i libele', 'Ostali ručni alati', 'Pile i testere', 'Stege i stative'] },
      { name: 'Ostalo za dom' },
    ]
  },

  // ─── 8. ODJEĆA I OBUĆA ──────────────────────────────────
  {
    id: 'odjeca', name: 'Odjeća i obuća', icon: 'fa-shirt',
    subCategories: [
      { name: 'Ženska odjeća', items: ['Gornji dijelovi', 'Donji dijelovi', 'Haljine i kombinezoni', 'Džemperi', 'Vanjska odjeća', 'Casual', 'Business', 'Svečano', 'Sport i rekreacija', 'Donje rublje i spavaći program', 'Specijalne linije'] },
      { name: 'Ženska obuća', items: ['Tenisice', 'Cipele na petu', 'Ravne cipele', 'Čizme', 'Sandale i natikače', 'Casual', 'Formalno/Svečano', 'Outdoor', 'Kućna obuća'] },
      { name: 'Muška odjeća', items: ['Gornji dijelovi', 'Donji dijelovi', 'Vanjska odjeća', 'Odijela i formalna odjeća', 'Sport i slobodno vrijeme', 'Rublje i spavaći program'] },
      { name: 'Muška obuća', items: ['Tenisice', 'Elegantne cipele', 'Čizme i gležnjače', 'Ljetna i kućna obuća'] },
      { name: 'Dječja odjeća i obuća', items: ['Dječja obuća', 'Za bebe (0–2 god)', 'Za djecu (3–8 god)', 'Za djecu (9–14 god)', 'Za tinejdžere (15+)'] },
      { name: 'Sportska odjeća i obuća (svi)', items: ['Dres i trening odjeća', 'Kompresijska odjeća', 'Koturaljke i snowboard odjeća', 'Plivačke kupaće', 'Skijaška odjeća'] },
      { name: 'Nakit i satovi', items: ['Modni (bijuteri) nakit', 'Narukvice', 'Naušnice', 'Ogrlice i privjesci', 'Prstenje', 'Ručni satovi – muški', 'Ručni satovi – ženski', 'Zlatni i srebrni nakit'] },
      { name: 'Torbe, novčanici i ruksaci', items: ['Novčanici i kartičnici', 'Putne torbe i kofera', 'Ručne torbice', 'Ruksaci', 'Sportske torbe'] },
      { name: 'Naočale', items: ['Dioptrijske naočale', 'Okviri bez stakala', 'Sunčane naočale'] },
      { name: 'Radna i zaštitna odjeća' },
      { name: 'Maškare i kostimi' },
      { name: 'Ostala odjeća i dodaci' },
    ]
  },

  // ─── 9. SPORT I REKREACIJA ──────────────────────────────
  {
    id: 'sport', name: 'Sport i rekreacija', icon: 'fa-dumbbell',
    subCategories: [
      { name: 'Fitness i teretana', items: ['Bučice i utezi', 'Crosstraineri i veslači', 'Dodaci prehrani (proteini, kreatin...)', 'Klupe za vježbanje', 'Rukavice i pojas za trening', 'Skakanje i crossfit oprema', 'Trake za trčanje i bicikl ergometar', 'Višefunkcionalne sprave', 'Yoga i pilates oprema'] },
      { name: 'Biciklizam (oprema)', items: ['Biciklistička odjeća', 'Dječji sjedala za bicikl', 'Kacige', 'Košare i tašne', 'Naočale', 'Računala i GPS'] },
      { name: 'Nogomet', items: ['Dresovi i oprema', 'Golovi i mreže', 'Kopačke', 'Lopte', 'Štitnici za potkoljenice'] },
      { name: 'Košarka, rukomet i ostali timski sportovi' },
      { name: 'Tenis i badminton', items: ['Lopte i perje', 'Mreže', 'Reketi', 'Tenis obuća', 'Torbe'] },
      { name: 'Zimski sportovi', items: ['Klizaljke', 'Sanjke', 'Skijaška kaciga i naočale', 'Skijaška obuća', 'Skijaška odjeća i rukavice', 'Skije kompletan set', 'Snowboard kompletan set'] },
      { name: 'Vodeni sportovi', items: ['Kajaci i kanui', 'Neopreni', 'Plivačke naočale i kape', 'Ronilačka oprema', 'SUP daske', 'Surfanje i kite surfing'] },
      { name: 'Planinarenje i kampiranje', items: ['Kuhala i oprema za kamp', 'Orijentacija i GPS', 'Planinarske cipele', 'Ruksaci planinarski', 'Šatori', 'Štapovi za hodanje', 'Vreće za spavanje'] },
      { name: 'Ribolov', items: ['Čamci za ribolov', 'Ehosonde', 'Kutije i torbe za ribolov', 'Mašinice i koluti', 'Odjeća i čizme za ribolov', 'Štapovi', 'Varalice i mamci'] },
      { name: 'Borilački sportovi', items: ['Kimona i odjeća', 'Ringovi i tatami', 'Vreće i rukavice', 'Zaštitna oprema'] },
      { name: 'Golf' },
      { name: 'Airsoft i paintball' },
      { name: 'Koturaljke, skateboard i romobili' },
      { name: 'Sportski dresovi (kolekcija)' },
      { name: 'Ostala sportska oprema' },
    ]
  },

  // ─── 10. DJECA I BEBE ───────────────────────────────────
  {
    id: 'djeca', name: 'Odjeća za djecu', icon: 'fa-child-dress',
    subCategories: [
      { name: 'Oprema za bebe', items: ['Auto sjedalice', 'Hodalice i ljuljačke', 'Hranilice, boce i njega', 'Kolica i nosiljke', 'Krevetići, posteljina i madraci', 'Kupaonice i presvlačišta'] },
      { name: 'Dječje igračke', items: ['Figurice, lutke i akcijske figure', 'Kuhinje i roleplay igračke', 'LEGO i konstruktori', 'Na daljinski (RC)', 'Plišane igračke', 'Slagalice i puzzle', 'Trampoline, tobogani i ljuljačke'] },
      { name: 'Dječji bicikli, romobili i automobili', items: ['Balans bicikli', 'Dječji quad', 'Dječji romobili', 'Električni dječji automobili', 'Skuteri za djecu'] },
      { name: 'Dječja odjeća (0–14 god)' },
      { name: 'Dječje knjige i edukacija', items: ['Bojice i kreativni setovi', 'Edukativne igre i ploče', 'Slikovnice', 'Školski pribor'] },
      { name: 'Ostalo za djecu' },
    ]
  },

  // ─── 11. GLAZBA I INSTRUMENTI ───────────────────────────
  {
    id: 'glazba', name: 'Glazba i glazbeni instrumenti', icon: 'fa-music',
    subCategories: [
      { name: 'Gitare', items: ['Akustične gitare', 'Bas gitare', 'Električne gitare', 'Gitarski pojačala i efekti', 'Klasične gitare', 'Pribor za gitare'] },
      { name: 'Bubnjevi i udaraljke', items: ['Akustični bubnjevi', 'Cajon i perkusije', 'Činele', 'Elektronički bubnjevi'] },
      { name: 'Klavijature i klaviri', items: ['Digitalni klaviri', 'Harmonike', 'Klaviri akustični', 'Pribor za klavijature', 'Sintesajzeri i workstations'] },
      { name: 'Puhački instrumenti', items: ['Flauta i klarinet', 'Saksofon', 'Truba i trombon', 'Usne harmonike'] },
      { name: 'Gudački instrumenti', items: ['Viola i violončelo', 'Violina'] },
      { name: 'Tamburice i folk instrumenti' },
      { name: 'PA sustavi i ozvučenje', items: ['Mikrofoni', 'Mixeri', 'Pojačala za instrumente', 'Zvučnici aktivni i pasivni'] },
      { name: 'Studio oprema', items: ['Audio sučelja', 'MIDI kontroleri', 'Snimačke kartice', 'Studio monitori'] },
      { name: 'Scenska i DJ oprema', items: ['DJ oprema (mixeri, decks)', 'Scenska rasvjeta', 'Stroj za dim i mjehuriće'] },
      { name: 'Ostali instrumenti i oprema' },
    ]
  },

  // ─── 12. LITERATURA I MEDIJI ────────────────────────────
  {
    id: 'literatura', name: 'Literatura i mediji', icon: 'fa-book',
    subCategories: [
      { name: 'Knjige – Beletristika', items: ['Horror', 'Humor i satira', 'Kriminalci i trileri', 'Ljubavni romani', 'Povijesni romani', 'Romani i kratke priče', 'Science fiction i fantasy'] },
      { name: 'Knjige – Stručna literatura', items: ['Arhitektura i dizajn', 'Filozofija', 'Informatika i IT', 'Inženjerstvo', 'Medicina i zdravlje', 'Pravo i financije', 'Psihologija'] },
      { name: 'Knjige – Dječje i školske', items: ['Dječji romani', 'Enciklopedije za djecu', 'Slikovnice', 'Školski udžbenici (po razredima)'] },
      { name: 'Antikvarne i stare knjige' },
      { name: 'Časopisi i magazini', items: ['Auto moto časopisi', 'IT i tech časopisi', 'Moda i lifestyle', 'Ostali časopisi', 'Sport'] },
      { name: 'Stripovi i manga' },
      { name: 'Filmovi i serije (DVD/Blu-ray)' },
      { name: 'Glazba (CD, vinil, kasete)' },
    ]
  },

  // ─── 13. VIDEO IGRE ─────────────────────────────────────
  {
    id: 'videoigre', name: 'Videoigre', icon: 'fa-gamepad',
    subCategories: [
      { name: 'PlayStation', items: ['PS3 i stariji', 'PS4 – igre i oprema', 'PS5 – igre i oprema'] },
      { name: 'Xbox', items: ['Xbox One', 'Xbox Series X/S'] },
      { name: 'Nintendo', items: ['DS i 3DS', 'Nintendo Switch', 'Wii i WiiU'] },
      { name: 'PC igre', items: ['Digitalni ključevi', 'Fizičke kopije'] },
      { name: 'Retro igre i konzole' },
      { name: 'Gaming oprema', items: ['Gamepadovi i kontroleri', 'Gaming miševi i tipkovnice', 'Gaming slušalice', 'VR oprema'] },
    ]
  },

  // ─── 14. ŽIVOTINJE ──────────────────────────────────────
  {
    id: 'zivotinje', name: 'Životinje', icon: 'fa-paw',
    subCategories: [
      { name: 'Psi', items: ['Bez rodovnice', 'Mješanci', 'S rodovnicom'] },
      { name: 'Mačke', items: ['Čistokrvne', 'Domaće mačke'] },
      { name: 'Ptice i papige' },
      { name: 'Glodavci (zečevi, zamorci, hrčci...)' },
      { name: 'Ribe i akvaristika', items: ['Akvariji i oprema', 'Ostalo', 'Tropske ribe', 'Zlatne ribice'] },
      { name: 'Terariji i gmizavci', items: ['Gušteri i kameleoni', 'Kornjače', 'Terariji i oprema', 'Zmije'] },
      { name: 'Konji' },
      { name: 'Domaće životinje (krave, svinje, koze, ovce, perad...)' },
      { name: 'Oprema za životinje', items: ['Hrana za mačke', 'Hrana za ostale životinje', 'Hrana za pse', 'Igračke za kućne ljubimce', 'Kućice, kavezi i nosiljke', 'Njega i higijena', 'Ovratnici, povodci i pojasi', 'Veterinarski pribor'] },
      { name: 'Udomljavanje – psi' },
      { name: 'Udomljavanje – mačke' },
      { name: 'Udomljavanje – ostalo' },
    ]
  },

  // ─── 15. HRANA I PIĆE ───────────────────────────────────
  {
    id: 'hrana', name: 'Hrana i piće', icon: 'fa-utensils',
    subCategories: [
      { name: 'Biljni proizvodi', items: ['Brašna', 'Povrće', 'Voće', 'Ostali biljni proizvodi'] },
      { name: 'Dezerti i slastice', items: ['Džem i pekmez', 'Grickalice', 'Kolači i torte', 'Ostali slatkiši'] },
      { name: 'Pića', items: ['Sokovi', 'Kafa', 'Ostala alkoholna pića', 'Piva', 'Rakije', 'Vina', 'Čajevi', 'Ostalo'] },
      { name: 'Životinjski proizvodi', items: ['Jaja', 'Masti', 'Med i proizvodi od meda', 'Meso i mesni proizvodi', 'Ribe i morska hrana', 'Ostalo'] },
      { name: 'Mliječni proizvodi' },
      { name: 'Paketi proizvoda' },
      { name: 'Prerada hrane' },
      { name: 'Ulja i začini' },
    ]
  },

  // ─── 16. STROJEVI I ALATI ───────────────────────────────
  {
    id: 'strojevi', name: 'Strojevi i alati', icon: 'fa-wrench',
    subCategories: [
      { name: 'Ručni alati', items: ['Čekići, odvijači, kliješta', 'Ključevi i nasadni seti', 'Mjerači i libele', 'Ostali ručni alati'] },
      { name: 'Električni alati', items: ['Brusilice za drvo', 'Bušilice i udarne bušilice', 'Cirkularne pile', 'Kompresori', 'Kutne brusilice', 'Pneumatski alati', 'Ubodne pile'] },
      { name: 'Građevinski strojevi', items: ['Asfalt strojevi', 'Betonske miješalice', 'Dijelovi građevinskih strojeva', 'Dizalice i platforme', 'Kompresori veliki', 'Mini bageri', 'Utovarivači', 'Vibracijske ploče'] },
      { name: 'Poljoprivredni strojevi', items: ['Cistijerne i cisterne za navodnjavanje', 'Kombajni', 'Kosilice traktorske', 'Ostala agrarna mehanizacija', 'Priključci za traktor (plug, tanjurača, roto tiller...)', 'Šprice i atomizeri', 'Traktori'] },
      { name: 'Vrtni strojevi', items: ['Lišće usisavači', 'Motorne kosilice', 'Motorne pile', 'Motorni šišači živice', 'Motorni trimer', 'Ostali vrtni strojevi', 'Ride-on kosilice'] },
      { name: 'Viljuškari i manipulacijska oprema' },
      { name: 'Industrijski i prerađivački strojevi', items: ['Strojevi za obradu drva', 'Strojevi za obradu kamena', 'Strojevi za obradu metala', 'Strojevi za pakovanje', 'Tekstilni strojevi'] },
      { name: 'Ostali strojevi i alati' },
    ]
  },

  // ─── 17. POSLOVI ────────────────────────────────────────
  {
    id: 'poslovi', name: 'Poslovi', icon: 'fa-briefcase',
    subCategories: [
      { name: 'IT i telekomunikacije' },
      { name: 'Građevinarstvo i geodezija' },
      { name: 'Promet, logistika i špedicija' },
      { name: 'Turizam i ugostiteljstvo' },
      { name: 'Zdravstvo i farmacija' },
      { name: 'Obrazovanje i nauka' },
      { name: 'Financije i računovodstvo' },
      { name: 'Marketing i PR' },
      { name: 'Prodaja i komercijala' },
      { name: 'Administracija i HR' },
      { name: 'Poljoprivreda i šumarstvo' },
      { name: 'Elektrotehnika i strojarstvo' },
      { name: 'Tekstilna industrija' },
      { name: 'Sigurnost i zaštita' },
      { name: 'Ostali poslovi' },
    ]
  },

  // ─── 18. USLUGE ─────────────────────────────────────────
  {
    id: 'usluge', name: 'Usluge', icon: 'fa-handshake',
    subCategories: [
      { name: 'Servisiranje vozila', items: ['Autoelektričar', 'Autolimar', 'Automehaničar', 'Klima servis', 'Pranje i detailing', 'Tehnički pregled i registracija', 'Vulkanizer'] },
      { name: 'Građevinske usluge', items: ['Adaptacije i renovacije', 'Arhitektura i projektovanje', 'Elektroinstalacije', 'Grijanje i klima montaža', 'Keramičari', 'Krovopokrivači', 'Moleri', 'Podopolaganje', 'Stolarija i PVC', 'Vodoinstalacije', 'Zidanje i fasade'] },
      { name: 'IT usluge', items: ['Dizajn i grafika', 'Mrežna infrastruktura', 'Servis mobitela', 'Servis računala', 'Web razvoj'] },
      { name: 'Ljepota i njega', items: ['Frizerski salon', 'Kozmetički salon', 'Manikura i pedikura', 'Masaže i terapije', 'Tattoo i piercing'] },
      { name: 'Edukacija i poduke', items: ['Autoškola', 'Glazbena škola', 'Instrukcije (škola i faks)', 'IT kursevi', 'Jezični tečajevi', 'Sportska škola'] },
      { name: 'Transport i selidbe', items: ['Dostava robe', 'Kombi prijevoz', 'Prijevoz osoba', 'Selidbe i pakovanje'] },
      { name: 'Čišćenje i održavanje', items: ['Čišćenje nakon gradnje', 'Čišćenje poslovnih prostora', 'Čišćenje stanova', 'Čišćenje tepiha'] },
      { name: 'Dizajn, tisak i fotografija' },
      { name: 'Pravne i financijske usluge' },
      { name: 'Iznajmljivanje vozila i strojeva' },
      { name: 'Event, vjenčanja i zabava' },
      { name: 'Kućni ljubimci – usluge', items: ['Dog sitting i šetanje', 'Šišanje i njega', 'Veterinar'] },
      { name: 'Ostale usluge' },
    ]
  },

  // ─── 19. UMJETNOST I KOLEKCIONARSTVO ────────────────────
  {
    id: 'umjetnost', name: 'Umjetnost i kolekcionarstvo', icon: 'fa-palette',
    subCategories: [
      { name: 'Slike i skulpture', items: ['Akvareli', 'Digitalna umjetnost – print', 'Grafike', 'Skulpture', 'Ulje na platnu'] },
      { name: 'Fotografije i posteri' },
      { name: 'Antikviteti i starine', items: ['Antikni namještaj', 'Ostale starine', 'Porculan i keramika', 'Stari satovi'] },
      { name: 'Numizmatika', items: ['Medalje i bedževi', 'Novčanice', 'Novčići (kovanice)'] },
      { name: 'Filatelija (marke i dopisnice)' },
      { name: 'Militarija', items: ['Fotografije i dokumenti', 'Odlikovanja i medalje', 'Oružje (starinski – muzejski)', 'Uniforme i odjeća'] },
      { name: 'Modelarstvo', items: ['RC modeli (automobili, zrakoplovi)', 'Statični modeli', 'Vlakovi i željeznica'] },
      { name: 'Razglednice i stare fotografije' },
      { name: 'Ostale kolekcije' },
    ]
  },

  // ─── 20. OSTALO ─────────────────────────────────────────
  {
    id: 'ostalo', name: 'Ostalo', icon: 'fa-ellipsis',
    subCategories: [
      { name: 'Karte i ulaznice', items: ['Festivali', 'Kazalište i opera', 'Koncerti', 'Sport'] },
      { name: 'Kozmetika i ljepota', items: ['Njega kose', 'Njega lica i tijela', 'Parfemi', 'Profesionalna salon oprema', 'Šminka i boje'] },
      { name: 'Medicinska pomagala', items: ['Inhalatori', 'Invalidska kolica', 'Ostalo', 'Štake i hodalice'] },
      { name: 'Vjenčanja', items: ['Dekoracije', 'Odijela', 'Pozivnice i tisak', 'Vjenčanice'] },
      { name: 'Investicijsko zlato i srebro' },
      { name: 'Grobna mjesta' },
      { name: 'Poklanjam (besplatno)' },
      { name: 'Sve ostalo' },
    ]
  },
];

export const CATEGORY_IMAGES: Record<string, string> = {
  'kategorije':      '/categories/01_sve.jpg',
  'vozila':          '/categories/02_vozila.jpg',
  'dijelovi':        '/categories/03_dijelovi.jpg',
  'nekretnine':      '/categories/04_nekretnine.jpg',
  'mobiteli':        '/categories/05_mobiteli.jpg',
  'racunala':        '/categories/06_racunala.jpg',
  'tehnika':         '/categories/21_tehnika.jpg',
  'dom':             '/categories/07_dom_vrt.jpg',
  'odjeca':          '/categories/08_odjeca.jpg',
  'sport':           '/categories/09_sport.jpg',
  'djeca':           '/categories/10_djeca.jpg',
  'glazba':          '/categories/11_glazba.jpg',
  'literatura':      '/categories/12_literatura.jpg',
  'videoigre':       '/categories/13_igre.jpg',
  'zivotinje':       '/categories/14_zivotinje.jpg',
  'hrana':           '/categories/15_hrana.jpg',
  'strojevi':        '/categories/16_strojevi.jpg',
  'poslovi':         '/categories/17_poslovi.jpg',
  'usluge':          '/categories/18_usluge.jpg',
  'umjetnost':       '/categories/19_umjetnost.jpg',
  'ostalo':          '/categories/20_ostalo.jpg',
};

export const MOCK_PRODUCTS: Product[] = [
  {
    id: '1',
    name: 'Samsung Galaxy S25 Ultra 256GB',
    price: 900,
    secondaryPriceLabel: '1.760 KM',
    location: 'Zagreb',
    timeLabel: 'danas 12:10',
    description: 'Latest flagship Samsung phone. 200MP kamera, Snapdragon 8 Gen 3, titanium okvir.',
    imageUrl: 'https://images.unsplash.com/photo-1610945415295-d9bbf067e59c?auto=format&fit=crop&q=80&w=400',
    category: 'Elektronika',
    subCategory: 'Mobiteli',
    seller: 'alex_k',
    condition: 'New',
    views: 1243
  },
  {
    id: '2',
    name: 'iPhone 15 Pro 256GB Platinum',
    price: 1050,
    secondaryPriceLabel: '2.054 KM',
    location: 'Sarajevo',
    timeLabel: 'prije 1h',
    description: 'Perfect condition iPhone. A17 Pro čip, 48MP trostruka kamera, USB-C.',
    imageUrl: 'https://images.unsplash.com/photo-1696446701796-da61225697cc?auto=format&fit=crop&q=80&w=400',
    category: 'Elektronika',
    subCategory: 'Mobiteli',
    seller: 'sneakerhead99',
    condition: 'Like New',
    views: 876
  },
  {
    id: '3',
    name: 'Porsche Panamera 4S (Black Edition)',
    price: 55000,
    secondaryPriceLabel: '107.500 KM',
    location: 'Banja Luka',
    timeLabel: 'danas 10:45',
    description: 'Fast and reliable luxury car. 2.9L V6 Twin-Turbo, 440 KS, full oprema.',
    imageUrl: 'https://images.unsplash.com/photo-1503376780353-7e6692767b70?auto=format&fit=crop&q=80&w=400',
    category: 'Vozila',
    subCategory: 'Automobili',
    seller: 'luxury_autos',
    condition: 'Used',
    views: 3521
  },
  {
    id: '4',
    name: 'BMW 320d M-Paket 2021',
    price: 32000,
    secondaryPriceLabel: '62.587 KM',
    location: 'Mostar',
    timeLabel: 'prije 3h',
    description: 'Dizel, automatik, LED farovi, navigacija, M-sport paket. Servisna knjižica.',
    imageUrl: 'https://images.unsplash.com/photo-1555215695-3004980ad54e?auto=format&fit=crop&q=80&w=400',
    category: 'Vozila',
    subCategory: 'Automobili',
    seller: 'auto_centar_mostar',
    condition: 'Used',
    views: 2180
  },
  {
    id: '5',
    name: 'MacBook Pro 14" M3 Pro 512GB',
    price: 1800,
    secondaryPriceLabel: '3.520 KM',
    location: 'Wien',
    timeLabel: 'danas 09:30',
    description: 'Apple M3 Pro čip, 18GB RAM, Space Black. Kupljen u iStyle, garancija do 2026.',
    imageUrl: 'https://images.unsplash.com/photo-1517336714731-489689fd1ca8?auto=format&fit=crop&q=80&w=400',
    category: 'Elektronika',
    subCategory: 'Laptopi',
    seller: 'tech_vienna',
    condition: 'Like New',
    views: 1567
  },
  {
    id: '6',
    name: 'Stan 65m² Centar Sarajevo',
    price: 185000,
    secondaryPriceLabel: '361.829 KM',
    location: 'Sarajevo',
    timeLabel: 'jučer',
    description: 'Trosoban stan u strogom centru. Renoviran 2023, centralno grijanje, parking.',
    imageUrl: 'https://images.unsplash.com/photo-1560448204-e02f11c3d0e2?auto=format&fit=crop&q=80&w=400',
    category: 'Nekretnine',
    subCategory: 'Stanovi',
    seller: 'nekretnine_sa',
    condition: 'Used',
    views: 4230
  },
  {
    id: '7',
    name: 'Nike Air Jordan 1 Retro High OG',
    price: 180,
    secondaryPriceLabel: '352 KM',
    location: 'Tuzla',
    timeLabel: 'prije 2h',
    description: 'Originalne Jordan patike, vel. 43. Nošene 2x, kutija i račun.',
    imageUrl: 'https://images.unsplash.com/photo-1542291026-7eec264c27ff?auto=format&fit=crop&q=80&w=400',
    category: 'Odjeća i obuća',
    subCategory: 'Patike',
    seller: 'sneaker_bih',
    condition: 'Like New',
    views: 892
  },
  {
    id: '8',
    name: 'PlayStation 5 Digital Edition + 2 Kontrolera',
    price: 380,
    secondaryPriceLabel: '743 KM',
    location: 'Split',
    timeLabel: 'danas 14:20',
    description: 'PS5 Digital, bijela boja. Dva DualSense kontrolera, punjač, 5 igrica.',
    imageUrl: 'https://images.unsplash.com/photo-1606813907291-d86efa9b94db?auto=format&fit=crop&q=80&w=400',
    category: 'Elektronika',
    subCategory: 'Konzole',
    seller: 'gaming_split',
    condition: 'Used',
    views: 1105
  },
  {
    id: '9',
    name: 'Vespa Primavera 125cc 2022',
    price: 3200,
    secondaryPriceLabel: '6.259 KM',
    location: 'Dubrovnik',
    timeLabel: 'prije 5h',
    description: 'Vespa Primavera, pređeno samo 2.100km. Garažirana, servisirana.',
    imageUrl: 'https://images.unsplash.com/photo-1558618666-fcd25c85f82e?auto=format&fit=crop&q=80&w=400',
    category: 'Vozila',
    subCategory: 'Motocikli',
    seller: 'moto_dubrovnik',
    condition: 'Like New',
    views: 654
  },
  {
    id: '10',
    name: 'IKEA Sofa KIVIK 3-sjedište Siva',
    price: 350,
    secondaryPriceLabel: '685 KM',
    location: 'Graz',
    timeLabel: 'jučer',
    description: 'IKEA KIVIK trosjed, siva boja. Navlaka periva. Odlično stanje, bez oštećenja.',
    imageUrl: 'https://images.unsplash.com/photo-1555041469-a586c61ea9bc?auto=format&fit=crop&q=80&w=400',
    category: 'Moj dom',
    subCategory: 'Namještaj',
    seller: 'marko_graz',
    condition: 'Used',
    views: 445
  },
  {
    id: '11',
    name: 'Canon EOS R6 Mark II + RF 24-105mm',
    price: 2400,
    secondaryPriceLabel: '4.694 KM',
    location: 'Zagreb',
    timeLabel: 'danas 11:00',
    description: 'Mirrorless kamera, 24.2MP, 4K 60fps, IBIS. Kit objektiv. Kupljen u Canosi.',
    imageUrl: 'https://images.unsplash.com/photo-1516035069371-29a1b244cc32?auto=format&fit=crop&q=80&w=400',
    category: 'Elektronika',
    subCategory: 'Kamere',
    seller: 'foto_pro_zg',
    condition: 'New',
    views: 987
  },
  {
    id: '12',
    name: 'Volkswagen Golf 8 2.0 TDI DSG',
    price: 28500,
    secondaryPriceLabel: '55.741 KM',
    location: 'Zenica',
    timeLabel: 'prije 4h',
    description: 'Golf 8, 2020. godište, 150 KS, DSG automatik. Pređeno 68.000km, full oprema.',
    imageUrl: 'https://images.unsplash.com/photo-1471444928139-48c5bf5173c8?auto=format&fit=crop&q=80&w=400',
    category: 'Vozila',
    subCategory: 'Automobili',
    seller: 'vw_zenica',
    condition: 'Used',
    views: 2890
  },
  {
    id: '13',
    name: 'Rolex Submariner Date 41mm',
    price: 12500,
    secondaryPriceLabel: '24.448 KM',
    location: 'Wien',
    timeLabel: 'danas 08:15',
    description: 'Rolex Submariner 126610LN, crni brojčanik. Komplet sa kutijom i papirima. 2023.',
    imageUrl: 'https://images.unsplash.com/photo-1523170335258-f5ed11844a49?auto=format&fit=crop&q=80&w=400',
    category: 'Nakit i satovi',
    subCategory: 'Ručni satovi',
    seller: 'watch_collector_at',
    condition: 'Like New',
    views: 3102
  },
  {
    id: '14',
    name: 'Zimske Gume Continental 225/45 R18',
    price: 280,
    secondaryPriceLabel: '548 KM',
    location: 'Bihać',
    timeLabel: 'prije 6h',
    description: 'Set od 4 zimske gume Continental WinterContact. Profil 6mm, jedna sezona.',
    imageUrl: 'https://images.unsplash.com/photo-1578844251758-2f71da645217?auto=format&fit=crop&q=80&w=400',
    category: 'Dijelovi za vozila',
    subCategory: 'Gume',
    seller: 'gume_una',
    condition: 'Used',
    views: 567
  },
  {
    id: '15',
    name: 'Gaming PC RTX 4070 / Ryzen 7 7700X',
    price: 1200,
    secondaryPriceLabel: '2.347 KM',
    location: 'Rijeka',
    timeLabel: 'danas 13:45',
    description: 'Custom gaming PC. RTX 4070 12GB, Ryzen 7 7700X, 32GB DDR5, 1TB NVMe SSD.',
    imageUrl: 'https://images.unsplash.com/photo-1587831990711-23ca6441447b?auto=format&fit=crop&q=80&w=400',
    category: 'Elektronika',
    subCategory: 'Desktop',
    seller: 'pc_master_ri',
    condition: 'New',
    views: 1823
  },
  {
    id: '16',
    name: 'Dječja Kolica Cybex Priam 2024',
    price: 450,
    secondaryPriceLabel: '880 KM',
    location: 'Sarajevo',
    timeLabel: 'jučer',
    description: 'Cybex Priam, crni ram, sivi tekstil. Korištena 6 mjeseci, kao nova.',
    imageUrl: 'https://images.unsplash.com/photo-1591088398332-8a7791972843?auto=format&fit=crop&q=80&w=400',
    category: 'Bebe',
    subCategory: 'Kolica',
    seller: 'mama_sa',
    condition: 'Like New',
    views: 334
  },
  {
    id: '17',
    name: 'Yamaha Akustična Gitara FG800',
    price: 200,
    secondaryPriceLabel: '391 KM',
    location: 'Osijek',
    timeLabel: 'prije 1 dan',
    description: 'Yamaha FG800, solid top spruce. Odličan zvuk za početnike i napredne.',
    imageUrl: 'https://images.unsplash.com/photo-1510915361894-db8b60106cb1?auto=format&fit=crop&q=80&w=400',
    category: 'Muzička oprema',
    subCategory: 'Instrumenti',
    seller: 'muzika_os',
    condition: 'Used',
    views: 221
  },
  {
    id: '18',
    name: 'Kuća sa Bazenom 250m² Neum',
    price: 320000,
    secondaryPriceLabel: '625.866 KM',
    location: 'Mostar',
    timeLabel: 'danas 07:00',
    description: 'Kuća sa pogledom na more, bazen, garaža, vrt 500m². 15 min od plaže.',
    imageUrl: 'https://images.unsplash.com/photo-1564013799919-ab600027ffc6?auto=format&fit=crop&q=80&w=400',
    category: 'Nekretnine',
    subCategory: 'Kuće',
    seller: 'nekretnine_neum',
    condition: 'Used',
    views: 5670
  },
  {
    id: '19',
    name: 'Perilica Rublja Samsung 9kg',
    price: 420,
    secondaryPriceLabel: '821 KM',
    location: 'München',
    timeLabel: 'prije 2 dana',
    description: 'Samsung WW90T534DAW, 9kg, 1400 okretaja, A razred. Garancija do 2027.',
    imageUrl: 'https://images.unsplash.com/photo-1626806787461-102c1bfaaea1?auto=format&fit=crop&q=80&w=400',
    category: 'Elektronika',
    subCategory: 'Bijela tehnika',
    seller: 'haushalt_muc',
    condition: 'New',
    views: 298
  },
  {
    id: '20',
    name: 'Xiaomi Electric Scooter Pro 2',
    price: 320,
    secondaryPriceLabel: '626 KM',
    location: 'Tuzla',
    timeLabel: 'danas 16:00',
    description: 'Električni romobil, 45km domet, 25km/h max. Pređeno 200km, sve ispravno.',
    imageUrl: 'https://images.unsplash.com/photo-1558618666-fcd25c85f82e?auto=format&fit=crop&q=80&w=400',
    category: 'Sportska oprema',
    subCategory: 'Biciklizam',
    seller: 'eco_ride_tz',
    condition: 'Like New',
    views: 723
  },
  {
    id: '21',
    name: 'Adidas Ultraboost 22 (vel. 42)',
    price: 90,
    secondaryPriceLabel: '176 KM',
    location: 'Bijeljina',
    timeLabel: 'prije 8h',
    description: 'Adidas Ultraboost, crne boje. Nošene par puta, bez tragova nošenja.',
    imageUrl: 'https://images.unsplash.com/photo-1556906781-9a412961c28c?auto=format&fit=crop&q=80&w=400',
    category: 'Odjeća i obuća',
    subCategory: 'Patike',
    seller: 'sportski_kutak',
    condition: 'Like New',
    views: 445
  },
  {
    id: '22',
    name: 'Samsung 65" QLED 4K TV QN85B',
    price: 750,
    secondaryPriceLabel: '1.467 KM',
    location: 'Stuttgart',
    timeLabel: 'jučer',
    description: 'Samsung Neo QLED 65 inča, 4K 120Hz, Tizen OS. Račun i garancija.',
    imageUrl: 'https://images.unsplash.com/photo-1593359677879-a4bb92f829d1?auto=format&fit=crop&q=80&w=400',
    category: 'Elektronika',
    subCategory: 'TV',
    seller: 'elektro_stgt',
    condition: 'Used',
    views: 1034
  },
  {
    id: '23',
    name: 'Audi A4 Avant 2.0 TDI S-Line',
    price: 24000,
    secondaryPriceLabel: '46.940 KM',
    location: 'Linz',
    timeLabel: 'danas 10:00',
    description: 'Audi A4 Avant, 2019. godište, S-Line, Matrix LED, virtual cockpit. 95.000km.',
    imageUrl: 'https://images.unsplash.com/photo-1606664515524-ed2f786a0bd6?auto=format&fit=crop&q=80&w=400',
    category: 'Vozila',
    subCategory: 'Automobili',
    seller: 'auto_linz',
    condition: 'Used',
    views: 2456
  },
  {
    id: '24',
    name: 'Teretana Set - Bench + Utezi 100kg',
    price: 350,
    secondaryPriceLabel: '685 KM',
    location: 'Prijedor',
    timeLabel: 'prije 1 dan',
    description: 'Bench klupa sa stalkom + olimpijska šipka + set utega do 100kg. Gumeni pod.',
    imageUrl: 'https://images.unsplash.com/photo-1534438327276-14e5300c3a48?auto=format&fit=crop&q=80&w=400',
    category: 'Sportska oprema',
    subCategory: 'Teretana',
    seller: 'fit_shop_pd',
    condition: 'Used',
    views: 567
  },
  {
    id: '25',
    name: 'Zlatna Ogrlica 585 (14K) 45cm',
    price: 650,
    secondaryPriceLabel: '1.271 KM',
    location: 'Široki Brijeg',
    timeLabel: 'danas 15:30',
    description: 'Zlatna ogrlica 14 karata, 45cm, talijanski dizajn. Certifikat i kutijica.',
    imageUrl: 'https://images.unsplash.com/photo-1515562141207-7a88fb7ce338?auto=format&fit=crop&q=80&w=400',
    category: 'Nakit i satovi',
    subCategory: 'Nakit',
    seller: 'zlatar_sb',
    condition: 'New',
    views: 389
  }
];

export const CURRENT_USER: User = {
  id: 'user_01',
  username: 'antonios7',
  fullName: 'Leo Andersen',
  bio: 'Curating the best gear.',
  avatarUrl: 'https://picsum.photos/seed/me/200/200',
  followers: 1250,
  following: 432,
  items: ['1']
};
