import type { Office, Tenant, Payment, Expense } from '../types';

export const mockOffices: Office[] = [
  {
    id: 'off-001',
    number: 'A101',
    floor: 1,
    type: 'individual',
    surface: 25,
    monthlyRent: 5000,
    charges: 500,
    status: 'occupied',
    hasAC: true,
    hasHeating: true,
    internetAccess: true,
    furnished: true,
    tenantId: 'ten-001'
  },
  {
    id: 'off-002',
    number: 'A102',
    floor: 1,
    type: 'individual',
    surface: 30,
    monthlyRent: 6000,
    charges: 600,
    status: 'occupied',
    hasAC: true,
    hasHeating: true,
    internetAccess: true,
    furnished: false,
    tenantId: 'ten-002'
  },
  {
    id: 'off-003',
    number: 'A103',
    floor: 1,
    type: 'open-space',
    surface: 80,
    monthlyRent: 12000,
    charges: 1200,
    status: 'occupied',
    hasAC: true,
    hasHeating: true,
    internetAccess: true,
    furnished: true,
    tenantId: 'ten-003'
  },
  {
    id: 'off-004',
    number: 'B201',
    floor: 2,
    type: 'individual',
    surface: 20,
    monthlyRent: 4500,
    charges: 450,
    status: 'available',
    hasAC: true,
    hasHeating: false,
    internetAccess: true,
    furnished: false
  },
  {
    id: 'off-005',
    number: 'B202',
    floor: 2,
    type: 'individual',
    surface: 28,
    monthlyRent: 5500,
    charges: 550,
    status: 'occupied',
    hasAC: true,
    hasHeating: true,
    internetAccess: true,
    furnished: true,
    tenantId: 'ten-004'
  },
  {
    id: 'off-006',
    number: 'B203',
    floor: 2,
    type: 'meeting-room',
    surface: 40,
    monthlyRent: 8000,
    charges: 800,
    status: 'maintenance',
    hasAC: true,
    hasHeating: true,
    internetAccess: true,
    furnished: true
  },
  {
    id: 'off-007',
    number: 'C301',
    floor: 3,
    type: 'open-space',
    surface: 100,
    monthlyRent: 15000,
    charges: 1500,
    status: 'occupied',
    hasAC: true,
    hasHeating: true,
    internetAccess: true,
    furnished: true,
    tenantId: 'ten-005'
  },
  {
    id: 'off-008',
    number: 'C302',
    floor: 3,
    type: 'individual',
    surface: 22,
    monthlyRent: 4800,
    charges: 480,
    status: 'available',
    hasAC: false,
    hasHeating: false,
    internetAccess: true,
    furnished: false
  },
  {
    id: 'off-009',
    number: 'C303',
    floor: 3,
    type: 'individual',
    surface: 35,
    monthlyRent: 7000,
    charges: 700,
    status: 'occupied',
    hasAC: true,
    hasHeating: true,
    internetAccess: true,
    furnished: true,
    tenantId: 'ten-006'
  },
  {
    id: 'off-010',
    number: 'D401',
    floor: 4,
    type: 'meeting-room',
    surface: 50,
    monthlyRent: 9000,
    charges: 900,
    status: 'available',
    hasAC: true,
    hasHeating: true,
    internetAccess: true,
    furnished: true
  }
];

export const mockTenants: Tenant[] = [
  {
    id: 'ten-001',
    companyName: 'Maroc Digital Solutions',
    contactName: 'Ahmed Benali',
    email: 'a.benali@marocdigital.ma',
    phone: '+212 661 234 567',
    officeId: 'off-001',
    contractStart: '2025-01-01',
    contractEnd: '2026-12-31',
    monthlyTotal: 5500,
    balance: 0,
    status: 'active'
  },
  {
    id: 'ten-002',
    companyName: 'Atlas Consulting',
    contactName: 'Fatima Zahra El Amrani',
    email: 'f.elamrani@atlasconsulting.ma',
    phone: '+212 662 345 678',
    officeId: 'off-002',
    contractStart: '2025-03-01',
    contractEnd: '2026-02-28',
    monthlyTotal: 6600,
    balance: -13200,
    status: 'ending-soon'
  },
  {
    id: 'ten-003',
    companyName: 'Casablanca Tech Hub',
    contactName: 'Youssef Tazi',
    email: 'y.tazi@casatechhub.ma',
    phone: '+212 663 456 789',
    officeId: 'off-003',
    contractStart: '2024-06-01',
    contractEnd: '2027-05-31',
    monthlyTotal: 13200,
    balance: -26400,
    status: 'active'
  },
  {
    id: 'ten-004',
    companyName: 'Rabat Import Export',
    contactName: 'Karim Idrissi',
    email: 'k.idrissi@rabatimport.ma',
    phone: '+212 664 567 890',
    officeId: 'off-005',
    contractStart: '2025-06-01',
    contractEnd: '2026-05-31',
    monthlyTotal: 6050,
    balance: 6050,
    status: 'active'
  },
  {
    id: 'ten-005',
    companyName: 'Fès Artisanat SARL',
    contactName: 'Nadia Chraibi',
    email: 'n.chraibi@fesartisanat.ma',
    phone: '+212 665 678 901',
    officeId: 'off-007',
    contractStart: '2025-09-01',
    contractEnd: '2026-08-31',
    monthlyTotal: 16500,
    balance: -8250,
    status: 'active'
  },
  {
    id: 'ten-006',
    companyName: 'Tanger Logistics',
    contactName: 'Omar Benjelloun',
    email: 'o.benjelloun@tangerlogistics.ma',
    phone: '+212 666 789 012',
    officeId: 'off-009',
    contractStart: '2025-02-01',
    contractEnd: '2026-01-31',
    monthlyTotal: 7700,
    balance: 0,
    status: 'expired'
  }
];

export const mockPayments: Payment[] = [
  {
    id: 'pay-001',
    tenantId: 'ten-001',
    amount: 5500,
    date: '2026-02-01',
    type: 'rent',
    reference: 'PAY-2026-02-001',
    status: 'paid',
    notes: 'Paiement mensuel février'
  },
  {
    id: 'pay-002',
    tenantId: 'ten-001',
    amount: 5500,
    date: '2026-01-02',
    type: 'rent',
    reference: 'PAY-2026-01-001',
    status: 'paid'
  },
  {
    id: 'pay-003',
    tenantId: 'ten-004',
    amount: 12100,
    date: '2026-01-15',
    type: 'rent',
    reference: 'PAY-2026-01-004',
    status: 'paid',
    notes: 'Paiement avance 2 mois'
  },
  {
    id: 'pay-004',
    tenantId: 'ten-006',
    amount: 7700,
    date: '2026-01-03',
    type: 'rent',
    reference: 'PAY-2026-01-006',
    status: 'paid'
  },
  {
    id: 'pay-005',
    tenantId: 'ten-001',
    amount: 5500,
    date: '2025-12-01',
    type: 'rent',
    reference: 'PAY-2025-12-001',
    status: 'paid'
  },
  {
    id: 'pay-006',
    tenantId: 'ten-003',
    amount: 13200,
    date: '2025-12-05',
    type: 'rent',
    reference: 'PAY-2025-12-003',
    status: 'paid'
  },
  {
    id: 'pay-007',
    tenantId: 'ten-004',
    amount: 6050,
    date: '2025-12-01',
    type: 'rent',
    reference: 'PAY-2025-12-004',
    status: 'paid'
  },
  {
    id: 'pay-008',
    tenantId: 'ten-005',
    amount: 16500,
    date: '2025-12-10',
    type: 'rent',
    reference: 'PAY-2025-12-005',
    status: 'paid'
  },
  {
    id: 'pay-009',
    tenantId: 'ten-006',
    amount: 7700,
    date: '2025-12-02',
    type: 'rent',
    reference: 'PAY-2025-12-006',
    status: 'paid'
  },
  {
    id: 'pay-010',
    tenantId: 'ten-002',
    amount: 6600,
    date: '2025-11-05',
    type: 'rent',
    reference: 'PAY-2025-11-002',
    status: 'paid'
  },
  {
    id: 'pay-011',
    tenantId: 'ten-003',
    amount: 13200,
    date: '2025-11-03',
    type: 'rent',
    reference: 'PAY-2025-11-003',
    status: 'paid'
  },
  {
    id: 'pay-012',
    tenantId: 'ten-005',
    amount: 16500,
    date: '2025-11-08',
    type: 'rent',
    reference: 'PAY-2025-11-005',
    status: 'paid'
  },
  {
    id: 'pay-013',
    tenantId: 'ten-001',
    amount: 16500,
    date: '2025-01-01',
    type: 'deposit',
    reference: 'DEP-2025-01-001',
    status: 'paid',
    notes: 'Caution 3 mois'
  },
  {
    id: 'pay-014',
    tenantId: 'ten-002',
    amount: 500,
    date: '2026-01-20',
    type: 'penalty',
    reference: 'PEN-2026-01-002',
    status: 'pending',
    notes: 'Pénalité retard décembre'
  },
  {
    id: 'pay-015',
    tenantId: 'ten-003',
    amount: 1000,
    date: '2026-02-01',
    type: 'penalty',
    reference: 'PEN-2026-02-003',
    status: 'pending',
    notes: 'Pénalité retard janvier'
  }
];

export const mockExpenses: Expense[] = [
  {
    id: 'exp-001',
    date: '2026-02-01',
    category: 'salary',
    description: 'Salaire concierge - Février 2026',
    amount: 4500,
    supplier: 'Mohammed Alaoui',
    status: 'paid'
  },
  {
    id: 'exp-002',
    date: '2026-01-25',
    category: 'electricity',
    description: 'Facture électricité - Janvier 2026',
    amount: 8500,
    supplier: 'LYDEC',
    status: 'paid'
  },
  {
    id: 'exp-003',
    date: '2026-01-20',
    category: 'water',
    description: 'Facture eau - Janvier 2026',
    amount: 1200,
    supplier: 'LYDEC',
    status: 'paid'
  },
  {
    id: 'exp-004',
    date: '2026-01-15',
    category: 'cleaning',
    description: 'Service nettoyage - Janvier 2026',
    amount: 3000,
    supplier: 'CleanPro Maroc',
    status: 'paid'
  },
  {
    id: 'exp-005',
    date: '2026-01-01',
    category: 'salary',
    description: 'Salaire concierge - Janvier 2026',
    amount: 4500,
    supplier: 'Mohammed Alaoui',
    status: 'paid'
  },
  {
    id: 'exp-006',
    date: '2026-01-10',
    category: 'maintenance',
    description: 'Réparation climatisation Bureau B203',
    amount: 2500,
    supplier: 'Froid Technique SARL',
    status: 'paid'
  },
  {
    id: 'exp-007',
    date: '2025-12-28',
    category: 'electricity',
    description: 'Facture électricité - Décembre 2025',
    amount: 7800,
    supplier: 'LYDEC',
    status: 'paid'
  },
  {
    id: 'exp-008',
    date: '2025-12-15',
    category: 'security',
    description: 'Service gardiennage - Décembre 2025',
    amount: 6000,
    supplier: 'Securitas Maroc',
    status: 'paid'
  },
  {
    id: 'exp-009',
    date: '2026-02-05',
    category: 'insurance',
    description: 'Assurance immeuble - Trimestre 1 2026',
    amount: 15000,
    supplier: 'Wafa Assurance',
    status: 'pending'
  },
  {
    id: 'exp-010',
    date: '2025-12-01',
    category: 'salary',
    description: 'Salaire concierge - Décembre 2025',
    amount: 4500,
    supplier: 'Mohammed Alaoui',
    status: 'paid'
  }
];
