// src/app/features/patient-profile/dental-chart/dental-chart.component.ts
import { Component, Input } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ToothComponent } from './tooth/tooth.component';
import { Tooth, DentitionMode } from '../../../shared/models/patient.model';

// Display order — FDI, left to right on screen
const UPPER_ORDER = [18, 17, 16, 15, 14, 13, 12, 11,  21, 22, 23, 24, 25, 26, 27, 28];
const LOWER_ORDER = [48, 47, 46, 45, 44, 43, 42, 41,  31, 32, 33, 34, 35, 36, 37, 38];

@Component({
  selector: 'app-dental-chart',
  standalone: true,
  imports: [CommonModule, ToothComponent],
  template: `
    <div class="dental-chart-card">
      <h3 class="chart-title">Dental Chart & Treatment Plans</h3>

      <!-- Controls -->
      <div class="chart-controls">
        <div class="mode-tabs">
          <button
            *ngFor="let m of modes"
            class="mode-btn"
            [class.mode-active]="activeMode === m"
            (click)="activeMode = m"
          >{{ m }}</button>
        </div>

        <label class="multi-toggle">
          <span class="toggle-label">Multi select</span>
          <div
            class="toggle"
            [class.toggle-on]="multiSelect"
            (click)="multiSelect = !multiSelect"
            role="switch"
            [attr.aria-checked]="multiSelect"
          >
            <div class="knob"></div>
          </div>
        </label>
      </div>

      <!-- Upper arch -->
      <div class="arch">
        <app-tooth
          *ngFor="let t of upperTeeth"
          [tooth]="t"
          [selected]="selectedSet.has(t.number)"
          (click)="handleToothClick(t)"
        ></app-tooth>
      </div>

      <div class="arch-gap"></div>

      <!-- Lower arch -->
      <div class="arch">
        <app-tooth
          *ngFor="let t of lowerTeeth"
          [tooth]="t"
          [selected]="selectedSet.has(t.number)"
          (click)="handleToothClick(t)"
        ></app-tooth>
      </div>

      <!-- Legend -->
      <div class="legend">
        <div class="legend-item">
          <span class="dot dot-teal"></span>
          Treatment Taken Before
        </div>
        <div class="legend-item">
          <span class="dot dot-grey"></span>
          Teeth Removed
        </div>
        <div class="legend-item">
          <span class="dot dot-yellow"></span>
          Recommended To Take Treatment
        </div>
      </div>
    </div>
  `,
  styles: [`
    .dental-chart-card {
      background: var(--surface-0);
      border: 1px solid var(--surface-200);
      border-radius: 14px;
      padding: 1.5rem;
    }

    .chart-title {
      font-size: 1rem;
      font-weight: 600;
      margin: 0 0 1.25rem 0;
    }

    /* ── Controls ──────────────────────────── */
    .chart-controls {
      display: flex;
      align-items: center;
      justify-content: space-between;
      margin-bottom: 1.75rem;
      flex-wrap: wrap;
      gap: 0.75rem;
    }

    .mode-tabs {
      display: flex;
      gap: 0.4rem;
    }

    .mode-btn {
      padding: 0.3rem 1.1rem;
      border-radius: 8px;
      border: none;
      background: transparent;
      font-size: 0.88rem;
      font-weight: 500;
      cursor: pointer;
      color: var(--text-color-secondary);
      transition: all 0.15s;

      &:hover { background: var(--surface-100); }
    }

    .mode-active {
      background: #2dd4bf !important;
      color: #fff;
      font-weight: 600;
    }

    /* Toggle */
    .multi-toggle {
      display: flex;
      align-items: center;
      gap: 0.6rem;
      cursor: pointer;
      user-select: none;
    }

    .toggle-label {
      font-size: 0.875rem;
      color: var(--text-color-secondary);
    }

    .toggle {
      width: 44px;
      height: 24px;
      background: var(--surface-300);
      border-radius: 12px;
      position: relative;
      transition: background 0.2s;
      cursor: pointer;
      flex-shrink: 0;
    }

    .toggle.toggle-on { background: #2dd4bf; }

    .knob {
      position: absolute;
      top: 3px;
      left: 3px;
      width: 18px;
      height: 18px;
      background: #fff;
      border-radius: 50%;
      transition: left 0.2s;
      box-shadow: 0 1px 4px rgba(0,0,0,0.18);
    }

    .toggle.toggle-on .knob { left: 23px; }

    /* ── Arches ────────────────────────────── */
    .arch {
      display: flex;
      justify-content: center;
      align-items: flex-end;
      gap: 1px;
      flex-wrap: nowrap;
      overflow-x: auto;
      padding-bottom: 2px;
    }

    .arch-gap {
      height: 20px;
    }

    /* ── Legend ────────────────────────────── */
    .legend {
      display: flex;
      gap: 2rem;
      flex-wrap: wrap;
      margin-top: 1.5rem;
      padding-top: 1rem;
      border-top: 1px solid var(--surface-100);
    }

    .legend-item {
      display: flex;
      align-items: center;
      gap: 0.4rem;
      font-size: 0.78rem;
      color: var(--text-color-secondary);
    }

    .dot {
      width: 10px;
      height: 10px;
      border-radius: 50%;
      flex-shrink: 0;
    }

    .dot-teal   { background: #2dd4bf; }
    .dot-grey   { background: #9ca3af; }
    .dot-yellow { background: #fbbf24; }

    /* Responsive */
    @media (max-width: 768px) {
      .arch { gap: 0; }
      .legend { gap: 1rem; }
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

  private _teeth: Tooth[] = [];
  private _toothMap = new Map<number, Tooth>();

  private toothOrDefault(n: number): Tooth {
    return this._toothMap.get(n) ?? { number: n, status: 'normal' };
  }

  get upperTeeth(): Tooth[] {
    return UPPER_ORDER.map(n => this.toothOrDefault(n));
  }

  get lowerTeeth(): Tooth[] {
    return LOWER_ORDER.map(n => this.toothOrDefault(n));
  }

  handleToothClick(tooth: Tooth): void {
    if (this.multiSelect) {
      this.selectedSet.has(tooth.number)
        ? this.selectedSet.delete(tooth.number)
        : this.selectedSet.add(tooth.number);
      this.selectedSet = new Set(this.selectedSet);
    } else {
      this.selectedSet = new Set([tooth.number]);
    }
  }
}