import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

type InvoiceStatus = 'Paid' | 'Partial' | 'Unpaid' | 'Refunded';
type QuickFilter = 'today' | 'week' | 'month';

interface InvoiceRow {
  invoiceNo: string;
  patient: string;
  doctor: string;
  dateIso: string;
  dueDateIso: string;
  amount: number;
  paid: number;
  balance: number;
  status: InvoiceStatus;
  method: string;
}

interface PaymentRow {
  id: string;
  patient: string;
  doctor: string;
  dateIso: string;
  amount: number;
  method: string;
}

@Component({
  selector: 'app-billing-page',
  standalone: true,
  imports: [CommonModule, FormsModule],
  template: `
    <div class="billing-page p-4">
      <div class="billing-shell">
        <div class="billing-highlight">
        <div class="header-row">
          <div>
            <p class="eyebrow">Finance</p>
            <h1>Billing & Payments</h1>
          </div>
          <div class="header-actions">
            <button class="btn-outline" type="button" (click)="onExport()">Export CSV</button>
            <button class="btn-primary" type="button" (click)="onNewInvoice()">
              <i class="pi pi-plus-circle"></i>
              New Invoice
            </button>
          </div>
        </div>

        <div class="cards">
          <div class="card metric">
            <p>Total Billed</p>
            <h3>{{ totals.billed | currency:'INR':'symbol-narrow':'1.0-0' }}</h3>
            <span class="pill muted">Incl. tax</span>
          </div>
          <div class="card metric">
            <p>Collected</p>
            <h3>{{ totals.collected | currency:'INR':'symbol-narrow':'1.0-0' }}</h3>
            <span class="pill success">+{{ collectionRate }}% rate</span>
          </div>
          <div class="card metric">
            <p>Outstanding</p>
            <h3>{{ totals.outstanding | currency:'INR':'symbol-narrow':'1.0-0' }}</h3>
            <span class="pill warn">{{ overdueCount }} overdue</span>
          </div>
          <div class="card metric">
            <p>Avg. Ticket</p>
            <h3>{{ averageTicket | currency:'INR':'symbol-narrow':'1.0-0' }}</h3>
            <span class="pill muted">Per invoice</span>
          </div>
        </div>

        <div class="filters card">
          <div class="search-wrap">
            <i class="pi pi-search"></i>
            <input
              type="text"
              [(ngModel)]="search"
              (input)="applyFilters()"
              placeholder="Search invoices (patient, doctor, invoice #)" />
          </div>

          <div class="date-range-wrap">
            <i class="pi pi-calendar"></i>
            <input
              type="text"
              [(ngModel)]="dateRangeText"
              placeholder="mm/dd/yyyy - mm/dd/yyyy"
              (input)="applyFilters()" />
          </div>

          <div class="select-wrap">
            <label>Status</label>
            <select [(ngModel)]="statusFilter" (change)="applyFilters()">
              <option value="">All</option>
              <option *ngFor="let s of statusOptions" [ngValue]="s">{{ s }}</option>
            </select>
          </div>

          <div class="select-wrap">
            <label>Doctor</label>
            <select [(ngModel)]="doctorFilter" (change)="applyFilters()">
              <option value="">All</option>
              <option *ngFor="let d of doctorOptions" [ngValue]="d">{{ d }}</option>
            </select>
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

        </div>

        <div class="layout-two">
          <div class="card table-card">
            <div class="table-head">
              <h3>Invoices</h3>
              <div class="legend">
                <span class="pill success">Paid</span>
                <span class="pill info">Partial</span>
                <span class="pill warn">Unpaid</span>
                <span class="pill danger">Refunded</span>
              </div>
            </div>

            <div class="table-wrap">
              <table>
                <thead>
                  <tr>
                    <th>#</th>
                    <th>Patient</th>
                    <th>Doctor</th>
                    <th>Date</th>
                    <th>Amount</th>
                    <th>Paid</th>
                    <th>Balance</th>
                    <th>Due</th>
                    <th>Status</th>
                    <th>Action</th>
                  </tr>
                </thead>
                <tbody>
                  <tr *ngFor="let row of filteredInvoices">
                    <td>{{ row.invoiceNo }}</td>
                    <td>
                      <div class="cell-main">
                        <span class="dot patient"></span>
                        <div>
                          <strong>{{ row.patient }}</strong>
                          <p>{{ row.method }}</p>
                        </div>
                      </div>
                    </td>
                    <td>{{ row.doctor }}</td>
                    <td>
                      <div class="cell-sub">{{ formatDate(row.dateIso) }}</div>
                      <div class="muted">{{ formatTime(row.dateIso) }}</div>
                    </td>
                    <td>{{ row.amount | currency:'INR':'symbol-narrow':'1.0-0' }}</td>
                    <td>{{ row.paid | currency:'INR':'symbol-narrow':'1.0-0' }}</td>
                    <td [class.danger]="row.balance > 0">{{ row.balance | currency:'INR':'symbol-narrow':'1.0-0' }}</td>
                    <td>
                      <div class="muted">{{ formatDate(row.dueDateIso) }}</div>
                    </td>
                    <td>
                      <span class="pill" [ngClass]="statusClass(row.status)">{{ row.status }}</span>
                    </td>
                    <td>
                      <div class="actions">
                        <button type="button" (click)="onView(row)"><i class="pi pi-eye"></i></button>
                        <button type="button" (click)="onRecordPayment(row)"><i class="pi pi-wallet"></i></button>
                        <button type="button" class="danger" (click)="onDelete(row)"><i class="pi pi-trash"></i></button>
                      </div>
                    </td>
                  </tr>
                  <tr *ngIf="filteredInvoices.length === 0">
                    <td colspan="10" class="empty">No invoices found.</td>
                  </tr>
                </tbody>
              </table>
            </div>
          </div>

          <div class="card payments-card">
            <div class="payments-head">
              <h3>Recent Payments</h3>
              <button class="btn-ghost" type="button" (click)="onViewPayments()">View all</button>
            </div>
            <div class="payments-list">
              <div class="payment-row" *ngFor="let pay of payments">
                <div>
                  <strong>{{ pay.patient }}</strong>
                  <p class="muted">{{ pay.doctor }} ï¿½ {{ formatDate(pay.dateIso) }}</p>
                </div>
                <div class="pay-amount">{{ pay.amount | currency:'INR':'symbol-narrow':'1.0-0' }}</div>
              </div>
            </div>
            <div class="divider"></div>
            <div class="aging">
              <div class="aging-row">
                <span>0-30 days</span>
                <strong>{{ aging['0-30'] | currency:'INR':'symbol-narrow':'1.0-0' }}</strong>
              </div>
              <div class="aging-row">
                <span>31-60 days</span>
                <strong>{{ aging['31-60'] | currency:'INR':'symbol-narrow':'1.0-0' }}</strong>
              </div>
              <div class="aging-row">
                <span>61-90 days</span>
                <strong>{{ aging['61-90'] | currency:'INR':'symbol-narrow':'1.0-0' }}</strong>
              </div>
              <div class="aging-row">
                <span>90+ days</span>
                <strong>{{ aging['90+'] | currency:'INR':'symbol-narrow':'1.0-0' }}</strong>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  `,
  styles: [
    `
      .billing-page { background: var(--surface-ground); min-height: 100vh; }
      .billing-shell { margin: 0 auto; max-width: 1440px; display: flex; flex-direction: column; gap: 1rem; }
      .billing-highlight { background: #e6faf6; border: 1px solid #c2efe6; border-radius: 16px; padding: 1rem; }
      .header-row { align-items: center; display: flex; justify-content: space-between; }
      .eyebrow { color: #6b7280; font-weight: 700; letter-spacing: 0.04em; margin: 0 0 0.1rem; text-transform: uppercase; }
      h1 { margin: 0; font-size: 2rem; color: #0f172a; }
      .header-actions { display: flex; gap: 0.6rem; }
      .btn-primary, .btn-outline, .btn-ghost { align-items: center; border-radius: 10px; display: inline-flex; font-weight: 700; gap: 0.4rem; padding: 0.55rem 1.1rem; cursor: pointer; }
      .btn-primary { background: #21cfa1; border: none; color: #fff; }
      .btn-outline { background: #fff; border: 1px solid #d1d5db; color: #334155; }
      .btn-ghost { background: transparent; border: none; color: #2563eb; padding: 0.25rem 0.45rem; }
      .cards { display: grid; grid-template-columns: repeat(auto-fit, minmax(220px, 1fr)); gap: 0.8rem; }
      .card { background: #fff; border: 1px solid #e5e7eb; border-radius: 14px; padding: 1rem; }
      .card.metric h3 { margin: 0.15rem 0 0.35rem; font-size: 1.55rem; color: #0f172a; }
      .card.metric p { margin: 0; color: #6b7280; }
      .pill { display: inline-flex; align-items: center; border-radius: 999px; padding: 0.2rem 0.65rem; font-size: 0.82rem; font-weight: 700; border: 1px solid #d1d5db; color: #475569; background: #f8fafc; }
      .pill.success { background: #dcfce7; border-color: #86efac; color: #166534; }
      .pill.warn { background: #fef3c7; border-color: #fcd34d; color: #92400e; }
      .pill.danger { background: #fee2e2; border-color: #fca5a5; color: #991b1b; }
      .pill.info { background: #e0f2fe; border-color: #bae6fd; color: #0ea5e9; }
      .pill.muted { background: #f8fafc; border-color: #e2e8f0; color: #64748b; }
      .filters { display: grid; gap: 0.75rem; grid-template-columns: minmax(240px, 1fr) 220px 180px 180px auto; align-items: center; }
      .search-wrap, .date-range-wrap { align-items: center; background: #f8f8fc; border: 1px solid #edf1f5; border-radius: 10px; display: flex; gap: 0.5rem; min-height: 44px; padding: 0 0.75rem; }
      .search-wrap i, .date-range-wrap i { color: #9ca3af; }
      .search-wrap input, .date-range-wrap input { background: transparent; border: none; width: 100%; color: #334155; }
      .select-wrap { display: flex; flex-direction: column; gap: 0.25rem; }
      .select-wrap label { font-size: 0.85rem; color: #6b7280; }
      .select-wrap select { background: #f8f8fc; border: 1px solid #edf1f5; border-radius: 10px; min-height: 44px; padding: 0 0.6rem; }
      .quick-filters { display: inline-flex; gap: 0.35rem; background: #f3f4f6; border-radius: 10px; padding: 0.25rem; }
      .quick-filters button { background: transparent; border: none; border-radius: 8px; padding: 0.45rem 0.9rem; font-weight: 700; color: #6b7280; cursor: pointer; }
      .quick-filters button.active { background: #21cfa1; color: #fff; }
      .layout-two { display: grid; grid-template-columns: 2.2fr 1fr; gap: 0.8rem; }
      .table-card .table-head { display: flex; align-items: center; justify-content: space-between; margin-bottom: 0.6rem; }
      .table-wrap { overflow-x: auto; }
      table { width: 100%; border-collapse: separate; border-spacing: 0; min-width: 1120px; }
      th { background: #f3f4f6; color: #9ca3af; padding: 0.65rem 0.55rem; text-align: left; font-size: 0.85rem; font-weight: 700; }
      td { border-bottom: 1px solid #edf1f5; padding: 0.7rem 0.55rem; color: #334155; font-size: 0.94rem; vertical-align: middle; }
      .cell-main { display: flex; gap: 0.45rem; align-items: center; }
      .cell-main p { margin: 0.1rem 0 0; color: #94a3b8; font-size: 0.85rem; }
      .dot.patient { background: #f6ac2e; border-radius: 4px; height: 14px; width: 14px; }
      .muted { color: #94a3b8; font-size: 0.85rem; }
      .actions { display: inline-flex; gap: 0.35rem; }
      .actions button { align-items: center; background: #fff; border: 1px solid #e5e7eb; border-radius: 8px; color: #6b7280; cursor: pointer; display: inline-flex; height: 32px; justify-content: center; width: 32px; }
      .actions button.danger { color: #ef4444; }
      .empty { text-align: center; color: #9ca3af; font-style: italic; }
      .payments-card { display: flex; flex-direction: column; gap: 0.6rem; }
      .payments-head { display: flex; justify-content: space-between; align-items: center; }
      .payments-list { display: flex; flex-direction: column; gap: 0.65rem; }
      .payment-row { display: flex; justify-content: space-between; align-items: center; }
      .payment-row .muted { margin: 0.1rem 0 0; }
      .pay-amount { font-weight: 700; color: #0f172a; }
      .divider { height: 1px; background: #e5e7eb; margin: 0.4rem 0; }
      .aging { display: grid; gap: 0.35rem; }
      .aging-row { display: flex; justify-content: space-between; color: #475569; }
      .status-paid { background: #dcfce7; border-color: #86efac; color: #166534; }
      .status-partial { background: #e0f2fe; border-color: #bae6fd; color: #0ea5e9; }
      .status-unpaid { background: #fef3c7; border-color: #fcd34d; color: #92400e; }
      .status-refunded { background: #fee2e2; border-color: #fca5a5; color: #991b1b; }
      @media (max-width: 1180px) { .filters { grid-template-columns: 1fr 1fr; } .layout-two { grid-template-columns: 1fr; } }
      @media (max-width: 720px) { .header-row { flex-direction: column; align-items: flex-start; gap: 0.7rem; } .cards { grid-template-columns: repeat(auto-fit, minmax(180px, 1fr)); } .filters { grid-template-columns: 1fr; } }
    `,
  ],
})
export class BillingPage {
  search = '';
  dateRangeText = '';
  statusFilter = '';
  doctorFilter = '';
  activeQuickFilter: QuickFilter = 'today';
  quickFilterOptions = [
    { label: 'Today', value: 'today' as QuickFilter },
    { label: 'This Week', value: 'week' as QuickFilter },
    { label: 'This Month', value: 'month' as QuickFilter },
  ];

  statusOptions: InvoiceStatus[] = ['Paid', 'Partial', 'Unpaid', 'Refunded'];
  doctorOptions = ['Dr. Arjun', 'Dr. Neha', 'Dr. Vivek'];

  invoices: InvoiceRow[] = [
    { invoiceNo: 'INV-1043', patient: 'Eva', doctor: 'Dr. Arjun', dateIso: '2025-11-11T15:20:00', dueDateIso: '2025-11-25T00:00:00', amount: 6200, paid: 6200, balance: 0, status: 'Paid', method: 'UPI' },
    { invoiceNo: 'INV-1042', patient: 'Eva', doctor: 'Dr. Arjun', dateIso: '2025-11-11T10:15:00', dueDateIso: '2025-11-20T00:00:00', amount: 4800, paid: 3000, balance: 1800, status: 'Partial', method: 'Card' },
    { invoiceNo: 'INV-1041', patient: 'Dheeraj T', doctor: 'Dr. Arjun', dateIso: '2025-11-10T09:05:00', dueDateIso: '2025-11-17T00:00:00', amount: 7500, paid: 0, balance: 7500, status: 'Unpaid', method: 'Cash' },
  ];

  payments: PaymentRow[] = [
    { id: 'PM-207', patient: 'Eva', doctor: 'Dr. Arjun', dateIso: '2025-11-11T15:40:00', amount: 3200, method: 'UPI' },
    { id: 'PM-206', patient: 'Majid', doctor: 'Dr. Neha', dateIso: '2025-11-10T12:10:00', amount: 2400, method: 'Card' },
    { id: 'PM-205', patient: 'Harshad', doctor: 'Dr. Vivek', dateIso: '2025-11-09T10:45:00', amount: 1800, method: 'Cash' },
  ];

  aging = { '0-30': 9300, '31-60': 2400, '61-90': 1800, '90+': 0 };

  filteredInvoices: InvoiceRow[] = [...this.invoices];

  get totals() {
    const billed = this.invoices.reduce((sum, i) => sum + i.amount, 0);
    const collected = this.invoices.reduce((sum, i) => sum + i.paid, 0);
    const outstanding = this.invoices.reduce((sum, i) => sum + i.balance, 0);
    return { billed, collected, outstanding };
  }

  get collectionRate(): number {
    if (this.totals.billed === 0) return 0;
    return Math.round((this.totals.collected / this.totals.billed) * 100);
  }

  get overdueCount(): number {
    const now = new Date();
    return this.invoices.filter((i) => i.balance > 0 && new Date(i.dueDateIso) < now).length;
  }

  get averageTicket(): number {
    if (this.invoices.length === 0) return 0;
    return Math.round(this.totals.billed / this.invoices.length);
  }

  setQuickFilter(filter: QuickFilter): void {
    this.activeQuickFilter = filter;
    this.applyFilters();
  }

  applyFilters(): void {
    const q = this.search.toLowerCase().trim();
    const now = new Date();

    this.filteredInvoices = this.invoices.filter((row) => {
      const matchesSearch = row.patient.toLowerCase().includes(q) || row.doctor.toLowerCase().includes(q) || row.invoiceNo.toLowerCase().includes(q);
      if (!matchesSearch) return false;

      if (this.statusFilter && row.status !== this.statusFilter) return false;
      if (this.doctorFilter && row.doctor !== this.doctorFilter) return false;

      const date = new Date(row.dateIso);
      if (this.activeQuickFilter === 'today' && !this.isSameDay(date, now)) return false;
      if (this.activeQuickFilter === 'week' && !this.isSameWeek(date, now)) return false;
      if (this.activeQuickFilter === 'month' && !this.isSameMonth(date, now)) return false;

      return true;
    });
  }

  statusClass(status: InvoiceStatus): string {
    return `status-${status.toLowerCase()}`;
  }

  formatDate(iso: string): string {
    return new Date(iso).toLocaleDateString('en-GB', { day: '2-digit', month: '2-digit', year: '2-digit' });
  }

  formatTime(iso: string): string {
    return new Date(iso).toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit', hour12: true });
  }

  onNewInvoice(): void { console.log('Open new invoice modal'); }
  onExport(): void { console.log('Export invoices'); }
  onView(row: InvoiceRow): void { console.log('View invoice', row.invoiceNo); }
  onRecordPayment(row: InvoiceRow): void { console.log('Record payment for', row.invoiceNo); }
  onViewPayments(): void { console.log('View all payments'); }
  onDelete(row: InvoiceRow): void { this.invoices = this.invoices.filter((i) => i.invoiceNo !== row.invoiceNo); this.applyFilters(); }

  private isSameDay(a: Date, b: Date): boolean { return a.getFullYear() === b.getFullYear() && a.getMonth() === b.getMonth() && a.getDate() === b.getDate(); }

  private isSameWeek(a: Date, b: Date): boolean {
    const startOfWeek = (d: Date) => {
      const date = new Date(d);
      const day = date.getDay();
      const diff = date.getDate() - day + (day === 0 ? -6 : 1);
      return new Date(date.setDate(diff));
    };
    const startA = startOfWeek(a);
    const startB = startOfWeek(b);
    return this.isSameDay(startA, startB);
  }

  private isSameMonth(a: Date, b: Date): boolean { return a.getFullYear() === b.getFullYear() && a.getMonth() === b.getMonth(); }
}





