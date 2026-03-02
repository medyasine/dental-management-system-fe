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
        loadComponent: () =>
          import('./features/home/home.page').then((m) => m.HomePage)
      },
      {
        path: 'doctor-dashboard',
        loadComponent: () =>
          import('./features/doctor-dashboard/doctor-dashboard.component')
            .then((m) => m.DoctorDashboardComponent)
      },
      {
    path: 'patient-profile/:appointmentId',
    loadComponent: () =>
      import('./features/patients/patient-profile/patient-profile.component')
        .then(m => m.PatientProfileComponent)
  }
    ]
  },

  { path: 'auth', loadChildren: () => import('./pages/auth/auth.routes') },
  { path: 'notfound', component: Notfound },
  { path: '**', redirectTo: '/notfound' }
];
// import { Routes } from '@angular/router';
// import { AppLayout } from './layout/component/app.layout';
// import { Notfound } from './pages/notfound/notfound';
// import { authGuard } from './core/guards/auth.guard';
// import { roleGuard } from './core/guards/role.guard';

// /**
//  * Role matrix:
//  * ┌──────────────────────┬───────┬─────────┬───────────┬─────────────┐
//  * │ Module               │ ADMIN │ DENTIST │ ASSISTANT │ RECEPTIONIST│
//  * ├──────────────────────┼───────┼─────────┼───────────┼─────────────┤
//  * │ Patients             │  ✓    │   ✓     │    ✓      │     ✓       │
//  * │ Appointments         │  ✓    │   ✓     │    ✓      │     ✓       │
//  * │ Billing              │  ✓    │   ✗     │    ✗      │     ✓       │
//  * │ Reports / Analytics  │  ✓    │   ✓     │    ✗      │     ✗       │
//  * └──────────────────────┴───────┴─────────┴───────────┴─────────────┘
//  *
//  * Adjust the arrays below if your business rules differ.
//  */

// // ── Shorthand role sets ──────────────────────────────────────────────
// const ALL_ROLES   = ['ADMIN', 'DENTIST', 'ASSISTANT', 'RECEPTIONIST'] as const;
// const BILLING     = ['ADMIN', 'RECEPTIONIST']                         as const;
// const REPORTS     = ['ADMIN', 'DENTIST']                              as const;

// export const appRoutes: Routes = [

//   // ── Redirect root to shell ─────────────────────────────────────────
//   { path: '', pathMatch: 'full', redirectTo: 'app' },

//   // ── App shell (topbar + sidebar) ───────────────────────────────────
//   {
//     path: 'app',
//     component: AppLayout,
//     canActivate: [authGuard],          // whole shell requires login
//     children: [

//       // Home / dashboard — any authenticated user
//       {
//         path: '',
//         loadComponent: () =>
//           import('./features/home/home.page').then((m) => m.HomePage),
//       },

//       // ── Patients ─────────────────────────────────────────────────
//       {
//         path: 'patients',
//         canActivate: [roleGuard([...ALL_ROLES])],
//         loadComponent: () =>
//           import('./features/patients/patients.page').then((m) => m.PatientsPage),
//       }
//     ],
//   },

//   // ── Outside shell (public) ─────────────────────────────────────────
//   {
//     path: 'auth',
//     loadChildren: () => import('./pages/auth/auth.routes'),
//   },

//   // ── Error pages ───────────────────────────────────────────────────
//   { path: 'notfound',  component: Notfound },

//   // ── Fallback ──────────────────────────────────────────────────────
//   { path: '**', redirectTo: '/notfound' },
// ];