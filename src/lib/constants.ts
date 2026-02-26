import { Product, User, Category } from './types';

/** Fixed EUR → BAM (Convertible Mark) exchange rate */
export const BAM_RATE = 1.95583;

export const CATEGORIES: Category[] = [
  // ─── 1. VOZILA ────────────────────────────────────────────
  {
    id: 'vozila', name: 'Vozila', icon: 'fa-car',
    subCategories: [
      { name: 'Osobni automobili', items: ['Novi automobili (od dilera)', 'Rabljeni automobili', 'Automobili s jamstvom', 'Oldtimeri i veteran vozila', 'Karambolirani i neispravni automobili', 'Električni automobili', 'Hibridni automobili'] },
      { name: 'Motocikli i skuteri', items: ['Sport motocikli', 'Cruiser / chopper', 'Enduro i cross', 'Naked / streetfighter', 'Skuteri i mopedi', 'Električni motocikli i skuteri', 'Tricikli i quadricikli'] },
      { name: 'Teretna vozila', items: ['Kombiji i dostavna vozila (do 3.5t)', 'Kamioni (3.5t – 7.5t)', 'Teški kamioni (7.5t+)', 'Hladnjače i frigorifici', 'Kiperi i kiper prikolice', 'Cistijerne', 'Tegljači i vučna vozila'] },
      { name: 'Autobusi i minibusi', items: ['Minibusi (do 20 mjesta)', 'Gradski autobusi', 'Turistički autobusi', 'Školski autobusi'] },
      { name: 'Bicikli', items: ['MTB / Mountain bike', 'Trekking i city bicikli', 'Cestovni (road) bicikli', 'Električni bicikli (e-bike)', 'Dječji bicikli', 'BMX', 'Gravel bicikli', 'Sklopivi bicikli'] },
      { name: 'Kamperi i kamp prikolice', items: ['Kamperi (integrirani)', 'Polu-integrirani kamperi', 'Alkoven kamperi', 'Kamp prikolice / karavani', 'Krovni šatori i oprema'] },
      { name: 'Prikolice', items: ['Prikolice za automobile (osobne)', 'Prikolice za motocikle', 'Prikolice za bicikle', 'Prikolice za čamce / nautiku', 'Prikolice za konje i stoku', 'Hladnjačke i frigorifik prikolice', 'Prikolice za građevinu i šutu', 'Prikolice za drva i biomasu', 'Kiper prikolice', 'Ostale prikolice'] },
      { name: 'Nautika i plovila', items: ['Čamci na motor', 'Jedrilice', 'Gumenjaci i RIB čamci', 'Jet ski i vodeni skuteri', 'Kajaci i kanui', 'SUP daske', 'Jahte', 'Ribarski čamci', 'Brodovi'] },
      { name: 'ATV / Quad / UTV' },
      { name: 'Ostala vozila', items: ['Traktori (cestovni)', 'Golf kolica', 'Segway i električni romobili za odrasle'] },
    ]
  },

  // ─── 2. DIJELOVI ZA VOZILA ───────────────────────────────
  {
    id: 'dijelovi', name: 'Dijelovi za vozila', icon: 'fa-gears',
    subCategories: [
      { name: 'Za automobile – Motor i mjenjač', items: ['Motor (kompletan agregat)', 'Blok motora', 'Glava motora i brtve', 'Klipovi i prstenovi', 'Bregaste i koljenaste osovine', 'Turbine i turbopunjači', 'Kompresori (mehanički)', 'Intercooleri i hladnjaci punjenja', 'Brizgači i common rail', 'Karburatori i usisne grane', 'Pumpe goriva i injektori', 'Pumpe ulja i filteri ulja', 'Pumpe rashladne vode i termostati', 'Hladnjaci vode i ulja', 'Ispušni kolektori i lonci', 'Katalizatori i DPF filteri', 'EGR ventili i moduli', 'Zupčasti i klinasti remeni, lanci', 'Ručni mjenjač (kompletan)', 'Automatski mjenjač (kompletan)', 'DSG / CVT mjenjač', 'Kvačilo, lamela i zamašnjak', 'Kardansko vratilo', 'Diferencijal i mostovi', 'Pogonske osovine i homokineti', 'Usisni sustav i filteri zraka', 'Ostali dijelovi motora'] },
      { name: 'Za automobile – Elektrika i elektronika', items: ['ECU / Centralina motora', 'Centralina mjenjača', 'ABS pumpa i upravljačka jedinica', 'ESP / ASR modul', 'Airbag modul upravljačke jedinice', 'Airbag pojasevi i punjači', 'Alternatori / dinamo', 'Starter / pokretač', 'Akumulator i baterija', 'Relei i osigurači i kutija osigurača', 'Kablovski snopovi i instalacije', 'Senzori (lambda, MAP, MAF, NOx...)', 'Senzori temperature i pritiska', 'Senzori ABS kotača', 'Senzori paljenja i položaja radilice', 'Instrumentna ploča i sat', 'Multimedija i ekrani (OEM)', 'Električni prozori motori i regulator', 'Centralna brava i aktuatori', 'Farovi (prednji – halogeni, LED, xenon)', 'Stop svjetla i žmigavci', 'Dnevna svjetla (DRL)', 'Maglenke prednje i stražnje', 'Klima kompresor i dijelovi', 'Grijanje sjedala i upravljača', 'Senzori parkiranja i kamere', 'Ostala elektrika i elektronika'] },
      { name: 'Za automobile – Karoserija i stakla', items: ['Prednji branik / odbojnik', 'Stražnji branik / odbojnik', 'Prednji blatobrani (lijevi/desni)', 'Stražnji blatobrani', 'Poklopac motora / hauba', 'Gepek vrata / hauba prtljažnika', 'Prednja vrata (lijeva/desna)', 'Stražnja vrata (lijeva/desna)', 'Brave i ručice vrata', 'Šine i klizni mehanizmi vrata', 'Krov i panoramski krov', 'Pragovi i lajsne', 'Retrovizori vanjski (lijevi/desni)', 'Vjetrobransko staklo', 'Bočna stakla', 'Stražnje staklo', 'Brisači i motori brisača', 'Karoserija u dijelovima (škart)', 'Ostali karoserijski dijelovi'] },
      { name: 'Za automobile – Unutrašnjost i sjedala', items: ['Prednja sjedala (vozač/suvozač)', 'Stražnja sjedala / klupa', 'Nasloni za glavu', 'Volan i upravljački stup', 'Ručica mjenjača i manžeta', 'Ručna kočnica i obloga', 'Armaturna ploča (instrument ploča)', 'Središnja konzola', 'Obloge vrata (unutrašnje)', 'Tapeciranje stropa', 'Tepisi i gumene podne obloge', 'Sigurnosni pojasevi i kopče', 'Retrovizor unutrašnji', 'Sunčane zaslone', 'Pedale i nastavci pedala', 'Prekidači i dugmad (stakla, svjetla...)', 'Ostala unutrašnjost'] },
      { name: 'Za automobile – Ovjes i kočnice', items: ['Amortizeri prednji', 'Amortizeri stražnji', 'Opruge (spiralne, listne)', 'Federbajni (kompletni McPherson)', 'Ramena ovjesa i poluge', 'Kuglični zglobovi', 'Krajevi upravljača', 'Upravljačka letva / servo pumpa', 'Servo pumpa upravljača', 'Ležajevi kotača i glavčine', 'Stabilizatori i gumice stabilizatora', 'Disk kočnice prednje', 'Disk kočnice stražnje', 'Kočione pločice prednje', 'Kočione pločice stražnje', 'Kočione čeljusti', 'Kočioni bubnjevi', 'Kočioni cilindri i crijevca', 'Kočiona tekućina i rezervoar', 'Ručna kočnica dijelovi', 'Ostali ovjes i kočnice'] },
      { name: 'Za automobile – Felge i gume', items: ['Čelične felge', 'Aluminijske / alu felge', 'Ljetne gume', 'Zimske gume', 'Cjelogodišnje gume', 'Rezervni kotač (stepnica)', 'Pokrovi / hubcaps', 'Matice i vijci kotača', 'Distanceri felgi', 'Lanci za snijeg'] },
      { name: 'Za automobile – Tuning i oprema', items: ['Spojleri i lip spojleri', 'Bodykit i pragovi', 'Difuzori stražnji', 'Karbonski dijelovi', 'Sportski ispuh i down pipe', 'Sportski filteri zraka', 'Chip tuning i upravljačke jedinice (aftermarket)', 'Sportska sjedala', 'Sportski volan', 'Kuka za vuču / towbar', 'Krovni nosači i šine', 'Nosači za bicikle i skijaška oprema', 'Zaštitne folije i wrap', 'LED trake i dekorativna rasvjeta', 'Ostali tuning'] },
      { name: 'Za automobile – Navigacija i auto akustika', items: ['Radio i OEM multimedija', 'Aftermarket navigacija i ekrani', 'Stražnje i 360° kamere', 'Zvučnici prednji i stražnji', 'Pojačala', 'Subwooferi i bass', 'Auto alarm i imobilajzer', 'GPS lokatori', 'Dash kamere', 'Hands-free i Bluetooth moduli'] },
      { name: 'Za automobile – Kozmetika i ulja', items: ['Motorna ulja i aditivi', 'Mjenjačka i diferencijalna ulja', 'Rashladna tekućina (antifriz)', 'Kočiona tekućina', 'Servo tekućina', 'Tekućina za brisače', 'Šamponi i voskovi', 'Poliri i zaštite laka', 'Čistači interijera i plastike', 'Zaštita podvozja i antikoro'] },
      { name: 'Za motocikle – Motor i transmisija', items: ['Motor kompletan', 'Cilindar i glava cilindra', 'Klipovi i segmenti', 'Karburator i injektor', 'Usisna grana i filtar', 'Ispuh i lonac', 'Lanci pogonski i zvjezdice', 'Kvačilo i lamele', 'Mjenjač'] },
      { name: 'Za motocikle – Karoserija i oklopi', items: ['Prednja maska i oklopi', 'Bočni oklopi', 'Stražnji oklop i sjedište', 'Rezervoar goriva', 'Prednji i stražnji blatobran', 'Nasloni i kutije'] },
      { name: 'Za motocikle – Elektrika i paljenje', items: ['ECU / centralina', 'Svjećice i bobine paljenja', 'Farovi i stop svjetla', 'Žmigavci', 'Baterija / akumulator', 'Alternator i regulator'] },
      { name: 'Za motocikle – Ovjes i kočnice', items: ['Prednja viljuška i opruge', 'Stražnji amortizer', 'Disk kočnice', 'Kočione pločice i čeljusti', 'Ležajevi kotača'] },
      { name: 'Za motocikle – Felge i gume', items: ['Prednje felge', 'Stražnje felge', 'Ljetne / sportske gume', 'Enduro i off-road gume'] },
      { name: 'Za motocikle – Zaštitna oprema i odjeća', items: ['Kacige (integralne, open face, off-road)', 'Moto jakne i kombinezon', 'Moto hlače', 'Moto rukavice', 'Moto čizme i cipele', 'Oklopi i protektori', 'Reflektirajuća oprema'] },
      { name: 'Za motocikle – Kofera, torbice i nosači' },
      { name: 'Za bicikle – Okviri i vilice', items: ['Okviri MTB', 'Okviri cestovni / road', 'Okviri gravel', 'Vilice (rigidne i s amortizerom)'] },
      { name: 'Za bicikle – Kotači i gume', items: ['Prednji kotač kompletan', 'Stražnji kotač kompletan', 'Naplatci / felge', 'Gume MTB', 'Gume cestovne', 'Gume gravel', 'Unutarnje gume i tubeless', 'Niple i žbice'] },
      { name: 'Za bicikle – Kočnice i mjenjači', items: ['Disk kočnice (hidrauličke/mehaničke)', 'V-brake kočnice', 'Kočione pločice i obloge', 'Kočne ručice', 'Stražnji mjenjač / derailleur', 'Prednji mjenjač', 'Ručice mjenjača', 'Lanci', 'Kazete i zvjezdice', 'Naplatci single speed'] },
      { name: 'Za bicikle – Pogon i pedale', items: ['Kranke i pedalier', 'Pedale (platforme, clipless)', 'Srednja osovina / bottom bracket'] },
      { name: 'Za bicikle – Upravljač i sjedalo', items: ['Upravljači / kormila', 'Lula upravljača', 'Sjedala', 'Sjedaljke / stupe', 'Ergonomski ručkovi'] },
      { name: 'Za bicikle – Osvjetljenje i oprema', items: ['Prednja svjetla', 'Stražnja svjetla', 'Reflektori', 'Blatobrani', 'Košare i nosači', 'Zaključavanja i brave', 'Računala i brzinomjeri', 'Pumpe'] },
      { name: 'Za bicikle – Zaštitna oprema', items: ['Kacige', 'Biciklističke rukavice', 'Koljena i lakat štitnici', 'Biciklistička odjeća', 'Biciklističke naočale'] },
      { name: 'Za teretna vozila', items: ['Motor i mjenjač', 'Elektrika i ECU', 'Kabina i dijelovi kabine', 'Karoserija i nadogradnja', 'Felge i gume (teretne)', 'Auspuhi i AdBlue sustav', 'Kočnice i ovjes', 'Tachografi', 'Hladnjaci i ostali dijelovi'] },
      { name: 'Za autobuse i minibuse', items: ['Motor i mjenjač', 'Sjedala i unutrašnjost', 'Vrata i mehanizmi', 'Karoserija i stakla', 'Ostali dijelovi'] },
      { name: 'Za nautiku i plovila', items: ['Brodski motori (vanbrodski)', 'Brodski motori (unutarbrodski)', 'Propeleri', 'Kormila i upravljanje', 'Navigacijska elektronika', 'Sidrene i vezne opreme', 'Jedra i jarbolna oprema', 'Pumpe i bilge pumpe', 'Ostali nautički dijelovi'] },
      { name: 'Za kampere i prikolice', items: ['Solarna oprema za kampere', 'Plinski sustavi', 'Vodeni sistemi', 'Prozori i vrata', 'Kreveti i namještaj za kampere', 'Prikolična kuka i spojnice'] },
      { name: 'Za ATV / Quad', items: ['Motor i mjenjač', 'Karoserija i plastika', 'Gume i felge (off-road)', 'Ovjes i kočnice'] },
      { name: 'Za građevinske strojeve', items: ['Motor i hidraulika', 'Gusjenice i kotači', 'Kabine i stakla', 'Zahvati i priključci', 'Ostali dijelovi'] },
      { name: 'Za prikolice (dijelovi)', items: ['Osovine i ovjesi', 'Kočioni sustav prikolice', 'Rasvjeta prikolice', 'Podovi i bočne stranice', 'Prikolična kuka i glava'] },
      { name: 'Ostali dijelovi za vozila' },
    ]
  },

  // ─── 3. NEKRETNINE ──────────────────────────────────────
  {
    id: 'nekretnine', name: 'Nekretnine', icon: 'fa-building',
    subCategories: [
      { name: 'Stanovi', items: ['Prodaja stanova', 'Najam stanova (dugoročni)', 'Stan na dan (kratkoročni)', 'Stanovi – novogradnja', 'Luksuzni stanovi'] },
      { name: 'Kuće', items: ['Prodaja kuća', 'Najam kuća', 'Vikendice i seoske kuće', 'Montažne kuće i objekti'] },
      { name: 'Zemljišta', items: ['Građevinsko zemljište', 'Poljoprivredno zemljište', 'Šumsko zemljište', 'Ostalo zemljište'] },
      { name: 'Poslovni prostori', items: ['Prodaja poslovnih prostora', 'Najam poslovnih prostora', 'Uredi', 'Skladišta i hale', 'Ugostiteljski prostori', 'Industrijski objekti'] },
      { name: 'Garaže i parkirna mjesta', items: ['Prodaja garaža', 'Najam garaža', 'Parkirna mjesta'] },
      { name: 'Turistički smještaj', items: ['Apartmani na dan', 'Kuće za odmor', 'Sobe na dan', 'Hosteli'] },
      { name: 'Sobe i cimeri' },
      { name: 'Luksuzne nekretnine' },
      { name: 'Ostale nekretnine' },
    ]
  },

  // ─── 4. MOBITELI I OPREMA ───────────────────────────────
  {
    id: 'mobiteli', name: 'Mobiteli i oprema', icon: 'fa-mobile-screen',
    subCategories: [
      { name: 'Mobiteli – Apple iPhone', items: ['iPhone 16 serija', 'iPhone 15 serija', 'iPhone 14 serija', 'iPhone 13 serija', 'iPhone 12 i stariji'] },
      { name: 'Mobiteli – Samsung', items: ['Galaxy S serija', 'Galaxy A serija', 'Galaxy Z Fold/Flip', 'Ostali Samsung'] },
      { name: 'Mobiteli – Xiaomi / Redmi / POCO' },
      { name: 'Mobiteli – Huawei / Honor' },
      { name: 'Mobiteli – OnePlus / Oppo / Realme' },
      { name: 'Mobiteli – Nokia / Motorola / Sony' },
      { name: 'Mobiteli – Ostale marke' },
      { name: 'Tableti', items: ['Apple iPad', 'Samsung Galaxy Tab', 'Huawei MatePad', 'Ostali tableti'] },
      { name: 'Pametni satovi i fitness narukvice' },
      { name: 'Slušalice i Bluetooth zvučnici', items: ['In-ear slušalice', 'Over-ear slušalice', 'Bluetooth zvučnici', 'Gaming headset'] },
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
      { name: 'Laptopi', items: ['Apple MacBook', 'Dell / HP / Lenovo', 'Asus / Acer / MSI', 'Gaming laptopi', 'Poslovni laptopi', 'Oštećeni laptopi (za dijelove)', 'Dijelovi laptopa'] },
      { name: 'Desktop računala', items: ['Kompletni desktop računala', 'Gaming PC-evi', 'Mini PC i NUC'] },
      { name: 'Monitori', items: ['Gaming monitori', 'Poslovni monitori', 'Ultrawide monitori', '4K i 144Hz+'] },
      { name: 'Komponente', items: ['Procesori (CPU)', 'Grafičke kartice (GPU)', 'RAM memorija', 'Matične ploče', 'SSD diskovi', 'HDD diskovi', 'Napajanja (PSU)', 'Kućišta', 'CPU hladnjaci i vodeno hlađenje', 'Optički uređaji'] },
      { name: 'Mrežna oprema', items: ['Routeri i modemi', 'Switchevi i hubovi', 'WiFi extenderi', 'NAS serveri', 'Mrežne kartice'] },
      { name: 'Printeri i skeneri', items: ['Inkjet printeri', 'Laser printeri', 'Multifunkcijski uređaji', '3D printeri', 'Toner i tinta'] },
      { name: 'Serveri' },
      { name: 'Softver i licence' },
      { name: 'Gaming i konzole', items: ['PlayStation 5', 'PlayStation 4 i stariji', 'Xbox Series X/S', 'Nintendo Switch', 'PC igre (fizičke i ključevi)', 'Retro konzole', 'Gaming oprema (miševi, tipkovnice, podloge, gamepadovi)', 'VR naočale i oprema'] },
      { name: 'Dronovi i oprema', items: ['DJI dronovi', 'Ostali dronovi', 'Dijelovi i baterije za dronove', 'FPV dronovi'] },
      { name: 'Ostala IT oprema', items: ['Tipkovnice i miševi', 'Web kamere', 'USB i memorijske kartice', 'Docking stanice', 'Kablovi i adapteri', 'UPS uređaji'] },
    ]
  },

  // ─── 6. TEHNIKA I ELEKTRONIKA ───────────────────────────
  {
    id: 'tehnika', name: 'Tehnika i elektronika', icon: 'fa-tv',
    subCategories: [
      { name: 'Televizori', items: ['OLED TV', 'QLED / LED TV', 'Smart TV', 'Projektori', 'TV stalci i nosači', 'Dijelovi za TV'] },
      { name: 'Audio oprema', items: ['Hi-Fi pojačala i receiveri', 'Zvučnici za dom', 'Soundbar', 'Gramofoni i ploče', 'CD i kazetofoni', 'Slušalice audiophile'] },
      { name: 'Foto i video oprema', items: ['Digitalni fotoaparati (kompaktni)', 'DSLR fotoaparati', 'Mirrorless fotoaparati', 'Analogi / film fotoaparati', 'Objektivi', 'Bljeskalice i rasvjeta', 'Stative i gimbal', 'Action kamere (GoPro i sl.)', 'Video kamere', 'Drone kamere', 'Foto i video oprema – ostalo'] },
      { name: 'Bijela tehnika', items: ['Hladnjaci i zamrzivači', 'Perilice rublja', 'Perilice posuđa', 'Sušilice rublja', 'Štednjaci i ploče za kuhanje', 'Pećnice', 'Mikrovalne pećnice', 'Aparati za klimu (split sustav)', 'Ostala bijela tehnika'] },
      { name: 'Mali kućanski aparati', items: ['Aparati za kavu', 'Tosteri i mini pećnice', 'Blenderi i mikseri', 'Usisavači', 'Robotski usisavači', 'Parni čistači', 'Glačala i centri za glačanje', 'Aparati za kosu', 'Električni aparati za brijanje', 'Ostali mali aparati'] },
      { name: 'Smart home i IoT', items: ['Pametne žarulje i rasvjeta', 'Pametni prekidači i utičnice', 'Sigurnosne kamere (smart)', 'Pametni termostati', 'Pametna zvona i brave', 'Smart hub i centrali'] },
      { name: 'Solarna i alternativna energija', items: ['Solarne ploče', 'Inverteri i regulatori', 'Baterije za solarni sustav', 'Vjetroturbine (male)'] },
      { name: 'Medicinska oprema', items: ['Mjerači krvnog tlaka', 'Inhalatori', 'Termometri', 'Aparati za šećer u krvi', 'Invalidska kolica i pomagala', 'Ostala medicinska oprema'] },
      { name: 'Ostala tehnika', items: ['Baterije i punjači', 'Kabelske role i instalacijski materijal', 'Električni materijal', 'Mjerači i mjerni instrumenti', 'Walkie talkie i radio amater', 'Električne cigarete i vapori'] },
    ]
  },

  // ─── 7. DOM I VRTNI ─────────────────────────────────────
  {
    id: 'dom', name: 'Dom i vrtni', icon: 'fa-house',
    subCategories: [
      { name: 'Namještaj – Dnevna soba', items: ['Sofe i garniture', 'Fotelje', 'Stolovi za dnevnu sobu', 'TV komode i police', 'Police i regali', 'Vitrine'] },
      { name: 'Namještaj – Spavaća soba', items: ['Kreveti i okviri', 'Madraci', 'Ormarci za odjeću', 'Noćni ormarići', 'Toaletni stolovi'] },
      { name: 'Namještaj – Kuhinja i blagovaonica', items: ['Kuhinjske garniture', 'Blagovaonički garniture (stol+stolice)', 'Barovi i barski stolci', 'Kuhinjske police i ormari'] },
      { name: 'Namještaj – Dječja soba', items: ['Dječji kreveti i krevetići', 'Dječji stolovi i stolice', 'Dječje police i ormari', 'Kreveti na kat'] },
      { name: 'Namještaj – Radna soba i ured', items: ['Radni stolovi', 'Uredske stolice', 'Uredski ormari i police', 'Konferencijski stolovi'] },
      { name: 'Namještaj – Kupaonica', items: ['Kupaonski ormarići i police', 'Ogledala', 'Police za tuš'] },
      { name: 'Rasvjeta', items: ['Lusteri i plafonske lampe', 'Zidne lampe', 'Podne i stolne lampe', 'LED paneli i trake', 'Vanjska rasvjeta', 'Žarulje i grla'] },
      { name: 'Tepisi, zavjese i tekstil', items: ['Tepisi i sagovi', 'Zavjese i rolete', 'Posteljina', 'Jastuci i jastučnice', 'Deke i pokrivači', 'Ručnici i kupaonski tekstil'] },
      { name: 'Dekoracije i ukrasi', items: ['Slike i platna', 'Svjećnjaci i svijeće', 'Vaze i dekorativne figure', 'Zidni satovi', 'Božićne dekoracije', 'Ostale dekoracije'] },
      { name: 'Grijanje i hlađenje', items: ['Klima uređaji (split)', 'Mobilne klime', 'Radijatori', 'Peći na drva i pelete', 'Kotlovi i bojleri', 'Ventilatori'] },
      { name: 'Vrt i balkon', items: ['Vrtni namještaj (garniture, stolice, stolovi)', 'Vrtne ljuljačke i hamaci', 'Vrtni roštilji i pizze pećnice', 'Vrtne fontane', 'Biljke i cvijeće', 'Sjemenke i luk', 'Zemlja i gnojiva', 'Vrtni alati (lopate, grablje, škare...)', 'Prskalice i natapanje', 'Saksije i posude', 'Balkoni zasloni i tende'] },
      { name: 'Bazeni, jacuzzi i saune', items: ['Nadzemni bazeni', 'Oprema za bazen (pumpe, filteri, kemija)', 'Jacuzzi i whirlpool', 'Finska sauna', 'Infracrvena sauna'] },
      { name: 'Sigurnosni sustavi', items: ['Alarmi i senzori', 'Nadzorne kamere', 'Pametne brave', 'Vatrodojave i senzori dima'] },
      { name: 'Vodoinstalacije i sanitarije', items: ['Bojleri i grijalice vode', 'Slavine i armature', 'Sudoperi', 'Kade i tuš kabine', 'WC školjke i bide', 'Filteri za vodu', 'Cijevi i spojevi'] },
      { name: 'Alati i pribor za dom', items: ['Bušilice i odvijači', 'Brusilice', 'Pile i testere', 'Stege i stative', 'Mjerači i libele', 'Ostali ručni alati'] },
      { name: 'Ostalo za dom' },
    ]
  },

  // ─── 8. ODJEĆA I OBUĆA ──────────────────────────────────
  {
    id: 'odjeca', name: 'Odjeća i obuća', icon: 'fa-shirt',
    subCategories: [
      { name: 'Ženska odjeća', items: ['Jakne, kaputi i prsluk', 'Haljine', 'Suknje', 'Hlače i traperice', 'Majice i bluze', 'Džemperi i kardigani', 'Sportska odjeća', 'Odjeća za plažu', 'Donje rublje i pidžame', 'Odjeća za trudnice'] },
      { name: 'Ženska obuća', items: ['Cipele i pumpe', 'Čizme i gležnjače', 'Tenisice i sportska obuća', 'Sandale i natikače', 'Kućne papuče'] },
      { name: 'Muška odjeća', items: ['Jakne, kaputi i prsluk', 'Hlače i traperice', 'Košulje', 'Majice (T-shirt, polo)', 'Džemperi i hoodie', 'Sportska odjeća', 'Odijela i sako', 'Donje rublje i pidžame'] },
      { name: 'Muška obuća', items: ['Cipele i loafersi', 'Čizme', 'Tenisice i sportska obuća', 'Sandale i japanke'] },
      { name: 'Dječja odjeća i obuća', items: ['Za bebe (0–2 god)', 'Za djecu (3–8 god)', 'Za djecu (9–14 god)', 'Za tinejdžere (15+)', 'Dječja obuća'] },
      { name: 'Sportska odjeća i obuća (svi)', items: ['Dres i trening odjeća', 'Kompresijska odjeća', 'Plivačke kupaće', 'Skijaška odjeća', 'Koturaljke i snowboard odjeća'] },
      { name: 'Nakit i satovi', items: ['Prstenje', 'Narukvice', 'Ogrlice i privjesci', 'Naušnice', 'Ručni satovi – muški', 'Ručni satovi – ženski', 'Zlatni i srebrni nakit', 'Modni (bijuteri) nakit'] },
      { name: 'Torbe, novčanici i ruksaci', items: ['Ručne torbice', 'Ruksaci', 'Putne torbe i kofera', 'Novčanici i kartičnici', 'Sportske torbe'] },
      { name: 'Naočale', items: ['Sunčane naočale', 'Dioptrijske naočale', 'Okviri bez stakala'] },
      { name: 'Radna i zaštitna odjeća' },
      { name: 'Maškare i kostimi' },
      { name: 'Ostala odjeća i dodaci' },
    ]
  },

  // ─── 9. SPORT I REKREACIJA ──────────────────────────────
  {
    id: 'sport', name: 'Sport i rekreacija', icon: 'fa-dumbbell',
    subCategories: [
      { name: 'Fitness i teretana', items: ['Bučice i utezi', 'Klupe za vježbanje', 'Višefunkcionalne sprave', 'Trake za trčanje i bicikl ergometar', 'Crosstraineri i veslači', 'Yoga i pilates oprema', 'Skakanje i crossfit oprema', 'Rukavice i pojas za trening', 'Dodaci prehrani (proteini, kreatin...)'] },
      { name: 'Biciklizam (oprema)', items: ['Kacige', 'Biciklistička odjeća', 'Naočale', 'Košare i tašne', 'Dječji sjedala za bicikl', 'Računala i GPS'] },
      { name: 'Nogomet', items: ['Lopte', 'Kopačke', 'Dresovi i oprema', 'Golovi i mreže', 'Štitnici za potkoljenice'] },
      { name: 'Košarka, rukomet i ostali timski sportovi' },
      { name: 'Tenis i badminton', items: ['Reketi', 'Lopte i perje', 'Mreže', 'Tenis obuća', 'Torbe'] },
      { name: 'Zimski sportovi', items: ['Skije kompletan set', 'Snowboard kompletan set', 'Skijaška kaciga i naočale', 'Skijaška odjeća i rukavice', 'Skijaška obuća', 'Klizaljke', 'Sanjke'] },
      { name: 'Vodeni sportovi', items: ['Ronilačka oprema', 'SUP daske', 'Surfanje i kite surfing', 'Kajaci i kanui', 'Plivačke naočale i kape', 'Neopreni'] },
      { name: 'Planinarenje i kampiranje', items: ['Ruksaci planinarski', 'Šatori', 'Vreće za spavanje', 'Planinarske cipele', 'Štapovi za hodanje', 'Kuhala i oprema za kamp', 'Orijentacija i GPS'] },
      { name: 'Ribolov', items: ['Štapovi', 'Mašinice i koluti', 'Varalice i mamci', 'Kutije i torbe za ribolov', 'Čamci za ribolov', 'Odjeća i čizme za ribolov', 'Ehosonde'] },
      { name: 'Borilački sportovi', items: ['Vreće i rukavice', 'Kimona i odjeća', 'Zaštitna oprema', 'Ringovi i tatami'] },
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
      { name: 'Oprema za bebe', items: ['Kolica i nosiljke', 'Auto sjedalice', 'Krevetići, posteljina i madraci', 'Hranilice, boce i njega', 'Kupaonice i presvlačišta', 'Hodalice i ljuljačke'] },
      { name: 'Dječje igračke', items: ['LEGO i konstruktori', 'Plišane igračke', 'Figurice, lutke i akcijske figure', 'Na daljinski (RC)', 'Trampoline, tobogani i ljuljačke', 'Kuhinje i roleplay igračke', 'Slagalice i puzzle'] },
      { name: 'Dječji bicikli, romobili i automobili', items: ['Balans bicikli', 'Dječji romobili', 'Električni dječji automobili', 'Skuteri za djecu', 'Dječji quad'] },
      { name: 'Dječja odjeća (0–14 god)' },
      { name: 'Dječje knjige i edukacija', items: ['Slikovnice', 'Bojice i kreativni setovi', 'Školski pribor', 'Edukativne igre i ploče'] },
      { name: 'Ostalo za djecu' },
    ]
  },

  // ─── 11. GLAZBA I INSTRUMENTI ───────────────────────────
  {
    id: 'glazba', name: 'Glazba i instrumenti', icon: 'fa-music',
    subCategories: [
      { name: 'Gitare', items: ['Akustične gitare', 'Električne gitare', 'Bas gitare', 'Klasične gitare', 'Gitarski pojačala i efekti', 'Pribor za gitare'] },
      { name: 'Bubnjevi i udaraljke', items: ['Akustični bubnjevi', 'Elektronički bubnjevi', 'Činele', 'Cajon i perkusije'] },
      { name: 'Klavijature i klaviri', items: ['Digitalni klaviri', 'Sintesajzeri i workstations', 'Klaviri akustični', 'Harmonike', 'Pribor za klavijature'] },
      { name: 'Puhački instrumenti', items: ['Saksofon', 'Truba i trombon', 'Flauta i klarinet', 'Usne harmonike'] },
      { name: 'Gudački instrumenti', items: ['Violina', 'Viola i violončelo'] },
      { name: 'Tamburice i folk instrumenti' },
      { name: 'PA sustavi i ozvučenje', items: ['Zvučnici aktivni i pasivni', 'Mixeri', 'Mikrofoni', 'Pojačala za instrumente'] },
      { name: 'Studio oprema', items: ['Audio sučelja', 'Studio monitori', 'MIDI kontroleri', 'Snimačke kartice'] },
      { name: 'Scenska i DJ oprema', items: ['Scenska rasvjeta', 'Stroj za dim i mjehuriće', 'DJ oprema (mixeri, decks)'] },
      { name: 'Ostali instrumenti i oprema' },
    ]
  },

  // ─── 12. LITERATURA I MEDIJI ────────────────────────────
  {
    id: 'literatura', name: 'Literatura i mediji', icon: 'fa-book',
    subCategories: [
      { name: 'Knjige – Beletristika', items: ['Romani i kratke priče', 'Kriminalci i trileri', 'Science fiction i fantasy', 'Humor i satira', 'Ljubavni romani', 'Horror', 'Povijesni romani'] },
      { name: 'Knjige – Stručna literatura', items: ['Informatika i IT', 'Medicina i zdravlje', 'Pravo i financije', 'Inženjerstvo', 'Filozofija', 'Psihologija', 'Arhitektura i dizajn'] },
      { name: 'Knjige – Dječje i školske', items: ['Slikovnice', 'Dječji romani', 'Školski udžbenici (po razredima)', 'Enciklopedije za djecu'] },
      { name: 'Antikvarne i stare knjige' },
      { name: 'Časopisi i magazini', items: ['Auto moto časopisi', 'IT i tech časopisi', 'Sport', 'Moda i lifestyle', 'Ostali časopisi'] },
      { name: 'Stripovi i manga' },
      { name: 'Filmovi i serije (DVD/Blu-ray)' },
      { name: 'Glazba (CD, vinil, kasete)' },
    ]
  },

  // ─── 13. VIDEO IGRE ─────────────────────────────────────
  {
    id: 'videoigre', name: 'Video igre', icon: 'fa-gamepad',
    subCategories: [
      { name: 'PlayStation', items: ['PS5 – igre i oprema', 'PS4 – igre i oprema', 'PS3 i stariji'] },
      { name: 'Xbox', items: ['Xbox Series X/S', 'Xbox One'] },
      { name: 'Nintendo', items: ['Nintendo Switch', 'DS i 3DS', 'Wii i WiiU'] },
      { name: 'PC igre', items: ['Digitalni ključevi', 'Fizičke kopije'] },
      { name: 'Retro igre i konzole' },
      { name: 'Gaming oprema', items: ['Gamepadovi i kontroleri', 'Gaming miševi i tipkovnice', 'Gaming slušalice', 'VR oprema'] },
    ]
  },

  // ─── 14. ŽIVOTINJE ──────────────────────────────────────
  {
    id: 'zivotinje', name: 'Životinje', icon: 'fa-paw',
    subCategories: [
      { name: 'Psi', items: ['S rodovnicom', 'Bez rodovnice', 'Mješanci'] },
      { name: 'Mačke', items: ['Čistokrvne', 'Domaće mačke'] },
      { name: 'Ptice i papige' },
      { name: 'Glodavci (zečevi, zamorci, hrčci...)' },
      { name: 'Ribe i akvaristika', items: ['Tropske ribe', 'Zlatne ribice', 'Akvariji i oprema', 'Ostalo'] },
      { name: 'Terariji i gmizavci', items: ['Gušteri i kameleoni', 'Zmije', 'Kornjače', 'Terariji i oprema'] },
      { name: 'Konji' },
      { name: 'Domaće životinje (krave, svinje, koze, ovce, perad...)' },
      { name: 'Oprema za životinje', items: ['Hrana za pse', 'Hrana za mačke', 'Hrana za ostale životinje', 'Ovratnici, povodci i pojasi', 'Kućice, kavezi i nosiljke', 'Igračke za kućne ljubimce', 'Njega i higijena', 'Veterinarski pribor'] },
      { name: 'Udomljavanje – psi' },
      { name: 'Udomljavanje – mačke' },
      { name: 'Udomljavanje – ostalo' },
    ]
  },

  // ─── 15. HRANA I PIĆE ───────────────────────────────────
  {
    id: 'hrana', name: 'Hrana i piće', icon: 'fa-utensils',
    subCategories: [
      { name: 'Svježe meso', items: ['Svinjetina', 'Teletina i govedina', 'Piletina i perad', 'Janjetina i ovčetina', 'Divljač'] },
      { name: 'Svježa riba i morski plodovi' },
      { name: 'Voće i povrće', items: ['Sezonsko voće', 'Sezonsko povrće', 'Gljive'] },
      { name: 'Mliječni proizvodi i jaja', items: ['Domaći sir', 'Domaće mlijeko', 'Jaja', 'Kiselo mlijeko i vrhnje'] },
      { name: 'Med i pčelinji proizvodi', items: ['Domaći med', 'Propolis i matična mliječ'] },
      { name: 'Ulja i masti', items: ['Maslinovo ulje', 'Bučino ulje', 'Svinjska mast'] },
      { name: 'Zimnica i konzerve', items: ['Pekmezi i džemovi', 'Ajvar i pinđur', 'Ukiseljeno povrće', 'Suho voće i povrće'] },
      { name: 'Delikatese i suhomesnato', items: ['Pršut', 'Slanina', 'Kobasice i salame'] },
      { name: 'Pića', items: ['Domaći sokovi', 'Čajevi', 'Domaća rakija i vino', 'Kava i kave', 'Ostala pića'] },
      { name: 'Brašno, žitarice i tjestenina' },
      { name: 'Kolači i slatkiši' },
      { name: 'Začini, ocat i dodaci' },
      { name: 'Ostala hrana' },
    ]
  },

  // ─── 16. STROJEVI I ALATI ───────────────────────────────
  {
    id: 'strojevi', name: 'Strojevi i alati', icon: 'fa-wrench',
    subCategories: [
      { name: 'Ručni alati', items: ['Čekići, odvijači, kliješta', 'Ključevi i nasadni seti', 'Mjerači i libele', 'Ostali ručni alati'] },
      { name: 'Električni alati', items: ['Bušilice i udarne bušilice', 'Kutne brusilice', 'Cirkularne pile', 'Ubodne pile', 'Brusilice za drvo', 'Pneumatski alati', 'Kompresori'] },
      { name: 'Građevinski strojevi', items: ['Mini bageri', 'Utovarivači', 'Dizalice i platforme', 'Asfalt strojevi', 'Betonske miješalice', 'Vibracijske ploče', 'Kompresori veliki', 'Dijelovi građevinskih strojeva'] },
      { name: 'Poljoprivredni strojevi', items: ['Traktori', 'Kombajni', 'Priključci za traktor (plug, tanjurača, roto tiller...)', 'Šprice i atomizeri', 'Kosilice traktorske', 'Cistijerne i cisterne za navodnjavanje', 'Ostala agrarna mehanizacija'] },
      { name: 'Vrtni strojevi', items: ['Motorne kosilice', 'Ride-on kosilice', 'Motorni trimer', 'Motorni šišači živice', 'Lišće usisavači', 'Motorne pile', 'Ostali vrtni strojevi'] },
      { name: 'Viljuškari i manipulacijska oprema' },
      { name: 'Industrijski i prerađivački strojevi', items: ['Strojevi za obradu metala', 'Strojevi za obradu drva', 'Strojevi za obradu kamena', 'Tekstilni strojevi', 'Strojevi za pakovanje'] },
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
      { name: 'Servisiranje vozila', items: ['Automehaničar', 'Autoelektričar', 'Autolimar', 'Pranje i detailing', 'Klima servis', 'Vulkanizer', 'Tehnički pregled i registracija'] },
      { name: 'Građevinske usluge', items: ['Zidanje i fasade', 'Elektroinstalacije', 'Vodoinstalacije', 'Grijanje i klima montaža', 'Podopolaganje', 'Keramičari', 'Moleri', 'Stolarija i PVC', 'Krovopokrivači', 'Arhitektura i projektovanje', 'Adaptacije i renovacije'] },
      { name: 'IT usluge', items: ['Web razvoj', 'Dizajn i grafika', 'Servis računala', 'Servis mobitela', 'Mrežna infrastruktura'] },
      { name: 'Ljepota i njega', items: ['Frizerski salon', 'Kozmetički salon', 'Masaže i terapije', 'Manikura i pedikura', 'Tattoo i piercing'] },
      { name: 'Edukacija i poduke', items: ['Instrukcije (škola i faks)', 'Jezični tečajevi', 'IT kursevi', 'Glazbena škola', 'Autoškola', 'Sportska škola'] },
      { name: 'Transport i selidbe', items: ['Kombi prijevoz', 'Selidbe i pakovanje', 'Dostava robe', 'Prijevoz osoba'] },
      { name: 'Čišćenje i održavanje', items: ['Čišćenje stanova', 'Čišćenje poslovnih prostora', 'Čišćenje nakon gradnje', 'Čišćenje tepiha'] },
      { name: 'Dizajn, tisak i fotografija' },
      { name: 'Pravne i financijske usluge' },
      { name: 'Iznajmljivanje vozila i strojeva' },
      { name: 'Event, vjenčanja i zabava' },
      { name: 'Kućni ljubimci – usluge', items: ['Veterinar', 'Šišanje i njega', 'Dog sitting i šetanje'] },
      { name: 'Ostale usluge' },
    ]
  },

  // ─── 19. UMJETNOST I KOLEKCIONARSTVO ────────────────────
  {
    id: 'umjetnost', name: 'Umjetnost i kolekcionarstvo', icon: 'fa-palette',
    subCategories: [
      { name: 'Slike i skulpture', items: ['Ulje na platnu', 'Akvareli', 'Grafike', 'Digitalna umjetnost – print', 'Skulpture'] },
      { name: 'Fotografije i posteri' },
      { name: 'Antikviteti i starine', items: ['Antikni namještaj', 'Porculan i keramika', 'Stari satovi', 'Ostale starine'] },
      { name: 'Numizmatika', items: ['Novčići (kovanice)', 'Novčanice', 'Medalje i bedževi'] },
      { name: 'Filatelija (marke i dopisnice)' },
      { name: 'Militarija', items: ['Uniforme i odjeća', 'Odlikovanja i medalje', 'Oružje (starinski – muzejski)', 'Fotografije i dokumenti'] },
      { name: 'Modelarstvo', items: ['Statični modeli', 'RC modeli (automobili, zrakoplovi)', 'Vlakovi i željeznica'] },
      { name: 'Razglednice i stare fotografije' },
      { name: 'Ostale kolekcije' },
    ]
  },

  // ─── 20. OSTALO ─────────────────────────────────────────
  {
    id: 'ostalo', name: 'Ostalo', icon: 'fa-ellipsis',
    subCategories: [
      { name: 'Karte i ulaznice', items: ['Koncerti', 'Sport', 'Kazalište i opera', 'Festivali'] },
      { name: 'Kozmetika i ljepota', items: ['Parfemi', 'Njega lica i tijela', 'Šminka i boje', 'Njega kose', 'Profesionalna salon oprema'] },
      { name: 'Medicinska pomagala', items: ['Štake i hodalice', 'Invalidska kolica', 'Inhalatori', 'Ostalo'] },
      { name: 'Vjenčanja', items: ['Vjenčanice', 'Odijela', 'Dekoracije', 'Pozivnice i tisak'] },
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
