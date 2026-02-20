
export interface Tenant {
  id: string;
  companyName: string;
  contactName: string;
  email: string;
  phone: string;
  contractStart: string;
  contractEnd: string;
  balance: number; 
}

export interface Office {
  id: string;
  number: string;
  name?: string;
  floor: number;
  type: 'individual' | 'open-space' | 'meeting-room';
  cotisation: number; 
  status: 'available' | 'occupied' | 'maintenance';
  telephone?: string;
  email?: string;
  notes?: string;
  createdAt: string;
  updatedAt: string;
  tenant?: Tenant;
}


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