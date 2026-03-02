// src/app/features/shared/models/patient.model.ts
export interface Patient {
  id: string;
  name: string;
  location: string;
  phone: string;
  email: string;
  gender: 'Male' | 'Female';
  age: number;
  patientId: string;
  token: number;
  bookingDate: string;
  alerts: string[];
}

export interface ClinicalInfo {
  chiefComplaints: string[];
  medicalHistory: string[];
  dentalHistory: string[];
  onExamination: string[];
}

export interface RgvReport {
  id: number;
  imageUrl: string;
  date: string;
}

export interface RgvNote {
  id: number;
  author: string;
  date: string;
  content: string;
}

export type ToothStatus =
  | 'normal'
  | 'treatment-taken'    // purple dot
  | 'removed'            // grey dot
  | 'recommended';       // yellow dot

export interface Tooth {
  number: number;
  status: ToothStatus;
}

export type DentitionMode = 'Adult' | 'Pedo' | 'Mixed';