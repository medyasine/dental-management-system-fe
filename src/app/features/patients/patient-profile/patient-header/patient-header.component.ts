// src/app/features/patient-profile/patient-header/patient-header.component.ts
import { Component, EventEmitter, Input, Output } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ButtonModule } from 'primeng/button';
import { SelectModule } from 'primeng/select';
import { FormsModule } from '@angular/forms';

export interface DoctorOption {
  label: string;
  value: string;
}

@Component({
  selector: 'app-patient-header',
  standalone: true,
  imports: [CommonModule, ButtonModule, SelectModule, FormsModule],
  templateUrl: './patient-header.component.html',
  styleUrls: ['./patient-header.component.scss']
})
export class PatientHeaderComponent {
  @Input() doctorName = 'Dr. Arjun';
  @Input() doctors: DoctorOption[] = [
    { label: 'Dr. Arjun', value: 'Dr. Arjun' },
    { label: 'Dr. Smith', value: 'Dr. Smith' },
  ];

  @Output() back = new EventEmitter<void>();
  @Output() viewTreatmentPlans = new EventEmitter<void>();
  @Output() saveRecord = new EventEmitter<void>();
  @Output() downloadRecord = new EventEmitter<void>();
  @Output() shareRecord = new EventEmitter<void>();

  selectedDoctor = '';

  ngOnInit(): void {
    this.selectedDoctor = this.doctorName;
  }

  onBack(): void {
    this.back.emit();
  }
}