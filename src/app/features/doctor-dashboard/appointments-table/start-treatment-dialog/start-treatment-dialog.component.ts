// src/app/features/doctor-dashboard/appointments-table/start-treatment-dialog/start-treatment-dialog.component.ts
import { Component, EventEmitter, Input, Output } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ButtonModule } from 'primeng/button';
import { DialogModule } from 'primeng/dialog';
import { TagModule } from 'primeng/tag';
import { TooltipModule } from 'primeng/tooltip';
import { Appointment } from '../appointments-table.component';
import { Router } from '@angular/router';

export interface TreatmentPlan {
  id: number;
  doctor: string;
  date: string;
  chiefComplaints: string;
  onExamination: string;
  tooth: number;
  treatments: TreatmentItem[];
}

export interface TreatmentItem {
  teeth: number;
  lastUpdated: string;
  treatment: string;
  treatmentFull: string;
  status: 'Completed' | 'In Progress' | 'Pending';
}

@Component({
  selector: 'app-start-treatment-dialog',
  standalone: true,
  imports: [CommonModule, ButtonModule, DialogModule, TagModule, TooltipModule],
  template: `
    <p-dialog
      [(visible)]="visible"
      (visibleChange)="visibleChange.emit($event)"
      [modal]="true"
      [draggable]="false"
      [resizable]="false"
      styleClass="treatment-dialog"
      [style]="{ width: '860px', maxWidth: '95vw' }"
      [baseZIndex]="10000"
    >
      <!-- Header -->
      <ng-template pTemplate="header">
        <div class="flex align-items-center justify-content-between w-full pr-2">
          <div>
            <h2 class="text-xl font-bold m-0">Start Treatment</h2>
            <p class="text-500 text-sm mt-1 mb-0">
              Continue with existing treatment plans or start new plan
            </p>
          </div>
          <p-button
            label="Start New Treatment"
            styleClass="teal-btn"
            (onClick)="onStartNew()"
          ></p-button>
        </div>
      </ng-template>

      <!-- Body -->
      <div class="treatment-dialog-body">

        <!-- Section title -->
        <div class="mb-3">
          <span class="font-bold text-base">Treatment Plans</span>
        </div>

        <!-- Plans grid — padding-top to give room for the floating hint -->
        <div class="plans-grid">

          <div
            *ngFor="let plan of treatmentPlans"
            class="plan-card-wrapper"
            (mouseenter)="hoveredPlanId = plan.id"
            (mouseleave)="hoveredPlanId = null"
          >
            <!-- Hint floats above THIS wrapper, centered -->
            <div
              class="card-hover-hint"
              [class.hint-visible]="hoveredPlanId === plan.id"
            >
              Click to view the treatment plans
            </div>

            <!-- Actual card -->
            <div
              class="plan-card"
              [class.plan-card-hovered]="hoveredPlanId === plan.id"
              (click)="onSelectPlan(plan)"
            >
              <!-- Card header: doctor + date -->
              <div class="plan-card-header">
                <span class="font-semibold text-sm">Dr: {{ plan.doctor }}</span>
                <span class="text-500 text-sm">{{ plan.date }}</span>
              </div>

              <!-- Chief complaints -->
              <div class="plan-section">
                <div class="plan-label">Chief Complaints</div>
                <div class="plan-value font-semibold">{{ plan.chiefComplaints }}</div>
              </div>

              <!-- On Examination + Tooth -->
              <div class="plan-exam-row">
                <div>
                  <div class="plan-label">On Examination</div>
                  <div class="plan-value font-semibold">{{ plan.onExamination }}</div>
                </div>
                <div class="text-right">
                  <div class="plan-label">Tooth</div>
                  <div class="plan-value font-semibold">{{ plan.tooth }}</div>
                </div>
              </div>

              <!-- Treatment items -->
              <div class="treatment-items">
                <div
                  *ngFor="let item of plan.treatments"
                  class="treatment-item"
                  [pTooltip]="item.treatmentFull"
                  tooltipPosition="top"
                  (click)="$event.stopPropagation()"
                >
                  <div class="treatment-item-row">
                    <span class="text-500 text-xs">Teeth {{ item.teeth }}</span>
                    <span class="text-500 text-xs">Last updated {{ item.lastUpdated }}</span>
                  </div>
                  <div class="treatment-item-row mt-1">
                    <span class="treatment-row-left">
                      <span class="text-400 text-sm mr-1">Treatment</span>
                      <span class="font-medium text-sm treatment-name">{{ item.treatment }}</span>
                    </span>
                    <span class="treatment-row-right">
                      <span class="text-400 text-xs mr-1">Status</span>
                      <span
                        class="status-badge"
                        [ngClass]="{
                          'badge-completed':  item.status === 'Completed',
                          'badge-inprogress': item.status === 'In Progress',
                          'badge-pending':    item.status === 'Pending'
                        }"
                      >{{ item.status }}</span>
                    </span>
                  </div>
                </div>
              </div>

              <!-- Continue with this case button -->
              <div class="plan-card-footer">
                <p-button
                  label="Continue with this case"
                  styleClass="continue-btn"
                  [outlined]="true"
                  (onClick)="onContinue(plan, $event)"
                ></p-button>
              </div>

            </div>
            <!-- /plan-card -->
          </div>
          <!-- /plan-card-wrapper -->

        </div>
        <!-- /plans-grid -->

      </div>
    </p-dialog>
  `,
  styles: [`
    /* ── Dialog chrome ───────────────────────────────────────────── */
    :host ::ng-deep .treatment-dialog .p-dialog-header {
      padding: 1.25rem 1.5rem 0.75rem;
      border-bottom: 1px solid var(--surface-200);
    }

    :host ::ng-deep .treatment-dialog .p-dialog-content {
      padding: 1.5rem 1.5rem 1.5rem;
      max-height: 72vh;
      overflow-y: auto;
    }

    /* ── Buttons ─────────────────────────────────────────────────── */
    :host ::ng-deep .teal-btn.p-button {
      background: #2dd4bf;
      border-color: #2dd4bf;
      color: #fff;
      font-weight: 600;
      border-radius: 8px;
      &:hover {
        background: #14b8a6 !important;
        border-color: #14b8a6 !important;
      }
    }

    :host ::ng-deep .continue-btn.p-button {
      width: 100%;
      justify-content: center;
      border-color: var(--surface-300);
      color: var(--text-color);
      font-weight: 500;
      border-radius: 8px;
      &:hover {
        background: var(--surface-100) !important;
        border-color: #2dd4bf !important;
        color: #0f766e !important;
      }
    }

    /* ── Grid ────────────────────────────────────────────────────── */
    .plans-grid {
      display: grid;
      grid-template-columns: 1fr 1fr;
      gap: 1rem;
      align-items: start;
      /* top padding so the absolute hint has room above each card */
      padding-top: 2.2rem;
    }

    @media (max-width: 600px) {
      .plans-grid { grid-template-columns: 1fr; }
    }

    /* ── Wrapper (positioning parent for the hint) ───────────────── */
    .plan-card-wrapper {
      position: relative;   /* <-- hint is positioned relative to THIS */
    }

    /* ── Hover hint ──────────────────────────────────────────────── */
    .card-hover-hint {
      position: absolute;
      /* sit just above the card wrapper */
      bottom: calc(100% + 6px);
      left: 50%;
      transform: translateX(-50%);

      background: var(--surface-0);
      border: 1px solid var(--surface-300);
      border-radius: 8px;
      padding: 0.3rem 1rem;
      font-size: 0.8rem;
      color: var(--text-color-secondary);
      white-space: nowrap;
      box-shadow: 0 2px 8px rgba(0, 0, 0, 0.08);

      /* hidden by default, fade in on hover */
      opacity: 0;
      pointer-events: none;
      transition: opacity 0.18s ease;
      z-index: 20;
    }

    .card-hover-hint.hint-visible {
      opacity: 1;
    }

    /* ── Plan card ───────────────────────────────────────────────── */
    .plan-card {
      border: 1px solid var(--surface-200);
      border-radius: 12px;
      padding: 1rem;
      cursor: pointer;
      background: var(--surface-0);
      display: flex;
      flex-direction: column;
      transition: box-shadow 0.15s, border-color 0.15s;
    }

    .plan-card-hovered {
      box-shadow: 0 2px 14px rgba(45, 212, 191, 0.15);
      border-color: #a7f3d0;
    }

    .plan-card-header {
      display: flex;
      justify-content: space-between;
      align-items: center;
      margin-bottom: 0.75rem;
    }

    .plan-label {
      font-size: 0.7rem;
      color: var(--text-color-secondary);
      margin-bottom: 0.2rem;
      letter-spacing: 0.01em;
    }

    .plan-value {
      font-size: 0.9rem;
      color: var(--text-color);
    }

    .plan-section {
      margin-bottom: 0.65rem;
    }

    .plan-exam-row {
      display: flex;
      justify-content: space-between;
      margin-bottom: 0.75rem;
      padding-bottom: 0.75rem;
      border-bottom: 1px solid var(--surface-100);
    }

    /* ── Treatment items ─────────────────────────────────────────── */
    .treatment-items {
      display: flex;
      flex-direction: column;
      gap: 0.5rem;
      margin-bottom: 0.75rem;
    }

    .treatment-item {
      padding: 0.5rem 0.65rem;
      border: 1px solid var(--surface-200);
      border-radius: 8px;
      background: var(--surface-50);
      cursor: default;
      &:hover { background: var(--surface-100); }
    }

    .treatment-item-row {
      display: flex;
      justify-content: space-between;
      align-items: center;
    }

    .treatment-row-left {
      display: flex;
      align-items: center;
      gap: 0.25rem;
      min-width: 0;
    }

    .treatment-name {
      white-space: nowrap;
      overflow: hidden;
      text-overflow: ellipsis;
      max-width: 130px;
      display: inline-block;
    }

    .treatment-row-right {
      display: flex;
      align-items: center;
      gap: 0.25rem;
      flex-shrink: 0;
    }

    /* ── Status badges (outlined, matching screenshot) ───────────── */
    .status-badge {
      font-size: 0.72rem;
      font-weight: 500;
      padding: 0.15rem 0.65rem;
      border-radius: 20px;
      border: 1.5px solid;
      white-space: nowrap;
    }

    .badge-completed  { color: #0d9488; border-color: #0d9488; background: transparent; }
    .badge-inprogress { color: #d97706; border-color: #d97706; background: transparent; }
    .badge-pending    { color: #6366f1; border-color: #6366f1; background: transparent; }

    /* ── Card footer ─────────────────────────────────────────────── */
    .plan-card-footer {
      margin-top: 0.5rem;
    }
  `]
})
export class StartTreatmentDialogComponent {
  @Input() visible = false;
  @Input() appointment: Appointment | null = null;
  @Output() visibleChange = new EventEmitter<boolean>();
  @Output() startNewTreatment = new EventEmitter<Appointment | null>();
  @Output() selectPlan = new EventEmitter<TreatmentPlan>();
  @Output() continuePlan = new EventEmitter<TreatmentPlan>();

  hoveredPlanId: number | null = null;

  treatmentPlans: TreatmentPlan[] = [
    {
      id: 1,
      doctor: 'Arjun',
      date: 'Nov 3, 2025',
      chiefComplaints: 'Irregularly placed tooth',
      onExamination: 'TOP Negative',
      tooth: 41,
      treatments: [
        { teeth: 16, lastUpdated: 'Nov 5, 2025', treatment: 'CROWN LENGTHE...', treatmentFull: 'CROWN LENGTHENING',           status: 'Completed'   },
        { teeth: 11, lastUpdated: 'Nov 5, 2025', treatment: 'INCISION AND DRA...', treatmentFull: 'INCISION AND DRAINAGE',    status: 'Completed'   },
        { teeth: 21, lastUpdated: 'Nov 5, 2025', treatment: 'EXTRACTION OF DI...', treatmentFull: 'EXTRACTION OF DIFFICULT TOOTH', status: 'Completed' },
        { teeth: 41, lastUpdated: 'Nov 5, 2025', treatment: 'EXTRACTION OF TH...', treatmentFull: 'EXTRACTION OF TOOTH',     status: 'In Progress' },
      ]
    },
    {
      id: 2,
      doctor: 'Arjun',
      date: 'Oct 4, 2025',
      chiefComplaints: 'Sensitivity, Broken tooth, Pain on having food',
      onExamination: 'TOP positive',
      tooth: 12,
      treatments: [
        { teeth: 18, lastUpdated: 'Nov 5, 2025', treatment: 'CROWN LENGTHE...',    treatmentFull: 'CROWN LENGTHENING',              status: 'Completed' },
        { teeth: 21, lastUpdated: 'Oct 5, 2025', treatment: 'EXTRACTION OF DI...', treatmentFull: 'EXTRACTION OF DIFFICULT TOOTH',  status: 'Completed' },
        { teeth: 23, lastUpdated: 'Nov 3, 2025', treatment: 'RCT',                 treatmentFull: 'ROOT CANAL TREATMENT',           status: 'Completed' },
        { teeth: 31, lastUpdated: 'Nov 5, 2025', treatment: 'INCISION AND DRA...', treatmentFull: 'INCISION AND DRAINAGE',          status: 'Completed' },
        { teeth: 12, lastUpdated: 'Nov 5, 2025', treatment: 'CROWN LENGTHE...',    treatmentFull: 'CROWN LENGTHENING',              status: 'Completed' },
      ]
    }
  ];

  constructor(private router: Router) {}

  getItemSeverity(status: string): 'success' | 'warn' | 'info' {
    const map: Record<string, 'success' | 'warn' | 'info'> = {
      'Completed':  'success',
      'In Progress': 'warn',
      'Pending':    'info'
    };
    return map[status] ?? 'info';
  }

  onStartNew(): void {
    this.startNewTreatment.emit(this.appointment);
    this.visible = false;
    this.visibleChange.emit(false);
  }

  onSelectPlan(plan: TreatmentPlan): void {
    this.selectPlan.emit(plan);
  }

  onContinue(plan: TreatmentPlan, event: Event): void {
    event.stopPropagation();
  this.continuePlan.emit(plan);
  this.visible = false;
  this.visibleChange.emit(false);
  this.router.navigate(['/app/patient-profile', this.appointment?.no], {
    state: { appointment: this.appointment, plan }
  });
  }
}
