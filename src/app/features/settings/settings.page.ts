import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

// ─── Types ───────────────────────────────────────────────────────────────────

type SettingsTab = 'General' | 'Branches' | 'Team' | 'Billing' | 'Practice' | 'Notifications' | 'Account';
type TeamRole = 'Super Admin' | 'Admin' | 'Dentist' | 'Receptionist' | 'Assistant';
type UserStatus = 'Active' | 'Inactive';

interface Branch {
  id: number; name: string; address: string; city: string; state: string;
  pincode: string; phone: string; email: string; isPrimary: boolean;
  workHoursFrom: string; workHoursTo: string; workDays: string[];
}

interface TeamMember {
  id: number; name: string; email: string; phone: string; role: TeamRole;
  branch: string; status: UserStatus; lastLogin?: string; avatar: string;
}

interface NotificationRule {
  id: string; label: string; description: string;
  smsEnabled: boolean; whatsappEnabled: boolean; emailEnabled: boolean;
}

// ─── Component ───────────────────────────────────────────────────────────────

@Component({
  selector: 'app-settings-page',
  standalone: true,
  imports: [CommonModule, FormsModule],
  template: `
<div class="settings-page">

  <!-- ── Page Header ───────────────────────────────────── -->
  <div class="page-header">
    <div>
      <div class="portal-tag">Configuration</div>
      <h1 class="page-title">Settings</h1>
    </div>
    <!-- Unsaved changes bar -->
    <div class="unsaved-bar" [class.visible]="isDirty">
      <i class="pi pi-exclamation-circle" style="color:#b45309"></i>
      <span>You have unsaved changes</span>
      <button class="mbtn ghost small" (click)="discardChanges()">Discard</button>
      <button class="mbtn primary small" (click)="saveChanges()"><i class="pi pi-check"></i> Save Changes</button>
    </div>
  </div>

  <!-- ── Tab Bar ───────────────────────────────────────── -->
  <div class="tab-bar">
    <button class="tab-btn" *ngFor="let t of tabs" [class.active]="activeTab === t.val" (click)="setTab(t.val)">
      <span class="tab-ico">{{ t.icon }}</span>
      <span>{{ t.label }}</span>
    </button>
  </div>

  <!-- ══════════════════════════════════════════════════════
       GENERAL TAB
  ══════════════════════════════════════════════════════ -->
  <ng-container *ngIf="activeTab === 'General'">

    <!-- Clinic Identity Card -->
    <div class="settings-card accent-card">
      <div class="clinic-identity">
        <div class="logo-zone">
          <div class="clinic-logo">{{ general.clinicInitials }}</div>
          <div class="logo-info">
            <h2 class="clinic-name">{{ general.clinicName || 'Clinic Name' }}</h2>
            <span class="branch-pill">Primary Branch</span>
          </div>
        </div>
        <button class="btn-outline" (click)="triggerLogoUpload()">
          <i class="pi pi-upload"></i> Upload Logo
        </button>
        <input type="file" #logoInput accept=".png,.jpg,.jpeg,.svg" style="display:none" />
      </div>
    </div>

    <div class="settings-grid-2">

      <!-- Account Admin Details -->
      <div class="settings-card">
        <div class="card-section-header">
          <div>
            <h3 class="section-title">Account Admin Details</h3>
            <p class="section-desc">Superadmin account associated with this clinic</p>
          </div>
          <button class="btn-icon" title="Edit" (click)="editSection('admin')"><i class="pi pi-pencil"></i></button>
        </div>
        <div class="field-grid-2">
          <div class="field-group">
            <label>Full Name</label>
            <input [(ngModel)]="general.adminName" placeholder="Dr. Arjun Nair" (ngModelChange)="markDirty()" />
          </div>
          <div class="field-group">
            <label>Phone</label>
            <input [(ngModel)]="general.adminPhone" placeholder="+91 98765 43210" (ngModelChange)="markDirty()" />
          </div>
          <div class="field-group fg-full">
            <label>Email Address</label>
            <input type="email" [(ngModel)]="general.adminEmail" placeholder="admin@clinic.com" (ngModelChange)="markDirty()" />
          </div>
          <div class="field-group">
            <label>Role</label>
            <input value="Super Admin" [disabled]="true" class="disabled-input" />
          </div>
          <div class="field-group">
            <label>Last Login</label>
            <input value="{{ general.lastLogin }}" [disabled]="true" class="disabled-input" />
          </div>
        </div>
        <div class="inline-actions-row">
          <button class="ia-link" (click)="changePassword()"><i class="pi pi-lock"></i> Change Password</button>
          <button class="ia-link" (click)="toggle2FA()"><i class="pi pi-shield"></i> {{ general.twoFA ? 'Disable 2FA' : 'Enable 2FA' }}</button>
        </div>
      </div>

      <!-- Primary Location -->
      <div class="settings-card">
        <div class="card-section-header">
          <div>
            <h3 class="section-title">Primary Location</h3>
            <p class="section-desc">Used in invoices, reminders, and reports</p>
          </div>
          <button class="btn-icon" (click)="editSection('location')"><i class="pi pi-pencil"></i></button>
        </div>
        <div class="field-grid-2">
          <div class="field-group fg-full">
            <label>Clinic Name</label>
            <input [(ngModel)]="general.clinicName" placeholder="Dento Lounge" (ngModelChange)="markDirty()" />
          </div>
          <div class="field-group fg-full">
            <label>Address Line</label>
            <input [(ngModel)]="general.address" placeholder="Building, Street, Area" (ngModelChange)="markDirty()" />
          </div>
          <div class="field-group">
            <label>City</label>
            <input [(ngModel)]="general.city" placeholder="Calicut" (ngModelChange)="markDirty()" />
          </div>
          <div class="field-group">
            <label>State</label>
            <input [(ngModel)]="general.state" placeholder="Kerala" (ngModelChange)="markDirty()" />
          </div>
          <div class="field-group">
            <label>Pincode</label>
            <input [(ngModel)]="general.pincode" placeholder="673001" (ngModelChange)="markDirty()" />
          </div>
          <div class="field-group">
            <label>Timezone</label>
            <select [(ngModel)]="general.timezone" (ngModelChange)="markDirty()">
              <option value="Asia/Kolkata">Asia/Kolkata (IST +5:30)</option>
              <option value="Asia/Dubai">Asia/Dubai (GST +4:00)</option>
            </select>
          </div>
        </div>
      </div>

      <!-- General Details -->
      <div class="settings-card">
        <div class="card-section-header">
          <div>
            <h3 class="section-title">General Details</h3>
            <p class="section-desc">Contact and legal information for communications</p>
          </div>
        </div>
        <div class="field-grid-2">
          <div class="field-group">
            <label>WhatsApp Support Number <span class="tip" title="Used for patient communications">ⓘ</span></label>
            <div class="input-prefix-wrap">
              <span class="input-prefix">+91</span>
              <input [(ngModel)]="general.whatsapp" placeholder="98765 43210" (ngModelChange)="markDirty()" />
            </div>
          </div>
          <div class="field-group">
            <label>Website URL</label>
            <input [(ngModel)]="general.website" placeholder="https://clinicname.com" (ngModelChange)="markDirty()" />
          </div>
          <div class="field-group">
            <label>Tax / GSTIN <span class="tip" title="15-digit GSTIN for India">ⓘ</span></label>
            <input [(ngModel)]="general.gstin" placeholder="22AAAAA0000A1Z5" (ngModelChange)="markDirty()" />
            <span class="field-hint" *ngIf="general.gstin && !isValidGSTIN(general.gstin)">⚠ Invalid GSTIN format</span>
          </div>
          <div class="field-group">
            <label>Support Email</label>
            <input type="email" [(ngModel)]="general.supportEmail" placeholder="support@clinic.com" (ngModelChange)="markDirty()" />
          </div>
        </div>
      </div>

      <!-- Bank Account Details -->
      <div class="settings-card">
        <div class="card-section-header">
          <div>
            <h3 class="section-title">Bank Account Details</h3>
            <p class="section-desc">Payment details used for UPI QR and reconciliation</p>
          </div>
          <span class="secure-badge"><i class="pi pi-lock"></i> Encrypted</span>
        </div>
        <div class="field-grid-1">
          <div class="field-group">
            <label>Bank Name</label>
            <input [(ngModel)]="general.bankName" placeholder="HDFC Bank" (ngModelChange)="markDirty()" />
          </div>
          <div class="field-group">
            <label>Account Number</label>
            <div class="input-mask-wrap">
              <input [type]="showAccountNo ? 'text' : 'password'" [(ngModel)]="general.accountNo" placeholder="Account number" (ngModelChange)="markDirty()" />
              <button class="mask-toggle pi" [class]="showAccountNo ? 'pi-eye-slash' : 'pi-eye'" (click)="showAccountNo = !showAccountNo"></button>
            </div>
          </div>
          <div class="field-group">
            <label>IFSC Code <span class="tip" title="11-character IFSC code">ⓘ</span></label>
            <input [(ngModel)]="general.ifsc" placeholder="HDFC0001234" (ngModelChange)="markDirty()" />
          </div>
          <div class="field-group">
            <label>UPI ID</label>
            <input [(ngModel)]="general.upiId" placeholder="clinic@hdfcbank" (ngModelChange)="markDirty()" />
          </div>
        </div>
      </div>

    </div>
  </ng-container>

  <!-- ══════════════════════════════════════════════════════
       BRANCHES TAB
  ══════════════════════════════════════════════════════ -->
  <ng-container *ngIf="activeTab === 'Branches'">
    <div class="section-topbar">
      <div>
        <h2 class="section-title">Branches</h2>
        <p class="section-desc">Manage multiple clinic locations</p>
      </div>
      <button class="btn-primary" (click)="addBranch()"><i class="pi pi-plus"></i> Add Branch</button>
    </div>
    <div class="branches-grid">
      <div class="branch-card" *ngFor="let b of branches" [class.primary]="b.isPrimary">
        <div class="branch-head">
          <div class="branch-av">{{ b.name[0] }}</div>
          <div class="branch-info">
            <span class="branch-name">{{ b.name }}</span>
            <span class="primary-chip" *ngIf="b.isPrimary">Primary</span>
          </div>
          <div class="branch-actions">
            <button class="act-btn" (click)="editBranch(b)"><i class="pi pi-pencil"></i></button>
            <button class="act-btn warn" *ngIf="!b.isPrimary" (click)="deleteBranch(b)"><i class="pi pi-trash"></i></button>
          </div>
        </div>
        <div class="branch-details">
          <div class="bd-row"><i class="pi pi-map-marker"></i><span>{{ b.address }}, {{ b.city }} {{ b.pincode }}</span></div>
          <div class="bd-row"><i class="pi pi-phone"></i><span>{{ b.phone }}</span></div>
          <div class="bd-row"><i class="pi pi-envelope"></i><span>{{ b.email }}</span></div>
          <div class="bd-row"><i class="pi pi-clock"></i><span>{{ b.workHoursFrom }} – {{ b.workHoursTo }} · {{ b.workDays.join(', ') }}</span></div>
        </div>
      </div>
    </div>
  </ng-container>

  <!-- ══════════════════════════════════════════════════════
       TEAM TAB
  ══════════════════════════════════════════════════════ -->
  <ng-container *ngIf="activeTab === 'Team'">
    <div class="section-topbar">
      <div>
        <h2 class="section-title">Team Members</h2>
        <p class="section-desc">{{ team.length }} users · Manage roles and access</p>
      </div>
      <button class="btn-primary" (click)="addMemberModal = true"><i class="pi pi-plus"></i> Add Member</button>
    </div>

    <!-- Role Permission Matrix -->
    <div class="settings-card perm-matrix-card">
      <h4 class="matrix-title">Role Permissions Overview</h4>
      <div class="matrix-scroll">
        <table class="perm-table">
          <thead>
            <tr>
              <th>Feature</th>
              <th *ngFor="let r of roleList">{{ r }}</th>
            </tr>
          </thead>
          <tbody>
            <tr *ngFor="let row of permMatrix">
              <td class="perm-feature">{{ row.feature }}</td>
              <td *ngFor="let r of roleList">
                <span [class]="row.perms[r] ? 'perm-yes' : 'perm-no'">{{ row.perms[r] ? '✓' : '—' }}</span>
              </td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>

    <!-- Team Table -->
    <div class="settings-card no-pad">
      <table class="team-table">
        <thead>
          <tr>
            <th>Member</th>
            <th>Role</th>
            <th>Branch</th>
            <th>Status</th>
            <th>Last Login</th>
            <th>Actions</th>
          </tr>
        </thead>
        <tbody>
          <tr *ngFor="let m of team">
            <td>
              <div class="member-cell">
                <div class="member-av" [style.background]="roleColor(m.role)">{{ m.avatar }}</div>
                <div>
                  <div class="member-name">{{ m.name }}</div>
                  <div class="member-email">{{ m.email }}</div>
                </div>
              </div>
            </td>
            <td><span class="role-badge" [class]="'role-' + m.role.toLowerCase().replace(' ', '-')">{{ m.role }}</span></td>
            <td><span class="muted-text">{{ m.branch }}</span></td>
            <td><span class="status-dot" [class]="m.status === 'Active' ? 'active' : 'inactive'">{{ m.status }}</span></td>
            <td><span class="muted-text">{{ m.lastLogin || 'Never' }}</span></td>
            <td>
              <div class="row-actions">
                <button class="act-btn" title="Edit" (click)="editMember(m)"><i class="pi pi-pencil"></i></button>
                <button class="act-btn" title="Reset Password" (click)="resetPassword(m)"><i class="pi pi-key"></i></button>
                <button class="act-btn warn" title="Deactivate" (click)="toggleMemberStatus(m)">
                  <i class="pi" [class]="m.status === 'Active' ? 'pi-ban' : 'pi-check-circle'"></i>
                </button>
              </div>
            </td>
          </tr>
        </tbody>
      </table>
    </div>
  </ng-container>

  <!-- ══════════════════════════════════════════════════════
       BILLING SETTINGS TAB
  ══════════════════════════════════════════════════════ -->
  <ng-container *ngIf="activeTab === 'Billing'">
    <div class="settings-grid-2">

      <div class="settings-card">
        <div class="card-section-header">
          <div><h3 class="section-title">Invoice Configuration</h3><p class="section-desc">Invoice numbering and default settings</p></div>
        </div>
        <div class="field-grid-1">
          <div class="field-group">
            <label>Invoice Number Prefix</label>
            <div class="input-prefix-wrap">
              <span class="input-prefix">e.g.</span>
              <input [(ngModel)]="billing.invoicePrefix" placeholder="INV" (ngModelChange)="markDirty()" />
            </div>
            <span class="field-hint">Preview: {{ billing.invoicePrefix }}-0001</span>
          </div>
          <div class="field-group">
            <label>Default Payment Terms (days)</label>
            <select [(ngModel)]="billing.paymentTerms" (ngModelChange)="markDirty()">
              <option [value]="7">7 days</option>
              <option [value]="14">14 days</option>
              <option [value]="30">30 days</option>
              <option [value]="0">Due on receipt</option>
            </select>
          </div>
          <div class="field-group">
            <label>Default Invoice Footer / Notes</label>
            <textarea [(ngModel)]="billing.invoiceNotes" rows="3" placeholder="Thank you for choosing us!" (ngModelChange)="markDirty()"></textarea>
          </div>
        </div>
      </div>

      <div class="settings-card">
        <div class="card-section-header">
          <div><h3 class="section-title">Tax Configuration</h3><p class="section-desc">GST rates applied to invoices</p></div>
        </div>
        <div class="field-grid-1">
          <div class="field-group">
            <label>CGST (%)</label>
            <input type="number" [(ngModel)]="billing.cgst" min="0" max="28" (ngModelChange)="markDirty()" />
          </div>
          <div class="field-group">
            <label>SGST (%)</label>
            <input type="number" [(ngModel)]="billing.sgst" min="0" max="28" (ngModelChange)="markDirty()" />
          </div>
          <div class="tax-preview">
            <span>Total GST: {{ billing.cgst + billing.sgst }}%</span>
            <span class="muted-text">On ₹10,000 → Tax: ₹{{ ((billing.cgst + billing.sgst) / 100 * 10000) | number:'1.0-0' }}</span>
          </div>
        </div>
        <div class="toggle-group-list">
          <div class="toggle-row" *ngFor="let t of billingToggles">
            <div>
              <div class="toggle-lbl">{{ t.label }}</div>
              <div class="toggle-desc">{{ t.desc }}</div>
            </div>
            <div class="toggle-wrap" [class.on]="t.enabled" (click)="t.enabled = !t.enabled; markDirty()">
              <div class="toggle-knob"></div>
            </div>
          </div>
        </div>
      </div>

    </div>
  </ng-container>

  <!-- ══════════════════════════════════════════════════════
       PRACTICE SETTINGS TAB
  ══════════════════════════════════════════════════════ -->
  <ng-container *ngIf="activeTab === 'Practice'">
    <div class="settings-grid-2">

      <div class="settings-card">
        <div class="card-section-header">
          <div><h3 class="section-title">Working Hours</h3><p class="section-desc">Default clinic operating hours</p></div>
        </div>
        <div class="work-days-grid">
          <div class="wd-row" *ngFor="let d of workDays">
            <div class="toggle-wrap small" [class.on]="d.enabled" (click)="d.enabled = !d.enabled; markDirty()">
              <div class="toggle-knob"></div>
            </div>
            <span class="day-lbl" [class.disabled]="!d.enabled">{{ d.name }}</span>
            <input class="time-input" type="time" [(ngModel)]="d.from" [disabled]="!d.enabled" (ngModelChange)="markDirty()" />
            <span class="muted-text">–</span>
            <input class="time-input" type="time" [(ngModel)]="d.to" [disabled]="!d.enabled" (ngModelChange)="markDirty()" />
          </div>
        </div>
      </div>

      <div class="settings-card">
        <div class="card-section-header">
          <div><h3 class="section-title">Appointment Defaults</h3><p class="section-desc">Scheduling configuration</p></div>
        </div>
        <div class="field-grid-1">
          <div class="field-group">
            <label>Default Appointment Duration</label>
            <select [(ngModel)]="practice.defaultDuration" (ngModelChange)="markDirty()">
              <option [value]="15">15 minutes</option>
              <option [value]="30">30 minutes</option>
              <option [value]="45">45 minutes</option>
              <option [value]="60">60 minutes</option>
            </select>
          </div>
          <div class="field-group">
            <label>Recall Interval</label>
            <select [(ngModel)]="practice.recallInterval" (ngModelChange)="markDirty()">
              <option [value]="3">Every 3 months</option>
              <option [value]="6">Every 6 months</option>
              <option [value]="12">Every 12 months</option>
            </select>
          </div>
          <div class="field-group">
            <label>Number of Chairs / Rooms</label>
            <input type="number" [(ngModel)]="practice.chairs" min="1" (ngModelChange)="markDirty()" />
          </div>
        </div>
        <div class="toggle-group-list">
          <div class="toggle-row" *ngFor="let t of practiceToggles">
            <div>
              <div class="toggle-lbl">{{ t.label }}</div>
              <div class="toggle-desc">{{ t.desc }}</div>
            </div>
            <div class="toggle-wrap" [class.on]="t.enabled" (click)="t.enabled = !t.enabled; markDirty()">
              <div class="toggle-knob"></div>
            </div>
          </div>
        </div>
      </div>

      <!-- Treatment Price List -->
      <div class="settings-card" style="grid-column:1/-1">
        <div class="card-section-header">
          <div><h3 class="section-title">Treatment Price List</h3><p class="section-desc">Default procedure rates used when creating invoices</p></div>
          <button class="btn-ghost small" (click)="addTreatment()"><i class="pi pi-plus"></i> Add</button>
        </div>
        <div class="price-table">
          <div class="pt-header">
            <span>Procedure / Treatment</span><span>Category</span><span>Default Duration</span><span>Price (₹)</span><span></span>
          </div>
          <div class="pt-row" *ngFor="let t of treatments; let i = index">
            <input [(ngModel)]="t.name" placeholder="Procedure name" (ngModelChange)="markDirty()" />
            <select [(ngModel)]="t.category" (ngModelChange)="markDirty()">
              <option *ngFor="let c of treatmentCategories" [value]="c">{{ c }}</option>
            </select>
            <select [(ngModel)]="t.duration" (ngModelChange)="markDirty()">
              <option [value]="15">15 min</option>
              <option [value]="30">30 min</option>
              <option [value]="45">45 min</option>
              <option [value]="60">60 min</option>
              <option [value]="90">90 min</option>
            </select>
            <input type="number" [(ngModel)]="t.price" (ngModelChange)="markDirty()" />
            <button class="icon-remove pi pi-times" (click)="removeTreatment(i)"></button>
          </div>
        </div>
      </div>

    </div>
  </ng-container>

  <!-- ══════════════════════════════════════════════════════
       NOTIFICATIONS TAB
  ══════════════════════════════════════════════════════ -->
  <ng-container *ngIf="activeTab === 'Notifications'">
    <div class="settings-grid-2">

      <div class="settings-card">
        <div class="card-section-header">
          <div><h3 class="section-title">Notification Channels</h3><p class="section-desc">Configure SMS, WhatsApp and email providers</p></div>
        </div>
        <div class="channel-card" *ngFor="let ch of notifChannels">
          <div class="ch-left">
            <div class="ch-ico" [style.background]="ch.bg" [style.color]="ch.color">{{ ch.icon }}</div>
            <div>
              <div class="ch-name">{{ ch.name }}</div>
              <div class="ch-desc">{{ ch.provider || 'Not configured' }}</div>
            </div>
          </div>
          <div class="ch-right">
            <span class="conn-badge" [class]="ch.connected ? 'connected' : 'disconnected'">{{ ch.connected ? 'Connected' : 'Disconnected' }}</span>
            <button class="btn-ghost small" (click)="configureChannel(ch)">{{ ch.connected ? 'Configure' : 'Connect' }}</button>
          </div>
        </div>
      </div>

      <div class="settings-card">
        <div class="card-section-header">
          <div><h3 class="section-title">Reminder Timing</h3><p class="section-desc">When to send automatic reminders</p></div>
        </div>
        <div class="field-grid-1">
          <div class="field-group" *ngFor="let r of reminderTimings">
            <label>{{ r.label }}</label>
            <div class="toggle-row">
              <select [(ngModel)]="r.value" style="flex:1" (ngModelChange)="markDirty()">
                <option [value]="15">15 minutes before</option>
                <option [value]="60">1 hour before</option>
                <option [value]="120">2 hours before</option>
                <option [value]="1440">24 hours before</option>
                <option [value]="2880">48 hours before</option>
              </select>
              <div class="toggle-wrap" [class.on]="r.enabled" (click)="r.enabled = !r.enabled; markDirty()">
                <div class="toggle-knob"></div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <!-- Notification Rules Table -->
      <div class="settings-card" style="grid-column:1/-1">
        <div class="card-section-header">
          <div><h3 class="section-title">Notification Rules</h3><p class="section-desc">Control which notifications fire and on which channels</p></div>
        </div>
        <div class="notif-table-wrap">
          <table class="notif-table">
            <thead>
              <tr>
                <th>Event</th>
                <th>Description</th>
                <th class="ch-th">💬 SMS</th>
                <th class="ch-th">📱 WhatsApp</th>
                <th class="ch-th">✉ Email</th>
              </tr>
            </thead>
            <tbody>
              <tr *ngFor="let rule of notifRules">
                <td class="rule-name">{{ rule.label }}</td>
                <td class="muted-text rule-desc">{{ rule.description }}</td>
                <td class="ch-td">
                  <div class="toggle-wrap small" [class.on]="rule.smsEnabled" (click)="rule.smsEnabled = !rule.smsEnabled; markDirty()">
                    <div class="toggle-knob"></div>
                  </div>
                </td>
                <td class="ch-td">
                  <div class="toggle-wrap small" [class.on]="rule.whatsappEnabled" (click)="rule.whatsappEnabled = !rule.whatsappEnabled; markDirty()">
                    <div class="toggle-knob"></div>
                  </div>
                </td>
                <td class="ch-td">
                  <div class="toggle-wrap small" [class.on]="rule.emailEnabled" (click)="rule.emailEnabled = !rule.emailEnabled; markDirty()">
                    <div class="toggle-knob"></div>
                  </div>
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>

    </div>
  </ng-container>

  <!-- ══════════════════════════════════════════════════════
       ACCOUNT SETTINGS TAB
  ══════════════════════════════════════════════════════ -->
  <ng-container *ngIf="activeTab === 'Account'">
    <div class="settings-grid-2">

      <div class="settings-card">
        <div class="card-section-header">
          <div><h3 class="section-title">Security</h3><p class="section-desc">Password and two-factor authentication</p></div>
        </div>
        <div class="field-grid-1">
          <div class="field-group">
            <label>Current Password</label>
            <input type="password" [(ngModel)]="pwForm.current" placeholder="Enter current password" />
          </div>
          <div class="field-group">
            <label>New Password</label>
            <input type="password" [(ngModel)]="pwForm.newPw" placeholder="Min 8 characters" />
          </div>
          <div class="field-group">
            <label>Confirm New Password</label>
            <input type="password" [(ngModel)]="pwForm.confirm" placeholder="Repeat new password" />
          </div>
          <button class="btn-primary" style="align-self:flex-start" (click)="submitPasswordChange()">
            <i class="pi pi-lock"></i> Update Password
          </button>
        </div>
        <div class="divider"></div>
        <div class="toggle-row">
          <div>
            <div class="toggle-lbl">Two-Factor Authentication (2FA)</div>
            <div class="toggle-desc">Require OTP on every login</div>
          </div>
          <div class="toggle-wrap" [class.on]="general.twoFA" (click)="toggle2FA()"><div class="toggle-knob"></div></div>
        </div>
      </div>

      <div class="settings-card">
        <div class="card-section-header">
          <div><h3 class="section-title">Login History</h3><p class="section-desc">Recent account access</p></div>
        </div>
        <div class="login-history">
          <div class="lh-row" *ngFor="let l of loginHistory">
            <div class="lh-info">
              <div class="lh-device">{{ l.device }}</div>
              <div class="lh-meta">{{ l.location }} · {{ l.time }}</div>
            </div>
            <span class="lh-status" [class]="l.current ? 'current' : ''">{{ l.current ? 'This session' : '' }}</span>
          </div>
        </div>
      </div>

      <div class="settings-card">
        <div class="card-section-header">
          <div><h3 class="section-title">Data & Privacy</h3><p class="section-desc">Export or delete your clinic data</p></div>
        </div>
        <div class="data-actions">
          <div class="da-item">
            <div><div class="toggle-lbl">Export All Data</div><div class="toggle-desc">Download all patients, invoices, and records as CSV</div></div>
            <button class="btn-ghost small" (click)="exportData()"><i class="pi pi-download"></i> Export</button>
          </div>
          <div class="da-item danger-item">
            <div><div class="toggle-lbl danger">Delete Account</div><div class="toggle-desc">Permanently delete clinic account and all data</div></div>
            <button class="btn-danger small" (click)="confirmDelete()"><i class="pi pi-trash"></i> Delete</button>
          </div>
        </div>
      </div>

      <div class="settings-card">
        <div class="card-section-header">
          <div><h3 class="section-title">Session Management</h3><p class="section-desc">Auto-logout and active session controls</p></div>
        </div>
        <div class="field-grid-1">
          <div class="field-group">
            <label>Session Timeout</label>
            <select [(ngModel)]="account.sessionTimeout" (ngModelChange)="markDirty()">
              <option [value]="30">30 minutes</option>
              <option [value]="60">1 hour</option>
              <option [value]="240">4 hours</option>
              <option [value]="480">8 hours</option>
              <option [value]="0">Never</option>
            </select>
          </div>
        </div>
        <button class="btn-warn" (click)="logoutAllSessions()"><i class="pi pi-sign-out"></i> Logout All Other Sessions</button>
      </div>

    </div>
  </ng-container>

  <!-- ── Sticky Save Bar ────────────────────────────────── -->
  <div class="save-bar" [class.visible]="isDirty">
    <div class="save-bar-inner">
      <span><i class="pi pi-circle-fill" style="color:#f59e0b;font-size:.6rem"></i> Unsaved changes</span>
      <div class="save-bar-actions">
        <button class="mbtn ghost" (click)="discardChanges()">Discard</button>
        <button class="mbtn primary" (click)="saveChanges()"><i class="pi pi-check"></i> Save Changes</button>
      </div>
    </div>
  </div>

</div><!-- /settings-page -->

<!-- ── Add Branch Modal ────────────────────────────────── -->
<div class="modal-overlay" [class.open]="branchModal">
  <div class="modal modal-form">
    <div class="modal-head"><h3>Add Branch</h3><button class="drawer-close pi pi-times" (click)="branchModal = false"></button></div>
    <div class="form-grid">
      <div class="fg fg-full"><label>Branch Name *</label><input [(ngModel)]="newBranch.name" placeholder="e.g. Dento Lounge – Kozhikode" /></div>
      <div class="fg fg-full"><label>Address *</label><input [(ngModel)]="newBranch.address" placeholder="Full street address" /></div>
      <div class="fg"><label>City *</label><input [(ngModel)]="newBranch.city" placeholder="City" /></div>
      <div class="fg"><label>Pincode</label><input [(ngModel)]="newBranch.pincode" placeholder="Pincode" /></div>
      <div class="fg"><label>Phone</label><input [(ngModel)]="newBranch.phone" placeholder="Phone number" /></div>
      <div class="fg"><label>Email</label><input [(ngModel)]="newBranch.email" placeholder="branch@clinic.com" /></div>
      <div class="fg"><label>Opens at</label><input type="time" [(ngModel)]="newBranch.workHoursFrom" /></div>
      <div class="fg"><label>Closes at</label><input type="time" [(ngModel)]="newBranch.workHoursTo" /></div>
    </div>
    <div class="modal-actions">
      <button class="mbtn ghost" (click)="branchModal = false">Cancel</button>
      <button class="mbtn primary" (click)="saveBranch()">Save Branch</button>
    </div>
  </div>
</div>

<!-- ── Add Member Modal ────────────────────────────────── -->
<div class="modal-overlay" [class.open]="addMemberModal">
  <div class="modal modal-form">
    <div class="modal-head"><h3>Add Team Member</h3><button class="drawer-close pi pi-times" (click)="addMemberModal = false"></button></div>
    <div class="form-grid">
      <div class="fg"><label>Full Name *</label><input [(ngModel)]="newMember.name" placeholder="Dr. Arjun" /></div>
      <div class="fg"><label>Email *</label><input type="email" [(ngModel)]="newMember.email" placeholder="user@clinic.com" /></div>
      <div class="fg"><label>Phone</label><input [(ngModel)]="newMember.phone" placeholder="Phone" /></div>
      <div class="fg"><label>Role *</label>
        <select [(ngModel)]="newMember.role">
          <option *ngFor="let r of roleList" [value]="r">{{ r }}</option>
        </select>
      </div>
      <div class="fg fg-full"><label>Branch</label>
        <select [(ngModel)]="newMember.branch">
          <option *ngFor="let b of branches" [value]="b.name">{{ b.name }}</option>
        </select>
      </div>
    </div>
    <div class="modal-actions">
      <button class="mbtn ghost" (click)="addMemberModal = false">Cancel</button>
      <button class="mbtn primary" (click)="saveMember()">Add Member</button>
    </div>
  </div>
</div>
  `,

  styles: [`
    :host { display: block; }

    /* ── Page ── */
    .settings-page {
      padding: 1.5rem 1.75rem;
      background: var(--surface-ground, #f8f9fa);
      min-height: 100%;
      display: flex; flex-direction: column; gap: 1rem;
      padding-bottom: 5rem;
    }

    /* ── Page Header ── */
    .page-header { display: flex; align-items: center; justify-content: space-between; gap: 1rem; flex-wrap: wrap; }
    .portal-tag { font-size: 0.7rem; font-weight: 700; color: #10b981; text-transform: uppercase; letter-spacing: 0.12em; margin-bottom: 0.2rem; }
    .page-title { font-size: 1.65rem; font-weight: 700; color: #212529; margin: 0; }
    .unsaved-bar {
      display: flex; align-items: center; gap: 0.7rem; background: #fff8e6;
      border: 1px solid #fde68a; border-radius: 10px; padding: 0.5rem 0.9rem;
      font-size: 0.83rem; font-weight: 600; color: #b45309;
      max-height: 0; overflow: hidden; opacity: 0; transition: all .3s;
    }
    .unsaved-bar.visible { max-height: 60px; opacity: 1; }

    /* ── Tab Bar ── */
    .tab-bar { display: flex; gap: 0.3rem; background: #fff; border: 1px solid #dee2e6; border-radius: 12px; padding: 0.4rem; flex-wrap: wrap; }
    .tab-btn { display: inline-flex; align-items: center; gap: 0.5rem; background: transparent; border: none; border-radius: 9px; padding: 0.52rem 1rem; font-size: 0.84rem; font-weight: 600; color: #6c757d; cursor: pointer; transition: all .15s; white-space: nowrap; }
    .tab-btn:hover { background: #f8f9fa; color: #212529; }
    .tab-btn.active { background: #10b981; color: #fff; }
    .tab-ico { font-size: 0.9rem; }

    /* ── Cards ── */
    .settings-card { background: #fff; border: 1px solid #dee2e6; border-radius: 12px; padding: 1.2rem 1.3rem; }
    .settings-card.no-pad { padding: 0; overflow: hidden; }
    .accent-card { border-left: 4px solid #10b981; }
    .settings-grid-2 { display: grid; grid-template-columns: 1fr 1fr; gap: 1rem; }

    /* ── Card Section Header ── */
    .card-section-header { display: flex; align-items: flex-start; justify-content: space-between; margin-bottom: 1rem; gap: 0.5rem; }
    .section-title { font-size: 0.95rem; font-weight: 700; color: #212529; margin: 0 0 0.2rem; }
    .section-desc { font-size: 0.77rem; color: #6c757d; margin: 0; }
    .section-topbar { display: flex; align-items: center; justify-content: space-between; gap: 1rem; }

    /* ── Clinic Identity ── */
    .clinic-identity { display: flex; align-items: center; gap: 1rem; }
    .logo-zone { display: flex; align-items: center; gap: 0.9rem; flex: 1; }
    .clinic-logo { width: 56px; height: 56px; background: linear-gradient(135deg,#10b981,#0d9488); border-radius: 14px; display: flex; align-items: center; justify-content: center; font-size: 1.1rem; font-weight: 700; color: #fff; flex-shrink: 0; }
    .clinic-name { margin: 0; font-size: 1.3rem; font-weight: 700; color: #212529; }
    .branch-pill { background: #e6f9f4; color: #0d9488; border: 1px solid #a7f3d0; font-size: 0.7rem; font-weight: 700; padding: 0.18rem 0.55rem; border-radius: 20px; }

    /* ── Form Fields ── */
    .field-grid-2 { display: grid; grid-template-columns: 1fr 1fr; gap: 0.8rem; }
    .field-grid-1 { display: flex; flex-direction: column; gap: 0.75rem; }
    .field-group { display: flex; flex-direction: column; gap: 0.28rem; }
    .fg-full { grid-column: 1 / -1; }
    .field-group label { font-size: 0.73rem; font-weight: 600; color: #6c757d; }
    .field-group input, .field-group select, .field-group textarea {
      background: #f8f9fa; border: 1px solid #dee2e6; border-radius: 8px;
      padding: 0.48rem 0.75rem; font-size: 0.84rem; color: #212529; outline: none;
      width: 100%; box-sizing: border-box; transition: border-color .15s; font-family: inherit;
    }
    .field-group input:focus, .field-group select:focus, .field-group textarea:focus { border-color: #10b981; background: #fff; }
    .disabled-input { opacity: .6; cursor: not-allowed !important; }
    .field-hint { font-size: 0.72rem; color: #adb5bd; }
    .field-hint[style], .field-hint:not(:empty) { color: #dc2626; }
    .input-prefix-wrap { display: flex; border: 1px solid #dee2e6; border-radius: 8px; overflow: hidden; background: #f8f9fa; transition: border-color .15s; }
    .input-prefix-wrap:focus-within { border-color: #10b981; background: #fff; }
    .input-prefix { background: #f1f3f4; border-right: 1px solid #dee2e6; padding: 0.48rem 0.65rem; font-size: 0.8rem; color: #6c757d; font-weight: 600; flex-shrink: 0; }
    .input-prefix-wrap input { border: none !important; border-radius: 0 !important; background: transparent !important; }
    .input-mask-wrap { display: flex; background: #f8f9fa; border: 1px solid #dee2e6; border-radius: 8px; overflow: hidden; transition: border-color .15s; }
    .input-mask-wrap:focus-within { border-color: #10b981; background: #fff; }
    .input-mask-wrap input { border: none !important; border-radius: 0 !important; background: transparent !important; flex: 1; }
    .mask-toggle { background: transparent; border: none; padding: 0 0.65rem; color: #adb5bd; cursor: pointer; font-size: 0.85rem; }
    .mask-toggle:hover { color: #495057; }
    .tip { font-size: 0.78rem; color: #adb5bd; cursor: help; }
    .secure-badge { display: inline-flex; align-items: center; gap: 0.3rem; font-size: 0.71rem; font-weight: 600; color: #15803d; background: #f0fdf4; border: 1px solid #bbf7d0; padding: 0.2rem 0.55rem; border-radius: 20px; flex-shrink: 0; }

    /* ── Inline links ── */
    .inline-actions-row { display: flex; gap: 1rem; margin-top: 0.5rem; padding-top: 0.6rem; border-top: 1px solid #f1f3f4; }
    .ia-link { background: transparent; border: none; color: #10b981; font-size: 0.8rem; font-weight: 600; cursor: pointer; display: inline-flex; align-items: center; gap: 0.35rem; padding: 0; }
    .ia-link:hover { color: #0d9488; }

    /* ── Buttons ── */
    .btn-primary { background: #10b981; color: #fff; border: none; border-radius: 8px; padding: 0.5rem 1rem; font-size: 0.83rem; font-weight: 600; cursor: pointer; display: inline-flex; align-items: center; gap: 0.4rem; transition: background .15s; white-space: nowrap; }
    .btn-primary:hover { background: #0d9488; }
    .btn-ghost { background: #fff; color: #495057; border: 1px solid #dee2e6; border-radius: 8px; padding: 0.48rem 0.9rem; font-size: 0.82rem; font-weight: 600; cursor: pointer; display: inline-flex; align-items: center; gap: 0.4rem; transition: all .15s; }
    .btn-ghost:hover { border-color: #10b981; color: #10b981; }
    .btn-ghost.small { padding: 0.32rem 0.65rem; font-size: 0.75rem; }
    .btn-outline { background: #fff; border: 1px solid #dee2e6; border-radius: 8px; padding: 0.5rem 0.9rem; font-size: 0.82rem; font-weight: 600; color: #495057; cursor: pointer; display: inline-flex; align-items: center; gap: 0.4rem; transition: all .15s; white-space: nowrap; }
    .btn-outline:hover { border-color: #10b981; color: #10b981; }
    .btn-warn { background: #fff8e6; color: #b45309; border: 1px solid #fde68a; border-radius: 8px; padding: 0.5rem 1rem; font-size: 0.82rem; font-weight: 600; cursor: pointer; display: inline-flex; align-items: center; gap: 0.4rem; transition: all .15s; }
    .btn-warn:hover { background: #fef3c7; }
    .btn-danger { background: #fff5f5; color: #dc2626; border: 1px solid #fca5a5; border-radius: 8px; padding: 0.4rem 0.8rem; font-size: 0.78rem; font-weight: 600; cursor: pointer; display: inline-flex; align-items: center; gap: 0.35rem; }
    .btn-danger:hover { background: #fee2e2; }
    .btn-icon { width: 32px; height: 32px; border: 1px solid #dee2e6; background: #fff; border-radius: 8px; cursor: pointer; display: flex; align-items: center; justify-content: center; color: #6c757d; font-size: 0.8rem; transition: all .15s; flex-shrink: 0; }
    .btn-icon:hover { border-color: #10b981; color: #10b981; }
    .act-btn { width: 30px; height: 30px; border-radius: 7px; border: 1px solid #dee2e6; background: #fff; color: #6c757d; cursor: pointer; font-size: 0.78rem; display: flex; align-items: center; justify-content: center; transition: all .15s; }
    .act-btn:hover { border-color: #10b981; color: #10b981; background: #f0fdf4; }
    .act-btn.warn:hover { border-color: #ef4444; color: #ef4444; background: #fff5f5; }
    .icon-remove { background: transparent; border: none; color: #adb5bd; cursor: pointer; font-size: 0.75rem; padding: 0; }
    .icon-remove:hover { color: #ef4444; }

    /* ── Toggles ── */
    .toggle-wrap { width: 40px; height: 22px; border-radius: 99px; background: #dee2e6; cursor: pointer; position: relative; flex-shrink: 0; transition: background .2s; }
    .toggle-wrap.on { background: #10b981; }
    .toggle-knob { position: absolute; width: 16px; height: 16px; background: #fff; border-radius: 50%; top: 3px; left: 3px; transition: left .2s; box-shadow: 0 1px 3px rgba(0,0,0,.2); }
    .toggle-wrap.on .toggle-knob { left: 21px; }
    .toggle-wrap.small { width: 34px; height: 18px; }
    .toggle-wrap.small .toggle-knob { width: 12px; height: 12px; top: 3px; left: 3px; }
    .toggle-wrap.small.on .toggle-knob { left: 19px; }
    .toggle-group-list { display: flex; flex-direction: column; gap: 0; margin-top: 0.8rem; border-top: 1px solid #f1f3f4; padding-top: 0.8rem; }
    .toggle-row { display: flex; align-items: center; justify-content: space-between; gap: 1rem; padding: 0.6rem 0; border-bottom: 1px solid #f8f9fa; }
    .toggle-row:last-child { border-bottom: none; }
    .toggle-lbl { font-size: 0.84rem; font-weight: 600; color: #212529; }
    .toggle-lbl.danger { color: #dc2626; }
    .toggle-desc { font-size: 0.76rem; color: #6c757d; margin-top: 0.1rem; }

    /* ── Branches ── */
    .branches-grid { display: grid; grid-template-columns: repeat(auto-fill, minmax(320px, 1fr)); gap: 1rem; }
    .branch-card { background: #fff; border: 1px solid #dee2e6; border-radius: 12px; padding: 1.1rem; transition: box-shadow .2s; }
    .branch-card:hover { box-shadow: 0 4px 16px rgba(0,0,0,.08); }
    .branch-card.primary { border-color: #10b981; border-left: 4px solid #10b981; }
    .branch-head { display: flex; align-items: center; gap: 0.75rem; margin-bottom: 0.9rem; }
    .branch-av { width: 38px; height: 38px; background: linear-gradient(135deg,#10b981,#0d9488); border-radius: 10px; display: flex; align-items: center; justify-content: center; font-size: 1rem; font-weight: 700; color: #fff; flex-shrink: 0; }
    .branch-info { flex: 1; }
    .branch-name { font-size: 0.92rem; font-weight: 700; color: #212529; display: block; }
    .primary-chip { font-size: 0.65rem; font-weight: 700; background: #e6f9f4; color: #0d9488; border: 1px solid #a7f3d0; padding: 0.1rem 0.45rem; border-radius: 20px; }
    .branch-actions { display: flex; gap: 0.3rem; }
    .branch-details { display: flex; flex-direction: column; gap: 0.45rem; }
    .bd-row { display: flex; align-items: flex-start; gap: 0.6rem; font-size: 0.81rem; color: #495057; }
    .bd-row .pi { color: #adb5bd; font-size: 0.78rem; margin-top: 0.1rem; flex-shrink: 0; }

    /* ── Team ── */
    .perm-matrix-card { margin-bottom: 0; }
    .matrix-title { font-size: 0.82rem; font-weight: 700; color: #6c757d; text-transform: uppercase; letter-spacing: 0.06em; margin: 0 0 0.8rem; }
    .matrix-scroll { overflow-x: auto; }
    .perm-table { width: 100%; border-collapse: collapse; min-width: 600px; font-size: 0.8rem; }
    .perm-table th { text-align: left; padding: 0.5rem 0.75rem; font-size: 0.72rem; font-weight: 700; color: #adb5bd; text-transform: uppercase; letter-spacing: 0.05em; background: #f8f9fa; border-bottom: 1px solid #dee2e6; }
    .perm-table td { padding: 0.5rem 0.75rem; border-bottom: 1px solid #f1f3f4; }
    .perm-feature { font-size: 0.82rem; font-weight: 600; color: #212529; }
    .perm-yes { color: #15803d; font-weight: 700; }
    .perm-no { color: #dee2e6; }
    .team-table { width: 100%; border-collapse: collapse; }
    .team-table th { background: #f8f9fa; text-align: left; font-size: 0.71rem; font-weight: 700; color: #adb5bd; text-transform: uppercase; letter-spacing: 0.06em; padding: 0.65rem 0.75rem; border-bottom: 1px solid #dee2e6; }
    .team-table td { padding: 0.75rem 0.75rem; border-bottom: 1px solid #f1f3f4; font-size: 0.84rem; color: #495057; vertical-align: middle; }
    .member-cell { display: flex; align-items: center; gap: 0.65rem; }
    .member-av { width: 34px; height: 34px; border-radius: 50%; display: flex; align-items: center; justify-content: center; font-size: 0.75rem; font-weight: 700; color: #fff; flex-shrink: 0; }
    .member-name { font-size: 0.86rem; font-weight: 600; color: #212529; }
    .member-email { font-size: 0.73rem; color: #adb5bd; }
    .row-actions { display: flex; gap: 0.3rem; }
    .role-badge { font-size: 0.72rem; font-weight: 700; padding: 0.2rem 0.6rem; border-radius: 6px; }
    .role-super-admin { background: #fce7f3; color: #be185d; }
    .role-admin { background: #dbeafe; color: #1d4ed8; }
    .role-dentist { background: #e6f9f4; color: #0d9488; }
    .role-receptionist { background: #fef9c3; color: #a16207; }
    .role-assistant { background: #ede9fe; color: #7c3aed; }
    .status-dot { font-size: 0.74rem; font-weight: 700; padding: 0.2rem 0.6rem; border-radius: 20px; }
    .status-dot.active { background: #dcfce7; color: #15803d; }
    .status-dot.inactive { background: #f1f3f4; color: #6c757d; }
    .muted-text { font-size: 0.78rem; color: #adb5bd; }

    /* ── Billing ── */
    .tax-preview { background: #f0fdf4; border: 1px solid #bbf7d0; border-radius: 8px; padding: 0.7rem 0.9rem; display: flex; justify-content: space-between; align-items: center; font-size: 0.84rem; font-weight: 600; color: #15803d; }

    /* ── Practice ── */
    .work-days-grid { display: flex; flex-direction: column; gap: 0.5rem; }
    .wd-row { display: flex; align-items: center; gap: 0.75rem; padding: 0.45rem 0; }
    .day-lbl { font-size: 0.82rem; font-weight: 600; color: #212529; width: 90px; flex-shrink: 0; }
    .day-lbl.disabled { color: #adb5bd; }
    .time-input { background: #f8f9fa; border: 1px solid #dee2e6; border-radius: 7px; padding: 0.35rem 0.55rem; font-size: 0.8rem; color: #212529; outline: none; width: 100px; }
    .time-input:focus { border-color: #10b981; background: #fff; }
    .price-table { border: 1px solid #dee2e6; border-radius: 8px; overflow: hidden; }
    .pt-header { display: grid; grid-template-columns: 2.5fr 1.5fr 1fr 1fr 32px; gap: 0.5rem; padding: 0.55rem 0.85rem; background: #f8f9fa; font-size: 0.68rem; font-weight: 700; color: #adb5bd; text-transform: uppercase; letter-spacing: 0.05em; border-bottom: 1px solid #dee2e6; }
    .pt-row { display: grid; grid-template-columns: 2.5fr 1.5fr 1fr 1fr 32px; gap: 0.5rem; padding: 0.5rem 0.85rem; border-bottom: 1px solid #f1f3f4; align-items: center; }
    .pt-row:last-child { border-bottom: none; }
    .pt-row input, .pt-row select { background: #f8f9fa; border: 1px solid #dee2e6; border-radius: 6px; padding: 0.38rem 0.55rem; font-size: 0.82rem; color: #212529; outline: none; width: 100%; box-sizing: border-box; }
    .pt-row input:focus, .pt-row select:focus { border-color: #10b981; background: #fff; }

    /* ── Notifications ── */
    .channel-card { display: flex; align-items: center; justify-content: space-between; padding: 0.85rem 0; border-bottom: 1px solid #f1f3f4; gap: 1rem; }
    .channel-card:last-child { border-bottom: none; }
    .ch-left { display: flex; align-items: center; gap: 0.75rem; }
    .ch-ico { width: 36px; height: 36px; border-radius: 9px; display: flex; align-items: center; justify-content: center; font-size: 1rem; flex-shrink: 0; }
    .ch-name { font-size: 0.86rem; font-weight: 600; color: #212529; }
    .ch-desc { font-size: 0.74rem; color: #6c757d; }
    .ch-right { display: flex; align-items: center; gap: 0.6rem; flex-shrink: 0; }
    .conn-badge { font-size: 0.72rem; font-weight: 700; padding: 0.2rem 0.6rem; border-radius: 20px; }
    .conn-badge.connected { background: #dcfce7; color: #15803d; border: 1px solid #86efac; }
    .conn-badge.disconnected { background: #f1f3f4; color: #6c757d; border: 1px solid #dee2e6; }
    .notif-table-wrap { overflow-x: auto; }
    .notif-table { width: 100%; border-collapse: collapse; }
    .notif-table th { background: #f8f9fa; font-size: 0.71rem; font-weight: 700; color: #adb5bd; text-transform: uppercase; letter-spacing: 0.06em; padding: 0.65rem 0.75rem; border-bottom: 1px solid #dee2e6; text-align: left; }
    .notif-table .ch-th { text-align: center; width: 100px; }
    .notif-table td { padding: 0.72rem 0.75rem; border-bottom: 1px solid #f1f3f4; vertical-align: middle; }
    .notif-table tr:last-child td { border-bottom: none; }
    .notif-table .ch-td { text-align: center; }
    .rule-name { font-size: 0.84rem; font-weight: 600; color: #212529; }
    .rule-desc { font-size: 0.77rem; }

    /* ── Account ── */
    .divider { height: 1px; background: #f1f3f4; margin: 0.8rem 0; }
    .login-history { display: flex; flex-direction: column; gap: 0.3rem; }
    .lh-row { display: flex; align-items: center; justify-content: space-between; padding: 0.6rem 0; border-bottom: 1px solid #f1f3f4; }
    .lh-row:last-child { border-bottom: none; }
    .lh-device { font-size: 0.84rem; font-weight: 600; color: #212529; }
    .lh-meta { font-size: 0.75rem; color: #adb5bd; margin-top: 0.1rem; }
    .lh-status { font-size: 0.72rem; font-weight: 700; color: #10b981; }
    .data-actions { display: flex; flex-direction: column; gap: 0; }
    .da-item { display: flex; align-items: center; justify-content: space-between; padding: 0.75rem 0; border-bottom: 1px solid #f1f3f4; gap: 1rem; }
    .da-item:last-child { border-bottom: none; }
    .danger-item { padding-top: 0.85rem; }
    .danger { color: #dc2626; }

    /* ── Save Bar ── */
    .save-bar { position: fixed; bottom: 0; left: 0; right: 0; z-index: 900; max-height: 0; overflow: hidden; transition: max-height .3s; pointer-events: none; }
    .save-bar.visible { max-height: 80px; pointer-events: all; }
    .save-bar-inner { margin: 0 auto; max-width: 1400px; background: #0f172a; color: #fff; border-radius: 12px 12px 0 0; padding: 0.75rem 1.5rem; display: flex; align-items: center; justify-content: space-between; font-size: 0.84rem; font-weight: 600; gap: 1rem; }
    .save-bar-actions { display: flex; gap: 0.5rem; }

    /* ── Modal ── */
    .modal-overlay { position: fixed; inset: 0; background: rgba(0,0,0,.35); display: flex; align-items: center; justify-content: center; opacity: 0; pointer-events: none; transition: opacity .2s; z-index: 1100; }
    .modal-overlay.open { opacity: 1; pointer-events: all; }
    .modal { background: #fff; border-radius: 14px; padding: 1.5rem; width: 560px; max-width: 95vw; box-shadow: 0 20px 60px rgba(0,0,0,.18); text-align: left; }
    .modal-form { }
    .modal-head { display: flex; align-items: center; justify-content: space-between; margin-bottom: 1.2rem; }
    .modal-head h3 { margin: 0; font-size: 1.1rem; font-weight: 700; color: #212529; }
    .drawer-close { background: transparent; border: none; cursor: pointer; color: #6c757d; font-size: 1rem; }
    .form-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 0.8rem; margin-bottom: 1.2rem; }
    .fg { display: flex; flex-direction: column; gap: 0.3rem; }
    .fg-full { grid-column: 1 / -1; }
    .fg label { font-size: 0.73rem; font-weight: 600; color: #6c757d; }
    .fg input, .fg select { background: #f8f9fa; border: 1px solid #dee2e6; border-radius: 8px; padding: 0.48rem 0.7rem; font-size: 0.84rem; color: #212529; outline: none; width: 100%; box-sizing: border-box; transition: border-color .15s; }
    .fg input:focus, .fg select:focus { border-color: #10b981; background: #fff; }
    .modal-actions { display: flex; gap: 0.55rem; justify-content: flex-end; border-top: 1px solid #f1f3f4; padding-top: 1rem; }
    .mbtn { border-radius: 8px; padding: 0.52rem 1.1rem; font-size: 0.84rem; font-weight: 600; cursor: pointer; border: none; transition: all .15s; display: inline-flex; align-items: center; gap: 0.35rem; }
    .mbtn.ghost { background: #f8f9fa; color: #6c757d; border: 1px solid #dee2e6; }
    .mbtn.ghost:hover { border-color: #adb5bd; }
    .mbtn.primary { background: #10b981; color: #fff; }
    .mbtn.primary:hover { background: #0d9488; }
    .mbtn.small { padding: 0.35rem 0.8rem; font-size: 0.78rem; }

    @media (max-width: 900px) {
      .settings-page { padding: 1rem; }
      .settings-grid-2 { grid-template-columns: 1fr; }
      .field-grid-2 { grid-template-columns: 1fr; }
      .fg-full { grid-column: auto; }
      .tab-bar { gap: 0.2rem; }
      .tab-btn { padding: 0.45rem 0.65rem; font-size: 0.78rem; }
    }
  `]
})
export class SettingsPage implements OnInit {

  activeTab: SettingsTab = 'General';
  isDirty = false;
  showAccountNo = false;
  branchModal = false;
  addMemberModal = false;
  pwForm = { current: '', newPw: '', confirm: '' };

  tabs = [
    { label: 'General', val: 'General' as SettingsTab, icon: '⚙' },
    { label: 'Branches', val: 'Branches' as SettingsTab, icon: '🏢' },
    { label: 'Team', val: 'Team' as SettingsTab, icon: '👥' },
    { label: 'Billing', val: 'Billing' as SettingsTab, icon: '💳' },
    { label: 'Practice', val: 'Practice' as SettingsTab, icon: '🦷' },
    { label: 'Notifications', val: 'Notifications' as SettingsTab, icon: '🔔' },
    { label: 'Account', val: 'Account' as SettingsTab, icon: '🔐' },
  ];

  // ─── General ─────────────────────────────────────────────
  general = {
    clinicName: 'Dento Lounge', clinicInitials: 'DL',
    adminName: 'Arjun', adminEmail: 'demo@dentobees.com', adminPhone: '9539192684',
    address: 'Shop 4, Calicut Tower', city: 'Calicut', state: 'Kerala',
    pincode: '673001', country: 'India', timezone: 'Asia/Kolkata',
    whatsapp: '9539192684', website: '', gstin: '', supportEmail: 'demo@dentobees.com',
    bankName: '', accountNo: '', ifsc: '', upiId: '',
    twoFA: false, lastLogin: '08 Mar 2026, 9:30 AM',
  };

  // ─── Branches ────────────────────────────────────────────
  branches: Branch[] = [
    { id: 1, name: 'Dento Lounge – Calicut', address: 'Shop 4, Calicut Tower', city: 'Calicut', state: 'Kerala', pincode: '673001', phone: '9539192684', email: 'calicut@dentolounge.com', isPrimary: true, workHoursFrom: '09:00', workHoursTo: '20:00', workDays: ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'] },
  ];

  newBranch: Partial<Branch> = { name: '', address: '', city: '', state: '', pincode: '', phone: '', email: '', workHoursFrom: '09:00', workHoursTo: '18:00', workDays: ['Mon', 'Tue', 'Wed', 'Thu', 'Fri'] };

  // ─── Team ────────────────────────────────────────────────
  roleList: TeamRole[] = ['Super Admin', 'Admin', 'Dentist', 'Receptionist', 'Assistant'];

  permMatrix = [
    { feature: 'View All Patients', perms: { 'Super Admin': true, 'Admin': true, 'Dentist': true, 'Receptionist': true, 'Assistant': false } },
    { feature: 'Manage Billing', perms: { 'Super Admin': true, 'Admin': true, 'Dentist': false, 'Receptionist': true, 'Assistant': false } },
    { feature: 'Settings Access', perms: { 'Super Admin': true, 'Admin': true, 'Dentist': false, 'Receptionist': false, 'Assistant': false } },
    { feature: 'Delete Records', perms: { 'Super Admin': true, 'Admin': true, 'Dentist': false, 'Receptionist': false, 'Assistant': false } },
    { feature: 'View Reports', perms: { 'Super Admin': true, 'Admin': true, 'Dentist': true, 'Receptionist': false, 'Assistant': false } },
    { feature: 'Manage Team', perms: { 'Super Admin': true, 'Admin': true, 'Dentist': false, 'Receptionist': false, 'Assistant': false } },
    { feature: 'Collect Payments', perms: { 'Super Admin': true, 'Admin': true, 'Dentist': false, 'Receptionist': true, 'Assistant': false } },
    { feature: 'Clinical Notes', perms: { 'Super Admin': true, 'Admin': false, 'Dentist': true, 'Receptionist': false, 'Assistant': true } },
  ];

  team: TeamMember[] = [
    { id: 1, name: 'Arjun Nair', email: 'arjun@dentolounge.com', phone: '9539192684', role: 'Super Admin', branch: 'Calicut', status: 'Active', lastLogin: '08 Mar 2026', avatar: 'AN' },
    { id: 2, name: 'Dr. Priya Mehta', email: 'priya@dentolounge.com', phone: '9876543210', role: 'Dentist', branch: 'Calicut', status: 'Active', lastLogin: '07 Mar 2026', avatar: 'PM' },
    { id: 3, name: 'Sunita Verma', email: 'sunita@dentolounge.com', phone: '9765432109', role: 'Receptionist', branch: 'Calicut', status: 'Active', lastLogin: '08 Mar 2026', avatar: 'SV' },
    { id: 4, name: 'Rahul Das', email: 'rahul@dentolounge.com', phone: '9654321098', role: 'Assistant', branch: 'Calicut', status: 'Inactive', lastLogin: '01 Feb 2026', avatar: 'RD' },
  ];

  newMember: Partial<TeamMember> = { name: '', email: '', phone: '', role: 'Receptionist', branch: 'Calicut', status: 'Active' };

  // ─── Billing ─────────────────────────────────────────────
  billing = { invoicePrefix: 'INV', paymentTerms: 7, invoiceNotes: 'Thank you for choosing Dento Lounge!', cgst: 9, sgst: 9 };
  billingToggles = [
    { label: 'Allow Partial Payments', desc: 'Patients can pay invoice in installments', enabled: true },
    { label: 'Enable Refunds', desc: 'Allow refund workflow with reason capture', enabled: true },
    { label: 'Credit Notes', desc: 'Issue credit notes for overpayments', enabled: false },
    { label: 'Auto-mark Overdue', desc: 'Mark unpaid invoices overdue after due date', enabled: true },
  ];

  // ─── Practice ────────────────────────────────────────────
  practice = { defaultDuration: 30, recallInterval: 6, chairs: 3 };
  workDays = [
    { name: 'Monday', enabled: true, from: '09:00', to: '20:00' },
    { name: 'Tuesday', enabled: true, from: '09:00', to: '20:00' },
    { name: 'Wednesday', enabled: true, from: '09:00', to: '20:00' },
    { name: 'Thursday', enabled: true, from: '09:00', to: '20:00' },
    { name: 'Friday', enabled: true, from: '09:00', to: '20:00' },
    { name: 'Saturday', enabled: true, from: '09:00', to: '15:00' },
    { name: 'Sunday', enabled: false, from: '10:00', to: '13:00' },
  ];
  treatmentCategories = ['General', 'Cosmetic', 'Orthodontic', 'Endodontic', 'Surgical', 'Hygiene', 'Prosthetic', 'Pediatric'];
  treatments = [
    { name: 'Consultation', category: 'General', duration: 15, price: 500 },
    { name: 'Scaling & Polishing', category: 'Hygiene', duration: 45, price: 1500 },
    { name: 'Root Canal Treatment', category: 'Endodontic', duration: 90, price: 8000 },
    { name: 'Tooth Extraction', category: 'Surgical', duration: 30, price: 1200 },
    { name: 'Composite Filling', category: 'General', duration: 30, price: 2000 },
    { name: 'Crown Fitting', category: 'Prosthetic', duration: 60, price: 12000 },
  ];

  practiceToggles = [
    { label: 'Token System', desc: 'Assign tokens to appointments for queue management', enabled: true },
    { label: 'Recall Reminders', desc: 'Auto-send recall reminders based on interval setting', enabled: true },
    { label: 'Conflict Detection', desc: 'Prevent double-booking of doctor or chair', enabled: true },
    { label: 'Waitlist', desc: 'Allow patients to join a waitlist when slots are full', enabled: false },
  ];

  // ─── Notifications ───────────────────────────────────────
  notifChannels = [
    { name: 'SMS', provider: 'Twilio', connected: false, icon: '💬', bg: '#dbeafe', color: '#1d4ed8' },
    { name: 'WhatsApp Business', provider: 'Meta Cloud API', connected: false, icon: '📱', bg: '#dcfce7', color: '#15803d' },
    { name: 'Email (SMTP)', provider: 'Gmail SMTP', connected: true, icon: '✉', bg: '#f3f4f6', color: '#374151' },
  ];

  reminderTimings = [
    { label: 'First Reminder', value: 1440, enabled: true },
    { label: 'Second Reminder', value: 120, enabled: true },
    { label: 'Overdue Invoice Reminder', value: 1440, enabled: true },
  ];

  notifRules: NotificationRule[] = [
    { id: 'appt_confirm', label: 'Appointment Confirmed', description: 'When an appointment is confirmed', smsEnabled: true, whatsappEnabled: true, emailEnabled: false },
    { id: 'appt_reminder', label: 'Appointment Reminder', description: 'Reminder before appointment time', smsEnabled: true, whatsappEnabled: true, emailEnabled: true },
    { id: 'appt_cancel', label: 'Appointment Cancelled', description: 'When an appointment is cancelled', smsEnabled: false, whatsappEnabled: true, emailEnabled: true },
    { id: 'invoice_created', label: 'Invoice Created', description: 'When a new invoice is generated', smsEnabled: false, whatsappEnabled: true, emailEnabled: true },
    { id: 'payment_received', label: 'Payment Received', description: 'After successful payment collection', smsEnabled: true, whatsappEnabled: true, emailEnabled: true },
    { id: 'invoice_overdue', label: 'Invoice Overdue', description: 'When invoice crosses due date unpaid', smsEnabled: true, whatsappEnabled: true, emailEnabled: false },
    { id: 'recall_due', label: 'Recall Reminder', description: 'Periodic recall based on interval', smsEnabled: false, whatsappEnabled: true, emailEnabled: true },
  ];

  // ─── Account ─────────────────────────────────────────────
  account = { sessionTimeout: 60 };
  loginHistory = [
    { device: 'Chrome on Windows', location: 'Calicut, Kerala', time: '08 Mar 2026, 9:30 AM', current: true },
    { device: 'Safari on iPhone', location: 'Calicut, Kerala', time: '07 Mar 2026, 7:15 PM', current: false },
    { device: 'Chrome on MacBook', location: 'Kozhikode, Kerala', time: '06 Mar 2026, 11:00 AM', current: false },
  ];

  // ─── Lifecycle ───────────────────────────────────────────
  ngOnInit() {}

  // ─── State ───────────────────────────────────────────────
  setTab(t: SettingsTab) { this.activeTab = t; }
  markDirty() { this.isDirty = true; }
  discardChanges() { this.isDirty = false; }
  saveChanges() { this.isDirty = false; console.log('Settings saved'); }

  // ─── General ─────────────────────────────────────────────
  triggerLogoUpload() { console.log('Open file picker for logo'); }
  editSection(s: string) { console.log('Edit section', s); }
  isValidGSTIN(g: string) { return /^[0-9]{2}[A-Z]{5}[0-9]{4}[A-Z]{1}[1-9A-Z]{1}Z[0-9A-Z]{1}$/.test(g); }
  changePassword() { this.setTab('Account'); }
  toggle2FA() { this.general.twoFA = !this.general.twoFA; this.markDirty(); }

  // ─── Branches ────────────────────────────────────────────
  addBranch() { this.newBranch = { name: '', address: '', city: '', state: '', pincode: '', phone: '', email: '', workHoursFrom: '09:00', workHoursTo: '18:00', workDays: ['Mon', 'Tue', 'Wed', 'Thu', 'Fri'] }; this.branchModal = true; }
  saveBranch() {
    if (!this.newBranch.name) return;
    this.branches.push({ ...this.newBranch, id: this.branches.length + 1, isPrimary: false, state: this.newBranch.state || '', workDays: this.newBranch.workDays || [] } as Branch);
    this.branchModal = false; this.markDirty();
  }
  editBranch(b: Branch) { console.log('Edit branch', b.name); }
  deleteBranch(b: Branch) { this.branches = this.branches.filter(br => br.id !== b.id); this.markDirty(); }

  // ─── Team ────────────────────────────────────────────────
  roleColor(role: TeamRole) {
    const map: Record<TeamRole, string> = { 'Super Admin': '#be185d', 'Admin': '#1d4ed8', 'Dentist': '#0d9488', 'Receptionist': '#a16207', 'Assistant': '#7c3aed' };
    return map[role];
  }
  saveMember() {
    if (!this.newMember.name || !this.newMember.email) return;
    this.team.push({ ...this.newMember, id: this.team.length + 1, status: 'Active', avatar: this.newMember.name!.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2) } as TeamMember);
    this.addMemberModal = false; this.markDirty();
  }
  editMember(m: TeamMember) { console.log('Edit member', m.name); }
  resetPassword(m: TeamMember) { console.log('Reset password for', m.email); }
  toggleMemberStatus(m: TeamMember) { m.status = m.status === 'Active' ? 'Inactive' : 'Active'; this.markDirty(); }

  // ─── Practice ────────────────────────────────────────────
  addTreatment() { this.treatments.push({ name: '', category: 'General', duration: 30, price: 0 }); this.markDirty(); }
  removeTreatment(i: number) { this.treatments.splice(i, 1); this.markDirty(); }

  // ─── Notifications ───────────────────────────────────────
  configureChannel(ch: any) { console.log('Configure channel', ch.name); }

  // ─── Account ─────────────────────────────────────────────
  submitPasswordChange() {
    if (!this.pwForm.current || !this.pwForm.newPw) return;
    if (this.pwForm.newPw !== this.pwForm.confirm) { console.log('Passwords do not match'); return; }
    console.log('Password changed'); this.pwForm = { current: '', newPw: '', confirm: '' };
  }
  exportData() { console.log('Export all data'); }
  confirmDelete() { console.log('Confirm account deletion'); }
  logoutAllSessions() { console.log('Logout all sessions'); }
}