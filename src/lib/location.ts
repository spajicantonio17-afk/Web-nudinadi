// ── Location System ──────────────────────────────────────────────
// City/region data for BiH (by Kanton/Entitet) and Croatia + localStorage + GPS

export interface City {
  name: string;
  region: string;
  country: 'BiH' | 'HR' | 'RS' | 'DE' | 'AT';
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

  // ═══════════════════════════════════════════════════════════════
  // DEUTSCHLAND (po saveznim zemljama)
  // ═══════════════════════════════════════════════════════════════

  // ── Bayern ──
  { name: 'München', region: 'Bayern', country: 'DE', lat: 48.1351, lng: 11.5820 },
  { name: 'Nürnberg', region: 'Bayern', country: 'DE', lat: 49.4521, lng: 11.0767 },
  { name: 'Augsburg', region: 'Bayern', country: 'DE', lat: 48.3705, lng: 10.8978 },
  { name: 'Ingolstadt', region: 'Bayern', country: 'DE', lat: 48.7631, lng: 11.4250 },
  { name: 'Regensburg', region: 'Bayern', country: 'DE', lat: 49.0134, lng: 12.1016 },

  // ── Baden-Württemberg ──
  { name: 'Stuttgart', region: 'Baden-Württemberg', country: 'DE', lat: 48.7758, lng: 9.1829 },
  { name: 'Mannheim', region: 'Baden-Württemberg', country: 'DE', lat: 49.4875, lng: 8.4660 },
  { name: 'Karlsruhe', region: 'Baden-Württemberg', country: 'DE', lat: 49.0069, lng: 8.4037 },
  { name: 'Freiburg', region: 'Baden-Württemberg', country: 'DE', lat: 47.9990, lng: 7.8421 },
  { name: 'Ulm', region: 'Baden-Württemberg', country: 'DE', lat: 48.4011, lng: 9.9876 },
  { name: 'Heidelberg', region: 'Baden-Württemberg', country: 'DE', lat: 49.3988, lng: 8.6724 },

  // ── Nordrhein-Westfalen ──
  { name: 'Köln', region: 'Nordrhein-Westfalen', country: 'DE', lat: 50.9333, lng: 6.9500 },
  { name: 'Düsseldorf', region: 'Nordrhein-Westfalen', country: 'DE', lat: 51.2217, lng: 6.7762 },
  { name: 'Dortmund', region: 'Nordrhein-Westfalen', country: 'DE', lat: 51.5136, lng: 7.4653 },
  { name: 'Essen', region: 'Nordrhein-Westfalen', country: 'DE', lat: 51.4556, lng: 7.0116 },
  { name: 'Duisburg', region: 'Nordrhein-Westfalen', country: 'DE', lat: 51.4344, lng: 6.7623 },
  { name: 'Bochum', region: 'Nordrhein-Westfalen', country: 'DE', lat: 51.4819, lng: 7.2162 },
  { name: 'Wuppertal', region: 'Nordrhein-Westfalen', country: 'DE', lat: 51.2562, lng: 7.1508 },
  { name: 'Bielefeld', region: 'Nordrhein-Westfalen', country: 'DE', lat: 51.9906, lng: 8.5318 },
  { name: 'Münster', region: 'Nordrhein-Westfalen', country: 'DE', lat: 51.9607, lng: 7.6261 },
  { name: 'Aachen', region: 'Nordrhein-Westfalen', country: 'DE', lat: 50.7753, lng: 6.0839 },

  // ── Hessen ──
  { name: 'Frankfurt', region: 'Hessen', country: 'DE', lat: 50.1109, lng: 8.6821 },
  { name: 'Wiesbaden', region: 'Hessen', country: 'DE', lat: 50.0782, lng: 8.2397 },
  { name: 'Kassel', region: 'Hessen', country: 'DE', lat: 51.3127, lng: 9.4797 },
  { name: 'Darmstadt', region: 'Hessen', country: 'DE', lat: 49.8728, lng: 8.6512 },

  // ── Hamburg ──
  { name: 'Hamburg', region: 'Hamburg', country: 'DE', lat: 53.5753, lng: 10.0153 },

  // ── Berlin ──
  { name: 'Berlin', region: 'Berlin', country: 'DE', lat: 52.5200, lng: 13.4050 },

  // ── Niedersachsen ──
  { name: 'Hannover', region: 'Niedersachsen', country: 'DE', lat: 52.3759, lng: 9.7320 },
  { name: 'Braunschweig', region: 'Niedersachsen', country: 'DE', lat: 52.2689, lng: 10.5268 },

  // ── Rheinland-Pfalz ──
  { name: 'Mainz', region: 'Rheinland-Pfalz', country: 'DE', lat: 49.9929, lng: 8.2473 },
  { name: 'Ludwigshafen', region: 'Rheinland-Pfalz', country: 'DE', lat: 49.4744, lng: 8.4313 },
  { name: 'Kaiserslautern', region: 'Rheinland-Pfalz', country: 'DE', lat: 49.4440, lng: 7.7689 },

  // ── Sachsen ──
  { name: 'Dresden', region: 'Sachsen', country: 'DE', lat: 51.0504, lng: 13.7373 },
  { name: 'Leipzig', region: 'Sachsen', country: 'DE', lat: 51.3397, lng: 12.3731 },

  // ── Bremen ──
  { name: 'Bremen', region: 'Bremen', country: 'DE', lat: 53.0793, lng: 8.8017 },

  // ═══════════════════════════════════════════════════════════════
  // AUSTRIJA (po saveznim zemljama)
  // ═══════════════════════════════════════════════════════════════

  // ── Wien ──
  { name: 'Wien', region: 'Wien', country: 'AT', lat: 48.2082, lng: 16.3738 },

  // ── Steiermark ──
  { name: 'Graz', region: 'Steiermark', country: 'AT', lat: 47.0707, lng: 15.4395 },
  { name: 'Leoben', region: 'Steiermark', country: 'AT', lat: 47.3833, lng: 15.0939 },
  { name: 'Kapfenberg', region: 'Steiermark', country: 'AT', lat: 47.4450, lng: 15.2939 },

  // ── Oberösterreich ──
  { name: 'Linz', region: 'Oberösterreich', country: 'AT', lat: 48.3064, lng: 14.2858 },
  { name: 'Wels', region: 'Oberösterreich', country: 'AT', lat: 48.1581, lng: 14.0286 },
  { name: 'Steyr', region: 'Oberösterreich', country: 'AT', lat: 48.0422, lng: 14.4200 },

  // ── Salzburg ──
  { name: 'Salzburg', region: 'Salzburg', country: 'AT', lat: 47.8095, lng: 13.0550 },

  // ── Tirol ──
  { name: 'Innsbruck', region: 'Tirol', country: 'AT', lat: 47.2692, lng: 11.4041 },

  // ── Kärnten ──
  { name: 'Klagenfurt', region: 'Kärnten', country: 'AT', lat: 46.6228, lng: 14.3050 },
  { name: 'Villach', region: 'Kärnten', country: 'AT', lat: 46.6103, lng: 13.8558 },

  // ── Niederösterreich ──
  { name: 'St. Pölten', region: 'Niederösterreich', country: 'AT', lat: 48.2042, lng: 15.6229 },
  { name: 'Krems', region: 'Niederösterreich', country: 'AT', lat: 48.4094, lng: 15.5994 },
  { name: 'Wiener Neustadt', region: 'Niederösterreich', country: 'AT', lat: 47.8150, lng: 16.2468 },
  { name: 'Baden', region: 'Niederösterreich', country: 'AT', lat: 48.0056, lng: 16.2303 },

  // ── Vorarlberg ──
  { name: 'Bregenz', region: 'Vorarlberg', country: 'AT', lat: 47.5031, lng: 9.7471 },
  { name: 'Dornbirn', region: 'Vorarlberg', country: 'AT', lat: 47.4125, lng: 9.7417 },
  { name: 'Feldkirch', region: 'Vorarlberg', country: 'AT', lat: 47.2372, lng: 9.5997 },

  // ═══════════════════════════════════════════════════════════════
  // SRBIJA (po okruzima)
  // ═══════════════════════════════════════════════════════════════

  // ── Grad Beograd ──
  { name: 'Beograd', region: 'Grad Beograd', country: 'RS', lat: 44.8176, lng: 20.4569 },
  { name: 'Zemun', region: 'Grad Beograd', country: 'RS', lat: 44.8458, lng: 20.4011 },
  { name: 'Novi Beograd', region: 'Grad Beograd', country: 'RS', lat: 44.8069, lng: 20.4222 },
  { name: 'Surčin', region: 'Grad Beograd', country: 'RS', lat: 44.7961, lng: 20.2800 },
  { name: 'Mladenovac', region: 'Grad Beograd', country: 'RS', lat: 44.4344, lng: 20.6936 },
  { name: 'Lazarevac', region: 'Grad Beograd', country: 'RS', lat: 44.3881, lng: 20.2569 },

  // ── Južnobački okrug ──
  { name: 'Novi Sad', region: 'Južnobački okrug', country: 'RS', lat: 45.2671, lng: 19.8335 },
  { name: 'Vrbas', region: 'Južnobački okrug', country: 'RS', lat: 45.5706, lng: 19.6392 },
  { name: 'Bačka Palanka', region: 'Južnobački okrug', country: 'RS', lat: 45.2500, lng: 19.3894 },
  { name: 'Temerin', region: 'Južnobački okrug', country: 'RS', lat: 45.4061, lng: 19.8878 },
  { name: 'Bečej', region: 'Južnobački okrug', country: 'RS', lat: 45.6153, lng: 20.0325 },

  // ── Severnobački okrug ──
  { name: 'Subotica', region: 'Severnobački okrug', country: 'RS', lat: 46.1003, lng: 19.6658 },
  { name: 'Senta', region: 'Severnobački okrug', country: 'RS', lat: 45.9261, lng: 20.0797 },
  { name: 'Kanjiža', region: 'Severnobački okrug', country: 'RS', lat: 46.0653, lng: 20.0483 },

  // ── Severnobanatski okrug ──
  { name: 'Kikinda', region: 'Severnobanatski okrug', country: 'RS', lat: 45.8281, lng: 20.4675 },
  { name: 'Novi Kneževac', region: 'Severnobanatski okrug', country: 'RS', lat: 46.0481, lng: 20.1019 },

  // ── Srednjobanatski okrug ──
  { name: 'Zrenjanin', region: 'Srednjobanatski okrug', country: 'RS', lat: 45.3819, lng: 20.3906 },
  { name: 'Žitište', region: 'Srednjobanatski okrug', country: 'RS', lat: 45.4844, lng: 20.5558 },

  // ── Južnobanatski okrug ──
  { name: 'Pančevo', region: 'Južnobanatski okrug', country: 'RS', lat: 44.8706, lng: 20.6408 },
  { name: 'Vršac', region: 'Južnobanatski okrug', country: 'RS', lat: 45.1194, lng: 21.3036 },
  { name: 'Bela Crkva', region: 'Južnobanatski okrug', country: 'RS', lat: 44.8983, lng: 21.4153 },

  // ── Zapadnobački okrug ──
  { name: 'Sombor', region: 'Zapadnobački okrug', country: 'RS', lat: 45.7756, lng: 19.1139 },
  { name: 'Apatin', region: 'Zapadnobački okrug', country: 'RS', lat: 45.6694, lng: 18.9817 },

  // ── Sremski okrug ──
  { name: 'Sremska Mitrovica', region: 'Sremski okrug', country: 'RS', lat: 44.9706, lng: 19.6133 },
  { name: 'Ruma', region: 'Sremski okrug', country: 'RS', lat: 45.0089, lng: 19.8214 },
  { name: 'Šid', region: 'Sremski okrug', country: 'RS', lat: 45.1289, lng: 19.0064 },
  { name: 'Stara Pazova', region: 'Sremski okrug', country: 'RS', lat: 44.9817, lng: 20.1628 },
  { name: 'Inđija', region: 'Sremski okrug', country: 'RS', lat: 45.0456, lng: 20.0789 },

  // ── Mačvanski okrug ──
  { name: 'Šabac', region: 'Mačvanski okrug', country: 'RS', lat: 44.7539, lng: 19.6933 },
  { name: 'Loznica', region: 'Mačvanski okrug', country: 'RS', lat: 44.5339, lng: 19.2256 },
  { name: 'Bogatic', region: 'Mačvanski okrug', country: 'RS', lat: 44.8367, lng: 19.4806 },

  // ── Kolubarski okrug ──
  { name: 'Valjevo', region: 'Kolubarski okrug', country: 'RS', lat: 44.2733, lng: 19.8881 },
  { name: 'Lajkovac', region: 'Kolubarski okrug', country: 'RS', lat: 44.3619, lng: 20.1542 },
  { name: 'Mionica', region: 'Kolubarski okrug', country: 'RS', lat: 44.2406, lng: 20.0931 },

  // ── Podunavski okrug ──
  { name: 'Smederevo', region: 'Podunavski okrug', country: 'RS', lat: 44.6644, lng: 20.9281 },
  { name: 'Smederevska Palanka', region: 'Podunavski okrug', country: 'RS', lat: 44.3664, lng: 20.9578 },

  // ── Braničevski okrug ──
  { name: 'Požarevac', region: 'Braničevski okrug', country: 'RS', lat: 44.6189, lng: 21.1869 },
  { name: 'Petrovac na Mlavi', region: 'Braničevski okrug', country: 'RS', lat: 44.3781, lng: 21.4158 },

  // ── Šumadijski okrug ──
  { name: 'Kragujevac', region: 'Šumadijski okrug', country: 'RS', lat: 44.0122, lng: 20.9239 },
  { name: 'Aranđelovac', region: 'Šumadijski okrug', country: 'RS', lat: 44.3044, lng: 20.5600 },
  { name: 'Topola', region: 'Šumadijski okrug', country: 'RS', lat: 44.2583, lng: 20.6789 },

  // ── Pomoravski okrug ──
  { name: 'Jagodina', region: 'Pomoravski okrug', country: 'RS', lat: 43.9764, lng: 21.2611 },
  { name: 'Paraćin', region: 'Pomoravski okrug', country: 'RS', lat: 43.8628, lng: 21.4083 },
  { name: 'Ćuprija', region: 'Pomoravski okrug', country: 'RS', lat: 43.9286, lng: 21.3711 },

  // ── Borski okrug ──
  { name: 'Bor', region: 'Borski okrug', country: 'RS', lat: 44.0764, lng: 22.0958 },
  { name: 'Zaječar', region: 'Borski okrug', country: 'RS', lat: 43.9056, lng: 22.2764 },
  { name: 'Negotin', region: 'Borski okrug', country: 'RS', lat: 44.2258, lng: 22.5239 },

  // ── Zaječarski okrug ──
  { name: 'Knjaževac', region: 'Zaječarski okrug', country: 'RS', lat: 43.5683, lng: 22.2567 },
  { name: 'Sokobanja', region: 'Zaječarski okrug', country: 'RS', lat: 43.6439, lng: 21.8708 },

  // ── Zlatiborski okrug ──
  { name: 'Užice', region: 'Zlatiborski okrug', country: 'RS', lat: 43.8572, lng: 19.8428 },
  { name: 'Čajetina', region: 'Zlatiborski okrug', country: 'RS', lat: 43.7519, lng: 19.7178 },
  { name: 'Nova Varoš', region: 'Zlatiborski okrug', country: 'RS', lat: 43.4606, lng: 19.7981 },
  { name: 'Priboj', region: 'Zlatiborski okrug', country: 'RS', lat: 43.5831, lng: 19.5217 },
  { name: 'Prijepolje', region: 'Zlatiborski okrug', country: 'RS', lat: 43.3889, lng: 19.6458 },

  // ── Moravički okrug ──
  { name: 'Čačak', region: 'Moravički okrug', country: 'RS', lat: 43.8914, lng: 20.3494 },
  { name: 'Gornji Milanovac', region: 'Moravički okrug', country: 'RS', lat: 44.0258, lng: 20.4622 },
  { name: 'Ivanjica', region: 'Moravički okrug', country: 'RS', lat: 43.5822, lng: 20.2275 },

  // ── Raški okrug ──
  { name: 'Kraljevo', region: 'Raški okrug', country: 'RS', lat: 43.7239, lng: 20.6878 },
  { name: 'Novi Pazar', region: 'Raški okrug', country: 'RS', lat: 43.1367, lng: 20.5122 },
  { name: 'Vrnjačka Banja', region: 'Raški okrug', country: 'RS', lat: 43.6233, lng: 20.8942 },
  { name: 'Raška', region: 'Raški okrug', country: 'RS', lat: 43.2867, lng: 20.6147 },

  // ── Rasinski okrug ──
  { name: 'Kruševac', region: 'Rasinski okrug', country: 'RS', lat: 43.5794, lng: 21.3333 },
  { name: 'Trstenik', region: 'Rasinski okrug', country: 'RS', lat: 43.6189, lng: 21.0003 },
  { name: 'Aleksandrovac', region: 'Rasinski okrug', country: 'RS', lat: 43.4567, lng: 21.0494 },

  // ── Nišavski okrug ──
  { name: 'Niš', region: 'Nišavski okrug', country: 'RS', lat: 43.3209, lng: 21.8958 },
  { name: 'Aleksinac', region: 'Nišavski okrug', country: 'RS', lat: 43.5417, lng: 21.7069 },
  { name: 'Svrljig', region: 'Nišavski okrug', country: 'RS', lat: 43.4167, lng: 22.1283 },

  // ── Toplički okrug ──
  { name: 'Prokuplje', region: 'Toplički okrug', country: 'RS', lat: 43.2350, lng: 21.5908 },
  { name: 'Kuršumlija', region: 'Toplički okrug', country: 'RS', lat: 43.1386, lng: 21.2683 },

  // ── Pirotski okrug ──
  { name: 'Pirot', region: 'Pirotski okrug', country: 'RS', lat: 43.1531, lng: 22.5869 },
  { name: 'Dimitrovgrad', region: 'Pirotski okrug', country: 'RS', lat: 43.0156, lng: 22.7817 },

  // ── Jablanički okrug ──
  { name: 'Leskovac', region: 'Jablanički okrug', country: 'RS', lat: 42.9981, lng: 21.9458 },
  { name: 'Vlasotince', region: 'Jablanički okrug', country: 'RS', lat: 42.9703, lng: 22.1303 },
  { name: 'Bojnik', region: 'Jablanički okrug', country: 'RS', lat: 42.9636, lng: 21.7256 },

  // ── Pčinjski okrug ──
  { name: 'Vranje', region: 'Pčinjski okrug', country: 'RS', lat: 42.5503, lng: 21.9006 },
  { name: 'Vladičin Han', region: 'Pčinjski okrug', country: 'RS', lat: 42.7064, lng: 22.0644 },
  { name: 'Surdulica', region: 'Pčinjski okrug', country: 'RS', lat: 42.6903, lng: 22.1664 },
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
