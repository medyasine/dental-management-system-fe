import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import {
  NewPatientDialogComponent,
  NewPatientPayload,
} from './new-patient-dialog/new-patient-dialog.component';

interface PatientRow {
  no: number;
  regDate: string;
  regTime: string;
  name: string;
  phone: string;
  patientId: string;
  gender: string;
  age: number;
  visit: number;
  due: number;
  statusText: string;
  isNewCase: boolean;
}

@Component({
  selector: 'app-patients-page',
  standalone: true,
  imports: [CommonModule, FormsModule, NewPatientDialogComponent],
  template: `
    <div class="patients-page p-4">
      <div class="patients-card">
        <h2>All Patients</h2>

        <div class="toolbar">
          <div class="search-wrap">
            <i class="pi pi-search"></i>
            <input
              type="text"
              [(ngModel)]="search"
              placeholder="Search Patient (name & phone)"
              (input)="applyFilter()" />
          </div>

          <div class="toolbar-actions">
            <button class="btn-teal" type="button" (click)="onImportPatient()">
              <i class="pi pi-plus-circle"></i>
              Import Patient
            </button>
            <button class="btn-teal" type="button" (click)="onNewPatient()">
              <i class="pi pi-plus-circle"></i>
              New Patient
            </button>
          </div>
        </div>

        <div class="table-wrap">
          <table class="patients-table">
            <thead>
              <tr>
                <th>No.</th>
                <th>Reg</th>
                <th>Patient Name</th>
                <th>Phone</th>
                <th>Patient Id</th>
                <th>Gender/Age</th>
                <th>Visit</th>
                <th>Due</th>
                <th>Action</th>
              </tr>
            </thead>
            <tbody>
              <tr *ngFor="let patient of filteredRows">
                <td>{{ patient.no }}</td>
                <td>
                  <div class="reg-col">
                    <strong>{{ patient.regDate }}</strong>
                    <span>{{ patient.regTime }}</span>
                  </div>
                </td>
                <td>
                  <div class="name-col">
                    <span class="avatar" [class.female]="patient.gender === 'Female'"></span>
                    <div>
                      <strong>{{ patient.name }}</strong>
                      <p [class.new-case]="patient.isNewCase" [class.due-case]="!patient.isNewCase">{{ patient.statusText }}</p>
                    </div>
                  </div>
                </td>
                <td>{{ patient.phone }}</td>
                <td>{{ patient.patientId }}</td>
                <td>
                  {{ patient.gender }}<span *ngIf="patient.age > 0"> / {{ patient.age }}</span>
                </td>
                <td>{{ patient.visit }}</td>
                <td>{{ patient.due | number: '1.2-2' }}</td>
                <td>
                  <div class="row-actions">
                    <button class="icon-btn" type="button" (click)="openPatient(patient)">
                      <i class="pi pi-eye"></i>
                    </button>
                    <button class="icon-btn" type="button" (click)="editPatient(patient)">
                      <i class="pi pi-pencil"></i>
                    </button>
                    <button class="icon-btn danger" type="button" (click)="deletePatient(patient)">
                      <i class="pi pi-trash"></i>
                    </button>
                  </div>
                </td>
              </tr>

              <tr *ngIf="filteredRows.length === 0">
                <td colspan="9" class="empty-row">No patients found.</td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>
    </div>

    <app-new-patient-dialog
      [(visible)]="showNewPatientDialog"
      (save)="createPatient($event)">
    </app-new-patient-dialog>
  `,
  styles: [
    `
      .patients-page {
        background: var(--surface-ground);
        min-height: 100vh;
      }

      .patients-card {
        background: #fff;
        border: 1px solid #e5e7eb;
        border-radius: 14px;
        margin: 0 auto;
        max-width: 1420px;
        padding: 1.25rem;

        h2 {
          color: #1f2937;
          font-size: 2rem;
          font-weight: 700;
          margin: 0 0 1rem;
        }
      }

      .toolbar {
        align-items: center;
        display: flex;
        gap: 0.8rem;
        justify-content: space-between;
        margin-bottom: 0.9rem;
      }

      .search-wrap {
        align-items: center;
        background: #f8f8fc;
        border: 1px solid #edf1f5;
        border-radius: 10px;
        display: flex;
        gap: 0.6rem;
        max-width: 760px;
        min-height: 48px;
        padding: 0 0.9rem;
        width: 100%;

        i {
          color: #9ca3af;
        }

        input {
          background: transparent;
          border: none;
          color: #374151;
          font-size: 0.95rem;
          outline: none;
          width: 100%;
        }
      }

      .toolbar-actions {
        display: flex;
        gap: 0.55rem;
      }

      .btn-teal {
        align-items: center;
        background: #22cfa2;
        border: none;
        border-radius: 10px;
        color: #fff;
        cursor: pointer;
        display: inline-flex;
        font-size: 0.95rem;
        font-weight: 700;
        gap: 0.45rem;
        min-height: 48px;
        padding: 0 1.1rem;

        &:hover {
          background: #16b892;
        }
      }

      .table-wrap {
        overflow-x: auto;
      }

      .patients-table {
        border-collapse: separate;
        border-spacing: 0;
        min-width: 1120px;
        width: 100%;

        th {
          background: #f3f4f6;
          color: #9ca3af;
          font-size: 0.84rem;
          font-weight: 600;
          padding: 0.7rem 0.6rem;
          text-align: left;
        }

        td {
          border-bottom: 1px solid #f0f2f4;
          color: #374151;
          font-size: 0.95rem;
          padding: 0.8rem 0.62rem;
          vertical-align: middle;
        }
      }

      .reg-col {
        display: flex;
        flex-direction: column;
        gap: 0.1rem;

        strong {
          font-size: 0.95rem;
        }
        span {
          color: #9ca3af;
          font-size: 0.85rem;
        }
      }

      .name-col {
        align-items: center;
        display: flex;
        gap: 0.55rem;

        strong {
          color: #1f2937;
          display: block;
          font-size: 0.97rem;
        }

        p {
          font-size: 0.86rem;
          margin: 0.1rem 0 0;
        }
      }

      .avatar {
        background: #22cfa2;
        border-radius: 999px;
        display: inline-block;
        flex-shrink: 0;
        height: 30px;
        width: 30px;

        &.female {
          background: #14b8a6;
        }
      }

      .new-case {
        color: #3b82f6;
      }
      .due-case {
        color: #f59e0b;
      }

      .row-actions {
        display: flex;
        gap: 0.45rem;
      }

      .icon-btn {
        align-items: center;
        background: #fff;
        border: 1px solid #e5e7eb;
        border-radius: 8px;
        color: #6b7280;
        cursor: pointer;
        display: inline-flex;
        font-size: 0.9rem;
        height: 34px;
        justify-content: center;
        width: 34px;

        &.danger {
          color: #ef4444;
        }
      }

      .empty-row {
        color: #9ca3af;
        font-style: italic;
        text-align: center;
      }

      @media (max-width: 980px) {
        .toolbar {
          align-items: stretch;
          flex-direction: column;
        }

        .search-wrap,
        .toolbar-actions {
          width: 100%;
        }

        .toolbar-actions {
          justify-content: stretch;
        }

        .btn-teal {
          flex: 1;
          justify-content: center;
        }
      }
    `,
  ],
})
export class PatientsPage {
  search = '';
  showNewPatientDialog = false;

  rows: PatientRow[] = [
    { no: 1, regDate: '27-09-25', regTime: '1:04 AM', name: 'Dheeraj T', phone: '9539192684', patientId: 'C66E4', gender: 'Male', age: 32, visit: 18, due: 91897, statusText: 'Due: INR 91897', isNewCase: false },
    { no: 2, regDate: '27-09-25', regTime: '1:12 AM', name: 'Majid', phone: '8129634727', patientId: 'B20F8', gender: 'Male', age: 29, visit: 1, due: 0, statusText: 'New Case', isNewCase: true },
    { no: 3, regDate: '27-09-25', regTime: '10:48 AM', name: 'Shahabas', phone: '7356382633', patientId: '34588', gender: 'Male', age: 41, visit: 4, due: 300, statusText: 'Due: INR 300', isNewCase: false },
    { no: 4, regDate: '27-09-25', regTime: '11:34 AM', name: 'harshad', phone: '9995960143', patientId: '4F08D', gender: 'Male', age: 35, visit: 12, due: 500, statusText: 'Due: INR 500', isNewCase: false },
    { no: 5, regDate: '28-09-25', regTime: '9:27 AM', name: 'Bunu', phone: '9207893110', patientId: 'E563A', gender: 'Male', age: 30, visit: 1, due: 0, statusText: 'New Case', isNewCase: true },
    { no: 6, regDate: '02-10-25', regTime: '3:38 PM', name: 'Shahin', phone: '9048123588', patientId: '43197', gender: 'Male', age: 46, visit: 1, due: 0, statusText: 'New Case', isNewCase: true },
    { no: 7, regDate: '06-10-25', regTime: '12:49 PM', name: 'Eva', phone: '9995960143', patientId: '84F4A', gender: 'Female', age: 8, visit: 5, due: 4388, statusText: 'Due: INR 4388', isNewCase: false },
    { no: 8, regDate: '09-10-25', regTime: '1:19 PM', name: 'navyatha', phone: '7902235643', patientId: '57081', gender: 'Female', age: 26, visit: 2, due: 0, statusText: 'New Case', isNewCase: true },
  ];

  filteredRows: PatientRow[] = [...this.rows];

  constructor(private readonly router: Router) {}

  applyFilter(): void {
    const q = this.search.toLowerCase().trim();
    this.filteredRows = this.rows.filter((row) => row.name.toLowerCase().includes(q) || row.phone.includes(q));
  }

  onImportPatient(): void {
    console.log('Import patient');
  }

  onNewPatient(): void {
    this.showNewPatientDialog = true;
  }

    createPatient(payload: NewPatientPayload): void {
    const now = new Date();
    const nextNo = Math.max(...this.rows.map((row) => row.no), 0) + 1;
    const fullName = `${payload.firstName} ${payload.lastName}`.trim();
    const age = this.calculateAge(payload.birthDate);
    const newPatient: PatientRow = {
      no: nextNo,
      regDate: now.toLocaleDateString('en-GB').replace(/\//g, '-'),
      regTime: now.toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit' }),
      name: fullName,
      phone: payload.phone || '-',
      patientId: Math.random().toString(16).slice(2, 7).toUpperCase(),
      gender: '—',
      age,
      visit: 1,
      due: 0,
      statusText: 'New Case',
      isNewCase: true,
    };

    this.rows = [newPatient, ...this.rows];
    this.applyFilter();
  }

  private calculateAge(birthDate: string): number {
    if (!birthDate) {
      return 0;
    }

    const dob = new Date(birthDate);
    if (Number.isNaN(dob.getTime())) {
      return 0;
    }

    const today = new Date();
    let age = today.getFullYear() - dob.getFullYear();
    const hasBirthdayPassed =
      today.getMonth() > dob.getMonth() ||
      (today.getMonth() === dob.getMonth() && today.getDate() >= dob.getDate());

    if (!hasBirthdayPassed) {
      age -= 1;
    }

    return age > 0 ? age : 0;
  }
  openPatient(patient: PatientRow): void {
    this.router.navigate(['/app/patient-profile', patient.no]);
  }

  editPatient(patient: PatientRow): void {
    console.log('Edit patient', patient.no);
  }

  deletePatient(patient: PatientRow): void {
    this.filteredRows = this.filteredRows.filter((row) => row.no !== patient.no);
    this.rows = this.rows.filter((row) => row.no !== patient.no);
  }
}



