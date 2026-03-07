import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';

type SettingsTab =
  | 'General'
  | 'Branches'
  | 'Team'
  | 'Billing'
  | 'Practice Settings'
  | 'Notifications'
  | 'Account Settings';

@Component({
  selector: 'app-settings-page',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="settings-page p-3 lg:p-4">
      <div class="settings-shell">
        <h1>Settings</h1>

        <div class="tabs-wrap">
          <button
            type="button"
            *ngFor="let tab of tabs"
            [class.active]="activeTab === tab"
            (click)="setTab(tab)">
            {{ tab }}
          </button>
        </div>

        <ng-container *ngIf="activeTab === 'General'; else placeholderSection">
          <div class="card primary-card">
            <div class="org-head">
              <div class="org-left">
                <div class="org-logo">DL</div>
                <h2>Dento Lounge</h2>
              </div>
              <button class="btn-outline" type="button" (click)="onUploadLogo()">
                <i class="pi pi-pencil"></i>
                Upload logo
              </button>
            </div>

            <div class="grid-2 top-boxes">
              <div class="info-box">
                <h3>Account Admin Details</h3>
                <p>Arjun</p>
                <p>demo@dentobees.com</p>
                <p>9539192684</p>
              </div>
              <div class="info-box">
                <h3>Primary Location</h3>
                <p>Dento Lounge</p>
                <p>Calicut, india</p>
              </div>
            </div>
          </div>

          <div class="grid-2 section-grid">
            <div class="card section-card">
              <h3>General Details</h3>
              <div class="details-grid">
                <div>
                  <label>Support WA Number</label>
                  <div class="value">-</div>
                </div>
                <div>
                  <label>Website</label>
                  <div class="value">-</div>
                </div>
                <div>
                  <label>Tax/GSTIN</label>
                  <div class="value">-</div>
                </div>
                <div>
                  <label>Support Mail</label>
                  <div class="value strong">demo@dentobees.com</div>
                </div>
              </div>
            </div>

            <div class="card section-card">
              <h3>Bank Account Details</h3>
              <div class="details-grid single">
                <div>
                  <label>Bank Name</label>
                  <div class="value">-</div>
                </div>
                <div>
                  <label>Account Number</label>
                  <div class="value">-</div>
                </div>
                <div>
                  <label>IFSC</label>
                  <div class="value">-</div>
                </div>
                <div>
                  <label>UPI ID</label>
                  <div class="value">-</div>
                </div>
              </div>
            </div>
          </div>
        </ng-container>

        <ng-template #placeholderSection>
          <div class="card placeholder-card">
            <h3>{{ activeTab }}</h3>
            <p>This section is ready for implementation.</p>
          </div>
        </ng-template>
      </div>
    </div>
  `,
  styles: [
    `
      .settings-page {
        background: #dff5f7;
        min-height: 100vh;
      }

      .settings-shell {
        margin: 0 auto;
        max-width: 1460px;
      }

      h1 {
        color: #232d3e;
        font-size: 2rem;
        margin: 0 0 0.85rem;
      }

      .tabs-wrap {
        background: #f2f4f8;
        border: 1px solid #e4e8f0;
        border-radius: 12px;
        display: grid;
        gap: 0.45rem;
        grid-template-columns: repeat(7, minmax(120px, 1fr));
        margin-bottom: 0.95rem;
        padding: 0.45rem;

        button {
          background: transparent;
          border: none;
          border-radius: 10px;
          color: #3f495d;
          cursor: pointer;
          font-size: 0.95rem;
          font-weight: 600;
          min-height: 46px;
          padding: 0 0.4rem;
        }

        button.active {
          background: #fff;
          box-shadow: 0 1px 2px rgba(0, 0, 0, 0.06);
        }
      }

      .card {
        background: #fff;
        border: 1px solid #e6ebf3;
        border-radius: 12px;
      }

      .primary-card {
        margin-bottom: 0.9rem;
        padding: 0.95rem;
      }

      .org-head {
        align-items: center;
        display: flex;
        justify-content: space-between;
        margin-bottom: 0.8rem;
      }

      .org-left {
        align-items: center;
        display: flex;
        gap: 0.65rem;

        h2 {
          color: #2a3346;
          font-size: 1.55rem;
          margin: 0;
        }
      }

      .org-logo {
        align-items: center;
        background: #eef5ff;
        border: 1px solid #d6e3ff;
        border-radius: 12px;
        color: #326adf;
        display: inline-flex;
        font-weight: 700;
        height: 44px;
        justify-content: center;
        width: 44px;
      }

      .btn-outline {
        align-items: center;
        background: #fff;
        border: 1px solid #d6dde8;
        border-radius: 10px;
        color: #2f394d;
        cursor: pointer;
        display: inline-flex;
        font-size: 0.92rem;
        font-weight: 700;
        gap: 0.4rem;
        min-height: 40px;
        padding: 0 0.9rem;
      }

      .grid-2 {
        display: grid;
        gap: 0.8rem;
        grid-template-columns: 1fr 1fr;
      }

      .info-box {
        border: 1px solid #e4e9f1;
        border-radius: 10px;
        padding: 0.75rem;

        h3 {
          color: #2c3445;
          font-size: 1.55rem;
          margin: 0 0 0.35rem;
        }

        p {
          color: #515d72;
          font-size: 1.05rem;
          margin: 0.1rem 0;
        }
      }

      .section-grid {
        margin-bottom: 0.8rem;
      }

      .section-card {
        padding: 0.85rem;

        h3 {
          color: #2b3446;
          font-size: 1.55rem;
          margin: 0 0 0.7rem;
        }
      }

      .details-grid {
        display: grid;
        gap: 0.7rem;
        grid-template-columns: 1fr 1fr;

        &.single {
          grid-template-columns: 1fr;
        }

        label {
          color: #4a566a;
          display: block;
          font-size: 1.05rem;
          margin-bottom: 0.3rem;
        }
      }

      .value {
        background: #fff;
        border: 1px solid #e3e8f0;
        border-radius: 9px;
        color: #566274;
        font-size: 1.05rem;
        min-height: 44px;
        padding: 0.5rem 0.7rem;
      }

      .value.strong {
        color: #2e3a4f;
        font-weight: 600;
      }

      .placeholder-card {
        padding: 1.15rem;

        h3 {
          color: #2a3346;
          font-size: 1.45rem;
          margin: 0 0 0.3rem;
        }

        p {
          color: #647089;
          font-size: 1.05rem;
          margin: 0;
        }
      }

      @media (max-width: 1250px) {
        .tabs-wrap {
          grid-template-columns: repeat(3, minmax(140px, 1fr));
        }
      }

      @media (max-width: 980px) {
        .grid-2 {
          grid-template-columns: 1fr;
        }

        .tabs-wrap {
          grid-template-columns: repeat(2, minmax(140px, 1fr));
        }

        .org-head {
          align-items: flex-start;
          flex-direction: column;
          gap: 0.6rem;
        }
      }
    `,
  ],
})
export class SettingsPage {
  activeTab: SettingsTab = 'General';

  tabs: SettingsTab[] = [
    'General',
    'Branches',
    'Team',
    'Billing',
    'Practice Settings',
    'Notifications',
    'Account Settings',
  ];

  setTab(tab: SettingsTab): void {
    this.activeTab = tab;
  }

  onUploadLogo(): void {
    console.log('Upload logo');
  }
}

