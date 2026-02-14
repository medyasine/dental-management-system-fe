import { Routes } from '@angular/router';
import { AppLayout } from './layout/component/app.layout';
import { Notfound } from './pages/notfound/notfound';

export const appRoutes: Routes = [
  // Redirect root to the app shell
  { path: '', pathMatch: 'full', redirectTo: 'app' },

  // App shell (topbar + sidebar)
  {
    path: 'app',
    component: AppLayout,
    children: [
      // Your empty / starter home page
      {
        path: '',
        loadComponent: () =>
          import('./features/home/home.page').then((m) => m.HomePage)
      },
    ]
  },

  // Outside shell
  { path: 'auth', loadChildren: () => import('./pages/auth/auth.routes') },
  { path: 'notfound', component: Notfound },

  // Fallback
  { path: '**', redirectTo: '/notfound' }
];
