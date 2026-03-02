// src/app/features/patient-profile/dental-chart/tooth/tooth.component.ts
import { Component, Input } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Tooth } from '../../../../shared/models/patient.model';
import { getToothAsset } from '../tooth-asset.map';

@Component({
  selector: 'app-tooth',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div
      class="tooth-cell"
      [class.tooth-selected]="selected"
    >
      <!-- Image wrapper -->
      <div class="tooth-img-wrap">
        <img
          [src]="asset.imagePath"
          [alt]="'Tooth ' + tooth.number"
          class="tooth-img"
          [class.mirrored]="asset.mirror"
          loading="lazy"
          draggable="false"
        />

        <!-- Coloured overlay for non-normal status -->
        <div
          *ngIf="tooth.status !== 'normal'"
          class="tooth-overlay"
          [ngClass]="overlayClass"
        ></div>
      </div>

      <!-- Number — plain text OR teal circle badge -->
      <div
        class="tooth-number"
        [class.number-badge]="tooth.status !== 'normal'"
        [ngClass]="badgeClass"
      >
        {{ tooth.number }}
      </div>
    </div>
  `,
  styles: [`
    .tooth-cell {
      display: flex;
      flex-direction: column;
      align-items: center;
      gap: 5px;
      padding: 4px 3px;
      border-radius: 8px;
      cursor: pointer;
      transition: background 0.15s;
      min-width: 48px;

      &:hover {
        background: rgba(45, 212, 191, 0.09);
      }
    }

    .tooth-selected {
      background: rgba(45, 212, 191, 0.18) !important;
      outline: 2px solid #2dd4bf;
      border-radius: 8px;
    }

    /* Image wrapper */
    .tooth-img-wrap {
      position: relative;
      width: 44px;
      height: 64px;
      display: flex;
      align-items: flex-end;
      justify-content: center;
    }

    .tooth-img {
      max-width: 100%;
      max-height: 100%;
      object-fit: contain;
      user-select: none;
      display: block;
    }

    /* Mirror left-side teeth */
    .mirrored {
      transform: scaleX(-1);
    }

    /* Status tint overlay */
    .tooth-overlay {
      position: absolute;
      inset: 0;
      border-radius: 4px;
      pointer-events: none;
      mix-blend-mode: multiply;
    }

    .overlay-treatment   { background: rgba(45, 212, 191, 0.30); }
    .overlay-removed     { background: rgba(107, 114, 128, 0.45); }
    .overlay-recommended { background: rgba(251, 191, 36, 0.35); }

    /* Plain number */
    .tooth-number {
      font-size: 0.72rem;
      color: var(--text-color-secondary);
      font-weight: 500;
      line-height: 1;
      text-align: center;
    }

    /* Teal / grey / yellow circle badge */
    .number-badge {
      width: 22px;
      height: 22px;
      border-radius: 50%;
      display: flex;
      align-items: center;
      justify-content: center;
      font-size: 0.68rem;
      font-weight: 700;
      color: #fff;
    }

    .badge-treatment   { background: #2dd4bf; }
    .badge-removed     { background: #6b7280; }
    .badge-recommended { background: #fbbf24; }
  `]
})
export class ToothComponent {
  @Input({ required: true }) tooth!: Tooth;
  @Input() selected = false;

  get asset() {
    return getToothAsset(this.tooth.number);
  }

  get overlayClass(): string {
    const map: Record<string, string> = {
      'treatment-taken': 'overlay-treatment',
      'removed':         'overlay-removed',
      'recommended':     'overlay-recommended',
    };
    return map[this.tooth.status] ?? '';
  }

  get badgeClass(): string {
    const map: Record<string, string> = {
      'treatment-taken': 'badge-treatment',
      'removed':         'badge-removed',
      'recommended':     'badge-recommended',
    };
    return map[this.tooth.status] ?? '';
  }
}