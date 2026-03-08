import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { MenuItem } from 'primeng/api';
import { AppMenuitem } from './app.menuitem';

@Component({
  selector: 'app-menu',
  standalone: true,
  imports: [CommonModule, AppMenuitem, RouterModule],
  template: `<ul class="layout-menu">
    @for (item of model; track item.label) {
      @if (!item.separator) {
        <li app-menuitem [item]="item" [root]="true"></li>
      } @else {
        <li class="menu-separator"></li>
      }
    }
  </ul>`,
})
export class AppMenu {
  model: MenuItem[] = [];

  ngOnInit() {
    this.model = [
      {
        label: 'Dental System',
        items: [
          // Home page inside the Sakai layout shell
          {
            label: 'Home',
            icon: 'pi pi-fw pi-home',
            path: '/home',
            items: [
              { label: 'Home Select', icon: 'pi pi-fw pi-th-large', routerLink: ['/app/home-select'] },
              { label: 'Admin', icon: 'pi pi-fw pi-chart-line', routerLink: ['/app/dashboards/admin'] },
              { label: 'Dentist', icon: 'pi pi-fw pi-user-md', routerLink: ['/app/dashboards/dentist'] },
              { label: 'Assistant', icon: 'pi pi-fw pi-briefcase', routerLink: ['/app/dashboards/assistant'] },
              { label: 'Reception', icon: 'pi pi-fw pi-phone', routerLink: ['/app/dashboards/reception'] },
            ],
          },
          { label: 'Doctor Dashboard', icon: 'pi pi-fw pi-user', routerLink: ['/app/doctor-dashboard'] },

          { label: 'Patients', icon: 'pi pi-fw pi-users', routerLink: ['/app/patients'] },
          { label: 'Appointments', icon: 'pi pi-fw pi-calendar', routerLink: ['/app/appointments'] },
          { label: 'Billing', icon: 'pi pi-fw pi-credit-card', routerLink: ['/app/billing'] },
          { label: 'Settings', icon: 'pi pi-fw pi-cog', routerLink: ['/app/settings'] }
        ]
      },
      { separator: true },
      {
        label: 'Account',
        items: [
          // Auth routes are outside the shell (as we defined in app.routes.ts)
          { label: 'Login', icon: 'pi pi-fw pi-sign-in', routerLink: ['/auth/login'] }
        ]
      }
    ];
  }
}



