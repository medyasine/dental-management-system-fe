import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-clinics-page',
  standalone: true,
  imports: [CommonModule],
  template: `
    <section class="page-wrap">
      <h2>Clinics</h2>
      <p>Clinics page is available.</p>
    </section>
  `,
  styles: [`
    .page-wrap { padding: 1.25rem; }
    h2 { margin: 0 0 0.5rem; }
    p { margin: 0; color: #64748b; }
  `],
})
export class ClinicsPage {}