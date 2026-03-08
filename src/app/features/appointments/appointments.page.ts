import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

// ─── Interfaces ──────────────────────────────────────────────────────────────

export interface NewAppointmentPayload {
  patientName: string;
  mobileNumber: string;
  appointmentDate: string;
  hour: string;
  minute: string;
  meridiem: 'AM' | 'PM';
  doctor: string;
  complaint: string;
  durationMinutes: number;
  age?: number;
}

type AppStatus = 'Pending' | 'Confirmed' | 'Checked-In' | 'Completed' | 'Cancelled' | 'No-Show';
type AppTab = 'appointment' | 'check-in' | 'recall' | 'calendar';
type QuickFilter = 'today' | 'yesterday' | 'week' | 'month';
type SortField = 'dateTimeIso' | 'patient' | 'token' | 'doctorName' | 'status' | '';

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
  status: AppStatus;
  arrivalTime?: string;
  room?: string;
  type?: string;
}

// ─── Component ───────────────────────────────────────────────────────────────

@Component({
  selector: 'app-appointments-page',
  standalone: true,
  imports: [CommonModule, FormsModule],
  template: `
<div class="appt-page">

  <!-- ── KPI Strip ─────────────────────────────────────────── -->
  <div class="kpi-strip">
    <div class="kpi-card" *ngFor="let k of kpiCards">
      <div class="kpi-ico" [style.background]="k.bg" [style.color]="k.color">{{ k.icon }}</div>
      <div>
        <div class="kpi-val">{{ k.value }}</div>
        <div class="kpi-lbl">{{ k.label }}</div>
      </div>
    </div>
  </div>

  <!-- ── Main Card ─────────────────────────────────────────── -->
  <div class="main-card">

    <!-- Card Top Bar -->
    <div class="card-topbar">
      <!-- Tabs -->
      <div class="tabs-wrap">
        <button
          class="tab-btn"
          *ngFor="let t of tabs"
          [class.active]="activeTab === t.val"
          (click)="setTab(t.val)">
          {{ t.label }}
          <span class="tab-badge" *ngIf="t.badge">{{ t.badge }}</span>
        </button>
      </div>

      <!-- New Appointment -->
      <button class="btn-primary" (click)="openNewModal()">
        <i class="pi pi-plus"></i> New Appointment
      </button>
    </div>

    <!-- Toolbar -->
    <div class="toolbar">

      <!-- Search -->
      <div class="search-box" [class.focused]="searchFocused">
        <i class="pi pi-search search-ico"></i>
        <input
          class="search-input"
          [(ngModel)]="search"
          placeholder="Search by patient, phone, token…"
          (ngModelChange)="applyFilters()"
          (focus)="searchFocused=true"
          (blur)="searchFocused=false" />
        <button *ngIf="search" class="clear-btn pi pi-times" (click)="clearSearch()"></button>
      </div>

      <!-- Date range -->
      <div class="date-range-box">
        <i class="pi pi-calendar" style="color:#adb5bd;font-size:.85rem"></i>
        <input
          class="date-input"
          type="date"
          [(ngModel)]="dateFrom"
          (change)="applyFilters()" />
        <span style="color:#adb5bd;font-size:.8rem">→</span>
        <input
          class="date-input"
          type="date"
          [(ngModel)]="dateTo"
          (change)="applyFilters()" />
      </div>

      <!-- Quick filters -->
      <div class="quick-filters">
        <button
          class="qf-btn"
          *ngFor="let qf of quickFilters"
          [class.active]="activeQuick === qf.val"
          (click)="setQuick(qf.val)">
          {{ qf.label }}
        </button>
      </div>

      <!-- Doctor filter -->
      <select class="filter-select" [(ngModel)]="filterDoctor" (change)="applyFilters()">
        <option value="">All Doctors</option>
        <option *ngFor="let d of doctors" [value]="d">{{ d }}</option>
      </select>

      <!-- Status filter -->
      <select class="filter-select" [(ngModel)]="filterStatus" (change)="applyFilters()">
        <option value="">All Statuses</option>
        <option *ngFor="let s of allStatuses" [value]="s">{{ s }}</option>
      </select>
    </div>

    <!-- Status Filter Chips -->
    <div class="status-chips">
      <button
        class="sch-chip"
        *ngFor="let s of statusChips"
        [class.active]="filterStatus === s.val"
        [class]="'sch-chip ' + s.cls + (filterStatus === s.val ? ' active' : '')"
        (click)="toggleStatusChip(s.val)">
        <span class="sch-dot"></span> {{ s.label }}
        <span class="sch-count">{{ countByStatus(s.val) }}</span>
      </button>
    </div>

    <!-- Table -->
    <div class="table-scroll">
      <table class="at">
        <thead>
          <tr>
            <th class="col-no">No.</th>
            <th class="col-dt sortable" (click)="sort('dateTimeIso')">
              Date / Time <i class="pi" [class]="sortIcon('dateTimeIso')"></i>
            </th>
            <th class="col-token sortable" (click)="sort('token')">
              Token <i class="pi" [class]="sortIcon('token')"></i>
            </th>
            <th class="col-patient sortable" (click)="sort('patient')">
              Patient <i class="pi" [class]="sortIcon('patient')"></i>
            </th>
            <th class="col-doctor sortable" (click)="sort('doctorName')">
              Doctor <i class="pi" [class]="sortIcon('doctorName')"></i>
            </th>
            <th class="col-type">Type / Duration</th>
            <th class="col-complaints">Complaints</th>
            <th class="col-status sortable" (click)="sort('status')">
              Status <i class="pi" [class]="sortIcon('status')"></i>
            </th>
            <th class="col-inline">Quick Actions</th>
            <th class="col-action">Actions</th>
          </tr>
        </thead>
        <tbody>
          <tr
            class="at-row"
            *ngFor="let row of pagedRows"
            [class]="'at-row status-row-' + row.status.toLowerCase().replace(' ', '-')"
            (click)="openDrawer(row)">

            <!-- No -->
            <td class="col-no muted">{{ row.no }}</td>

            <!-- Date/Time -->
            <td class="col-dt">
              <div class="dt-stack">
                <span class="dt-time">{{ formatTime(row.dateTimeIso) }}</span>
                <span class="dt-date">{{ formatDate(row.dateTimeIso) }}</span>
              </div>
            </td>

            <!-- Token -->
            <td class="col-token">
              <span class="token-chip">{{ row.token }}</span>
            </td>

            <!-- Patient -->
            <td class="col-patient">
              <div class="patient-cell">
                <div class="pt-av" [class]="row.gender === 'Female' ? 'female' : 'male'">
                  {{ row.patient[0] }}
                </div>
                <div class="pt-info">
                  <span class="pt-name">{{ row.patient }}</span>
                  <span class="pt-phone">{{ row.phone }}</span>
                </div>
              </div>
            </td>

            <!-- Doctor -->
            <td class="col-doctor">
              <div class="doctor-cell">
                <div class="dr-av">{{ drInitials(row.doctorName) }}</div>
                <span class="dr-name">{{ row.doctorName }}</span>
              </div>
            </td>

            <!-- Type / Duration -->
            <td class="col-type">
              <div class="type-stack">
                <span class="type-label" *ngIf="row.type">{{ row.type }}</span>
                <span class="dur-chip">{{ row.durationMinutes }} min</span>
              </div>
            </td>

            <!-- Complaints -->
            <td class="col-complaints">
              <span class="complaint-txt" [title]="row.complaints">{{ row.complaints }}</span>
            </td>

            <!-- Status -->
            <td class="col-status" (click)="$event.stopPropagation()">
              <span class="status-badge" [class]="'status-badge sb-' + row.status.toLowerCase().replace(' ', '-')">
                {{ row.status }}
              </span>
            </td>

            <!-- Inline Quick Actions -->
            <td class="col-inline" (click)="$event.stopPropagation()">
              <div class="inline-actions">
                <button
                  *ngFor="let a of getInlineActions(row)"
                  class="ia-btn"
                  [class]="'ia-btn ' + a.cls"
                  [title]="a.label"
                  (click)="a.action(row)">
                  {{ a.label }}
                </button>
              </div>
            </td>

            <!-- Row Actions -->
            <td class="col-action" (click)="$event.stopPropagation()">
              <div class="row-actions">
                <button class="act-btn" title="View" (click)="onView(row)">
                  <i class="pi pi-eye"></i>
                </button>
                <button class="act-btn" title="Edit" (click)="onEdit(row)">
                  <i class="pi pi-pencil"></i>
                </button>
                <button class="act-btn warn" title="Cancel" (click)="confirmCancel(row)">
                  <i class="pi pi-ban"></i>
                </button>
              </div>
            </td>
          </tr>

          <tr *ngIf="pagedRows.length === 0">
            <td colspan="10" class="empty-state">
              <div class="empty-inner">
                <i class="pi pi-calendar empty-ico"></i>
                <p>No appointments found</p>
                <span>Try changing your date range or filters</span>
                <button class="btn-primary small" (click)="openNewModal()">
                  <i class="pi pi-plus"></i> Create Appointment
                </button>
              </div>
            </td>
          </tr>
        </tbody>
      </table>
    </div>

    <!-- Pagination -->
    <div class="pagination-bar">
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
        <button class="pg-btn" [disabled]="currentPage === 1" (click)="goPage(currentPage - 1)">
          <i class="pi pi-angle-left"></i>
        </button>
        <button
          class="pg-num"
          *ngFor="let p of visiblePages"
          [class.active]="p === currentPage"
          (click)="goPage(p)">{{ p }}</button>
        <button class="pg-btn" [disabled]="currentPage === totalPages" (click)="goPage(currentPage + 1)">
          <i class="pi pi-angle-right"></i>
        </button>
      </div>
    </div>

  </div><!-- /main-card -->
</div><!-- /appt-page -->

<!-- ── Appointment Detail Drawer ──────────────────────────────────────── -->
<div class="drawer-overlay" [class.open]="drawerOpen" (click)="closeDrawer()"></div>
<div class="drawer" [class.open]="drawerOpen">
  <div class="drawer-inner" *ngIf="drawerRow">

    <div class="drawer-head">
      <div>
        <h3 class="drawer-title">Appointment #{{ drawerRow.no }}</h3>
        <span class="status-badge" [class]="'status-badge sb-' + drawerRow.status.toLowerCase().replace(' ', '-')">
          {{ drawerRow.status }}
        </span>
      </div>
      <button class="drawer-close pi pi-times" (click)="closeDrawer()"></button>
    </div>

    <!-- Status Timeline -->
    <div class="timeline-strip">
      <div class="tl-step" *ngFor="let step of statusTimeline" [class.done]="isStatusDone(step)" [class.current]="drawerRow.status === step">
        <div class="tl-dot"></div>
        <span class="tl-lbl">{{ step }}</span>
      </div>
    </div>

    <div class="drawer-body">
      <div class="detail-section">
        <div class="detail-label">Patient</div>
        <div class="detail-val bold">{{ drawerRow.patient }}</div>
        <div class="detail-val muted">{{ drawerRow.phone }} · {{ drawerRow.gender }}, {{ drawerRow.age > 0 ? drawerRow.age + ' yrs' : '—' }}</div>
      </div>
      <div class="detail-section">
        <div class="detail-label">Date & Time</div>
        <div class="detail-val bold">{{ formatDate(drawerRow.dateTimeIso) }} at {{ formatTime(drawerRow.dateTimeIso) }}</div>
      </div>
      <div class="detail-section">
        <div class="detail-label">Doctor</div>
        <div class="detail-val bold">{{ drawerRow.doctorName }}</div>
      </div>
      <div class="detail-section">
        <div class="detail-label">Token</div>
        <div class="detail-val"><span class="token-chip">{{ drawerRow.token }}</span></div>
      </div>
      <div class="detail-section">
        <div class="detail-label">Duration</div>
        <div class="detail-val">{{ drawerRow.durationMinutes }} minutes</div>
      </div>
      <div class="detail-section" *ngIf="drawerRow.room">
        <div class="detail-label">Room / Chair</div>
        <div class="detail-val bold">{{ drawerRow.room }}</div>
      </div>
      <div class="detail-section">
        <div class="detail-label">Chief Complaint</div>
        <div class="detail-val">{{ drawerRow.complaints }}</div>
      </div>
    </div>

    <div class="drawer-actions">
      <button class="dbtn primary" (click)="startVisit(drawerRow)"><i class="pi pi-play"></i> Start Visit</button>
      <button class="dbtn" (click)="openPatientProfile(drawerRow)"><i class="pi pi-user"></i> Profile</button>
      <button class="dbtn green" (click)="sendWhatsApp(drawerRow.phone)"><i class="pi pi-comments"></i> WhatsApp</button>
    </div>

    <!-- Status change buttons -->
    <div class="status-change-section">
      <div class="detail-label">Change Status</div>
      <div class="status-change-btns">
        <button
          class="sc-btn"
          *ngFor="let s of allStatuses"
          [class.current]="drawerRow.status === s"
          (click)="changeStatus(drawerRow, s)">
          {{ s }}
        </button>
      </div>
    </div>

  </div>
</div>

<!-- ── Cancel Confirmation Modal ──────────────────────────────────────── -->
<div class="modal-overlay" [class.open]="cancelModal.open">
  <div class="modal" *ngIf="cancelModal.row">
    <div class="modal-icon warn"><i class="pi pi-ban"></i></div>
    <h3 class="modal-title">Cancel Appointment?</h3>
    <p class="modal-body">
      Cancel <strong>{{ cancelModal.row.patient }}</strong>'s appointment on
      <strong>{{ formatDate(cancelModal.row.dateTimeIso) }}</strong> at
      <strong>{{ formatTime(cancelModal.row.dateTimeIso) }}</strong>?
    </p>
    <div class="reason-group">
      <label>Cancellation Reason</label>
      <select [(ngModel)]="cancelReason">
        <option value="">Select reason…</option>
        <option>Patient request</option>
        <option>Doctor unavailable</option>
        <option>Emergency</option>
        <option>No-show</option>
        <option>Rescheduled</option>
        <option>Other</option>
      </select>
    </div>
    <div class="modal-actions">
      <button class="mbtn ghost" (click)="closeCancelModal()">Keep Appointment</button>
      <button class="mbtn danger" (click)="executeCancel()">Cancel Appointment</button>
    </div>
  </div>
</div>

<!-- ── New Appointment Modal ──────────────────────────────────────────── -->
<div class="modal-overlay" [class.open]="newModal">
  <div class="modal modal-form">
    <div class="modal-head">
      <h3>New Appointment</h3>
      <button class="drawer-close pi pi-times" (click)="newModal = false"></button>
    </div>
    <div class="form-grid">
      <div class="fg">
        <label>Patient Name *</label>
        <input [(ngModel)]="newAppt.patientName" placeholder="Search or type name…" />
      </div>
      <div class="fg">
        <label>Mobile Number *</label>
        <input [(ngModel)]="newAppt.mobileNumber" placeholder="10-digit number" />
      </div>
      <div class="fg">
        <label>Date *</label>
        <input type="date" [(ngModel)]="newAppt.appointmentDate" />
      </div>
      <div class="fg time-row">
        <label>Time *</label>
        <div class="time-inputs">
          <select [(ngModel)]="newAppt.hour">
            <option *ngFor="let h of hours" [value]="h">{{ h }}</option>
          </select>
          <span>:</span>
          <select [(ngModel)]="newAppt.minute">
            <option *ngFor="let m of minutes" [value]="m">{{ m }}</option>
          </select>
          <select [(ngModel)]="newAppt.meridiem">
            <option value="AM">AM</option>
            <option value="PM">PM</option>
          </select>
        </div>
      </div>
      <div class="fg">
        <label>Doctor *</label>
        <select [(ngModel)]="newAppt.doctor">
          <option value="">Select doctor…</option>
          <option *ngFor="let d of doctors" [value]="d">{{ d }}</option>
        </select>
      </div>
      <div class="fg">
        <label>Duration (minutes)</label>
        <select [(ngModel)]="newAppt.durationMinutes">
          <option [value]="15">15 min</option>
          <option [value]="30">30 min</option>
          <option [value]="45">45 min</option>
          <option [value]="60">60 min — 1 hr</option>
          <option [value]="90">90 min — 1.5 hr</option>
          <option [value]="120">120 min — 2 hr</option>
        </select>
      </div>
      <div class="fg fg-full">
        <label>Chief Complaint / Reason</label>
        <input [(ngModel)]="newAppt.complaint" placeholder="e.g. Toothache, Scaling, Root Canal…" />
      </div>
      <div class="fg">
        <label>Age</label>
        <input type="number" [(ngModel)]="newAppt.age" placeholder="Optional" />
      </div>
    </div>
    <div class="modal-actions">
      <button class="mbtn ghost" (click)="newModal = false">Cancel</button>
      <button class="mbtn teal" (click)="saveAndSend()"><i class="pi pi-send"></i> Save & Send Confirmation</button>
      <button class="mbtn primary" (click)="saveAppointment()">Save Appointment</button>
    </div>
  </div>
</div>
  `,

  styles: [`
    /* ════════════════════════════════════════════════════════
       PAGE
    ════════════════════════════════════════════════════════ */
    :host { display: block; }

    .appt-page {
      padding: 1.5rem 1.75rem;
      background: var(--surface-ground, #f8f9fa);
      min-height: 100%;
      display: flex;
      flex-direction: column;
      gap: 1.1rem;
    }

    /* ════════════════════════════════════════════════════════
       KPI STRIP
    ════════════════════════════════════════════════════════ */
    .kpi-strip {
      display: grid;
      grid-template-columns: repeat(auto-fit, minmax(155px, 1fr));
      gap: 0.85rem;
    }
    .kpi-card {
      background: #fff; border: 1px solid #dee2e6; border-radius: 10px;
      padding: 0.9rem 1rem; display: flex; align-items: center; gap: 0.8rem;
      transition: box-shadow .2s;
    }
    .kpi-card:hover { box-shadow: 0 3px 14px rgba(0,0,0,.07); }
    .kpi-ico {
      width: 38px; height: 38px; border-radius: 9px;
      display: flex; align-items: center; justify-content: center;
      font-size: 1.1rem; flex-shrink: 0;
    }
    .kpi-val { font-size: 1.4rem; font-weight: 700; color: #212529; line-height: 1; }
    .kpi-lbl { font-size: 0.73rem; color: #6c757d; font-weight: 500; margin-top: 0.18rem; }

    /* ════════════════════════════════════════════════════════
       MAIN CARD
    ════════════════════════════════════════════════════════ */
    .main-card {
      background: #fff; border: 1px solid #dee2e6; border-radius: 12px; overflow: hidden;
    }

    /* Card Topbar */
    .card-topbar {
      display: flex; align-items: center; justify-content: space-between;
      padding: 1rem 1.4rem; border-bottom: 1px solid #f1f3f4; gap: 1rem;
    }
    .tabs-wrap { display: flex; gap: 0.3rem; }
    .tab-btn {
      display: inline-flex; align-items: center; gap: 0.4rem;
      background: transparent; border: none; border-radius: 8px;
      padding: 0.5rem 1rem; font-size: 0.86rem; font-weight: 600;
      color: #6c757d; cursor: pointer; transition: all .15s; position: relative;
    }
    .tab-btn:hover { background: #f8f9fa; color: #212529; }
    .tab-btn.active { background: #10b981; color: #fff; }
    .tab-badge {
      background: rgba(255,255,255,.3); font-size: 0.68rem; font-weight: 700;
      padding: 0.1rem 0.4rem; border-radius: 99px;
    }
    .tab-btn:not(.active) .tab-badge { background: #dee2e6; color: #495057; }

    /* Buttons */
    .btn-primary {
      background: #10b981; color: #fff; border: none; border-radius: 8px;
      padding: 0.52rem 1rem; font-size: 0.83rem; font-weight: 600; cursor: pointer;
      display: inline-flex; align-items: center; gap: 0.4rem; transition: background .15s;
      white-space: nowrap;
    }
    .btn-primary:hover { background: #0d9488; }
    .btn-primary.small { padding: 0.4rem 0.8rem; font-size: 0.78rem; }

    /* Toolbar */
    .toolbar {
      display: flex; align-items: center; gap: 0.65rem;
      padding: 0.85rem 1.4rem; flex-wrap: wrap;
      border-bottom: 1px solid #f8f9fa;
    }
    .search-box {
      display: flex; align-items: center; gap: 0.5rem;
      background: #f8f9fa; border: 1px solid #dee2e6; border-radius: 8px;
      padding: 0 0.8rem; height: 38px; flex: 1; min-width: 220px; transition: border-color .15s;
    }
    .search-box.focused { border-color: #10b981; background: #fff; }
    .search-ico { color: #adb5bd; font-size: 0.82rem; }
    .search-input { background: transparent; border: none; outline: none; flex: 1; font-size: 0.84rem; color: #212529; }
    .clear-btn { background: transparent; border: none; color: #adb5bd; cursor: pointer; font-size: 0.78rem; }
    .date-range-box {
      display: flex; align-items: center; gap: 0.45rem; background: #f8f9fa;
      border: 1px solid #dee2e6; border-radius: 8px; padding: 0 0.75rem; height: 38px;
    }
    .date-input { background: transparent; border: none; outline: none; font-size: 0.8rem; color: #495057; width: 120px; }
    .quick-filters { display: flex; gap: 0.3rem; }
    .qf-btn {
      background: #f8f9fa; border: 1px solid #dee2e6; border-radius: 7px;
      padding: 0.3rem 0.75rem; font-size: 0.78rem; font-weight: 600; color: #6c757d;
      cursor: pointer; transition: all .15s;
    }
    .qf-btn:hover { border-color: #10b981; color: #10b981; }
    .qf-btn.active { background: #10b981; border-color: #10b981; color: #fff; }
    .filter-select {
      background: #f8f9fa; border: 1px solid #dee2e6; border-radius: 8px;
      padding: 0.3rem 0.65rem; font-size: 0.82rem; color: #495057; outline: none; height: 38px;
      cursor: pointer; transition: border-color .15s;
    }
    .filter-select:focus { border-color: #10b981; }

    /* Status Chips */
    .status-chips {
      display: flex; gap: 0.4rem; padding: 0.6rem 1.4rem;
      border-bottom: 1px solid #f1f3f4; flex-wrap: wrap;
    }
    .sch-chip {
      display: inline-flex; align-items: center; gap: 0.35rem;
      border: 1px solid #dee2e6; background: #fff; border-radius: 20px;
      padding: 0.25rem 0.7rem; font-size: 0.75rem; font-weight: 600; color: #6c757d;
      cursor: pointer; transition: all .15s;
    }
    .sch-chip:hover { border-color: #adb5bd; }
    .sch-dot { width: 7px; height: 7px; border-radius: 50%; background: currentColor; }
    .sch-count { background: #f8f9fa; border-radius: 99px; padding: 0.08rem 0.45rem; font-size: 0.68rem; font-weight: 700; }

    /* chip variants */
    .sch-chip.pending { color: #6c757d; } .sch-chip.pending.active { background: #e9ecef; border-color: #adb5bd; }
    .sch-chip.confirmed { color: #1d4ed8; } .sch-chip.confirmed.active { background: #dbeafe; border-color: #93c5fd; }
    .sch-chip.checked-in { color: #b45309; } .sch-chip.checked-in.active { background: #fff8e6; border-color: #fde68a; }
    .sch-chip.completed { color: #15803d; } .sch-chip.completed.active { background: #dcfce7; border-color: #86efac; }
    .sch-chip.cancelled { color: #dc2626; } .sch-chip.cancelled.active { background: #fff5f5; border-color: #fca5a5; }
    .sch-chip.no-show { color: #7c3aed; } .sch-chip.no-show.active { background: #ede9fe; border-color: #c4b5fd; }

    /* ════════════════════════════════════════════════════════
       TABLE
    ════════════════════════════════════════════════════════ */
    .table-scroll { overflow-x: auto; }
    .at { width: 100%; border-collapse: collapse; min-width: 1100px; }

    .at thead th {
      background: #f8f9fa; text-align: left; font-size: 0.71rem; font-weight: 700;
      color: #adb5bd; text-transform: uppercase; letter-spacing: 0.06em;
      padding: 0.65rem 0.75rem; border-bottom: 1px solid #dee2e6; white-space: nowrap;
    }
    .at thead th.sortable { cursor: pointer; user-select: none; }
    .at thead th.sortable:hover { color: #10b981; }
    .at thead th .pi { margin-left: 3px; font-size: 0.62rem; }

    .at-row { cursor: pointer; transition: background .1s; }
    .at-row:hover { background: #f8fffe; }
    .at-row td {
      padding: 0.7rem 0.75rem; border-bottom: 1px solid #f1f3f4;
      font-size: 0.84rem; color: #495057; vertical-align: middle;
    }
    .at-row:last-child td { border-bottom: none; }

    /* Row status tints */
    .status-row-completed td { background: #f0fdf4; }
    .status-row-checked-in td { background: #fffbf0; }
    .status-row-cancelled td { opacity: 0.65; }

    /* Col widths */
    .col-no { width: 46px; }
    .col-dt { width: 110px; }
    .col-token { width: 70px; text-align: center; }
    .col-patient { min-width: 180px; }
    .col-doctor { min-width: 150px; }
    .col-type { width: 130px; }
    .col-complaints { min-width: 160px; }
    .col-status { width: 120px; }
    .col-inline { width: 200px; }
    .col-action { width: 100px; }

    .muted { color: #ced4da; font-size: 0.78rem; }

    /* Date/time stack */
    .dt-stack { display: flex; flex-direction: column; gap: 0.08rem; }
    .dt-time { font-size: 0.88rem; font-weight: 700; color: #212529; }
    .dt-date { font-size: 0.73rem; color: #adb5bd; }

    /* Token chip */
    .token-chip {
      display: inline-flex; align-items: center; justify-content: center;
      width: 30px; height: 30px; background: #f8f9fa; border: 1px solid #dee2e6;
      border-radius: 50%; font-size: 0.82rem; font-weight: 700; color: #495057;
    }

    /* Patient cell */
    .patient-cell { display: flex; align-items: center; gap: 0.55rem; }
    .pt-av {
      width: 30px; height: 30px; border-radius: 50%; flex-shrink: 0;
      display: flex; align-items: center; justify-content: center;
      font-size: 0.72rem; font-weight: 700; color: #fff;
    }
    .pt-av.male { background: linear-gradient(135deg,#10b981,#0d9488); }
    .pt-av.female { background: linear-gradient(135deg,#ec4899,#db2777); }
    .pt-info { display: flex; flex-direction: column; gap: 0.1rem; }
    .pt-name { font-size: 0.85rem; font-weight: 600; color: #212529; }
    .pt-phone { font-size: 0.72rem; color: #adb5bd; }

    /* Doctor cell */
    .doctor-cell { display: flex; align-items: center; gap: 0.45rem; }
    .dr-av {
      width: 26px; height: 26px; border-radius: 7px; background: #e6f9f4;
      color: #0d9488; font-size: 0.64rem; font-weight: 700;
      display: flex; align-items: center; justify-content: center; flex-shrink: 0;
    }
    .dr-name { font-size: 0.82rem; font-weight: 600; color: #212529; }

    /* Type/duration */
    .type-stack { display: flex; flex-direction: column; gap: 0.2rem; }
    .type-label { font-size: 0.75rem; color: #6c757d; }
    .dur-chip {
      display: inline-block; background: #f8f9fa; border: 1px solid #dee2e6;
      border-radius: 6px; padding: 0.12rem 0.5rem; font-size: 0.73rem; font-weight: 600; color: #6c757d;
    }

    /* Complaint */
    .complaint-txt {
      display: block; max-width: 160px; overflow: hidden;
      text-overflow: ellipsis; white-space: nowrap; font-size: 0.82rem; color: #495057;
    }

    /* Status badge */
    .status-badge {
      display: inline-block; font-size: 0.72rem; font-weight: 700;
      padding: 0.22rem 0.65rem; border-radius: 20px; white-space: nowrap;
      border: 1px solid transparent;
    }
    .sb-pending { background: #e9ecef; color: #495057; border-color: #dee2e6; }
    .sb-confirmed { background: #dbeafe; color: #1d4ed8; border-color: #93c5fd; }
    .sb-checked-in { background: #fff8e6; color: #b45309; border-color: #fde68a; }
    .sb-completed { background: #dcfce7; color: #15803d; border-color: #86efac; }
    .sb-cancelled { background: #fff5f5; color: #dc2626; border-color: #fca5a5; }
    .sb-no-show { background: #ede9fe; color: #7c3aed; border-color: #c4b5fd; }

    /* Inline actions */
    .inline-actions { display: flex; gap: 0.3rem; flex-wrap: wrap; }
    .ia-btn {
      font-size: 0.71rem; font-weight: 700; padding: 0.2rem 0.55rem;
      border-radius: 6px; border: 1px solid #dee2e6; background: #f8f9fa;
      color: #495057; cursor: pointer; white-space: nowrap; transition: all .15s;
    }
    .ia-btn:hover { border-color: #adb5bd; }
    .ia-btn.ia-confirm { background: #dbeafe; border-color: #93c5fd; color: #1d4ed8; }
    .ia-btn.ia-checkin { background: #fff8e6; border-color: #fde68a; color: #b45309; }
    .ia-btn.ia-complete { background: #dcfce7; border-color: #86efac; color: #15803d; }
    .ia-btn.ia-noshow { background: #ede9fe; border-color: #c4b5fd; color: #7c3aed; }

    /* Row actions */
    .row-actions { display: flex; gap: 0.3rem; }
    .act-btn {
      width: 30px; height: 30px; border-radius: 7px; border: 1px solid #dee2e6;
      background: #fff; color: #6c757d; cursor: pointer; font-size: 0.78rem;
      display: flex; align-items: center; justify-content: center; transition: all .15s;
    }
    .act-btn:hover { border-color: #10b981; color: #10b981; background: #f0fdf4; }
    .act-btn.warn:hover { border-color: #ef4444; color: #ef4444; background: #fff5f5; }

    /* Empty state */
    .empty-state { padding: 3rem; text-align: center; }
    .empty-inner { display: flex; flex-direction: column; align-items: center; gap: 0.6rem; }
    .empty-ico { font-size: 2.5rem; color: #dee2e6; }
    .empty-inner p { font-size: 0.95rem; font-weight: 600; color: #6c757d; margin: 0; }
    .empty-inner span { font-size: 0.82rem; color: #adb5bd; }

    /* ════════════════════════════════════════════════════════
       PAGINATION
    ════════════════════════════════════════════════════════ */
    .pagination-bar {
      display: flex; align-items: center; justify-content: space-between;
      padding: 0.85rem 1.4rem; border-top: 1px solid #f1f3f4; gap: 1rem; flex-wrap: wrap;
    }
    .pg-size { display: flex; align-items: center; gap: 0.5rem; }
    .pg-lbl { font-size: 0.8rem; color: #6c757d; }
    .pg-size select { border: 1px solid #dee2e6; border-radius: 7px; background: #fff; padding: 0.3rem 0.55rem; font-size: 0.82rem; color: #212529; outline: none; }
    .pg-info { font-size: 0.8rem; color: #6c757d; }
    .pg-nav { display: flex; align-items: center; gap: 0.3rem; }
    .pg-btn { width: 32px; height: 32px; border: 1px solid #dee2e6; background: #fff; border-radius: 7px; color: #6c757d; cursor: pointer; font-size: 0.8rem; display: flex; align-items: center; justify-content: center; transition: all .15s; }
    .pg-btn:disabled { opacity: 0.35; cursor: default; }
    .pg-btn:not(:disabled):hover { border-color: #10b981; color: #10b981; }
    .pg-num { min-width: 32px; height: 32px; border: 1px solid #dee2e6; background: #fff; border-radius: 7px; color: #6c757d; cursor: pointer; font-size: 0.82rem; font-weight: 600; padding: 0 0.4rem; transition: all .15s; }
    .pg-num:hover { border-color: #10b981; color: #10b981; }
    .pg-num.active { background: #10b981; border-color: #10b981; color: #fff; }

    /* ════════════════════════════════════════════════════════
       DRAWER
    ════════════════════════════════════════════════════════ */
    .drawer-overlay { position: fixed; inset: 0; background: rgba(0,0,0,.25); opacity: 0; pointer-events: none; transition: opacity .25s; z-index: 999; }
    .drawer-overlay.open { opacity: 1; pointer-events: all; }
    .drawer { position: fixed; top: 0; right: 0; bottom: 0; width: 380px; background: #fff; box-shadow: -4px 0 24px rgba(0,0,0,.12); transform: translateX(100%); transition: transform .3s cubic-bezier(.4,0,.2,1); z-index: 1000; display: flex; flex-direction: column; }
    .drawer.open { transform: translateX(0); }
    .drawer-inner { padding: 1.4rem; display: flex; flex-direction: column; gap: 1rem; overflow-y: auto; flex: 1; }
    .drawer-head { display: flex; align-items: flex-start; justify-content: space-between; gap: 0.5rem; }
    .drawer-title { margin: 0 0 0.4rem; font-size: 1.1rem; font-weight: 700; color: #212529; }
    .drawer-close { background: transparent; border: none; cursor: pointer; color: #6c757d; font-size: 1rem; padding: 0.2rem; }

    /* Timeline strip */
    .timeline-strip { display: flex; align-items: center; gap: 0; overflow-x: auto; padding: 0.5rem 0; }
    .tl-step { display: flex; flex-direction: column; align-items: center; gap: 0.3rem; flex: 1; min-width: 60px; position: relative; }
    .tl-step:not(:last-child)::after { content: ''; position: absolute; top: 7px; left: calc(50% + 8px); right: calc(-50% + 8px); height: 2px; background: #dee2e6; }
    .tl-step.done:not(:last-child)::after { background: #10b981; }
    .tl-dot { width: 14px; height: 14px; border-radius: 50%; background: #dee2e6; border: 2px solid #fff; box-shadow: 0 0 0 2px #dee2e6; z-index: 1; }
    .tl-step.done .tl-dot { background: #10b981; box-shadow: 0 0 0 2px #10b981; }
    .tl-step.current .tl-dot { background: #f59e0b; box-shadow: 0 0 0 2px #f59e0b; }
    .tl-lbl { font-size: 0.62rem; color: #adb5bd; font-weight: 600; text-align: center; }
    .tl-step.done .tl-lbl { color: #10b981; }
    .tl-step.current .tl-lbl { color: #b45309; }

    /* Detail sections */
    .drawer-body { display: flex; flex-direction: column; gap: 0.75rem; }
    .detail-section { padding-bottom: 0.6rem; border-bottom: 1px solid #f1f3f4; }
    .detail-section:last-child { border-bottom: none; }
    .detail-label { font-size: 0.7rem; font-weight: 700; color: #adb5bd; text-transform: uppercase; letter-spacing: 0.06em; margin-bottom: 0.2rem; }
    .detail-val { font-size: 0.86rem; color: #495057; }
    .detail-val.bold { font-weight: 600; color: #212529; }
    .detail-val.muted { color: #6c757d; font-size: 0.8rem; }

    /* Drawer actions */
    .drawer-actions { display: flex; gap: 0.5rem; }
    .dbtn { flex: 1; border: 1px solid #dee2e6; background: #fff; border-radius: 8px; padding: 0.52rem 0.5rem; font-size: 0.79rem; font-weight: 600; cursor: pointer; display: flex; align-items: center; justify-content: center; gap: 0.35rem; color: #495057; transition: all .15s; }
    .dbtn:hover { border-color: #10b981; color: #10b981; }
    .dbtn.primary { background: #10b981; color: #fff; border-color: #10b981; }
    .dbtn.primary:hover { background: #0d9488; }
    .dbtn.green { border-color: #10b981; color: #10b981; }
    .dbtn.green:hover { background: #f0fdf4; }

    /* Status change */
    .status-change-section { margin-top: auto; }
    .detail-label { font-size: 0.7rem; font-weight: 700; color: #adb5bd; text-transform: uppercase; letter-spacing: 0.06em; margin-bottom: 0.5rem; display: block; }
    .status-change-btns { display: flex; gap: 0.35rem; flex-wrap: wrap; }
    .sc-btn { font-size: 0.73rem; font-weight: 600; padding: 0.3rem 0.7rem; border-radius: 7px; border: 1px solid #dee2e6; background: #f8f9fa; color: #6c757d; cursor: pointer; transition: all .15s; }
    .sc-btn:hover { border-color: #10b981; color: #10b981; }
    .sc-btn.current { background: #10b981; border-color: #10b981; color: #fff; }

    /* ════════════════════════════════════════════════════════
       MODALS
    ════════════════════════════════════════════════════════ */
    .modal-overlay { position: fixed; inset: 0; background: rgba(0,0,0,.35); display: flex; align-items: center; justify-content: center; opacity: 0; pointer-events: none; transition: opacity .2s; z-index: 1100; }
    .modal-overlay.open { opacity: 1; pointer-events: all; }
    .modal { background: #fff; border-radius: 14px; padding: 2rem; width: 440px; max-width: 95vw; text-align: center; box-shadow: 0 20px 60px rgba(0,0,0,.18); }
    .modal-icon { width: 50px; height: 50px; border-radius: 50%; margin: 0 auto 1rem; display: flex; align-items: center; justify-content: center; font-size: 1.3rem; }
    .modal-icon.warn { background: #fff8e6; color: #b45309; }
    .modal-title { margin: 0 0 0.5rem; font-size: 1.1rem; font-weight: 700; color: #212529; }
    .modal-body { font-size: 0.86rem; color: #6c757d; margin: 0 0 1rem; line-height: 1.6; }
    .modal-body strong { color: #212529; }
    .reason-group { text-align: left; margin-bottom: 1.2rem; }
    .reason-group label { display: block; font-size: 0.75rem; font-weight: 600; color: #6c757d; margin-bottom: 0.35rem; }
    .reason-group select { width: 100%; border: 1px solid #dee2e6; border-radius: 8px; padding: 0.5rem 0.75rem; font-size: 0.84rem; color: #212529; outline: none; }
    .modal-actions { display: flex; gap: 0.55rem; justify-content: flex-end; }
    .mbtn { border-radius: 8px; padding: 0.52rem 1.1rem; font-size: 0.84rem; font-weight: 600; cursor: pointer; border: none; transition: all .15s; display: inline-flex; align-items: center; gap: 0.35rem; }
    .mbtn.ghost { background: #f8f9fa; color: #6c757d; border: 1px solid #dee2e6; }
    .mbtn.ghost:hover { border-color: #adb5bd; }
    .mbtn.danger { background: #ef4444; color: #fff; }
    .mbtn.danger:hover { background: #dc2626; }
    .mbtn.primary { background: #10b981; color: #fff; }
    .mbtn.primary:hover { background: #0d9488; }
    .mbtn.teal { background: #0d9488; color: #fff; }
    .mbtn.teal:hover { background: #0f766e; }

    /* New Appointment Modal */
    .modal-form { text-align: left; width: 600px; padding: 1.5rem; }
    .modal-head { display: flex; align-items: center; justify-content: space-between; margin-bottom: 1.2rem; }
    .modal-head h3 { margin: 0; font-size: 1.1rem; font-weight: 700; color: #212529; }
    .form-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 0.8rem; margin-bottom: 1.2rem; }
    .fg { display: flex; flex-direction: column; gap: 0.3rem; }
    .fg-full { grid-column: 1 / -1; }
    .fg label { font-size: 0.73rem; font-weight: 600; color: #6c757d; }
    .fg input, .fg select { background: #f8f9fa; border: 1px solid #dee2e6; border-radius: 8px; padding: 0.48rem 0.7rem; font-size: 0.84rem; color: #212529; outline: none; width: 100%; box-sizing: border-box; transition: border-color .15s; }
    .fg input:focus, .fg select:focus { border-color: #10b981; background: #fff; }
    .time-inputs { display: flex; align-items: center; gap: 0.3rem; }
    .time-inputs select { width: auto; }
    .modal-form .modal-actions { border-top: 1px solid #f1f3f4; padding-top: 1rem; justify-content: flex-end; }

    @media (max-width: 900px) {
      .appt-page { padding: 1rem; }
      .tabs-wrap { overflow-x: auto; }
      .toolbar { flex-direction: column; align-items: stretch; }
      .search-box { min-width: 0; }
    }
  `]
})
export class AppointmentsPage implements OnInit {

  // ─── UI State ────────────────────────────────────────────
  activeTab: AppTab = 'appointment';
  activeQuick: QuickFilter = 'today';
  search = '';
  searchFocused = false;
  dateFrom = '';
  dateTo = '';
  filterDoctor = '';
  filterStatus = '';
  drawerOpen = false;
  drawerRow: AppointmentRow | null = null;
  newModal = false;
  cancelModal: { open: boolean; row: AppointmentRow | null } = { open: false, row: null };
  cancelReason = '';
  sortField: SortField = 'dateTimeIso';
  sortDir: 'asc' | 'desc' = 'desc';
  currentPage = 1;
  pageSize = 10;

  // ─── Reference Data ──────────────────────────────────────
  doctors = ['Dr. Arjun', 'Dr. Rajan', 'Dr. Kapoor', 'Dr. Mehta'];
  allStatuses: AppStatus[] = ['Pending', 'Confirmed', 'Checked-In', 'Completed', 'Cancelled', 'No-Show'];
  statusTimeline: AppStatus[] = ['Pending', 'Confirmed', 'Checked-In', 'Completed'];
  hours = ['01','02','03','04','05','06','07','08','09','10','11','12'];
  minutes = ['00','15','30','45'];

  tabs = [
    { label: 'Appointments', val: 'appointment' as AppTab, badge: '' },
    { label: 'Check-In', val: 'check-in' as AppTab, badge: '' },
    { label: 'Recall', val: 'recall' as AppTab, badge: '' },
    { label: 'Calendar', val: 'calendar' as AppTab, badge: '' },
  ];

  quickFilters = [
    { label: 'Today', val: 'today' as QuickFilter },
    { label: 'Yesterday', val: 'yesterday' as QuickFilter },
    { label: 'This Week', val: 'week' as QuickFilter },
    { label: 'This Month', val: 'month' as QuickFilter },
  ];

  statusChips = [
    { label: 'Pending', val: 'Pending', cls: 'pending' },
    { label: 'Confirmed', val: 'Confirmed', cls: 'confirmed' },
    { label: 'Checked-In', val: 'Checked-In', cls: 'checked-in' },
    { label: 'Completed', val: 'Completed', cls: 'completed' },
    { label: 'Cancelled', val: 'Cancelled', cls: 'cancelled' },
    { label: 'No-Show', val: 'No-Show', cls: 'no-show' },
  ];

  // ─── New appt form ───────────────────────────────────────
  newAppt: NewAppointmentPayload = {
    patientName: '', mobileNumber: '', appointmentDate: '',
    hour: '09', minute: '00', meridiem: 'AM',
    doctor: '', complaint: '', durationMinutes: 30,
  };

  // ─── Data ────────────────────────────────────────────────
  rows: AppointmentRow[] = [
    { no: 1, dateTimeIso: '2025-11-11T15:20:00', token: 3, patient: 'Eva', phone: '9995960143', gender: 'Female', age: 8, complaints: 'Broken Filling', doctorName: 'Dr. Arjun', durationMinutes: 15, status: 'Completed', type: 'Restorative' },
    { no: 2, dateTimeIso: '2025-11-11T10:15:00', token: 2, patient: 'Eva', phone: '9995960143', gender: 'Female', age: 8, complaints: 'Toothache & Pain', doctorName: 'Dr. Arjun', durationMinutes: 15, status: 'Completed', type: 'Consultation' },
    { no: 3, dateTimeIso: '2025-11-11T09:05:00', token: 1, patient: 'Dheeraj T', phone: '9539192684', gender: 'Male', age: 23, complaints: 'Discolouration Of Tooth', doctorName: 'Dr. Arjun', durationMinutes: 30, status: 'Pending', room: 'Room 1', type: 'Cosmetic' },
    { no: 4, dateTimeIso: new Date().toISOString(), token: 4, patient: 'Anita Sharma', phone: '9876543210', gender: 'Female', age: 34, complaints: 'Scaling & Polishing', doctorName: 'Dr. Rajan', durationMinutes: 45, status: 'Checked-In', room: 'Room 2', type: 'Hygiene' },
    { no: 5, dateTimeIso: new Date().toISOString(), token: 5, patient: 'Rizwan Ali', phone: '8765432109', gender: 'Male', age: 29, complaints: 'Root Canal Follow-up', doctorName: 'Dr. Kapoor', durationMinutes: 60, status: 'Confirmed', room: 'Room 3', type: 'Endodontic' },
    { no: 6, dateTimeIso: new Date().toISOString(), token: 6, patient: 'Leena Patel', phone: '7654321098', gender: 'Female', age: 42, complaints: 'Crown Fitting', doctorName: 'Dr. Rajan', durationMinutes: 90, status: 'Pending', type: 'Prosthetic' },
    { no: 7, dateTimeIso: new Date(Date.now() - 86400000).toISOString(), token: 1, patient: 'Karan Joshi', phone: '6543210987', gender: 'Male', age: 17, complaints: 'Braces Tightening', doctorName: 'Dr. Mehta', durationMinutes: 30, status: 'No-Show', type: 'Orthodontic' },
  ];

  filteredRows: AppointmentRow[] = [];
  pagedRows: AppointmentRow[] = [];

  // ─── KPI cards ───────────────────────────────────────────
  get kpiCards() {
    const today = this.rows.filter(r => this.isSameDay(new Date(r.dateTimeIso), new Date()));
    return [
      { label: 'Today Total', value: today.length, icon: '📅', bg: '#e6f9f4', color: '#0d9488' },
      { label: 'Pending', value: today.filter(r => r.status === 'Pending').length, icon: '⏳', bg: '#f1f3f4', color: '#6c757d' },
      { label: 'Confirmed', value: today.filter(r => r.status === 'Confirmed').length, icon: '✓', bg: '#dbeafe', color: '#1d4ed8' },
      { label: 'Checked-In', value: today.filter(r => r.status === 'Checked-In').length, icon: '🚶', bg: '#fff8e6', color: '#b45309' },
      { label: 'Completed', value: today.filter(r => r.status === 'Completed').length, icon: '✅', bg: '#dcfce7', color: '#15803d' },
      { label: 'No-Shows', value: today.filter(r => r.status === 'No-Show').length, icon: '⚠', bg: '#ede9fe', color: '#7c3aed' },
    ];
  }

  // ─── Computed ────────────────────────────────────────────
  get totalPages() { return Math.max(1, Math.ceil(this.filteredRows.length / this.pageSize)); }
  get pageStart() { return (this.currentPage - 1) * this.pageSize; }
  get pageEnd() { return Math.min(this.pageStart + this.pageSize, this.filteredRows.length); }
  get visiblePages(): number[] {
    const pages: number[] = [];
    const start = Math.max(1, this.currentPage - 2);
    const end = Math.min(this.totalPages, this.currentPage + 2);
    for (let i = start; i <= end; i++) pages.push(i);
    return pages;
  }

  // ─── Lifecycle ───────────────────────────────────────────
  ngOnInit() { this.applyFilters(); }

  // ─── Tab ─────────────────────────────────────────────────
  setTab(t: AppTab) { this.activeTab = t; }

  // ─── Filters ─────────────────────────────────────────────
  setQuick(q: QuickFilter) { this.activeQuick = q; this.dateFrom = ''; this.dateTo = ''; this.applyFilters(); }

  clearSearch() { this.search = ''; this.applyFilters(); }

  toggleStatusChip(val: string) {
    this.filterStatus = this.filterStatus === val ? '' : val;
    this.applyFilters();
  }

  countByStatus(val: string) { return this.rows.filter(r => r.status === val).length; }

  applyFilters() {
    const q = this.search.toLowerCase().trim();
    const now = new Date();

    let result = this.rows.filter(row => {
      const d = new Date(row.dateTimeIso);

      // Quick filter
      let datePass = true;
      if (!this.dateFrom && !this.dateTo) {
        if (this.activeQuick === 'today') datePass = this.isSameDay(d, now);
        else if (this.activeQuick === 'yesterday') { const y = new Date(now); y.setDate(now.getDate()-1); datePass = this.isSameDay(d, y); }
        else if (this.activeQuick === 'week') { const s = new Date(now); s.setDate(now.getDate()-6); datePass = d >= s; }
        else if (this.activeQuick === 'month') datePass = d.getFullYear() === now.getFullYear() && d.getMonth() === now.getMonth();
      } else {
        if (this.dateFrom) datePass = d >= new Date(this.dateFrom);
        if (this.dateTo) datePass = datePass && d <= new Date(this.dateTo + 'T23:59:59');
      }

      const matchQ = !q || row.patient.toLowerCase().includes(q) || row.phone.includes(q) || row.token.toString().includes(q) || row.complaints.toLowerCase().includes(q);
      const matchDoctor = !this.filterDoctor || row.doctorName === this.filterDoctor;
      const matchStatus = !this.filterStatus || row.status === this.filterStatus;

      return datePass && matchQ && matchDoctor && matchStatus;
    });

    // Sort
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
    this.updateTabBadges();
  }

  updateTabBadges() {
    const today = this.rows.filter(r => this.isSameDay(new Date(r.dateTimeIso), new Date()));
    this.tabs[0].badge = today.length.toString();
    this.tabs[1].badge = today.filter(r => r.status === 'Checked-In').length.toString();
    this.tabs[2].badge = '3'; // mock recall count
  }

  sort(field: SortField) {
    if (this.sortField === field) this.sortDir = this.sortDir === 'asc' ? 'desc' : 'asc';
    else { this.sortField = field; this.sortDir = 'asc'; }
    this.applyFilters();
  }

  sortIcon(field: SortField) {
    if (this.sortField !== field) return 'pi-sort-alt';
    return this.sortDir === 'asc' ? 'pi-sort-amount-up' : 'pi-sort-amount-down';
  }

  updatePage() { this.pagedRows = this.filteredRows.slice(this.pageStart, this.pageEnd); }
  goPage(p: number) { if (p < 1 || p > this.totalPages) return; this.currentPage = p; this.updatePage(); }
  onPageSizeChange() { this.currentPage = 1; this.updatePage(); }

  // ─── Inline Actions ──────────────────────────────────────
  getInlineActions(row: AppointmentRow): Array<{label: string; cls: string; action: (r: AppointmentRow) => void}> {
    const actions = [];
    if (row.status === 'Pending') actions.push({ label: 'Confirm', cls: 'ia-confirm', action: (r: AppointmentRow) => this.changeStatus(r, 'Confirmed') });
    if (row.status === 'Confirmed') actions.push({ label: 'Check-In', cls: 'ia-checkin', action: (r: AppointmentRow) => this.changeStatus(r, 'Checked-In') });
    if (row.status === 'Checked-In') actions.push({ label: 'Complete', cls: 'ia-complete', action: (r: AppointmentRow) => this.changeStatus(r, 'Completed') });
    if (row.status !== 'Completed' && row.status !== 'Cancelled' && row.status !== 'No-Show') {
      actions.push({ label: 'No-Show', cls: 'ia-noshow', action: (r: AppointmentRow) => this.changeStatus(r, 'No-Show') });
    }
    return actions;
  }

  changeStatus(row: AppointmentRow, status: AppStatus) {
    row.status = status;
    if (status === 'Checked-In') row.arrivalTime = new Date().toLocaleTimeString();
    this.applyFilters();
    if (this.drawerRow?.no === row.no) this.drawerRow = { ...row };
  }

  // ─── Drawer ──────────────────────────────────────────────
  openDrawer(row: AppointmentRow) { this.drawerRow = { ...row }; this.drawerOpen = true; }
  closeDrawer() { this.drawerOpen = false; }

  isStatusDone(step: AppStatus): boolean {
    const order = this.statusTimeline;
    if (!this.drawerRow) return false;
    return order.indexOf(this.drawerRow.status) > order.indexOf(step);
  }

  // ─── CRUD ────────────────────────────────────────────────
  onView(row: AppointmentRow) { this.openDrawer(row); }
  onEdit(row: AppointmentRow) { console.log('Edit', row.no); }

  confirmCancel(row: AppointmentRow) { this.cancelModal = { open: true, row }; this.cancelReason = ''; }
  closeCancelModal() { this.cancelModal = { open: false, row: null }; }
  executeCancel() {
    if (this.cancelModal.row) this.changeStatus(this.cancelModal.row, 'Cancelled');
    this.closeCancelModal();
  }

  openNewModal() {
    this.newAppt = { patientName: '', mobileNumber: '', appointmentDate: '', hour: '09', minute: '00', meridiem: 'AM', doctor: '', complaint: '', durationMinutes: 30 };
    this.newModal = true;
  }

  saveAppointment() {
    if (!this.newAppt.patientName || !this.newAppt.appointmentDate || !this.newAppt.doctor) return;
    const nextNo = Math.max(...this.rows.map(r => r.no), 0) + 1;
    const nextToken = Math.max(...this.rows.filter(r => this.isSameDay(new Date(r.dateTimeIso), new Date(this.newAppt.appointmentDate))).map(r => r.token), 0) + 1;
    const row: AppointmentRow = {
      no: nextNo, token: nextToken,
      dateTimeIso: this.buildIso(this.newAppt),
      patient: this.newAppt.patientName,
      phone: this.newAppt.mobileNumber,
      gender: '—', age: this.newAppt.age ?? 0,
      complaints: this.newAppt.complaint,
      doctorName: this.newAppt.doctor,
      durationMinutes: this.newAppt.durationMinutes,
      status: 'Pending',
    };
    this.rows = [row, ...this.rows];
    this.newModal = false;
    this.applyFilters();
  }

  saveAndSend() { this.saveAppointment(); console.log('Send confirmation SMS/email'); }

  // ─── Utils ───────────────────────────────────────────────
  formatDate(iso: string) { return new Date(iso).toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: '2-digit' }); }
  formatTime(iso: string) { return new Date(iso).toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit', hour12: true }); }
  drInitials(name: string) { return name.replace('Dr. ', '').split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2); }
  startVisit(row: AppointmentRow) { console.log('Start visit for', row.patient); }
  openPatientProfile(row: AppointmentRow) { console.log('Open profile', row.patient); }
  sendWhatsApp(phone: string) { window.open(`https://wa.me/91${phone}`, '_blank'); }

  private buildIso(p: NewAppointmentPayload): string {
    let h = parseInt(p.hour); if (p.meridiem === 'PM' && h < 12) h += 12; if (p.meridiem === 'AM' && h === 12) h = 0;
    return `${p.appointmentDate}T${h.toString().padStart(2, '0')}:${p.minute}:00`;
  }

  private isSameDay(a: Date, b: Date): boolean {
    return a.getFullYear() === b.getFullYear() && a.getMonth() === b.getMonth() && a.getDate() === b.getDate();
  }
}