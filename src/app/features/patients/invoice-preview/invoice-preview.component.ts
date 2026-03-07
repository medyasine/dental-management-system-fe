import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { Patient } from '../../shared/models/patient.model';
import { PrescribedMedicine } from '../patient-profile/medications/medications.component';

interface EncounterDraft {
  appointmentId: string;
  patient: Patient;
  treatments: Array<{
    id: number;
    name: string;
    status: string;
    qty: number;
    price: number;
    total: number;
  }>;
  medications: PrescribedMedicine[];
  labOrders: Array<unknown>;
  advices: string[];
  discount: number;
  createdAt: string;
}

@Component({
  selector: 'app-invoice-preview',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './invoice-preview.component.html',
  styleUrls: ['./invoice-preview.component.scss'],
})
export class InvoicePreviewComponent implements OnInit {
  appointmentId = '';
  showGeneratedPreview = false;

  readonly clinicName = 'Dento Lounge';
  readonly clinicAddress = 'Calicut, India, 673001';
  readonly clinicPhone = '+91 9995960143';
  readonly doctorName = 'Arjun';

  draft: EncounterDraft = {
    appointmentId: '',
    patient: {
      id: '1',
      name: 'Patient',
      location: '',
      phone: '',
      email: '',
      gender: 'Male',
      age: 0,
      patientId: '',
      token: 0,
      bookingDate: '',
      alerts: [],
    },
    treatments: [],
    medications: [],
    labOrders: [],
    advices: [],
    discount: 0,
    createdAt: new Date().toISOString(),
  };

  constructor(
    private router: Router,
    private route: ActivatedRoute,
  ) {}

  ngOnInit(): void {
    this.appointmentId = this.route.snapshot.paramMap.get('appointmentId') ?? '';

    const navDraft = history.state?.draft as EncounterDraft | undefined;
    if (navDraft) {
      this.draft = navDraft;
      return;
    }

    const stored = sessionStorage.getItem(this.getDraftStorageKey());
    if (stored) {
      this.draft = JSON.parse(stored) as EncounterDraft;
    }
  }

  get treatmentTotal(): number {
    return this.draft.treatments.reduce((sum, item) => sum + item.total, 0);
  }

  get medicineTotal(): number {
    return this.draft.medications.reduce((sum, item) => sum + item.qty * item.medicine.price, 0);
  }

  get subtotal(): number {
    return this.treatmentTotal + this.medicineTotal;
  }

  get discountAmount(): number {
    return Math.min(Number(this.draft.discount || 0), this.subtotal);
  }

  get grandTotal(): number {
    return Math.max(0, this.subtotal - this.discountAmount);
  }

  get todayDateLabel(): string {
    return new Date().toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' });
  }

  get invoiceNumber(): string {
    return `INV-${this.appointmentId || '0001'}`;
  }

  removeTreatment(id: number): void {
    this.draft.treatments = this.draft.treatments.filter((item) => item.id !== id);
    this.persistDraft();
  }

  onDiscountChange(): void {
    if (this.draft.discount < 0) {
      this.draft.discount = 0;
    }
    this.persistDraft();
  }

  getMedicineExpiry(_batch: string): string {
    return '14/10/2027';
  }

  medicineAdviceCode(advice: string): string {
    const value = (advice || '').toLowerCase();
    if (value.includes('after')) {
      return 'A/F';
    }
    if (value.includes('before')) {
      return 'B/F';
    }
    if (value.includes('empty')) {
      return 'E/S';
    }
    return 'A/F';
  }

  generateInvoice(): void {
    this.persistDraft();
    this.showGeneratedPreview = true;
  }

  backToInvoiceEditor(): void {
    this.showGeneratedPreview = false;
  }

  printBoth(): void {
    window.print();
  }

  finishConsultation(): void {
    this.persistDraft();
    this.router.navigate(['/app/doctor-dashboard']);
  }

  goBack(): void {
    this.router.navigate(['/app/patient-profile', this.appointmentId]);
  }

  goToMedication(): void {
    this.router.navigate(['/app/patient-profile', this.appointmentId]);
  }

  private persistDraft(): void {
    sessionStorage.setItem(this.getDraftStorageKey(), JSON.stringify(this.draft));
  }

  private getDraftStorageKey(): string {
    return `encounter-draft-${this.appointmentId}`;
  }
}
