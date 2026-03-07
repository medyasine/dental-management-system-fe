import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

interface MetricCard {
  label: string;
  value: string;
  icon: string;
}

@Component({
  selector: 'app-home-page',
  standalone: true,
  imports: [CommonModule, FormsModule],
  template: `
    <div class="dashboard-page p-3 lg:p-4">
      <div class="dashboard-shell">
        <div class="crumb">Main <span>&gt;</span> Dashboard</div>

        <div class="dashboard-highlight">
        <div class="hero-row">
          <h1>Good Morning <strong>Ms.Shanze Mirza</strong></h1>
          <div class="hero-actions">
            <input type="date" [(ngModel)]="selectedDate" />
            <button type="button" (click)="onSubmitDate()">Submit</button>
          </div>
        </div>

        <h2 class="section-title">Performance</h2>

        <div class="top-grid">
          <div class="metrics-grid">
            <div class="metric-card" *ngFor="let card of metricCards">
              <p>{{ card.label }}</p>
              <div class="metric-row">
                <h3>{{ card.value }}</h3>
                <i [class]="card.icon"></i>
              </div>
            </div>
          </div>

          <div class="panel age-panel">
            <h3>Visited Patient by age</h3>
            <div class="age-bands">
              <div class="band">
                <img src="/age/0-25.png" alt="0-25 age" />
                <p>0-25 age</p>
                <strong>1</strong>
              </div>
              <div class="band">
                <img src="/age/26-50.png" alt="26-50 age" />
                <p>26-50 age</p>
                <strong>0</strong>
              </div>
              <div class="band">
                <img src="/age/50+.png" alt="50+ age" />
                <p>50+ age</p>
                <strong>0</strong>
              </div>
            </div>
          </div>
        </div>

        <div class="bottom-grid">
          <div class="panel revenue-panel">
            <div class="panel-head">
              <h3>Total Revenue</h3>
              <span>Year</span>
            </div>

            <div class="chart-area">
              <div class="line-track">
                <div class="line-point" style="left: 4%"></div>
                <div class="line-point" style="left: 12%"></div>
                <div class="line-point" style="left: 20%"></div>
                <div class="line-point" style="left: 28%"></div>
                <div class="line-point" style="left: 36%"></div>
                <div class="line-point" style="left: 44%"></div>
                <div class="line-point" style="left: 52%"></div>
                <div class="line-point" style="left: 60%"></div>
                <div class="line-point" style="left: 68%"></div>
                <div class="line-point" style="left: 76%"></div>
                <div class="line-point" style="left: 84%"></div>
                <div class="line-point" style="left: 92%"></div>
              </div>

              <div class="months">
                <span>Jan</span><span>Feb</span><span>Mar</span><span>Apr</span><span>May</span><span>Jun</span>
                <span>Jul</span><span>Aug</span><span>Sep</span><span>Oct</span><span>Nov</span><span>Dec</span>
              </div>
            </div>
          </div>

          <div class="panel upcoming-panel">
            <h3>Upcoming Appointment</h3>
            <div class="empty-state">No data available</div>
          </div>
        </div>
        </div>
      </div>
    </div>
  `,
  styles: [
    `
      .dashboard-page {
        background: var(--surface-ground);
        min-height: 100vh;
      }

      .dashboard-shell {
        margin: 0 auto;
        max-width: 1450px;
      }

      .dashboard-highlight {
        background: #e6faf6;
        border: 1px solid #c2efe6;
        border-radius: 16px;
        padding: 1rem;
      }

      .crumb {
        color: #7b8294;
        font-size: 0.84rem;
        margin-bottom: 0.55rem;

        span {
          margin: 0 0.2rem;
        }
      }

      .hero-row {
        align-items: center;
        display: flex;
        justify-content: space-between;
        margin-bottom: 1rem;

        h1 {
          color: #242936;
          font-size: 2.65rem;
          font-weight: 500;
          margin: 0;

          strong {
            font-weight: 800;
          }
        }
      }

      .hero-actions {
        display: inline-flex;
        gap: 0.5rem;

        input {
          background: #ffffff;
          border: 1px solid #e4e7ee;
          border-radius: 8px;
          color: #384152;
          min-height: 40px;
          padding: 0 0.75rem;
        }

        button {
          background: #3c465a;
          border: none;
          border-radius: 8px;
          color: #fff;
          cursor: pointer;
          font-weight: 700;
          min-height: 40px;
          padding: 0 1rem;
        }
      }

      .section-title {
        color: #252d3d;
        font-size: 2rem;
        font-weight: 700;
        margin: 0 0 0.7rem;
      }

      .top-grid {
        display: grid;
        gap: 0.8rem;
        grid-template-columns: 2.1fr 1fr;
        margin-bottom: 0.8rem;
      }

      .metrics-grid {
        display: grid;
        gap: 0.8rem;
        grid-template-columns: repeat(3, minmax(180px, 1fr));
      }

      .metric-card,
      .panel {
        background: #fff;
        border: 1px solid #e8ebf1;
        border-radius: 12px;
        padding: 0.95rem 1rem;
      }

      .metric-card p {
        color: #7f8798;
        font-size: 0.9rem;
        margin: 0;
      }

      .metric-row {
        align-items: center;
        display: flex;
        justify-content: space-between;
        margin-top: 0.9rem;

        h3 {
          color: #242a39;
          font-size: 2.1rem;
          margin: 0;
        }

        i {
          color: #5f67d8;
          font-size: 1.45rem;
        }
      }

      .age-panel h3,
      .revenue-panel h3,
      .upcoming-panel h3 {
        color: #2b3345;
        font-size: 1.95rem;
        margin: 0 0 0.8rem;
      }

      .age-bands {
        display: grid;
        gap: 0.6rem;
        grid-template-columns: repeat(3, 1fr);
      }

      .band {
        text-align: center;

        img {
          height: 72px;
          margin-bottom: 0.2rem;
          object-fit: contain;
          width: 72px;
        }

        p {
          color: #7b8396;
          font-size: 0.9rem;
          margin: 0 0 0.25rem;
        }

        strong {
          color: #2f3748;
          font-size: 1.1rem;
        }
      }

      .bottom-grid {
        display: grid;
        gap: 0.8rem;
        grid-template-columns: 2.1fr 1fr;
      }

      .panel-head {
        align-items: center;
        display: flex;
        justify-content: space-between;

        span {
          background: #f3f4f8;
          border-radius: 7px;
          color: #6f7688;
          font-size: 0.8rem;
          font-weight: 600;
          padding: 0.2rem 0.55rem;
        }
      }

      .chart-area {
        margin-top: 0.9rem;
      }

      .line-track {
        border-bottom: 3px solid #8ce7df;
        height: 210px;
        position: relative;
      }

      .line-point {
        background: #8ce7df;
        border-radius: 999px;
        bottom: -5px;
        height: 8px;
        position: absolute;
        width: 8px;
      }

      .months {
        color: #8b91a1;
        display: grid;
        font-size: 0.8rem;
        grid-template-columns: repeat(12, 1fr);
        margin-top: 0.35rem;
      }

      .upcoming-panel {
        display: flex;
        flex-direction: column;
        min-height: 330px;
      }

      .empty-state {
        align-items: center;
        color: #9ca3b4;
        display: flex;
        flex: 1;
        font-size: 1rem;
        justify-content: center;
      }

      @media (max-width: 1320px) {
        .hero-row h1 {
          font-size: 2rem;
        }

        .top-grid,
        .bottom-grid {
          grid-template-columns: 1fr;
        }
      }

      @media (max-width: 980px) {
        .hero-row {
          align-items: stretch;
          flex-direction: column;
          gap: 0.7rem;

          h1 {
            font-size: 1.6rem;
          }
        }

        .metrics-grid {
          grid-template-columns: 1fr;
        }

        .age-bands {
          grid-template-columns: 1fr;
        }
      }
    `,
  ],
})
export class HomePage {
  selectedDate = '';

  metricCards: MetricCard[] = [
    { label: 'Total Number of Clinics', value: '1', icon: 'pi pi-building' },
    { label: 'Total Active Services', value: '2', icon: 'pi pi-cog' },
    { label: 'Total Appointments', value: '1', icon: 'pi pi-calendar' },
    { label: 'Total Number of Doctors', value: '1', icon: 'pi pi-user' },
    { label: 'Total Number of Patients', value: '1', icon: 'pi pi-users' },
    { label: 'Total Revenue', value: '0 Rs', icon: 'pi pi-wallet' },
  ];

  onSubmitDate(): void {
    console.log('Filter dashboard by date', this.selectedDate);
  }
}




