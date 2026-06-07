export const MOROCCAN_CITIES = [
  "Agadir","Al Hoceïma","Azrou","Beni Mellal","Berkane",
  "Berrechid","Boulemane","Casablanca","Dakhla","El Jadida",
  "Errachidia","Essaouira","Fès","Guelmim","Ifrane",
  "Kénitra","Khémisset","Khénifra","Khouribga","Ksar El Kébir",
  "Laâyoune","Larache","Marrakech","Meknès","Midelt",
  "Mohammédia","Nador","Ouarzazate","Oujda","Rabat",
  "Safi","Settat","Sidi Kacem","Sidi Slimane","Tanger",
  "Taza","Tétouan","Tiznit","Youssoufia"
]

export const MOROCCAN_LEVELS = [
  "1ère Bac","2ème Bac",
  "BTS 1ère année","BTS 2ème année",
  "CPGE 1ère année","CPGE 2ème année",
  "Licence 1","Licence 2","Licence 3",
  "Master 1","Master 2",
  "OFPPT","Autre"
]

export const FILIERES_BY_NIVEAU = {
  bac: {
    label: "Filière au lycée",
    options: [
      "Sciences Mathématiques A","Sciences Mathématiques B",
      "Sciences Physiques","Sciences de la Vie et de la Terre (SVT)",
      "Sciences Agronomiques","Sciences Économiques et Gestion",
      "Lettres et Sciences Humaines","Arts Appliqués",
      "Enseignement Original","Autre"
    ]
  },
  bts: {
    label: "Filière BTS",
    options: [
      "BTS Développement d'Applications Informatiques (DAI)",
      "BTS Gestion des Entreprises (GE)",
      "BTS Commerce International (CI)",
      "BTS Finance Comptabilité (FC)",
      "BTS Réseaux Informatiques et Systèmes",
      "BTS Design Graphique et Multimédia",
      "BTS Électronique et Automatismes",
      "BTS Génie Civil et Construction",
      "BTS Hôtellerie et Tourisme",
      "BTS Transport et Logistique",
      "Autre BTS"
    ]
  },
  cpge: {
    label: "Filière CPGE",
    options: [
      "CPGE MP (Mathématiques Physique)","CPGE MP*",
      "CPGE PC (Physique Chimie)","CPGE PC*",
      "CPGE PSI (Physique Sciences Industrielles)",
      "CPGE TSI (Technologie Sciences Industrielles)",
      "CPGE TB (Technologie Biologie)",
      "CPGE ECT (Économie Commerce Technologie)",
      "CPGE HEC (Économie Gestion)","Autre CPGE"
    ]
  },
  licence: {
    label: "Filière / Spécialité",
    options: [
      "Informatique","Mathématiques","Physique","Chimie",
      "Sciences de la Vie","Sciences de la Terre",
      "Droit Privé","Droit Public","Sciences Politiques",
      "Économie","Gestion","Finance",
      "Lettres Arabes","Lettres Françaises","Anglais","Espagnol",
      "Histoire","Géographie","Sociologie","Philosophie",
      "Ingénierie Informatique","Génie Civil","Génie Électrique",
      "Architecture","Médecine","Pharmacie","Autre"
    ]
  },
  ofppt: {
    label: "Spécialité OFPPT / Formation Pro",
    options: [
      "Technicien Spécialisé en Développement Digital",
      "Technicien Spécialisé en Administration des Systèmes et Réseaux",
      "Technicien en Électricité Bâtiment",
      "Technicien en Mécanique Auto",
      "Technicien Spécialisé en Comptabilité",
      "Technicien Spécialisé en Commerce",
      "Technicien Spécialisé en Tourisme et Hôtellerie",
      "Autre Formation Professionnelle"
    ]
  }
}

export function getFiliereGroup(niveau) {
  if (!niveau) return null
  const n = niveau.toLowerCase()
  if (n.includes('bac'))                             return 'bac'
  if (n.includes('bts'))                             return 'bts'
  if (n.includes('cpge'))                            return 'cpge'
  if (n.includes('licence') || n.includes('master')) return 'licence'
  if (n.includes('ofppt'))                           return 'ofppt'
  return null
}

export const SCHOOLS_BY_CITY = {
  "Casablanca": [
    { name: "Lycée Oued Eddahab",                  type: "public",  niveau: ["bac"] },
    { name: "Lycée Moulay Youssef",                type: "public",  niveau: ["bac"] },
    { name: "Lycée Ibn Yassine",                   type: "public",  niveau: ["bac"] },
    { name: "Lycée Al Khawarizmi",                 type: "public",  niveau: ["bac"] },
    { name: "Lycée Reda Slaoui",                   type: "public",  niveau: ["bac"] },
    { name: "Lycée Ibn Khaldoun Casablanca",       type: "public",  niveau: ["bac"] },
    { name: "Lycée Technique de Casablanca",       type: "public",  niveau: ["bac"] },
    { name: "Lycée Hassan II Casablanca",          type: "public",  niveau: ["bac"] },
    { name: "Lycée Ain Sebaâ",                     type: "public",  niveau: ["bac"] },
    { name: "Lycée Sidi Bernoussi",                type: "public",  niveau: ["bac"] },
    { name: "Lycée Al Majd",                       type: "public",  niveau: ["bac"] },
    { name: "Lycée Al Amal Casablanca",            type: "public",  niveau: ["bac"] },
    { name: "Lycée Lyautey (Mission Française)",   type: "private", niveau: ["bac"] },
    { name: "Lycée Français de Casablanca",        type: "private", niveau: ["bac"] },
    { name: "American School of Casablanca",       type: "private", niveau: ["bac"] },
    { name: "Groupe Scolaire Les Orangers",        type: "private", niveau: ["bac"] },
    { name: "OFPPT Casablanca — BTS",              type: "public",  niveau: ["bts"] },
    { name: "ISGA Casablanca",                     type: "private", niveau: ["bts"] },
    { name: "Institut Supérieur de Commerce",      type: "private", niveau: ["bts"] },
    { name: "HEM Business School",                 type: "private", niveau: ["bts", "licence"] },
    { name: "Lycée Moulay Youssef — CPGE",         type: "public",  niveau: ["cpge"] },
    { name: "Lycée Hassan II — CPGE",              type: "public",  niveau: ["cpge"] },
    { name: "Université Hassan II — FS Aïn Chock", type: "public",  niveau: ["licence"] },
    { name: "Université Hassan II — FSJES",        type: "public",  niveau: ["licence"] },
    { name: "ENSEM Casablanca",                    type: "public",  niveau: ["licence"] },
    { name: "EHTP Casablanca",                     type: "public",  niveau: ["licence"] },
    { name: "ENCG Casablanca",                     type: "public",  niveau: ["licence"] },
    { name: "ESCA École de Management",            type: "private", niveau: ["licence"] },
    { name: "ISCAE Casablanca",                    type: "private", niveau: ["licence"] },
    { name: "OFPPT Casablanca",                    type: "public",  niveau: ["ofppt"] },
  ],

  "Rabat": [
    { name: "Lycée Hassan II Rabat",               type: "public",  niveau: ["bac"] },
    { name: "Lycée Mohammed V Rabat",              type: "public",  niveau: ["bac"] },
    { name: "Lycée Al Mansour Rabat",              type: "public",  niveau: ["bac"] },
    { name: "Lycée Ibn Sina Rabat",                type: "public",  niveau: ["bac"] },
    { name: "Lycée Technique Rabat",               type: "public",  niveau: ["bac"] },
    { name: "Lycée Descartes (Mission Française)", type: "private", niveau: ["bac"] },
    { name: "Lycée Moulay Youssef — CPGE",         type: "public",  niveau: ["cpge"] },
    { name: "ENSIAS",                              type: "public",  niveau: ["licence"] },
    { name: "EMI (École Mohammadia d'Ingénieurs)", type: "public",  niveau: ["licence"] },
    { name: "ENSET Rabat",                         type: "public",  niveau: ["licence"] },
    { name: "INPT Rabat",                          type: "public",  niveau: ["licence"] },
    { name: "Université Mohammed V — FSR",         type: "public",  niveau: ["licence"] },
    { name: "ENCG Rabat",                          type: "public",  niveau: ["licence"] },
    { name: "ISCAE Rabat",                         type: "private", niveau: ["licence"] },
    { name: "ESITH Rabat",                         type: "private", niveau: ["licence"] },
    { name: "OFPPT Rabat",                         type: "public",  niveau: ["ofppt", "bts"] },
  ],

  "Marrakech": [
    { name: "Lycée Al Mansour Marrakech",          type: "public",  niveau: ["bac"] },
    { name: "Lycée Ibn Tofaïl Marrakech",          type: "public",  niveau: ["bac"] },
    { name: "Lycée Youssef Ibn Tachfine",          type: "public",  niveau: ["bac"] },
    { name: "Lycée Al Khawarizmi Marrakech",       type: "public",  niveau: ["bac"] },
    { name: "Lycée Victor Hugo Marrakech",         type: "private", niveau: ["bac"] },
    { name: "American School of Marrakech",        type: "private", niveau: ["bac"] },
    { name: "Université Cadi Ayyad — Semlalia",    type: "public",  niveau: ["licence"] },
    { name: "ENSA Marrakech",                      type: "public",  niveau: ["licence"] },
    { name: "ENCG Marrakech",                      type: "public",  niveau: ["licence"] },
    { name: "EST Marrakech",                       type: "public",  niveau: ["bts", "licence"] },
    { name: "OFPPT Marrakech",                     type: "public",  niveau: ["ofppt", "bts"] },
  ],

  "Fès": [
    { name: "Lycée Moulay Idriss Fès",             type: "public",  niveau: ["bac"] },
    { name: "Lycée Mohammed V Fès",                type: "public",  niveau: ["bac"] },
    { name: "Lycée Ibn Al Khatib",                 type: "public",  niveau: ["bac"] },
    { name: "Lycée Technique Fès",                 type: "public",  niveau: ["bac"] },
    { name: "Lycée Français de Fès",               type: "private", niveau: ["bac"] },
    { name: "Université SMBA — FS Fès",            type: "public",  niveau: ["licence"] },
    { name: "ENSA Fès",                            type: "public",  niveau: ["licence"] },
    { name: "ENCG Fès",                            type: "public",  niveau: ["licence"] },
    { name: "ENSMR Fès",                           type: "public",  niveau: ["licence"] },
    { name: "ENFI Fès",                            type: "public",  niveau: ["licence"] },
    { name: "OFPPT Fès",                           type: "public",  niveau: ["ofppt", "bts"] },
  ],

  "Tanger": [
    { name: "Lycée Razi Tanger",                   type: "public",  niveau: ["bac"] },
    { name: "Lycée Ibn Khaldoun Tanger",           type: "public",  niveau: ["bac"] },
    { name: "Lycée Mohammed V Tanger",             type: "public",  niveau: ["bac"] },
    { name: "Lycée Al Amal Tanger",                type: "public",  niveau: ["bac"] },
    { name: "American School of Tanger",           type: "private", niveau: ["bac"] },
    { name: "Lycée Français de Tanger",            type: "private", niveau: ["bac"] },
    { name: "Université Abdelmalek Essaâdi",       type: "public",  niveau: ["licence"] },
    { name: "ENSA Tanger",                         type: "public",  niveau: ["licence"] },
    { name: "ENCG Tanger",                         type: "public",  niveau: ["licence"] },
    { name: "EST Tanger",                          type: "public",  niveau: ["bts", "licence"] },
    { name: "OFPPT Tanger",                        type: "public",  niveau: ["ofppt", "bts"] },
  ],

  "Agadir": [
    { name: "Lycée Mohammed V Agadir",             type: "public",  niveau: ["bac"] },
    { name: "Lycée Ibn Zohr Agadir",               type: "public",  niveau: ["bac"] },
    { name: "Lycée Al Massira Agadir",             type: "public",  niveau: ["bac"] },
    { name: "Lycée Français d'Agadir",             type: "private", niveau: ["bac"] },
    { name: "Université Ibn Zohr — FS Agadir",     type: "public",  niveau: ["licence"] },
    { name: "ENSA Agadir",                         type: "public",  niveau: ["licence"] },
    { name: "ENCG Agadir",                         type: "public",  niveau: ["licence"] },
    { name: "EST Agadir",                          type: "public",  niveau: ["bts", "licence"] },
    { name: "OFPPT Agadir",                        type: "public",  niveau: ["ofppt", "bts"] },
  ],

  "Meknès": [
    { name: "Lycée Moulay Ismail Meknès",          type: "public",  niveau: ["bac"] },
    { name: "Lycée Zitoun Meknès",                 type: "public",  niveau: ["bac"] },
    { name: "Lycée Al Hansali",                    type: "public",  niveau: ["bac"] },
    { name: "Université Moulay Ismail — FS",       type: "public",  niveau: ["licence"] },
    { name: "ENSAM Meknès",                        type: "public",  niveau: ["licence"] },
    { name: "ENCG Meknès",                         type: "public",  niveau: ["licence"] },
    { name: "ENSA Meknès",                         type: "public",  niveau: ["licence"] },
    { name: "OFPPT Meknès",                        type: "public",  niveau: ["ofppt", "bts"] },
  ],

  "Oujda": [
    { name: "Lycée Al Massira Oujda",              type: "public",  niveau: ["bac"] },
    { name: "Lycée Ibn Khaldoun Oujda",            type: "public",  niveau: ["bac"] },
    { name: "Lycée Mohammed V Oujda",              type: "public",  niveau: ["bac"] },
    { name: "Université Mohammed Premier — FS",    type: "public",  niveau: ["licence"] },
    { name: "ENCG Oujda",                          type: "public",  niveau: ["licence"] },
    { name: "ENSA Oujda",                          type: "public",  niveau: ["licence"] },
    { name: "OFPPT Oujda",                         type: "public",  niveau: ["ofppt", "bts"] },
  ],

  "Kénitra": [
    { name: "Lycée Al Qods Kénitra",               type: "public",  niveau: ["bac"] },
    { name: "Lycée Tariq Ibn Ziad Kénitra",        type: "public",  niveau: ["bac"] },
    { name: "Université Ibn Tofaïl — FS",          type: "public",  niveau: ["licence"] },
    { name: "ENCG Kénitra",                        type: "public",  niveau: ["licence"] },
    { name: "EST Kénitra",                         type: "public",  niveau: ["bts", "licence"] },
    { name: "OFPPT Kénitra",                       type: "public",  niveau: ["ofppt", "bts"] },
  ],

  "Tétouan": [
    { name: "Lycée Ibn Khaldoun Tétouan",          type: "public",  niveau: ["bac"] },
    { name: "Lycée Al Qods Tétouan",               type: "public",  niveau: ["bac"] },
    { name: "Université Abdelmalek Essaâdi Tétouan", type: "public", niveau: ["licence"] },
    { name: "ENSA Tétouan",                        type: "public",  niveau: ["licence"] },
    { name: "ESAV Tétouan",                        type: "public",  niveau: ["licence"] },
    { name: "OFPPT Tétouan",                       type: "public",  niveau: ["ofppt", "bts"] },
  ],

  "Beni Mellal": [
    { name: "Lycée Hassan II Beni Mellal",         type: "public",  niveau: ["bac"] },
    { name: "Université Sultan Moulay Slimane",    type: "public",  niveau: ["licence"] },
    { name: "ENCG Beni Mellal",                    type: "public",  niveau: ["licence"] },
    { name: "EST Beni Mellal",                     type: "public",  niveau: ["bts", "licence"] },
    { name: "OFPPT Beni Mellal",                   type: "public",  niveau: ["ofppt", "bts"] },
  ],

  "El Jadida": [
    { name: "Lycée Sidi Mohammed Ben Abdellah",    type: "public",  niveau: ["bac"] },
    { name: "Université Chouaïb Doukkali — FS",    type: "public",  niveau: ["licence"] },
    { name: "ENCG El Jadida",                      type: "public",  niveau: ["licence"] },
    { name: "EST El Jadida",                       type: "public",  niveau: ["bts", "licence"] },
    { name: "OFPPT El Jadida",                     type: "public",  niveau: ["ofppt", "bts"] },
  ],

  "Mohammédia": [
    { name: "Lycée Al Khawarizmi Mohammédia",      type: "public",  niveau: ["bac"] },
    { name: "Lycée Abdelmoumen Mohammédia",        type: "public",  niveau: ["bac"] },
    { name: "ENSET Mohammédia",                    type: "public",  niveau: ["licence"] },
    { name: "OFPPT Mohammédia",                    type: "public",  niveau: ["ofppt", "bts"] },
  ],

  "Settat": [
    { name: "Lycée Al Massira Settat",             type: "public",  niveau: ["bac"] },
    { name: "Lycée Mohammed V Settat",             type: "public",  niveau: ["bac"] },
    { name: "Université Hassan I — FS Settat",     type: "public",  niveau: ["licence"] },
    { name: "ENCG Settat",                         type: "public",  niveau: ["licence"] },
    { name: "OFPPT Settat",                        type: "public",  niveau: ["ofppt", "bts"] },
  ],

  "Khouribga": [
    { name: "Lycée Technique Khouribga",           type: "public",  niveau: ["bac"] },
    { name: "Lycée Ibn Sina Khouribga",            type: "public",  niveau: ["bac"] },
    { name: "EST Khouribga",                       type: "public",  niveau: ["bts", "licence"] },
    { name: "OFPPT Khouribga",                     type: "public",  niveau: ["ofppt", "bts"] },
  ],

  "Nador": [
    { name: "Lycée Mohammed V Nador",              type: "public",  niveau: ["bac"] },
    { name: "Lycée Al Amal Nador",                 type: "public",  niveau: ["bac"] },
    { name: "Université Mohammed I — Nador",       type: "public",  niveau: ["licence"] },
    { name: "OFPPT Nador",                         type: "public",  niveau: ["ofppt", "bts"] },
  ],

  "Errachidia": [
    { name: "Lycée Moulay Ali Cherif",             type: "public",  niveau: ["bac"] },
    { name: "Lycée Al Massira Errachidia",         type: "public",  niveau: ["bac"] },
    { name: "EST Errachidia",                      type: "public",  niveau: ["bts", "licence"] },
    { name: "OFPPT Errachidia",                    type: "public",  niveau: ["ofppt", "bts"] },
  ],

  "Laâyoune": [
    { name: "Lycée Moulay Rachid Laâyoune",        type: "public",  niveau: ["bac"] },
    { name: "Lycée Al Massira Laâyoune",           type: "public",  niveau: ["bac"] },
    { name: "Université Ibn Zohr — Laâyoune",      type: "public",  niveau: ["licence"] },
    { name: "OFPPT Laâyoune",                      type: "public",  niveau: ["ofppt", "bts"] },
  ],

  "Ouarzazate": [
    { name: "Lycée Taourirt Ouarzazate",           type: "public",  niveau: ["bac"] },
    { name: "Lycée Al Massira Ouarzazate",         type: "public",  niveau: ["bac"] },
    { name: "EST Ouarzazate",                      type: "public",  niveau: ["bts", "licence"] },
    { name: "OFPPT Ouarzazate",                    type: "public",  niveau: ["ofppt", "bts"] },
  ],

  "Larache": [
    { name: "Lycée Ibn Khaldoun Larache",          type: "public",  niveau: ["bac"] },
    { name: "Lycée Al Qods Larache",               type: "public",  niveau: ["bac"] },
    { name: "OFPPT Larache",                       type: "public",  niveau: ["ofppt", "bts"] },
  ],

  "Berkane": [
    { name: "Lycée Mohammed V Berkane",            type: "public",  niveau: ["bac"] },
    { name: "Lycée Al Amal Berkane",               type: "public",  niveau: ["bac"] },
    { name: "OFPPT Berkane",                       type: "public",  niveau: ["ofppt", "bts"] },
  ],

  "Taza": [
    { name: "Lycée Al Massira Taza",               type: "public",  iveau: ["bac"] },
    { name: "Lycée Ibn Khaldoun Taza",             type: "public",  niveau: ["bac"] },
    { name: "EST Taza",                            type: "public",  niveau: ["bts", "licence"] },
    { name: "OFPPT Taza",                          type: "public",  niveau: ["ofppt", "bts"] },
  ],

  "Safi": [
    { name: "Lycée Ibn Khaldoun Safi",             type: "public",  niveau: ["bac"] },
    { name: "Lycée Al Massira Safi",               type: "public",  niveau: ["bac"] },
    { name: "Université Cadi Ayyad — Safi",        type: "public",  niveau: ["licence"] },
    { name: "EST Safi",                            type: "public",  niveau: ["bts", "licence"] },
    { name: "OFPPT Safi",                          type: "public",  niveau: ["ofppt", "bts"] },
  ],

  "Essaouira": [
    { name: "Lycée Moulay Hassan Essaouira",       type: "public",  niveau: ["bac"] },
    { name: "Lycée Al Amal Essaouira",             type: "public",  niveau: ["bac"] },
    { name: "OFPPT Essaouira",                     type: "public",  niveau: ["ofppt", "bts"] },
  ],

  "Guelmim": [
    { name: "Lycée Al Massira Guelmim",            type: "public",  niveau: ["bac"] },
    { name: "Université Ibn Zohr — Guelmim",       type: "public",  niveau: ["licence"] },
    { name: "OFPPT Guelmim",                       type: "public",  niveau: ["ofppt", "bts"] },
  ],

  "Tiznit": [
    { name: "Lycée Al Amal Tiznit",                type: "public",  niveau: ["bac"] },
    { name: "OFPPT Tiznit",                        type: "public",  niveau: ["ofppt", "bts"] },
  ],

  "Ifrane": [
    { name: "Lycée Al Qalam Ifrane",               type: "public",  niveau: ["bac"] },
    { name: "Al Akhawayn University",              type: "private", niveau: ["licence"] },
    { name: "OFPPT Ifrane",                        type: "public",  niveau: ["ofppt", "bts"] },
  ],

  "Dakhla": [
    { name: "Lycée Al Massira Dakhla",             type: "public",  niveau: ["bac"] },
    { name: "OFPPT Dakhla",                        type: "public",  niveau: ["ofppt", "bts"] },
  ],

  "Khémisset": [
    { name: "Lycée Al Massira Khémisset",          type: "public",  niveau: ["bac"] },
    { name: "OFPPT Khémisset",                     type: "public",  niveau: ["ofppt", "bts"] },
  ],

  "Khénifra": [
    { name: "Lycée Al Amal Khénifra",              type: "public",  niveau: ["bac"] },
    { name: "OFPPT Khénifra",                      type: "public",  niveau: ["ofppt", "bts"] },
  ],

  "Midelt": [
    { name: "Lycée Al Massira Midelt",             type: "public",  niveau: ["bac"] },
    { name: "OFPPT Midelt",                        type: "public",  niveau: ["ofppt", "bts"] },
  ],

  "Ksar El Kébir": [
    { name: "Lycée Mohammed V Ksar El Kébir",      type: "public",  niveau: ["bac"] },
    { name: "OFPPT Ksar El Kébir",                 type: "public",  niveau: ["ofppt", "bts"] },
  ],

  "Sidi Kacem": [
    { name: "Lycée Al Amal Sidi Kacem",            type: "public",  niveau: ["bac"] },
    { name: "OFPPT Sidi Kacem",                    type: "public",  niveau: ["ofppt", "bts"] },
  ],

  "Sidi Slimane": [
    { name: "Lycée Al Massira Sidi Slimane",       type: "public",  niveau: ["bac"] },
    { name: "OFPPT Sidi Slimane",                  type: "public",  niveau: ["ofppt", "bts"] },
  ],

  "Berrechid": [
    { name: "Lycée Al Khawarizmi Berrechid",       type: "public",  niveau: ["bac"] },
    { name: "OFPPT Berrechid",                     type: "public",  niveau: ["ofppt", "bts"] },
  ],

  "Boulemane": [
    { name: "Lycée Al Massira Boulemane",          type: "public",  niveau: ["bac"] },
    { name: "OFPPT Boulemane",                     type: "public",  niveau: ["ofppt"] },
  ],

  "Al Hoceïma": [
    { name: "Lycée Mohammed V Al Hoceïma",         type: "public",  niveau: ["bac"] },
    { name: "Lycée Al Amal Al Hoceïma",            type: "public",  niveau: ["bac"] },
    { name: "OFPPT Al Hoceïma",                    type: "public",  niveau: ["ofppt", "bts"] },
  ],

  "Azrou": [
    { name: "Lycée Al Massira Azrou",              type: "public",  niveau: ["bac"] },
    { name: "OFPPT Azrou",                         type: "public",  niveau: ["ofppt"] },
  ],

  "Youssoufia": [
    { name: "Lycée Al Massira Youssoufia",         type: "public",  niveau: ["bac"] },
    { name: "OFPPT Youssoufia",                    type: "public",  niveau: ["ofppt"] },
  ],
}