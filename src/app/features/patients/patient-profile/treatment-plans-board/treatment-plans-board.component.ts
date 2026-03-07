// src/app/features/patient-profile/treatment-plans-board/treatment-plans-board.component.ts
import { Component, Input } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { PatientProfileStore } from '../store/patient-profile.store';

export type TreatmentStatus = 'plan' | 'in-progress' | 'completed';

export interface ToothAsset {
  path: string;
  mirror: boolean;
}

export interface TreatmentCard {
  id: string;
  date: string;
  toothNumber: number;
  diagnosis: string;
  treatmentName: string;
  qty: number;
  itemPrice: number;
  total: number;
  doctor: string;
  status: TreatmentStatus;
  surfaces?: string[];
}

export function getToothAsset(n: number): ToothAsset {
  if (n >= 11 && n <= 18) {
    const mirror = 20 + (n - 10);
    return { path: `teeth/upper/tooth-${n}-${mirror}.png`, mirror: false };
  }
  if (n >= 21 && n <= 28) {
    const base = 10 + (n - 20);
    return { path: `teeth/upper/tooth-${base}-${n}.png`, mirror: true };
  }
  if (n >= 41 && n <= 48) {
    const mirror = 30 + (n - 40);
    return { path: `teeth/lower/tooth-${n}-${mirror}.png`, mirror: false };
  }
  if (n >= 31 && n <= 38) {
    const base = 40 + (n - 30);
    return { path: `teeth/lower/tooth-${base}-${n}.png`, mirror: true };
  }
  return { path: 'teeth/upper/tooth-11-21.png', mirror: false };
}

@Component({
  selector: 'app-treatment-plans-board',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './treatment-plans-board.component.html',
  styleUrls: ['./treatment-plans-board.component.scss'],
})
export class TreatmentPlansBoardComponent {
  @Input() patientId = '';

  constructor(private readonly store: PatientProfileStore) {}

  get treatments(): TreatmentCard[] {
    return this.store.state.treatmentsBoard.treatments;
  }

  get editingPriceId(): string | null {
    return this.store.state.treatmentsBoard.editingPriceId;
  }

  set editingPriceId(value: string | null) {
    this.store.setTreatmentsBoardState({ editingPriceId: value });
  }

  get editingPriceValue(): number {
    return this.store.state.treatmentsBoard.editingPriceValue;
  }

  set editingPriceValue(value: number) {
    this.store.setTreatmentsBoardState({ editingPriceValue: value });
  }

  getAsset(toothNumber: number): ToothAsset {
    return getToothAsset(toothNumber);
  }

  get planCards(): TreatmentCard[] {
    return this.treatments.filter((treatment) => treatment.status === 'plan');
  }

  get inProgressCards(): TreatmentCard[] {
    return this.treatments.filter((treatment) => treatment.status === 'in-progress');
  }

  get completedCards(): TreatmentCard[] {
    return this.treatments.filter((treatment) => treatment.status === 'completed');
  }

  markAsCompleted(card: TreatmentCard): void {
    this.updateCard(card.id, (item) => ({ ...item, status: 'completed' }));
  }

  moveToInProgress(card: TreatmentCard): void {
    this.updateCard(card.id, (item) => ({ ...item, status: 'in-progress' }));
  }

  deleteCard(card: TreatmentCard): void {
    this.store.setTreatmentsBoardState({
      treatments: this.treatments.filter((item) => item.id !== card.id),
    });
  }

  addNotes(card: TreatmentCard): void {
    console.log('Add notes', card.id);
  }

  presenterMode(): void {
    console.log('Presenter mode');
  }

  changeQty(card: TreatmentCard, delta: number): void {
    this.updateCard(card.id, (item) => {
      const qty = Math.max(1, item.qty + delta);
      return { ...item, qty, total: qty * item.itemPrice };
    });
  }

  startEditPrice(card: TreatmentCard): void {
    this.store.setTreatmentsBoardState({
      editingPriceId: card.id,
      editingPriceValue: card.itemPrice,
    });
  }

  savePrice(card: TreatmentCard): void {
    const value = this.editingPriceValue;
    this.updateCard(card.id, (item) => ({ ...item, itemPrice: value, total: value * item.qty }));
    this.store.setTreatmentsBoardState({ editingPriceId: null });
  }

  private updateCard(id: string, mapper: (card: TreatmentCard) => TreatmentCard): void {
    const updated = this.treatments.map((item) => (item.id === id ? mapper(item) : item));
    this.store.setTreatmentsBoardState({ treatments: updated });
  }
}
