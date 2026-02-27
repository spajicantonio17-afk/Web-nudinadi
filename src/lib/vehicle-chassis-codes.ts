// ── Vehicle Chassis Code & Model Shortcut Lookup ────────────
// Maps chassis codes (E30, W205, B8, MK7…) and model shortcuts (A4, Golf…)
// to brand + model. Used in upload (brand search) and home (search suggestions).

export interface ChassisCodeEntry {
  brand: string;
  model: string;
  generation?: string;
  years?: string;
}

export interface ChassisLookupResult {
  brand: string;
  model: string;
  variant?: string;
  fuel?: string;
  generation?: string;
  years?: string;
}

// ── Chassis Codes ───────────────────────────────────────────
// Key = lowercase chassis code. Value = single entry or array (ambiguous codes).
// brand/model must EXACTLY match names in vehicle-models.ts.

const CHASSIS_CODES: Record<string, ChassisCodeEntry | ChassisCodeEntry[]> = {
  // ─── BMW Serija 1 ───
  e81: { brand: 'BMW', model: 'Serija 1', generation: 'E81', years: '2004-2011' },
  e82: { brand: 'BMW', model: 'Serija 1', generation: 'E82', years: '2007-2013' },
  e87: { brand: 'BMW', model: 'Serija 1', generation: 'E87', years: '2004-2011' },
  e88: { brand: 'BMW', model: 'Serija 1', generation: 'E88', years: '2008-2013' },
  f20: { brand: 'BMW', model: 'Serija 1', generation: 'F20', years: '2011-2019' },
  f21: { brand: 'BMW', model: 'Serija 1', generation: 'F21', years: '2012-2019' },
  f40: { brand: 'BMW', model: 'Serija 1', generation: 'F40', years: '2019+' },
  // ─── BMW Serija 2 ───
  f22: { brand: 'BMW', model: 'Serija 2', generation: 'F22', years: '2014-2021' },
  f23: { brand: 'BMW', model: 'Serija 2', generation: 'F23', years: '2015-2021' },
  f44: { brand: 'BMW', model: 'Serija 2', generation: 'F44', years: '2019+' },
  f45: { brand: 'BMW', model: 'Serija 2', generation: 'F45', years: '2014-2021' },
  g42: { brand: 'BMW', model: 'Serija 2', generation: 'G42', years: '2021+' },
  // ─── BMW Serija 3 ───
  e21: { brand: 'BMW', model: 'Serija 3', generation: 'E21', years: '1975-1983' },
  e30: { brand: 'BMW', model: 'Serija 3', generation: 'E30', years: '1982-1994' },
  e36: { brand: 'BMW', model: 'Serija 3', generation: 'E36', years: '1990-2000' },
  e46: { brand: 'BMW', model: 'Serija 3', generation: 'E46', years: '1998-2006' },
  e90: { brand: 'BMW', model: 'Serija 3', generation: 'E90', years: '2004-2013' },
  e91: { brand: 'BMW', model: 'Serija 3', generation: 'E91', years: '2005-2012' },
  e92: { brand: 'BMW', model: 'Serija 3', generation: 'E92', years: '2006-2013' },
  e93: { brand: 'BMW', model: 'Serija 3', generation: 'E93', years: '2007-2013' },
  f30: { brand: 'BMW', model: 'Serija 3', generation: 'F30', years: '2011-2019' },
  f31: { brand: 'BMW', model: 'Serija 3', generation: 'F31', years: '2012-2019' },
  f34: { brand: 'BMW', model: 'Serija 3', generation: 'F34', years: '2013-2020' },
  g20: { brand: 'BMW', model: 'Serija 3', generation: 'G20', years: '2018+' },
  g21: { brand: 'BMW', model: 'Serija 3', generation: 'G21', years: '2019+' },
  // ─── BMW Serija 4 ───
  f32: { brand: 'BMW', model: 'Serija 4', generation: 'F32', years: '2013-2020' },
  f33: { brand: 'BMW', model: 'Serija 4', generation: 'F33', years: '2014-2020' },
  f36: { brand: 'BMW', model: 'Serija 4', generation: 'F36', years: '2014-2020' },
  g22: { brand: 'BMW', model: 'Serija 4', generation: 'G22', years: '2020+' },
  g23: { brand: 'BMW', model: 'Serija 4', generation: 'G23', years: '2021+' },
  g26: { brand: 'BMW', model: 'Serija 4', generation: 'G26', years: '2021+' },
  // ─── BMW Serija 5 ───
  e12: { brand: 'BMW', model: 'Serija 5', generation: 'E12', years: '1972-1981' },
  e28: { brand: 'BMW', model: 'Serija 5', generation: 'E28', years: '1981-1988' },
  e34: { brand: 'BMW', model: 'Serija 5', generation: 'E34', years: '1988-1996' },
  e39: { brand: 'BMW', model: 'Serija 5', generation: 'E39', years: '1995-2004' },
  e60: { brand: 'BMW', model: 'Serija 5', generation: 'E60', years: '2003-2010' },
  e61: { brand: 'BMW', model: 'Serija 5', generation: 'E61', years: '2004-2010' },
  f10: { brand: 'BMW', model: 'Serija 5', generation: 'F10', years: '2010-2017' },
  f11: { brand: 'BMW', model: 'Serija 5', generation: 'F11', years: '2010-2017' },
  g30: { brand: 'BMW', model: 'Serija 5', generation: 'G30', years: '2016+' },
  g31: { brand: 'BMW', model: 'Serija 5', generation: 'G31', years: '2017+' },
  // ─── BMW Serija 6 ───
  e24: { brand: 'BMW', model: 'Serija 6', generation: 'E24', years: '1976-1989' },
  e63: { brand: 'BMW', model: 'Serija 6', generation: 'E63', years: '2003-2010' },
  e64: { brand: 'BMW', model: 'Serija 6', generation: 'E64', years: '2004-2010' },
  f06: { brand: 'BMW', model: 'Serija 6', generation: 'F06', years: '2012-2018' },
  // ─── BMW Serija 7 ───
  e23: { brand: 'BMW', model: 'Serija 7', generation: 'E23', years: '1977-1986' },
  e32: { brand: 'BMW', model: 'Serija 7', generation: 'E32', years: '1986-1994' },
  e38: { brand: 'BMW', model: 'Serija 7', generation: 'E38', years: '1994-2001' },
  e65: { brand: 'BMW', model: 'Serija 7', generation: 'E65', years: '2001-2008' },
  e66: { brand: 'BMW', model: 'Serija 7', generation: 'E66', years: '2001-2008' },
  f01: { brand: 'BMW', model: 'Serija 7', generation: 'F01', years: '2008-2015' },
  f02: { brand: 'BMW', model: 'Serija 7', generation: 'F02', years: '2008-2015' },
  g11: { brand: 'BMW', model: 'Serija 7', generation: 'G11', years: '2015-2022' },
  g12: { brand: 'BMW', model: 'Serija 7', generation: 'G12', years: '2015-2022' },
  g70: { brand: 'BMW', model: 'Serija 7', generation: 'G70', years: '2022+' },
  // ─── BMW Serija 8 ───
  e31: { brand: 'BMW', model: 'Serija 8', generation: 'E31', years: '1990-1999' },
  g14: { brand: 'BMW', model: 'Serija 8', generation: 'G14', years: '2018+' },
  g15: { brand: 'BMW', model: 'Serija 8', generation: 'G15', years: '2018+' },
  g16: { brand: 'BMW', model: 'Serija 8', generation: 'G16', years: '2019+' },
  // ─── BMW X ───
  e84: { brand: 'BMW', model: 'X1', generation: 'E84', years: '2009-2015' },
  f48: { brand: 'BMW', model: 'X1', generation: 'F48', years: '2015-2022' },
  f39: { brand: 'BMW', model: 'X2', generation: 'F39', years: '2018+' },
  e83: { brand: 'BMW', model: 'X3', generation: 'E83', years: '2003-2010' },
  f25: { brand: 'BMW', model: 'X3', generation: 'F25', years: '2010-2017' },
  g01: { brand: 'BMW', model: 'X3', generation: 'G01', years: '2017+' },
  f26: { brand: 'BMW', model: 'X4', generation: 'F26', years: '2014-2018' },
  g02: { brand: 'BMW', model: 'X4', generation: 'G02', years: '2018+' },
  e53: { brand: 'BMW', model: 'X5', generation: 'E53', years: '1999-2006' },
  e70: { brand: 'BMW', model: 'X5', generation: 'E70', years: '2006-2013' },
  f15: { brand: 'BMW', model: 'X5', generation: 'F15', years: '2013-2018' },
  g05: { brand: 'BMW', model: 'X5', generation: 'G05', years: '2018+' },
  e71: { brand: 'BMW', model: 'X6', generation: 'E71', years: '2008-2014' },
  f16: { brand: 'BMW', model: 'X6', generation: 'F16', years: '2014-2019' },
  g06: { brand: 'BMW', model: 'X6', generation: 'G06', years: '2019+' },
  g07: { brand: 'BMW', model: 'X7', generation: 'G07', years: '2018+' },
  // ─── BMW Z ───
  e85: { brand: 'BMW', model: 'Z4', generation: 'E85', years: '2002-2008' },
  e86: { brand: 'BMW', model: 'Z4', generation: 'E86', years: '2006-2008' },
  e89: { brand: 'BMW', model: 'Z4', generation: 'E89', years: '2009-2016' },
  g29: { brand: 'BMW', model: 'Z4', generation: 'G29', years: '2018+' },

  // ═══ MERCEDES-BENZ ═══
  // ─── A-Klasse ───
  w168: { brand: 'Mercedes-Benz', model: 'A-Klasse', generation: 'W168', years: '1997-2004' },
  w169: { brand: 'Mercedes-Benz', model: 'A-Klasse', generation: 'W169', years: '2004-2012' },
  w176: { brand: 'Mercedes-Benz', model: 'A-Klasse', generation: 'W176', years: '2012-2018' },
  w177: { brand: 'Mercedes-Benz', model: 'A-Klasse', generation: 'W177', years: '2018+' },
  // ─── B-Klasse ───
  w245: { brand: 'Mercedes-Benz', model: 'B-Klasse', generation: 'W245', years: '2005-2011' },
  w246: { brand: 'Mercedes-Benz', model: 'B-Klasse', generation: 'W246', years: '2011-2018' },
  w247: { brand: 'Mercedes-Benz', model: 'B-Klasse', generation: 'W247', years: '2018+' },
  // ─── C-Klasse ───
  w202: { brand: 'Mercedes-Benz', model: 'C-Klasse', generation: 'W202', years: '1993-2000' },
  w203: { brand: 'Mercedes-Benz', model: 'C-Klasse', generation: 'W203', years: '2000-2007' },
  w204: { brand: 'Mercedes-Benz', model: 'C-Klasse', generation: 'W204', years: '2007-2014' },
  w205: { brand: 'Mercedes-Benz', model: 'C-Klasse', generation: 'W205', years: '2014-2021' },
  w206: { brand: 'Mercedes-Benz', model: 'C-Klasse', generation: 'W206', years: '2021+' },
  s202: { brand: 'Mercedes-Benz', model: 'C-Klasse', generation: 'S202', years: '1996-2001' },
  s203: { brand: 'Mercedes-Benz', model: 'C-Klasse', generation: 'S203', years: '2001-2007' },
  s204: { brand: 'Mercedes-Benz', model: 'C-Klasse', generation: 'S204', years: '2008-2014' },
  s205: { brand: 'Mercedes-Benz', model: 'C-Klasse', generation: 'S205', years: '2014-2021' },
  s206: { brand: 'Mercedes-Benz', model: 'C-Klasse', generation: 'S206', years: '2021+' },
  // ─── E-Klasse ───
  w123: { brand: 'Mercedes-Benz', model: 'E-Klasse', generation: 'W123', years: '1976-1985' },
  w124: { brand: 'Mercedes-Benz', model: 'E-Klasse', generation: 'W124', years: '1985-1995' },
  w210: { brand: 'Mercedes-Benz', model: 'E-Klasse', generation: 'W210', years: '1995-2003' },
  w211: { brand: 'Mercedes-Benz', model: 'E-Klasse', generation: 'W211', years: '2003-2009' },
  w212: { brand: 'Mercedes-Benz', model: 'E-Klasse', generation: 'W212', years: '2009-2016' },
  w213: { brand: 'Mercedes-Benz', model: 'E-Klasse', generation: 'W213', years: '2016-2023' },
  w214: { brand: 'Mercedes-Benz', model: 'E-Klasse', generation: 'W214', years: '2023+' },
  s210: { brand: 'Mercedes-Benz', model: 'E-Klasse', generation: 'S210', years: '1996-2003' },
  s211: { brand: 'Mercedes-Benz', model: 'E-Klasse', generation: 'S211', years: '2003-2009' },
  s212: { brand: 'Mercedes-Benz', model: 'E-Klasse', generation: 'S212', years: '2009-2016' },
  s213: { brand: 'Mercedes-Benz', model: 'E-Klasse', generation: 'S213', years: '2016-2023' },
  // ─── S-Klasse ───
  w126: { brand: 'Mercedes-Benz', model: 'S-Klasse', generation: 'W126', years: '1979-1991' },
  w140: { brand: 'Mercedes-Benz', model: 'S-Klasse', generation: 'W140', years: '1991-1998' },
  w220: { brand: 'Mercedes-Benz', model: 'S-Klasse', generation: 'W220', years: '1998-2005' },
  w221: { brand: 'Mercedes-Benz', model: 'S-Klasse', generation: 'W221', years: '2005-2013' },
  w222: { brand: 'Mercedes-Benz', model: 'S-Klasse', generation: 'W222', years: '2013-2020' },
  w223: { brand: 'Mercedes-Benz', model: 'S-Klasse', generation: 'W223', years: '2020+' },
  // ─── CLA ───
  c117: { brand: 'Mercedes-Benz', model: 'CLA', generation: 'C117', years: '2013-2019' },
  c118: { brand: 'Mercedes-Benz', model: 'CLA', generation: 'C118', years: '2019+' },
  // ─── CLS ───
  c219: { brand: 'Mercedes-Benz', model: 'CLS', generation: 'C219', years: '2004-2010' },
  w218: { brand: 'Mercedes-Benz', model: 'CLS', generation: 'W218', years: '2010-2017' },
  c257: { brand: 'Mercedes-Benz', model: 'CLS', generation: 'C257', years: '2018+' },
  // ─── GLA ───
  x156: { brand: 'Mercedes-Benz', model: 'GLA', generation: 'X156', years: '2013-2019' },
  h247: { brand: 'Mercedes-Benz', model: 'GLA', generation: 'H247', years: '2019+' },
  // ─── GLB ───
  x247: { brand: 'Mercedes-Benz', model: 'GLB', generation: 'X247', years: '2019+' },
  // ─── GLC ───
  x253: { brand: 'Mercedes-Benz', model: 'GLC', generation: 'X253', years: '2015-2022' },
  x254: { brand: 'Mercedes-Benz', model: 'GLC', generation: 'X254', years: '2022+' },
  // ─── GLE / ML ───
  w163: { brand: 'Mercedes-Benz', model: 'GLE', generation: 'W163', years: '1997-2005' },
  w164: { brand: 'Mercedes-Benz', model: 'GLE', generation: 'W164', years: '2005-2011' },
  w166: { brand: 'Mercedes-Benz', model: 'GLE', generation: 'W166', years: '2011-2019' },
  v167: { brand: 'Mercedes-Benz', model: 'GLE', generation: 'V167', years: '2019+' },
  // ─── GLS / GL ───
  x164: { brand: 'Mercedes-Benz', model: 'GLS', generation: 'X164', years: '2006-2012' },
  x166: { brand: 'Mercedes-Benz', model: 'GLS', generation: 'X166', years: '2012-2019' },
  x167: { brand: 'Mercedes-Benz', model: 'GLS', generation: 'X167', years: '2019+' },
  // ─── G-Klasse ───
  w460: { brand: 'Mercedes-Benz', model: 'G-Klasse', generation: 'W460', years: '1979-1991' },
  w461: { brand: 'Mercedes-Benz', model: 'G-Klasse', generation: 'W461', years: '1992+' },
  w463: { brand: 'Mercedes-Benz', model: 'G-Klasse', generation: 'W463', years: '1990+' },
  // ─── V-Klasse / Vito ───
  w638: { brand: 'Mercedes-Benz', model: 'V-Klasse', generation: 'W638', years: '1996-2003' },
  w639: { brand: 'Mercedes-Benz', model: 'V-Klasse', generation: 'W639', years: '2003-2014' },
  w447: { brand: 'Mercedes-Benz', model: 'V-Klasse', generation: 'W447', years: '2014+' },
  // ─── SLK / SLC ───
  r170: { brand: 'Mercedes-Benz', model: 'SLK / SLC', generation: 'R170', years: '1996-2004' },
  r171: { brand: 'Mercedes-Benz', model: 'SLK / SLC', generation: 'R171', years: '2004-2011' },
  r172: { brand: 'Mercedes-Benz', model: 'SLK / SLC', generation: 'R172', years: '2011-2020' },
  // ─── SL ───
  r107: { brand: 'Mercedes-Benz', model: 'SL', generation: 'R107', years: '1971-1989' },
  r129: { brand: 'Mercedes-Benz', model: 'SL', generation: 'R129', years: '1989-2001' },
  r230: { brand: 'Mercedes-Benz', model: 'SL', generation: 'R230', years: '2001-2011' },
  r231: { brand: 'Mercedes-Benz', model: 'SL', generation: 'R231', years: '2012-2020' },
  r232: { brand: 'Mercedes-Benz', model: 'SL', generation: 'R232', years: '2021+' },
  // ─── Sprinter ───
  w906: { brand: 'Mercedes-Benz', model: 'Sprinter', generation: 'W906', years: '2006-2018' },
  w907: { brand: 'Mercedes-Benz', model: 'Sprinter', generation: 'W907', years: '2018+' },

  // ═══ AUDI ═══
  // ─── A1 ───
  '8x': { brand: 'Audi', model: 'A1', generation: '8X', years: '2010-2018' },
  // ─── A3 ───
  '8l': { brand: 'Audi', model: 'A3', generation: '8L', years: '1996-2003' },
  '8p': { brand: 'Audi', model: 'A3', generation: '8P', years: '2003-2012' },
  '8v': { brand: 'Audi', model: 'A3', generation: '8V', years: '2012-2020' },
  '8y': { brand: 'Audi', model: 'A3', generation: '8Y', years: '2020+' },
  // ─── A4 / Passat (B-codes shared) ───
  b5: [
    { brand: 'Audi', model: 'A4', generation: 'B5', years: '1994-2001' },
    { brand: 'Volkswagen', model: 'Passat', generation: 'B5', years: '1996-2005' },
  ],
  b6: [
    { brand: 'Audi', model: 'A4', generation: 'B6', years: '2000-2006' },
    { brand: 'Volkswagen', model: 'Passat', generation: 'B6', years: '2005-2010' },
  ],
  b7: [
    { brand: 'Audi', model: 'A4', generation: 'B7', years: '2004-2009' },
    { brand: 'Volkswagen', model: 'Passat', generation: 'B7', years: '2010-2015' },
  ],
  b8: [
    { brand: 'Audi', model: 'A4', generation: 'B8', years: '2007-2015' },
    { brand: 'Volkswagen', model: 'Passat', generation: 'B8', years: '2014+' },
  ],
  b9: { brand: 'Audi', model: 'A4', generation: 'B9', years: '2015+' },
  // ─── A5 ───
  '8t': { brand: 'Audi', model: 'A5', generation: '8T', years: '2007-2016' },
  // ─── A6 ───
  c6: { brand: 'Audi', model: 'A6', generation: 'C6', years: '2004-2011' },
  c7: { brand: 'Audi', model: 'A6', generation: 'C7', years: '2011-2018' },
  c8: { brand: 'Audi', model: 'A6', generation: 'C8', years: '2018+' },
  // ─── A7 ───
  '4g': { brand: 'Audi', model: 'A7', generation: '4G', years: '2010-2018' },
  '4k': { brand: 'Audi', model: 'A7', generation: '4K', years: '2018+' },
  // ─── A8 ───
  d2: { brand: 'Audi', model: 'A8', generation: 'D2', years: '1994-2002' },
  d3: { brand: 'Audi', model: 'A8', generation: 'D3', years: '2002-2010' },
  d4: { brand: 'Audi', model: 'A8', generation: 'D4', years: '2010-2017' },
  d5: { brand: 'Audi', model: 'A8', generation: 'D5', years: '2017+' },
  // ─── Q3 ───
  '8u': { brand: 'Audi', model: 'Q3', generation: '8U', years: '2011-2018' },
  // ─── Q5 ───
  '8r': { brand: 'Audi', model: 'Q5', generation: '8R', years: '2008-2016' },
  // ─── Q7 ───
  '4l': { brand: 'Audi', model: 'Q7', generation: '4L', years: '2005-2015' },
  '4m': { brand: 'Audi', model: 'Q7', generation: '4M', years: '2015+' },
  // ─── TT ───
  '8n': { brand: 'Audi', model: 'TT', generation: '8N', years: '1998-2006' },
  '8j': { brand: 'Audi', model: 'TT', generation: '8J', years: '2006-2014' },
  '8s': { brand: 'Audi', model: 'TT', generation: '8S', years: '2014+' },

  // ═══ VOLKSWAGEN ═══
  // ─── Golf MK ───
  mk1: { brand: 'Volkswagen', model: 'Golf', generation: 'MK1', years: '1974-1983' },
  mk2: { brand: 'Volkswagen', model: 'Golf', generation: 'MK2', years: '1983-1992' },
  mk3: { brand: 'Volkswagen', model: 'Golf', generation: 'MK3', years: '1991-1999' },
  mk4: { brand: 'Volkswagen', model: 'Golf', generation: 'MK4', years: '1997-2006' },
  mk5: { brand: 'Volkswagen', model: 'Golf', generation: 'MK5', years: '2003-2009' },
  mk6: { brand: 'Volkswagen', model: 'Golf', generation: 'MK6', years: '2008-2013' },
  mk7: { brand: 'Volkswagen', model: 'Golf', generation: 'MK7', years: '2012-2020' },
  mk8: { brand: 'Volkswagen', model: 'Golf', generation: 'MK8', years: '2019+' },
  // ─── Polo ───
  '6n': { brand: 'Volkswagen', model: 'Polo', generation: '6N', years: '1994-2001' },
  '9n': { brand: 'Volkswagen', model: 'Polo', generation: '9N', years: '2001-2009' },
  '6r': { brand: 'Volkswagen', model: 'Polo', generation: '6R', years: '2009-2017' },
  // ─── Tiguan ───
  '5n': { brand: 'Volkswagen', model: 'Tiguan', generation: '5N', years: '2007-2016' },
  // ─── Touareg ───
  '7l': { brand: 'Volkswagen', model: 'Touareg', generation: '7L', years: '2002-2010' },
  '7p': { brand: 'Volkswagen', model: 'Touareg', generation: '7P', years: '2010-2018' },
  // ─── Touran ───
  '1t': { brand: 'Volkswagen', model: 'Touran', generation: '1T', years: '2003-2015' },
  '5t': { brand: 'Volkswagen', model: 'Touran', generation: '5T', years: '2015+' },
  // ─── Transporter ───
  t4: { brand: 'Volkswagen', model: 'Transporter / T5 / T6', generation: 'T4', years: '1990-2003' },
  t5: { brand: 'Volkswagen', model: 'Transporter / T5 / T6', generation: 'T5', years: '2003-2015' },
  t6: { brand: 'Volkswagen', model: 'Transporter / T5 / T6', generation: 'T6', years: '2015+' },

  // ═══ PORSCHE ═══
  '964': { brand: 'Porsche', model: '911', generation: '964', years: '1989-1994' },
  '993': { brand: 'Porsche', model: '911', generation: '993', years: '1994-1998' },
  '996': { brand: 'Porsche', model: '911', generation: '996', years: '1998-2005' },
  '997': { brand: 'Porsche', model: '911', generation: '997', years: '2004-2012' },
  '991': { brand: 'Porsche', model: '911', generation: '991', years: '2011-2019' },
  '992': { brand: 'Porsche', model: '911', generation: '992', years: '2019+' },
  '982': { brand: 'Porsche', model: '718 Cayman', generation: '982', years: '2016+' },
};

// ── Model Shortcuts ─────────────────────────────────────────
// Popular model names → brand + model. Lowercase key.

const MODEL_SHORTCUTS: Record<string, ChassisCodeEntry | ChassisCodeEntry[]> = {
  // Audi
  a1: { brand: 'Audi', model: 'A1' },
  a3: { brand: 'Audi', model: 'A3' },
  a4: { brand: 'Audi', model: 'A4' },
  a5: { brand: 'Audi', model: 'A5' },
  a6: { brand: 'Audi', model: 'A6' },
  a7: { brand: 'Audi', model: 'A7' },
  a8: { brand: 'Audi', model: 'A8' },
  q2: { brand: 'Audi', model: 'Q2' },
  q3: { brand: 'Audi', model: 'Q3' },
  q5: { brand: 'Audi', model: 'Q5' },
  q7: { brand: 'Audi', model: 'Q7' },
  q8: { brand: 'Audi', model: 'Q8' },
  tt: { brand: 'Audi', model: 'TT' },
  r8: { brand: 'Audi', model: 'R8' },
  rs3: { brand: 'Audi', model: 'A3' },
  rs4: { brand: 'Audi', model: 'A4' },
  rs5: { brand: 'Audi', model: 'A5' },
  rs6: { brand: 'Audi', model: 'A6' },
  rs7: { brand: 'Audi', model: 'A7' },
  s3: { brand: 'Audi', model: 'A3' },
  s4: { brand: 'Audi', model: 'A4' },
  s5: { brand: 'Audi', model: 'A5' },
  // BMW
  x1: { brand: 'BMW', model: 'X1' },
  x2: { brand: 'BMW', model: 'X2' },
  x3: { brand: 'BMW', model: 'X3' },
  x4: { brand: 'BMW', model: 'X4' },
  x5: { brand: 'BMW', model: 'X5' },
  x6: { brand: 'BMW', model: 'X6' },
  x7: { brand: 'BMW', model: 'X7' },
  z3: { brand: 'BMW', model: 'Z3' },
  z4: { brand: 'BMW', model: 'Z4' },
  m2: { brand: 'BMW', model: 'M2' },
  m3: { brand: 'BMW', model: 'M3' },
  m4: { brand: 'BMW', model: 'M4' },
  m5: { brand: 'BMW', model: 'M5' },
  m8: { brand: 'BMW', model: 'M8' },
  '3er': { brand: 'BMW', model: 'Serija 3' },
  '5er': { brand: 'BMW', model: 'Serija 5' },
  '7er': { brand: 'BMW', model: 'Serija 7' },
  // Volkswagen
  golf: { brand: 'Volkswagen', model: 'Golf' },
  passat: { brand: 'Volkswagen', model: 'Passat' },
  polo: { brand: 'Volkswagen', model: 'Polo' },
  tiguan: { brand: 'Volkswagen', model: 'Tiguan' },
  touareg: { brand: 'Volkswagen', model: 'Touareg' },
  touran: { brand: 'Volkswagen', model: 'Touran' },
  arteon: { brand: 'Volkswagen', model: 'Arteon' },
  caddy: { brand: 'Volkswagen', model: 'Caddy' },
  jetta: { brand: 'Volkswagen', model: 'Jetta' },
  sharan: { brand: 'Volkswagen', model: 'Sharan' },
  scirocco: { brand: 'Volkswagen', model: 'Scirocco' },
  gti: { brand: 'Volkswagen', model: 'Golf' },
  gtd: { brand: 'Volkswagen', model: 'Golf' },
  // Mercedes
  cla: { brand: 'Mercedes-Benz', model: 'CLA' },
  cls: { brand: 'Mercedes-Benz', model: 'CLS' },
  gla: { brand: 'Mercedes-Benz', model: 'GLA' },
  glb: { brand: 'Mercedes-Benz', model: 'GLB' },
  glc: { brand: 'Mercedes-Benz', model: 'GLC' },
  gle: { brand: 'Mercedes-Benz', model: 'GLE' },
  gls: { brand: 'Mercedes-Benz', model: 'GLS' },
  vito: { brand: 'Mercedes-Benz', model: 'Vito' },
  sprinter: { brand: 'Mercedes-Benz', model: 'Sprinter' },
  // Opel
  corsa: { brand: 'Opel', model: 'Corsa' },
  astra: { brand: 'Opel', model: 'Astra' },
  insignia: { brand: 'Opel', model: 'Insignia' },
  mokka: { brand: 'Opel', model: 'Mokka' },
  vectra: { brand: 'Opel', model: 'Vectra' },
  zafira: { brand: 'Opel', model: 'Zafira' },
  meriva: { brand: 'Opel', model: 'Meriva' },
  // Renault
  clio: { brand: 'Renault', model: 'Clio' },
  megane: { brand: 'Renault', model: 'Megane' },
  scenic: { brand: 'Renault', model: 'Scenic' },
  captur: { brand: 'Renault', model: 'Captur' },
  kadjar: { brand: 'Renault', model: 'Kadjar' },
  laguna: { brand: 'Renault', model: 'Laguna' },
  kangoo: { brand: 'Renault', model: 'Kangoo' },
  twingo: { brand: 'Renault', model: 'Twingo' },
  // Ford
  fiesta: { brand: 'Ford', model: 'Fiesta' },
  focus: { brand: 'Ford', model: 'Focus' },
  mondeo: { brand: 'Ford', model: 'Mondeo' },
  kuga: { brand: 'Ford', model: 'Kuga' },
  puma: { brand: 'Ford', model: 'Puma' },
  mustang: { brand: 'Ford', model: 'Mustang' },
  ranger: { brand: 'Ford', model: 'Ranger' },
  transit: { brand: 'Ford', model: 'Transit' },
  galaxy: { brand: 'Ford', model: 'Galaxy' },
  // Fiat
  punto: { brand: 'Fiat', model: 'Punto' },
  panda: { brand: 'Fiat', model: 'Panda' },
  tipo: { brand: 'Fiat', model: 'Tipo' },
  bravo: { brand: 'Fiat', model: 'Bravo' },
  stilo: { brand: 'Fiat', model: 'Stilo' },
  doblo: { brand: 'Fiat', model: 'Doblo' },
  ducato: { brand: 'Fiat', model: 'Ducato' },
  multipla: { brand: 'Fiat', model: 'Multipla' },
  // Seat
  ibiza: { brand: 'Seat', model: 'Ibiza' },
  leon: { brand: 'Seat', model: 'Leon' },
  arona: { brand: 'Seat', model: 'Arona' },
  ateca: { brand: 'Seat', model: 'Ateca' },
  // Škoda
  fabia: { brand: 'Škoda', model: 'Fabia' },
  octavia: { brand: 'Škoda', model: 'Octavia' },
  superb: { brand: 'Škoda', model: 'Superb' },
  karoq: { brand: 'Škoda', model: 'Karoq' },
  kodiaq: { brand: 'Škoda', model: 'Kodiaq' },
  rapid: { brand: 'Škoda', model: 'Rapid' },
  // Toyota
  yaris: { brand: 'Toyota', model: 'Yaris' },
  corolla: { brand: 'Toyota', model: 'Corolla' },
  camry: { brand: 'Toyota', model: 'Camry' },
  rav4: { brand: 'Toyota', model: 'RAV4' },
  avensis: { brand: 'Toyota', model: 'Avensis' },
  prius: { brand: 'Toyota', model: 'Prius' },
  supra: { brand: 'Toyota', model: 'Supra' },
  hilux: { brand: 'Toyota', model: 'Hilux' },
  // Honda
  civic: { brand: 'Honda', model: 'Civic' },
  jazz: { brand: 'Honda', model: 'Jazz' },
  accord: { brand: 'Honda', model: 'Accord' },
  // Hyundai
  tucson: { brand: 'Hyundai', model: 'Tucson' },
  i10: { brand: 'Hyundai', model: 'i10' },
  i20: { brand: 'Hyundai', model: 'i20' },
  i30: { brand: 'Hyundai', model: 'i30' },
  i40: { brand: 'Hyundai', model: 'i40' },
  kona: { brand: 'Hyundai', model: 'Kona' },
  // Kia
  picanto: { brand: 'Kia', model: 'Picanto' },
  rio: { brand: 'Kia', model: 'Rio' },
  ceed: { brand: 'Kia', model: 'Ceed' },
  sportage: { brand: 'Kia', model: 'Sportage' },
  sorento: { brand: 'Kia', model: 'Sorento' },
  niro: { brand: 'Kia', model: 'Niro' },
  // Nissan
  micra: { brand: 'Nissan', model: 'Micra' },
  juke: { brand: 'Nissan', model: 'Juke' },
  qashqai: { brand: 'Nissan', model: 'Qashqai' },
  leaf: { brand: 'Nissan', model: 'Leaf' },
  navara: { brand: 'Nissan', model: 'Navara' },
  // Peugeot — model numbers
  '208': { brand: 'Peugeot', model: '208' },
  '308': { brand: 'Peugeot', model: '308' },
  '508': { brand: 'Peugeot', model: '508' },
  '2008': { brand: 'Peugeot', model: '2008' },
  '3008': { brand: 'Peugeot', model: '3008' },
  '5008': { brand: 'Peugeot', model: '5008' },
  // Alfa Romeo
  giulietta: { brand: 'Alfa Romeo', model: 'Giulietta' },
  giulia: { brand: 'Alfa Romeo', model: 'Giulia' },
  stelvio: { brand: 'Alfa Romeo', model: 'Stelvio' },
  '147': { brand: 'Alfa Romeo', model: '147' },
  '156': { brand: 'Alfa Romeo', model: '156' },
  '159': { brand: 'Alfa Romeo', model: '159' },
  // Porsche
  cayenne: { brand: 'Porsche', model: 'Cayenne' },
  macan: { brand: 'Porsche', model: 'Macan' },
  panamera: { brand: 'Porsche', model: 'Panamera' },
  taycan: { brand: 'Porsche', model: 'Taycan' },
  boxster: { brand: 'Porsche', model: '718 Boxster' },
  cayman: { brand: 'Porsche', model: '718 Cayman' },
  // Mazda
  'mx-5': { brand: 'Mazda', model: 'MX-5' },
  mx5: { brand: 'Mazda', model: 'MX-5' },
  'cx-5': { brand: 'Mazda', model: 'CX-5' },
  cx5: { brand: 'Mazda', model: 'CX-5' },
  // Jeep
  wrangler: { brand: 'Jeep', model: 'Wrangler' },
  renegade: { brand: 'Jeep', model: 'Renegade' },
  compass: { brand: 'Jeep', model: 'Compass' },
  // Suzuki
  swift: { brand: 'Suzuki', model: 'Swift' },
  vitara: { brand: 'Suzuki', model: 'Vitara' },
  jimny: { brand: 'Suzuki', model: 'Jimny' },
  // Subaru
  impreza: { brand: 'Subaru', model: 'Impreza' },
  forester: { brand: 'Subaru', model: 'Forester' },
  outback: { brand: 'Subaru', model: 'Outback' },
  // Mitsubishi
  outlander: { brand: 'Mitsubishi', model: 'Outlander' },
  pajero: { brand: 'Mitsubishi', model: 'Pajero' },
  lancer: { brand: 'Mitsubishi', model: 'Lancer' },
  // Land Rover
  defender: { brand: 'Land Rover', model: 'Defender' },
  discovery: { brand: 'Land Rover', model: 'Discovery' },
  evoque: { brand: 'Land Rover', model: 'Range Rover Evoque' },
  // Volvo
  xc40: { brand: 'Volvo', model: 'XC40' },
  xc60: { brand: 'Volvo', model: 'XC60' },
  xc90: { brand: 'Volvo', model: 'XC90' },
  v40: { brand: 'Volvo', model: 'V40' },
  v60: { brand: 'Volvo', model: 'V60' },
  v90: { brand: 'Volvo', model: 'V90' },
  s60: { brand: 'Volvo', model: 'S60' },
  s90: { brand: 'Volvo', model: 'S90' },
};

// ── VW Golf "golf N" composite ──
const GOLF_GENERATIONS: Record<string, ChassisCodeEntry> = {
  '1': { brand: 'Volkswagen', model: 'Golf', generation: 'MK1', years: '1974-1983' },
  '2': { brand: 'Volkswagen', model: 'Golf', generation: 'MK2', years: '1983-1992' },
  '3': { brand: 'Volkswagen', model: 'Golf', generation: 'MK3', years: '1991-1999' },
  '4': { brand: 'Volkswagen', model: 'Golf', generation: 'MK4', years: '1997-2006' },
  '5': { brand: 'Volkswagen', model: 'Golf', generation: 'MK5', years: '2003-2009' },
  '6': { brand: 'Volkswagen', model: 'Golf', generation: 'MK6', years: '2008-2013' },
  '7': { brand: 'Volkswagen', model: 'Golf', generation: 'MK7', years: '2012-2020' },
  '8': { brand: 'Volkswagen', model: 'Golf', generation: 'MK8', years: '2019+' },
};

// ── BMW series by first digit of variant number ──
const BMW_SERIES_MAP: Record<string, string> = {
  '1': 'Serija 1', '2': 'Serija 2', '3': 'Serija 3', '4': 'Serija 4',
  '5': 'Serija 5', '6': 'Serija 6', '7': 'Serija 7', '8': 'Serija 8',
};

// ── Mercedes class prefixes ──
const MERC_CLASS_MAP: Record<string, string> = {
  a: 'A-Klasse', b: 'B-Klasse', c: 'C-Klasse', e: 'E-Klasse', s: 'S-Klasse',
  g: 'G-Klasse', v: 'V-Klasse',
  cla: 'CLA', cls: 'CLS', gla: 'GLA', glb: 'GLB', glc: 'GLC', gle: 'GLE', gls: 'GLS',
};

// ── Helpers ──────────────────────────────────────────────────

function resolveEntries(val: ChassisCodeEntry | ChassisCodeEntry[] | undefined): ChassisCodeEntry[] {
  if (!val) return [];
  return Array.isArray(val) ? val : [val];
}

function detectFuel(suffix: string): string | undefined {
  const s = suffix.toLowerCase();
  // Values must match FUEL_OPTIONS in upload/page.tsx: 'Dizel', 'Benzin', 'Hibrid', 'Električni'
  if (s === 'd' || s === 'tdi' || s === 'cdi' || s === 'hdi' || s === 'dci' || s === 'gtd' || s === 'bluehdi') return 'Dizel';
  if (s === 'i' || s === 'tsi' || s === 'tfsi' || s === 'gti' || s === 'mpi') return 'Benzin';
  if (s === 'e' || s === 'gte' || s === 'phev') return 'Hibrid';
  return undefined;
}

/** Parse a token like "530d" → { variant: '530', fuel: 'Diesel' } */
function parseVariantFuel(input: string): { variant: string; fuel?: string } | null {
  const trimmed = input.trim().toLowerCase();
  if (!trimmed) return null;

  // Pattern: optional class letters + digits + optional fuel suffix
  // e.g., "530d", "c220d", "320i", "e350", "gla200"
  const m = trimmed.match(/^([a-z]*)(\d+)(d|i|e|tdi|tsi|tfsi|cdi|hdi|dci|gti|gtd|gte|mpi|phev|bluehdi)?$/);
  if (!m) {
    // Check for standalone fuel keywords: "tdi", "diesel", "benzin"
    const fuel = detectFuel(trimmed);
    if (fuel) return { variant: '', fuel };
    return null;
  }

  const [, prefix, digits, fuelSuffix] = m;
  const variant = prefix ? `${prefix.toUpperCase()}${digits}` : digits;
  const fuel = fuelSuffix ? detectFuel(fuelSuffix) : undefined;
  return { variant, fuel };
}

// ── Main Lookup ─────────────────────────────────────────────

/**
 * Look up a user's search input against chassis codes and model shortcuts.
 * Returns all matches (could be >1 for ambiguous codes like B8).
 */
export function lookupChassis(input: string): ChassisLookupResult[] {
  const trimmed = input.trim().toLowerCase();
  if (!trimmed || trimmed.length < 2) return [];

  const tokens = trimmed.split(/\s+/);
  const first = tokens[0];
  const rest = tokens.slice(1).join(' ');

  // 1. Exact chassis code match on first token
  const codeEntries = resolveEntries(CHASSIS_CODES[first]);
  if (codeEntries.length > 0) {
    const vf = parseVariantFuel(rest);
    return codeEntries.map(e => ({
      brand: e.brand,
      model: e.model,
      generation: e.generation,
      years: e.years,
      ...(vf?.variant && { variant: vf.variant }),
      ...(vf?.fuel && { fuel: vf.fuel }),
    }));
  }

  // 1b. Brand name as first token — skip it and retry with remaining tokens
  //     Handles: "BMW F20 120d", "Mercedes W204 C220d", "VW Golf MK7 TDI"
  const BRAND_ALIASES: Record<string, string> = {
    bmw: 'BMW', mercedes: 'Mercedes-Benz', 'mercedes-benz': 'Mercedes-Benz', merc: 'Mercedes-Benz',
    vw: 'Volkswagen', volkswagen: 'Volkswagen', audi: 'Audi', opel: 'Opel', ford: 'Ford',
    toyota: 'Toyota', honda: 'Honda', nissan: 'Nissan', mazda: 'Mazda', hyundai: 'Hyundai',
    kia: 'Kia', fiat: 'Fiat', renault: 'Renault', peugeot: 'Peugeot', citroen: 'Citroën',
    skoda: 'Škoda', škoda: 'Škoda', volvo: 'Volvo', seat: 'SEAT', dacia: 'Dacia',
    porsche: 'Porsche', jaguar: 'Jaguar', 'land rover': 'Land Rover', suzuki: 'Suzuki',
    yamaha: 'Yamaha', kawasaki: 'Kawasaki', ducati: 'Ducati', harley: 'Harley-Davidson',
    alfa: 'Alfa Romeo', mini: 'MINI', smart: 'Smart', tesla: 'Tesla', subaru: 'Subaru',
    mitsubishi: 'Mitsubishi', lexus: 'Lexus', infiniti: 'Infiniti', chevrolet: 'Chevrolet',
  };
  const brandFromFirst = BRAND_ALIASES[first];
  if (brandFromFirst && tokens.length >= 2) {
    const subResult = lookupChassis(tokens.slice(1).join(' '));
    if (subResult.length > 0) {
      // If the chassis result brand matches or is compatible, use it
      return subResult.map(r => ({ ...r, brand: r.brand || brandFromFirst }));
    }
  }

  // 2. Model shortcut on first token (e.g., "a4", "golf", "corsa")
  const shortcutEntries = resolveEntries(MODEL_SHORTCUTS[first]);
  if (shortcutEntries.length > 0) {
    // Check if second token is a generation code for this brand
    const secondToken = tokens[1];
    if (secondToken) {
      const genEntries = resolveEntries(CHASSIS_CODES[secondToken]);
      const matchedGen = genEntries.find(g =>
        shortcutEntries.some(s => s.brand === g.brand && s.model === g.model)
      );
      if (matchedGen) {
        const vfRest = tokens.slice(2).join(' ');
        const vf = parseVariantFuel(vfRest);
        return [{
          brand: matchedGen.brand,
          model: matchedGen.model,
          generation: matchedGen.generation,
          years: matchedGen.years,
          ...(vf?.variant && { variant: vf.variant }),
          ...(vf?.fuel && { fuel: vf.fuel }),
        }];
      }
    }

    // "golf 7" → Golf MK7
    if (first === 'golf' && secondToken && GOLF_GENERATIONS[secondToken]) {
      const g = GOLF_GENERATIONS[secondToken];
      const vfRest = tokens.slice(2).join(' ');
      const vf = parseVariantFuel(vfRest);
      return [{
        brand: g.brand,
        model: g.model,
        generation: g.generation,
        years: g.years,
        ...(vf?.variant && { variant: vf.variant }),
        ...(vf?.fuel && { fuel: vf.fuel }),
      }];
    }

    // No generation, but check for variant/fuel in rest
    const vf = parseVariantFuel(rest);
    return shortcutEntries.map(e => ({
      brand: e.brand,
      model: e.model,
      generation: e.generation,
      years: e.years,
      ...(vf?.variant && { variant: vf.variant }),
      ...(vf?.fuel && { fuel: vf.fuel }),
    }));
  }

  // 3. BMW variant pattern: "320d", "530i", "118d" (3 digits + fuel suffix)
  const bmwMatch = trimmed.match(/^(\d)(1[0-9]|2[0-9]|3[0-9]|4[0-9]|5[0-9])(d|i|e)?$/);
  if (bmwMatch) {
    const series = BMW_SERIES_MAP[bmwMatch[1]];
    if (series) {
      const variant = bmwMatch[1] + bmwMatch[2];
      const fuel = bmwMatch[3] ? detectFuel(bmwMatch[3]) : undefined;
      return [{ brand: 'BMW', model: series, variant, fuel }];
    }
  }

  // 4. Mercedes class+number: "c220d", "e350", "s500", "gla200", "glc300d"
  const mercMatch = trimmed.match(/^(gls|gle|glc|glb|gla|cls|cla|[abcegsvx])(\d{2,3})(d|e|cdi)?$/);
  if (mercMatch) {
    const classModel = MERC_CLASS_MAP[mercMatch[1]];
    if (classModel) {
      const variantPrefix = mercMatch[1].length === 1 ? mercMatch[1].toUpperCase() : mercMatch[1].toUpperCase();
      const variant = `${variantPrefix}${mercMatch[2]}`;
      const fuel = mercMatch[3] ? detectFuel(mercMatch[3]) : undefined;
      return [{ brand: 'Mercedes-Benz', model: classModel, variant, fuel }];
    }
  }

  return [];
}

/** Build a display label for a chassis lookup result */
export function chassisLabel(r: ChassisLookupResult): string {
  let label = `${r.brand} ${r.model}`;
  if (r.variant) label += ` ${r.variant}`;
  if (r.fuel) label += ` (${r.fuel})`;
  if (r.generation) label += ` — ${r.generation}`;
  if (r.years) label += ` ${r.years}`;
  return label;
}

// ── Common model name aliases (for tag enrichment) ──────────
const MODEL_ALIASES: Record<string, string[]> = {
  'Serija 1': ['1er', '1 series', 'einser'],
  'Serija 2': ['2er', '2 series'],
  'Serija 3': ['3er', '3 series', 'dreier'],
  'Serija 4': ['4er', '4 series'],
  'Serija 5': ['5er', '5 series', 'fünfer'],
  'Serija 6': ['6er', '6 series'],
  'Serija 7': ['7er', '7 series'],
  'Serija 8': ['8er', '8 series'],
  'A-Klasse': ['a klasa', 'a class'],
  'B-Klasse': ['b klasa', 'b class'],
  'C-Klasse': ['c klasa', 'c class', 'c klasse'],
  'E-Klasse': ['e klasa', 'e class', 'e klasse'],
  'S-Klasse': ['s klasa', 's class', 's klasse'],
  'GLA-Klasse': ['gla klasa', 'gla'],
  'GLB-Klasse': ['glb klasa', 'glb'],
  'GLC-Klasse': ['glc klasa', 'glc'],
  'GLE-Klasse': ['gle klasa', 'gle'],
  'GLS-Klasse': ['gls klasa', 'gls'],
  'G-Klasse': ['g klasa', 'g class', 'g wagon', 'g wagen'],
  'Golf': ['golf'],
  'Passat': ['passat'],
  'Polo': ['polo'],
  'Tiguan': ['tiguan'],
};

// Fuel aliases for tag enrichment
const FUEL_ALIASES: Record<string, string[]> = {
  'Dizel': ['diesel', 'dizel', 'tdi', 'cdi'],
  'Benzin': ['benzin', 'petrol', 'gasoline', 'tsi', 'tfsi'],
  'Hibrid': ['hybrid', 'hibrid'],
  'Električni': ['elektricni', 'electric', 'ev'],
  'Plug-in Hibrid': ['plug-in hybrid', 'phev', 'plug-in hibrid'],
  'LPG/CNG': ['lpg', 'cng', 'gas'],
};

/**
 * Generate comprehensive search tags for a vehicle based on chassis code lookup.
 * Used during upload to enrich the product's tags in the database,
 * so searches for "f30", "3er", "e90" etc. all find relevant products.
 *
 * @param userInput  The raw text the user typed (e.g. "e90 330d")
 * @param match      The resolved ChassisLookupResult
 * @returns          Array of lowercase tags for the product's `tags` column
 */
export function generateVehicleTags(
  userInput: string,
  match: ChassisLookupResult
): string[] {
  const tags = new Set<string>();

  // 1. Original user input tokens (e.g. "e90", "330d")
  for (const token of userInput.trim().toLowerCase().split(/\s+/)) {
    if (token.length >= 2) tags.add(token);
  }

  // 2. Brand (lowercase)
  tags.add(match.brand.toLowerCase());

  // 3. Model name + aliases
  tags.add(match.model.toLowerCase());
  const aliases = MODEL_ALIASES[match.model];
  if (aliases) {
    for (const alias of aliases) tags.add(alias);
  }

  // 4. Combination: "brand model" (e.g. "bmw serija 3")
  tags.add(`${match.brand.toLowerCase()} ${match.model.toLowerCase()}`);

  // 5. Generation (e.g. "e90", "f30")
  if (match.generation) {
    tags.add(match.generation.toLowerCase());
  }

  // 6. ALL chassis codes that map to the same brand+model
  //    e.g. for Serija 3: e21, e30, e36, e46, e90, e91, e92, e93, f30, f31, f34, g20, g21
  for (const [code, entry] of Object.entries(CHASSIS_CODES)) {
    const entries = resolveEntries(entry);
    for (const e of entries) {
      if (e.brand === match.brand && e.model === match.model) {
        tags.add(code);
        if (e.generation) tags.add(e.generation.toLowerCase());
      }
    }
  }

  // 7. Model shortcuts that map to this brand+model
  for (const [shortcut, entry] of Object.entries(MODEL_SHORTCUTS)) {
    const entries = resolveEntries(entry);
    for (const e of entries) {
      if (e.brand === match.brand && e.model === match.model) {
        tags.add(shortcut);
      }
    }
  }

  // 8. Variant (e.g. "330", "c220")
  if (match.variant) {
    tags.add(match.variant.toLowerCase());
    // Also "variant + fuel suffix" (e.g. "330d", "c220d")
    if (match.fuel === 'Dizel') tags.add(`${match.variant.toLowerCase()}d`);
    if (match.fuel === 'Benzin') tags.add(`${match.variant.toLowerCase()}i`);
  }

  // 9. Fuel + aliases
  if (match.fuel) {
    tags.add(match.fuel.toLowerCase());
    const fuelAliases = FUEL_ALIASES[match.fuel];
    if (fuelAliases) {
      for (const fa of fuelAliases) tags.add(fa);
    }
  }

  // 10. "vozilo" / "auto" generic tags
  tags.add('vozilo');
  tags.add('auto');
  tags.add('automobil');

  return [...tags];
}
