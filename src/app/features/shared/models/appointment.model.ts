export interface Appointment {
  no: number;
  date: string;
  time: string;
  patient: string;
  phone: string;
  gender: 'Male' | 'Female';
  age: number;
  chiefComplaints: string;
  token: number;
  doctor: string;
  status: 'Scheduled' | 'Checked-In' | 'Completed' | 'Cancelled';
  consultation?: string;
}

export interface DashboardStats {
  appointments: number;
  checkIns: number;
  billings: number;
  payments: number;
}