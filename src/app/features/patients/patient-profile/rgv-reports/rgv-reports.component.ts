// src/app/features/patient-profile/rgv-reports/rgv-reports.component.ts
import { Component, Input } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ButtonModule } from 'primeng/button';
import { DialogModule } from 'primeng/dialog';
import { RgvReport, RgvNote } from '../../../shared/models/patient.model';

@Component({
  selector: 'app-rgv-reports',
  standalone: true,
  imports: [CommonModule, ButtonModule, DialogModule],
  templateUrl: './rgv-reports.component.html',
  styleUrls: ['./rgv-reports.component.scss']
})
export class RgvReportsComponent {
  @Input({ required: true }) reports: RgvReport[] = [
  { 
    id: 1, 
    imageUrl: 'https://upload.wikimedia.org/wikipedia/commons/thumb/8/8b/Dental_X-ray.jpg/320px-Dental_X-ray.jpg', 
    date: '03/11/2025' 
  },
  { 
    id: 2, 
    imageUrl: 'https://upload.wikimedia.org/wikipedia/commons/thumb/8/8b/Dental_X-ray.jpg/320px-Dental_X-ray.jpg', 
    date: '04/11/2025' 
  },
];;
  @Input({ required: true }) notes: RgvNote[] = [];
  zoomVisible = false;
  zoomedImage = '';
  zoomedDate = '';

  openZoom(report: RgvReport): void {
    this.zoomedImage = report.imageUrl;
    this.zoomedDate = report.date;
    this.zoomVisible = true;
  }

  deleteReport(id: number): void {
    this.reports = this.reports.filter(r => r.id !== id);
  }

  deleteNote(id: number): void {
    this.notes = this.notes.filter(n => n.id !== id);
  }

  addMoreReport(): void {
    // Emit event or open file picker — wire to service when ready
    console.log('Add more report clicked');
  }
}