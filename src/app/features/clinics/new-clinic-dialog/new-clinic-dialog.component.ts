import { Component, EventEmitter, Input, Output } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

export interface NewClinicPayload {
  name: string;
  email: string;
  description: string;
  contactNumber: string;
  speciality: string;
  timeSlotMinutes: number;
  status: 'Active' | 'Inactive';
  address: string;
  imageFileName: string;
  brandMarkFileName: string;
}

@Component({
  selector: 'app-new-clinic-dialog',
  standalone: true,
  imports: [CommonModule, FormsModule],
  template: `
    <div class="dialog-backdrop" *ngIf="visible" (click)="close()">
      <div class="dialog" (click)="$event.stopPropagation()">
        <div class="dialog-header">
          <h3>Create Clinic</h3>
          <button type="button" class="close-btn" (click)="close()"><i class="pi pi-times"></i></button>
        </div>

        <div class="dialog-body">
          <div class="grid-2">
            <div class="field">
              <label>Image</label>
              <label class="upload-box" for="clinic-image-input">
                <input id="clinic-image-input" type="file" (change)="onImageFileChange($event)" />
                <div>
                  <span>Drop files here or</span>
                  <strong>browse files</strong>
                </div>
                <small *ngIf="model.imageFileName">{{ model.imageFileName }}</small>
              </label>
            </div>

            <div class="field">
              <label>Brand Mark</label>
              <label class="upload-box" for="clinic-brand-input">
                <input id="clinic-brand-input" type="file" (change)="onBrandFileChange($event)" />
                <div>
                  <span>Drop files here or</span>
                  <strong>browse files</strong>
                </div>
                <small *ngIf="model.brandMarkFileName">{{ model.brandMarkFileName }}</small>
              </label>
              <p class="hint">Upload a custom logo for this clinic that will appear on invoices and prescriptions.</p>
            </div>
          </div>

          <div class="grid-2">
            <div class="field">
              <label>Name *</label>
              <input [(ngModel)]="model.name" type="text" placeholder="Name" />
            </div>
            <div class="field">
              <label>Email *</label>
              <input [(ngModel)]="model.email" type="email" placeholder="Email" />
            </div>
          </div>

          <div class="grid-2">
            <div class="field">
              <label>Description</label>
              <textarea [(ngModel)]="model.description" rows="3" placeholder="Description"></textarea>
            </div>
            <div class="field">
              <label>Speciality</label>
              <select [(ngModel)]="model.speciality">
                <option [ngValue]="''">Speciality</option>
                <option *ngFor="let option of specialityOptions" [ngValue]="option">{{ option }}</option>
              </select>
            </div>
          </div>

          <div class="grid-2">
            <div class="field">
              <label>Contact Number *</label>
              <input [(ngModel)]="model.contactNumber" type="text" placeholder="Enter a phone number" />
            </div>
            <div class="field">
              <label>Time Slot (in minutes) *</label>
              <select [(ngModel)]="model.timeSlotMinutes">
                <option [ngValue]="0">Time Slot (in minutes)</option>
                <option *ngFor="let slot of slotOptions" [ngValue]="slot">{{ slot }}</option>
              </select>
            </div>
          </div>

          <div class="grid-2 status-row">
            <div class="field">
              <label>Address *</label>
              <input [(ngModel)]="model.address" type="text" placeholder="Address" />
            </div>
            <div class="field switch-field">
              <label>Status</label>
              <button type="button" class="switch" [class.active]="model.status === 'Active'" (click)="toggleStatus()">
                <span></span>
              </button>
            </div>
          </div>
        </div>

        <div class="dialog-footer">
          <button type="button" class="btn-outline" (click)="close()">Cancel</button>
          <button type="button" class="btn-primary" [disabled]="!canSave" (click)="submit()">Create Clinic</button>
        </div>
      </div>
    </div>
  `,
  styles: [
    `
      .dialog-backdrop {
        align-items: center;
        background: rgba(15, 23, 42, 0.3);
        display: flex;
        inset: 0;
        justify-content: center;
        padding: 0.85rem;
        position: fixed;
        z-index: 1400;
      }

      .dialog {
        background: #fff;
        border-radius: 14px;
        box-shadow: 0 24px 48px rgba(15, 23, 42, 0.24);
        max-height: calc(100vh - 1.6rem);
        max-width: 980px;
        overflow-y: auto;
        width: 100%;
      }

      .dialog-header {
        align-items: center;
        border-bottom: 1px solid #e9edf4;
        display: flex;
        justify-content: space-between;
        padding: 1rem 1.2rem;

        h3 {
          color: #253146;
          font-size: 1.65rem;
          margin: 0;
        }
      }

      .close-btn {
        align-items: center;
        background: #f7f9fc;
        border: 1px solid #e1e6ef;
        border-radius: 7px;
        color: #6d7688;
        cursor: pointer;
        display: inline-flex;
        height: 32px;
        justify-content: center;
        width: 32px;
      }

      .dialog-body {
        display: flex;
        flex-direction: column;
        gap: 0.8rem;
        padding: 1rem 1.2rem;
      }

      .grid-2 {
        display: grid;
        gap: 0.75rem;
        grid-template-columns: 1fr 1fr;
      }

      .field {
        display: flex;
        flex-direction: column;
        gap: 0.3rem;

        label {
          color: #3a4658;
          font-size: 0.95rem;
          font-weight: 600;
        }

        input,
        textarea,
        select {
          background: #fff;
          border: 1px solid #e3e8f0;
          border-radius: 8px;
          color: #384154;
          font-size: 0.92rem;
          min-height: 40px;
          padding: 0.55rem 0.7rem;
        }

        textarea {
          min-height: 88px;
          resize: vertical;
        }
      }

      .upload-box {
        align-items: center;
        border: 1px dashed #d4dce8;
        border-radius: 10px;
        cursor: pointer;
        display: flex;
        flex-direction: column;
        gap: 0.25rem;
        justify-content: center;
        min-height: 190px;
        padding: 0.8rem;
        text-align: center;

        input {
          display: none;
        }

        span {
          color: #748097;
          display: block;
        }

        strong {
          color: #26bfdc;
          font-weight: 700;
        }

        small {
          color: #4b5565;
          margin-top: 0.3rem;
        }
      }

      .hint {
        color: #8a93a5;
        font-size: 0.82rem;
        margin: 0.2rem 0 0;
      }

      .status-row {
        align-items: end;
      }

      .switch-field {
        align-items: flex-start;
      }

      .switch {
        background: #d8e0eb;
        border: none;
        border-radius: 999px;
        cursor: pointer;
        height: 23px;
        position: relative;
        width: 40px;

        span {
          background: #fff;
          border-radius: 999px;
          height: 17px;
          left: 3px;
          position: absolute;
          top: 3px;
          transition: all 0.14s ease;
          width: 17px;
        }

        &.active {
          background: #21cfa1;

          span {
            left: 20px;
          }
        }
      }

      .dialog-footer {
        border-top: 1px solid #e9edf4;
        display: flex;
        gap: 0.5rem;
        justify-content: flex-end;
        padding: 0.9rem 1.2rem 1rem;
      }

      .btn-outline,
      .btn-primary {
        border-radius: 8px;
        font-size: 0.9rem;
        font-weight: 700;
        min-height: 39px;
        padding: 0 1rem;
      }

      .btn-outline {
        background: #fff;
        border: 1px solid #d3d9e3;
        color: #3d4758;
        cursor: pointer;
      }

      .btn-primary {
        background: #26bfdc;
        border: none;
        color: #fff;
        cursor: pointer;

        &:disabled {
          cursor: not-allowed;
          opacity: 0.55;
        }
      }

      @media (max-width: 900px) {
        .grid-2 {
          grid-template-columns: 1fr;
        }
      }
    `,
  ],
})
export class NewClinicDialogComponent {
  @Input() visible = false;
  @Output() visibleChange = new EventEmitter<boolean>();
  @Output() save = new EventEmitter<NewClinicPayload>();

  specialityOptions = ['General Dentistry', 'Orthodontics', 'Implantology', 'Pediatric Dentistry'];
  slotOptions = [10, 15, 20, 30, 45, 60];

  model: NewClinicPayload = {
    name: '',
    email: '',
    description: '',
    contactNumber: '',
    speciality: '',
    timeSlotMinutes: 0,
    status: 'Active',
    address: '',
    imageFileName: '',
    brandMarkFileName: '',
  };

  get canSave(): boolean {
    return (
      this.model.name.trim().length >= 2 &&
      this.model.email.trim().length >= 5 &&
      this.model.contactNumber.trim().length >= 8 &&
      this.model.timeSlotMinutes > 0 &&
      this.model.address.trim().length >= 3
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
      name: this.model.name.trim(),
      email: this.model.email.trim(),
      description: this.model.description.trim(),
      contactNumber: this.model.contactNumber.trim(),
      speciality: this.model.speciality.trim(),
      address: this.model.address.trim(),
    });

    this.resetModel();
    this.close();
  }

  toggleStatus(): void {
    this.model.status = this.model.status === 'Active' ? 'Inactive' : 'Active';
  }

  onImageFileChange(event: Event): void {
    const input = event.target as HTMLInputElement;
    this.model.imageFileName = input.files?.[0]?.name ?? '';
  }

  onBrandFileChange(event: Event): void {
    const input = event.target as HTMLInputElement;
    this.model.brandMarkFileName = input.files?.[0]?.name ?? '';
  }

  private resetModel(): void {
    this.model = {
      name: '',
      email: '',
      description: '',
      contactNumber: '',
      speciality: '',
      timeSlotMinutes: 0,
      status: 'Active',
      address: '',
      imageFileName: '',
      brandMarkFileName: '',
    };
  }
}
