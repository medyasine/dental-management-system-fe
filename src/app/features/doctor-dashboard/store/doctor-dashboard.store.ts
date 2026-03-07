import { Injectable } from '@angular/core';
import { BehaviorSubject } from 'rxjs';
import type {
  Appointment,
  FilterType,
} from '../appointments-table/appointments-table.component';
import type { DashboardStats, StatCard } from '../doctor-dashboard.component';

export interface DoctorDashboardState {
  doctorName: string;
  doctors: Array<{ label: string; value: string }>;
  selectedDoctor: string;
  stats: DashboardStats;
  statCards: StatCard[];
  appointments: Appointment[];
  filteredAppointments: Appointment[];
  activeFilter: FilterType;
}

type DoctorDashboardAction =
  | { type: 'SET_SELECTED_DOCTOR'; payload: string }
  | { type: 'SET_FILTERED_APPOINTMENTS'; payload: Appointment[] }
  | { type: 'SET_ACTIVE_FILTER'; payload: FilterType }
  | { type: 'TOGGLE_STAT_CARD'; payload: string };

@Injectable({ providedIn: 'root' })
export class DoctorDashboardStore {
  private readonly subject = new BehaviorSubject<DoctorDashboardState>(this.createInitialState());
  readonly state$ = this.subject.asObservable();

  get state(): DoctorDashboardState {
    return this.subject.value;
  }

  dispatch(action: DoctorDashboardAction): void {
    const next = this.reduce(this.state, action);
    this.subject.next(next);
  }

  setSelectedDoctor(doctor: string): void {
    this.dispatch({ type: 'SET_SELECTED_DOCTOR', payload: doctor });
  }

  setFilteredAppointments(rows: Appointment[]): void {
    this.dispatch({ type: 'SET_FILTERED_APPOINTMENTS', payload: rows });
  }

  setActiveFilter(filter: FilterType): void {
    this.dispatch({ type: 'SET_ACTIVE_FILTER', payload: filter });
  }

  toggleStatCard(label: string): void {
    this.dispatch({ type: 'TOGGLE_STAT_CARD', payload: label });
  }

  private reduce(state: DoctorDashboardState, action: DoctorDashboardAction): DoctorDashboardState {
    switch (action.type) {
      case 'SET_SELECTED_DOCTOR':
        return { ...state, selectedDoctor: action.payload };
      case 'SET_FILTERED_APPOINTMENTS':
        return { ...state, filteredAppointments: action.payload };
      case 'SET_ACTIVE_FILTER':
        return { ...state, activeFilter: action.payload };
      case 'TOGGLE_STAT_CARD':
        return {
          ...state,
          statCards: state.statCards.map((card) =>
            card.label === action.payload ? { ...card, hidden: !card.hidden } : card,
          ),
        };
      default:
        return state;
    }
  }

  private createInitialState(): DoctorDashboardState {
    const appointments: Appointment[] = [
      {
        no: 1,
        date: '11-11-25',
        time: '06:00 PM',
        patient: 'Harshad',
        phone: '9995960143',
        gender: 'Male',
        age: 35,
        chiefComplaints: 'Broken Filling, Random Things',
        token: 4,
        doctor: 'Dr. Nassreddine',
        status: 'Scheduled',
      },
      {
        no: 2,
        date: '11-11-25',
        time: '03:20 PM',
        patient: 'Eva',
        phone: '9995960143',
        gender: 'Female',
        age: 8,
        chiefComplaints: 'Broken Filling',
        token: 3,
        doctor: 'Dr. Nassreddine',
        status: 'Checked-In',
      },
      {
        no: 3,
        date: '11-11-25',
        time: '10:15 AM',
        patient: 'Eva',
        phone: '9995960143',
        gender: 'Female',
        age: 8,
        chiefComplaints: 'Pain',
        token: 2,
        doctor: 'Dr. Nassreddine',
        status: 'Completed',
      },
      {
        no: 4,
        date: '11-11-25',
        time: '09:05 AM',
        patient: 'Dheeraj T',
        phone: '9539192684',
        gender: 'Male',
        age: 23,
        chiefComplaints: 'Discolouration Of Tooth',
        token: 1,
        doctor: 'Dr. Nassreddine',
        status: 'Completed',
      },
    ];

    return {
      doctorName: 'Dr. Nassreddine',
      doctors: [
        { label: 'Dr. Nassreddine', value: 'Dr. Nassreddine' },
        { label: 'Dr. Sara', value: 'Dr. Sara' },
      ],
      selectedDoctor: 'Dr. Nassreddine',
      stats: {
        appointments: 4,
        checkIns: 3,
        billings: 2100,
        payments: 1700,
      },
      statCards: [
        {
          label: 'Appointments',
          valueKey: 'appointments',
          icon: 'pi-calendar',
          colorClass: 'stat-green',
          prefix: '',
          suffix: ' Nos',
        },
        {
          label: 'Check-Ins',
          valueKey: 'checkIns',
          icon: 'pi-users',
          colorClass: 'stat-peach',
          prefix: '',
          suffix: ' Nos',
        },
        {
          label: 'Billings',
          valueKey: 'billings',
          icon: 'pi-credit-card',
          colorClass: 'stat-rose',
          prefix: 'INR ',
          suffix: '',
          hasToggle: true,
          hidden: false,
        },
        {
          label: 'Payments',
          valueKey: 'payments',
          icon: 'pi-wallet',
          colorClass: 'stat-lavender',
          prefix: 'INR ',
          suffix: '',
          hasToggle: true,
          hidden: false,
        },
      ],
      appointments,
      filteredAppointments: [...appointments],
      activeFilter: 'today',
    };
  }
}
