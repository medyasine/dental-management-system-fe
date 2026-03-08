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
        path: 'home-select',
        loadComponent: () =>
          import('./features/role-dashboards/home-select.page').then((m) => m.HomeSelectPage),
      },
      {
        path: 'dashboards/admin',
        loadComponent: () =>
          import('./features/role-dashboards/admin-dashboard.page').then((m) => m.AdminDashboardPage),
      },
      {
        path: 'dashboards/dentist',
        loadComponent: () =>
          import('./features/role-dashboards/dentist-dashboard.page').then((m) => m.DentistDashboardPage),
      },
      {
        path: 'dashboards/assistant',
        loadComponent: () =>
          import('./features/role-dashboards/assistant-dashboard.page').then((m) => m.AssistantDashboardPage),
      },
      {
        path: 'dashboards/reception',
        loadComponent: () =>
          import('./features/role-dashboards/reception-dashboard.page').then((m) => m.ReceptionDashboardPage),
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




