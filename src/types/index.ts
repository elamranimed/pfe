export interface Office {
  id: string;
  number: string;
  floor: number;
  type: 'individual' | 'open-space' | 'meeting-room';
  monthlyRent: number; // MAD
  status: 'available' | 'occupied' | 'renovation';
  tenantName?: string;
  tenantPhone?: string;
  tenantEmail?: string;
  tenantId?: string;
}

export interface Tenant {
  id: string;
  companyName: string;
  contactName: string;
  email: string;
  phone: string;
  officeId: string;
  contractStart: string; // ISO date
  contractEnd: string; // ISO date
  monthlyTotal: number; // rent + charges
  balance: number; // positive = overpaid, negative = owes money
  status: 'active' | 'ending-soon' | 'expired';
}

export interface Payment {
  id: string;
  tenantId: string;
  amount: number;
  date: string; // ISO date
  type: 'rent' | 'charges' | 'penalty' | 'deposit';
  reference: string;
  status: 'paid' | 'pending';
  notes?: string;
}

export interface Expense {
  id: string;
  date: string;
  category: 'salary' | 'electricity' | 'water' | 'maintenance' | 'insurance' | 'cleaning' | 'security';
  description: string;
  amount: number;
  supplier: string;
  status: 'paid' | 'pending';
  receiptUrl?: string;
}

export interface DashboardStats {
  totalRevenueMTD: number;
  totalExpensesMTD: number;
  activeTenants: number;
  outstandingDebts: number;
  occupancyRate: number;
}
