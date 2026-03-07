import { Component, EventEmitter, Input, Output } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

export interface NewPatientPayload {
  firstName: string;
  lastName: string;
  phone: string;
  email: string;
  birthDate: string;
  medicalHistory: string;
  allergies: string;
}

@Component({
  selector: 'app-new-patient-dialog',
  standalone: true,
  imports: [CommonModule, FormsModule],
  template: `
    <div class="dialog-backdrop" *ngIf="visible" (click)="close()">
      <div class="dialog" (click)="$event.stopPropagation()">
        <div class="dialog-header">
          <div>
            <h3>Add New Patient</h3>
          
          </div>
          <button type="button" class="close-btn" (click)="close()">
            <i class="pi pi-times"></i>
          </button>
        </div>

        <div class="dialog-body">
          <div class="grid-2">
            <div class="field">
              <label>First Name *</label>
              <input [(ngModel)]="model.firstName" type="text" placeholder="Enter first name" />
            </div>

            <div class="field">
              <label>Last Name *</label>
              <input [(ngModel)]="model.lastName" type="text" placeholder="Enter last name" />
            </div>
          </div>

          <div class="grid-2">
            <div class="field">
              <label>Phone</label>
              <input [(ngModel)]="model.phone" type="text" placeholder="Enter phone number" />
            </div>

            <div class="field">
              <label>Email</label>
              <input [(ngModel)]="model.email" type="email" placeholder="Enter email address" />
            </div>
          </div>

          <div class="field">
            <label>Birth Date</label>
            <input [(ngModel)]="model.birthDate" type="date" />
          </div>

          <div class="field">
            <label>Medical History</label>
            <textarea
              [(ngModel)]="model.medicalHistory"
              rows="3"
              placeholder="Enter previous conditions, surgeries, long-term issues"></textarea>
          </div>

          <div class="field">
            <label>Allergies</label>
            <textarea
              [(ngModel)]="model.allergies"
              rows="3"
              placeholder="Enter drug, food, or material allergies"></textarea>
          </div>
        </div>

        <div class="dialog-footer">
          <button type="button" class="btn-outline" (click)="close()">Cancel</button>
          <button type="button" class="btn-primary" [disabled]="!canSave" (click)="submit()">Create Patient</button>
        </div>
      </div>
    </div>
  `,
  styles: [`
    .dialog-backdrop {
      align-items: center;
      background: rgba(15, 23, 42, 0.28);
      display: flex;
      inset: 0;
      justify-content: center;
      padding: 1.5rem;
      position: fixed;
      z-index: 1200;
    }

    .dialog {
      background: #fff;
      border-radius: 16px;
      box-shadow: 0 24px 48px rgba(15, 23, 42, 0.2);
      max-width: 760px;
      width: 100%;
    }

    .dialog-header {
      align-items: center;
      border-bottom: 1px solid #f1f5f9;
      display: flex;
      justify-content: space-between;
      padding: 1.25rem 1.5rem 1rem;

      h3 {
        color: #0f172a;
        font-size: 1.28rem;
        font-weight: 700;
        margin: 0;
      }

      p {
        color: #64748b;
        font-size: 0.86rem;
        margin: 0.2rem 0 0;
      }
    }

    .close-btn {
      align-items: center;
      background: #f8fafc;
      border: 1px solid #e2e8f0;
      border-radius: 8px;
      color: #6b7280;
      cursor: pointer;
      display: inline-flex;
      font-size: 0.9rem;
      height: 34px;
      justify-content: center;
      width: 34px;
    }

    .dialog-body {
      display: flex;
      flex-direction: column;
      gap: 0.95rem;
      padding: 1.2rem 1.5rem 1.3rem;
    }

    .field {
      display: flex;
      flex-direction: column;
      gap: 0.3rem;

      label {
        color: #334155;
        font-size: 0.86rem;
        font-weight: 600;
      }

      input,
      textarea {
        background: #f8fafc;
        border: 1px solid #e2e8f0;
        border-radius: 8px;
        font-size: 0.9rem;
        min-height: 42px;
        padding: 0.5rem 0.75rem;
      }

      textarea {
        min-height: 88px;
        resize: vertical;
      }
    }

    .grid-2 {
      display: grid;
      gap: 0.7rem;
      grid-template-columns: 1fr 1fr;
    }

    .dialog-footer {
      border-top: 1px solid #f1f5f9;
      display: flex;
      gap: 0.5rem;
      justify-content: flex-end;
      padding: 1rem 1.5rem 1.25rem;
    }

    .btn-outline,
    .btn-primary {
      border-radius: 8px;
      font-size: 0.88rem;
      font-weight: 700;
      min-height: 40px;
      padding: 0 1rem;
    }

    .btn-outline {
      background: #fff;
      border: 1px solid #d1d5db;
      color: #334155;
      cursor: pointer;
    }

    .btn-primary {
      background: #22cfa2;
      border: none;
      color: #fff;
      cursor: pointer;

      &:disabled {
        cursor: not-allowed;
        opacity: 0.5;
      }
    }

    @media (max-width: 640px) {
      .dialog-backdrop {
        padding: 0.75rem;
      }

      .grid-2 {
        grid-template-columns: 1fr;
      }

      .dialog-header,
      .dialog-body,
      .dialog-footer {
        padding-left: 1rem;
        padding-right: 1rem;
      }
    }
  `],
})
export class NewPatientDialogComponent {
  @Input() visible = false;
  @Output() visibleChange = new EventEmitter<boolean>();
  @Output() save = new EventEmitter<NewPatientPayload>();

  model: NewPatientPayload = {
    firstName: '',
    lastName: '',
    phone: '',
    email: '',
    birthDate: '',
    medicalHistory: '',
    allergies: '',
  };

  get canSave(): boolean {
    return this.model.firstName.trim().length > 1 && this.model.lastName.trim().length > 1;
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
      firstName: this.model.firstName.trim(),
      lastName: this.model.lastName.trim(),
      phone: this.model.phone.trim(),
      email: this.model.email.trim(),
      medicalHistory: this.model.medicalHistory.trim(),
      allergies: this.model.allergies.trim(),
    });

    this.model = {
      firstName: '',
      lastName: '',
      phone: '',
      email: '',
      birthDate: '',
      medicalHistory: '',
      allergies: '',
    };

    this.close();
  }
}
