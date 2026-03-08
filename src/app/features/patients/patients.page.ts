import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';

// ─── Interfaces ──────────────────────────────────────────────────────────────

export interface NewPatientPayload {
  firstName: string;
  lastName: string;
  phone: string;
  birthDate: string;
  gender: string;
  email?: string;
}

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
  status: 'active' | 'inactive' | 'new' | 'in-treatment' | 'completed';
  email?: string;
  lastVisit?: string;
  nextAppt?: string;
  hasAllergy?: boolean;
  isPediatric?: boolean;
  hasInsurance?: boolean;
  selected?: boolean;
}

type SortField = 'name' | 'regDate' | 'due' | 'visit' | 'age' | '';
type SortDir = 'asc' | 'desc';

// ─── Component ───────────────────────────────────────────────────────────────

@Component({
  selector: 'app-patients-page',
  standalone: true,
  imports: [CommonModule, FormsModule],
  template: `
<div class="patients-page">

  <!-- ── Analytics KPI Row ─────────────────────────────── -->
  <div class="kpi-row">
    <div class="kpi-card" *ngFor="let k of kpiCards">
      <div class="kpi-icon-wrap" [style.background]="k.bg">{{ k.icon }}</div>
      <div class="kpi-info">
        <div class="kpi-val">{{ k.value }}</div>
        <div class="kpi-lbl">{{ k.label }}</div>
      </div>
    </div>
  </div>

  <!-- ── Main Card ──────────────────────────────────────── -->
  <div class="main-card">

    <!-- Card Header -->
    <div class="card-header">
      <div class="header-left">
        <h2 class="page-title">All Patients</h2>
        <span class="total-badge">{{ filteredRows.length }} records</span>
      </div>
      <div class="header-right">
        <button class="btn-ghost" (click)="exportCSV()">
          <i class="pi pi-download"></i> Export
        </button>
        <button class="btn-ghost" (click)="onImportPatient()">
          <i class="pi pi-upload"></i> Import
        </button>
        <button class="btn-primary" (click)="onNewPatient()">
          <i class="pi pi-plus"></i> New Patient
        </button>
      </div>
    </div>

    <!-- Search + Filters Bar -->
    <div class="toolbar">
      <div class="search-box">
        <i class="pi pi-search search-ico"></i>
        <input
          class="search-input"
          type="text"
          [(ngModel)]="search"
          placeholder="Search by name, phone, ID or email…"
          (ngModelChange)="applyFilter()" />
        <button *ngIf="search" class="search-clear pi pi-times" (click)="clearSearch()"></button>
      </div>

      <div class="filter-chips">
        <button
          class="filter-chip"
          *ngFor="let f of statusFilters"
          [class.active]="activeStatusFilter === f.val"
          (click)="setStatusFilter(f.val)">
          <span class="chip-dot" [class]="f.dotCls"></span>
          {{ f.label }}
        </button>
      </div>

      <button class="btn-ghost" [class.active]="showFilters" (click)="showFilters = !showFilters">
        <i class="pi pi-sliders-h"></i> Filters
        <span *ngIf="activeFilterCount > 0" class="filter-count">{{ activeFilterCount }}</span>
      </button>
    </div>

    <!-- Advanced Filter Panel -->
    <div class="filter-panel" [class.open]="showFilters">
      <div class="filter-grid">
        <div class="fgroup">
          <label>Gender</label>
          <select [(ngModel)]="filters.gender" (change)="applyFilter()">
            <option value="">All</option>
            <option value="Male">Male</option>
            <option value="Female">Female</option>
          </select>
        </div>
        <div class="fgroup">
          <label>Due Amount</label>
          <select [(ngModel)]="filters.due" (change)="applyFilter()">
            <option value="">All</option>
            <option value="any">Has Due</option>
            <option value="none">Paid (₹0)</option>
            <option value="high">High Due (>₹5000)</option>
          </select>
        </div>
        <div class="fgroup">
          <label>Case Type</label>
          <select [(ngModel)]="filters.caseType" (change)="applyFilter()">
            <option value="">All</option>
            <option value="new">New Cases</option>
            <option value="existing">Existing</option>
          </select>
        </div>
        <div class="fgroup">
          <label>Age Group</label>
          <select [(ngModel)]="filters.ageGroup" (change)="applyFilter()">
            <option value="">All Ages</option>
            <option value="pediatric">Pediatric (<18)</option>
            <option value="adult">Adult (18–60)</option>
            <option value="senior">Senior (>60)</option>
          </select>
        </div>
        <div class="fgroup">
          <label>Flags</label>
          <select [(ngModel)]="filters.flag" (change)="applyFilter()">
            <option value="">All</option>
            <option value="allergy">Has Allergy</option>
            <option value="insurance">Has Insurance</option>
          </select>
        </div>
        <div class="fgroup fgroup-btn">
          <button class="btn-ghost small" (click)="resetFilters()">
            <i class="pi pi-refresh"></i> Reset
          </button>
        </div>
      </div>
    </div>

    <!-- Bulk Actions Bar -->
    <div class="bulk-bar" [class.visible]="selectedCount > 0">
      <span class="bulk-count">{{ selectedCount }} patients selected</span>
      <div class="bulk-actions">
        <button class="bulk-btn" (click)="bulkSMS()"><i class="pi pi-comment"></i> SMS</button>
        <button class="bulk-btn" (click)="bulkEmail()"><i class="pi pi-envelope"></i> Email</button>
        <button class="bulk-btn" (click)="bulkExport()"><i class="pi pi-download"></i> Export</button>
        <button class="bulk-btn danger" (click)="bulkDeactivate()"><i class="pi pi-ban"></i> Deactivate</button>
        <button class="bulk-clear pi pi-times" (click)="clearSelection()"></button>
      </div>
    </div>

    <!-- Table -->
    <div class="table-scroll">
      <table class="pt">
        <thead>
          <tr>
            <th class="col-check">
              <input type="checkbox" [checked]="allSelected" (change)="toggleSelectAll($event)" />
            </th>
            <th class="col-no">No.</th>
            <th class="col-reg sortable" (click)="sort('regDate')">
              Registered <i class="pi" [class]="sortIcon('regDate')"></i>
            </th>
            <th class="col-name sortable" (click)="sort('name')">
              Patient <i class="pi" [class]="sortIcon('name')"></i>
            </th>
            <th class="col-phone">Phone</th>
            <th class="col-id">Patient ID</th>
            <th class="col-gender sortable" (click)="sort('age')">
              Gender / Age <i class="pi" [class]="sortIcon('age')"></i>
            </th>
            <th class="col-visit sortable" (click)="sort('visit')">
              Visits <i class="pi" [class]="sortIcon('visit')"></i>
            </th>
            <th class="col-due sortable" (click)="sort('due')">
              Due (₹) <i class="pi" [class]="sortIcon('due')"></i>
            </th>
            <th class="col-status">Status</th>
            <th class="col-action">Actions</th>
          </tr>
        </thead>
        <tbody>
          <tr
            *ngFor="let p of pagedRows"
            class="pt-row"
            [class.row-selected]="p.selected"
            [class.row-due]="p.due > 0"
            (click)="openDrawer(p)">

            <!-- Checkbox -->
            <td class="col-check" (click)="$event.stopPropagation()">
              <input type="checkbox" [(ngModel)]="p.selected" (change)="onRowSelect()" />
            </td>

            <!-- No -->
            <td class="col-no muted">{{ p.no }}</td>

            <!-- Reg -->
            <td class="col-reg">
              <div class="reg-stack">
                <span class="reg-date">{{ p.regDate }}</span>
                <span class="reg-time">{{ p.regTime }}</span>
              </div>
            </td>

            <!-- Name -->
            <td class="col-name">
              <div class="name-cell">
                <div class="avatar" [class]="'avatar ' + (p.gender === 'Female' ? 'female' : 'male')">
                  {{ initials(p.name) }}
                  <span *ngIf="p.hasAllergy" class="flag-dot allergy" title="Has Allergy">⚠</span>
                </div>
                <div class="name-info">
                  <span class="pname">{{ p.name }}</span>
                  <div class="name-badges">
                    <span *ngIf="p.isNewCase" class="nbadge new">New Case</span>
                    <span *ngIf="!p.isNewCase && p.due > 0" class="nbadge due">Due ₹{{ p.due | number }}</span>
                    <span *ngIf="!p.isNewCase && p.due === 0" class="nbadge paid">Paid ✓</span>
                    <span *ngIf="p.hasInsurance" class="nbadge ins">🛡 Insured</span>
                    <span *ngIf="p.isPediatric" class="nbadge ped">🧒 Pediatric</span>
                  </div>
                </div>
              </div>
            </td>

            <!-- Phone -->
            <td class="col-phone">
              <div class="phone-cell" (click)="$event.stopPropagation()">
                <span class="phone-num">{{ p.phone }}</span>
                <div class="phone-actions">
                  <button class="tiny-btn" title="Copy" (click)="copyPhone(p.phone)">
                    <i class="pi pi-copy"></i>
                  </button>
                  <button class="tiny-btn green" title="WhatsApp" (click)="openWhatsApp(p.phone)">
                    <i class="pi pi-comments"></i>
                  </button>
                </div>
              </div>
            </td>

            <!-- Patient ID -->
            <td class="col-id">
              <span class="pid-chip">{{ p.patientId }}</span>
            </td>

            <!-- Gender / Age -->
            <td class="col-gender">
              <div class="gender-cell">
                <span class="gender-icon">{{ p.gender === 'Female' ? '♀' : '♂' }}</span>
                <span [class]="p.isPediatric ? 'age-val pediatric' : 'age-val'">{{ p.age > 0 ? p.age + ' yrs' : '—' }}</span>
              </div>
            </td>

            <!-- Visits -->
            <td class="col-visit">
              <button class="visit-btn" title="{{ p.visit }} total visits" (click)="$event.stopPropagation(); openVisits(p)">
                {{ p.visit }}
              </button>
            </td>

            <!-- Due -->
            <td class="col-due" (click)="$event.stopPropagation(); openBilling(p)">
              <span *ngIf="p.due > 0" class="due-val red">₹{{ p.due | number }}</span>
              <span *ngIf="p.due === 0" class="due-val green">Paid</span>
            </td>

            <!-- Status -->
            <td class="col-status">
              <span class="status-badge" [class]="'status-badge ' + p.status">
                {{ statusLabel(p.status) }}
              </span>
            </td>

            <!-- Actions -->
            <td class="col-action" (click)="$event.stopPropagation()">
              <div class="action-group">
                <button class="act-btn" title="View Profile" (click)="openPatient(p)">
                  <i class="pi pi-eye"></i>
                </button>
                <button class="act-btn" title="Edit" (click)="editPatient(p)">
                  <i class="pi pi-pencil"></i>
                </button>
                <button class="act-btn danger" title="Archive" (click)="confirmDelete(p)">
                  <i class="pi pi-trash"></i>
                </button>
              </div>
            </td>
          </tr>

          <tr *ngIf="pagedRows.length === 0">
            <td colspan="11" class="empty-state">
              <div class="empty-inner">
                <i class="pi pi-users empty-icon"></i>
                <p>No patients found</p>
                <span>Try adjusting your search or filters</span>
              </div>
            </td>
          </tr>
        </tbody>
      </table>
    </div>

    <!-- Pagination -->
    <div class="pagination-bar">
      <div class="page-size-wrap">
        <span class="pg-label">Show</span>
        <select [(ngModel)]="pageSize" (change)="onPageSizeChange()">
          <option [value]="10">10</option>
          <option [value]="25">25</option>
          <option [value]="50">50</option>
          <option [value]="100">100</option>
        </select>
        <span class="pg-label">per page</span>
      </div>
      <div class="page-info">
        Showing {{ pageStart + 1 }}–{{ pageEnd }} of {{ filteredRows.length }} patients
      </div>
      <div class="page-nav">
        <button class="pg-btn" [disabled]="currentPage === 1" (click)="goPage(1)">
          <i class="pi pi-angle-double-left"></i>
        </button>
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
        <button class="pg-btn" [disabled]="currentPage === totalPages" (click)="goPage(totalPages)">
          <i class="pi pi-angle-double-right"></i>
        </button>
      </div>
    </div>

  </div><!-- /main-card -->
</div><!-- /patients-page -->

<!-- ── Side Drawer ──────────────────────────────────────── -->
<div class="drawer-overlay" [class.open]="drawerOpen" (click)="closeDrawer()"></div>
<div class="drawer" [class.open]="drawerOpen">
  <div class="drawer-inner" *ngIf="drawerPatient">
    <div class="drawer-header">
      <div class="drawer-av" [class]="drawerPatient.gender === 'Female' ? 'female' : 'male'">
        {{ initials(drawerPatient.name) }}
      </div>
      <div class="drawer-identity">
        <h3>{{ drawerPatient.name }}</h3>
        <span class="pid-chip">{{ drawerPatient.patientId }}</span>
      </div>
      <button class="drawer-close pi pi-times" (click)="closeDrawer()"></button>
    </div>

    <div class="drawer-kpis">
      <div class="dkpi">
        <span class="dkpi-val">{{ drawerPatient.visit }}</span>
        <span class="dkpi-lbl">Total Visits</span>
      </div>
      <div class="dkpi">
        <span class="dkpi-val" [class.red]="drawerPatient.due > 0" [class.green]="drawerPatient.due === 0">
          {{ drawerPatient.due > 0 ? '₹' + (drawerPatient.due | number) : 'Paid' }}
        </span>
        <span class="dkpi-lbl">Outstanding</span>
      </div>
      <div class="dkpi">
        <span class="dkpi-val">{{ drawerPatient.age > 0 ? drawerPatient.age : '—' }}</span>
        <span class="dkpi-lbl">Age</span>
      </div>
    </div>

    <div class="drawer-section">
      <div class="drawer-row"><i class="pi pi-phone"></i><span>{{ drawerPatient.phone }}</span></div>
      <div class="drawer-row"><i class="pi pi-id-card"></i><span>{{ drawerPatient.gender }}</span></div>
      <div class="drawer-row"><i class="pi pi-calendar"></i><span>Registered {{ drawerPatient.regDate }}</span></div>
      <div class="drawer-row" *ngIf="drawerPatient.lastVisit"><i class="pi pi-history"></i><span>Last visit {{ drawerPatient.lastVisit }}</span></div>
    </div>

    <div class="drawer-flags" *ngIf="drawerPatient.hasAllergy || drawerPatient.isPediatric || drawerPatient.hasInsurance">
      <span *ngIf="drawerPatient.hasAllergy" class="dflag red">⚠ Allergy Alert</span>
      <span *ngIf="drawerPatient.isPediatric" class="dflag blue">🧒 Pediatric</span>
      <span *ngIf="drawerPatient.hasInsurance" class="dflag teal">🛡 Insured</span>
    </div>

    <div class="drawer-actions">
      <button class="dbtn primary" (click)="openPatient(drawerPatient!)"><i class="pi pi-eye"></i> Full Profile</button>
      <button class="dbtn" (click)="editPatient(drawerPatient!)"><i class="pi pi-pencil"></i> Edit</button>
      <button class="dbtn green" (click)="openWhatsApp(drawerPatient!.phone)"><i class="pi pi-comments"></i> WhatsApp</button>
    </div>
  </div>
</div>

<!-- ── Delete Confirmation Modal ──────────────────────── -->
<div class="modal-overlay" [class.open]="deleteModal.open">
  <div class="modal" *ngIf="deleteModal.patient">
    <div class="modal-icon danger">
      <i class="pi pi-exclamation-triangle"></i>
    </div>
    <h3 class="modal-title">Archive Patient?</h3>
    <p class="modal-body">
      <strong>{{ deleteModal.patient.name }}</strong> has
      <strong>{{ deleteModal.patient.visit }} visits</strong>
      <span *ngIf="deleteModal.patient.due > 0"> and an outstanding balance of
        <strong class="red">₹{{ deleteModal.patient.due | number }}</strong>
      </span>.
      This action will archive the patient record.
    </p>
    <div class="modal-actions">
      <button class="mbtn ghost" (click)="closeDeleteModal()">Cancel</button>
      <button class="mbtn danger" (click)="executeDelete()">Archive Patient</button>
    </div>
  </div>
</div>

<!-- ── New Patient Modal ──────────────────────────────── -->
<div class="modal-overlay" [class.open]="newPatientModal">
  <div class="modal modal-form">
    <div class="modal-header">
      <h3>Add New Patient</h3>
      <button class="drawer-close pi pi-times" (click)="newPatientModal = false"></button>
    </div>
    <div class="form-grid">
      <div class="fgroup">
        <label>First Name *</label>
        <input [(ngModel)]="newPt.firstName" placeholder="e.g. Anita" />
      </div>
      <div class="fgroup">
        <label>Last Name</label>
        <input [(ngModel)]="newPt.lastName" placeholder="e.g. Sharma" />
      </div>
      <div class="fgroup">
        <label>Phone *</label>
        <input [(ngModel)]="newPt.phone" placeholder="10-digit number" />
      </div>
      <div class="fgroup">
        <label>Email</label>
        <input [(ngModel)]="newPt.email" placeholder="optional" />
      </div>
      <div class="fgroup">
        <label>Date of Birth</label>
        <input type="date" [(ngModel)]="newPt.birthDate" />
      </div>
      <div class="fgroup">
        <label>Gender</label>
        <select [(ngModel)]="newPt.gender">
          <option value="">Select…</option>
          <option value="Male">Male</option>
          <option value="Female">Female</option>
          <option value="Other">Other</option>
        </select>
      </div>
    </div>
    <div class="modal-actions">
      <button class="mbtn ghost" (click)="newPatientModal = false">Cancel</button>
      <button class="mbtn teal" (click)="saveAndBook()">Save & Book Appointment</button>
      <button class="mbtn primary" (click)="saveNewPatient()">Save Patient</button>
    </div>
  </div>
</div>
  `,

  styles: [`
    /* ════════════════════════════════════════════════════════
       BASE PAGE
    ════════════════════════════════════════════════════════ */
    :host { display: block; }

    .patients-page {
      padding: 1.5rem 1.75rem;
      background: var(--surface-ground, #f8f9fa);
      min-height: 100%;
      display: flex;
      flex-direction: column;
      gap: 1.1rem;
    }

    /* ════════════════════════════════════════════════════════
       KPI ROW
    ════════════════════════════════════════════════════════ */
    .kpi-row {
      display: grid;
      grid-template-columns: repeat(auto-fit, minmax(170px, 1fr));
      gap: 0.85rem;
    }
    .kpi-card {
      background: #fff;
      border: 1px solid #dee2e6;
      border-radius: 10px;
      padding: 1rem 1.1rem;
      display: flex;
      align-items: center;
      gap: 0.85rem;
      transition: box-shadow 0.2s;
    }
    .kpi-card:hover { box-shadow: 0 3px 14px rgba(0,0,0,.07); }
    .kpi-icon-wrap {
      width: 40px; height: 40px; border-radius: 10px;
      display: flex; align-items: center; justify-content: center;
      font-size: 1.2rem; flex-shrink: 0;
    }
    .kpi-val { font-size: 1.4rem; font-weight: 700; color: #212529; line-height: 1; }
    .kpi-lbl { font-size: 0.74rem; color: #6c757d; font-weight: 500; margin-top: 0.2rem; }

    /* ════════════════════════════════════════════════════════
       MAIN CARD
    ════════════════════════════════════════════════════════ */
    .main-card {
      background: #fff;
      border: 1px solid #dee2e6;
      border-radius: 12px;
      overflow: hidden;
    }

    /* Card Header */
    .card-header {
      display: flex; align-items: center; justify-content: space-between;
      padding: 1.2rem 1.4rem 0;
      gap: 1rem;
    }
    .header-left { display: flex; align-items: baseline; gap: 0.7rem; }
    .page-title { margin: 0; font-size: 1.35rem; font-weight: 700; color: #212529; }
    .total-badge {
      background: #e6f9f4; color: #0d9488; border: 1px solid #a7f3d0;
      font-size: 0.73rem; font-weight: 700; padding: 0.2rem 0.6rem; border-radius: 20px;
    }
    .header-right { display: flex; align-items: center; gap: 0.5rem; flex-shrink: 0; }

    /* Buttons */
    .btn-primary {
      background: #10b981; color: #fff; border: none; border-radius: 8px;
      padding: 0.5rem 1rem; font-size: 0.83rem; font-weight: 600; cursor: pointer;
      display: inline-flex; align-items: center; gap: 0.4rem; transition: background .15s;
    }
    .btn-primary:hover { background: #0d9488; }
    .btn-ghost {
      background: #fff; color: #495057; border: 1px solid #dee2e6; border-radius: 8px;
      padding: 0.48rem 0.9rem; font-size: 0.82rem; font-weight: 600; cursor: pointer;
      display: inline-flex; align-items: center; gap: 0.4rem; transition: all .15s; position: relative;
    }
    .btn-ghost:hover { border-color: #10b981; color: #10b981; }
    .btn-ghost.active { border-color: #10b981; color: #10b981; background: #f0fdf4; }

    /* ════════════════════════════════════════════════════════
       TOOLBAR
    ════════════════════════════════════════════════════════ */
    .toolbar {
      display: flex; align-items: center; gap: 0.7rem;
      padding: 0.9rem 1.4rem; flex-wrap: wrap;
    }
    .search-box {
      display: flex; align-items: center; gap: 0.5rem;
      background: #f8f9fa; border: 1px solid #dee2e6; border-radius: 8px;
      padding: 0 0.8rem; flex: 1; min-width: 260px; height: 40px;
      transition: border-color .15s;
    }
    .search-box:focus-within { border-color: #10b981; background: #fff; }
    .search-ico { color: #adb5bd; font-size: 0.85rem; }
    .search-input { background: transparent; border: none; outline: none; flex: 1; font-size: 0.86rem; color: #212529; }
    .search-clear { background: transparent; border: none; color: #adb5bd; cursor: pointer; font-size: 0.8rem; padding: 0; }
    .search-clear:hover { color: #495057; }

    .filter-chips { display: flex; gap: 0.4rem; flex-wrap: wrap; }
    .filter-chip {
      display: inline-flex; align-items: center; gap: 0.35rem;
      background: #f8f9fa; border: 1px solid #dee2e6; border-radius: 20px;
      padding: 0.28rem 0.7rem; font-size: 0.76rem; font-weight: 600; color: #6c757d;
      cursor: pointer; transition: all .15s;
    }
    .filter-chip:hover { border-color: #10b981; color: #10b981; }
    .filter-chip.active { background: #e6f9f4; border-color: #a7f3d0; color: #0d9488; }
    .chip-dot { width: 6px; height: 6px; border-radius: 50%; background: currentColor; }
    .filter-count {
      background: #10b981; color: #fff; font-size: 0.65rem; font-weight: 700;
      padding: 1px 5px; border-radius: 99px; position: absolute; top: -5px; right: -5px;
    }

    /* ════════════════════════════════════════════════════════
       FILTER PANEL
    ════════════════════════════════════════════════════════ */
    .filter-panel {
      max-height: 0; overflow: hidden; transition: max-height 0.3s ease, padding 0.3s;
      border-top: 1px solid transparent;
    }
    .filter-panel.open {
      max-height: 200px; padding: 0.85rem 1.4rem;
      border-top-color: #f1f3f4; background: #fafbfc;
    }
    .filter-grid {
      display: flex; gap: 0.7rem; flex-wrap: wrap; align-items: flex-end;
    }
    .fgroup { display: flex; flex-direction: column; gap: 0.3rem; min-width: 130px; }
    .fgroup label { font-size: 0.73rem; font-weight: 600; color: #6c757d; text-transform: uppercase; letter-spacing: 0.05em; }
    .fgroup input, .fgroup select {
      background: #fff; border: 1px solid #dee2e6; border-radius: 7px;
      padding: 0.4rem 0.65rem; font-size: 0.82rem; color: #212529; outline: none;
      transition: border-color .15s;
    }
    .fgroup input:focus, .fgroup select:focus { border-color: #10b981; }
    .fgroup-btn { justify-content: flex-end; }
    .btn-ghost.small { padding: 0.38rem 0.75rem; font-size: 0.78rem; }

    /* ════════════════════════════════════════════════════════
       BULK BAR
    ════════════════════════════════════════════════════════ */
    .bulk-bar {
      display: flex; align-items: center; gap: 0.8rem;
      padding: 0.6rem 1.4rem; background: #0f172a; color: #fff;
      max-height: 0; overflow: hidden; transition: max-height .25s;
    }
    .bulk-bar.visible { max-height: 60px; }
    .bulk-count { font-size: 0.84rem; font-weight: 600; flex-shrink: 0; }
    .bulk-actions { display: flex; gap: 0.4rem; }
    .bulk-btn {
      background: rgba(255,255,255,.1); border: 1px solid rgba(255,255,255,.2);
      border-radius: 7px; color: #fff; padding: 0.3rem 0.7rem; font-size: 0.78rem;
      font-weight: 600; cursor: pointer; display: inline-flex; align-items: center; gap: 0.35rem;
      transition: background .15s;
    }
    .bulk-btn:hover { background: rgba(255,255,255,.18); }
    .bulk-btn.danger { border-color: rgba(239,68,68,.5); color: #fca5a5; }
    .bulk-clear { background: transparent; border: none; color: rgba(255,255,255,.5); cursor: pointer; margin-left: auto; font-size: 1rem; padding: 0 0.3rem; }

    /* ════════════════════════════════════════════════════════
       TABLE
    ════════════════════════════════════════════════════════ */
    .table-scroll { overflow-x: auto; }
    .pt { width: 100%; border-collapse: collapse; min-width: 1100px; }

    .pt thead th {
      background: #f8f9fa; text-align: left; font-size: 0.72rem; font-weight: 700;
      color: #adb5bd; text-transform: uppercase; letter-spacing: 0.06em;
      padding: 0.65rem 0.75rem; border-bottom: 1px solid #dee2e6; white-space: nowrap;
    }
    .pt thead th.sortable { cursor: pointer; user-select: none; }
    .pt thead th.sortable:hover { color: #10b981; }
    .pt thead th .pi { margin-left: 4px; font-size: 0.65rem; }

    .pt-row { cursor: pointer; transition: background .12s; }
    .pt-row:hover { background: #f8fffe; }
    .pt-row.row-selected { background: #f0fdf4; }
    .pt-row td {
      padding: 0.7rem 0.75rem; border-bottom: 1px solid #f1f3f4;
      font-size: 0.84rem; color: #495057; vertical-align: middle;
    }
    .pt-row:last-child td { border-bottom: none; }

    /* Column widths */
    .col-check { width: 36px; }
    .col-no { width: 48px; }
    .col-reg { width: 110px; }
    .col-name { min-width: 220px; }
    .col-phone { width: 160px; }
    .col-id { width: 110px; }
    .col-gender { width: 110px; }
    .col-visit { width: 70px; text-align: center; }
    .col-due { width: 110px; }
    .col-status { width: 110px; }
    .col-action { width: 110px; }

    .muted { color: #ced4da; font-size: 0.8rem; }

    /* Reg stack */
    .reg-stack { display: flex; flex-direction: column; gap: 0.1rem; }
    .reg-date { font-size: 0.82rem; font-weight: 600; color: #212529; }
    .reg-time { font-size: 0.73rem; color: #adb5bd; }

    /* Name Cell */
    .name-cell { display: flex; align-items: center; gap: 0.6rem; }
    .avatar {
      width: 34px; height: 34px; border-radius: 50%; flex-shrink: 0;
      display: flex; align-items: center; justify-content: center;
      font-size: 0.7rem; font-weight: 700; color: #fff; position: relative;
    }
    .avatar.male { background: linear-gradient(135deg, #10b981, #0d9488); }
    .avatar.female { background: linear-gradient(135deg, #ec4899, #db2777); }
    .flag-dot { position: absolute; top: -2px; right: -2px; font-size: 0.6rem; line-height: 1; }
    .name-info { display: flex; flex-direction: column; gap: 0.2rem; }
    .pname { font-size: 0.86rem; font-weight: 600; color: #212529; }
    .name-badges { display: flex; gap: 0.3rem; flex-wrap: wrap; }
    .nbadge {
      font-size: 0.67rem; font-weight: 700; padding: 0.1rem 0.45rem;
      border-radius: 4px; white-space: nowrap;
    }
    .nbadge.new { background: #dbeafe; color: #1d4ed8; }
    .nbadge.due { background: #fff5f5; color: #dc2626; }
    .nbadge.paid { background: #f0fdf4; color: #16a34a; }
    .nbadge.ins { background: #e6f9f4; color: #0d9488; }
    .nbadge.ped { background: #fef9c3; color: #a16207; }

    /* Phone Cell */
    .phone-cell { display: flex; align-items: center; gap: 0.4rem; }
    .phone-num { font-size: 0.82rem; color: #495057; }
    .phone-actions { display: flex; gap: 0.25rem; opacity: 0; transition: opacity .15s; }
    .pt-row:hover .phone-actions { opacity: 1; }
    .tiny-btn {
      width: 22px; height: 22px; border-radius: 5px; border: 1px solid #dee2e6;
      background: #fff; color: #6c757d; cursor: pointer; font-size: 0.65rem;
      display: flex; align-items: center; justify-content: center; transition: all .15s;
    }
    .tiny-btn:hover { border-color: #adb5bd; color: #212529; }
    .tiny-btn.green:hover { border-color: #10b981; color: #10b981; }

    /* Patient ID */
    .pid-chip {
      background: #f8f9fa; border: 1px solid #dee2e6; border-radius: 6px;
      padding: 0.2rem 0.5rem; font-size: 0.76rem; font-weight: 600; color: #6c757d;
      font-family: monospace;
    }

    /* Gender cell */
    .gender-cell { display: flex; align-items: center; gap: 0.35rem; }
    .gender-icon { font-size: 0.9rem; color: #6c757d; }
    .age-val { font-size: 0.82rem; color: #495057; }
    .age-val.pediatric { color: #d97706; font-weight: 600; }

    /* Visit button */
    .visit-btn {
      background: #f8f9fa; border: 1px solid #dee2e6; border-radius: 6px;
      padding: 0.22rem 0.6rem; font-size: 0.82rem; font-weight: 700;
      color: #495057; cursor: pointer; transition: all .15s; display: block; margin: 0 auto;
    }
    .visit-btn:hover { background: #e6f9f4; border-color: #10b981; color: #0d9488; }

    /* Due values */
    .due-val { font-size: 0.84rem; font-weight: 700; cursor: pointer; }
    .due-val.red { color: #dc2626; }
    .due-val.green { color: #16a34a; }

    /* Status badge */
    .status-badge {
      display: inline-block; font-size: 0.72rem; font-weight: 700;
      padding: 0.22rem 0.6rem; border-radius: 20px;
    }
    .status-badge.new { background: #dbeafe; color: #1d4ed8; }
    .status-badge.active { background: #dcfce7; color: #15803d; }
    .status-badge.in-treatment { background: #e6f9f4; color: #0d9488; }
    .status-badge.completed { background: #f0fdf4; color: #16a34a; }
    .status-badge.inactive { background: #f1f3f4; color: #6c757d; }

    /* Action group */
    .action-group { display: flex; gap: 0.35rem; }
    .act-btn {
      width: 30px; height: 30px; border-radius: 7px; border: 1px solid #dee2e6;
      background: #fff; color: #6c757d; cursor: pointer; font-size: 0.8rem;
      display: flex; align-items: center; justify-content: center; transition: all .15s;
    }
    .act-btn:hover { border-color: #10b981; color: #10b981; background: #f0fdf4; }
    .act-btn.danger:hover { border-color: #ef4444; color: #ef4444; background: #fff5f5; }

    /* Empty state */
    .empty-state { padding: 3rem; text-align: center; }
    .empty-inner { display: flex; flex-direction: column; align-items: center; gap: 0.4rem; }
    .empty-icon { font-size: 2.5rem; color: #dee2e6; }
    .empty-inner p { font-size: 0.95rem; font-weight: 600; color: #6c757d; margin: 0; }
    .empty-inner span { font-size: 0.82rem; color: #adb5bd; }

    /* ════════════════════════════════════════════════════════
       PAGINATION
    ════════════════════════════════════════════════════════ */
    .pagination-bar {
      display: flex; align-items: center; justify-content: space-between;
      padding: 0.85rem 1.4rem; border-top: 1px solid #f1f3f4;
      gap: 1rem; flex-wrap: wrap;
    }
    .page-size-wrap { display: flex; align-items: center; gap: 0.5rem; }
    .pg-label { font-size: 0.8rem; color: #6c757d; }
    .page-size-wrap select {
      border: 1px solid #dee2e6; border-radius: 7px; background: #fff;
      padding: 0.3rem 0.6rem; font-size: 0.82rem; color: #212529; outline: none;
    }
    .page-info { font-size: 0.8rem; color: #6c757d; }
    .page-nav { display: flex; align-items: center; gap: 0.3rem; }
    .pg-btn {
      width: 32px; height: 32px; border: 1px solid #dee2e6; background: #fff;
      border-radius: 7px; color: #6c757d; cursor: pointer; font-size: 0.8rem;
      display: flex; align-items: center; justify-content: center; transition: all .15s;
    }
    .pg-btn:disabled { opacity: 0.35; cursor: default; }
    .pg-btn:not(:disabled):hover { border-color: #10b981; color: #10b981; }
    .pg-num {
      min-width: 32px; height: 32px; border: 1px solid #dee2e6; background: #fff;
      border-radius: 7px; color: #6c757d; cursor: pointer; font-size: 0.82rem;
      font-weight: 600; padding: 0 0.4rem; transition: all .15s;
    }
    .pg-num:hover { border-color: #10b981; color: #10b981; }
    .pg-num.active { background: #10b981; border-color: #10b981; color: #fff; }

    /* ════════════════════════════════════════════════════════
       SIDE DRAWER
    ════════════════════════════════════════════════════════ */
    .drawer-overlay {
      position: fixed; inset: 0; background: rgba(0,0,0,.25);
      opacity: 0; pointer-events: none; transition: opacity .25s; z-index: 999;
    }
    .drawer-overlay.open { opacity: 1; pointer-events: all; }
    .drawer {
      position: fixed; top: 0; right: 0; bottom: 0; width: 360px;
      background: #fff; box-shadow: -4px 0 24px rgba(0,0,0,.12);
      transform: translateX(100%); transition: transform .3s cubic-bezier(.4,0,.2,1);
      z-index: 1000; display: flex; flex-direction: column;
    }
    .drawer.open { transform: translateX(0); }
    .drawer-inner { padding: 1.5rem; display: flex; flex-direction: column; gap: 1.1rem; overflow-y: auto; flex: 1; }
    .drawer-header { display: flex; align-items: center; gap: 0.8rem; }
    .drawer-av {
      width: 48px; height: 48px; border-radius: 50%; flex-shrink: 0;
      display: flex; align-items: center; justify-content: center;
      font-size: 0.9rem; font-weight: 700; color: #fff;
    }
    .drawer-av.male { background: linear-gradient(135deg,#10b981,#0d9488); }
    .drawer-av.female { background: linear-gradient(135deg,#ec4899,#db2777); }
    .drawer-identity { flex: 1; }
    .drawer-identity h3 { margin: 0 0 0.3rem; font-size: 1.05rem; font-weight: 700; color: #212529; }
    .drawer-close { background: transparent; border: none; cursor: pointer; color: #6c757d; font-size: 1rem; padding: 0.3rem; }
    .drawer-kpis { display: grid; grid-template-columns: 1fr 1fr 1fr; gap: 0.5rem; }
    .dkpi { background: #f8f9fa; border-radius: 8px; padding: 0.7rem; text-align: center; }
    .dkpi-val { display: block; font-size: 1.1rem; font-weight: 700; color: #212529; }
    .dkpi-lbl { display: block; font-size: 0.72rem; color: #6c757d; margin-top: 2px; }
    .dkpi-val.red { color: #dc2626; }
    .dkpi-val.green { color: #16a34a; }
    .drawer-section { display: flex; flex-direction: column; gap: 0.5rem; }
    .drawer-row { display: flex; align-items: center; gap: 0.6rem; font-size: 0.84rem; color: #495057; padding: 0.4rem 0; border-bottom: 1px solid #f1f3f4; }
    .drawer-row .pi { color: #adb5bd; width: 16px; text-align: center; }
    .drawer-flags { display: flex; gap: 0.4rem; flex-wrap: wrap; }
    .dflag { font-size: 0.76rem; font-weight: 600; padding: 0.25rem 0.65rem; border-radius: 20px; }
    .dflag.red { background: #fff5f5; color: #dc2626; border: 1px solid #fecaca; }
    .dflag.blue { background: #dbeafe; color: #1d4ed8; border: 1px solid #bfdbfe; }
    .dflag.teal { background: #e6f9f4; color: #0d9488; border: 1px solid #a7f3d0; }
    .drawer-actions { display: flex; gap: 0.5rem; margin-top: auto; }
    .dbtn {
      flex: 1; border: 1px solid #dee2e6; background: #fff; border-radius: 8px;
      padding: 0.55rem 0.5rem; font-size: 0.8rem; font-weight: 600; cursor: pointer;
      display: flex; align-items: center; justify-content: center; gap: 0.35rem;
      color: #495057; transition: all .15s;
    }
    .dbtn:hover { border-color: #10b981; color: #10b981; }
    .dbtn.primary { background: #10b981; color: #fff; border-color: #10b981; }
    .dbtn.primary:hover { background: #0d9488; }
    .dbtn.green { border-color: #10b981; color: #10b981; }
    .dbtn.green:hover { background: #f0fdf4; }

    /* ════════════════════════════════════════════════════════
       MODALS
    ════════════════════════════════════════════════════════ */
    .modal-overlay {
      position: fixed; inset: 0; background: rgba(0,0,0,.35);
      display: flex; align-items: center; justify-content: center;
      opacity: 0; pointer-events: none; transition: opacity .2s; z-index: 1100;
    }
    .modal-overlay.open { opacity: 1; pointer-events: all; }
    .modal {
      background: #fff; border-radius: 14px; padding: 2rem;
      width: 420px; max-width: 95vw; text-align: center;
      box-shadow: 0 20px 60px rgba(0,0,0,.18);
      transform: scale(0.97); transition: transform .2s;
    }
    .modal-overlay.open .modal { transform: scale(1); }
    .modal-icon { width: 52px; height: 52px; border-radius: 50%; margin: 0 auto 1rem; display: flex; align-items: center; justify-content: center; font-size: 1.4rem; }
    .modal-icon.danger { background: #fff5f5; color: #ef4444; }
    .modal-title { margin: 0 0 0.6rem; font-size: 1.1rem; font-weight: 700; color: #212529; }
    .modal-body { font-size: 0.86rem; color: #6c757d; margin: 0 0 1.4rem; line-height: 1.6; }
    .modal-body strong { color: #212529; }
    .modal-body strong.red { color: #dc2626; }
    .modal-actions { display: flex; gap: 0.6rem; justify-content: flex-end; }
    .mbtn {
      border-radius: 8px; padding: 0.55rem 1.1rem; font-size: 0.84rem; font-weight: 600;
      cursor: pointer; border: none; transition: all .15s;
    }
    .mbtn.ghost { background: #f8f9fa; color: #6c757d; border: 1px solid #dee2e6; }
    .mbtn.ghost:hover { border-color: #adb5bd; color: #212529; }
    .mbtn.danger { background: #ef4444; color: #fff; }
    .mbtn.danger:hover { background: #dc2626; }
    .mbtn.primary { background: #10b981; color: #fff; }
    .mbtn.primary:hover { background: #0d9488; }
    .mbtn.teal { background: #0d9488; color: #fff; }
    .mbtn.teal:hover { background: #0f766e; }

    /* New Patient Modal */
    .modal-form { text-align: left; width: 560px; padding: 1.5rem; }
    .modal-header { display: flex; align-items: center; justify-content: space-between; margin-bottom: 1.2rem; }
    .modal-header h3 { margin: 0; font-size: 1.1rem; font-weight: 700; color: #212529; }
    .form-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 0.8rem; margin-bottom: 1.2rem; }
    .modal-form .fgroup input,
    .modal-form .fgroup select {
      background: #f8f9fa; border: 1px solid #dee2e6; border-radius: 8px;
      padding: 0.5rem 0.75rem; font-size: 0.84rem; color: #212529;
      outline: none; width: 100%; box-sizing: border-box; transition: border-color .15s;
    }
    .modal-form .fgroup input:focus,
    .modal-form .fgroup select:focus { border-color: #10b981; background: #fff; }
    .modal-form .fgroup label { font-size: 0.75rem; font-weight: 600; color: #6c757d; }
    .modal-form .modal-actions { border-top: 1px solid #f1f3f4; padding-top: 1rem; }

    @media (max-width: 768px) {
      .patients-page { padding: 1rem; }
      .header-right { flex-wrap: wrap; }
      .filter-chips { display: none; }
      .kpi-row { grid-template-columns: 1fr 1fr; }
    }
  `]
})
export class PatientsPage implements OnInit {
  // ─── State ───────────────────────────────────────────────
  search = '';
  showFilters = false;
  drawerOpen = false;
  drawerPatient: PatientRow | null = null;
  newPatientModal = false;
  deleteModal: { open: boolean; patient: PatientRow | null } = { open: false, patient: null };

  activeStatusFilter = '';
  sortField: SortField = '';
  sortDir: SortDir = 'asc';

  currentPage = 1;
  pageSize = 10;

  filters = { gender: '', due: '', caseType: '', ageGroup: '', flag: '' };

  newPt: NewPatientPayload = { firstName: '', lastName: '', phone: '', birthDate: '', gender: '', email: '' };

  // ─── Status filter options ────────────────────────────────
  statusFilters = [
    { label: 'All', val: '', dotCls: '' },
    { label: 'Active', val: 'active', dotCls: 'dot-green' },
    { label: 'New', val: 'new', dotCls: 'dot-blue' },
    { label: 'In Treatment', val: 'in-treatment', dotCls: 'dot-teal' },
    { label: 'Has Due', val: '__due__', dotCls: 'dot-red' },
  ];

  // ─── Data ────────────────────────────────────────────────
  rows: PatientRow[] = [
    { no: 1, regDate: '27-09-25', regTime: '1:04 AM', name: 'Dheeraj T', phone: '9539192684', patientId: 'C66E4', gender: 'Male', age: 32, visit: 18, due: 91897, statusText: 'Due: INR 91897', isNewCase: false, status: 'active', lastVisit: '15 May 2025', hasAllergy: true },
    { no: 2, regDate: '27-09-25', regTime: '1:12 AM', name: 'Majid', phone: '8129634727', patientId: 'B20F8', gender: 'Male', age: 29, visit: 1, due: 0, statusText: 'New Case', isNewCase: true, status: 'new' },
    { no: 3, regDate: '27-09-25', regTime: '10:48 AM', name: 'Shahabas', phone: '7356382633', patientId: '34588', gender: 'Male', age: 41, visit: 4, due: 300, statusText: 'Due: INR 300', isNewCase: false, status: 'in-treatment', hasInsurance: true },
    { no: 4, regDate: '27-09-25', regTime: '11:34 AM', name: 'Harshad', phone: '9995960143', patientId: '4F08D', gender: 'Male', age: 35, visit: 12, due: 500, statusText: 'Due: INR 500', isNewCase: false, status: 'active' },
    { no: 5, regDate: '28-09-25', regTime: '9:27 AM', name: 'Bunu', phone: '9207893110', patientId: 'E563A', gender: 'Male', age: 30, visit: 1, due: 0, statusText: 'New Case', isNewCase: true, status: 'new' },
    { no: 6, regDate: '02-10-25', regTime: '3:38 PM', name: 'Shahin', phone: '9048123588', patientId: '43197', gender: 'Male', age: 46, visit: 1, due: 0, statusText: 'New Case', isNewCase: true, status: 'new' },
    { no: 7, regDate: '06-10-25', regTime: '12:49 PM', name: 'Eva', phone: '9995960143', patientId: '84F4A', gender: 'Female', age: 8, visit: 5, due: 4388, statusText: 'Due: INR 4388', isNewCase: false, status: 'in-treatment', isPediatric: true, hasAllergy: true },
    { no: 8, regDate: '09-10-25', regTime: '1:19 PM', name: 'Navyatha', phone: '7902235643', patientId: '57081', gender: 'Female', age: 26, visit: 2, due: 0, statusText: 'New Case', isNewCase: true, status: 'new' },
  ];

  filteredRows: PatientRow[] = [];
  pagedRows: PatientRow[] = [];

  // ─── KPI cards ───────────────────────────────────────────
  get kpiCards() {
    const total = this.rows.length;
    const newThisMonth = this.rows.filter(r => r.isNewCase).length;
    const withDue = this.rows.filter(r => r.due > 0).length;
    const active = this.rows.filter(r => r.status === 'active' || r.status === 'in-treatment').length;
    return [
      { label: 'Total Patients', value: total, icon: '👥', bg: '#e6f9f4' },
      { label: 'New This Month', value: newThisMonth, icon: '✨', bg: '#dbeafe' },
      { label: 'Active Cases', value: active, icon: '⚕', bg: '#dcfce7' },
      { label: 'Patients with Due', value: withDue, icon: '₹', bg: '#fff5f5' },
    ];
  }

  // ─── Computed pagination ──────────────────────────────────
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

  get activeFilterCount() {
    return Object.values(this.filters).filter(v => v !== '').length + (this.activeStatusFilter && this.activeStatusFilter !== '__due__' ? 1 : 0);
  }

  // ─── Lifecycle ───────────────────────────────────────────
  constructor(private readonly router: Router) {}

  ngOnInit() { this.applyFilter(); }

  // ─── Filter / Sort / Page ────────────────────────────────
  applyFilter() {
    const q = this.search.toLowerCase().trim();
    let result = this.rows.filter(r => {
      const matchQ = !q || r.name.toLowerCase().includes(q) || r.phone.includes(q) || r.patientId.toLowerCase().includes(q) || (r.email?.toLowerCase().includes(q) ?? false);
      const matchStatus = !this.activeStatusFilter ? true
        : this.activeStatusFilter === '__due__' ? r.due > 0
        : r.status === this.activeStatusFilter;
      const matchGender = !this.filters.gender || r.gender === this.filters.gender;
      const matchDue = !this.filters.due ? true
        : this.filters.due === 'any' ? r.due > 0
        : this.filters.due === 'none' ? r.due === 0
        : this.filters.due === 'high' ? r.due > 5000
        : true;
      const matchCase = !this.filters.caseType ? true
        : this.filters.caseType === 'new' ? r.isNewCase
        : !r.isNewCase;
      const matchAge = !this.filters.ageGroup ? true
        : this.filters.ageGroup === 'pediatric' ? r.age < 18
        : this.filters.ageGroup === 'adult' ? (r.age >= 18 && r.age <= 60)
        : r.age > 60;
      const matchFlag = !this.filters.flag ? true
        : this.filters.flag === 'allergy' ? !!r.hasAllergy
        : !!r.hasInsurance;
      return matchQ && matchStatus && matchGender && matchDue && matchCase && matchAge && matchFlag;
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

  updatePage() {
    this.pagedRows = this.filteredRows.slice(this.pageStart, this.pageEnd);
  }

  sort(field: SortField) {
    if (this.sortField === field) this.sortDir = this.sortDir === 'asc' ? 'desc' : 'asc';
    else { this.sortField = field; this.sortDir = 'asc'; }
    this.applyFilter();
  }

  sortIcon(field: SortField) {
    if (this.sortField !== field) return 'pi-sort-alt';
    return this.sortDir === 'asc' ? 'pi-sort-amount-up' : 'pi-sort-amount-down';
  }

  setStatusFilter(val: string) {
    this.activeStatusFilter = val;
    this.applyFilter();
  }

  clearSearch() { this.search = ''; this.applyFilter(); }

  resetFilters() {
    this.filters = { gender: '', due: '', caseType: '', ageGroup: '', flag: '' };
    this.activeStatusFilter = '';
    this.applyFilter();
  }

  goPage(p: number) {
    if (p < 1 || p > this.totalPages) return;
    this.currentPage = p;
    this.updatePage();
  }

  onPageSizeChange() { this.currentPage = 1; this.updatePage(); }

  // ─── Selection ───────────────────────────────────────────
  toggleSelectAll(e: Event) {
    const checked = (e.target as HTMLInputElement).checked;
    this.pagedRows.forEach(r => r.selected = checked);
    this.onRowSelect();
  }

  onRowSelect() { /* triggers change detection via selectedCount getter */ }

  clearSelection() { this.rows.forEach(r => r.selected = false); }

  // ─── Drawer ──────────────────────────────────────────────
  openDrawer(p: PatientRow) { this.drawerPatient = p; this.drawerOpen = true; }
  closeDrawer() { this.drawerOpen = false; }

  // ─── CRUD ────────────────────────────────────────────────
  onImportPatient() { console.log('Import patient CSV'); }

  onNewPatient() {
    this.newPt = { firstName: '', lastName: '', phone: '', birthDate: '', gender: '', email: '' };
    this.newPatientModal = true;
  }

  saveNewPatient() {
    if (!this.newPt.firstName || !this.newPt.phone) return;
    const now = new Date();
    const nextNo = Math.max(...this.rows.map(r => r.no), 0) + 1;
    const fullName = `${this.newPt.firstName} ${this.newPt.lastName}`.trim();
    const newRow: PatientRow = {
      no: nextNo,
      regDate: now.toLocaleDateString('en-GB').replace(/\//g, '-'),
      regTime: now.toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit' }),
      name: fullName,
      phone: this.newPt.phone || '—',
      patientId: Math.random().toString(16).slice(2, 7).toUpperCase(),
      gender: this.newPt.gender || '—',
      age: this.calculateAge(this.newPt.birthDate),
      visit: 1, due: 0,
      statusText: 'New Case', isNewCase: true, status: 'new',
      email: this.newPt.email,
    };
    this.rows = [newRow, ...this.rows];
    this.newPatientModal = false;
    this.applyFilter();
  }

  saveAndBook() { this.saveNewPatient(); /* navigate to booking */ }

  confirmDelete(p: PatientRow) { this.deleteModal = { open: true, patient: p }; }
  closeDeleteModal() { this.deleteModal = { open: false, patient: null }; }

  executeDelete() {
    if (!this.deleteModal.patient) return;
    const id = this.deleteModal.patient.no;
    this.rows = this.rows.filter(r => r.no !== id);
    this.closeDeleteModal();
    if (this.drawerPatient?.no === id) this.closeDrawer();
    this.applyFilter();
  }

  openPatient(p: PatientRow) { this.router.navigate(['/app/patient-profile', p.no]); }
  editPatient(p: PatientRow) { console.log('Edit', p.no); }
  openVisits(p: PatientRow) { console.log('Visits', p.no); }
  openBilling(p: PatientRow) { console.log('Billing', p.no); }

  // ─── Bulk ────────────────────────────────────────────────
  bulkSMS() { console.log('Bulk SMS', this.selectedCount); }
  bulkEmail() { console.log('Bulk Email', this.selectedCount); }
  bulkExport() { console.log('Bulk Export', this.selectedCount); }
  bulkDeactivate() { this.rows.filter(r => r.selected).forEach(r => r.status = 'inactive'); this.clearSelection(); this.applyFilter(); }
  exportCSV() { console.log('Export CSV'); }

  // ─── Utils ───────────────────────────────────────────────
  initials(name: string) { return name.split(' ').map(n => n[0]).slice(0, 2).join('').toUpperCase(); }

  statusLabel(s: PatientRow['status']) {
    return { new: 'New', active: 'Active', 'in-treatment': 'In Treatment', completed: 'Completed', inactive: 'Inactive' }[s];
  }

  copyPhone(phone: string) { navigator.clipboard?.writeText(phone); }
  openWhatsApp(phone: string) { window.open(`https://wa.me/91${phone}`, '_blank'); }

  private calculateAge(birthDate: string): number {
    if (!birthDate) return 0;
    const dob = new Date(birthDate);
    if (isNaN(dob.getTime())) return 0;
    const today = new Date();
    let age = today.getFullYear() - dob.getFullYear();
    const passed = today.getMonth() > dob.getMonth() || (today.getMonth() === dob.getMonth() && today.getDate() >= dob.getDate());
    return (passed ? age : age - 1) > 0 ? (passed ? age : age - 1) : 0;
  }
}