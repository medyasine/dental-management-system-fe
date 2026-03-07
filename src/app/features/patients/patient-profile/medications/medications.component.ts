// src/app/features/patients/patient-profile/medications/medications.component.ts
import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { PatientProfileStore } from '../store/patient-profile.store';

export interface Medicine {
  id: string;
  name: string;
  composition: string;
  category: string;
  brandName: string;
  supplier: string;
  reorderLevel: number;
  price: number;
  batches: string[];
}

export interface PrescribedMedicine {
  id: string;
  medicine: Medicine;
  batch: string;
  dosage: string;
  time: string;
  days: number;
  qty: number;
  advice: string;
}

export interface DaySession {
  label: string;
  date: string;
  isToday: boolean;
  prescriptions: PrescribedMedicine[];
}

@Component({
  selector: 'app-medications',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './medications.component.html',
  styleUrls: ['./medications.component.scss'],
})
export class MedicationsComponent {
  readonly dosageOptions = ['1 Tab', '2 Tab', '1/2 Tab', '1 tsp', '2 tsp'];
  readonly timeOptions = ['1-0-0', '0-1-0', '0-0-1', '1-1-0', '1-0-1', '0-1-1', '1-1-1'];
  readonly adviceOptions = ['After Food', 'Before Food', 'With Food', 'Empty Stomach'];
  readonly categoryOptions = ['Free', 'Growth', 'Starter', 'Antibiotic', 'Analgesic', 'Other'];
  readonly supplierOptions = ['Free', 'Growth', 'Starter', 'Harshad', 'MOX CV', 'Dentobees'];

  constructor(private readonly store: PatientProfileStore) {}

  get sessions(): DaySession[] {
    return this.store.state.medications.sessions;
  }

  get activeSessionIndex(): number {
    return this.store.state.medications.activeSessionIndex;
  }

  set activeSessionIndex(value: number) {
    this.store.setMedicationState({ activeSessionIndex: value });
  }

  get activeSession(): DaySession {
    return this.sessions[this.activeSessionIndex];
  }

  get catalogue(): Medicine[] {
    return this.store.state.medications.catalogue;
  }

  get selectSearch(): string {
    return this.store.state.medications.selectSearch;
  }

  set selectSearch(value: string) {
    this.store.setMedicationState({ selectSearch: value });
  }

  get selectOpen(): boolean {
    return this.store.state.medications.selectOpen;
  }

  get showModal(): boolean {
    return this.store.state.medications.showModal;
  }

  get newMed() {
    return this.store.state.medications.newMed;
  }

  get filteredCatalogue(): Medicine[] {
    const q = this.selectSearch.toLowerCase();
    return this.catalogue.filter(
      (medicine) =>
        medicine.name.toLowerCase().includes(q) || medicine.composition.toLowerCase().includes(q),
    );
  }

  openSelect(): void {
    this.store.setMedicationState({ selectOpen: true });
  }

  closeSelect(): void {
    setTimeout(() => this.store.setMedicationState({ selectOpen: false }), 150);
  }

  pickMedicine(medicine: Medicine): void {
    this.store.setMedicationState({ selectSearch: '', selectOpen: false });
    this.addRow(medicine);
  }

  addRow(medicine: Medicine): void {
    this.updateActiveSession((session) => ({
      ...session,
      prescriptions: [
        ...session.prescriptions,
        {
          id: Date.now().toString(),
          medicine,
          batch: medicine.batches[0] ?? '',
          dosage: '1 Tab',
          time: '1-1-1',
          days: 1,
          qty: 1,
          advice: 'After Food',
        },
      ],
    }));
  }

  removeRow(row: PrescribedMedicine): void {
    this.updateActiveSession((session) => ({
      ...session,
      prescriptions: session.prescriptions.filter((item) => item.id !== row.id),
    }));
  }

  changeQty(row: PrescribedMedicine, delta: number): void {
    row.qty = Math.max(1, row.qty + delta);
  }

  changeDays(row: PrescribedMedicine, delta: number): void {
    row.days = Math.max(1, row.days + delta);
  }

  prescribe(): void {
    console.log('Prescribing:', this.activeSession.prescriptions);
  }

  openModal(): void {
    this.store.setMedicationState({
      newMed: this.emptyNewMed(),
      showModal: true,
    });
  }

  closeModal(): void {
    this.store.setMedicationState({ showModal: false });
  }

  saveNewMedicine(): void {
    if (!this.newMed.name.trim() || !this.newMed.composition.trim()) {
      return;
    }

    this.store.setMedicationState({
      catalogue: [
        ...this.catalogue,
        {
          id: Date.now().toString(),
          name: this.newMed.name.trim(),
          composition: this.newMed.composition.trim(),
          category: this.newMed.category,
          brandName: this.newMed.brandName,
          supplier: this.newMed.supplier,
          reorderLevel: this.newMed.reorderLevel,
          price: 0,
          batches: ['NEW01'],
        },
      ],
      showModal: false,
    });
  }

  private updateActiveSession(mapper: (session: DaySession) => DaySession): void {
    const updated = this.sessions.map((session, index) =>
      index === this.activeSessionIndex ? mapper(session) : session,
    );
    this.store.setMedicationState({ sessions: updated });
  }

  private emptyNewMed() {
    return {
      name: '',
      composition: '',
      category: '',
      brandName: '',
      supplier: '',
      reorderLevel: 0,
    };
  }
}
