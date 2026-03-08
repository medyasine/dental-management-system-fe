import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-dentist-dashboard-page',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="dash-page">

      <!-- Header -->
      <div class="page-header">
        <div>
          <span class="portal-tag">Dentist Portal</span>
          <h1 class="page-title">Clinical Workflow</h1>
        </div>
        <div class="header-actions">
          <div class="date-pill"><span class="live-dot"></span> Mon, 9 Jun 2025</div>
          <button class="icon-btn pi pi-bell"></button>
        </div>
      </div>

      <!-- Next Patient Hero -->
      <div class="hero-card">
        <div class="hero-left">
          <span class="hero-eyebrow">▶ UP NEXT · 11:20 AM</span>
          <h2 class="hero-name">Rizwan Ali</h2>
          <p class="hero-proc">Root Canal — Lower Right Molar (# 46)</p>
          <div class="hero-tags">
            <span class="htag htag-red">⚠ Penicillin Allergy</span>
            <span class="htag htag-amber">Anticoagulant Medication</span>
            <span class="htag htag-teal">Last Visit: 12 May</span>
          </div>
        </div>
        <div class="hero-right">
          <div class="timer-block">
            <span class="timer-label">Starts in</span>
            <span class="timer-val">28 min</span>
          </div>
          <button class="btn-primary">Open Chart →</button>
        </div>
      </div>

      <!-- KPIs -->
      <div class="kpi-grid">
        <div class="kpi-card" *ngFor="let k of kpis">
          <div class="kpi-top-row">
            <span class="kpi-label">{{ k.label }}</span>
            <span class="kpi-ico">{{ k.icon }}</span>
          </div>
          <div class="kpi-val">{{ k.value }}</div>
        </div>
      </div>

      <!-- Main Grid -->
      <div class="main-grid">

        <!-- Today's Schedule -->
        <div class="card">
          <div class="card-head">
            <h3 class="section-title">Today's Schedule</h3>
            <span class="count-pill">14 appointments</span>
          </div>
          <div class="timeline">
            <div class="tl-row" *ngFor="let a of appointments" [class]="'tl-row ' + a.status">
              <span class="tl-time">{{ a.time }}</span>
              <span class="tl-dot"></span>
              <div class="tl-body">
                <div class="tl-name">{{ a.name }}</div>
                <div class="tl-proc">{{ a.proc }}</div>
              </div>
              <span class="status-chip" [class]="a.status">{{ a.statusLabel }}</span>
            </div>
          </div>
        </div>

        <!-- Right Column -->
        <div class="right-col">

          <!-- Clinical To-Do -->
          <div class="card">
            <div class="card-head">
              <h3 class="section-title">Clinical To-Do</h3>
              <span class="count-pill amber">5 pending</span>
            </div>
            <div class="todo-list">
              <div class="todo-row" *ngFor="let t of todos" [class.done]="t.done">
                <div class="todo-check" [class.checked]="t.done">
                  <span *ngIf="t.done" class="pi pi-check"></span>
                </div>
                <div class="todo-content">
                  <span class="todo-title">{{ t.title }}</span>
                  <span class="todo-sub">{{ t.sub }}</span>
                </div>
                <span class="priority-chip" [class]="t.p">{{ t.p }}</span>
              </div>
            </div>
          </div>

          <!-- Medical Alerts -->
          <div class="card">
            <div class="card-head">
              <h3 class="section-title">⚕ Medical Alerts</h3>
              <span class="count-pill red">3 active</span>
            </div>
            <div class="medical-list">
              <div class="med-row" *ngFor="let m of medAlerts">
                <div class="med-icon" [style.background]="m.bg">{{ m.icon }}</div>
                <div>
                  <div class="med-name">{{ m.name }}</div>
                  <div class="med-detail">{{ m.detail }}</div>
                </div>
              </div>
            </div>
          </div>

        </div>
      </div>
    </div>
  `,
  styles: [`
    :host { display: block; }

    .dash-page {
      padding: 1.5rem 1.75rem;
      background: var(--surface-ground, #f8f9fa);
      min-height: 100%;
      display: flex;
      flex-direction: column;
      gap: 1.1rem;
    }

    /* Header */
    .page-header { display: flex; align-items: flex-end; justify-content: space-between; }
    .portal-tag { display: block; font-size: 0.7rem; font-weight: 700; color: #10b981; text-transform: uppercase; letter-spacing: 0.12em; margin-bottom: 0.15rem; }
    .page-title { margin: 0; font-size: 1.65rem; font-weight: 700; color: var(--text-color, #212529); }
    .header-actions { display: flex; align-items: center; gap: 0.5rem; }
    .date-pill { display: flex; align-items: center; gap: 0.45rem; background: #fff; border: 1px solid #dee2e6; border-radius: 8px; padding: 0.4rem 0.85rem; font-size: 0.8rem; color: #495057; font-weight: 500; }
    .live-dot { width: 6px; height: 6px; border-radius: 50%; background: #10b981; animation: pulse 2s infinite; }
    @keyframes pulse { 0%,100%{opacity:1}50%{opacity:.3} }
    .icon-btn { background: #fff; border: 1px solid #dee2e6; border-radius: 8px; width: 34px; height: 34px; cursor: pointer; color: #6c757d; font-size: 0.85rem; transition: all 0.15s; display: flex; align-items: center; justify-content: center; }
    .icon-btn:hover { border-color: #10b981; color: #10b981; }

    /* Hero */
    .hero-card {
      background: #0f172a;
      border-radius: 12px;
      padding: 1.4rem 1.8rem;
      display: flex;
      align-items: center;
      justify-content: space-between;
      gap: 1rem;
    }
    .hero-eyebrow { font-size: 0.7rem; font-weight: 700; color: #10b981; text-transform: uppercase; letter-spacing: 0.1em; display: block; margin-bottom: 0.25rem; }
    .hero-name { margin: 0 0 0.2rem; font-size: 1.8rem; font-weight: 700; color: #fff; }
    .hero-proc { margin: 0 0 0.7rem; font-size: 0.87rem; color: #94a3b8; }
    .hero-tags { display: flex; gap: 0.45rem; flex-wrap: wrap; }
    .htag { font-size: 0.72rem; font-weight: 600; padding: 0.22rem 0.65rem; border-radius: 20px; }
    .htag-red { background: rgba(239,68,68,.2); color: #fca5a5; }
    .htag-amber { background: rgba(245,158,11,.2); color: #fcd34d; }
    .htag-teal { background: rgba(16,185,129,.2); color: #6ee7b7; }
    .hero-right { display: flex; flex-direction: column; align-items: flex-end; gap: 0.75rem; }
    .timer-block { text-align: right; }
    .timer-label { display: block; font-size: 0.72rem; color: #64748b; }
    .timer-val { font-size: 2.2rem; font-weight: 700; color: #10b981; line-height: 1; }
    .btn-primary { background: #10b981; color: #fff; border: none; border-radius: 8px; padding: 0.6rem 1.2rem; font-size: 0.85rem; font-weight: 600; cursor: pointer; transition: background .15s; }
    .btn-primary:hover { background: #0d9488; }

    /* KPI */
    .kpi-grid { display: grid; grid-template-columns: repeat(auto-fit, minmax(165px, 1fr)); gap: 0.85rem; }
    .kpi-card { background: #fff; border: 1px solid #dee2e6; border-radius: 10px; padding: 1rem 1.1rem; transition: box-shadow .2s; }
    .kpi-card:hover { box-shadow: 0 3px 14px rgba(0,0,0,0.07); }
    .kpi-top-row { display: flex; justify-content: space-between; margin-bottom: 0.35rem; }
    .kpi-label { font-size: 0.76rem; color: #6c757d; font-weight: 600; line-height: 1.3; }
    .kpi-ico { font-size: 1rem; opacity: 0.5; }
    .kpi-val { font-size: 1.45rem; font-weight: 700; color: #212529; }

    /* Card */
    .card { background: #fff; border: 1px solid #dee2e6; border-radius: 10px; padding: 1.2rem 1.3rem; }
    .card-head { display: flex; align-items: center; justify-content: space-between; margin-bottom: 1rem; }
    .section-title { margin: 0; font-size: 0.95rem; font-weight: 700; color: #212529; }
    .count-pill { font-size: 0.72rem; font-weight: 700; padding: 0.2rem 0.6rem; border-radius: 20px; background: #e6f9f4; color: #0d9488; border: 1px solid #b2ead9; }
    .count-pill.amber { background: #fff8e6; color: #b45309; border-color: #fde68a; }
    .count-pill.red { background: #fff5f5; color: #dc2626; border-color: #fecaca; }

    /* Main Grid */
    .main-grid { display: grid; grid-template-columns: 1.35fr 1fr; gap: 1rem; }
    .right-col { display: flex; flex-direction: column; gap: 1rem; }

    /* Timeline */
    .timeline { display: flex; flex-direction: column; }
    .tl-row { display: flex; align-items: flex-start; gap: 0.75rem; padding: 0.6rem 0; border-bottom: 1px solid #f8f9fa; }
    .tl-row:last-child { border-bottom: none; }
    .tl-time { font-size: 0.74rem; color: #adb5bd; font-weight: 600; width: 46px; flex-shrink: 0; padding-top: 2px; }
    .tl-dot { width: 9px; height: 9px; border-radius: 50%; background: #dee2e6; flex-shrink: 0; margin-top: 4px; }
    .tl-row.completed .tl-dot { background: #10b981; }
    .tl-row.current .tl-dot { background: #10b981; box-shadow: 0 0 0 3px rgba(16,185,129,.2); }
    .tl-row.upcoming .tl-dot { background: #dee2e6; }
    .tl-body { flex: 1; }
    .tl-name { font-size: 0.84rem; font-weight: 600; color: #212529; }
    .tl-proc { font-size: 0.74rem; color: #6c757d; }
    .status-chip { font-size: 0.7rem; font-weight: 700; padding: 0.18rem 0.55rem; border-radius: 6px; flex-shrink: 0; margin-top: 2px; }
    .status-chip.completed { background: #e6f9f4; color: #0d9488; }
    .status-chip.current { background: #e6f9f4; color: #10b981; border: 1px solid #a7f3d0; }
    .status-chip.upcoming { background: #f8f9fa; color: #6c757d; }

    /* Todo */
    .todo-list { display: flex; flex-direction: column; gap: 0.5rem; }
    .todo-row { display: flex; align-items: flex-start; gap: 0.65rem; padding: 0.6rem; border-radius: 8px; background: #f8f9fa; }
    .todo-row.done { opacity: 0.5; }
    .todo-check { width: 18px; height: 18px; border-radius: 5px; border: 2px solid #dee2e6; flex-shrink: 0; display: flex; align-items: center; justify-content: center; font-size: 0.65rem; }
    .todo-check.checked { background: #10b981; border-color: #10b981; color: #fff; }
    .todo-content { flex: 1; }
    .todo-title { display: block; font-size: 0.82rem; font-weight: 600; color: #212529; }
    .todo-sub { display: block; font-size: 0.72rem; color: #adb5bd; margin-top: 1px; }
    .priority-chip { font-size: 0.68rem; font-weight: 700; padding: 0.15rem 0.45rem; border-radius: 5px; flex-shrink: 0; }
    .priority-chip.high { background: #fff5f5; color: #dc2626; }
    .priority-chip.med { background: #fff8e6; color: #b45309; }
    .priority-chip.low { background: #f0fdf4; color: #16a34a; }

    /* Medical */
    .medical-list { display: flex; flex-direction: column; gap: 0.5rem; }
    .med-row { display: flex; align-items: center; gap: 0.65rem; padding: 0.6rem; border-radius: 8px; background: #f8f9fa; }
    .med-icon { width: 32px; height: 32px; border-radius: 8px; display: flex; align-items: center; justify-content: center; font-size: 0.95rem; flex-shrink: 0; }
    .med-name { font-size: 0.82rem; font-weight: 600; color: #212529; }
    .med-detail { font-size: 0.72rem; color: #6c757d; }

    @media (max-width: 900px) { .main-grid { grid-template-columns: 1fr; } }
    @media (max-width: 640px) { .kpi-grid { grid-template-columns: 1fr 1fr; } }
  `]
})
export class DentistDashboardPage {
  kpis = [
    { label: "Today's Appointments", value: '14', icon: '📅' },
    { label: 'Pending Treatment Plans', value: '5', icon: '📋' },
    { label: 'Lab Cases Due', value: '2', icon: '🧪' },
    { label: 'Incomplete Treatments', value: '3', icon: '⏳' },
    { label: 'Monthly Production', value: '₹1.92L', icon: '₹' },
    { label: 'Follow-Up Patients', value: '7', icon: '↩' },
  ];

  appointments = [
    { time: '09:00', name: 'Anita Sharma', proc: 'Scaling & Polishing', status: 'completed', statusLabel: 'Done' },
    { time: '09:45', name: 'Farhan Qureshi', proc: 'Composite Filling', status: 'completed', statusLabel: 'Done' },
    { time: '10:30', name: 'Priya Mehta', proc: 'X-Ray + Consultation', status: 'completed', statusLabel: 'Done' },
    { time: '11:20', name: 'Rizwan Ali', proc: 'RCT — #46', status: 'current', statusLabel: 'Next' },
    { time: '12:10', name: 'Sunita Verma', proc: 'Crown Placement', status: 'upcoming', statusLabel: 'Later' },
    { time: '14:00', name: 'Karan Joshi', proc: 'Orthodontic Review', status: 'upcoming', statusLabel: 'Later' },
    { time: '15:30', name: 'Leena Patel', proc: 'Tooth Extraction', status: 'upcoming', statusLabel: 'Later' },
  ];

  todos = [
    { title: 'Complete chart — Farhan Q.', sub: 'Composite, tooth #14', done: false, p: 'high' },
    { title: 'Sign clinical note — Anita S.', sub: 'Scaling session today', done: false, p: 'high' },
    { title: 'Review X-ray — Priya M.', sub: 'Periapical series', done: false, p: 'med' },
    { title: 'Finalize treatment plan — Leena P.', sub: 'Implant proposal', done: false, p: 'med' },
    { title: 'Lab case follow-up — Sunita V.', sub: 'Zirconia crown, lab #7', done: true, p: 'low' },
  ];

  medAlerts = [
    { name: 'Rizwan Ali', detail: 'Penicillin allergy · Anticoagulant medication', icon: '⚠', bg: '#fff5f5' },
    { name: 'Sunita Verma', detail: 'Diabetic — check pre-op glucose level', icon: '💉', bg: '#fff8e6' },
    { name: 'Karan Joshi', detail: 'Asthma — avoid metronidazole', icon: '🫁', bg: '#f0f9ff' },
  ];
}