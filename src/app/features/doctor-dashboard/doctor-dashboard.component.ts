// src/app/doctor-dashboard/doctor-dashboard.component.ts (updated)
import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

import { CardModule } from 'primeng/card';
import { SelectModule } from 'primeng/select';
import { IconFieldModule } from 'primeng/iconfield';
import { InputIconModule } from 'primeng/inputicon';
import { DatePickerModule } from 'primeng/datepicker';

import { AppointmentsTableComponent, Appointment, FilterType } from './appointments-table/appointments-table.component';

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
    AppointmentsTableComponent
  ],
  templateUrl: './doctor-dashboard.component.html',
  styleUrls: ['./doctor-dashboard.component.scss']
})
export class DoctorDashboardComponent implements OnInit {
  doctorName = 'Dr. Nassreddine';

  doctors = [
    { label: 'Dr. Nassreddine', value: 'Dr. Nassreddine' },
    { label: 'Dr. Sara', value: 'Dr. Sara' }
  ];
  selectedDoctor = 'Dr. Nassreddine';

  stats: DashboardStats = {
    appointments: 4,
    checkIns: 3,
    billings: 2100,
    payments: 1700
  };

  statCards: StatCard[] = [
    { label: 'Appointments', valueKey: 'appointments', icon: 'pi-calendar', colorClass: 'stat-green', prefix: '', suffix: ' Nos' },
    { label: 'Check-Ins', valueKey: 'checkIns', icon: 'pi-users', colorClass: 'stat-peach', prefix: '', suffix: ' Nos' },
    { label: 'Billings', valueKey: 'billings', icon: 'pi-credit-card', colorClass: 'stat-rose', prefix: '₹ ', suffix: '', hasToggle: true, hidden: false },
    { label: 'Payments', valueKey: 'payments', icon: 'pi-wallet', colorClass: 'stat-lavender', prefix: '₹ ', suffix: '', hasToggle: true, hidden: false }
  ];

  appointments: Appointment[] = [
    {
      no: 1, date: '11-11-25', time: '06:00 PM',
      patient: 'Harshad', phone: '9995960143',
      gender: 'Male', age: 35,
      chiefComplaints: 'Broken Filling, Random Things',
      token: 4, doctor: 'Dr. Nassreddine', status: 'Scheduled'
    },
    {
      no: 2, date: '11-11-25', time: '03:20 PM',
      patient: 'Eva', phone: '9995960143',
      gender: 'Female', age: 8,
      chiefComplaints: 'Broken Filling',
      token: 3, doctor: 'Dr. Nassreddine', status: 'Checked-In'
    },
    {
      no: 3, date: '11-11-25', time: '10:15 AM',
      patient: 'Eva', phone: '9995960143',
      gender: 'Female', age: 8,
      chiefComplaints: 'Pain',
      token: 2, doctor: 'Dr. Nassreddine', status: 'Completed'
    },
    {
      no: 4, date: '11-11-25', time: '09:05 AM',
      patient: 'Dheeraj T', phone: '9539192684',
      gender: 'Male', age: 23,
      chiefComplaints: 'Discolouration Of Tooth',
      token: 1, doctor: 'Dr. Nassreddine', status: 'Completed'
    }
  ];

  filteredAppointments: Appointment[] = [];

  ngOnInit(): void {
    this.filteredAppointments = [...this.appointments];
  }

  getStatValue(key: string): number {
    return this.stats[key as keyof DashboardStats];
  }

  toggleVisibility(card: StatCard): void {
    card.hidden = !card.hidden;
  }

  // OWASP: sanitize UI input again in parent before use
  onApptSearch(query: string): void {
    const q = (query ?? '').toString().toLowerCase().trim().slice(0, 200);
    this.filteredAppointments = this.appointments.filter(a =>
      a.patient.toLowerCase().includes(q) || a.phone.includes(q)
    );
  }

  onApptDateRangeChange(_range: Date[] | null): void {
    // placeholder: keep behavior identical to your current implementation
    this.filteredAppointments = [...this.appointments];
  }

  onApptFilterChange(_filter: FilterType): void {
    // placeholder: keep behavior identical to your current implementation
    this.filteredAppointments = [...this.appointments];
  }
}