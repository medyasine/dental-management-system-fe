import { Routes } from '@angular/router';
import { AppLayout } from './layout/component/app.layout';
import { Notfound } from './pages/notfound/notfound';

export const appRoutes: Routes = [
  { path: '', pathMatch: 'full', redirectTo: 'app' },
  {
    path: 'app',
    component: AppLayout,
    children: [
      {
        path: '',
        loadComponent: () => import('./features/home/home.page').then((m) => m.HomePage),
      },
      {
        path: 'doctor-dashboard',
        loadComponent: () =>
          import('./features/doctor-dashboard/doctor-dashboard.component').then(
            (m) => m.DoctorDashboardComponent,
          ),
      },
      {
        path: 'patients',
        loadComponent: () =>
          import('./features/patients/patients.page').then((m) => m.PatientsPage),
      },
      {
        path: 'appointments',
        loadComponent: () =>
          import('./features/appointments/appointments.page').then((m) => m.AppointmentsPage),
      },
      {
        path: 'billing',
        loadComponent: () =>
          import('./features/billing/billing.page').then((m) => m.BillingPage),
      },
      {
        path: 'clinics',
        loadComponent: () =>
          import('./features/clinics/clinics.page').then((m) => m.ClinicsPage),
      },
      {
        path: 'front-desk-officers',
        loadComponent: () =>
          import('./features/front-desk-officers/front-desk-officers.page').then((m) => m.FrontDeskOfficersPage),
      },
      {
        path: 'settings',
        loadComponent: () =>
          import('./features/settings/settings.page').then((m) => m.SettingsPage),
      },
      {
        path: 'patient-profile/:appointmentId',
        loadComponent: () =>
          import('./features/patients/patient-profile/patient-profile.component').then(
            (m) => m.PatientProfileComponent,
          ),
      },
      {
        path: 'invoice-preview/:appointmentId',
        loadComponent: () =>
          import('./features/patients/invoice-preview/invoice-preview.component').then(
            (m) => m.InvoicePreviewComponent,
          ),
      },
    ],
  },
  { path: 'auth', loadChildren: () => import('./pages/auth/auth.routes') },
  { path: 'notfound', component: Notfound },
  { path: '**', redirectTo: '/notfound' },
];




