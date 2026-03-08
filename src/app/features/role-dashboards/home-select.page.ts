import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';

@Component({
  selector: 'app-home-select-page',
  standalone: true,
  imports: [CommonModule, FormsModule],
  template: `
    <div class="role-home p-4">
      <div class="role-home-shell">
        <div class="hero">
          <div>
            <p class="eyebrow">Dashboard Hub</p>
            <h1>Role Dashboard Selector</h1>
            <p class="sub">Choose a role to open the correct workflow dashboard.</p>
          </div>

          <div class="selector">
            <label for="roleSelect">Role</label>
            <select id="roleSelect" [(ngModel)]="selectedRole" (change)="goToRole(selectedRole)">
              <option *ngFor="let role of roles" [ngValue]="role.value">{{ role.label }}</option>
            </select>
          </div>
        </div>

        <div class="grid">
          <button type="button" class="role-card" *ngFor="let role of roles" (click)="goToRole(role.value)">
            <div class="icon"><i [class]="role.icon"></i></div>
            <div>
              <h3>{{ role.label }}</h3>
              <p>{{ role.description }}</p>
            </div>
            <i class="pi pi-arrow-right"></i>
          </button>
        </div>
      </div>
    </div>
  `,
  styles: [
    `
      .role-home { background: var(--surface-ground); min-height: 100vh; }
      .role-home-shell { margin: 0 auto; max-width: 1280px; display: grid; gap: 1rem; }
      .hero { background: #e6faf6; border: 1px solid #c2efe6; border-radius: 16px; padding: 1rem; display: flex; justify-content: space-between; gap: 1rem; align-items: end; }
      .eyebrow { margin: 0 0 0.25rem; color: #6b7280; font-size: 0.78rem; text-transform: uppercase; letter-spacing: 0.05em; font-weight: 700; }
      h1 { margin: 0; color: #0f172a; font-size: 1.9rem; }
      .sub { margin: 0.35rem 0 0; color: #475569; }
      .selector { display: grid; gap: 0.3rem; min-width: 220px; }
      .selector label { color: #475569; font-size: 0.85rem; }
      .selector select { min-height: 44px; border-radius: 10px; border: 1px solid #d5dbe4; background: #fff; padding: 0 0.75rem; color: #1e293b; }
      .grid { display: grid; gap: 0.8rem; grid-template-columns: repeat(auto-fit, minmax(260px, 1fr)); }
      .role-card { text-align: left; background: #fff; border: 1px solid #e5e7eb; border-radius: 14px; padding: 0.9rem; display: grid; grid-template-columns: auto 1fr auto; gap: 0.7rem; align-items: center; cursor: pointer; }
      .role-card .icon { width: 42px; height: 42px; border-radius: 10px; background: #f0f9ff; color: #0369a1; display: inline-flex; align-items: center; justify-content: center; }
      .role-card h3 { margin: 0; color: #0f172a; font-size: 1.1rem; }
      .role-card p { margin: 0.2rem 0 0; color: #64748b; font-size: 0.9rem; }
      .role-card > .pi-arrow-right { color: #94a3b8; }
      @media (max-width: 900px) { .hero { grid-template-columns: 1fr; display: grid; align-items: stretch; } }
    `,
  ],
})
export class HomeSelectPage {
  selectedRole: RoleValue = 'admin';

  roles: Array<{ value: RoleValue; label: string; icon: string; description: string }> = [
    { value: 'admin', label: 'Admin Dashboard', icon: 'pi pi-chart-line', description: 'Business KPIs, finance, operations, and strategic alerts.' },
    { value: 'dentist', label: 'Dentist Dashboard', icon: 'pi pi-user-md', description: 'Clinical workflow, patient care, and treatment follow-ups.' },
    { value: 'assistant', label: 'Assistant Dashboard', icon: 'pi pi-briefcase', description: 'Chairside prep, sterilization, and procedure readiness.' },
    { value: 'reception', label: 'Reception Dashboard', icon: 'pi pi-phone', description: 'Appointments, communication, and payment collection.' },
  ];

  constructor(private readonly router: Router) {}

  goToRole(role: RoleValue): void {
    this.selectedRole = role;
    this.router.navigate(['/app/dashboards', role]);
  }
}

type RoleValue = 'admin' | 'dentist' | 'assistant' | 'reception';
