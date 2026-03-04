// src/app/features/patient-profile/medications-section/medications-section.component.ts

import { CommonModule } from '@angular/common';
import { Component, Input } from '@angular/core';
import { FormControl, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';

type MedicineOption = { id: string; label: string };

@Component({
  selector: 'app-medications-section',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],
  template: `
    <section class="card">
      <div class="header">
        <h3>Medications</h3>

        <!-- Clicking this turns on prescribing mode -->
        <button type="button" class="btn" (click)="enablePrescribing()" [disabled]="prescribing">
          Prescribe Medicine
        </button>
      </div>

      <div class="row">
        <div class="field">
          <label>Medicine</label>
          <select class="control" [formControl]="form.controls.medicineId">
            <option value="" disabled>Select</option>
            <option *ngFor="let m of medicines" [value]="m.id">{{ m.label }}</option>
          </select>
        </div>

        <div class="field actions">
          <label>&nbsp;</label>
          <!-- This becomes clickable only after Prescribe Medicine -->
          <button type="button" class="btn outline" (click)="openCreateMedicine()" [disabled]="form.controls.medicineId.disabled">
            + Create New Medicine
          </button>
        </div>
      </div>

      <div class="hint" *ngIf="!prescribing">
        Click <b>Prescribe Medicine</b> to enable medicine selection and creation.
      </div>

      <!-- Example: once medicine is selected you can show the prescription row/table -->
      <div class="prescription" *ngIf="prescribing">
        <form [formGroup]="form" (ngSubmit)="addToPrescription()">
          <div class="row grid">
            <div class="field">
              <label>Dosage</label>
              <input class="control" placeholder="e.g. 1 Tab" formControlName="dosage" />
            </div>

            <div class="field">
              <label>Time</label>
              <input class="control" placeholder="e.g. 1-0-1" formControlName="time" />
            </div>

            <div class="field">
              <label>Days</label>
              <input class="control" type="number" min="1" formControlName="days" />
            </div>

            <div class="field">
              <label>Advice</label>
              <select class="control" formControlName="advice">
                <option value="After Food">After Food</option>
                <option value="Before Food">Before Food</option>
              </select>
            </div>

            <div class="field actions">
              <label>&nbsp;</label>
              <button class="btn" type="submit" [disabled]="form.invalid">Add</button>
            </div>
          </div>
        </form>

        <div class="table" *ngIf="prescribed.length">
          <div class="tr th">
            <div>Medicine</div><div>Dosage</div><div>Time</div><div>Days</div><div>Advice</div><div></div>
          </div>

          <div class="tr" *ngFor="let p of prescribed; let i = index">
            <div>{{ p.medicineLabel }}</div>
            <div>{{ p.dosage }}</div>
            <div>{{ p.time }}</div>
            <div>{{ p.days }}</div>
            <div>{{ p.advice }}</div>
            <div><button type="button" class="icon danger" (click)="remove(i)">🗑️</button></div>
          </div>
        </div>
      </div>

      <!-- Create medicine modal placeholder -->
      <div class="modal" *ngIf="showCreateModal">
        <div class="modal-card">
          <div class="modal-head">
            <h4>Add New Medicine</h4>
            <button type="button" class="icon" (click)="closeCreateMedicine()">✕</button>
          </div>

          <!-- Keep this simple; you can expand with your fields (name, composition, category, supplier, etc.) -->
          <div class="modal-body">
            <input class="control" [(ngModel)]="newMedicineName" placeholder="Medicine name" />
          </div>

          <div class="modal-actions">
            <button type="button" class="btn ghost" (click)="closeCreateMedicine()">Cancel</button>
            <button type="button" class="btn" (click)="createMedicine()" [disabled]="!newMedicineName.trim()">Create</button>
          </div>
        </div>
      </div>
    </section>
  `,
  styles: [`
    .card{ background:#fff; border-radius:14px; padding:16px; box-shadow:0 2px 10px rgba(0,0,0,.06); }
    .header{ display:flex; justify-content:space-between; align-items:center; gap:12px; }
    h3{ margin:0; font-size:18px; }
    .row{ display:flex; gap:12px; margin-top:12px; align-items:flex-end; flex-wrap:wrap; }
    .row.grid{ align-items:end; }
    .field{ display:flex; flex-direction:column; gap:6px; min-width:220px; flex:1; }
    .field.actions{ flex:0 0 auto; min-width:auto; }
    label{ font-size:12px; color:#64748b; }
    .control{ padding:10px; border-radius:10px; border:1px solid #e5e7eb; min-height:40px; }
    .btn{ border:none; padding:10px 12px; border-radius:10px; background:#2563eb; color:#fff; cursor:pointer; }
    .btn.outline{ background:#fff; color:#2563eb; border:1px solid #bfdbfe; }
    .btn.ghost{ background:#eef2ff; color:#1e3a8a; }
    .btn[disabled]{ opacity:.5; cursor:not-allowed; }
    .hint{ margin-top:10px; color:#64748b; font-size:13px; }
    .table{ margin-top:14px; border:1px solid #f1f5f9; border-radius:12px; overflow:hidden; }
    .tr{ display:grid; grid-template-columns: 2fr 1fr 1fr .7fr 1fr 50px; gap:10px; padding:10px 12px; align-items:center; }
    .th{ background:#f8fafc; font-weight:600; color:#0f172a; }
    .icon{ border:none; background:transparent; cursor:pointer; }
    .icon.danger{ color:#ef4444; }

    .modal{ position:fixed; inset:0; background:rgba(0,0,0,.35); display:flex; align-items:center; justify-content:center; padding:20px; }
    .modal-card{ width:min(520px, 100%); background:#fff; border-radius:16px; padding:14px; box-shadow:0 12px 30px rgba(0,0,0,.2); }
    .modal-head{ display:flex; justify-content:space-between; align-items:center; }
    .modal-body{ margin-top:10px; }
    .modal-actions{ margin-top:12px; display:flex; justify-content:flex-end; gap:8px; }
    h4{ margin:0; }
  `]
})
export class MedicationsSectionComponent {
  @Input({ required: true }) patientId!: string;

  prescribing = false;
  showCreateModal = false;

  medicines: MedicineOption[] = [
    { id: 'm1', label: 'T.MOXIKIND CV 625MG - Amoxycillin (500mg) + Clavulanic Acid (125mg)' },
    { id: 'm2', label: 'T.ZERODOL P - Aceclofenac (100mg) + Paracetamol (325mg)' },
  ];

  // Best practice: controls start disabled, and we enable them when prescribing becomes true.
  form = new FormGroup({
    medicineId: new FormControl<string>({ value: '', disabled: true }, { nonNullable: true, validators: [Validators.required] }),
    dosage: new FormControl<string>({ value: '', disabled: true }, { nonNullable: true, validators: [Validators.required] }),
    time: new FormControl<string>({ value: '', disabled: true }, { nonNullable: true, validators: [Validators.required] }),
    days: new FormControl<number>({ value: 1, disabled: true }, { nonNullable: true, validators: [Validators.required, Validators.min(1)] }),
    advice: new FormControl<string>({ value: 'After Food', disabled: true }, { nonNullable: true, validators: [Validators.required] }),
  });

  prescribed: Array<{ medicineLabel: string; dosage: string; time: string; days: number; advice: string }> = [];

  newMedicineName = '';

  enablePrescribing(): void {
    this.prescribing = true;

    // Enable all controls in one place (clean & scalable)
    this.form.enable();

    // If you want, keep prescription inputs disabled until a medicine is chosen:
    // (Uncomment if preferred)
    // this.form.controls.dosage.disable();
    // this.form.controls.time.disable();
    // this.form.controls.days.disable();
    // this.form.controls.advice.disable();
    //
    // this.form.controls.medicineId.valueChanges.subscribe(id => {
    //   const enabled = !!id;
    //   ['dosage','time','days','advice'].forEach(k => enabled ? this.form.controls[k as any].enable() : this.form.controls[k as any].disable());
    // });
  }

  openCreateMedicine(): void {
    this.showCreateModal = true;
    this.newMedicineName = '';
  }

  closeCreateMedicine(): void {
    this.showCreateModal = false;
  }

  createMedicine(): void {
    const name = this.newMedicineName.trim();
    if (!name) return;

    const id = crypto.randomUUID();
    this.medicines = [{ id, label: name }, ...this.medicines];

    // optionally auto-select newly created
    this.form.controls.medicineId.setValue(id);

    this.closeCreateMedicine();
  }

  addToPrescription(): void {
    if (this.form.invalid) return;

    const medId = this.form.controls.medicineId.value;
    const med = this.medicines.find(m => m.id === medId);
    if (!med) return;

    this.prescribed = [
      ...this.prescribed,
      {
        medicineLabel: med.label,
        dosage: this.form.controls.dosage.value,
        time: this.form.controls.time.value,
        days: this.form.controls.days.value,
        advice: this.form.controls.advice.value,
      }
    ];

    // keep medicine selected; reset rest
    this.form.controls.dosage.setValue('');
    this.form.controls.time.setValue('');
    this.form.controls.days.setValue(1);
    this.form.controls.advice.setValue('After Food');
  }

  remove(index: number): void {
    this.prescribed = this.prescribed.filter((_, i) => i !== index);
  }
}