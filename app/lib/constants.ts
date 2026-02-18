// Application Constants

export const BUILDING_INFO = {
  name: 'Syndic Al Atlas',
  address: 'Fès, Maroc',
  totalOffices: 37,
  year: 2025,
};

export const MONTHS = [
  'JANVIER',
  'FÉVRIER',
  'MARS',
  'AVRIL',
  'MAI',
  'JUIN',
  'JUILLET',
  'AOÛT',
  'SEPTEMBRE',
  'OCTOBRE',
  'NOVEMBRE',
  'DÉCEMBRE',
];

export const FRENCH_MONTHS = [
  'Janvier',
  'Février',
  'Mars',
  'Avril',
  'Mai',
  'Juin',
  'Juillet',
  'Août',
  'Septembre',
  'Octobre',
  'Novembre',
  'Décembre',
];

export const PAYMENT_STATUSES = [
  'Payé',
  'Non payé',
  'En cours',
  'Partiel',
] as const;

export const EXPENSE_CATEGORIES = [
  'Concierge',
  'Électricité & Eau',
  'Ascenseur',
  'Fournitures & Ménage',
  'Autres',
] as const;

export const FOURNISSEURS = [
  'Ahmed',
  'RADEEF',
  'OTIS',
  'Abdellatif',
  'Hafid',
  'Notaire',
  'Électricien',
  'Plombier',
];

export const BUREAU_LOCATAIRES: Record<number, string> = {
  1: 'BOUCHHAR',
  2: 'DENTISTE',
  3: 'PHARMACIE',
  4: 'BOUTIQUE',
  5: 'BUREAU',
  6: 'ATELIER',
  7: 'SALON',
  8: 'CABINET',
  9: 'STUDIO',
  10: 'GALERIE',
  11: 'COMMERCE',
  12: 'OFFICE',
  13: 'MAGASIN',
  14: 'BUREAU',
  15: 'ESPACE',
  16: 'LOCAL',
  17: 'BOUTIQUE',
  18: 'SALON',
  19: 'BUREAU',
  20: 'CABINET',
  21: 'ATELIER',
  22: 'STUDIO',
  23: 'OFFICE',
  24: 'COMMERCE',
  25: 'MAGASIN',
  26: 'GALERIE',
  27: 'SPACE',
  28: 'BUREAU',
  29: 'CABINET',
  30: 'SALON',
  31: 'BOUTIQUE',
  32: 'OFFICE',
  33: 'ATELIER',
  34: 'STUDIO',
  35: 'COMMERCE',
  36: 'BUREAU',
  37: 'CABINET',
};

// Monthly amount defaults
export const MONTHLY_AMOUNT_DEFAULT = {
  janFebMar: 200,
  aprToSep: 250,
  octNov: 200,
  dec: 250,
};

// Navigation items
export const NAV_ITEMS = [
  { label: 'Accueil', href: '/', icon: 'Home' },
  { label: 'Revenus', href: '/revenus', icon: 'DollarSign' },
  { label: 'Impayés', href: '/impayes', icon: 'AlertCircle' },
  { label: 'Charges', href: '/charges', icon: 'Zap' },
  { label: 'État Journalier', href: '/journal', icon: 'Book' },
  { label: 'Bilan', href: '/bilan', icon: 'BarChart3' },
  { label: 'Paramètres', href: '/parametres', icon: 'Settings' },
];

export const DELAY_THRESHOLDS = {
  critical: 60, // >60 days = red
  warning: 30, // 30-60 days = orange
  // <30 days = yellow
};
