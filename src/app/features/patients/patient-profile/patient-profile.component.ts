// src/app/features/patients/patient-profile/patient-profile.component.ts
import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, Router } from '@angular/router';
import { PatientHeaderComponent } from './patient-header/patient-header.component';
import { PatientInfoComponent } from './patient-info/patient-info.component';
import { ClinicalInfoComponent } from './clinical-info/clinical-info.component';
import { RgvReportsComponent } from './rgv-reports/rgv-reports.component';
import { DentalChartComponent } from './dental-chart/dental-chart.component';
import { TreatmentPlansBoardComponent } from './treatment-plans-board/treatment-plans-board.component';
import { ConsultationNotesComponent } from './consultation-notes/consultation-notes.component';
import { MedicationsComponent, PrescribedMedicine } from './medications/medications.component';
import { LabOrdersComponent } from './lab-orders/lab-orders.component';
import { AdvicesComponent } from './advices/advices.component';
import { PatientProfileStore } from './store/patient-profile.store';
import type { RgvNote, RgvReport } from '../../shared/models/patient.model';

interface EncounterDraft {
  appointmentId: string;
  patient: unknown;
  treatments: Array<{
    id: number;
    name: string;
    status: string;
    qty: number;
    price: number;
    total: number;
  }>;
  medications: PrescribedMedicine[];
  labOrders: unknown[];
  advices: string[];
  discount: number;
  createdAt: string;
}

@Component({
  selector: 'app-patient-profile',
  standalone: true,
  imports: [
    CommonModule,
    PatientHeaderComponent,
    PatientInfoComponent,
    ClinicalInfoComponent,
    RgvReportsComponent,
    DentalChartComponent,
    TreatmentPlansBoardComponent,
    ConsultationNotesComponent,
    MedicationsComponent,
    LabOrdersComponent,
    AdvicesComponent,
  ],
  template: `
    <div class="patient-profile-shell">
      <app-patient-header [doctorName]="doctorName" (back)="onBack()"></app-patient-header>

      <div class="profile-content p-4">
        <app-patient-info [patient]="patient"></app-patient-info>
        <app-clinical-info [info]="clinicalInfo"></app-clinical-info>
        <app-rgv-reports
          [reports]="reports"
          [notes]="notes"
          (reportsChange)="onReportsChange($event)"
          (notesChange)="onNotesChange($event)">
        </app-rgv-reports>
        <app-dental-chart [teeth]="teeth"></app-dental-chart>
        <app-treatment-plans-board [patientId]="patient.id"></app-treatment-plans-board>
        <app-consultation-notes></app-consultation-notes>
        <app-medications></app-medications>
        <app-lab-orders></app-lab-orders>
        <app-advices></app-advices>

        <div class="profile-actions">
          <button class="btn-prescription" type="button" (click)="openPrescriptionModal()">
            <i class="pi pi-print"></i>
            <span>Prescription</span>
          </button>

          <button class="btn-continue" type="button" (click)="onContinue()">Continue</button>
        </div>
      </div>
    </div>

    <div class="rx-modal-backdrop" *ngIf="showPrescriptionModal" (click)="closePrescriptionModal()">
      <section class="rx-modal" (click)="$event.stopPropagation()">
        <header class="rx-header">
          <h3>Prescription Preview</h3>
          <button class="rx-close" type="button" (click)="closePrescriptionModal()">x</button>
        </header>

        <div class="rx-body">
          <div class="rx-meta">
            <p><strong>Patient:</strong> {{ patient.name }} ({{ patient.patientId }})</p>
            <p><strong>Date:</strong> {{ todayLabel }}</p>
          </div>

          <h4>Medicines</h4>
          <table class="rx-table" *ngIf="prescriptionRows.length > 0; else emptyMeds">
            <thead>
              <tr>
                <th>#</th>
                <th>Name</th>
                <th>Dosage</th>
                <th>Time</th>
                <th>Days</th>
                <th>Advice</th>
              </tr>
            </thead>
            <tbody>
              <tr *ngFor="let row of prescriptionRows; let i = index">
                <td>{{ i + 1 }}</td>
                <td>{{ row.medicine.name }}</td>
                <td>{{ row.dosage }}</td>
                <td>{{ row.time }}</td>
                <td>{{ row.days }}</td>
                <td>{{ row.advice }}</td>
              </tr>
            </tbody>
          </table>

          <ng-template #emptyMeds>
            <p class="rx-empty">No medicines added for this session.</p>
          </ng-template>

          <h4>Advices</h4>
          <ul class="rx-list" *ngIf="adviceRows.length > 0; else emptyAdvices">
            <li *ngFor="let advice of adviceRows">{{ advice }}</li>
          </ul>

          <ng-template #emptyAdvices>
            <p class="rx-empty">No advices added.</p>
          </ng-template>
        </div>

        <footer class="rx-footer">
          <button class="rx-btn" type="button" (click)="printPrescription()">Print</button>
          <button class="rx-btn" type="button" (click)="downloadPrescription()">Download</button>
          <button class="rx-btn rx-btn-primary" type="button" (click)="sendPrescriptionWhatsapp()">Send WhatsApp</button>
        </footer>
      </section>
    </div>
  `,
  styles: [
    `
      .patient-profile-shell {
        background: var(--surface-ground);
        min-height: 100vh;
      }

      .profile-content {
        display: flex;
        flex-direction: column;
        gap: 1.25rem;
        margin: 0 auto;
        max-width: 1400px;
        padding-bottom: 1.5rem;
      }

      .profile-actions {
        display: flex;
        gap: 1rem;
        justify-content: flex-end;
        padding: 0.75rem 0 0.5rem;
      }

      .btn-prescription,
      .btn-continue {
        border-radius: 12px;
        font-size: 0.95rem;
        font-weight: 600;
        min-width: 190px;
        padding: 0.55rem 1.2rem;
        transition: all 0.2s ease;
      }

      .btn-prescription {
        align-items: center;
        background: #fff;
        border: 2px solid #2dd4bf;
        color: #1f2937;
        display: inline-flex;
        gap: 0.65rem;
        justify-content: center;
      }

      .btn-prescription i {
        color: #374151;
        font-size: 1rem;
      }

      .btn-continue {
        background: #67e8c4;
        border: none;
        box-shadow: 0 10px 24px rgba(45, 212, 191, 0.28);
        color: #fff;
      }

      .btn-prescription:hover {
        background: #ecfeff;
      }

      .btn-continue:hover {
        background: #2dd4bf;
      }

      .rx-modal-backdrop {
        background: rgba(15, 23, 42, 0.35);
        inset: 0;
        position: fixed;
        z-index: 1200;
        display: flex;
        justify-content: center;
        align-items: center;
        padding: 1rem;
      }

      .rx-modal {
        background: #fff;
        border-radius: 12px;
        width: min(920px, 100%);
        max-height: 90vh;
        display: flex;
        flex-direction: column;
      }

      .rx-header,
      .rx-footer {
        display: flex;
        align-items: center;
        justify-content: space-between;
        padding: 0.9rem 1.1rem;
        border-bottom: 1px solid #e5e7eb;
      }

      .rx-header h3 {
        margin: 0;
        font-size: 1rem;
      }

      .rx-close {
        background: transparent;
        border: none;
        cursor: pointer;
        color: #6b7280;
        font-size: 1rem;
      }

      .rx-body {
        padding: 1rem 1.1rem;
        overflow: auto;
      }

      .rx-meta p,
      .rx-list,
      .rx-empty {
        margin: 0.3rem 0;
        font-size: 0.9rem;
      }

      .rx-body h4 {
        font-size: 0.95rem;
        margin: 0.85rem 0 0.45rem;
      }

      .rx-table {
        width: 100%;
        border-collapse: collapse;
        font-size: 0.85rem;
      }

      .rx-table th,
      .rx-table td {
        border-bottom: 1px solid #e5e7eb;
        text-align: left;
        padding: 0.45rem 0.5rem;
      }

      .rx-footer {
        border-top: 1px solid #e5e7eb;
        border-bottom: none;
        justify-content: flex-end;
        gap: 0.6rem;
      }

      .rx-btn {
        border: 1px solid #d1d5db;
        background: #fff;
        color: #374151;
        border-radius: 8px;
        padding: 0.45rem 0.9rem;
        font-size: 0.85rem;
        font-weight: 600;
        cursor: pointer;
      }

      .rx-btn-primary {
        background: #14b8a6;
        border-color: #14b8a6;
        color: #fff;
      }

      @media (max-width: 768px) {
        .profile-actions {
          flex-direction: column;
        }

        .btn-prescription,
        .btn-continue {
          width: 100%;
        }
      }
    `,
  ],
})
export class PatientProfileComponent implements OnInit {
  constructor(
    private readonly router: Router,
    private readonly route: ActivatedRoute,
    private readonly store: PatientProfileStore,
  ) {}

  ngOnInit(): void {
    const appointmentId = this.route.snapshot.paramMap.get('appointmentId') ?? this.patient.id;
    this.store.setAppointmentId(appointmentId);
  }

  get doctorName(): string {
    return this.store.state.doctorName;
  }

  get patient() {
    return this.store.state.patient;
  }

  get clinicalInfo() {
    return this.store.state.clinicalInfo;
  }

  get reports() {
    return this.store.state.reports;
  }

  get notes() {
    return this.store.state.notes;
  }

  get teeth() {
    return this.store.state.teeth;
  }

  get showPrescriptionModal(): boolean {
    return this.store.state.showPrescriptionModal;
  }

  get prescriptionRows(): PrescribedMedicine[] {
    return this.store.state.medications.sessions.find((session) => session.isToday)?.prescriptions ?? [];
  }

  get adviceRows(): string[] {
    return this.store.state.advices.sessions.find((session) => session.isToday)?.advices ?? [];
  }

  get todayLabel(): string {
    return new Date().toLocaleDateString('en-GB', {
      day: '2-digit',
      month: 'short',
      year: 'numeric',
    });
  }

  onBack(): void {
    this.router.navigate(['/app/doctor-dashboard']);
  }

  onReportsChange(reports: RgvReport[]): void {
    this.store.setReports(reports);
  }

  onNotesChange(notes: RgvNote[]): void {
    this.store.setNotes(notes);
  }

  openPrescriptionModal(): void {
    this.store.togglePrescriptionModal(true);
  }

  closePrescriptionModal(): void {
    this.store.togglePrescriptionModal(false);
  }

  printPrescription(): void {
    window.print();
  }

  downloadPrescription(): void {
    const lines = [
      `Patient: ${this.patient.name} (${this.patient.patientId})`,
      `Date: ${this.todayLabel}`,
      '',
      'Medicines:',
      ...this.prescriptionRows.map(
        (row, i) =>
          `${i + 1}. ${row.medicine.name} | ${row.dosage} | ${row.time} | ${row.days} day(s) | ${row.advice}`,
      ),
      '',
      'Advices:',
      ...this.adviceRows.map((advice, i) => `${i + 1}. ${advice}`),
    ];

    const blob = new Blob([lines.join('\n')], { type: 'text/plain;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const anchor = document.createElement('a');
    anchor.href = url;
    anchor.download = `prescription-${this.store.state.appointmentId || 'visit'}.txt`;
    anchor.click();
    URL.revokeObjectURL(url);
  }

  sendPrescriptionWhatsapp(): void {
    const medicineText = this.prescriptionRows.length
      ? this.prescriptionRows
          .map((row, i) => `${i + 1}. ${row.medicine.name} - ${row.dosage}, ${row.time} for ${row.days} day(s)`)
          .join('%0A')
      : 'No medicines';

    const adviceText = this.adviceRows.length ? this.adviceRows.join('%0A') : 'No advices';

    const message =
      `Prescription for ${this.patient.name}%0A` +
      `%0AMedicines:%0A${medicineText}` +
      `%0A%0AAdvices:%0A${adviceText}`;

    window.open(`https://wa.me/?text=${message}`, '_blank');
  }

  onContinue(): void {
    const appointmentId = this.store.state.appointmentId || this.patient.id;
    const draft = this.buildEncounterDraft(appointmentId);
    sessionStorage.setItem(this.getDraftStorageKey(appointmentId), JSON.stringify(draft));

    this.router.navigate(['/app/invoice-preview', appointmentId], {
      state: { draft },
    });
  }

  private buildEncounterDraft(appointmentId: string): EncounterDraft {
    const state = this.store.state;

    return {
      appointmentId,
      patient: state.patient,
      treatments: [
        {
          id: 1,
          name: 'EXTRACTION - ADULT',
          status: 'Completed',
          qty: 1,
          price: 400,
          total: 400,
        },
      ],
      medications: state.medications.sessions.find((session) => session.isToday)?.prescriptions ?? [],
      labOrders: state.labOrders.list,
      advices: state.advices.sessions.find((session) => session.isToday)?.advices ?? [],
      discount: 0,
      createdAt: new Date().toISOString(),
    };
  }

  private getDraftStorageKey(appointmentId: string): string {
    return `encounter-draft-${appointmentId}`;
  }
}
