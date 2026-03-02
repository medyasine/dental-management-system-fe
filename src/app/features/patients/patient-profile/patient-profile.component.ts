// src/app/features/patient-profile/patient-profile.component.ts
import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { PatientHeaderComponent }  from './patient-header/patient-header.component';
import { PatientInfoComponent }    from './patient-info/patient-info.component';
import { ClinicalInfoComponent }   from './clinical-info/clinical-info.component';
import { RgvReportsComponent }     from './rgv-reports/rgv-reports.component';
import { DentalChartComponent }    from './dental-chart/dental-chart.component';
import { Patient, ClinicalInfo, RgvReport, RgvNote, Tooth } from '../../shared/models/patient.model';

@Component({
  selector: 'app-patient-profile',
  standalone: true,
  imports: [
    CommonModule,
    PatientHeaderComponent,
    PatientInfoComponent,
    ClinicalInfoComponent,
    RgvReportsComponent,
    DentalChartComponent,
  ],
  template: `
    <div class="patient-profile-shell">
      <app-patient-header
        [doctorName]="doctorName"
        (back)="onBack()"
      ></app-patient-header>

      <div class="profile-content p-4">
        <app-patient-info   [patient]="patient"></app-patient-info>
        <app-clinical-info  [info]="clinicalInfo"></app-clinical-info>
        <app-rgv-reports    [reports]="reports" [notes]="notes"></app-rgv-reports>
        <app-dental-chart   [teeth]="teeth"></app-dental-chart>
      </div>
    </div>
  `,
  styles: [`
    .patient-profile-shell {
      background: var(--surface-ground);
      min-height: 100vh;
    }
    .profile-content {
      display: flex;
      flex-direction: column;
      gap: 1.25rem;
      max-width: 1400px;
      margin: 0 auto;
    }
  `]
})
export class PatientProfileComponent implements OnInit {
  doctorName = 'Dr. Arjun';

  // These would come from a service/API using the route param
  patient: Patient = {
    id: '1', name: 'Harshad', location: 'kerala',
    phone: '+91 9995960143', email: '--',
    gender: 'Male', age: 35, patientId: '4F08D',
    token: 4, bookingDate: 'Mon Nov 03 2025',
    alerts: ['Diabetic']
  };

  clinicalInfo: ClinicalInfo = {
    chiefComplaints: ['Irregularly placed tooth', 'Broken filling'],
    medicalHistory:  ['Diabetic'],
    dentalHistory:   ['Cold Response'],
    onExamination:   ['TOP Negative - 41']
  };

  reports: RgvReport[] = [
    { id: 1, imageUrl: 'assets/xray1.jpg', date: '03/11/2025' },
    { id: 2, imageUrl: 'assets/xray2.jpg', date: '04/11/2025' },
  ];

  notes: RgvNote[] = [
    { id: 1, author: 'Arjun', date: 'Nov 4, 2025', content: 'hii' },
    { id: 2, author: 'Arjun', date: 'Nov 3, 2025', content: 'some issues' },
  ];

  // 32 adult teeth — numbers follow FDI notation
  teeth: Tooth[] = [
    // Upper right (18→11) then upper left (21→28)
    ...[18,17,16,15,14,13,12,11].map(n => ({
      number: n,
      status: [16,11,21,25].includes(n) ? 'treatment-taken' : 'normal'
    } as Tooth)),
    ...[21,22,23,24,25,26,27,28].map(n => ({
      number: n,
      status: [16,11,21,25].includes(n) ? 'treatment-taken' : 'normal'
    } as Tooth)),
    // Lower right (48→41) then lower left (31→38)
    ...[48,47,46,45,44,43,42,41].map(n => ({
      number: n,
      status: n === 41 ? 'treatment-taken' : 'normal'
    } as Tooth)),
    ...[31,32,33,34,35,36,37,38].map(n => ({
      number: n, status: 'normal'
    } as Tooth)),
  ];

  constructor(private router: Router) {}

  ngOnInit(): void {
    // In real app: inject ActivatedRoute, read appointmentId param,
    // call PatientService.getById(id) and populate above fields
  }

  onBack(): void {
    this.router.navigate(['/app/doctor-dashboard']);
  }
}
