// src/app/features/patient-profile/patient-info/patient-info.component.ts
import { Component, Input } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ButtonModule } from 'primeng/button';
import { TagModule } from 'primeng/tag';
import { Patient } from '../../../shared/models/patient.model';

@Component({
  selector: 'app-patient-info',
  standalone: true,
  imports: [CommonModule, ButtonModule, TagModule],
  templateUrl: './patient-info.component.html',
  styleUrls: ['./patient-info.component.scss']
})
export class PatientInfoComponent {
  @Input({ required: true }) patient!: Patient;
}