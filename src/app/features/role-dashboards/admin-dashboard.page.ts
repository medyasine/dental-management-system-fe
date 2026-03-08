import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-admin-dashboard-page',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="dash-page">

      <!-- Page Header -->
      <div class="page-header">
        <div>
          <span class="portal-tag">Admin Portal</span>
          <h1 class="page-title">Business Overview</h1>
        </div>
        <div class="header-actions">
          <div class="date-pill">
            <span class="live-dot"></span>
            Mon, 9 Jun 2025
          </div>
          <button class="icon-btn pi pi-bell"></button>
          <button class="icon-btn pi pi-cog"></button>
        </div>
      </div>

      <!-- KPI Cards -->
      <div class="kpi-grid">
        <div class="kpi-card" *ngFor="let k of kpis">
          <div class="kpi-top-row">
            <span class="kpi-label">{{ k.label }}</span>
            <span class="kpi-ico">{{ k.icon }}</span>
          </div>
          <div class="kpi-val">{{ k.value }}</div>
          <div class="kpi-trend" [class.trend-up]="k.up" [class.trend-down]="!k.up">
            {{ k.up ? '▲' : '▼' }} {{ k.delta }}
          </div>
        </div>
      </div>

      <!-- Charts Row -->
      <div class="charts-row">

        <!-- Revenue Trend -->
        <div class="card flex-2">
          <div class="card-head">
            <h3 class="section-title">Revenue Trend</h3>
            <div class="seg-group">
              <button class="seg active">Daily</button>
              <button class="seg">Weekly</button>
              <button class="seg">Monthly</button>
            </div>
          </div>
          <div class="bar-area">
            <div class="bar-col" *ngFor="let b of bars">
              <div class="bar-track">
                <div class="bar-fill" [class.peak]="b.peak" [style.height.%]="b.h">
                  <span class="bar-tip">₹{{ b.v }}K</span>
                </div>
              </div>
              <span class="bar-lbl">{{ b.d }}</span>
            </div>
          </div>
          <div class="bar-legend">
            <span class="leg-item"><span class="leg-dot teal"></span>Revenue</span>
            <span class="leg-item"><span class="leg-dot dark"></span>Peak</span>
          </div>
        </div>

        <!-- Donut -->
        <div class="card flex-1">
          <div class="card-head">
            <h3 class="section-title">Appointment Status</h3>
          </div>
          <div class="donut-wrap">
            <svg viewBox="0 0 130 130" class="donut-svg">
              <circle cx="65" cy="65" r="48" fill="none" stroke="#f0f4f3" stroke-width="16"/>
              <circle cx="65" cy="65" r="48" fill="none" stroke="#10b981" stroke-width="16"
                stroke-dasharray="151 151" stroke-dashoffset="38" stroke-linecap="round"
                transform="rotate(-90 65 65)"/>
              <circle cx="65" cy="65" r="48" fill="none" stroke="#f59e0b" stroke-width="16"
                stroke-dasharray="45 257" stroke-dashoffset="-113" stroke-linecap="round"
                transform="rotate(-90 65 65)"/>
              <circle cx="65" cy="65" r="48" fill="none" stroke="#ef4444" stroke-width="16"
                stroke-dasharray="22 280" stroke-dashoffset="-158" stroke-linecap="round"
                transform="rotate(-90 65 65)"/>
              <text x="65" y="60" text-anchor="middle" class="d-big">42</text>
              <text x="65" y="75" text-anchor="middle" class="d-sub">today</text>
            </svg>
            <div class="donut-rows">
              <div class="d-row" *ngFor="let d of donutItems">
                <span class="d-dot" [style.background]="d.color"></span>
                <span class="d-lbl">{{ d.label }}</span>
                <strong class="d-num">{{ d.val }}</strong>
              </div>
            </div>
          </div>
        </div>

      </div>

      <!-- Bottom Row -->
      <div class="bottom-row">

        <!-- Staff Table -->
        <div class="card flex-2">
          <div class="card-head">
            <h3 class="section-title">Staff Performance</h3>
            <span class="sub-label">June 2025</span>
          </div>
          <table class="styled-table">
            <thead>
              <tr>
                <th>Dentist</th>
                <th>Revenue</th>
                <th>Appointments</th>
                <th>Acceptance Rate</th>
              </tr>
            </thead>
            <tbody>
              <tr *ngFor="let s of staff">
                <td>
                  <div class="name-cell">
                    <div class="av-chip">{{ s.init }}</div>
                    <span>{{ s.name }}</span>
                  </div>
                </td>
                <td class="fw6">{{ s.rev }}</td>
                <td class="fw6 tc">{{ s.appts }}</td>
                <td>
                  <div class="prog-cell">
                    <div class="prog-track">
                      <div class="prog-fill" [class.high]="s.rn > 75" [style.width]="s.rate"></div>
                    </div>
                    <span class="prog-pct">{{ s.rate }}</span>
                  </div>
                </td>
              </tr>
            </tbody>
          </table>
        </div>

        <!-- Alerts Panel -->
        <div class="card flex-1">
          <div class="card-head">
            <h3 class="section-title">Alerts</h3>
            <span class="alert-count-badge">4 new</span>
          </div>
          <div class="alerts-stack">
            <div class="alert-item" *ngFor="let a of alerts" [class]="'alert-item ' + a.cls">
              <span class="alert-bar"></span>
              <div class="alert-body">
                <div class="alert-ttl">{{ a.title }}</div>
                <div class="alert-desc">{{ a.desc }}</div>
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

    /* ── Header ── */
    .page-header { display: flex; align-items: flex-end; justify-content: space-between; }
    .portal-tag { display: block; font-size: 0.7rem; font-weight: 700; color: #10b981; text-transform: uppercase; letter-spacing: 0.12em; margin-bottom: 0.15rem; }
    .page-title { margin: 0; font-size: 1.65rem; font-weight: 700; color: var(--text-color, #212529); }
    .header-actions { display: flex; align-items: center; gap: 0.5rem; }
    .date-pill { display: flex; align-items: center; gap: 0.45rem; background: #fff; border: 1px solid #dee2e6; border-radius: 8px; padding: 0.4rem 0.85rem; font-size: 0.8rem; color: #495057; font-weight: 500; }
    .live-dot { width: 6px; height: 6px; border-radius: 50%; background: #10b981; animation: pulse 2s infinite; }
    @keyframes pulse { 0%,100%{opacity:1}50%{opacity:.3} }
    .icon-btn { background: #fff; border: 1px solid #dee2e6; border-radius: 8px; width: 34px; height: 34px; cursor: pointer; color: #6c757d; font-size: 0.85rem; transition: all 0.15s; display: flex; align-items: center; justify-content: center; }
    .icon-btn:hover { border-color: #10b981; color: #10b981; }

    /* ── KPI Grid ── */
    .kpi-grid { display: grid; grid-template-columns: repeat(auto-fit, minmax(175px, 1fr)); gap: 0.85rem; }
    .kpi-card { background: #fff; border: 1px solid #dee2e6; border-radius: 10px; padding: 1rem 1.1rem; transition: box-shadow 0.2s; cursor: default; }
    .kpi-card:hover { box-shadow: 0 3px 14px rgba(0,0,0,0.07); }
    .kpi-top-row { display: flex; justify-content: space-between; margin-bottom: 0.35rem; }
    .kpi-label { font-size: 0.77rem; color: #6c757d; font-weight: 600; line-height: 1.3; }
    .kpi-ico { font-size: 1rem; opacity: 0.55; }
    .kpi-val { font-size: 1.5rem; font-weight: 700; color: #212529; margin-bottom: 0.25rem; }
    .kpi-trend { font-size: 0.73rem; font-weight: 600; }
    .trend-up { color: #10b981; }
    .trend-down { color: #ef4444; }

    /* ── Card Shell ── */
    .card { background: #fff; border: 1px solid #dee2e6; border-radius: 10px; padding: 1.2rem 1.3rem; }
    .card-head { display: flex; align-items: center; justify-content: space-between; margin-bottom: 1rem; }
    .section-title { margin: 0; font-size: 0.95rem; font-weight: 700; color: #212529; }
    .sub-label { font-size: 0.76rem; color: #adb5bd; }

    /* ── Charts Row ── */
    .charts-row { display: flex; gap: 1rem; }
    .flex-1 { flex: 1; }
    .flex-2 { flex: 2; }

    /* ── Bar Chart ── */
    .seg-group { display: flex; background: #f8f9fa; border: 1px solid #dee2e6; border-radius: 7px; padding: 2px; gap: 2px; }
    .seg { border: none; background: transparent; border-radius: 5px; padding: 0.28rem 0.7rem; font-size: 0.76rem; font-weight: 600; color: #6c757d; cursor: pointer; }
    .seg.active { background: #fff; color: #10b981; box-shadow: 0 1px 3px rgba(0,0,0,0.1); }
    .bar-area { display: flex; align-items: flex-end; gap: 5px; height: 120px; padding: 0 2px; }
    .bar-col { flex: 1; display: flex; flex-direction: column; align-items: center; gap: 3px; }
    .bar-track { flex: 1; width: 100%; display: flex; align-items: flex-end; }
    .bar-fill { width: 100%; background: #10b981; border-radius: 3px 3px 2px 2px; min-height: 5px; position: relative; cursor: pointer; transition: opacity .2s; }
    .bar-fill:hover { opacity: 0.8; }
    .bar-fill:hover .bar-tip { opacity: 1; }
    .bar-fill.peak { background: #0f766e; }
    .bar-tip { position: absolute; bottom: calc(100% + 4px); left: 50%; transform: translateX(-50%); background: #212529; color: #fff; font-size: 0.63rem; padding: 2px 5px; border-radius: 4px; white-space: nowrap; opacity: 0; pointer-events: none; transition: opacity .15s; }
    .bar-lbl { font-size: 0.66rem; color: #adb5bd; }
    .bar-legend { display: flex; gap: 1rem; margin-top: 0.5rem; font-size: 0.76rem; color: #6c757d; }
    .leg-item { display: flex; align-items: center; gap: 4px; }
    .leg-dot { width: 8px; height: 8px; border-radius: 50%; }
    .leg-dot.teal { background: #10b981; }
    .leg-dot.dark { background: #0f766e; }

    /* ── Donut ── */
    .donut-wrap { display: flex; flex-direction: column; align-items: center; gap: 1rem; }
    .donut-svg { width: 130px; height: 130px; }
    .d-big { font-size: 24px; font-weight: 700; fill: #212529; }
    .d-sub { font-size: 9.5px; fill: #adb5bd; }
    .donut-rows { width: 100%; display: flex; flex-direction: column; gap: 0.5rem; }
    .d-row { display: flex; align-items: center; gap: 0.5rem; font-size: 0.8rem; color: #495057; }
    .d-dot { width: 9px; height: 9px; border-radius: 3px; flex-shrink: 0; }
    .d-lbl { flex: 1; }
    .d-num { font-weight: 700; color: #212529; font-size: 0.85rem; }

    /* ── Bottom Row ── */
    .bottom-row { display: flex; gap: 1rem; }

    /* ── Table ── */
    .styled-table { width: 100%; border-collapse: collapse; font-size: 0.82rem; }
    .styled-table th { text-align: left; font-size: 0.7rem; font-weight: 700; color: #adb5bd; text-transform: uppercase; letter-spacing: 0.06em; padding: 0 0.5rem 0.65rem; border-bottom: 1px solid #f1f3f4; }
    .styled-table td { padding: 0.65rem 0.5rem; border-bottom: 1px solid #f8f9fa; color: #495057; vertical-align: middle; }
    .styled-table tr:last-child td { border-bottom: none; }
    .name-cell { display: flex; align-items: center; gap: 0.5rem; font-weight: 600; color: #212529; }
    .av-chip { width: 28px; height: 28px; border-radius: 8px; background: linear-gradient(135deg, #10b981, #0d9488); color: #fff; font-size: 0.62rem; font-weight: 700; display: flex; align-items: center; justify-content: center; flex-shrink: 0; }
    .fw6 { font-weight: 600; color: #212529; }
    .tc { text-align: center; }
    .prog-cell { display: flex; align-items: center; gap: 0.5rem; }
    .prog-track { flex: 1; height: 6px; background: #f1f3f4; border-radius: 99px; overflow: hidden; }
    .prog-fill { height: 100%; background: #ced4da; border-radius: 99px; }
    .prog-fill.high { background: #10b981; }
    .prog-pct { font-size: 0.73rem; color: #6c757d; font-weight: 600; min-width: 30px; }

    /* ── Alerts ── */
    .alert-count-badge { background: #fff3cd; color: #856404; border: 1px solid #ffc107; font-size: 0.7rem; font-weight: 700; padding: 0.18rem 0.55rem; border-radius: 20px; }
    .alerts-stack { display: flex; flex-direction: column; gap: 0.5rem; }
    .alert-item { display: flex; align-items: stretch; gap: 0.7rem; padding: 0.7rem 0.8rem; border-radius: 8px; }
    .alert-bar { width: 3px; border-radius: 2px; flex-shrink: 0; }
    .alert-item.red { background: #fff5f5; } .alert-item.red .alert-bar { background: #ef4444; }
    .alert-item.amber { background: #fffbf0; } .alert-item.amber .alert-bar { background: #f59e0b; }
    .alert-item.blue { background: #f0f9ff; } .alert-item.blue .alert-bar { background: #3b82f6; }
    .alert-ttl { font-size: 0.81rem; font-weight: 700; color: #212529; }
    .alert-desc { font-size: 0.73rem; color: #6c757d; margin-top: 2px; }

    @media (max-width: 960px) {
      .charts-row, .bottom-row { flex-direction: column; }
      .flex-1, .flex-2 { flex: none; width: 100%; }
    }
    @media (max-width: 640px) { .kpi-grid { grid-template-columns: 1fr 1fr; } }
  `]
})
export class AdminDashboardPage {
  kpis = [
    { label: "Today's Revenue", value: '₹28,500', delta: '12% vs yesterday', up: true, icon: '₹' },
    { label: 'MTD Revenue', value: '₹6.72L', delta: '8% vs last month', up: true, icon: '📈' },
    { label: 'Outstanding', value: '₹1.24L', delta: '3 invoices', up: false, icon: '⚠' },
    { label: 'Appointments', value: '42', delta: '4 more than avg', up: true, icon: '📅' },
    { label: 'No-Show Rate', value: '6.8%', delta: '1.2% improvement', up: true, icon: '↩' },
    { label: 'Chair Utilization', value: '78%', delta: '2% vs target', up: false, icon: '💺' },
    { label: 'Treatment Accept.', value: '71%', delta: '5% above target', up: true, icon: '✔' },
  ];

  bars = [
    { d: 'M', h: 58, peak: false, v: 22 }, { d: 'T', h: 72, peak: false, v: 27 },
    { d: 'W', h: 50, peak: false, v: 19 }, { d: 'T', h: 88, peak: true, v: 34 },
    { d: 'F', h: 80, peak: false, v: 31 }, { d: 'S', h: 65, peak: false, v: 25 },
    { d: 'S', h: 40, peak: false, v: 15 }, { d: 'M', h: 62, peak: false, v: 24 },
    { d: 'T', h: 74, peak: false, v: 28 }, { d: 'W', h: 82, peak: false, v: 32 },
    { d: 'T', h: 90, peak: true, v: 35 }, { d: 'F', h: 85, peak: false, v: 33 },
    { d: 'S', h: 70, peak: false, v: 27 },
  ];

  donutItems = [
    { label: 'Completed', val: 29, color: '#10b981' },
    { label: 'Upcoming', val: 10, color: '#f59e0b' },
    { label: 'No-show', val: 3, color: '#ef4444' },
  ];

  staff = [
    { init: 'DR', name: 'Dr. Rajan', rev: '₹94,200', appts: '18', rate: '82%', rn: 82 },
    { init: 'DK', name: 'Dr. Kapoor', rev: '₹78,500', appts: '14', rate: '74%', rn: 74 },
    { init: 'DM', name: 'Dr. Mehta', rev: '₹61,300', appts: '10', rate: '68%', rn: 68 },
  ];

  alerts = [
    { title: 'High unpaid balances', desc: '₹1,24,300 overdue — 11 invoices', cls: 'red' },
    { title: 'Insurance claim delayed', desc: '3 claims pending > 15 days', cls: 'amber' },
    { title: 'Overdue lab cases', desc: '2 cases past delivery date', cls: 'amber' },
    { title: 'Low booking trend', desc: 'Thursday afternoon slots at 40%', cls: 'blue' },
  ];
}