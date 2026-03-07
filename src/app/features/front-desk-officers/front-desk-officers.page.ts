import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import {
  NewFrontDeskOfficerDialogComponent,
  NewFrontDeskOfficerPayload,
} from './new-front-desk-officer-dialog/new-front-desk-officer-dialog.component';

type OfficerStatus = 'Active' | 'Inactive';
type VerificationStatus = 'Verified' | 'Pending';

interface FrontDeskOfficerRow {
  id: string;
  name: string;
  email: string;
  phoneNumber: string;
  clinicName: string;
  clinicEmail: string;
  verificationStatus: VerificationStatus;
  status: OfficerStatus;
}

@Component({
  selector: 'app-front-desk-officers-page',
  standalone: true,
  imports: [CommonModule, FormsModule, NewFrontDeskOfficerDialogComponent],
  template: `
    <div class="officers-page p-3 lg:p-4">
      <div class="officers-shell">
        <div class="crumb">Home <span>&gt;</span> Front Desk Officer</div>

        <div class="toolbar-row">
          <div class="left-actions">
            <select [(ngModel)]="bulkAction">
              <option value="">No Action</option>
              <option value="activate">Activate</option>
              <option value="deactivate">Deactivate</option>
              <option value="delete">Delete</option>
            </select>
            <button class="btn-gray" type="button" (click)="onApplyBulk()">Apply</button>
            <button class="btn-blue" type="button" (click)="onExport()"><i class="pi pi-download"></i> Export</button>
          </div>

          <div class="right-actions">
            <div class="search-wrap">
              <i class="pi pi-search"></i>
              <input type="text" [(ngModel)]="search" (input)="applyFilter()" placeholder="Search..." />
            </div>

            <button class="btn-cyan" type="button" (click)="onNewOfficer()">
              <i class="pi pi-plus-circle"></i>
              New
            </button>
          </div>
        </div>

        <div class="table-card">
          <div class="table-wrap">
            <table>
              <thead>
                <tr>
                  <th class="name-col">Name</th>
                  <th>Phone Number</th>
                  <th>Clinic</th>
                  <th>Verification Status</th>
                  <th>Status</th>
                  <th class="action-col">Action</th>
                </tr>
              </thead>

              <tbody>
                <tr *ngFor="let officer of filteredRows">
                  <td>
                    <div class="identity-cell">
                      <span class="avatar">{{ initials(officer.name) }}</span>
                      <div>
                        <strong>{{ officer.name }}</strong>
                        <p>{{ officer.email }}</p>
                      </div>
                    </div>
                  </td>
                  <td>{{ officer.phoneNumber }}</td>
                  <td>
                    <div>
                      <strong>{{ officer.clinicName }}</strong>
                      <p>{{ officer.clinicEmail }}</p>
                    </div>
                  </td>
                  <td>
                    <span class="verify-pill" [class.pending]="officer.verificationStatus === 'Pending'">{{ officer.verificationStatus }}</span>
                  </td>
                  <td>
                    <button
                      type="button"
                      class="toggle-btn"
                      [class.active]="officer.status === 'Active'"
                      (click)="toggleStatus(officer)">
                      <span></span>
                    </button>
                  </td>
                  <td>
                    <div class="actions">
                      <button type="button" (click)="onEdit(officer)"><i class="pi pi-pencil"></i></button>
                      <button type="button" class="danger" (click)="onDelete(officer)"><i class="pi pi-trash"></i></button>
                    </div>
                  </td>
                </tr>

                <tr *ngIf="filteredRows.length === 0">
                  <td colspan="6" class="empty">No front desk officers found.</td>
                </tr>
              </tbody>
            </table>
          </div>

          <div class="table-footer">
            <div class="left">
              <span>Show</span>
              <select [(ngModel)]="pageSize">
                <option [ngValue]="10">10</option>
                <option [ngValue]="25">25</option>
                <option [ngValue]="50">50</option>
              </select>
              <span>entries</span>
              <span class="count">Showing 1 to {{ filteredRows.length }} of {{ filteredRows.length }} entries</span>
            </div>

            <div class="pager">
              <button type="button" disabled>Previous</button>
              <button type="button" class="active">1</button>
              <button type="button" disabled>Next</button>
            </div>
          </div>
        </div>
      </div>
    </div>

    <app-new-front-desk-officer-dialog
      [(visible)]="showNewOfficerDialog"
      (save)="createOfficer($event)">
    </app-new-front-desk-officer-dialog>
  `,
  styles: [
    `
      .officers-page {
        background: #e9fbfb;
        min-height: 100vh;
      }

      .officers-shell {
        margin: 0 auto;
        max-width: 1460px;
      }

      .crumb {
        color: #81879a;
        font-size: 0.86rem;
        margin-bottom: 0.8rem;

        span {
          margin: 0 0.2rem;
        }
      }

      .toolbar-row {
        align-items: center;
        display: flex;
        justify-content: space-between;
        margin-bottom: 0.8rem;
      }

      .left-actions,
      .right-actions {
        align-items: center;
        display: flex;
        gap: 0.5rem;
      }

      select,
      input {
        background: #fff;
        border: 1px solid #e2e7ef;
        border-radius: 7px;
        color: #3b4658;
        font-size: 0.86rem;
        min-height: 38px;
        padding: 0 0.7rem;
      }

      .search-wrap {
        align-items: center;
        background: #fff;
        border: 1px solid #e2e7ef;
        border-radius: 7px;
        display: flex;
        gap: 0.4rem;
        min-height: 38px;
        padding: 0 0.6rem;

        i {
          color: #9aa3b3;
          font-size: 0.85rem;
        }

        input {
          border: none;
          min-height: 34px;
          padding: 0;
          width: 180px;
        }
      }

      .btn-gray,
      .btn-blue,
      .btn-cyan {
        border: none;
        border-radius: 7px;
        color: #fff;
        cursor: pointer;
        font-size: 0.86rem;
        font-weight: 700;
        min-height: 38px;
        padding: 0 0.9rem;
      }

      .btn-gray {
        background: #c8ced8;
        color: #2c3545;
      }

      .btn-blue {
        background: #29b6dc;
      }

      .btn-cyan {
        background: #26bfde;
      }

      .table-card {
        background: #fff;
        border: 1px solid #e7ecf3;
        border-radius: 10px;
      }

      .table-wrap {
        overflow-x: auto;
      }

      table {
        border-collapse: separate;
        border-spacing: 0;
        min-width: 1100px;
        width: 100%;

        th {
          background: #24bbdf;
          color: #fff;
          font-size: 0.87rem;
          font-weight: 700;
          padding: 0.72rem 0.7rem;
          text-align: left;
        }

        th.name-col {
          border-top-left-radius: 8px;
        }

        th.action-col {
          border-top-right-radius: 8px;
        }

        td {
          border-bottom: 1px solid #edf2f7;
          color: #3a4658;
          font-size: 0.88rem;
          padding: 0.75rem 0.7rem;
          vertical-align: middle;

          p {
            color: #8b94a5;
            font-size: 0.8rem;
            margin: 0.1rem 0 0;
          }
        }
      }

      .identity-cell {
        align-items: center;
        display: flex;
        gap: 0.6rem;
      }

      .avatar {
        align-items: center;
        background: #e6ebf3;
        border-radius: 999px;
        color: #5b6475;
        display: inline-flex;
        font-size: 0.75rem;
        font-weight: 700;
        height: 34px;
        justify-content: center;
        width: 34px;
      }

      .verify-pill {
        background: #ddf8e9;
        border-radius: 6px;
        color: #1e8f58;
        display: inline-flex;
        font-size: 0.78rem;
        font-weight: 700;
        padding: 0.2rem 0.45rem;

        &.pending {
          background: #fef3c7;
          color: #92400e;
        }
      }

      .toggle-btn {
        background: #d6dde8;
        border: none;
        border-radius: 999px;
        cursor: pointer;
        height: 22px;
        position: relative;
        width: 38px;

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
          background: #21cfa1;

          span {
            left: 19px;
          }
        }
      }

      .actions {
        display: inline-flex;
        gap: 0.35rem;

        button {
          align-items: center;
          background: #fff;
          border: 1px solid #e4e9f1;
          border-radius: 7px;
          color: #728096;
          cursor: pointer;
          display: inline-flex;
          font-size: 0.85rem;
          height: 30px;
          justify-content: center;
          width: 30px;
        }

        button.danger {
          color: #ef4444;
        }
      }

      .table-footer {
        align-items: center;
        display: flex;
        justify-content: space-between;
        padding: 0.7rem;

        .left {
          align-items: center;
          color: #7b8597;
          display: flex;
          font-size: 0.85rem;
          gap: 0.45rem;

          select {
            min-height: 32px;
          }

          .count {
            margin-left: 0.35rem;
          }
        }
      }

      .pager {
        display: inline-flex;
        gap: 0.3rem;

        button {
          background: #fff;
          border: 1px solid #dde4ee;
          border-radius: 6px;
          color: #6f7a8f;
          cursor: pointer;
          font-size: 0.8rem;
          min-height: 30px;
          min-width: 30px;
          padding: 0 0.55rem;

          &.active {
            background: #27bee0;
            border-color: #27bee0;
            color: #fff;
          }

          &:disabled {
            cursor: default;
            opacity: 0.55;
          }
        }
      }

      .empty {
        color: #9ca3b4;
        font-style: italic;
        text-align: center;
      }

      @media (max-width: 1180px) {
        .toolbar-row {
          align-items: stretch;
          flex-direction: column;
          gap: 0.55rem;
        }

        .left-actions,
        .right-actions {
          flex-wrap: wrap;
        }
      }
    `,
  ],
})
export class FrontDeskOfficersPage {
  bulkAction = '';
  pageSize = 10;
  search = '';
  showNewOfficerDialog = false;

  rows: FrontDeskOfficerRow[] = [
    {
      id: 'officer-1',
      name: 'Rizwan Ali',
      email: 'rizwan@brightsmilesclinic.com',
      phoneNumber: '0321896527',
      clinicName: 'BrightSmiles Dental Clinic',
      clinicEmail: 'contact@brightsmilesclinic.com',
      verificationStatus: 'Verified',
      status: 'Active',
    },
    {
      id: 'officer-2',
      name: 'Ayesha Khalid',
      email: 'ayesha.khalid@smilecareclinic.pk',
      phoneNumber: '12367845',
      clinicName: 'SmileCare Dental Clinic',
      clinicEmail: 'info@smilecareclinic.com',
      verificationStatus: 'Verified',
      status: 'Active',
    },
  ];

  filteredRows: FrontDeskOfficerRow[] = [...this.rows];

  applyFilter(): void {
    const q = this.search.toLowerCase().trim();
    this.filteredRows = this.rows.filter(
      (row) =>
        row.name.toLowerCase().includes(q) ||
        row.email.toLowerCase().includes(q) ||
        row.phoneNumber.includes(q) ||
        row.clinicName.toLowerCase().includes(q),
    );
  }

  initials(name: string): string {
    return name
      .split(' ')
      .filter(Boolean)
      .slice(0, 2)
      .map((part) => part[0]?.toUpperCase() ?? '')
      .join('');
  }

  createOfficer(payload: NewFrontDeskOfficerPayload): void {
    const fullName = `${payload.firstName} ${payload.lastName}`.trim();
    const newOfficer: FrontDeskOfficerRow = {
      id: `officer-${Date.now()}`,
      name: fullName,
      email: payload.email,
      phoneNumber: payload.phoneNumber,
      clinicName: payload.clinicCenter || 'Unassigned Clinic',
      clinicEmail: payload.email,
      verificationStatus: 'Pending',
      status: payload.status,
    };

    this.rows = [newOfficer, ...this.rows];
    this.applyFilter();
  }

  toggleStatus(officer: FrontDeskOfficerRow): void {
    officer.status = officer.status === 'Active' ? 'Inactive' : 'Active';
    this.applyFilter();
  }

  onNewOfficer(): void {
    this.showNewOfficerDialog = true;
  }

  onApplyBulk(): void {
    console.log('Apply bulk action', this.bulkAction);
  }

  onExport(): void {
    console.log('Export front desk officers');
  }

  onEdit(officer: FrontDeskOfficerRow): void {
    console.log('Edit officer', officer.id);
  }

  onDelete(officer: FrontDeskOfficerRow): void {
    this.rows = this.rows.filter((row) => row.id !== officer.id);
    this.applyFilter();
  }
}
