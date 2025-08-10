export interface IWarehouse extends Document {
  warehouseId: string; 
  name: string;
  address?: string;
  city?: string;
  manager?: string;
  phone?: string;
  type?: string;
  capacity?: number;
  openingDate?: string;
  status?: "active" | "inactive";
  note?: string;
}
