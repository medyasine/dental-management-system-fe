import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

// ─── Interfaces ──────────────────────────────────────────────────────────────

type InvoiceStatus = 'Paid' | 'Partial' | 'Unpaid' | 'Overdue' | 'Cancelled' | 'Refunded';
type PaymentMethod = 'Cash' | 'UPI' | 'Card' | 'Insurance' | 'EMI' | 'Cheque';
type BillingTab = 'invoices' | 'payments' | 'outstanding' | 'reports';
type QuickFilter = 'today' | 'week' | 'month' | 'custom';
type SortField = 'invoiceDate' | 'patientName' | 'totalAmount' | 'paidAmount' | 'dueAmount' | 'status' | '';

interface InvoiceRow {
  id: number;
  invoiceNo: string;
  invoiceDate: string;
  patientName: string;
  patientId: string;
  phone: string;
  doctorName: string;
  procedures: ProcedureItem[];
  subtotal: number;
  discount: number;
  tax: number;
  totalAmount: number;
  paidAmount: number;
  dueAmount: number;
  paymentMethod?: PaymentMethod;
  status: InvoiceStatus;
  notes?: string;
  insuranceClaim?: string;
  dueDate?: string;
  selected?: boolean;
}

interface ProcedureItem {
  name: string;
  qty: number;
  rate: number;
  amount: number;
}

interface PaymentRecord {
  id: number;
  invoiceNo: string;
  patientName: string;
  date: string;
  amount: number;
  method: PaymentMethod;
  reference?: string;
  receivedBy: string;
}

// ─── Component ───────────────────────────────────────────────────────────────

@Component({
  selector: 'app-billing-page',
  standalone: true,
  imports: [CommonModule, FormsModule],
  template: `
<div class="billing-page">

  <!-- ── KPI Strip ─────────────────────────────────────────── -->
  <div class="kpi-strip">
    <div class="kpi-card" *ngFor="let k of kpiCards" [class.kpi-clickable]="k.filter" (click)="k.filter && setStatusFilter(k.filter)">
      <div class="kpi-ico" [style.background]="k.bg" [style.color]="k.color">{{ k.icon }}</div>
      <div class="kpi-body">
        <div class="kpi-val">{{ k.prefix || '' }}{{ k.value | number }}</div>
        <div class="kpi-lbl">{{ k.label }}</div>
        <div class="kpi-sub" *ngIf="k.sub">{{ k.sub }}</div>
      </div>
    </div>
  </div>

  <!-- ── Main Card ─────────────────────────────────────────── -->
  <div class="main-card">

    <!-- Topbar -->
    <div class="card-topbar">
      <div class="tabs-wrap">
        <button class="tab-btn" *ngFor="let t of tabs" [class.active]="activeTab === t.val" (click)="setTab(t.val)">
          {{ t.label }}
          <span class="tab-badge" *ngIf="t.badge">{{ t.badge }}</span>
        </button>
      </div>
      <div class="topbar-actions">
        <button class="btn-ghost" (click)="exportCSV()"><i class="pi pi-download"></i> Export</button>
        <button class="btn-ghost" (click)="printReport()"><i class="pi pi-print"></i> Print</button>
        <button class="btn-primary" (click)="openNewInvoice()"><i class="pi pi-plus"></i> New Invoice</button>
      </div>
    </div>

    <!-- Toolbar -->
    <div class="toolbar">
      <div class="search-box" [class.focused]="searchFocused">
        <i class="pi pi-search search-ico"></i>
        <input class="search-input" [(ngModel)]="search" placeholder="Search by patient, invoice no, phone…"
          (ngModelChange)="applyFilters()" (focus)="searchFocused=true" (blur)="searchFocused=false" />
        <button *ngIf="search" class="clear-btn pi pi-times" (click)="clearSearch()"></button>
      </div>

      <div class="date-range-box">
        <i class="pi pi-calendar" style="color:#adb5bd;font-size:.82rem"></i>
        <input class="date-input" type="date" [(ngModel)]="dateFrom" (change)="applyFilters()" />
        <span style="color:#adb5bd;font-size:.8rem">→</span>
        <input class="date-input" type="date" [(ngModel)]="dateTo" (change)="applyFilters()" />
      </div>

      <div class="quick-filters">
        <button class="qf-btn" *ngFor="let qf of quickFilters" [class.active]="activeQuick === qf.val" (click)="setQuick(qf.val)">{{ qf.label }}</button>
      </div>

      <select class="filter-select" [(ngModel)]="filterDoctor" (change)="applyFilters()">
        <option value="">All Doctors</option>
        <option *ngFor="let d of doctors" [value]="d">{{ d }}</option>
      </select>

      <select class="filter-select" [(ngModel)]="filterMethod" (change)="applyFilters()">
        <option value="">All Methods</option>
        <option *ngFor="let m of paymentMethods" [value]="m">{{ m }}</option>
      </select>
    </div>

    <!-- Status Chips -->
    <div class="status-chips-bar">
      <button class="sch-chip" *ngFor="let s of statusChips"
        [class]="'sch-chip ' + s.cls + (filterStatus === s.val ? ' active' : '')"
        (click)="toggleStatusChip(s.val)">
        <span class="sch-dot"></span> {{ s.label }}
        <span class="sch-count">{{ countByStatus(s.val) }}</span>
      </button>
    </div>

    <!-- Bulk Action Bar -->
    <div class="bulk-bar" [class.visible]="selectedCount > 0">
      <span class="bulk-count">{{ selectedCount }} invoices selected</span>
      <div class="bulk-btns">
        <button class="bulk-btn" (click)="bulkPrint()"><i class="pi pi-print"></i> Print</button>
        <button class="bulk-btn" (click)="bulkExport()"><i class="pi pi-download"></i> Export</button>
        <button class="bulk-btn" (click)="bulkSendReminder()"><i class="pi pi-send"></i> Send Reminder</button>
        <button class="bulk-btn danger" (click)="bulkCancel()"><i class="pi pi-ban"></i> Cancel</button>
      </div>
      <button class="bulk-clear pi pi-times" (click)="clearSelection()"></button>
    </div>

    <!-- ─ INVOICES TAB ─ -->
    <ng-container *ngIf="activeTab === 'invoices'">
      <div class="table-scroll">
        <table class="bt">
          <thead>
            <tr>
              <th class="col-check"><input type="checkbox" [checked]="allSelected" (change)="toggleSelectAll($event)" /></th>
              <th class="col-inv sortable" (click)="sort('invoiceDate')">Invoice <i class="pi" [class]="sortIcon('invoiceDate')"></i></th>
              <th class="col-patient sortable" (click)="sort('patientName')">Patient <i class="pi" [class]="sortIcon('patientName')"></i></th>
              <th class="col-doctor">Doctor</th>
              <th class="col-procedures">Procedures</th>
              <th class="col-total sortable" (click)="sort('totalAmount')">Total <i class="pi" [class]="sortIcon('totalAmount')"></i></th>
              <th class="col-paid sortable" (click)="sort('paidAmount')">Paid <i class="pi" [class]="sortIcon('paidAmount')"></i></th>
              <th class="col-due sortable" (click)="sort('dueAmount')">Due <i class="pi" [class]="sortIcon('dueAmount')"></i></th>
              <th class="col-method">Method</th>
              <th class="col-status sortable" (click)="sort('status')">Status <i class="pi" [class]="sortIcon('status')"></i></th>
              <th class="col-action">Actions</th>
            </tr>
          </thead>
          <tbody>
            <tr class="bt-row" *ngFor="let row of pagedRows"
              [class]="'bt-row status-row-' + row.status.toLowerCase()"
              (click)="openDrawer(row)">

              <td class="col-check" (click)="$event.stopPropagation()">
                <input type="checkbox" [(ngModel)]="row.selected" (change)="onRowSelect()" />
              </td>

              <td class="col-inv">
                <div class="inv-stack">
                  <span class="inv-no">{{ row.invoiceNo }}</span>
                  <span class="inv-date">{{ formatDate(row.invoiceDate) }}</span>
                </div>
              </td>

              <td class="col-patient">
                <div class="patient-cell">
                  <div class="pt-av" [class]="'pt-av male'">{{ row.patientName[0] }}</div>
                  <div class="pt-info">
                    <span class="pt-name">{{ row.patientName }}</span>
                    <span class="pt-phone">{{ row.phone }}</span>
                  </div>
                </div>
              </td>

              <td class="col-doctor">
                <div class="dr-cell">
                  <div class="dr-av">{{ drInitials(row.doctorName) }}</div>
                  <span class="dr-name">{{ row.doctorName }}</span>
                </div>
              </td>

              <td class="col-procedures">
                <div class="proc-list">
                  <span class="proc-tag" *ngFor="let p of row.procedures.slice(0,2)">{{ p.name }}</span>
                  <span class="proc-more" *ngIf="row.procedures.length > 2">+{{ row.procedures.length - 2 }}</span>
                </div>
              </td>

              <td class="col-total">
                <span class="amount-val">₹{{ row.totalAmount | number }}</span>
                <span class="discount-tag" *ngIf="row.discount > 0">-₹{{ row.discount | number }}</span>
              </td>

              <td class="col-paid">
                <span class="paid-val" [class.green]="row.paidAmount > 0">₹{{ row.paidAmount | number }}</span>
              </td>

              <td class="col-due" (click)="$event.stopPropagation(); openPayment(row)">
                <span *ngIf="row.dueAmount > 0" class="due-val red">₹{{ row.dueAmount | number }}</span>
                <span *ngIf="row.dueAmount === 0" class="due-val green">Nil</span>
              </td>

              <td class="col-method">
                <span class="method-badge" *ngIf="row.paymentMethod" [class]="'method-badge m-' + row.paymentMethod.toLowerCase()">
                  {{ row.paymentMethod }}
                </span>
                <span class="muted" *ngIf="!row.paymentMethod">—</span>
              </td>

              <td class="col-status" (click)="$event.stopPropagation()">
                <span class="status-badge" [class]="'status-badge sb-' + row.status.toLowerCase()">{{ row.status }}</span>
              </td>

              <td class="col-action" (click)="$event.stopPropagation()">
                <div class="row-actions">
                  <button class="act-btn" title="View" (click)="openDrawer(row)"><i class="pi pi-eye"></i></button>
                  <button class="act-btn" title="Print Invoice" (click)="printInvoice(row)"><i class="pi pi-print"></i></button>
                  <button class="act-btn green" title="Collect Payment" (click)="openPayment(row)" *ngIf="row.dueAmount > 0"><i class="pi pi-wallet"></i></button>
                  <button class="act-btn warn" title="Cancel" (click)="confirmCancel(row)" *ngIf="row.status !== 'Cancelled'"><i class="pi pi-ban"></i></button>
                </div>
              </td>
            </tr>

            <tr *ngIf="pagedRows.length === 0">
              <td colspan="11" class="empty-state">
                <div class="empty-inner">
                  <i class="pi pi-file empty-ico"></i>
                  <p>No invoices found</p>
                  <span>Try adjusting your filters or create a new invoice</span>
                  <button class="btn-primary small" (click)="openNewInvoice()"><i class="pi pi-plus"></i> New Invoice</button>
                </div>
              </td>
            </tr>
          </tbody>
        </table>
      </div>

      <!-- Table Footer Summary -->
      <div class="table-footer-summary">
        <div class="tfs-item">
          <span class="tfs-lbl">Filtered Total</span>
          <span class="tfs-val">₹{{ filteredTotal | number }}</span>
        </div>
        <div class="tfs-item">
          <span class="tfs-lbl">Collected</span>
          <span class="tfs-val green">₹{{ filteredPaid | number }}</span>
        </div>
        <div class="tfs-item">
          <span class="tfs-lbl">Outstanding</span>
          <span class="tfs-val red">₹{{ filteredDue | number }}</span>
        </div>
        <div class="tfs-item">
          <span class="tfs-lbl">Avg Invoice</span>
          <span class="tfs-val">₹{{ filteredAvg | number:'1.0-0' }}</span>
        </div>
      </div>
    </ng-container>

    <!-- ─ PAYMENTS TAB ─ -->
    <ng-container *ngIf="activeTab === 'payments'">
      <div class="table-scroll">
        <table class="bt">
          <thead>
            <tr>
              <th>Payment ID</th>
              <th>Invoice No.</th>
              <th>Patient</th>
              <th>Date</th>
              <th>Amount</th>
              <th>Method</th>
              <th>Reference</th>
              <th>Received By</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            <tr class="bt-row" *ngFor="let p of paymentRecords">
              <td><span class="inv-no">#{{ p.id }}</span></td>
              <td><span class="inv-no">{{ p.invoiceNo }}</span></td>
              <td>
                <div class="patient-cell">
                  <div class="pt-av male">{{ p.patientName[0] }}</div>
                  <span class="pt-name">{{ p.patientName }}</span>
                </div>
              </td>
              <td><span class="inv-date">{{ formatDate(p.date) }}</span></td>
              <td><span class="paid-val green">₹{{ p.amount | number }}</span></td>
              <td><span class="method-badge" [class]="'method-badge m-' + p.method.toLowerCase()">{{ p.method }}</span></td>
              <td><span class="muted">{{ p.reference || '—' }}</span></td>
              <td>{{ p.receivedBy }}</td>
              <td>
                <button class="act-btn" title="Receipt"><i class="pi pi-print"></i></button>
              </td>
            </tr>
            <tr *ngIf="paymentRecords.length === 0">
              <td colspan="9" class="empty-state"><div class="empty-inner"><i class="pi pi-wallet empty-ico"></i><p>No payments recorded</p></div></td>
            </tr>
          </tbody>
        </table>
      </div>
    </ng-container>

    <!-- ─ OUTSTANDING TAB ─ -->
    <ng-container *ngIf="activeTab === 'outstanding'">
      <div class="outstanding-grid">
        <div class="ost-card" *ngFor="let row of overdueRows" (click)="openDrawer(row)">
          <div class="ost-header">
            <div class="patient-cell">
              <div class="pt-av male">{{ row.patientName[0] }}</div>
              <div class="pt-info">
                <span class="pt-name">{{ row.patientName }}</span>
                <span class="pt-phone">{{ row.phone }}</span>
              </div>
            </div>
            <span class="status-badge" [class]="'status-badge sb-' + row.status.toLowerCase()">{{ row.status }}</span>
          </div>
          <div class="ost-amounts">
            <div class="ost-amt-row">
              <span class="ost-lbl">Invoice</span>
              <span class="ost-val">₹{{ row.totalAmount | number }}</span>
            </div>
            <div class="ost-amt-row">
              <span class="ost-lbl">Paid</span>
              <span class="ost-val green">₹{{ row.paidAmount | number }}</span>
            </div>
            <div class="ost-amt-row highlight">
              <span class="ost-lbl">Due</span>
              <span class="ost-val red">₹{{ row.dueAmount | number }}</span>
            </div>
          </div>
          <div class="ost-footer">
            <span class="inv-date">{{ row.invoiceNo }} · {{ formatDate(row.invoiceDate) }}</span>
            <div class="ost-actions" (click)="$event.stopPropagation()">
              <button class="ia-btn ia-collect" (click)="openPayment(row)"><i class="pi pi-wallet"></i> Collect</button>
              <button class="ia-btn ia-remind" (click)="sendReminder(row)"><i class="pi pi-send"></i> Remind</button>
            </div>
          </div>
        </div>
        <div class="empty-state" *ngIf="overdueRows.length === 0" style="padding:3rem;text-align:center">
          <div class="empty-inner">
            <i class="pi pi-check-circle empty-ico" style="color:#10b981"></i>
            <p>No outstanding dues!</p>
            <span>All invoices are settled.</span>
          </div>
        </div>
      </div>
    </ng-container>

    <!-- ─ REPORTS TAB ─ -->
    <ng-container *ngIf="activeTab === 'reports'">
      <div class="reports-grid">
        <div class="report-section">
          <h4 class="section-title">Revenue by Doctor</h4>
          <div class="report-table">
            <div class="rt-row header">
              <span>Doctor</span><span>Invoices</span><span>Revenue</span><span>Collected</span><span>Due</span>
            </div>
            <div class="rt-row" *ngFor="let d of revenueByDoctor">
              <span class="dr-name">{{ d.doctor }}</span>
              <span class="muted">{{ d.count }}</span>
              <span class="amount-val">₹{{ d.total | number }}</span>
              <span class="paid-val green">₹{{ d.paid | number }}</span>
              <span class="due-val red">₹{{ d.due | number }}</span>
            </div>
          </div>
        </div>

        <div class="report-section">
          <h4 class="section-title">Revenue by Payment Method</h4>
          <div class="report-table">
            <div class="rt-row header"><span>Method</span><span>Transactions</span><span>Amount</span></div>
            <div class="rt-row" *ngFor="let m of revenueByMethod">
              <span><span class="method-badge" [class]="'method-badge m-' + m.method.toLowerCase()">{{ m.method }}</span></span>
              <span class="muted">{{ m.count }}</span>
              <span class="paid-val green">₹{{ m.amount | number }}</span>
            </div>
          </div>
        </div>

        <div class="report-section">
          <h4 class="section-title">Top Procedures by Revenue</h4>
          <div class="report-table">
            <div class="rt-row header"><span>Procedure</span><span>Count</span><span>Revenue</span></div>
            <div class="rt-row" *ngFor="let p of topProcedures">
              <span>{{ p.name }}</span>
              <span class="muted">{{ p.count }}</span>
              <span class="amount-val">₹{{ p.revenue | number }}</span>
            </div>
          </div>
        </div>
      </div>
    </ng-container>

    <!-- Pagination (Invoices only) -->
    <div class="pagination-bar" *ngIf="activeTab === 'invoices'">
      <div class="pg-size">
        <span class="pg-lbl">Show</span>
        <select [(ngModel)]="pageSize" (change)="onPageSizeChange()">
          <option [value]="10">10</option>
          <option [value]="25">25</option>
          <option [value]="50">50</option>
        </select>
        <span class="pg-lbl">per page</span>
      </div>
      <span class="pg-info">Showing {{ pageStart + 1 }}–{{ pageEnd }} of {{ filteredRows.length }}</span>
      <div class="pg-nav">
        <button class="pg-btn" [disabled]="currentPage === 1" (click)="goPage(currentPage - 1)"><i class="pi pi-angle-left"></i></button>
        <button class="pg-num" *ngFor="let p of visiblePages" [class.active]="p === currentPage" (click)="goPage(p)">{{ p }}</button>
        <button class="pg-btn" [disabled]="currentPage === totalPages" (click)="goPage(currentPage + 1)"><i class="pi pi-angle-right"></i></button>
      </div>
    </div>

  </div><!-- /main-card -->
</div><!-- /billing-page -->

<!-- ── Invoice Detail Drawer ─────────────────────────────────────────── -->
<div class="drawer-overlay" [class.open]="drawerOpen" (click)="closeDrawer()"></div>
<div class="drawer" [class.open]="drawerOpen">
  <div class="drawer-inner" *ngIf="drawerInvoice">
    <div class="drawer-head">
      <div>
        <h3 class="drawer-title">{{ drawerInvoice.invoiceNo }}</h3>
        <span class="status-badge" [class]="'status-badge sb-' + drawerInvoice.status.toLowerCase()">{{ drawerInvoice.status }}</span>
      </div>
      <button class="drawer-close pi pi-times" (click)="closeDrawer()"></button>
    </div>

    <div class="drawer-patient">
      <div class="pt-av male large">{{ drawerInvoice.patientName[0] }}</div>
      <div>
        <div class="pt-name" style="font-size:1rem;font-weight:700">{{ drawerInvoice.patientName }}</div>
        <div class="pt-phone">{{ drawerInvoice.phone }} · {{ drawerInvoice.doctorName }}</div>
        <div class="pt-phone">{{ formatDate(drawerInvoice.invoiceDate) }}</div>
      </div>
    </div>

    <!-- Procedures Table -->
    <div class="proc-table">
      <div class="proc-header">
        <span>Procedure</span><span>Qty</span><span>Rate</span><span>Amount</span>
      </div>
      <div class="proc-row" *ngFor="let p of drawerInvoice.procedures">
        <span>{{ p.name }}</span>
        <span class="muted">{{ p.qty }}</span>
        <span class="muted">₹{{ p.rate | number }}</span>
        <span class="amount-val">₹{{ p.amount | number }}</span>
      </div>
    </div>

    <!-- Totals -->
    <div class="totals-block">
      <div class="total-row"><span>Subtotal</span><span>₹{{ drawerInvoice.subtotal | number }}</span></div>
      <div class="total-row" *ngIf="drawerInvoice.discount > 0">
        <span class="discount-lbl">Discount</span><span class="red">-₹{{ drawerInvoice.discount | number }}</span>
      </div>
      <div class="total-row" *ngIf="drawerInvoice.tax > 0">
        <span>Tax / GST</span><span>₹{{ drawerInvoice.tax | number }}</span>
      </div>
      <div class="total-row bold"><span>Total</span><span>₹{{ drawerInvoice.totalAmount | number }}</span></div>
      <div class="total-row"><span class="green">Paid</span><span class="green">₹{{ drawerInvoice.paidAmount | number }}</span></div>
      <div class="total-row bold" [class.red-row]="drawerInvoice.dueAmount > 0">
        <span>Balance Due</span><span [class.red]="drawerInvoice.dueAmount > 0">₹{{ drawerInvoice.dueAmount | number }}</span>
      </div>
    </div>

    <div class="drawer-actions">
      <button class="dbtn primary" (click)="openPayment(drawerInvoice)" *ngIf="drawerInvoice.dueAmount > 0">
        <i class="pi pi-wallet"></i> Collect Payment
      </button>
      <button class="dbtn" (click)="printInvoice(drawerInvoice)"><i class="pi pi-print"></i> Print</button>
      <button class="dbtn green" (click)="sendWhatsApp(drawerInvoice.phone)"><i class="pi pi-comments"></i> WhatsApp</button>
    </div>
  </div>
</div>

<!-- ── Collect Payment Modal ──────────────────────────────────────────── -->
<div class="modal-overlay" [class.open]="paymentModal.open">
  <div class="modal modal-form" *ngIf="paymentModal.invoice">
    <div class="modal-head">
      <h3>Collect Payment</h3>
      <button class="drawer-close pi pi-times" (click)="closePaymentModal()"></button>
    </div>
    <div class="payment-summary">
      <div class="ps-row"><span>Patient</span><strong>{{ paymentModal.invoice.patientName }}</strong></div>
      <div class="ps-row"><span>Invoice</span><strong>{{ paymentModal.invoice.invoiceNo }}</strong></div>
      <div class="ps-row"><span>Total Due</span><strong class="red">₹{{ paymentModal.invoice.dueAmount | number }}</strong></div>
    </div>
    <div class="form-grid">
      <div class="fg fg-full">
        <label>Amount Receiving *</label>
        <input type="number" [(ngModel)]="paymentForm.amount" [placeholder]="'Up to ₹' + paymentModal.invoice.dueAmount" />
      </div>
      <div class="fg">
        <label>Payment Method *</label>
        <select [(ngModel)]="paymentForm.method">
          <option value="">Select…</option>
          <option *ngFor="let m of paymentMethods" [value]="m">{{ m }}</option>
        </select>
      </div>
      <div class="fg">
        <label>Reference / Transaction ID</label>
        <input [(ngModel)]="paymentForm.reference" placeholder="Optional" />
      </div>
      <div class="fg fg-full">
        <label>Notes</label>
        <input [(ngModel)]="paymentForm.notes" placeholder="Optional notes…" />
      </div>
    </div>
    <div class="modal-actions">
      <button class="mbtn ghost" (click)="closePaymentModal()">Cancel</button>
      <button class="mbtn teal" (click)="collectAndSendReceipt()"><i class="pi pi-send"></i> Collect & Send Receipt</button>
      <button class="mbtn primary" (click)="collectPayment()"><i class="pi pi-check"></i> Collect Payment</button>
    </div>
  </div>
</div>

<!-- ── New Invoice Modal ──────────────────────────────────────────────── -->
<div class="modal-overlay" [class.open]="newInvoiceModal">
  <div class="modal modal-form modal-wide">
    <div class="modal-head">
      <h3>New Invoice</h3>
      <button class="drawer-close pi pi-times" (click)="newInvoiceModal = false"></button>
    </div>
    <div class="form-grid">
      <div class="fg">
        <label>Patient *</label>
        <input [(ngModel)]="newInv.patientName" placeholder="Search patient…" />
      </div>
      <div class="fg">
        <label>Phone</label>
        <input [(ngModel)]="newInv.phone" placeholder="Phone number" />
      </div>
      <div class="fg">
        <label>Doctor *</label>
        <select [(ngModel)]="newInv.doctorName">
          <option value="">Select doctor…</option>
          <option *ngFor="let d of doctors" [value]="d">{{ d }}</option>
        </select>
      </div>
      <div class="fg">
        <label>Invoice Date</label>
        <input type="date" [(ngModel)]="newInv.invoiceDate" />
      </div>
    </div>

    <!-- Procedures -->
    <div class="proc-builder">
      <div class="proc-builder-header">
        <span class="section-title">Procedures / Services</span>
        <button class="btn-ghost small" (click)="addProcedure()"><i class="pi pi-plus"></i> Add Item</button>
      </div>
      <div class="proc-builder-row header-row">
        <span>Procedure / Item</span><span>Qty</span><span>Rate (₹)</span><span>Amount</span><span></span>
      </div>
      <div class="proc-builder-row" *ngFor="let p of newInv.procedures; let i = index">
        <input [(ngModel)]="p.name" placeholder="e.g. Root Canal, Scaling…" />
        <input type="number" [(ngModel)]="p.qty" (ngModelChange)="recalcProcedure(i)" min="1" />
        <input type="number" [(ngModel)]="p.rate" (ngModelChange)="recalcProcedure(i)" />
        <span class="amount-val">₹{{ p.amount | number }}</span>
        <button class="icon-remove pi pi-times" (click)="removeProcedure(i)"></button>
      </div>
    </div>

    <!-- Totals -->
    <div class="invoice-totals">
      <div class="it-row"><span>Subtotal</span><span>₹{{ newInvSubtotal | number }}</span></div>
      <div class="it-row">
        <span>Discount (₹)</span>
        <input type="number" [(ngModel)]="newInv.discount" class="small-input" />
      </div>
      <div class="it-row">
        <span>Tax / GST (₹)</span>
        <input type="number" [(ngModel)]="newInv.tax" class="small-input" />
      </div>
      <div class="it-row bold"><span>Total</span><span class="amount-val">₹{{ newInvTotal | number }}</span></div>
    </div>

    <div class="modal-actions">
      <button class="mbtn ghost" (click)="newInvoiceModal = false">Cancel</button>
      <button class="mbtn teal" (click)="saveAndCollect()"><i class="pi pi-wallet"></i> Save & Collect</button>
      <button class="mbtn primary" (click)="saveInvoice()">Save Invoice</button>
    </div>
  </div>
</div>

<!-- ── Cancel Modal ───────────────────────────────────────────────────── -->
<div class="modal-overlay" [class.open]="cancelModal.open">
  <div class="modal" *ngIf="cancelModal.invoice">
    <div class="modal-icon warn"><i class="pi pi-exclamation-triangle"></i></div>
    <h3 class="modal-title">Cancel Invoice?</h3>
    <p class="modal-body">Cancel invoice <strong>{{ cancelModal.invoice.invoiceNo }}</strong> for <strong>{{ cancelModal.invoice.patientName }}</strong>? This action cannot be undone.</p>
    <div class="modal-actions" style="justify-content:center">
      <button class="mbtn ghost" (click)="closeCancelModal()">Keep Invoice</button>
      <button class="mbtn danger" (click)="executeCancel()">Cancel Invoice</button>
    </div>
  </div>
</div>
  `,

  styles: [`
    :host { display: block; }

    .billing-page {
      padding: 1.5rem 1.75rem;
      background: var(--surface-ground, #f8f9fa);
      min-height: 100%;
      display: flex; flex-direction: column; gap: 1.1rem;
    }

    /* ── KPI Strip ── */
    .kpi-strip { display: grid; grid-template-columns: repeat(auto-fit, minmax(160px, 1fr)); gap: 0.85rem; }
    .kpi-card { background: #fff; border: 1px solid #dee2e6; border-radius: 10px; padding: 0.9rem 1rem; display: flex; align-items: center; gap: 0.8rem; transition: box-shadow .2s; }
    .kpi-card:hover { box-shadow: 0 3px 14px rgba(0,0,0,.07); }
    .kpi-clickable { cursor: pointer; }
    .kpi-clickable:hover { border-color: #10b981; }
    .kpi-ico { width: 40px; height: 40px; border-radius: 10px; display: flex; align-items: center; justify-content: center; font-size: 1.15rem; flex-shrink: 0; }
    .kpi-val { font-size: 1.25rem; font-weight: 700; color: #212529; line-height: 1; }
    .kpi-lbl { font-size: 0.72rem; color: #6c757d; font-weight: 500; margin-top: 0.18rem; }
    .kpi-sub { font-size: 0.68rem; color: #adb5bd; margin-top: 0.1rem; }

    /* ── Main Card ── */
    .main-card { background: #fff; border: 1px solid #dee2e6; border-radius: 12px; overflow: hidden; }

    /* Topbar */
    .card-topbar { display: flex; align-items: center; justify-content: space-between; padding: 1rem 1.4rem; border-bottom: 1px solid #f1f3f4; gap: 1rem; }
    .tabs-wrap { display: flex; gap: 0.3rem; }
    .tab-btn { display: inline-flex; align-items: center; gap: 0.4rem; background: transparent; border: none; border-radius: 8px; padding: 0.5rem 1rem; font-size: 0.86rem; font-weight: 600; color: #6c757d; cursor: pointer; transition: all .15s; }
    .tab-btn:hover { background: #f8f9fa; color: #212529; }
    .tab-btn.active { background: #10b981; color: #fff; }
    .tab-badge { font-size: 0.68rem; font-weight: 700; padding: 0.1rem 0.4rem; border-radius: 99px; }
    .tab-btn.active .tab-badge { background: rgba(255,255,255,.3); }
    .tab-btn:not(.active) .tab-badge { background: #dee2e6; color: #495057; }
    .topbar-actions { display: flex; gap: 0.5rem; align-items: center; }
    .btn-ghost { background: #fff; color: #495057; border: 1px solid #dee2e6; border-radius: 8px; padding: 0.48rem 0.9rem; font-size: 0.82rem; font-weight: 600; cursor: pointer; display: inline-flex; align-items: center; gap: 0.4rem; transition: all .15s; }
    .btn-ghost:hover { border-color: #10b981; color: #10b981; }
    .btn-ghost.small { padding: 0.32rem 0.65rem; font-size: 0.75rem; }
    .btn-primary { background: #10b981; color: #fff; border: none; border-radius: 8px; padding: 0.52rem 1rem; font-size: 0.83rem; font-weight: 600; cursor: pointer; display: inline-flex; align-items: center; gap: 0.4rem; transition: background .15s; white-space: nowrap; }
    .btn-primary:hover { background: #0d9488; }
    .btn-primary.small { padding: 0.38rem 0.75rem; font-size: 0.78rem; }

    /* Toolbar */
    .toolbar { display: flex; align-items: center; gap: 0.65rem; padding: 0.85rem 1.4rem; flex-wrap: wrap; border-bottom: 1px solid #f8f9fa; }
    .search-box { display: flex; align-items: center; gap: 0.5rem; background: #f8f9fa; border: 1px solid #dee2e6; border-radius: 8px; padding: 0 0.8rem; height: 38px; flex: 1; min-width: 220px; transition: border-color .15s; }
    .search-box.focused { border-color: #10b981; background: #fff; }
    .search-ico { color: #adb5bd; font-size: 0.82rem; }
    .search-input { background: transparent; border: none; outline: none; flex: 1; font-size: 0.84rem; color: #212529; }
    .clear-btn { background: transparent; border: none; color: #adb5bd; cursor: pointer; font-size: 0.78rem; padding: 0; }
    .date-range-box { display: flex; align-items: center; gap: 0.45rem; background: #f8f9fa; border: 1px solid #dee2e6; border-radius: 8px; padding: 0 0.75rem; height: 38px; }
    .date-input { background: transparent; border: none; outline: none; font-size: 0.79rem; color: #495057; width: 118px; }
    .quick-filters { display: flex; gap: 0.3rem; }
    .qf-btn { background: #f8f9fa; border: 1px solid #dee2e6; border-radius: 7px; padding: 0.3rem 0.72rem; font-size: 0.78rem; font-weight: 600; color: #6c757d; cursor: pointer; transition: all .15s; }
    .qf-btn:hover { border-color: #10b981; color: #10b981; }
    .qf-btn.active { background: #10b981; border-color: #10b981; color: #fff; }
    .filter-select { background: #f8f9fa; border: 1px solid #dee2e6; border-radius: 8px; padding: 0.3rem 0.65rem; font-size: 0.82rem; color: #495057; outline: none; height: 38px; cursor: pointer; }
    .filter-select:focus { border-color: #10b981; }

    /* Status chips */
    .status-chips-bar { display: flex; gap: 0.4rem; padding: 0.6rem 1.4rem; border-bottom: 1px solid #f1f3f4; flex-wrap: wrap; }
    .sch-chip { display: inline-flex; align-items: center; gap: 0.35rem; border: 1px solid #dee2e6; background: #fff; border-radius: 20px; padding: 0.25rem 0.7rem; font-size: 0.75rem; font-weight: 600; color: #6c757d; cursor: pointer; transition: all .15s; }
    .sch-chip:hover { border-color: #adb5bd; }
    .sch-dot { width: 7px; height: 7px; border-radius: 50%; background: currentColor; }
    .sch-count { background: #f8f9fa; border-radius: 99px; padding: 0.08rem 0.45rem; font-size: 0.68rem; font-weight: 700; }
    .sch-chip.paid { color: #15803d; } .sch-chip.paid.active { background: #dcfce7; border-color: #86efac; }
    .sch-chip.partial { color: #b45309; } .sch-chip.partial.active { background: #fff8e6; border-color: #fde68a; }
    .sch-chip.unpaid { color: #6c757d; } .sch-chip.unpaid.active { background: #e9ecef; border-color: #dee2e6; }
    .sch-chip.overdue { color: #dc2626; } .sch-chip.overdue.active { background: #fff5f5; border-color: #fca5a5; }
    .sch-chip.cancelled { color: #495057; } .sch-chip.cancelled.active { background: #f1f3f4; border-color: #dee2e6; }

    /* Bulk bar */
    .bulk-bar { display: flex; align-items: center; gap: 0.8rem; padding: 0.6rem 1.4rem; background: #0f172a; color: #fff; max-height: 0; overflow: hidden; transition: max-height .25s; }
    .bulk-bar.visible { max-height: 60px; }
    .bulk-count { font-size: 0.84rem; font-weight: 600; flex-shrink: 0; }
    .bulk-btns { display: flex; gap: 0.4rem; }
    .bulk-btn { background: rgba(255,255,255,.1); border: 1px solid rgba(255,255,255,.2); border-radius: 7px; color: #fff; padding: 0.3rem 0.7rem; font-size: 0.78rem; font-weight: 600; cursor: pointer; display: inline-flex; align-items: center; gap: 0.35rem; transition: background .15s; }
    .bulk-btn:hover { background: rgba(255,255,255,.18); }
    .bulk-btn.danger { border-color: rgba(239,68,68,.5); color: #fca5a5; }
    .bulk-clear { background: transparent; border: none; color: rgba(255,255,255,.5); cursor: pointer; margin-left: auto; font-size: 1rem; padding: 0 0.3rem; }

    /* Table */
    .table-scroll { overflow-x: auto; }
    .bt { width: 100%; border-collapse: collapse; min-width: 1100px; }
    .bt thead th { background: #f8f9fa; text-align: left; font-size: 0.71rem; font-weight: 700; color: #adb5bd; text-transform: uppercase; letter-spacing: 0.06em; padding: 0.65rem 0.75rem; border-bottom: 1px solid #dee2e6; white-space: nowrap; }
    .bt thead th.sortable { cursor: pointer; user-select: none; }
    .bt thead th.sortable:hover { color: #10b981; }
    .bt thead th .pi { margin-left: 3px; font-size: 0.62rem; }
    .bt-row { cursor: pointer; transition: background .1s; }
    .bt-row:hover { background: #f8fffe; }
    .bt-row td { padding: 0.68rem 0.75rem; border-bottom: 1px solid #f1f3f4; font-size: 0.84rem; color: #495057; vertical-align: middle; }
    .bt-row:last-child td { border-bottom: none; }
    .status-row-paid td { background: #f9fefb; }
    .status-row-overdue td { background: #fff9f9; }
    .status-row-cancelled { opacity: .6; }

    /* Col widths */
    .col-check { width: 36px; }
    .col-inv { width: 130px; }
    .col-patient { min-width: 180px; }
    .col-doctor { width: 140px; }
    .col-procedures { min-width: 180px; }
    .col-total { width: 110px; }
    .col-paid { width: 100px; }
    .col-due { width: 100px; }
    .col-method { width: 100px; }
    .col-status { width: 110px; }
    .col-action { width: 130px; }

    /* Cell styles */
    .muted { color: #adb5bd; font-size: 0.78rem; }
    .inv-stack { display: flex; flex-direction: column; gap: 0.08rem; }
    .inv-no { font-size: 0.82rem; font-weight: 700; color: #212529; font-family: monospace; }
    .inv-date { font-size: 0.72rem; color: #adb5bd; }
    .patient-cell { display: flex; align-items: center; gap: 0.55rem; }
    .pt-av { width: 30px; height: 30px; border-radius: 50%; flex-shrink: 0; display: flex; align-items: center; justify-content: center; font-size: 0.72rem; font-weight: 700; color: #fff; background: linear-gradient(135deg,#10b981,#0d9488); }
    .pt-av.large { width: 42px; height: 42px; font-size: 1rem; }
    .pt-info { display: flex; flex-direction: column; gap: 0.1rem; }
    .pt-name { font-size: 0.85rem; font-weight: 600; color: #212529; }
    .pt-phone { font-size: 0.72rem; color: #adb5bd; }
    .dr-cell { display: flex; align-items: center; gap: 0.45rem; }
    .dr-av { width: 26px; height: 26px; border-radius: 7px; background: #e6f9f4; color: #0d9488; font-size: 0.64rem; font-weight: 700; display: flex; align-items: center; justify-content: center; flex-shrink: 0; }
    .dr-name { font-size: 0.82rem; font-weight: 600; color: #212529; }
    .proc-list { display: flex; gap: 0.3rem; flex-wrap: wrap; }
    .proc-tag { font-size: 0.7rem; background: #f1f3f4; border: 1px solid #dee2e6; border-radius: 5px; padding: 0.12rem 0.45rem; color: #495057; white-space: nowrap; }
    .proc-more { font-size: 0.7rem; color: #adb5bd; font-weight: 600; }
    .amount-val { font-size: 0.85rem; font-weight: 700; color: #212529; }
    .discount-tag { display: block; font-size: 0.7rem; color: #dc2626; }
    .paid-val { font-size: 0.84rem; font-weight: 600; }
    .paid-val.green, .green { color: #16a34a; }
    .due-val { font-size: 0.84rem; font-weight: 700; cursor: pointer; }
    .due-val.red, .red { color: #dc2626; }
    .method-badge { font-size: 0.72rem; font-weight: 700; padding: 0.18rem 0.55rem; border-radius: 6px; border: 1px solid transparent; }
    .m-cash { background: #dcfce7; color: #15803d; border-color: #86efac; }
    .m-upi { background: #dbeafe; color: #1d4ed8; border-color: #93c5fd; }
    .m-card { background: #ede9fe; color: #7c3aed; border-color: #c4b5fd; }
    .m-insurance { background: #fff8e6; color: #b45309; border-color: #fde68a; }
    .m-emi { background: #fce7f3; color: #be185d; border-color: #fbcfe8; }
    .m-cheque { background: #f1f3f4; color: #495057; border-color: #dee2e6; }
    .status-badge { display: inline-block; font-size: 0.72rem; font-weight: 700; padding: 0.22rem 0.65rem; border-radius: 20px; border: 1px solid transparent; white-space: nowrap; }
    .sb-paid { background: #dcfce7; color: #15803d; border-color: #86efac; }
    .sb-partial { background: #fff8e6; color: #b45309; border-color: #fde68a; }
    .sb-unpaid { background: #e9ecef; color: #495057; border-color: #dee2e6; }
    .sb-overdue { background: #fff5f5; color: #dc2626; border-color: #fca5a5; }
    .sb-cancelled { background: #f1f3f4; color: #6c757d; border-color: #dee2e6; }
    .sb-refunded { background: #ede9fe; color: #7c3aed; border-color: #c4b5fd; }
    .row-actions { display: flex; gap: 0.3rem; }
    .act-btn { width: 30px; height: 30px; border-radius: 7px; border: 1px solid #dee2e6; background: #fff; color: #6c757d; cursor: pointer; font-size: 0.78rem; display: flex; align-items: center; justify-content: center; transition: all .15s; }
    .act-btn:hover { border-color: #10b981; color: #10b981; background: #f0fdf4; }
    .act-btn.green:hover { border-color: #10b981; color: #10b981; }
    .act-btn.warn:hover { border-color: #ef4444; color: #ef4444; background: #fff5f5; }
    .empty-state { padding: 3rem; text-align: center; }
    .empty-inner { display: flex; flex-direction: column; align-items: center; gap: 0.6rem; }
    .empty-ico { font-size: 2.5rem; color: #dee2e6; }
    .empty-inner p { font-size: 0.95rem; font-weight: 600; color: #6c757d; margin: 0; }
    .empty-inner span { font-size: 0.82rem; color: #adb5bd; }

    /* Table footer summary */
    .table-footer-summary { display: flex; gap: 0; border-top: 2px solid #dee2e6; }
    .tfs-item { flex: 1; padding: 0.85rem 1.4rem; border-right: 1px solid #f1f3f4; }
    .tfs-item:last-child { border-right: none; }
    .tfs-lbl { display: block; font-size: 0.72rem; color: #6c757d; font-weight: 600; text-transform: uppercase; letter-spacing: 0.05em; margin-bottom: 0.2rem; }
    .tfs-val { font-size: 1.15rem; font-weight: 700; color: #212529; }
    .tfs-val.green { color: #16a34a; }
    .tfs-val.red { color: #dc2626; }

    /* Pagination */
    .pagination-bar { display: flex; align-items: center; justify-content: space-between; padding: 0.85rem 1.4rem; border-top: 1px solid #f1f3f4; gap: 1rem; flex-wrap: wrap; }
    .pg-size { display: flex; align-items: center; gap: 0.5rem; }
    .pg-lbl { font-size: 0.8rem; color: #6c757d; }
    .pg-size select { border: 1px solid #dee2e6; border-radius: 7px; background: #fff; padding: 0.3rem 0.55rem; font-size: 0.82rem; color: #212529; outline: none; }
    .pg-info { font-size: 0.8rem; color: #6c757d; }
    .pg-nav { display: flex; align-items: center; gap: 0.3rem; }
    .pg-btn { width: 32px; height: 32px; border: 1px solid #dee2e6; background: #fff; border-radius: 7px; color: #6c757d; cursor: pointer; font-size: 0.8rem; display: flex; align-items: center; justify-content: center; transition: all .15s; }
    .pg-btn:disabled { opacity: .35; cursor: default; }
    .pg-btn:not(:disabled):hover { border-color: #10b981; color: #10b981; }
    .pg-num { min-width: 32px; height: 32px; border: 1px solid #dee2e6; background: #fff; border-radius: 7px; color: #6c757d; cursor: pointer; font-size: 0.82rem; font-weight: 600; padding: 0 0.4rem; transition: all .15s; }
    .pg-num:hover { border-color: #10b981; color: #10b981; }
    .pg-num.active { background: #10b981; border-color: #10b981; color: #fff; }

    /* Outstanding grid */
    .outstanding-grid { display: grid; grid-template-columns: repeat(auto-fill, minmax(300px, 1fr)); gap: 1rem; padding: 1.2rem 1.4rem; }
    .ost-card { background: #fff; border: 1px solid #dee2e6; border-radius: 10px; padding: 1rem; cursor: pointer; transition: box-shadow .2s, border-color .2s; }
    .ost-card:hover { box-shadow: 0 4px 16px rgba(0,0,0,.08); border-color: #10b981; }
    .ost-header { display: flex; align-items: center; justify-content: space-between; margin-bottom: 0.85rem; gap: 0.5rem; }
    .ost-amounts { display: flex; flex-direction: column; gap: 0.45rem; margin-bottom: 0.85rem; padding: 0.7rem; background: #f8f9fa; border-radius: 8px; }
    .ost-amt-row { display: flex; justify-content: space-between; align-items: center; }
    .ost-amt-row.highlight { padding-top: 0.4rem; border-top: 1px dashed #dee2e6; }
    .ost-lbl { font-size: 0.76rem; color: #6c757d; font-weight: 500; }
    .ost-val { font-size: 0.9rem; font-weight: 700; color: #212529; }
    .ost-footer { display: flex; align-items: center; justify-content: space-between; }
    .ost-actions { display: flex; gap: 0.4rem; }
    .ia-btn { font-size: 0.72rem; font-weight: 700; padding: 0.25rem 0.6rem; border-radius: 7px; border: 1px solid #dee2e6; background: #f8f9fa; color: #495057; cursor: pointer; display: inline-flex; align-items: center; gap: 0.3rem; transition: all .15s; }
    .ia-btn.ia-collect { background: #e6f9f4; border-color: #a7f3d0; color: #0d9488; }
    .ia-btn.ia-remind { background: #dbeafe; border-color: #93c5fd; color: #1d4ed8; }

    /* Reports */
    .reports-grid { display: grid; grid-template-columns: repeat(auto-fit, minmax(300px, 1fr)); gap: 1.2rem; padding: 1.2rem 1.4rem; }
    .report-section { background: #f8f9fa; border: 1px solid #dee2e6; border-radius: 10px; padding: 1rem; }
    .section-title { font-size: 0.82rem; font-weight: 700; color: #212529; margin: 0 0 0.8rem; }
    .report-table { display: flex; flex-direction: column; gap: 0; }
    .rt-row { display: grid; grid-template-columns: 2fr 1fr 1.2fr 1.2fr 1.2fr; gap: 0.5rem; padding: 0.5rem 0.3rem; border-bottom: 1px solid #f1f3f4; align-items: center; font-size: 0.81rem; }
    .rt-row:last-child { border-bottom: none; }
    .rt-row.header { font-size: 0.69rem; font-weight: 700; color: #adb5bd; text-transform: uppercase; letter-spacing: 0.05em; }

    /* Drawer */
    .drawer-overlay { position: fixed; inset: 0; background: rgba(0,0,0,.25); opacity: 0; pointer-events: none; transition: opacity .25s; z-index: 999; }
    .drawer-overlay.open { opacity: 1; pointer-events: all; }
    .drawer { position: fixed; top: 0; right: 0; bottom: 0; width: 400px; background: #fff; box-shadow: -4px 0 24px rgba(0,0,0,.12); transform: translateX(100%); transition: transform .3s cubic-bezier(.4,0,.2,1); z-index: 1000; display: flex; flex-direction: column; }
    .drawer.open { transform: translateX(0); }
    .drawer-inner { padding: 1.4rem; display: flex; flex-direction: column; gap: 1rem; overflow-y: auto; flex: 1; }
    .drawer-head { display: flex; align-items: flex-start; justify-content: space-between; }
    .drawer-title { margin: 0 0 0.35rem; font-size: 1.05rem; font-weight: 700; color: #212529; font-family: monospace; }
    .drawer-close { background: transparent; border: none; cursor: pointer; color: #6c757d; font-size: 1rem; padding: 0.2rem; }
    .drawer-patient { display: flex; align-items: center; gap: 0.8rem; padding: 0.8rem; background: #f8f9fa; border-radius: 10px; }

    /* Procedures in drawer */
    .proc-table { border: 1px solid #dee2e6; border-radius: 8px; overflow: hidden; }
    .proc-header { display: grid; grid-template-columns: 2fr 0.5fr 1fr 1fr; gap: 0.5rem; padding: 0.5rem 0.75rem; background: #f8f9fa; font-size: 0.69rem; font-weight: 700; color: #adb5bd; text-transform: uppercase; letter-spacing: 0.05em; }
    .proc-row { display: grid; grid-template-columns: 2fr 0.5fr 1fr 1fr; gap: 0.5rem; padding: 0.55rem 0.75rem; border-top: 1px solid #f1f3f4; font-size: 0.83rem; align-items: center; }

    /* Totals */
    .totals-block { background: #f8f9fa; border-radius: 8px; padding: 0.85rem 1rem; display: flex; flex-direction: column; gap: 0.4rem; }
    .total-row { display: flex; justify-content: space-between; font-size: 0.84rem; color: #495057; }
    .total-row.bold { font-weight: 700; color: #212529; padding-top: 0.35rem; border-top: 1px solid #dee2e6; }
    .total-row.red-row { border-top: 1px solid #fca5a5; }
    .discount-lbl { color: #dc2626; }

    /* Drawer actions */
    .drawer-actions { display: flex; gap: 0.5rem; }
    .dbtn { flex: 1; border: 1px solid #dee2e6; background: #fff; border-radius: 8px; padding: 0.52rem 0.5rem; font-size: 0.79rem; font-weight: 600; cursor: pointer; display: flex; align-items: center; justify-content: center; gap: 0.35rem; color: #495057; transition: all .15s; }
    .dbtn:hover { border-color: #10b981; color: #10b981; }
    .dbtn.primary { background: #10b981; color: #fff; border-color: #10b981; }
    .dbtn.primary:hover { background: #0d9488; }
    .dbtn.green { border-color: #10b981; color: #10b981; }
    .dbtn.green:hover { background: #f0fdf4; }

    /* Modals */
    .modal-overlay { position: fixed; inset: 0; background: rgba(0,0,0,.35); display: flex; align-items: center; justify-content: center; opacity: 0; pointer-events: none; transition: opacity .2s; z-index: 1100; }
    .modal-overlay.open { opacity: 1; pointer-events: all; }
    .modal { background: #fff; border-radius: 14px; padding: 2rem; width: 440px; max-width: 95vw; text-align: center; box-shadow: 0 20px 60px rgba(0,0,0,.18); }
    .modal-form { text-align: left; width: 560px; padding: 1.5rem; }
    .modal-wide { width: 720px; }
    .modal-head { display: flex; align-items: center; justify-content: space-between; margin-bottom: 1.2rem; }
    .modal-head h3 { margin: 0; font-size: 1.1rem; font-weight: 700; color: #212529; }
    .modal-icon { width: 50px; height: 50px; border-radius: 50%; margin: 0 auto 1rem; display: flex; align-items: center; justify-content: center; font-size: 1.3rem; }
    .modal-icon.warn { background: #fff8e6; color: #b45309; }
    .modal-title { margin: 0 0 0.5rem; font-size: 1.1rem; font-weight: 700; color: #212529; }
    .modal-body { font-size: 0.86rem; color: #6c757d; margin: 0 0 1.4rem; line-height: 1.6; }
    .modal-body strong { color: #212529; }
    .modal-actions { display: flex; gap: 0.55rem; justify-content: flex-end; border-top: 1px solid #f1f3f4; padding-top: 1rem; margin-top: 0.5rem; }
    .mbtn { border-radius: 8px; padding: 0.52rem 1.1rem; font-size: 0.84rem; font-weight: 600; cursor: pointer; border: none; transition: all .15s; display: inline-flex; align-items: center; gap: 0.35rem; }
    .mbtn.ghost { background: #f8f9fa; color: #6c757d; border: 1px solid #dee2e6; }
    .mbtn.ghost:hover { border-color: #adb5bd; }
    .mbtn.danger { background: #ef4444; color: #fff; }
    .mbtn.danger:hover { background: #dc2626; }
    .mbtn.primary { background: #10b981; color: #fff; }
    .mbtn.primary:hover { background: #0d9488; }
    .mbtn.teal { background: #0d9488; color: #fff; }
    .mbtn.teal:hover { background: #0f766e; }
    .form-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 0.8rem; margin-bottom: 0.8rem; }
    .fg { display: flex; flex-direction: column; gap: 0.3rem; }
    .fg-full { grid-column: 1 / -1; }
    .fg label { font-size: 0.73rem; font-weight: 600; color: #6c757d; }
    .fg input, .fg select { background: #f8f9fa; border: 1px solid #dee2e6; border-radius: 8px; padding: 0.48rem 0.7rem; font-size: 0.84rem; color: #212529; outline: none; width: 100%; box-sizing: border-box; transition: border-color .15s; }
    .fg input:focus, .fg select:focus { border-color: #10b981; background: #fff; }

    /* Payment summary */
    .payment-summary { background: #f8f9fa; border-radius: 8px; padding: 0.8rem 1rem; margin-bottom: 1rem; display: flex; flex-direction: column; gap: 0.4rem; }
    .ps-row { display: flex; justify-content: space-between; font-size: 0.84rem; color: #6c757d; }
    .ps-row strong { color: #212529; }
    .ps-row strong.red { color: #dc2626; }

    /* Procedure builder */
    .proc-builder { border: 1px solid #dee2e6; border-radius: 8px; overflow: hidden; margin-bottom: 0.8rem; }
    .proc-builder-header { display: flex; justify-content: space-between; align-items: center; padding: 0.65rem 0.85rem; background: #f8f9fa; border-bottom: 1px solid #dee2e6; }
    .proc-builder-row { display: grid; grid-template-columns: 3fr 0.7fr 1.2fr 1fr 32px; gap: 0.5rem; padding: 0.5rem 0.85rem; border-bottom: 1px solid #f1f3f4; align-items: center; }
    .proc-builder-row:last-child { border-bottom: none; }
    .proc-builder-row.header-row { font-size: 0.68rem; font-weight: 700; color: #adb5bd; text-transform: uppercase; letter-spacing: 0.05em; background: #fff; }
    .proc-builder-row input { background: #f8f9fa; border: 1px solid #dee2e6; border-radius: 6px; padding: 0.35rem 0.55rem; font-size: 0.82rem; color: #212529; outline: none; width: 100%; box-sizing: border-box; transition: border-color .15s; }
    .proc-builder-row input:focus { border-color: #10b981; background: #fff; }
    .icon-remove { background: transparent; border: none; color: #adb5bd; cursor: pointer; font-size: 0.75rem; padding: 0; }
    .icon-remove:hover { color: #ef4444; }

    /* Invoice totals in modal */
    .invoice-totals { display: flex; flex-direction: column; gap: 0.4rem; padding: 0.85rem 1rem; background: #f8f9fa; border-radius: 8px; margin-bottom: 0.5rem; }
    .it-row { display: flex; justify-content: space-between; align-items: center; font-size: 0.84rem; color: #495057; }
    .it-row.bold { font-weight: 700; color: #212529; padding-top: 0.4rem; border-top: 1px solid #dee2e6; }
    .small-input { width: 120px !important; text-align: right; }

    @media (max-width: 900px) {
      .billing-page { padding: 1rem; }
      .kpi-strip { grid-template-columns: 1fr 1fr; }
      .toolbar { flex-direction: column; align-items: stretch; }
      .modal-form.modal-wide { width: 95vw; }
      .form-grid { grid-template-columns: 1fr; }
    }
  `]
})
export class BillingPage implements OnInit {

  // ─── UI State ────────────────────────────────────────────
  activeTab: BillingTab = 'invoices';
  activeQuick: QuickFilter = 'month';
  search = '';
  searchFocused = false;
  dateFrom = '';
  dateTo = '';
  filterDoctor = '';
  filterStatus = '';
  filterMethod = '';
  sortField: SortField = 'invoiceDate';
  sortDir: 'asc' | 'desc' = 'desc';
  currentPage = 1;
  pageSize = 10;
  drawerOpen = false;
  drawerInvoice: InvoiceRow | null = null;
  newInvoiceModal = false;
  cancelModal: { open: boolean; invoice: InvoiceRow | null } = { open: false, invoice: null };
  paymentModal: { open: boolean; invoice: InvoiceRow | null } = { open: false, invoice: null };

  paymentForm = { amount: 0, method: '' as PaymentMethod | '', reference: '', notes: '' };

  newInv = {
    patientName: '', phone: '', doctorName: '', invoiceDate: new Date().toISOString().split('T')[0],
    procedures: [] as ProcedureItem[], discount: 0, tax: 0,
  };

  // ─── Reference Data ──────────────────────────────────────
  doctors = ['Dr. Arjun', 'Dr. Rajan', 'Dr. Kapoor', 'Dr. Mehta'];
  paymentMethods: PaymentMethod[] = ['Cash', 'UPI', 'Card', 'Insurance', 'EMI', 'Cheque'];
  tabs = [
    { label: 'Invoices', val: 'invoices' as BillingTab, badge: '' },
    { label: 'Payments', val: 'payments' as BillingTab, badge: '' },
    { label: 'Outstanding', val: 'outstanding' as BillingTab, badge: '' },
    { label: 'Reports', val: 'reports' as BillingTab, badge: '' },
  ];
  quickFilters = [
    { label: 'Today', val: 'today' as QuickFilter },
    { label: 'This Week', val: 'week' as QuickFilter },
    { label: 'This Month', val: 'month' as QuickFilter },
  ];
  statusChips = [
    { label: 'Paid', val: 'Paid', cls: 'paid' },
    { label: 'Partial', val: 'Partial', cls: 'partial' },
    { label: 'Unpaid', val: 'Unpaid', cls: 'unpaid' },
    { label: 'Overdue', val: 'Overdue', cls: 'overdue' },
    { label: 'Cancelled', val: 'Cancelled', cls: 'cancelled' },
  ];

  // ─── Invoice Data ────────────────────────────────────────
  rows: InvoiceRow[] = [
    {
      id: 1, invoiceNo: 'INV-0001', invoiceDate: new Date().toISOString(),
      patientName: 'Dheeraj T', patientId: 'C66E4', phone: '9539192684',
      doctorName: 'Dr. Arjun',
      procedures: [{ name: 'Root Canal Treatment', qty: 1, rate: 8000, amount: 8000 }, { name: 'X-Ray', qty: 2, rate: 300, amount: 600 }],
      subtotal: 8600, discount: 200, tax: 0, totalAmount: 8400, paidAmount: 0, dueAmount: 8400, status: 'Overdue',
      dueDate: '2025-11-01',
    },
    {
      id: 2, invoiceNo: 'INV-0002', invoiceDate: new Date().toISOString(),
      patientName: 'Anita Sharma', patientId: 'A12B3', phone: '9876543210',
      doctorName: 'Dr. Rajan',
      procedures: [{ name: 'Scaling & Polishing', qty: 1, rate: 1500, amount: 1500 }],
      subtotal: 1500, discount: 0, tax: 0, totalAmount: 1500, paidAmount: 1500, dueAmount: 0,
      paymentMethod: 'UPI', status: 'Paid',
    },
    {
      id: 3, invoiceNo: 'INV-0003', invoiceDate: new Date(Date.now() - 86400000 * 2).toISOString(),
      patientName: 'Rizwan Ali', patientId: 'R55Z9', phone: '8765432109',
      doctorName: 'Dr. Kapoor',
      procedures: [{ name: 'Crown Fitting', qty: 1, rate: 12000, amount: 12000 }, { name: 'Consultation', qty: 1, rate: 500, amount: 500 }],
      subtotal: 12500, discount: 500, tax: 0, totalAmount: 12000, paidAmount: 6000, dueAmount: 6000,
      paymentMethod: 'Cash', status: 'Partial',
    },
    {
      id: 4, invoiceNo: 'INV-0004', invoiceDate: new Date(Date.now() - 86400000 * 3).toISOString(),
      patientName: 'Eva', patientId: '84F4A', phone: '9995960143',
      doctorName: 'Dr. Arjun',
      procedures: [{ name: 'Broken Filling Repair', qty: 1, rate: 2200, amount: 2200 }],
      subtotal: 2200, discount: 0, tax: 0, totalAmount: 2200, paidAmount: 2200, dueAmount: 0,
      paymentMethod: 'Cash', status: 'Paid',
    },
    {
      id: 5, invoiceNo: 'INV-0005', invoiceDate: new Date(Date.now() - 86400000 * 5).toISOString(),
      patientName: 'Leena Patel', patientId: 'L77P2', phone: '7654321098',
      doctorName: 'Dr. Rajan',
      procedures: [{ name: 'Orthodontic Consultation', qty: 1, rate: 800, amount: 800 }, { name: 'Braces Fitting', qty: 1, rate: 25000, amount: 25000 }],
      subtotal: 25800, discount: 800, tax: 0, totalAmount: 25000, paidAmount: 10000, dueAmount: 15000,
      paymentMethod: 'EMI', status: 'Partial', insuranceClaim: 'HDFC-2025-009',
    },
    {
      id: 6, invoiceNo: 'INV-0006', invoiceDate: new Date(Date.now() - 86400000 * 7).toISOString(),
      patientName: 'Karan Joshi', patientId: 'K33J8', phone: '6543210987',
      doctorName: 'Dr. Mehta',
      procedures: [{ name: 'Tooth Extraction', qty: 1, rate: 1200, amount: 1200 }],
      subtotal: 1200, discount: 0, tax: 0, totalAmount: 1200, paidAmount: 0, dueAmount: 1200,
      status: 'Unpaid',
    },
  ];

  // Payments log
  paymentRecords: PaymentRecord[] = [
    { id: 1, invoiceNo: 'INV-0002', patientName: 'Anita Sharma', date: new Date().toISOString(), amount: 1500, method: 'UPI', reference: 'UPI-83920', receivedBy: 'Reception' },
    { id: 2, invoiceNo: 'INV-0003', patientName: 'Rizwan Ali', date: new Date(Date.now() - 86400000 * 2).toISOString(), amount: 6000, method: 'Cash', receivedBy: 'Reception' },
    { id: 3, invoiceNo: 'INV-0005', patientName: 'Leena Patel', date: new Date(Date.now() - 86400000 * 5).toISOString(), amount: 10000, method: 'EMI', reference: 'EMI-01-2025', receivedBy: 'Admin' },
    { id: 4, invoiceNo: 'INV-0004', patientName: 'Eva', date: new Date(Date.now() - 86400000 * 3).toISOString(), amount: 2200, method: 'Cash', receivedBy: 'Reception' },
  ];

  filteredRows: InvoiceRow[] = [];
  pagedRows: InvoiceRow[] = [];

  // ─── Computed getters ────────────────────────────────────
  get dueAmount() { return (row: InvoiceRow) => row.totalAmount - row.paidAmount; }

  get kpiCards() {
    const totalRevenue = this.rows.reduce((s, r) => s + r.totalAmount, 0);
    const collected = this.rows.reduce((s, r) => s + r.paidAmount, 0);
    const outstanding = this.rows.reduce((s, r) => s + (r.totalAmount - r.paidAmount), 0);
    const overdue = this.rows.filter(r => r.status === 'Overdue').reduce((s, r) => s + (r.totalAmount - r.paidAmount), 0);
    const todayCollected = this.paymentRecords.filter(p => this.isSameDay(new Date(p.date), new Date())).reduce((s, p) => s + p.amount, 0);
    const pendingInvoices = this.rows.filter(r => r.status === 'Unpaid' || r.status === 'Partial').length;
    return [
      { label: 'Total Revenue', value: totalRevenue, prefix: '₹', icon: '💰', bg: '#e6f9f4', color: '#0d9488', sub: 'All time' },
      { label: 'Collected', value: collected, prefix: '₹', icon: '✅', bg: '#dcfce7', color: '#15803d', sub: null },
      { label: 'Outstanding', value: outstanding, prefix: '₹', icon: '⏳', bg: '#fff8e6', color: '#b45309', filter: 'Unpaid', sub: `${pendingInvoices} invoices` },
      { label: 'Overdue', value: overdue, prefix: '₹', icon: '⚠', bg: '#fff5f5', color: '#dc2626', filter: 'Overdue', sub: null },
      { label: "Today's Collection", value: todayCollected, prefix: '₹', icon: '📅', bg: '#dbeafe', color: '#1d4ed8', sub: 'Cash + UPI + Card' },
    ];
  }

  get filteredTotal() { return this.filteredRows.reduce((s, r) => s + r.totalAmount, 0); }
  get filteredPaid() { return this.filteredRows.reduce((s, r) => s + r.paidAmount, 0); }
  get filteredDue() { return this.filteredRows.reduce((s, r) => s + (r.totalAmount - r.paidAmount), 0); }
  get filteredAvg() { return this.filteredRows.length ? this.filteredTotal / this.filteredRows.length : 0; }

  get overdueRows() { return this.rows.filter(r => r.status === 'Overdue' || r.status === 'Partial' || r.status === 'Unpaid'); }

  get revenueByDoctor() {
    return this.doctors.map(d => {
      const inv = this.rows.filter(r => r.doctorName === d);
      return { doctor: d, count: inv.length, total: inv.reduce((s, r) => s + r.totalAmount, 0), paid: inv.reduce((s, r) => s + r.paidAmount, 0), due: inv.reduce((s, r) => s + (r.totalAmount - r.paidAmount), 0) };
    }).filter(d => d.count > 0);
  }

  get revenueByMethod() {
    return this.paymentMethods.map(m => {
      const recs = this.paymentRecords.filter(p => p.method === m);
      return { method: m, count: recs.length, amount: recs.reduce((s, p) => s + p.amount, 0) };
    }).filter(m => m.count > 0);
  }

  get topProcedures() {
    const map = new Map<string, { count: number; revenue: number }>();
    this.rows.forEach(r => r.procedures.forEach(p => {
      const existing = map.get(p.name) || { count: 0, revenue: 0 };
      map.set(p.name, { count: existing.count + p.qty, revenue: existing.revenue + p.amount });
    }));
    return Array.from(map.entries()).map(([name, v]) => ({ name, ...v })).sort((a, b) => b.revenue - a.revenue).slice(0, 8);
  }

  get totalPages() { return Math.max(1, Math.ceil(this.filteredRows.length / this.pageSize)); }
  get pageStart() { return (this.currentPage - 1) * this.pageSize; }
  get pageEnd() { return Math.min(this.pageStart + this.pageSize, this.filteredRows.length); }
  get allSelected() { return this.pagedRows.length > 0 && this.pagedRows.every(r => r.selected); }
  get selectedCount() { return this.rows.filter(r => r.selected).length; }
  get visiblePages(): number[] {
    const pages: number[] = [];
    const start = Math.max(1, this.currentPage - 2);
    const end = Math.min(this.totalPages, this.currentPage + 2);
    for (let i = start; i <= end; i++) pages.push(i);
    return pages;
  }
  get newInvSubtotal() { return this.newInv.procedures.reduce((s, p) => s + p.amount, 0); }
  get newInvTotal() { return this.newInvSubtotal - (this.newInv.discount || 0) + (this.newInv.tax || 0); }

  // ─── Lifecycle ───────────────────────────────────────────
  ngOnInit() {
    // Compute due amounts
    this.rows = this.rows.map(r => ({ ...r, dueAmount: r.totalAmount - r.paidAmount }));
    this.applyFilters();
    this.updateTabBadges();
  }

  // ─── Tab ─────────────────────────────────────────────────
  setTab(t: BillingTab) { this.activeTab = t; }

  updateTabBadges() {
    this.tabs[2].badge = this.overdueRows.length.toString();
    this.tabs[1].badge = this.paymentRecords.filter(p => this.isSameDay(new Date(p.date), new Date())).length.toString();
  }

  // ─── Filters ─────────────────────────────────────────────
  setQuick(q: QuickFilter) { this.activeQuick = q; this.dateFrom = ''; this.dateTo = ''; this.applyFilters(); }
  clearSearch() { this.search = ''; this.applyFilters(); }

  toggleStatusChip(val: string) { this.filterStatus = this.filterStatus === val ? '' : val; this.applyFilters(); }
  setStatusFilter(val: string) { this.filterStatus = val; this.activeTab = 'invoices'; this.applyFilters(); }
  countByStatus(val: string) { return this.rows.filter(r => r.status === val).length; }

  applyFilters() {
    const q = this.search.toLowerCase().trim();
    const now = new Date();
    let result = this.rows.map(r => ({ ...r, dueAmount: r.totalAmount - r.paidAmount })).filter(row => {
      const d = new Date(row.invoiceDate);
      let datePass = true;
      if (!this.dateFrom && !this.dateTo) {
        if (this.activeQuick === 'today') datePass = this.isSameDay(d, now);
        else if (this.activeQuick === 'week') { const s = new Date(now); s.setDate(now.getDate()-6); datePass = d >= s; }
        else if (this.activeQuick === 'month') datePass = d.getFullYear() === now.getFullYear() && d.getMonth() === now.getMonth();
      } else {
        if (this.dateFrom) datePass = d >= new Date(this.dateFrom);
        if (this.dateTo) datePass = datePass && d <= new Date(this.dateTo + 'T23:59:59');
      }
      const matchQ = !q || row.patientName.toLowerCase().includes(q) || row.invoiceNo.toLowerCase().includes(q) || row.phone.includes(q) || row.doctorName.toLowerCase().includes(q);
      const matchStatus = !this.filterStatus || row.status === this.filterStatus;
      const matchDoctor = !this.filterDoctor || row.doctorName === this.filterDoctor;
      const matchMethod = !this.filterMethod || row.paymentMethod === this.filterMethod;
      return datePass && matchQ && matchStatus && matchDoctor && matchMethod;
    });

    if (this.sortField) {
      result = result.slice().sort((a, b) => {
        const va = (a as any)[this.sortField];
        const vb = (b as any)[this.sortField];
        return this.sortDir === 'asc' ? (va > vb ? 1 : -1) : (va < vb ? 1 : -1);
      });
    }
    this.filteredRows = result;
    this.currentPage = 1;
    this.updatePage();
  }

  sort(field: SortField) {
    if (this.sortField === field) this.sortDir = this.sortDir === 'asc' ? 'desc' : 'asc';
    else { this.sortField = field; this.sortDir = 'asc'; }
    this.applyFilters();
  }
  sortIcon(f: SortField) { return this.sortField !== f ? 'pi-sort-alt' : this.sortDir === 'asc' ? 'pi-sort-amount-up' : 'pi-sort-amount-down'; }
  updatePage() { this.pagedRows = this.filteredRows.slice(this.pageStart, this.pageEnd); }
  goPage(p: number) { if (p < 1 || p > this.totalPages) return; this.currentPage = p; this.updatePage(); }
  onPageSizeChange() { this.currentPage = 1; this.updatePage(); }

  // ─── Selection ───────────────────────────────────────────
  toggleSelectAll(e: Event) { const c = (e.target as HTMLInputElement).checked; this.pagedRows.forEach(r => r.selected = c); }
  onRowSelect() {}
  clearSelection() { this.rows.forEach(r => r.selected = false); }

  // ─── Drawer ──────────────────────────────────────────────
  openDrawer(row: InvoiceRow) { this.drawerInvoice = { ...row, dueAmount: row.totalAmount - row.paidAmount }; this.drawerOpen = true; }
  closeDrawer() { this.drawerOpen = false; }

  // ─── Payment Modal ───────────────────────────────────────
  openPayment(row: InvoiceRow) {
    this.paymentModal = { open: true, invoice: { ...row, dueAmount: row.totalAmount - row.paidAmount } };
    this.paymentForm = { amount: row.totalAmount - row.paidAmount, method: '', reference: '', notes: '' };
    this.drawerOpen = false;
  }
  closePaymentModal() { this.paymentModal = { open: false, invoice: null }; }

  collectPayment() {
    if (!this.paymentModal.invoice || !this.paymentForm.amount || !this.paymentForm.method) return;
    const inv = this.rows.find(r => r.id === this.paymentModal.invoice!.id);
    if (inv) {
      inv.paidAmount = Math.min(inv.paidAmount + this.paymentForm.amount, inv.totalAmount);
      inv.paymentMethod = this.paymentForm.method as PaymentMethod;
      inv.status = inv.paidAmount >= inv.totalAmount ? 'Paid' : 'Partial';
      const rec: PaymentRecord = {
        id: this.paymentRecords.length + 1,
        invoiceNo: inv.invoiceNo, patientName: inv.patientName,
        date: new Date().toISOString(), amount: this.paymentForm.amount,
        method: this.paymentForm.method as PaymentMethod,
        reference: this.paymentForm.reference, receivedBy: 'Reception',
      };
      this.paymentRecords = [rec, ...this.paymentRecords];
    }
    this.closePaymentModal();
    this.applyFilters();
    this.updateTabBadges();
  }
  collectAndSendReceipt() { this.collectPayment(); console.log('Send receipt via SMS/WhatsApp'); }

  // ─── Cancel ──────────────────────────────────────────────
  confirmCancel(row: InvoiceRow) { this.cancelModal = { open: true, invoice: row }; }
  closeCancelModal() { this.cancelModal = { open: false, invoice: null }; }
  executeCancel() {
    if (this.cancelModal.invoice) { const inv = this.rows.find(r => r.id === this.cancelModal.invoice!.id); if (inv) inv.status = 'Cancelled'; }
    this.closeCancelModal(); this.applyFilters();
  }

  // ─── New Invoice ─────────────────────────────────────────
  openNewInvoice() {
    this.newInv = { patientName: '', phone: '', doctorName: '', invoiceDate: new Date().toISOString().split('T')[0], procedures: [{ name: '', qty: 1, rate: 0, amount: 0 }], discount: 0, tax: 0 };
    this.newInvoiceModal = true;
  }

  addProcedure() { this.newInv.procedures.push({ name: '', qty: 1, rate: 0, amount: 0 }); }
  removeProcedure(i: number) { this.newInv.procedures.splice(i, 1); }
  recalcProcedure(i: number) { const p = this.newInv.procedures[i]; p.amount = (p.qty || 0) * (p.rate || 0); }

  saveInvoice() {
    if (!this.newInv.patientName || !this.newInv.doctorName) return;
    const nextId = Math.max(...this.rows.map(r => r.id), 0) + 1;
    const total = this.newInvTotal;
    const newRow: InvoiceRow = {
      id: nextId, invoiceNo: `INV-${nextId.toString().padStart(4, '0')}`,
      invoiceDate: new Date().toISOString(),
      patientName: this.newInv.patientName, patientId: '', phone: this.newInv.phone,
      doctorName: this.newInv.doctorName,
      procedures: this.newInv.procedures.filter(p => p.name),
      subtotal: this.newInvSubtotal, discount: this.newInv.discount, tax: this.newInv.tax,
      totalAmount: total, paidAmount: 0, dueAmount: total, status: 'Unpaid',
    };
    this.rows = [newRow, ...this.rows];
    this.newInvoiceModal = false;
    this.applyFilters();
    this.updateTabBadges();
  }

  saveAndCollect() {
    this.saveInvoice();
    const newRow = this.rows[0];
    if (newRow) setTimeout(() => this.openPayment(newRow), 100);
  }

  // ─── Bulk ────────────────────────────────────────────────
  bulkPrint() { console.log('Bulk print', this.selectedCount); }
  bulkExport() { console.log('Bulk export', this.selectedCount); }
  bulkSendReminder() { console.log('Bulk reminder', this.selectedCount); }
  bulkCancel() { this.rows.filter(r => r.selected).forEach(r => r.status = 'Cancelled'); this.clearSelection(); this.applyFilters(); }
  exportCSV() { console.log('Export CSV'); }
  printReport() { window.print(); }
  printInvoice(row: InvoiceRow) { console.log('Print invoice', row.invoiceNo); }
  sendReminder(row: InvoiceRow) { console.log('Send reminder to', row.patientName); }
  sendWhatsApp(phone: string) { window.open(`https://wa.me/91${phone}`, '_blank'); }

  // ─── Utils ───────────────────────────────────────────────
  formatDate(iso: string) { return new Date(iso).toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: '2-digit' }); }
  drInitials(name: string) { return name.replace('Dr. ', '').split(' ').map((n: string) => n[0]).join('').toUpperCase().slice(0, 2); }

  private isSameDay(a: Date, b: Date) {
    return a.getFullYear() === b.getFullYear() && a.getMonth() === b.getMonth() && a.getDate() === b.getDate();
  }
}

