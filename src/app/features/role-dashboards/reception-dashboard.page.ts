import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-reception-dashboard-page',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="dash-page">

      <!-- Header -->
      <div class="page-header">
        <div>
          <span class="portal-tag">Reception Portal</span>
          <h1 class="page-title">Front Desk Overview</h1>
        </div>
        <div class="header-actions">
          <div class="date-pill"><span class="live-dot"></span> Mon, 9 Jun 2025</div>
          <button class="btn-new pi pi-plus"> New Appointment</button>
          <button class="icon-btn pi pi-bell"></button>
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
          <div class="kpi-sub" [class.kpi-alert]="k.alert">{{ k.sub }}</div>
        </div>
      </div>

      <!-- Main Grid -->
      <div class="main-grid">

        <!-- Appointments Panel -->
        <div class="card">
          <div class="card-head">
            <h3 class="section-title">Today's Appointments</h3>
            <div class="filter-group">
              <button class="filter-btn active">All (38)</button>
              <button class="filter-btn green">Confirmed (29)</button>
              <button class="filter-btn amber">Pending (9)</button>
            </div>
          </div>
          <div class="appt-list">
            <div class="appt-row" *ngFor="let a of appointments" [class.noshow]="a.status === 'noshow'">
              <span class="appt-time">{{ a.time }}</span>
              <div class="appt-av">{{ a.init }}</div>
              <div class="appt-body">
                <div class="appt-name">{{ a.name }}</div>
                <div class="appt-meta">{{ a.dentist }} · {{ a.type }}</div>
              </div>
              <span class="status-tag" [class]="a.status">{{ a.label }}</span>
              <div class="appt-btns">
                <button class="appt-btn pi pi-pencil"></button>
                <button class="appt-btn danger pi pi-times"></button>
              </div>
            </div>
          </div>
        </div>

        <!-- Right Column -->
        <div class="right-col">

          <!-- Quick Actions -->
          <div class="card">
            <h3 class="section-title" style="margin-bottom: 0.85rem">Quick Actions</h3>
            <div class="qa-grid">
              <button class="qa-btn" *ngFor="let q of qaButtons" [class]="'qa-btn ' + q.cls">
                <span class="qa-icon">{{ q.icon }}</span>
                <span class="qa-label">{{ q.label }}</span>
              </button>
            </div>
          </div>

          <!-- Communication Queue -->
          <div class="card">
            <div class="card-head">
              <h3 class="section-title">📲 Communication Queue</h3>
              <span class="badge-amber">8 pending</span>
            </div>
            <div class="comm-list">
              <div class="comm-row" *ngFor="let c of comms">
                <div class="comm-ico" [class]="c.type">{{ c.icon }}</div>
                <div class="comm-body">
                  <div class="comm-name">{{ c.name }}</div>
                  <div class="comm-action">{{ c.action }}</div>
                </div>
                <button class="comm-btn" [class]="c.type">{{ c.btn }}</button>
              </div>
            </div>
          </div>

          <!-- Billing -->
          <div class="card">
            <div class="card-head">
              <h3 class="section-title">💳 Billing Snapshot</h3>
            </div>
            <div class="billing-list">
              <div class="bill-row" *ngFor="let b of billing">
                <div class="bill-left">
                  <div class="bill-ico" [style.background]="b.bg">{{ b.icon }}</div>
                  <div>
                    <div class="bill-label">{{ b.label }}</div>
                    <div class="bill-count">{{ b.count }}</div>
                  </div>
                </div>
                <div class="bill-amt" [class.red]="b.red">{{ b.amount }}</div>
              </div>
            </div>
          </div>

        </div>
      </div>

      <!-- Alert Strip -->
      <div class="alert-strip">
        <div class="astrip-item" *ngFor="let a of alertStrip" [class]="'astrip-item ' + a.type">
          {{ a.icon }} {{ a.text }}
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
    .icon-btn { background: #fff; border: 1px solid #dee2e6; border-radius: 8px; width: 34px; height: 34px; cursor: pointer; color: #6c757d; font-size: 0.85rem; transition: all .15s; display: flex; align-items: center; justify-content: center; }
    .icon-btn:hover { border-color: #10b981; color: #10b981; }
    .btn-new { background: #10b981; color: #fff; border: none; border-radius: 8px; padding: 0.48rem 1rem; font-size: 0.82rem; font-weight: 600; cursor: pointer; transition: background .15s; gap: 0.3rem; display: flex; align-items: center; }
    .btn-new:hover { background: #0d9488; }

    /* KPI */
    .kpi-grid { display: grid; grid-template-columns: repeat(auto-fit, minmax(170px, 1fr)); gap: 0.85rem; }
    .kpi-card { background: #fff; border: 1px solid #dee2e6; border-radius: 10px; padding: 1rem 1.1rem; transition: box-shadow .2s; }
    .kpi-card:hover { box-shadow: 0 3px 14px rgba(0,0,0,.07); }
    .kpi-top-row { display: flex; justify-content: space-between; margin-bottom: 0.3rem; }
    .kpi-label { font-size: 0.76rem; color: #6c757d; font-weight: 600; line-height: 1.3; }
    .kpi-ico { font-size: 1rem; opacity: 0.55; }
    .kpi-val { font-size: 1.45rem; font-weight: 700; color: #212529; }
    .kpi-sub { font-size: 0.71rem; color: #adb5bd; margin-top: 0.12rem; }
    .kpi-sub.kpi-alert { color: #ef4444; font-weight: 600; }

    /* Card */
    .card { background: #fff; border: 1px solid #dee2e6; border-radius: 10px; padding: 1.2rem 1.3rem; }
    .card-head { display: flex; align-items: center; justify-content: space-between; margin-bottom: 1rem; }
    .section-title { margin: 0; font-size: 0.95rem; font-weight: 700; color: #212529; }

    /* Main Grid */
    .main-grid { display: grid; grid-template-columns: 1.4fr 1fr; gap: 1rem; }
    .right-col { display: flex; flex-direction: column; gap: 1rem; }

    /* Filter Group */
    .filter-group { display: flex; gap: 0.35rem; }
    .filter-btn { border: 1px solid #dee2e6; background: #f8f9fa; border-radius: 7px; padding: 0.28rem 0.65rem; font-size: 0.74rem; font-weight: 600; cursor: pointer; color: #6c757d; transition: all .15s; }
    .filter-btn.active { background: #fff; border-color: #dee2e6; color: #212529; }
    .filter-btn.green { background: #f0fdf4; border-color: #a7f3d0; color: #16a34a; }
    .filter-btn.amber { background: #fff8e6; border-color: #fde68a; color: #b45309; }

    /* Appointment List */
    .appt-list { display: flex; flex-direction: column; max-height: 380px; overflow-y: auto; }
    .appt-row { display: flex; align-items: center; gap: 0.7rem; padding: 0.6rem 0.4rem; border-bottom: 1px solid #f8f9fa; transition: background .15s; }
    .appt-row:last-child { border-bottom: none; }
    .appt-row:hover { background: #f8f9fa; border-radius: 8px; }
    .appt-row.noshow { opacity: 0.5; }
    .appt-time { font-size: 0.73rem; color: #adb5bd; font-weight: 600; width: 46px; flex-shrink: 0; }
    .appt-av { width: 32px; height: 32px; border-radius: 50%; background: linear-gradient(135deg, #10b981, #0d9488); color: #fff; font-size: 0.65rem; font-weight: 700; display: flex; align-items: center; justify-content: center; flex-shrink: 0; }
    .appt-body { flex: 1; min-width: 0; }
    .appt-name { font-size: 0.84rem; font-weight: 600; color: #212529; white-space: nowrap; overflow: hidden; text-overflow: ellipsis; }
    .appt-meta { font-size: 0.72rem; color: #6c757d; }
    .status-tag { font-size: 0.69rem; font-weight: 700; padding: 0.18rem 0.55rem; border-radius: 6px; flex-shrink: 0; white-space: nowrap; }
    .status-tag.confirmed { background: #e6f9f4; color: #0d9488; }
    .status-tag.pending { background: #fff8e6; color: #b45309; }
    .status-tag.walkin { background: #dbeafe; color: #1d4ed8; }
    .status-tag.noshow { background: #fff5f5; color: #dc2626; }
    .appt-btns { display: flex; gap: 0.3rem; }
    .appt-btn { background: #f8f9fa; border: 1px solid #dee2e6; border-radius: 6px; width: 26px; height: 26px; cursor: pointer; font-size: 0.7rem; color: #6c757d; transition: all .15s; display: flex; align-items: center; justify-content: center; }
    .appt-btn:hover { background: #e6f9f4; border-color: #10b981; color: #10b981; }
    .appt-btn.danger:hover { background: #fff5f5; border-color: #ef4444; color: #ef4444; }

    /* Quick Actions */
    .qa-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 0.6rem; }
    .qa-btn { display: flex; flex-direction: column; align-items: center; justify-content: center; gap: 0.35rem; border: none; border-radius: 10px; padding: 0.9rem 0.5rem; cursor: pointer; font-weight: 600; font-size: 0.77rem; transition: opacity .2s, transform .15s; }
    .qa-btn:hover { opacity: 0.85; transform: translateY(-1px); }
    .qa-icon { font-size: 1.3rem; }
    .qa-btn.teal { background: #e6f9f4; color: #0d9488; }
    .qa-btn.green { background: #f0fdf4; color: #16a34a; }
    .qa-btn.blue { background: #dbeafe; color: #1d4ed8; }
    .qa-btn.amber { background: #fff8e6; color: #b45309; }

    /* Comms */
    .badge-amber { background: #fff8e6; color: #b45309; border: 1px solid #fde68a; font-size: 0.7rem; font-weight: 700; padding: 0.18rem 0.55rem; border-radius: 20px; }
    .comm-list { display: flex; flex-direction: column; gap: 0.45rem; }
    .comm-row { display: flex; align-items: center; gap: 0.65rem; padding: 0.55rem 0.6rem; border-radius: 8px; background: #f8f9fa; }
    .comm-ico { width: 30px; height: 30px; border-radius: 7px; display: flex; align-items: center; justify-content: center; font-size: 0.9rem; flex-shrink: 0; }
    .comm-ico.confirm { background: #e6f9f4; }
    .comm-ico.sms { background: #dbeafe; }
    .comm-ico.call { background: #f0fdf4; }
    .comm-body { flex: 1; min-width: 0; }
    .comm-name { font-size: 0.81rem; font-weight: 600; color: #212529; }
    .comm-action { font-size: 0.71rem; color: #6c757d; }
    .comm-btn { border: none; border-radius: 7px; padding: 0.3rem 0.7rem; font-size: 0.72rem; font-weight: 700; cursor: pointer; flex-shrink: 0; }
    .comm-btn.confirm { background: #10b981; color: #fff; }
    .comm-btn.sms { background: #3b82f6; color: #fff; }
    .comm-btn.call { background: #16a34a; color: #fff; }

    /* Billing */
    .billing-list { display: flex; flex-direction: column; gap: 0.5rem; }
    .bill-row { display: flex; align-items: center; justify-content: space-between; padding: 0.65rem 0.7rem; border-radius: 8px; background: #f8f9fa; }
    .bill-left { display: flex; align-items: center; gap: 0.6rem; }
    .bill-ico { width: 30px; height: 30px; border-radius: 7px; display: flex; align-items: center; justify-content: center; font-size: 0.88rem; flex-shrink: 0; }
    .bill-label { font-size: 0.8rem; font-weight: 600; color: #212529; }
    .bill-count { font-size: 0.71rem; color: #adb5bd; }
    .bill-amt { font-size: 0.95rem; font-weight: 700; color: #212529; }
    .bill-amt.red { color: #dc2626; }

    /* Alert Strip */
    .alert-strip { display: flex; gap: 0.6rem; flex-wrap: wrap; }
    .astrip-item { display: flex; align-items: center; gap: 0.4rem; padding: 0.38rem 0.85rem; border-radius: 20px; font-size: 0.77rem; font-weight: 600; }
    .astrip-item.amber { background: #fff8e6; color: #b45309; border: 1px solid #fde68a; }
    .astrip-item.red { background: #fff5f5; color: #dc2626; border: 1px solid #fecaca; }
    .astrip-item.blue { background: #f0f9ff; color: #1d4ed8; border: 1px solid #bfdbfe; }

    @media (max-width: 900px) { .main-grid { grid-template-columns: 1fr; } }
    @media (max-width: 640px) { .kpi-grid { grid-template-columns: 1fr 1fr; } }
  `]
})
export class ReceptionDashboardPage {
  kpis = [
    { label: "Today's Appointments", value: '38', icon: '📅', sub: '4 walk-ins included', alert: false },
    { label: 'Confirmed', value: '29', icon: '✔', sub: '76% confirmation rate', alert: false },
    { label: 'Cancellations', value: '3', icon: '✕', sub: '↑ 1 from yesterday', alert: true },
    { label: 'No-Shows', value: '2', icon: '⚠', sub: 'Follow-up needed', alert: true },
    { label: 'Payments Today', value: '₹47,000', icon: '₹', sub: 'To collect', alert: false },
    { label: 'Outstanding', value: '₹1.24L', icon: '⏳', sub: '11 invoices overdue', alert: true },
  ];

  appointments = [
    { time: '09:00', name: 'Anita Sharma', init: 'AS', dentist: 'Dr. Rajan', type: 'Scaling', status: 'confirmed', label: 'Confirmed' },
    { time: '09:45', name: 'Farhan Qureshi', init: 'FQ', dentist: 'Dr. Rajan', type: 'Filling', status: 'confirmed', label: 'Confirmed' },
    { time: '10:30', name: 'Priya Mehta', init: 'PM', dentist: 'Dr. Kapoor', type: 'X-Ray + Consult', status: 'walkin', label: 'Walk-in' },
    { time: '11:20', name: 'Rizwan Ali', init: 'RA', dentist: 'Dr. Rajan', type: 'Root Canal', status: 'confirmed', label: 'Confirmed' },
    { time: '12:10', name: 'Sunita Verma', init: 'SV', dentist: 'Dr. Rajan', type: 'Crown', status: 'pending', label: 'Pending' },
    { time: '14:00', name: 'Karan Joshi', init: 'KJ', dentist: 'Dr. Mehta', type: 'Ortho Review', status: 'pending', label: 'Pending' },
    { time: '15:00', name: 'Deepak Roy', init: 'DR', dentist: 'Dr. Kapoor', type: 'Consultation', status: 'noshow', label: 'No-Show' },
  ];

  qaButtons = [
    { icon: '📅', label: 'Add Appointment', cls: 'teal' },
    { icon: '👤', label: 'Add Patient', cls: 'green' },
    { icon: '🧾', label: 'Create Invoice', cls: 'blue' },
    { icon: '📲', label: 'Send Reminder', cls: 'amber' },
  ];

  comms = [
    { icon: '✉', name: 'Sunita Verma', action: 'Appointment confirmation pending', type: 'confirm', btn: 'Confirm' },
    { icon: '📱', name: 'Karan Joshi', action: 'SMS reminder not sent', type: 'sms', btn: 'Send SMS' },
    { icon: '📞', name: 'Deepak Roy', action: 'No-show — needs callback', type: 'call', btn: 'Call' },
    { icon: '✉', name: 'Leena Patel', action: 'Overdue payment reminder', type: 'confirm', btn: 'Send' },
  ];

  billing = [
    { icon: '₹', label: 'Payments to Collect', count: '12 patients today', amount: '₹47,000', bg: '#e6f9f4', red: false },
    { icon: '📋', label: 'Insurance Verification', count: '4 pending verifications', amount: '4 pending', bg: '#dbeafe', red: false },
    { icon: '⚠', label: 'Outstanding Invoices', count: '11 overdue invoices', amount: '₹1,24,300', bg: '#fff5f5', red: true },
  ];

  alertStrip = [
    { icon: '⚠', text: '2 no-shows today — follow-up needed', type: 'amber' },
    { icon: '₹', text: 'Deepak Roy — overdue balance ₹8,400', type: 'red' },
    { icon: '📅', text: '4 afternoon slots still open', type: 'blue' },
  ];
}