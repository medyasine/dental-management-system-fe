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
          { label: 'Home', icon: 'pi pi-fw pi-home', routerLink: ['/app'] },

          // These can temporarily point to Home until you create real pages/routes
          { label: 'Patients', icon: 'pi pi-fw pi-users', routerLink: ['/app'] },
          { label: 'Appointments', icon: 'pi pi-fw pi-calendar', routerLink: ['/app'] },
          { label: 'Billing', icon: 'pi pi-fw pi-credit-card', routerLink: ['/app'] },
          { label: 'Settings', icon: 'pi pi-fw pi-cog', routerLink: ['/app'] }
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
