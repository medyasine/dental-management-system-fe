import { Component, EventEmitter, Input, Output } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

export interface NewAppointmentPayload {
  mobileNumber: string;
  patientName: string;
  age: number | null;
  doctor: string;
  location: string;
  appointmentDate: string;
  hour: string;
  minute: string;
  meridiem: 'AM' | 'PM';
  durationMinutes: number;
  complaint: string;
  notes: string;
}

@Component({
  selector: 'app-new-appointment-dialog',
  standalone: true,
  imports: [CommonModule, FormsModule],
  template: `
    <div class="dialog-backdrop" *ngIf="visible" (click)="close()">
      <div class="dialog" (click)="$event.stopPropagation()">
        <div class="dialog-header">
          <h3>Add New Appointment</h3>
          <button type="button" class="close-btn" (click)="close()"><i class="pi pi-times"></i></button>
        </div>

        <div class="dialog-body">
          <div class="grid-2">
            <div class="field">
              <label>Mobile Number *</label>
              <input [(ngModel)]="model.mobileNumber" type="text" placeholder="Enter mobile number" />
            </div>

            <div class="field">
              <label>Patient Name *</label>
              <input [(ngModel)]="model.patientName" type="text" placeholder="Enter patient name" />
            </div>
          </div>

          <div class="grid-2">
            <div class="field">
              <label>Location</label>
              <input [(ngModel)]="model.location" type="text" placeholder="Enter location" />
            </div>

            <div class="field">
              <label>Doctor *</label>
              <select [(ngModel)]="model.doctor">
                <option [ngValue]="''">Select doctor</option>
                <option *ngFor="let doctor of doctorOptions" [ngValue]="doctor">{{ doctor }}</option>
              </select>
            </div>
          </div>

          <div class="grid-3">
            <div class="field">
              <label>Appointment Date *</label>
              <input [(ngModel)]="model.appointmentDate" type="date" />
            </div>

            <div class="field">
              <label>Age</label>
              <input [(ngModel)]="model.age" type="number" min="1" max="120" placeholder="Enter age" />
            </div>

            <div class="field">
              <label>Duration *</label>
              <select [(ngModel)]="model.durationMinutes">
                <option [ngValue]="0">Select duration</option>
                <option *ngFor="let duration of durationOptions" [ngValue]="duration">{{ duration }} mins</option>
              </select>
            </div>
          </div>

          <div class="time-row">
            <label>Time *</label>
            <div class="time-selects">
              <select [(ngModel)]="model.hour">
                <option *ngFor="let hour of hourOptions" [ngValue]="hour">{{ hour }}</option>
              </select>
              <span>:</span>
              <select [(ngModel)]="model.minute">
                <option *ngFor="let minute of minuteOptions" [ngValue]="minute">{{ minute }}</option>
              </select>
              <select [(ngModel)]="model.meridiem">
                <option value="AM">AM</option>
                <option value="PM">PM</option>
              </select>
            </div>
          </div>

          <div class="field">
            <label>Patient Complaint *</label>
            <input [(ngModel)]="model.complaint" type="text" placeholder="Search & Select" />
          </div>

          <div class="field">
            <label>Notes</label>
            <textarea [(ngModel)]="model.notes" rows="3" placeholder="Enter notes"></textarea>
          </div>
        </div>

        <div class="dialog-footer">
          <button class="btn-outline" type="button" (click)="close()">Cancel</button>
          <button class="btn-primary" type="button" [disabled]="!canSave" (click)="submit()">Create Appointment</button>
        </div>
      </div>
    </div>
  `,
  styles: [
    `
      .dialog-backdrop {
        align-items: center;
        animation: backdrop-fade 160ms ease;
        background: rgba(15, 23, 42, 0.32);
        display: flex;
        inset: 0;
        justify-content: center;
        padding: 1rem;
        position: fixed;
        z-index: 1400;
      }

      .dialog {
        animation: dialog-pop 180ms ease;
        background: #fff;
        border-radius: 16px;
        box-shadow: 0 28px 56px rgba(15, 23, 42, 0.2);
        max-height: calc(100vh - 2rem);
        max-width: 920px;
        overflow-y: auto;
        width: 100%;
      }

      .dialog-header {
        align-items: center;
        border-bottom: 1px solid #eef2f7;
        display: flex;
        justify-content: space-between;
        padding: 1.1rem 1.4rem;

        h3 {
          color: #0f172a;
          font-size: 2rem;
          font-weight: 700;
          margin: 0;
        }
      }

      .close-btn {
        align-items: center;
        background: #f8fafc;
        border: 1px solid #e2e8f0;
        border-radius: 8px;
        color: #64748b;
        cursor: pointer;
        display: inline-flex;
        height: 34px;
        justify-content: center;
        width: 34px;
      }

      .dialog-body {
        display: flex;
        flex-direction: column;
        gap: 0.9rem;
        padding: 1.2rem 1.4rem;
      }

      .grid-2,
      .grid-3 {
        display: grid;
        gap: 0.75rem;
      }

      .grid-2 {
        grid-template-columns: 1fr 1fr;
      }

      .grid-3 {
        grid-template-columns: 1.1fr 0.8fr 1fr;
      }

      .field {
        display: flex;
        flex-direction: column;
        gap: 0.3rem;

        label {
          color: #334155;
          font-size: 0.98rem;
          font-weight: 600;
        }

        input,
        select,
        textarea {
          background: #f8f8fc;
          border: 1px solid #edf1f5;
          border-radius: 10px;
          color: #334155;
          font-size: 0.95rem;
          min-height: 44px;
          padding: 0.55rem 0.75rem;
        }

        textarea {
          min-height: 92px;
          resize: vertical;
        }
      }

      .time-row {
        display: flex;
        flex-direction: column;
        gap: 0.3rem;

        label {
          color: #334155;
          font-size: 0.98rem;
          font-weight: 600;
        }
      }

      .time-selects {
        align-items: center;
        display: flex;
        gap: 0.5rem;

        span {
          color: #64748b;
          font-weight: 700;
        }

        select {
          background: #f8f8fc;
          border: 1px solid #edf1f5;
          border-radius: 10px;
          min-height: 44px;
          min-width: 86px;
          padding: 0.5rem 0.55rem;
        }
      }

      .dialog-footer {
        border-top: 1px solid #eef2f7;
        display: flex;
        gap: 0.5rem;
        justify-content: flex-end;
        padding: 1rem 1.4rem 1.2rem;
      }

      .btn-outline,
      .btn-primary {
        border-radius: 9px;
        font-size: 0.92rem;
        font-weight: 700;
        min-height: 42px;
        padding: 0 1rem;
      }

      .btn-outline {
        background: #fff;
        border: 1px solid #d1d5db;
        color: #334155;
        cursor: pointer;
      }

      .btn-primary {
        background: #21cfa1;
        border: none;
        color: #fff;
        cursor: pointer;

        &:disabled {
          cursor: not-allowed;
          opacity: 0.5;
        }
      }

      @keyframes backdrop-fade {
        from {
          opacity: 0;
        }
        to {
          opacity: 1;
        }
      }

      @keyframes dialog-pop {
        from {
          opacity: 0;
          transform: translateY(8px) scale(0.98);
        }
        to {
          opacity: 1;
          transform: translateY(0) scale(1);
        }
      }

      @media (max-width: 900px) {
        .grid-2,
        .grid-3 {
          grid-template-columns: 1fr;
        }

        .time-selects {
          flex-wrap: wrap;
        }
      }
    `,
  ],
})
export class NewAppointmentDialogComponent {
  @Input() visible = false;
  @Output() visibleChange = new EventEmitter<boolean>();
  @Output() save = new EventEmitter<NewAppointmentPayload>();

  readonly doctorOptions = ['Dr. Arjun', 'Dr. Neha', 'Dr. Vivek'];
  readonly durationOptions = [15, 30, 45, 60];
  readonly hourOptions = ['01', '02', '03', '04', '05', '06', '07', '08', '09', '10', '11', '12'];
  readonly minuteOptions = ['00', '15', '30', '45'];

  model: NewAppointmentPayload = {
    mobileNumber: '',
    patientName: '',
    age: null,
    doctor: '',
    location: '',
    appointmentDate: '',
    hour: '09',
    minute: '00',
    meridiem: 'AM',
    durationMinutes: 0,
    complaint: '',
    notes: '',
  };

  get canSave(): boolean {
    return (
      this.model.mobileNumber.trim().length >= 8 &&
      this.model.patientName.trim().length >= 2 &&
      !!this.model.doctor &&
      !!this.model.appointmentDate &&
      this.model.durationMinutes > 0 &&
      this.model.complaint.trim().length >= 2
    );
  }

  close(): void {
    this.visible = false;
    this.visibleChange.emit(false);
  }

  submit(): void {
    if (!this.canSave) {
      return;
    }

    this.save.emit({
      ...this.model,
      mobileNumber: this.model.mobileNumber.trim(),
      patientName: this.model.patientName.trim(),
      complaint: this.model.complaint.trim(),
      notes: this.model.notes.trim(),
      location: this.model.location.trim(),
    });

    this.model = {
      mobileNumber: '',
      patientName: '',
      age: null,
      doctor: '',
      location: '',
      appointmentDate: '',
      hour: '09',
      minute: '00',
      meridiem: 'AM',
      durationMinutes: 0,
      complaint: '',
      notes: '',
    };

    this.close();
  }
}
