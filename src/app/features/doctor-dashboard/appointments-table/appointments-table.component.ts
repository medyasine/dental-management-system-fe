// src/app/features/doctor-dashboard/appointments-table/appointments-table.component.ts
import { Component, EventEmitter, Input, Output } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { CardModule } from 'primeng/card';
import { TableModule } from 'primeng/table';
import { ButtonModule } from 'primeng/button';
import { InputTextModule } from 'primeng/inputtext';
import { TagModule } from 'primeng/tag';
import { IconFieldModule } from 'primeng/iconfield';
import { InputIconModule } from 'primeng/inputicon';
import { DatePickerModule } from 'primeng/datepicker';
import { StartTreatmentDialogComponent } from './start-treatment-dialog/start-treatment-dialog.component';

export interface Appointment {
  no: number;
  date: string;
  time: string;
  patient: string;
  phone: string;
  gender: 'Male' | 'Female';
  age: number;
  chiefComplaints: string;
  token: number;
  doctor: string;
  status: 'Scheduled' | 'Checked-In' | 'Completed' | 'Cancelled';
  consultation?: string;
}

export type FilterType = 'today' | 'yesterday' | 'month';

@Component({
  selector: 'app-appointments-table',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    CardModule,
    TableModule,
    ButtonModule,
    InputTextModule,
    TagModule,
    IconFieldModule,
    InputIconModule,
    DatePickerModule,
    StartTreatmentDialogComponent   // ADD
  ],
  templateUrl: './appointments-table.component.html',
  styleUrls: ['./appointments-table.component.scss']
})
export class AppointmentsTableComponent {
  @Input({ required: true }) value: Appointment[] = [];
  @Output() searchQueryChange = new EventEmitter<string>();
  @Output() dateRangeChange = new EventEmitter<Date[] | null>();
  @Output() filterChange = new EventEmitter<FilterType>();

  searchQuery = '';
  dateRange: Date[] | null = null;
  activeFilter: FilterType = 'today';

  // Dialog state — ADD THESE
  treatmentDialogVisible = false;
  selectedAppointment: Appointment | null = null;

  filterOptions: { label: string; value: FilterType }[] = [
    { label: 'Today', value: 'today' },
    { label: 'Yesterday', value: 'yesterday' },
    { label: 'This Month', value: 'month' }
  ];

  onSearchChange(v: string): void {
    const sanitized = (v ?? '').toString().trim().slice(0, 200);
    this.searchQuery = sanitized;
    this.searchQueryChange.emit(sanitized);
  }

  onDateRangeLocalChange(v: Date[] | null): void {
    this.dateRange = v;
    this.dateRangeChange.emit(v);
  }

  onFilterLocalChange(filter: FilterType): void {
    this.activeFilter = filter;
    this.dateRange = null;
    this.filterChange.emit(filter);
  }

  // ADD THIS
  openTreatmentDialog(appt: Appointment): void {
    this.selectedAppointment = appt;
    this.treatmentDialogVisible = true;
  }

  getStatusSeverity(status: string): 'info' | 'warn' | 'success' | 'danger' {
    const map: Record<string, 'info' | 'warn' | 'success' | 'danger'> = {
      'Scheduled': 'info',
      'Checked-In': 'warn',
      'Completed': 'success',
      'Cancelled': 'danger'
    };
    return map[status] ?? 'info';
  }
}