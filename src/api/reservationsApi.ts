import apiClient from ".";

export interface Reservation {
  id: number;
  userId: number;
  unitId: number;
  contractType: 'residential' | 'commercial';
  startDate: string;
  endDate: string;
  contractDuration: string;
  contractImage: string;
  contractImageUrl: string | null;
  contractPdf: string;
  contractPdfUrl: string | null;
  paymentMethod: 'cash' | 'checks';
  paymentSchedule: 'monthly' | 'quarterly' | 'triannual' | 'biannual' | 'annual';
  includesDeposit: boolean;
  depositAmount: number | null;
  status: 'active' | 'expired' | 'cancelled';
  notes: string | null;
  createdAt: string;
  updatedAt: string;
  user?: {
    id: number;
    fullName: string;
    email: string;
    phone: string;
  };
  unit?: {
    id: number;
    unitNumber: string;
    unitType: string;
    price: number;
    buildingId: number;
    building?: {
      name: string;
      buildingNumber: string;
    };
  };
  payments?: Array<{
    id: number;
    amount: number;
    paymentDate: string;
    status: 'paid' | 'pending' | 'delayed' | 'cancelled';
  }>;
}

export interface CreateReservationRequest {
  // With existing tenant
  userId?: number;
  // Or create new tenant
  tenantFullName?: string;
  tenantEmail?: string;
  tenantPhone?: string;
  tenantWhatsappNumber?: string;
  tenantIdNumber?: string;
  tenantType?: 'person' | 'commercial_register';
  tenantBusinessActivities?: string;
  tenantContactPerson?: string;
  tenantContactPosition?: string;
  tenantNotes?: string;
  identityImageFront?: File;
  identityImageBack?: File;
  commercialRegisterImage?: File;
  
  // Common fields
  unitId: number;
  contractType: 'residential' | 'commercial';
  startDate: string;
  endDate: string;
  paymentMethod: 'cash' | 'checks';
  pay