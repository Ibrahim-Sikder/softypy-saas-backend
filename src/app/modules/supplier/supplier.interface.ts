export interface TSupplier {
  supplierId: string; 
  full_name: string;
  contact_person_name: string;

  country_code?: string; 
  phone_number: string;
  full_Phone_number?: string;
  email?: string;
  vendor: string;
  tax_id?: string; 
  street_address: string;
  country: string;
  state?: string;
  city: string;
  postal_code?: string;
  isRecycled: boolean;
  bank_name?: string;
  account_number?: string;
  swift_code?: string;
  supplier_status: "active" | "inactive"; 
  notes?: string;
  recycledAt: Date | null;
  createdAt?: Date;
  updatedAt?: Date;
}
