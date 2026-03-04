// src/app/features/patient-profile/dental-chart/dental-chart.component.ts
import { Component, Input } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ToothComponent } from './tooth/tooth.component';
import { Tooth, DentitionMode } from '../../../shared/models/patient.model';
import {
  TreatmentPlanPanelComponent,
  TreatmentPlanPayload,
} from './treatment-plan-panel/treatment-plan-panel.component';

const UPPER_ORDER = [18,17,16,15,14,13,12,11,21,22,23,24,25,26,27,28];
const LOWER_ORDER = [48,47,46,45,44,43,42,41,31,32,33,34,35,36,37,38];

const UPPER_RIGHT = new Set([11,12,13,14,15,16,17,18]);
const UPPER_LEFT  = new Set([21,22,23,24,25,26,27,28]);
const LOWER_RIGHT = new Set([41,42,43,44,45,46,47,48]);
const LOWER_LEFT  = new Set([31,32,33,34,35,36,37,38]);
const UPPER_ALL   = new Set([...UPPER_RIGHT, ...UPPER_LEFT]);
const LOWER_ALL   = new Set([...LOWER_RIGHT, ...LOWER_LEFT]);
const ALL_TEETH   = new Set([...UPPER_ALL,   ...LOWER_ALL]);

type QuadrantFilter = 'Full Mouth'|'Upper'|'Lower'|'Upper Right'|'Upper Left'|'Lower Right'|'Lower Left';

const QUADRANT_MAP: Record<QuadrantFilter, Set<number>> = {
  'Full Mouth':  ALL_TEETH,
  'Upper':       UPPER_ALL,
  'Lower':       LOWER_ALL,
  'Upper Right': UPPER_RIGHT,
  'Upper Left':  UPPER_LEFT,
  'Lower Right': LOWER_RIGHT,
  'Lower Left':  LOWER_LEFT,
};

@Component({
  selector: 'app-dental-chart',
  standalone: true,
  imports: [CommonModule, ToothComponent, TreatmentPlanPanelComponent],
  template: `
    <div class="dental-chart-card">

      <!-- ── Row 1: title + multi-select toggle ── -->
      <div class="top-row">
        <h3 class="chart-title">Dental Chart & Treatment Plans</h3>
        <label class="multi-toggle" (click)="onToggleMultiSelect()">
          <span class="toggle-label">Multi select</span>
          <div class="toggle" [class.toggle-on]="multiSelect" role="switch" [attr.aria-checked]="multiSelect">
            <div class="knob"></div>
          </div>
        </label>
      </div>

      <!-- ── Row 2: mode tabs (Adult/Pedo/Mixed) ── -->
      <div class="mode-row">
        <div class="mode-tabs">
          <button *ngFor="let m of modes" class="mode-btn"
            [class.mode-active]="activeMode === m" (click)="activeMode = m">
            {{ m }}
          </button>
        </div>
      </div>

      <!-- ── Row 3: quadrant filters + action buttons (multi-select only) ── -->
      <div class="filter-row" *ngIf="multiSelect">
        <div class="quadrant-filters">
          <button *ngFor="let q of quadrantFilters" class="qbtn"
            [class.qbtn-active]="activeQuadrant === q"
            (click)="applyQuadrantFilter(q)">
            {{ q }}
          </button>
        </div>

        <div class="action-btns" *ngIf="selectedSet.size > 0">
          <button class="btn-clear" (click)="clearSelection()">Clear Selection</button>
          <button class="btn-add" (click)="openPanel()">
            <span>⊕</span> Add Treatment
          </button>
        </div>
      </div>

      <!-- ── Upper arch ── -->
      <div class="arch">
        <app-tooth *ngFor="let t of upperTeeth" [tooth]="t"
          [selected]="selectedSet.has(t.number)"
          (click)="handleToothClick(t)">
        </app-tooth>
      </div>

      <div class="arch-gap"></div>

      <!-- ── Lower arch ── -->
      <div class="arch">
        <app-tooth *ngFor="let t of lowerTeeth" [tooth]="t"
          [selected]="selectedSet.has(t.number)"
          (click)="handleToothClick(t)">
        </app-tooth>
      </div>

      <!-- ── Legend ── -->
      <div class="legend">
        <div class="legend-item"><span class="dot dot-teal"></span>Treatment Taken Before</div>
        <div class="legend-item"><span class="dot dot-grey"></span>Teeth Removed</div>
        <div class="legend-item"><span class="dot dot-yellow"></span>Recommended To Take Treatment</div>
      </div>
    </div>

    <!-- ── Treatment Plan Panel ── -->
    <app-treatment-plan-panel
      [(visible)]="panelVisible"
      [tooth]="activeTooth"
      [selectedTeethNumbers]="selectedTeethArray"
      (planAdded)="onPlanAdded($event)"
    />
  `,
  styles: [`
    .dental-chart-card {
      background: var(--surface-0);
      border: 1px solid var(--surface-200);
      border-radius: 14px;
      padding: 1.5rem;
    }

    /* Row 1 */
    .top-row {
      display: flex;
      align-items: center;
      justify-content: space-between;
      margin-bottom: 1rem;
    }
    .chart-title { font-size: 1rem; font-weight: 600; margin: 0; }

    /* Row 2 */
    .mode-row { margin-bottom: 1rem; }
    .mode-tabs { display: flex; gap: 0.4rem; }
    .mode-btn {
      padding: 0.3rem 1.1rem; border-radius: 8px; border: none;
      background: transparent; font-size: 0.88rem; font-weight: 500;
      cursor: pointer; color: var(--text-color-secondary); transition: all 0.15s;
      &:hover { background: var(--surface-100); }
    }
    .mode-active { background: #2dd4bf !important; color: #fff !important; font-weight: 600; }

    /* Multi-select toggle */
    .multi-toggle {
      display: flex; align-items: center; gap: 0.6rem;
      cursor: pointer; user-select: none;
    }
    .toggle-label { font-size: 0.875rem; color: var(--text-color-secondary); }
    .toggle {
      width: 44px; height: 24px; background: var(--surface-300);
      border-radius: 12px; position: relative; transition: background 0.2s; flex-shrink: 0;
      &.toggle-on { background: #2dd4bf; }
    }
    .knob {
      position: absolute; top: 3px; left: 3px;
      width: 18px; height: 18px; background: #fff; border-radius: 50%;
      transition: left 0.2s; box-shadow: 0 1px 4px rgba(0,0,0,0.18);
    }
    .toggle.toggle-on .knob { left: 23px; }

    /* Row 3 — filters + actions */
    .filter-row {
      display: flex;
      align-items: center;
      justify-content: space-between;
      flex-wrap: wrap;
      gap: 0.75rem;
      margin-bottom: 1.25rem;
    }
    .quadrant-filters { display: flex; gap: 0.5rem; flex-wrap: wrap; }
    .qbtn {
      padding: 0.4rem 1.1rem;
      border: 2px solid #9ca3af;
      border-radius: 20px;
      background: #fff;
      color: #374151;
      font-size: 0.82rem;
      font-weight: 500;
      cursor: pointer;
      transition: all 0.15s;
      &:hover { border-color: #2dd4bf; color: #0f766e; }
    }
    .qbtn-active {
      border-color: #2dd4bf !important;
      background: #2dd4bf !important;
      color: #fff !important;
    }

    /* Action buttons */
    .action-btns { display: flex; gap: 0.75rem; align-items: center; flex-shrink: 0; }
    .btn-clear {
      padding: 0.5rem 1.25rem;
      border: 1.5px solid #ef4444; border-radius: 10px;
      background: #fff; color: #ef4444;
      font-size: 0.85rem; font-weight: 600; cursor: pointer;
      transition: all 0.15s;
      &:hover { background: #fef2f2; }
    }
    .btn-add {
      padding: 0.5rem 1.4rem;
      border: none; border-radius: 10px;
      background: #2dd4bf; color: #fff;
      font-size: 0.85rem; font-weight: 700; cursor: pointer;
      display: flex; align-items: center; gap: 0.4rem;
      transition: background 0.15s;
      &:hover { background: #14b8a6; }
    }

    /* Arches */
    .arch {
      display: flex; justify-content: center; align-items: flex-end;
      gap: 1px; flex-wrap: nowrap; overflow-x: auto; padding-bottom: 2px;
    }
    .arch-gap { height: 20px; }

    /* Legend */
    .legend {
      display: flex; gap: 2rem; flex-wrap: wrap;
      margin-top: 1.5rem; padding-top: 1rem;
      border-top: 1px solid var(--surface-100);
    }
    .legend-item {
      display: flex; align-items: center; gap: 0.4rem;
      font-size: 0.78rem; color: var(--text-color-secondary);
    }
    .dot { width: 10px; height: 10px; border-radius: 50%; flex-shrink: 0; }
    .dot-teal   { background: #2dd4bf; }
    .dot-grey   { background: #9ca3af; }
    .dot-yellow { background: #fbbf24; }

    @media (max-width: 768px) {
      .arch { gap: 0; }
      .legend { gap: 1rem; }
      .filter-row { flex-direction: column; align-items: flex-start; }
    }
  `]
})
export class DentalChartComponent {
  @Input() set teeth(val: Tooth[]) {
    this._teeth = val;
    this._toothMap = new Map(val.map(t => [t.number, t]));
  }

  modes: DentitionMode[] = ['Adult', 'Pedo', 'Mixed'];
  activeMode: DentitionMode = 'Adult';

  multiSelect = false;
  selectedSet = new Set<number>();
  activeQuadrant: QuadrantFilter | null = null;

  panelVisible = false;
  activeTooth: Tooth | null = null;

  readonly quadrantFilters: QuadrantFilter[] = [
    'Full Mouth','Upper','Lower','Upper Right','Upper Left','Lower Right','Lower Left',
  ];

  private _teeth: Tooth[] = [];
  private _toothMap = new Map<number, Tooth>();

  private toothOrDefault(n: number): Tooth {
    return this._toothMap.get(n) ?? { number: n, status: 'normal' };
  }

  get upperTeeth(): Tooth[] { return UPPER_ORDER.map(n => this.toothOrDefault(n)); }
  get lowerTeeth(): Tooth[] { return LOWER_ORDER.map(n => this.toothOrDefault(n)); }

  get selectedTeethArray(): number[] {
    return Array.from(this.selectedSet).sort((a, b) => a - b);
  }

  // ── Toggle multi-select ────────────────────────────────────────────────────
  onToggleMultiSelect(): void {
    this.multiSelect = !this.multiSelect;
    if (!this.multiSelect) {
      this.selectedSet = new Set();
      this.activeQuadrant = null;
    }
  }

  // ── Quadrant filter ────────────────────────────────────────────────────────
  applyQuadrantFilter(filter: QuadrantFilter): void {
    if (this.activeQuadrant === filter) {
      // Toggle off — deselect all
      this.activeQuadrant = null;
      this.selectedSet = new Set();
      return;
    }
    this.activeQuadrant = filter;
    this.selectedSet = new Set(QUADRANT_MAP[filter]);
  }

  // ── Individual tooth click ─────────────────────────────────────────────────
  handleToothClick(tooth: Tooth): void {
    if (this.multiSelect) {
      // Toggle individual tooth, clear quadrant shortcut highlight
      this.activeQuadrant = null;
      if (this.selectedSet.has(tooth.number)) {
        this.selectedSet.delete(tooth.number);
      } else {
        this.selectedSet.add(tooth.number);
      }
      this.selectedSet = new Set(this.selectedSet); // trigger change detection
    } else {
      // Single select → open panel immediately
      this.selectedSet = new Set([tooth.number]);
      this.activeTooth = tooth;
      this.panelVisible = true;
    }
  }

  // ── Open panel for current multi-selection ─────────────────────────────────
  openPanel(): void {
    if (this.selectedSet.size === 0) return;
    const first = this.selectedTeethArray[0];
    this.activeTooth = this.toothOrDefault(first);
    this.panelVisible = true;
  }

  // ── Clear selection ────────────────────────────────────────────────────────
  clearSelection(): void {
    this.selectedSet = new Set();
    this.activeQuadrant = null;
  }

  // ── Plan added ─────────────────────────────────────────────────────────────
  onPlanAdded(payload: TreatmentPlanPayload): void {
    console.log('Treatment plan:', payload);
    const numbers = payload.toothNumbers?.length ? payload.toothNumbers : [payload.toothNumber];
    numbers.forEach(n => {
      const existing = this._toothMap.get(n);
      if (existing) {
        const updated = { ...existing, status: 'recommended' as const };
        this._toothMap.set(n, updated);
        this._teeth = this._teeth.map(t => t.number === n ? updated : t);
      }
    });
    this.clearSelection();
  }
}