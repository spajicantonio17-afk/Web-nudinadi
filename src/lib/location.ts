// ── Location System ──────────────────────────────────────────────
// City/region data for BiH (by Kanton/Entitet) and Croatia + localStorage + GPS

export interface City {
  name: string;
  region: string;
  country: 'BiH' | 'HR';
  lat: number;
  lng: number;
}

export const CITIES: City[] = [
  // ═══════════════════════════════════════════════════════════════
  // BOSNA I HERCEGOVINA — FEDERACIJA BIH (po kantonima)
  // ═══════════════════════════════════════════════════════════════

  // ── Kanton Sarajevo ──
  { name: 'Sarajevo', region: 'Kanton Sarajevo', country: 'BiH', lat: 43.8563, lng: 18.4131 },
  { name: 'Ilidža', region: 'Kanton Sarajevo', country: 'BiH', lat: 43.8297, lng: 18.3103 },
  { name: 'Vogošća', region: 'Kanton Sarajevo', country: 'BiH', lat: 43.9019, lng: 18.3450 },
  { name: 'Hadžići', region: 'Kanton Sarajevo', country: 'BiH', lat: 43.8225, lng: 18.2067 },
  { name: 'Ilijaš', region: 'Kanton Sarajevo', country: 'BiH', lat: 43.9514, lng: 18.2719 },
  { name: 'Trnovo', region: 'Kanton Sarajevo', country: 'BiH', lat: 43.6617, lng: 18.4475 },

  // ── Unsko-sanski kanton ──
  { name: 'Bihać', region: 'Unsko-sanski kanton', country: 'BiH', lat: 44.8167, lng: 15.8689 },
  { name: 'Cazin', region: 'Unsko-sanski kanton', country: 'BiH', lat: 44.9675, lng: 15.9428 },
  { name: 'Velika Kladuša', region: 'Unsko-sanski kanton', country: 'BiH', lat: 45.1854, lng: 15.8050 },
  { name: 'Bosanska Krupa', region: 'Unsko-sanski kanton', country: 'BiH', lat: 44.8831, lng: 16.1531 },
  { name: 'Sanski Most', region: 'Unsko-sanski kanton', country: 'BiH', lat: 44.7656, lng: 16.6636 },
  { name: 'Ključ', region: 'Unsko-sanski kanton', country: 'BiH', lat: 44.5328, lng: 16.7731 },
  { name: 'Bužim', region: 'Unsko-sanski kanton', country: 'BiH', lat: 45.0539, lng: 15.9847 },
  { name: 'Bosanski Petrovac', region: 'Unsko-sanski kanton', country: 'BiH', lat: 44.5536, lng: 16.3708 },

  // ── Tuzlanski kanton ──
  { name: 'Tuzla', region: 'Tuzlanski kanton', country: 'BiH', lat: 44.5384, lng: 18.6735 },
  { name: 'Živinice', region: 'Tuzlanski kanton', country: 'BiH', lat: 44.4500, lng: 18.6500 },
  { name: 'Lukavac', region: 'Tuzlanski kanton', country: 'BiH', lat: 44.5414, lng: 18.5275 },
  { name: 'Gračanica', region: 'Tuzlanski kanton', country: 'BiH', lat: 44.7042, lng: 18.3075 },
  { name: 'Gradačac', region: 'Tuzlanski kanton', country: 'BiH', lat: 44.8781, lng: 18.4275 },
  { name: 'Srebrenik', region: 'Tuzlanski kanton', country: 'BiH', lat: 44.7078, lng: 18.4906 },
  { name: 'Banovići', region: 'Tuzlanski kanton', country: 'BiH', lat: 44.4097, lng: 18.5331 },
  { name: 'Kalesija', region: 'Tuzlanski kanton', country: 'BiH', lat: 44.4378, lng: 18.8803 },
  { name: 'Kladanj', region: 'Tuzlanski kanton', country: 'BiH', lat: 44.2267, lng: 18.6906 },
  { name: 'Čelić', region: 'Tuzlanski kanton', country: 'BiH', lat: 44.7175, lng: 18.8228 },
  { name: 'Sapna', region: 'Tuzlanski kanton', country: 'BiH', lat: 44.5033, lng: 19.0019 },
  { name: 'Doboj-Istok', region: 'Tuzlanski kanton', country: 'BiH', lat: 44.7400, lng: 18.1000 },
  { name: 'Teočak', region: 'Tuzlanski kanton', country: 'BiH', lat: 44.6100, lng: 18.9900 },

  // ── Zeničko-dobojski kanton ──
  { name: 'Zenica', region: 'Zeničko-dobojski kanton', country: 'BiH', lat: 44.2037, lng: 17.9078 },
  { name: 'Visoko', region: 'Zeničko-dobojski kanton', country: 'BiH', lat: 43.9889, lng: 18.1781 },
  { name: 'Kakanj', region: 'Zeničko-dobojski kanton', country: 'BiH', lat: 44.1286, lng: 18.1150 },
  { name: 'Tešanj', region: 'Zeničko-dobojski kanton', country: 'BiH', lat: 44.6108, lng: 17.9861 },
  { name: 'Maglaj', region: 'Zeničko-dobojski kanton', country: 'BiH', lat: 44.5486, lng: 18.0969 },
  { name: 'Žepče', region: 'Zeničko-dobojski kanton', country: 'BiH', lat: 44.4286, lng: 18.0350 },
  { name: 'Zavidovići', region: 'Zeničko-dobojski kanton', country: 'BiH', lat: 44.4467, lng: 18.1497 },
  { name: 'Breza', region: 'Zeničko-dobojski kanton', country: 'BiH', lat: 44.0228, lng: 18.2631 },
  { name: 'Vareš', region: 'Zeničko-dobojski kanton', country: 'BiH', lat: 44.1633, lng: 18.3272 },
  { name: 'Olovo', region: 'Zeničko-dobojski kanton', country: 'BiH', lat: 44.1289, lng: 18.5825 },
  { name: 'Usora', region: 'Zeničko-dobojski kanton', country: 'BiH', lat: 44.5600, lng: 17.9200 },

  // ── Srednjobosanski kanton ──
  { name: 'Travnik', region: 'Srednjobosanski kanton', country: 'BiH', lat: 44.2264, lng: 17.6658 },
  { name: 'Bugojno', region: 'Srednjobosanski kanton', country: 'BiH', lat: 44.0578, lng: 17.4508 },
  { name: 'Vitez', region: 'Srednjobosanski kanton', country: 'BiH', lat: 44.1592, lng: 17.7903 },
  { name: 'Jajce', region: 'Srednjobosanski kanton', country: 'BiH', lat: 44.3400, lng: 17.2711 },
  { name: 'Novi Travnik', region: 'Srednjobosanski kanton', country: 'BiH', lat: 44.1717, lng: 17.6578 },
  { name: 'Gornji Vakuf-Uskoplje', region: 'Srednjobosanski kanton', country: 'BiH', lat: 43.9392, lng: 17.5900 },
  { name: 'Fojnica', region: 'Srednjobosanski kanton', country: 'BiH', lat: 43.9614, lng: 17.8922 },
  { name: 'Kiseljak', region: 'Srednjobosanski kanton', country: 'BiH', lat: 43.9433, lng: 18.0783 },
  { name: 'Busovača', region: 'Srednjobosanski kanton', country: 'BiH', lat: 44.0925, lng: 17.8778 },
  { name: 'Kreševo', region: 'Srednjobosanski kanton', country: 'BiH', lat: 43.8772, lng: 18.0578 },
  { name: 'Donji Vakuf', region: 'Srednjobosanski kanton', country: 'BiH', lat: 44.2292, lng: 17.3961 },

  // ── Hercegovačko-neretvanski kanton ──
  { name: 'Mostar', region: 'Hercegovačko-neretvanski kanton', country: 'BiH', lat: 43.3438, lng: 17.8078 },
  { name: 'Konjic', region: 'Hercegovačko-neretvanski kanton', country: 'BiH', lat: 43.6517, lng: 17.9606 },
  { name: 'Jablanica', region: 'Hercegovačko-neretvanski kanton', country: 'BiH', lat: 43.6597, lng: 17.7597 },
  { name: 'Čapljina', region: 'Hercegovačko-neretvanski kanton', country: 'BiH', lat: 43.1156, lng: 17.6856 },
  { name: 'Čitluk', region: 'Hercegovačko-neretvanski kanton', country: 'BiH', lat: 43.2267, lng: 17.7003 },
  { name: 'Stolac', region: 'Hercegovačko-neretvanski kanton', country: 'BiH', lat: 43.0844, lng: 17.9606 },
  { name: 'Neum', region: 'Hercegovačko-neretvanski kanton', country: 'BiH', lat: 42.9233, lng: 17.6150 },
  { name: 'Prozor-Rama', region: 'Hercegovačko-neretvanski kanton', country: 'BiH', lat: 43.8200, lng: 17.6097 },

  // ── Zapadnohercegovački kanton ──
  { name: 'Široki Brijeg', region: 'Zapadnohercegovački kanton', country: 'BiH', lat: 43.3833, lng: 17.5936 },
  { name: 'Grude', region: 'Zapadnohercegovački kanton', country: 'BiH', lat: 43.3750, lng: 17.3936 },
  { name: 'Ljubuški', region: 'Zapadnohercegovački kanton', country: 'BiH', lat: 43.1975, lng: 17.5483 },
  { name: 'Posušje', region: 'Zapadnohercegovački kanton', country: 'BiH', lat: 43.4717, lng: 17.3283 },

  // ── Posavski kanton ──
  { name: 'Orašje', region: 'Posavski kanton', country: 'BiH', lat: 45.0350, lng: 18.6906 },
  { name: 'Odžak', region: 'Posavski kanton', country: 'BiH', lat: 45.0100, lng: 18.3261 },
  { name: 'Domaljevac-Šamac', region: 'Posavski kanton', country: 'BiH', lat: 45.0533, lng: 18.5356 },

  // ── Bosansko-podrinjski kanton ──
  { name: 'Goražde', region: 'Bosansko-podrinjski kanton', country: 'BiH', lat: 43.6667, lng: 18.9764 },
  { name: 'Foča-Ustikolina', region: 'Bosansko-podrinjski kanton', country: 'BiH', lat: 43.5728, lng: 18.9264 },
  { name: 'Pale-Prača', region: 'Bosansko-podrinjski kanton', country: 'BiH', lat: 43.6200, lng: 18.8700 },

  // ── Hercegbosanski kanton (Kanton 10) ──
  { name: 'Livno', region: 'Hercegbosanski kanton', country: 'BiH', lat: 43.8267, lng: 17.0078 },
  { name: 'Tomislavgrad', region: 'Hercegbosanski kanton', country: 'BiH', lat: 43.7178, lng: 17.2250 },
  { name: 'Glamoč', region: 'Hercegbosanski kanton', country: 'BiH', lat: 44.0472, lng: 16.8550 },
  { name: 'Kupres', region: 'Hercegbosanski kanton', country: 'BiH', lat: 43.9850, lng: 17.2875 },
  { name: 'Drvar', region: 'Hercegbosanski kanton', country: 'BiH', lat: 44.3722, lng: 16.3856 },
  { name: 'Bosansko Grahovo', region: 'Hercegbosanski kanton', country: 'BiH', lat: 44.1747, lng: 16.3658 },

  // ═══════════════════════════════════════════════════════════════
  // BOSNA I HERCEGOVINA — REPUBLIKA SRPSKA
  // ═══════════════════════════════════════════════════════════════
  { name: 'Banja Luka', region: 'Republika Srpska', country: 'BiH', lat: 44.7722, lng: 17.1910 },
  { name: 'Bijeljina', region: 'Republika Srpska', country: 'BiH', lat: 44.7567, lng: 19.2147 },
  { name: 'Prijedor', region: 'Republika Srpska', country: 'BiH', lat: 44.9794, lng: 16.7139 },
  { name: 'Doboj', region: 'Republika Srpska', country: 'BiH', lat: 44.7311, lng: 18.0841 },
  { name: 'Trebinje', region: 'Republika Srpska', country: 'BiH', lat: 42.7119, lng: 18.3437 },
  { name: 'Zvornik', region: 'Republika Srpska', country: 'BiH', lat: 44.3864, lng: 19.1028 },
  { name: 'Gradiška', region: 'Republika Srpska', country: 'BiH', lat: 45.1453, lng: 17.2536 },
  { name: 'Laktaši', region: 'Republika Srpska', country: 'BiH', lat: 44.8528, lng: 17.3014 },
  { name: 'Prnjavor', region: 'Republika Srpska', country: 'BiH', lat: 44.8667, lng: 17.6625 },
  { name: 'Mrkonjić Grad', region: 'Republika Srpska', country: 'BiH', lat: 44.4164, lng: 17.0861 },
  { name: 'Derventa', region: 'Republika Srpska', country: 'BiH', lat: 44.9778, lng: 17.9078 },
  { name: 'Modriča', region: 'Republika Srpska', country: 'BiH', lat: 44.9536, lng: 18.3025 },
  { name: 'Kozarska Dubica', region: 'Republika Srpska', country: 'BiH', lat: 45.1767, lng: 16.8092 },
  { name: 'Novi Grad', region: 'Republika Srpska', country: 'BiH', lat: 45.0464, lng: 16.3800 },
  { name: 'Šamac', region: 'Republika Srpska', country: 'BiH', lat: 45.0647, lng: 18.4678 },
  { name: 'Foča', region: 'Republika Srpska', country: 'BiH', lat: 43.5053, lng: 18.7781 },
  { name: 'Višegrad', region: 'Republika Srpska', country: 'BiH', lat: 43.7828, lng: 19.2922 },
  { name: 'Rogatica', region: 'Republika Srpska', country: 'BiH', lat: 43.8006, lng: 19.0031 },
  { name: 'Pale', region: 'Republika Srpska', country: 'BiH', lat: 43.8167, lng: 18.5700 },
  { name: 'Sokolac', region: 'Republika Srpska', country: 'BiH', lat: 43.9389, lng: 18.7958 },
  { name: 'Istočno Sarajevo', region: 'Republika Srpska', country: 'BiH', lat: 43.8192, lng: 18.4381 },
  { name: 'Vlasenica', region: 'Republika Srpska', country: 'BiH', lat: 44.1831, lng: 18.9442 },
  { name: 'Srebrenica', region: 'Republika Srpska', country: 'BiH', lat: 44.1064, lng: 19.2975 },
  { name: 'Bratunac', region: 'Republika Srpska', country: 'BiH', lat: 44.1856, lng: 19.3328 },
  { name: 'Milići', region: 'Republika Srpska', country: 'BiH', lat: 44.1700, lng: 19.0900 },
  { name: 'Teslić', region: 'Republika Srpska', country: 'BiH', lat: 44.6075, lng: 17.8600 },
  { name: 'Čelinac', region: 'Republika Srpska', country: 'BiH', lat: 44.7256, lng: 17.3264 },
  { name: 'Kotor Varoš', region: 'Republika Srpska', country: 'BiH', lat: 44.6256, lng: 17.3728 },
  { name: 'Kneževo', region: 'Republika Srpska', country: 'BiH', lat: 44.4900, lng: 17.3800 },
  { name: 'Nevesinje', region: 'Republika Srpska', country: 'BiH', lat: 43.2589, lng: 18.1133 },
  { name: 'Gacko', region: 'Republika Srpska', country: 'BiH', lat: 43.1672, lng: 18.5356 },
  { name: 'Bileća', region: 'Republika Srpska', country: 'BiH', lat: 42.8742, lng: 18.4281 },
  { name: 'Ljubinje', region: 'Republika Srpska', country: 'BiH', lat: 42.9500, lng: 18.0833 },
  { name: 'Ugljevik', region: 'Republika Srpska', country: 'BiH', lat: 44.6939, lng: 18.9986 },
  { name: 'Lopare', region: 'Republika Srpska', country: 'BiH', lat: 44.6344, lng: 18.8461 },
  { name: 'Petrovo', region: 'Republika Srpska', country: 'BiH', lat: 44.6300, lng: 18.3300 },
  { name: 'Kostajnica', region: 'Republika Srpska', country: 'BiH', lat: 45.2228, lng: 16.5361 },

  // ═══════════════════════════════════════════════════════════════
  // BOSNA I HERCEGOVINA — BRČKO DISTRIKT
  // ═══════════════════════════════════════════════════════════════
  { name: 'Brčko', region: 'Brčko distrikt', country: 'BiH', lat: 44.8731, lng: 18.8100 },

  // ═══════════════════════════════════════════════════════════════
  // HRVATSKA (po županijama)
  // ═══════════════════════════════════════════════════════════════
  { name: 'Zagreb', region: 'Grad Zagreb', country: 'HR', lat: 45.8150, lng: 15.9819 },
  { name: 'Velika Gorica', region: 'Zagrebačka županija', country: 'HR', lat: 45.7142, lng: 16.0750 },
  { name: 'Samobor', region: 'Zagrebačka županija', country: 'HR', lat: 45.8011, lng: 15.7108 },
  { name: 'Zaprešić', region: 'Zagrebačka županija', country: 'HR', lat: 45.8564, lng: 15.8075 },

  { name: 'Split', region: 'Splitsko-dalmatinska', country: 'HR', lat: 43.5081, lng: 16.4402 },
  { name: 'Kaštela', region: 'Splitsko-dalmatinska', country: 'HR', lat: 43.5533, lng: 16.3750 },
  { name: 'Solin', region: 'Splitsko-dalmatinska', country: 'HR', lat: 43.5439, lng: 16.4906 },
  { name: 'Sinj', region: 'Splitsko-dalmatinska', country: 'HR', lat: 43.7006, lng: 16.6364 },
  { name: 'Makarska', region: 'Splitsko-dalmatinska', country: 'HR', lat: 43.2969, lng: 17.0175 },
  { name: 'Omiš', region: 'Splitsko-dalmatinska', country: 'HR', lat: 43.4442, lng: 16.6889 },
  { name: 'Imotski', region: 'Splitsko-dalmatinska', country: 'HR', lat: 43.4469, lng: 17.2158 },

  { name: 'Rijeka', region: 'Primorsko-goranska', country: 'HR', lat: 45.3271, lng: 14.4422 },
  { name: 'Opatija', region: 'Primorsko-goranska', country: 'HR', lat: 45.3361, lng: 14.3053 },

  { name: 'Osijek', region: 'Osječko-baranjska', country: 'HR', lat: 45.5550, lng: 18.6955 },
  { name: 'Đakovo', region: 'Osječko-baranjska', country: 'HR', lat: 45.3086, lng: 18.4106 },
  { name: 'Našice', region: 'Osječko-baranjska', country: 'HR', lat: 45.4900, lng: 18.0900 },

  { name: 'Zadar', region: 'Zadarska', country: 'HR', lat: 44.1194, lng: 15.2314 },
  { name: 'Slavonski Brod', region: 'Brodsko-posavska', country: 'HR', lat: 45.1603, lng: 18.0156 },
  { name: 'Pula', region: 'Istarska', country: 'HR', lat: 44.8666, lng: 13.8496 },
  { name: 'Dubrovnik', region: 'Dubrovačko-neretvanska', country: 'HR', lat: 42.6507, lng: 18.0944 },
  { name: 'Metković', region: 'Dubrovačko-neretvanska', country: 'HR', lat: 43.0544, lng: 17.6481 },
  { name: 'Ploče', region: 'Dubrovačko-neretvanska', country: 'HR', lat: 43.0575, lng: 17.4331 },
  { name: 'Šibenik', region: 'Šibensko-kninska', country: 'HR', lat: 43.7350, lng: 15.8952 },
  { name: 'Knin', region: 'Šibensko-kninska', country: 'HR', lat: 44.0406, lng: 16.1997 },
  { name: 'Varaždin', region: 'Varaždinska', country: 'HR', lat: 46.3057, lng: 16.3366 },
  { name: 'Karlovac', region: 'Karlovačka', country: 'HR', lat: 45.4929, lng: 15.5553 },
  { name: 'Sisak', region: 'Sisačko-moslavačka', country: 'HR', lat: 45.4658, lng: 16.3725 },
  { name: 'Čakovec', region: 'Međimurska', country: 'HR', lat: 46.3844, lng: 16.4339 },
  { name: 'Koprivnica', region: 'Koprivničko-križevačka', country: 'HR', lat: 46.1628, lng: 16.8272 },
  { name: 'Bjelovar', region: 'Bjelovarsko-bilogorska', country: 'HR', lat: 45.8986, lng: 16.8425 },
  { name: 'Požega', region: 'Požeško-slavonska', country: 'HR', lat: 45.3400, lng: 17.6850 },
  { name: 'Virovitica', region: 'Virovitičko-podravska', country: 'HR', lat: 45.8317, lng: 17.3836 },
  { name: 'Vukovar', region: 'Vukovarsko-srijemska', country: 'HR', lat: 45.3517, lng: 18.9986 },
  { name: 'Vinkovci', region: 'Vukovarsko-srijemska', country: 'HR', lat: 45.2883, lng: 18.8044 },
  { name: 'Gospić', region: 'Ličko-senjska', country: 'HR', lat: 44.5461, lng: 15.3744 },
];

const STORAGE_KEY = 'nudinadi_location';

export function getSelectedLocation(): City | null {
  if (typeof window === 'undefined') return null;
  try {
    const stored = localStorage.getItem(STORAGE_KEY);
    return stored ? JSON.parse(stored) : null;
  } catch {
    return null;
  }
}

export function setSelectedLocation(city: City): void {
  if (typeof window === 'undefined') return;
  localStorage.setItem(STORAGE_KEY, JSON.stringify(city));
}

export function clearSelectedLocation(): void {
  if (typeof window === 'undefined') return;
  localStorage.removeItem(STORAGE_KEY);
}

export function getCitiesByCountry(country: City['country']): City[] {
  return CITIES.filter(c => c.country === country);
}

export function getCitiesByRegion(region: string): City[] {
  return CITIES.filter(c => c.region === region);
}

/** Get all unique regions for a country, preserving insertion order */
export function getRegionsForCountry(country: City['country']): string[] {
  const seen = new Set<string>();
  const regions: string[] = [];
  for (const city of CITIES) {
    if (city.country === country && !seen.has(city.region)) {
      seen.add(city.region);
      regions.push(city.region);
    }
  }
  return regions;
}

export function searchCities(query: string): City[] {
  const q = query.toLowerCase()
    .replace(/[čć]/g, 'c')
    .replace(/[šŠ]/g, 's')
    .replace(/[žŽ]/g, 'z')
    .replace(/[đĐ]/g, 'dj');

  return CITIES.filter(city => {
    const name = city.name.toLowerCase()
      .replace(/[čć]/g, 'c')
      .replace(/[šŠ]/g, 's')
      .replace(/[žŽ]/g, 'z')
      .replace(/[đĐ]/g, 'dj');
    const region = city.region.toLowerCase()
      .replace(/[čć]/g, 'c')
      .replace(/[šŠ]/g, 's')
      .replace(/[žŽ]/g, 'z')
      .replace(/[đĐ]/g, 'dj');
    return name.includes(q) || region.includes(q);
  });
}

// ── GPS / Geolocation ────────────────────────────────────────────

/** Haversine formula — returns distance in km between two lat/lng points */
export function calculateDistance(lat1: number, lng1: number, lat2: number, lng2: number): number {
  const R = 6371; // Earth radius in km
  const dLat = (lat2 - lat1) * Math.PI / 180;
  const dLng = (lng2 - lng1) * Math.PI / 180;
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) *
    Math.sin(dLng / 2) * Math.sin(dLng / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return R * c;
}

/** Find nearest city to given GPS coordinates */
export function findNearestCity(lat: number, lng: number): City {
  let nearest = CITIES[0];
  let minDist = Infinity;
  for (const city of CITIES) {
    const d = calculateDistance(lat, lng, city.lat, city.lng);
    if (d < minDist) {
      minDist = d;
      nearest = city;
    }
  }
  return nearest;
}

/** Get distance from a city to given coordinates (for product filtering) */
export function distanceToCity(cityName: string, fromLat: number, fromLng: number): number | null {
  const city = CITIES.find(c => c.name === cityName);
  if (!city) return null;
  return calculateDistance(fromLat, fromLng, city.lat, city.lng);
}

/** Detect current GPS position using browser API. Returns a promise. */
export function detectGPSLocation(): Promise<{ lat: number; lng: number }> {
  return new Promise((resolve, reject) => {
    if (typeof navigator === 'undefined' || !navigator.geolocation) {
      reject(new Error('Geolocation nije podržan u ovom pregledniku'));
      return;
    }
    navigator.geolocation.getCurrentPosition(
      (pos) => resolve({ lat: pos.coords.latitude, lng: pos.coords.longitude }),
      (err) => {
        switch (err.code) {
          case err.PERMISSION_DENIED:
            reject(new Error('Pristup lokaciji je odbijen'));
            break;
          case err.POSITION_UNAVAILABLE:
            reject(new Error('Lokacija nije dostupna'));
            break;
          case err.TIMEOUT:
            reject(new Error('Zahtjev za lokaciju je istekao'));
            break;
          default:
            reject(new Error('Greška pri detekciji lokacije'));
        }
      },
      { enableHighAccuracy: true, timeout: 10000, maximumAge: 300000 }
    );
  });
}
