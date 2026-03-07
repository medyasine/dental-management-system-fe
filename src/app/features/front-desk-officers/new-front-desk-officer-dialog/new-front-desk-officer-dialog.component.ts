import { Component, EventEmitter, Input, Output } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

export interface NewFrontDeskOfficerPayload {
  firstName: string;
  lastName: string;
  email: string;
  phoneNumber: string;
  gender: 'Male' | 'Female' | 'Other';
  password: string;
  dateOfBirth: string;
  clinicCenter: string;
  address: string;
  country: string;
  state: string;
  city: string;
  postalCode: string;
  status: 'Active' | 'Inactive';
  profileImageFileName: string;
}

@Component({
  selector: 'app-new-front-desk-officer-dialog',
  standalone: true,
  imports: [CommonModule, FormsModule],
  template: `
    <div class="dialog-backdrop" *ngIf="visible" (click)="close()">
      <div class="dialog" (click)="$event.stopPropagation()">
        <div class="dialog-header">
          <h3>Create Front Desk Officer</h3>
          <button type="button" class="close-btn" (click)="close()"><i class="pi pi-times"></i></button>
        </div>

        <div class="dialog-body">
          <div class="grid-2">
            <div class="field">
              <label>Profile Image</label>
              <label class="upload-box" for="officer-profile-input">
                <input id="officer-profile-input" type="file" (change)="onProfileFileChange($event)" />
                <div>
                  <span>Drop files here or</span>
                  <strong>browse files</strong>
                </div>
                <small *ngIf="model.profileImageFileName">{{ model.profileImageFileName }}</small>
              </label>
            </div>

            <div class="field-stack">
              <div class="field">
                <label>First Name *</label>
                <input [(ngModel)]="model.firstName" type="text" placeholder="First Name" />
              </div>
              <div class="field">
                <label>Last Name *</label>
                <input [(ngModel)]="model.lastName" type="text" placeholder="Last Name" />
              </div>
              <div class="field">
                <label>Email *</label>
                <input [(ngModel)]="model.email" type="email" placeholder="Email" />
              </div>
            </div>
          </div>

          <div class="grid-2">
            <div class="field">
              <label>Gender</label>
              <select [(ngModel)]="model.gender">
                <option value="Male">Male</option>
                <option value="Female">Female</option>
                <option value="Other">Other</option>
              </select>
            </div>
            <div class="field">
              <label>Phone Number *</label>
              <input [(ngModel)]="model.phoneNumber" type="text" placeholder="Enter phone number" />
            </div>
          </div>

          <div class="grid-2">
            <div class="field">
              <label>Password *</label>
              <input [(ngModel)]="model.password" type="password" placeholder="Password" />
            </div>
            <div class="field">
              <label>Confirm Password *</label>
              <input [(ngModel)]="confirmPassword" type="password" placeholder="Confirm password" />
              <small class="error" *ngIf="showPasswordError">Passwords must match</small>
            </div>
          </div>

          <div class="grid-2">
            <div class="field">
              <label>Date of Birth</label>
              <input [(ngModel)]="model.dateOfBirth" type="date" />
            </div>
            <div class="field status-field">
              <label>Status</label>
              <button type="button" class="switch" [class.active]="model.status === 'Active'" (click)="toggleStatus()">
                <span></span>
              </button>
            </div>
          </div>

          <h4>Other details</h4>

          <div class="grid-2">
            <div class="field">
              <label>Select Clinic Centre *</label>
              <select [(ngModel)]="model.clinicCenter">
                <option [ngValue]="''">Select clinic center</option>
                <option *ngFor="let clinic of clinicCenters" [ngValue]="clinic">{{ clinic }}</option>
              </select>
            </div>
            <div class="field">
              <label>Address</label>
              <input [(ngModel)]="model.address" type="text" placeholder="Address" />
            </div>
          </div>

          <div class="grid-2">
            <div class="field">
              <label>Country</label>
              <input [(ngModel)]="model.country" type="text" placeholder="Country" />
            </div>
            <div class="field">
              <label>State</label>
              <input [(ngModel)]="model.state" type="text" placeholder="State" />
            </div>
          </div>

          <div class="grid-2">
            <div class="field">
              <label>City</label>
              <input [(ngModel)]="model.city" type="text" placeholder="City" />
            </div>
            <div class="field">
              <label>Postal Code</label>
              <input [(ngModel)]="model.postalCode" type="text" placeholder="Postal Code" />
            </div>
          </div>
        </div>

        <div class="dialog-footer">
          <button type="button" class="btn-outline" (click)="close()">Cancel</button>
          <button type="button" class="btn-primary" [disabled]="!canSave" (click)="submit()">Create Officer</button>
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
        padding: 0.8rem;
        position: fixed;
        z-index: 1500;
      }
      .dialog {
        background: #fff;
        border-radius: 14px;
        box-shadow: 0 24px 48px rgba(15, 23, 42, 0.22);
        max-height: calc(100vh - 1.6rem);
        max-width: 1020px;
        overflow-y: auto;
        width: 100%;
      }
      .dialog-header {
        align-items: center;
        border-bottom: 1px solid #e8edf4;
        display: flex;
        justify-content: space-between;
        padding: 1rem 1.2rem;

        h3 {
          color: #263247;
          font-size: 1.55rem;
          margin: 0;
        }
      }
      .close-btn {
        align-items: center;
        background: #f7f9fc;
        border: 1px solid #e1e8f0;
        border-radius: 7px;
        color: #687488;
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
      .field-stack {
        display: grid;
        gap: 0.75rem;
      }
      .field {
        display: flex;
        flex-direction: column;
        gap: 0.3rem;

        label {
          color: #3c4658;
          font-size: 0.93rem;
          font-weight: 600;
        }
        input,
        select {
          background: #fff;
          border: 1px solid #e2e8f0;
          border-radius: 8px;
          color: #394458;
          font-size: 0.9rem;
          min-height: 40px;
          padding: 0.55rem 0.7rem;
        }
      }
      .upload-box {
        align-items: center;
        border: 1px dashed #d4dce8;
        border-radius: 10px;
        cursor: pointer;
        display: flex;
        flex-direction: column;
        gap: 0.2rem;
        justify-content: center;
        min-height: 200px;
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
          color: #25bddb;
        }
      }
      .switch {
        background: #d8e0eb;
        border: none;
        border-radius: 999px;
        cursor: pointer;
        height: 22px;
        position: relative;
        width: 40px;

        span {
          background: #fff;
          border-radius: 999px;
          height: 16px;
          left: 3px;
          position: absolute;
          top: 3px;
          transition: all 0.16s ease;
          width: 16px;
        }

        &.active {
          background: #22cfa2;

          span {
            left: 21px;
          }
        }
      }
      .status-field {
        align-items: flex-start;
      }
      h4 {
        color: #2c3546;
        font-size: 1.8rem;
        margin: 0.35rem 0 0.1rem;
      }
      .error {
        color: #dc2626;
        font-size: 0.8rem;
      }
      .dialog-footer {
        border-top: 1px solid #e8edf4;
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
        border: 1px solid #d3dae4;
        color: #3d4757;
        cursor: pointer;
      }
      .btn-primary {
        background: #26bfde;
        border: none;
        color: #fff;
        cursor: pointer;

        &:disabled {
          cursor: not-allowed;
          opacity: 0.55;
        }
      }
      @media (max-width: 920px) {
        .grid-2 {
          grid-template-columns: 1fr;
        }
      }
    `,
  ],
})
export class NewFrontDeskOfficerDialogComponent {
  @Input() visible = false;
  @Output() visibleChange = new EventEmitter<boolean>();
  @Output() save = new EventEmitter<NewFrontDeskOfficerPayload>();

  clinicCenters = ['BrightSmiles Dental Clinic', 'SmileCare Dental Clinic'];

  model: NewFrontDeskOfficerPayload = {
    firstName: '',
    lastName: '',
    email: '',
    phoneNumber: '',
    gender: 'Male',
    password: '',
    dateOfBirth: '',
    clinicCenter: '',
    address: '',
    country: '',
    state: '',
    city: '',
    postalCode: '',
    status: 'Active',
    profileImageFileName: '',
  };

  confirmPassword = '';

  get showPasswordError(): boolean {
    return this.confirmPassword.length > 0 && this.model.password !== this.confirmPassword;
  }

  get canSave(): boolean {
    return (
      this.model.firstName.trim().length >= 2 &&
      this.model.lastName.trim().length >= 1 &&
      this.model.email.trim().length >= 5 &&
      this.model.phoneNumber.trim().length >= 8 &&
      this.model.password.length >= 6 &&
      this.model.password === this.confirmPassword &&
      this.model.clinicCenter.trim().length >= 2
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
      firstName: this.model.firstName.trim(),
      lastName: this.model.lastName.trim(),
      email: this.model.email.trim(),
      phoneNumber: this.model.phoneNumber.trim(),
      clinicCenter: this.model.clinicCenter.trim(),
      address: this.model.address.trim(),
      country: this.model.country.trim(),
      state: this.model.state.trim(),
      city: this.model.city.trim(),
      postalCode: this.model.postalCode.trim(),
    });

    this.resetModel();
    this.close();
  }

  toggleStatus(): void {
    this.model.status = this.model.status === 'Active' ? 'Inactive' : 'Active';
  }

  onProfileFileChange(event: Event): void {
    const input = event.target as HTMLInputElement;
    this.model.profileImageFileName = input.files?.[0]?.name ?? '';
  }

  private resetModel(): void {
    this.model = {
      firstName: '',
      lastName: '',
      email: '',
      phoneNumber: '',
      gender: 'Male',
      password: '',
      dateOfBirth: '',
      clinicCenter: '',
      address: '',
      country: '',
      state: '',
      city: '',
      postalCode: '',
      status: 'Active',
      profileImageFileName: '',
    };
    this.confirmPassword = '';
  }
}
