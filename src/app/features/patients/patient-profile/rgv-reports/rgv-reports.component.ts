// src/app/features/patient-profile/rgv-reports/rgv-reports.component.ts
import { Component, Input } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ButtonModule } from 'primeng/button';
import { DialogModule } from 'primeng/dialog';

import { RgvReport, RgvNote } from '../../../shared/models/patient.model';
import {
  RgvReportDialogComponent,
  ReportSubmitPayload,
} from './rgv-report-dialog/rgv-report-dialog.component';

@Component({
  selector: 'app-rgv-reports',
  standalone: true,
  imports: [
    CommonModule,
    ButtonModule,
    DialogModule,
    RgvReportDialogComponent, // ✅ import the new dialog
  ],
  templateUrl: './rgv-reports.component.html',
  styleUrls: ['./rgv-reports.component.scss'],
})
export class RgvReportsComponent {
  @Input({ required: true }) reports: RgvReport[] = [];
  @Input({ required: true }) notes: RgvNote[] = [];

  // ── Zoom dialog ────────────────────────────────────────────────────────────
  zoomVisible = false;
  zoomedImage = '';
  zoomedDate = '';

  openZoom(report: RgvReport): void {
    this.zoomedImage = report.imageUrl;
    this.zoomedDate = report.date;
    this.zoomVisible = true;
  }

  // ── Add-report dialog ──────────────────────────────────────────────────────
  addReportDialogVisible = false;

  openAddReportDialog(): void {
    this.addReportDialogVisible = true;
  }

  onReportSubmitted(payload: ReportSubmitPayload): void {
    // TODO: wire to your real service (e.g. this.rgvService.save(payload))
    console.log('New report payload:', payload);

    // Optimistic local update — replace with API response when ready
    payload.files.forEach((file, index) => {
      const tempUrl = URL.createObjectURL(file);
      this.reports = [
        ...this.reports,
        {
          id: Date.now() + index,
          imageUrl: tempUrl,
          date: new Date().toLocaleDateString('en-GB').replace(/\//g, '/'),
        } as RgvReport,
      ];
    });

    if (payload.note) {
      this.notes = [
        ...this.notes,
        {
          id: Date.now(),
          author: 'You',
          date: new Date().toLocaleDateString('en-US', {
            month: 'short',
            day: 'numeric',
            year: 'numeric',
          }),
          content: payload.note,
        } as RgvNote,
      ];
    }
  }

  // ── Delete ─────────────────────────────────────────────────────────────────
  deleteReport(id: number): void {
    this.reports = this.reports.filter((r) => r.id !== id);
  }

  deleteNote(id: number): void {
    this.notes = this.notes.filter((n) => n.id !== id);
  }

  // ── Image helpers ──────────────────────────────────────────────────────────
  imgSrc(path: string): string {
    return new URL(path.replace(/^\//, ''), document.baseURI).toString();
  }

  onImgError(e: Event, path: string): void {
    const el = e.target as HTMLImageElement;
    console.warn('Image failed to load:', { path, attempted: el.src });
  }
}