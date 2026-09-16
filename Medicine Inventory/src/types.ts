export interface LoginResponse {
  token: string;
  username: string;
  displayName: string;
  role: string;
}

export interface Medicine {
  id: number;
  name: string;
  genericName: string | null;
  category: string;
  quantity: number;
  unitPrice: number;
  expiryDate: string | null;
  supplier: string | null;
  totalSold: number;
  totalRevenue: number;
  createdAt: string;
  updatedAt: string;
}

export interface MedicineUpsert {
  name: string;
  genericName: string | null;
  category: string;
  quantity: number;
  unitPrice: number;
  expiryDate: string | null;
  supplier: string | null;
}

export interface Sale {
  id: number;
  medicineId: number;
  medicineName: string;
  quantitySold: number;
  totalAmount: number;
  saleDate: string;
}

export interface SalesPoint {
  date: string;
  revenue: number;
  unitsSold: number;
}

export interface StockLevel {
  name: string;
  quantity: number;
}

export interface TopSelling {
  name: string;
  unitsSold: number;
  revenue: number;
}

export interface DashboardSummary {
  totalMedicines: number;
  totalStockValue: number;
  totalSalesRevenue: number;
  lowStockCount: number;
  salesOverTime: SalesPoint[];
  stockLevels: StockLevel[];
  topSelling: TopSelling[];
}

/** Quantity below which a medicine is flagged as low stock (matches the API). */
export const LOW_STOCK_THRESHOLD = 10;
