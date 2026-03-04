// src/app/features/patient-profile/treatment-plans-board/treatment-plans-board.component.ts
import { Component, Input, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

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

// ── Tooth image resolver ───────────────────────────────────────────────────
// Files live in public/teeth/upper/ and public/teeth/lower/
// Naming: tooth-{quadrant1or4}-{quadrant2or3}.png
// Left-side teeth (21-28, 31-38) reuse the right-side image with CSS scaleX(-1)
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
export class TreatmentPlansBoardComponent implements OnInit {
  @Input() patientId: string = '';

  // ── Mock data — replace with API calls ─────────────────────────────────────
  treatments: TreatmentCard[] = [
    {
      id: '1', date: 'Nov 11, 2025', toothNumber: 23,
      diagnosis: 'Reversible Pulpitis', treatmentName: 'EXTRACTION - ADULT',
      qty: 1, itemPrice: 400, total: 400, doctor: 'Arjun',
      status: 'plan', surfaces: ['M', 'O'],
    },
    {
      id: '2', date: 'Nov 5, 2025', toothNumber: 41,
      diagnosis: 'Reversible Pulpitis', treatmentName: 'EXTRACTION OF THIRD MOLAR',
      qty: 1, itemPrice: 450, total: 450, doctor: 'Arjun',
      status: 'in-progress',
    },
    {
      id: '3', date: 'Nov 5, 2025', toothNumber: 21,
      diagnosis: 'Gingivitis', treatmentName: 'EXTRACTION OF DIFFICULT TOOTH',
      qty: 1, itemPrice: 800, total: 800, doctor: 'Arjun',
      status: 'completed',
    },
    {
      id: '4', date: 'Nov 4, 2025', toothNumber: 14,
      diagnosis: 'Periodontitis', treatmentName: 'ROOT CANAL TREATMENT',
      qty: 1, itemPrice: 3000, total: 3000, doctor: 'Arjun',
      status: 'completed',
    },
  ];

  editingPriceId: string | null = null;
  editingPriceValue: number = 0;

  ngOnInit(): void {}

  // ── Expose asset resolver to template ─────────────────────────────────────
  getAsset(toothNumber: number): ToothAsset {
    return getToothAsset(toothNumber);
  }

  // ── Column getters ─────────────────────────────────────────────────────────
  get planCards():       TreatmentCard[] { return this.treatments.filter(t => t.status === 'plan'); }
  get inProgressCards(): TreatmentCard[] { return this.treatments.filter(t => t.status === 'in-progress'); }
  get completedCards():  TreatmentCard[] { return this.treatments.filter(t => t.status === 'completed'); }

  // ── Actions ────────────────────────────────────────────────────────────────
  markAsCompleted(card: TreatmentCard):   void { card.status = 'completed'; }
  moveToInProgress(card: TreatmentCard):  void { card.status = 'in-progress'; }
  deleteCard(card: TreatmentCard):        void { this.treatments = this.treatments.filter(t => t.id !== card.id); }
  addNotes(card: TreatmentCard):          void { console.log('Add notes', card.id); }
  presenterMode():                        void { console.log('Presenter mode'); }

  changeQty(card: TreatmentCard, delta: number): void {
    card.qty = Math.max(1, card.qty + delta);
    card.total = card.qty * card.itemPrice;
  }

  startEditPrice(card: TreatmentCard): void {
    this.editingPriceId = card.id;
    this.editingPriceValue = card.itemPrice;
  }

  savePrice(card: TreatmentCard): void {
    card.itemPrice = this.editingPriceValue;
    card.total = card.qty * card.itemPrice;
    this.editingPriceId = null;
  }
}