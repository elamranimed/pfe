// Office data type
export interface Tenant {
  id: string;
  companyName: string;
  contactName: string;
  email: string;
  phone: string;
  contractStart: string;
  contractEnd: string;
  balance: number; // negative = owes money
}

export interface Office {
  id: string;
  number: string;
  floor: number;
  type: 'individual' | 'open-space' | 'meeting-room';
  surface: number; // m²
  monthlyRent: number; // MAD
  charges: number; // MAD
  status: 'available' | 'occupied' | 'maintenance';
  createdAt: string;
  updatedAt: string;
  tenant?: Tenant;
}

// Payment data type
export interface Payment {
  id: string;
  officeId: string;
  officeNumber: string;
  tenantName: string;
  amount: number;
  date: string;
  type: 'rent' | 'charges' | 'penalty';
  reference: string;
  status: 'paid' | 'pending';
  createdAt: string;
}

// Expense data type
export interface Expense {
  id: string;
  date: string;
  category: 'salary' | 'electricity' | 'water' | 'maintenance' | 'insurance';
  description: string;
  amount: number;
  supplier: string;
  status: 'paid' | 'pending';
  createdAt: string;
}
