import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-assistant-dashboard-page',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="dash-page">

      <!-- Header -->
      <div class="page-header">
        <div>
          <span class="portal-tag">Assistant Portal</span>
          <h1 class="page-title">Chairside Operations</h1>
        </div>
        <div class="header-actions">
          <div class="date-pill"><span class="live-dot"></span> Mon, 9 Jun 2025</div>
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
          <div class="kpi-sub">{{ k.sub }}</div>
        </div>
      </div>

      <!-- Task Board + Right -->
      <div class="main-grid">

        <!-- Task Board -->
        <div class="card">
          <div class="card-head">
            <h3 class="section-title">Task Board</h3>
            <div class="tab-group">
              <button class="tab active">All (8)</button>
              <button class="tab">Pending (5)</button>
              <button class="tab">Done (3)</button>
            </div>
          </div>
          <div class="kanban">
            <div class="kanban-col">
              <div class="col-hdr urgent">
                <span class="col-dot red"></span> Urgent
              </div>
              <div class="task-card" *ngFor="let t of urgent">
                <div class="tc-meta">
                  <span class="room-tag">{{ t.room }}</span>
                  <span class="tc-time">{{ t.time }}</span>
                </div>
                <div class="tc-title">{{ t.title }}</div>
                <div class="tc-desc">{{ t.desc }}</div>
              </div>
            </div>
            <div class="kanban-col">
              <div class="col-hdr inprog">
                <span class="col-dot amber"></span> In Progress
              </div>
              <div class="task-card ip" *ngFor="let t of inprog">
                <div class="tc-meta">
                  <span class="room-tag amber">{{ t.room }}</span>
                  <span class="tc-time">{{ t.time }}</span>
                </div>
                <div class="tc-title">{{ t.title }}</div>
                <div class="tc-desc">{{ t.desc }}</div>
              </div>
            </div>
            <div class="kanban-col">
              <div class="col-hdr done">
                <span class="col-dot green"></span> Completed
              </div>
              <div class="task-card done-card" *ngFor="let t of done">
                <div class="tc-meta">
                  <span class="room-tag teal">{{ t.room }}</span>
                  <span class="tc-time">{{ t.time }}</span>
                </div>
                <div class="tc-title">{{ t.title }}</div>
                <div class="tc-desc">{{ t.desc }}</div>
              </div>
            </div>
          </div>
        </div>

        <!-- Right Col -->
        <div class="right-col">

          <!-- Upcoming Procedures -->
          <div class="card">
            <div class="card-head">
              <h3 class="section-title">Upcoming Procedures</h3>
            </div>
            <div class="proc-list">
              <div class="proc-row" *ngFor="let p of procs">
                <span class="proc-time">{{ p.time }}</span>
                <div class="proc-body">
                  <div class="proc-name">{{ p.name }}</div>
                  <div class="proc-type">{{ p.type }}</div>
                </div>
                <span class="room-badge" [class]="p.rc">{{ p.room }}</span>
              </div>
            </div>
          </div>

          <!-- Inventory -->
          <div class="card">
            <div class="card-head">
              <h3 class="section-title">📦 Inventory Alerts</h3>
              <span class="badge-red">2 critical</span>
            </div>
            <div class="inv-list">
              <div class="inv-row" *ngFor="let i of inv">
                <div class="inv-ico" [style.background]="i.bg">{{ i.icon }}</div>
                <div class="inv-info">
                  <div class="inv-name">{{ i.name }}</div>
                  <div class="inv-level">
                    <div class="lvl-track">
                      <div class="lvl-fill" [class]="i.sev" [style.width]="i.pct"></div>
                    </div>
                    <span class="lvl-lbl" [class]="i.sev">{{ i.stock }}</span>
                  </div>
                </div>
              </div>
            </div>
          </div>

          <!-- Sterilization -->
          <div class="card">
            <div class="card-head">
              <h3 class="section-title">🧫 Sterilization Queue</h3>
              <span class="badge-blue">3 trays</span>
            </div>
            <div class="steril-list">
              <div class="steril-row" *ngFor="let s of steril">
                <div class="steril-body">
                  <div class="steril-name">{{ s.name }}</div>
                  <span class="steril-status" [class]="s.sc">{{ s.status }}</span>
                </div>
                <span class="steril-eta">{{ s.eta }}</span>
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
    .icon-btn { background: #fff; border: 1px solid #dee2e6; border-radius: 8px; width: 34px; height: 34px; cursor: pointer; color: #6c757d; font-size: 0.85rem; transition: all .15s; display: flex; align-items: center; justify-content: center; }
    .icon-btn:hover { border-color: #10b981; color: #10b981; }

    /* KPI */
    .kpi-grid { display: grid; grid-template-columns: repeat(auto-fit, minmax(160px, 1fr)); gap: 0.85rem; }
    .kpi-card { background: #fff; border: 1px solid #dee2e6; border-radius: 10px; padding: 1rem 1.1rem; transition: box-shadow .2s; }
    .kpi-card:hover { box-shadow: 0 3px 14px rgba(0,0,0,.07); }
    .kpi-top-row { display: flex; justify-content: space-between; margin-bottom: 0.3rem; }
    .kpi-label { font-size: 0.76rem; color: #6c757d; font-weight: 600; line-height: 1.3; }
    .kpi-ico { font-size: 1rem; opacity: 0.5; }
    .kpi-val { font-size: 1.45rem; font-weight: 700; color: #212529; }
    .kpi-sub { font-size: 0.71rem; color: #adb5bd; margin-top: 0.12rem; }

    /* Card */
    .card { background: #fff; border: 1px solid #dee2e6; border-radius: 10px; padding: 1.2rem 1.3rem; }
    .card-head { display: flex; align-items: center; justify-content: space-between; margin-bottom: 1rem; }
    .section-title { margin: 0; font-size: 0.95rem; font-weight: 700; color: #212529; }

    /* Main grid */
    .main-grid { display: grid; grid-template-columns: 1.5fr 1fr; gap: 1rem; }
    .right-col { display: flex; flex-direction: column; gap: 1rem; }

    /* Tabs */
    .tab-group { display: flex; background: #f8f9fa; border: 1px solid #dee2e6; border-radius: 7px; padding: 2px; gap: 2px; }
    .tab { border: none; background: transparent; border-radius: 5px; padding: 0.28rem 0.7rem; font-size: 0.75rem; font-weight: 600; color: #6c757d; cursor: pointer; }
    .tab.active { background: #fff; color: #10b981; box-shadow: 0 1px 3px rgba(0,0,0,.1); }

    /* Kanban */
    .kanban { display: grid; grid-template-columns: 1fr 1fr 1fr; gap: 0.8rem; }
    .kanban-col { display: flex; flex-direction: column; gap: 0.5rem; }
    .col-hdr { display: flex; align-items: center; gap: 0.4rem; font-size: 0.75rem; font-weight: 700; padding: 0.3rem 0.5rem; border-radius: 7px; margin-bottom: 0.2rem; }
    .col-hdr.urgent { background: #fff5f5; color: #dc2626; }
    .col-hdr.inprog { background: #fffbf0; color: #b45309; }
    .col-hdr.done { background: #f0fdf4; color: #16a34a; }
    .col-dot { width: 7px; height: 7px; border-radius: 50%; }
    .col-dot.red { background: #ef4444; }
    .col-dot.amber { background: #f59e0b; }
    .col-dot.green { background: #10b981; }

    .task-card { background: #f8f9fa; border-radius: 8px; padding: 0.65rem 0.75rem; border-left: 3px solid #ef4444; }
    .task-card.ip { border-left-color: #f59e0b; }
    .task-card.done-card { border-left-color: #10b981; opacity: 0.65; }
    .tc-meta { display: flex; justify-content: space-between; align-items: center; margin-bottom: 0.3rem; }
    .room-tag { font-size: 0.67rem; font-weight: 700; background: #ede9fe; color: #6d28d9; padding: 0.1rem 0.4rem; border-radius: 4px; }
    .room-tag.amber { background: #fff8e6; color: #b45309; }
    .room-tag.teal { background: #e6f9f4; color: #0d9488; }
    .tc-time { font-size: 0.67rem; color: #adb5bd; }
    .tc-title { font-size: 0.81rem; font-weight: 600; color: #212529; }
    .tc-desc { font-size: 0.71rem; color: #6c757d; margin-top: 0.15rem; }

    /* Procedures */
    .proc-list { display: flex; flex-direction: column; gap: 0.45rem; }
    .proc-row { display: flex; align-items: center; gap: 0.65rem; padding: 0.55rem 0.6rem; border-radius: 8px; background: #f8f9fa; }
    .proc-time { font-size: 0.73rem; color: #adb5bd; font-weight: 600; width: 42px; flex-shrink: 0; }
    .proc-body { flex: 1; }
    .proc-name { font-size: 0.81rem; font-weight: 600; color: #212529; }
    .proc-type { font-size: 0.72rem; color: #6c757d; }
    .room-badge { font-size: 0.7rem; font-weight: 700; padding: 0.18rem 0.5rem; border-radius: 6px; flex-shrink: 0; }
    .room-badge.r1 { background: #ede9fe; color: #6d28d9; }
    .room-badge.r2 { background: #e6f9f4; color: #0d9488; }
    .room-badge.r4 { background: #dbeafe; color: #1d4ed8; }

    /* Inventory */
    .badge-red { background: #fff5f5; color: #dc2626; border: 1px solid #fecaca; font-size: 0.7rem; font-weight: 700; padding: 0.18rem 0.55rem; border-radius: 20px; }
    .badge-blue { background: #f0f9ff; color: #1d4ed8; border: 1px solid #bfdbfe; font-size: 0.7rem; font-weight: 700; padding: 0.18rem 0.55rem; border-radius: 20px; }
    .inv-list { display: flex; flex-direction: column; gap: 0.55rem; }
    .inv-row { display: flex; align-items: center; gap: 0.65rem; }
    .inv-ico { width: 30px; height: 30px; border-radius: 7px; display: flex; align-items: center; justify-content: center; font-size: 0.88rem; flex-shrink: 0; }
    .inv-info { flex: 1; }
    .inv-name { font-size: 0.8rem; font-weight: 600; color: #212529; margin-bottom: 0.2rem; }
    .inv-level { display: flex; align-items: center; gap: 0.5rem; }
    .lvl-track { flex: 1; height: 5px; background: #f1f3f4; border-radius: 99px; overflow: hidden; }
    .lvl-fill { height: 100%; border-radius: 99px; }
    .lvl-fill.critical { background: #ef4444; }
    .lvl-fill.low { background: #f59e0b; }
    .lvl-fill.ok { background: #10b981; }
    .lvl-lbl { font-size: 0.7rem; font-weight: 600; }
    .lvl-lbl.critical { color: #dc2626; }
    .lvl-lbl.low { color: #b45309; }
    .lvl-lbl.ok { color: #16a34a; }

    /* Sterilization */
    .steril-list { display: flex; flex-direction: column; gap: 0.45rem; }
    .steril-row { display: flex; align-items: center; justify-content: space-between; padding: 0.6rem 0.7rem; background: #f8f9fa; border-radius: 8px; }
    .steril-body { display: flex; align-items: center; gap: 0.5rem; }
    .steril-name { font-size: 0.8rem; font-weight: 600; color: #212529; }
    .steril-status { font-size: 0.7rem; font-weight: 600; padding: 0.13rem 0.45rem; border-radius: 5px; }
    .steril-status.processing { background: #fff8e6; color: #b45309; }
    .steril-status.queued { background: #f8f9fa; color: #6c757d; border: 1px solid #dee2e6; }
    .steril-status.ready { background: #e6f9f4; color: #0d9488; }
    .steril-eta { font-size: 0.73rem; color: #adb5bd; font-weight: 500; }

    @media (max-width: 960px) { .main-grid { grid-template-columns: 1fr; } .kanban { grid-template-columns: 1fr; } }
    @media (max-width: 640px) { .kpi-grid { grid-template-columns: 1fr 1fr; } }
  `]
})
export class AssistantDashboardPage {
  kpis = [
    { label: "Today's Procedures", value: '11', icon: '🦷', sub: 'Across 3 rooms' },
    { label: 'Rooms Assigned', value: '1, 2, 4', icon: '🚪', sub: 'Active now' },
    { label: 'Lab Cases Ready', value: '4 / 5', icon: '🧪', sub: '1 pending' },
    { label: 'Sterilization Queue', value: '3 trays', icon: '🧫', sub: 'In progress' },
    { label: 'Low Supply Alerts', value: '2', icon: '⚠', sub: 'Critical items' },
  ];

  urgent = [
    { room: 'Room 2', time: '11:15 AM', title: 'Prepare for RCT', desc: 'Endo kit + irrigation' },
    { room: 'Room 1', time: '11:00 AM', title: 'Upload X-ray', desc: 'Priya M. — periapical' },
  ];

  inprog = [
    { room: 'Room 4', time: 'Ongoing', title: 'Assist Extraction', desc: 'Dr. Kapoor' },
    { room: 'Room 2', time: 'Ongoing', title: 'Disinfect surfaces', desc: 'Post-composite session' },
  ];

  done = [
    { room: 'Room 1', time: '09:30 AM', title: 'Room setup done', desc: 'Scaling instruments' },
    { room: 'Room 2', time: '10:00 AM', title: 'Tray sterilized', desc: 'Tray #3 cleared' },
  ];

  procs = [
    { time: '11:20', name: 'Rizwan Ali — RCT', type: 'Root Canal · Dr. Rajan', room: 'R2', rc: 'r2' },
    { time: '12:10', name: 'Sunita Verma — Crown', type: 'Crown Placement · Dr. Rajan', room: 'R1', rc: 'r1' },
    { time: '14:00', name: 'Karan Joshi — Ortho', type: 'Braces Adj. · Dr. Mehta', room: 'R4', rc: 'r4' },
  ];

  inv = [
    { icon: '🧤', name: 'Latex Gloves (S)', stock: '4 boxes left', pct: '12%', sev: 'critical', bg: '#fff5f5' },
    { icon: '💉', name: 'Lidocaine 2%', stock: '6 cartridges', pct: '25%', sev: 'low', bg: '#fffbf0' },
    { icon: '🧻', name: 'Gauze Rolls', stock: '2 packs', pct: '8%', sev: 'critical', bg: '#fff5f5' },
    { icon: '🪥', name: 'Prophy Paste', stock: 'Adequate', pct: '68%', sev: 'ok', bg: '#f0fdf4' },
  ];

  steril = [
    { name: 'Tray #1 — Extraction Kit', status: 'Processing', sc: 'processing', eta: '~12 min' },
    { name: 'Tray #2 — Mirror & Probe Set', status: 'Queued', sc: 'queued', eta: '~30 min' },
    { name: 'Tray #3 — Scaling Instruments', status: 'Ready ✓', sc: 'ready', eta: 'Done' },
  ];
}