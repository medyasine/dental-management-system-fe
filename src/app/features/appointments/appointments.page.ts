import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import {
  NewAppointmentDialogComponent,
  NewAppointmentPayload,
} from './new-appointment-dialog/new-appointment-dialog.component';

interface AppointmentRow {
  no: number;
  dateTimeIso: string;
  token: number;
  patient: string;
  phone: string;
  gender: string;
  age: number;
  complaints: string;
  doctorName: string;
  durationMinutes: number;
  status: 'Completed' | 'Pending' | 'Checked-In' | 'Cancelled';
}

type AppointmentTab = 'appointment' | 'check-in' | 'recall' | 'calendar';
type QuickFilter = 'today' | 'yesterday' | 'month';

@Component({
  selector: 'app-appointments-page',
  standalone: true,
  imports: [CommonModule, FormsModule, NewAppointmentDialogComponent],
  template: `
    <div class="appointments-page p-4">
      <div class="appointments-shell">
        <div class="header-row">
          <div class="tabs" role="tablist" aria-label="Appointment Views">
            <button type="button" [class.active]="activeTab === 'appointment'" (click)="setTab('appointment')">Appointment</button>
            <button type="button" [class.active]="activeTab === 'check-in'" (click)="setTab('check-in')">Check in</button>
            <button type="button" [class.active]="activeTab === 'recall'" (click)="setTab('recall')">Re-Call</button>
            <button type="button" [class.active]="activeTab === 'calendar'" (click)="setTab('calendar')">Calender</button>
          </div>

          <button class="btn-new" type="button" (click)="onNewAppointment()">
            <i class="pi pi-plus-circle"></i>
            New Appointment
          </button>
        </div>

        <div class="card">
          <div class="toolbar">
            <h2>Appointments</h2>

            <div class="search-wrap">
              <i class="pi pi-search"></i>
              <input
                type="text"
                [(ngModel)]="search"
                (input)="applyFilters()"
                placeholder="Search Appointment (Patient name / phone)" />
            </div>

            <div class="date-range-wrap">
              <i class="pi pi-calendar"></i>
              <input
                type="text"
                [(ngModel)]="dateRangeText"
                placeholder="mm/dd/yyyy - mm/dd/yyyy"
                (input)="applyFilters()" />
            </div>

            <div class="quick-filters">
              <button
                type="button"
                *ngFor="let option of quickFilterOptions"
                [class.active]="activeQuickFilter === option.value"
                (click)="setQuickFilter(option.value)">
                {{ option.label }}
              </button>
            </div>
          </div>

          <div class="table-wrap">
            <table>
              <thead>
                <tr>
                  <th>No.</th>
                  <th>Date/Time</th>
                  <th>Token</th>
                  <th>Patient</th>
                  <th>Phone</th>
                  <th>Gender</th>
                  <th>Age</th>
                  <th>Complaints</th>
                  <th>Dr Name</th>
                  <th>Duration</th>
                  <th>Status</th>
                  <th>Action</th>
                </tr>
              </thead>

              <tbody>
                <tr *ngFor="let row of filteredRows" [class.row-completed]="row.status === 'Completed'">
                  <td>{{ row.no }}</td>
                  <td>
                    <div class="date-col">
                      <strong>{{ formatDate(row.dateTimeIso) }}</strong>
                      <span>{{ formatTime(row.dateTimeIso) }}</span>
                    </div>
                  </td>
                  <td>{{ row.token }}</td>
                  <td>
                    <div class="patient-col">
                      <span class="patient-dot"></span>
                      <span>{{ row.patient }}</span>
                    </div>
                  </td>
                  <td>{{ row.phone }}</td>
                  <td>{{ row.gender }}</td>
                  <td>{{ row.age || '-' }}</td>
                  <td>{{ row.complaints }}</td>
                  <td>{{ row.doctorName }}</td>
                  <td>{{ row.durationMinutes }} mins</td>
                  <td>
                    <span class="status" [ngClass]="statusClass(row.status)">{{ row.status }}</span>
                  </td>
                  <td>
                    <div class="actions">
                      <button type="button" (click)="onView(row)"><i class="pi pi-eye"></i></button>
                      <button type="button" (click)="onEdit(row)"><i class="pi pi-pencil"></i></button>
                      <button type="button" class="danger" (click)="onDelete(row)"><i class="pi pi-trash"></i></button>
                    </div>
                  </td>
                </tr>

                <tr *ngIf="filteredRows.length === 0">
                  <td colspan="12" class="empty">No appointments found.</td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>

    <app-new-appointment-dialog
      [(visible)]="showNewAppointmentDialog"
      (save)="createAppointment($event)">
    </app-new-appointment-dialog>
  `,
  styles: [
    `
      .appointments-page {
        background: var(--surface-ground);
        min-height: 100vh;
      }

      .appointments-shell {
        margin: 0 auto;
        max-width: 1440px;
      }

      .header-row {
        align-items: center;
        display: flex;
        justify-content: space-between;
        margin-bottom: 1rem;
      }

      .tabs {
        background: #f3f4f6;
        border-radius: 10px;
        display: inline-flex;
        padding: 0.25rem;

        button {
          background: transparent;
          border: none;
          border-radius: 8px;
          color: #374151;
          cursor: pointer;
          font-size: 1.02rem;
          font-weight: 600;
          min-height: 42px;
          padding: 0 1.15rem;
        }

        button.active {
          background: #21cfa1;
          color: #fff;
        }
      }

      .btn-new {
        align-items: center;
        background: #21cfa1;
        border: none;
        border-radius: 10px;
        color: #fff;
        cursor: pointer;
        display: inline-flex;
        font-size: 1rem;
        font-weight: 700;
        gap: 0.5rem;
        min-height: 44px;
        padding: 0 1.15rem;
      }

      .card {
        background: #fff;
        border: 1px solid #e5e7eb;
        border-radius: 14px;
        padding: 1rem;
      }

      .toolbar {
        align-items: center;
        display: grid;
        gap: 0.8rem;
        grid-template-columns: auto minmax(260px, 1fr) 290px auto;
        margin-bottom: 1rem;

        h2 {
          color: #1f2937;
          font-size: 2rem;
          margin: 0;
        }
      }

      .search-wrap,
      .date-range-wrap {
        align-items: center;
        background: #f8f8fc;
        border: 1px solid #edf1f5;
        border-radius: 10px;
        display: flex;
        gap: 0.55rem;
        min-height: 44px;
        padding: 0 0.8rem;

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

      .quick-filters {
        background: #f3f4f6;
        border-radius: 10px;
        display: inline-flex;
        padding: 0.2rem;

        button {
          background: transparent;
          border: none;
          border-radius: 8px;
          color: #6b7280;
          cursor: pointer;
          font-size: 0.96rem;
          font-weight: 600;
          min-height: 40px;
          padding: 0 0.95rem;
        }

        button.active {
          background: #21cfa1;
          color: #fff;
        }
      }

      .table-wrap {
        overflow-x: auto;
      }

      table {
        border-collapse: separate;
        border-spacing: 0;
        min-width: 1280px;
        width: 100%;

        th {
          background: #f7f4f5;
          color: #9ca3af;
          font-size: 0.84rem;
          font-weight: 600;
          padding: 0.72rem 0.6rem;
          text-align: left;
        }

        td {
          border-bottom: 1px solid #f0f2f4;
          color: #334155;
          font-size: 0.97rem;
          padding: 0.75rem 0.6rem;
          vertical-align: middle;
        }
      }

      .row-completed td {
        background: #effcf6;
      }

      .date-col {
        display: flex;
        flex-direction: column;
        gap: 0.08rem;

        strong {
          font-size: 0.96rem;
          font-weight: 700;
        }

        span {
          color: #6b7280;
          font-size: 0.9rem;
        }
      }

      .patient-col {
        align-items: center;
        display: inline-flex;
        gap: 0.45rem;
      }

      .patient-dot {
        background: #f6ac2e;
        border-radius: 3px;
        height: 12px;
        width: 12px;
      }

      .status {
        align-items: center;
        border: 1px solid #d1d5db;
        border-radius: 999px;
        display: inline-flex;
        font-size: 0.84rem;
        font-weight: 700;
        line-height: 1;
        min-height: 28px;
        padding: 0 0.75rem;
      }

      .status-completed {
        background: #dcfce7;
        border-color: #86efac;
        color: #166534;
      }

      .status-pending {
        background: #e5e7eb;
        border-color: #d1d5db;
        color: #374151;
      }

      .status-checked-in {
        background: #fef3c7;
        border-color: #fcd34d;
        color: #92400e;
      }

      .status-cancelled {
        background: #fee2e2;
        border-color: #fca5a5;
        color: #991b1b;
      }

      .actions {
        display: inline-flex;
        gap: 0.35rem;

        button {
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
        }

        button.danger {
          color: #ef4444;
        }
      }

      .empty {
        color: #9ca3af;
        font-style: italic;
        text-align: center;
      }

      @media (max-width: 1200px) {
        .toolbar {
          grid-template-columns: 1fr;

          h2 {
            font-size: 1.6rem;
          }
        }

        .quick-filters {
          justify-self: start;
        }
      }

      @media (max-width: 980px) {
        .header-row {
          align-items: stretch;
          flex-direction: column;
          gap: 0.75rem;
        }

        .tabs {
          overflow-x: auto;
          width: 100%;
        }

        .btn-new {
          justify-content: center;
          width: 100%;
        }
      }
    `,
  ],
})
export class AppointmentsPage {
  activeTab: AppointmentTab = 'appointment';
  activeQuickFilter: QuickFilter = 'today';
  search = '';
  dateRangeText = '';
  showNewAppointmentDialog = false;

  quickFilterOptions: Array<{ label: string; value: QuickFilter }> = [
    { label: 'Today', value: 'today' },
    { label: 'Yesterday', value: 'yesterday' },
    { label: 'This Month', value: 'month' },
  ];

  rows: AppointmentRow[] = [
    {
      no: 1,
      dateTimeIso: '2025-11-11T15:20:00',
      token: 3,
      patient: 'Eva',
      phone: '9995960143',
      gender: 'Female',
      age: 8,
      complaints: 'Broken Filling',
      doctorName: 'Dr. Arjun',
      durationMinutes: 15,
      status: 'Completed',
    },
    {
      no: 2,
      dateTimeIso: '2025-11-11T10:15:00',
      token: 2,
      patient: 'Eva',
      phone: '9995960143',
      gender: 'Female',
      age: 8,
      complaints: 'Pain',
      doctorName: 'Dr. Arjun',
      durationMinutes: 15,
      status: 'Completed',
    },
    {
      no: 3,
      dateTimeIso: '2025-11-11T09:05:00',
      token: 1,
      patient: 'Dheeraj T',
      phone: '9539192684',
      gender: 'Male',
      age: 23,
      complaints: 'Discolouration Of Tooth',
      doctorName: 'Dr. Arjun',
      durationMinutes: 30,
      status: 'Pending',
    },
  ];

  filteredRows: AppointmentRow[] = [...this.rows];

  setTab(tab: AppointmentTab): void {
    this.activeTab = tab;
  }

  setQuickFilter(filter: QuickFilter): void {
    this.activeQuickFilter = filter;
    this.applyFilters();
  }

  applyFilters(): void {
    const q = this.search.toLowerCase().trim();
    const now = new Date();

    this.filteredRows = this.rows.filter((row) => {
      const date = new Date(row.dateTimeIso);
      const matchesSearch =
        row.patient.toLowerCase().includes(q) || row.phone.includes(q) || row.complaints.toLowerCase().includes(q);

      if (!matchesSearch) {
        return false;
      }

      if (this.activeQuickFilter === 'today') {
        return this.isSameDay(date, now);
      }

      if (this.activeQuickFilter === 'yesterday') {
        const yesterday = new Date(now);
        yesterday.setDate(now.getDate() - 1);
        return this.isSameDay(date, yesterday);
      }

      if (this.activeQuickFilter === 'month') {
        return date.getFullYear() === now.getFullYear() && date.getMonth() === now.getMonth();
      }

      return true;
    });
  }

  statusClass(status: AppointmentRow['status']): string {
    return `status-${status.toLowerCase().replace(' ', '-')}`;
  }

  formatDate(iso: string): string {
    return new Date(iso).toLocaleDateString('en-GB', { day: '2-digit', month: '2-digit', year: '2-digit' });
  }

  formatTime(iso: string): string {
    return new Date(iso).toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit', hour12: true });
  }

  onNewAppointment(): void {
    this.showNewAppointmentDialog = true;
  }

  createAppointment(payload: NewAppointmentPayload): void {
    const nextNo = Math.max(...this.rows.map((row) => row.no), 0) + 1;
    const nextToken = Math.max(...this.rows.map((row) => row.token), 0) + 1;

    const newRow: AppointmentRow = {
      no: nextNo,
      dateTimeIso: this.buildIsoDateTime(payload),
      token: nextToken,
      patient: payload.patientName,
      phone: payload.mobileNumber,
      gender: '-',
      age: payload.age ?? 0,
      complaints: payload.complaint,
      doctorName: payload.doctor,
      durationMinutes: payload.durationMinutes,
      status: 'Pending',
    };

    this.rows = [newRow, ...this.rows];
    this.applyFilters();
  }

  onView(row: AppointmentRow): void {
    console.log('View appointment', row.no);
  }

  onEdit(row: AppointmentRow): void {
    console.log('Edit appointment', row.no);
  }

  onDelete(row: AppointmentRow): void {
    this.rows = this.rows.filter((item) => item.no !== row.no);
    this.applyFilters();
  }

  private buildIsoDateTime(payload: NewAppointmentPayload): string {
    const hour24 = this.to24Hour(payload.hour, payload.meridiem);
    return `${payload.appointmentDate}T${hour24}:${payload.minute}:00`;
  }

  private to24Hour(hour12: string, meridiem: 'AM' | 'PM'): string {
    let hour = Number.parseInt(hour12, 10);

    if (meridiem === 'AM' && hour === 12) {
      hour = 0;
    }

    if (meridiem === 'PM' && hour < 12) {
      hour += 12;
    }

    return hour.toString().padStart(2, '0');
  }

  private isSameDay(a: Date, b: Date): boolean {
    return a.getFullYear() === b.getFullYear() && a.getMonth() === b.getMonth() && a.getDate() === b.getDate();
  }
}

