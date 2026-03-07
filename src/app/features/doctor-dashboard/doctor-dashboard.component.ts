import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

import { CardModule } from 'primeng/card';
import { SelectModule } from 'primeng/select';
import { IconFieldModule } from 'primeng/iconfield';
import { InputIconModule } from 'primeng/inputicon';
import { DatePickerModule } from 'primeng/datepicker';

import {
  AppointmentsTableComponent,
  Appointment,
  FilterType,
} from './appointments-table/appointments-table.component';
import { DoctorDashboardStore } from './store/doctor-dashboard.store';

export interface DashboardStats {
  appointments: number;
  checkIns: number;
  billings: number;
  payments: number;
}

export interface StatCard {
  label: string;
  valueKey: string;
  icon: string;
  colorClass: string;
  prefix: string;
  suffix: string;
  hasToggle?: boolean;
  hidden?: boolean;
}

@Component({
  selector: 'app-doctor-dashboard',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    CardModule,
    SelectModule,
    IconFieldModule,
    InputIconModule,
    DatePickerModule,
    AppointmentsTableComponent,
  ],
  templateUrl: './doctor-dashboard.component.html',
  styleUrls: ['./doctor-dashboard.component.scss'],
})
export class DoctorDashboardComponent {
  constructor(private readonly store: DoctorDashboardStore) {}

  get doctorName(): string {
    return this.store.state.doctorName;
  }

  get doctors(): Array<{ label: string; value: string }> {
    return this.store.state.doctors;
  }

  get selectedDoctor(): string {
    return this.store.state.selectedDoctor;
  }

  set selectedDoctor(value: string) {
    this.store.setSelectedDoctor(value);
  }

  get stats(): DashboardStats {
    return this.store.state.stats;
  }

  get statCards(): StatCard[] {
    return this.store.state.statCards;
  }

  get appointments(): Appointment[] {
    return this.store.state.appointments;
  }

  get filteredAppointments(): Appointment[] {
    return this.store.state.filteredAppointments;
  }

  getStatValue(key: string): number {
    return this.stats[key as keyof DashboardStats];
  }

  toggleVisibility(card: StatCard): void {
    this.store.toggleStatCard(card.label);
  }

  onApptSearch(query: string): void {
    const q = (query ?? '').toString().toLowerCase().trim().slice(0, 200);
    const rows = this.appointments.filter(
      (appointment) => appointment.patient.toLowerCase().includes(q) || appointment.phone.includes(q),
    );
    this.store.setFilteredAppointments(rows);
  }

  onApptDateRangeChange(_range: Date[] | null): void {
    this.store.setFilteredAppointments([...this.appointments]);
  }

  onApptFilterChange(filter: FilterType): void {
    this.store.setActiveFilter(filter);
    this.store.setFilteredAppointments([...this.appointments]);
  }
}
