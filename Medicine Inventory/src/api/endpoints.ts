import type {
  DashboardSummary,
  LoginResponse,
  Medicine,
  MedicineUpsert,
  Sale,
} from '../types';
import { api, downloadFile } from './client';

export const login = (username: string, password: string) =>
  api.post<LoginResponse>('/api/Auth/login', { username, password });

export const getMedicines = () => api.get<Medicine[]>('/api/medicines');

export const createMedicine = (medicine: MedicineUpsert) =>
  api.post<Medicine>('/api/medicines', medicine);

export const updateMedicine = (id: number, medicine: MedicineUpsert) =>
  api.put<Medicine>(`/api/medicines/${id}`, medicine);

export const deleteMedicine = (id: number) =>
  api.del<void>(`/api/medicines/${id}`);

export const recordSale = (medicineId: number, quantitySold: number) =>
  api.post<Sale>('/api/sales', { medicineId, quantitySold });

export const getDashboardSummary = () =>
  api.get<DashboardSummary>('/api/dashboard/summary');

export const downloadReport = () =>
  downloadFile('/api/reports/medicines', 'JezMeds-Report.xlsx');
