// src/app/features/patient-profile/consultation-notes/consultation-notes.component.ts

import { CommonModule } from '@angular/common';
import { Component, EventEmitter, Input, Output } from '@angular/core';
import { FormControl, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';

type ConsultationNote = { id: string; author: string; date: string; content: string };

@Component({
  selector: 'app-consultation-notes',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],
  template: `
    <section class="card">
      <div class="header">
        <div class="title">
          <h3>Consultation Notes</h3>
        </div>

        <button type="button" class="btn" (click)="openNewNote()">+ New Note</button>
      </div>

      <div *ngIf="isCreating" class="new-note">
        <form [formGroup]="form" (ngSubmit)="save()">
          <textarea
            rows="3"
            placeholder="Write consultation note..."
            formControlName="content"
          ></textarea>

          <div class="actions">
            <button type="button" class="btn ghost" (click)="cancel()">Cancel</button>
            <button type="submit" class="btn" [disabled]="form.invalid">Save</button>
          </div>
        </form>
      </div>

      <div class="list" *ngIf="notes?.length; else empty">
        <article class="note" *ngFor="let n of notes">
          <div class="meta">
            <div class="who">{{ n.author }}</div>
            <div class="when">{{ n.date }}</div>
          </div>

          <div class="content">{{ n.content }}</div>

          <button type="button" class="icon danger" (click)="deleteNote.emit(n.id)" aria-label="Delete note">
            🗑️
          </button>
        </article>
      </div>

      <ng-template #empty>
        <div class="empty">No consultation notes yet.</div>
      </ng-template>
    </section>
  `,
  styles: [`
    .card{ background:#fff; border-radius:14px; padding:16px; box-shadow:0 2px 10px rgba(0,0,0,.06); }
    .header{ display:flex; justify-content:space-between; align-items:center; gap:12px; }
    h3{ margin:0; font-size:18px; }
    .btn{ border:none; padding:10px 12px; border-radius:10px; background:#2563eb; color:#fff; cursor:pointer; }
    .btn.ghost{ background:#eef2ff; color:#1e3a8a; }
    .btn[disabled]{ opacity:.5; cursor:not-allowed; }
    .new-note{ margin-top:12px; }
    textarea{ width:100%; padding:10px; border-radius:10px; border:1px solid #e5e7eb; resize:vertical; }
    .actions{ display:flex; justify-content:flex-end; gap:8px; margin-top:10px; }
    .list{ margin-top:12px; display:flex; flex-direction:column; gap:10px; }
    .note{ position:relative; padding:12px; border-radius:12px; border:1px solid #f1f5f9; }
    .meta{ display:flex; gap:10px; color:#64748b; font-size:12px; }
    .who{ font-weight:600; color:#0f172a; }
    .content{ margin-top:6px; }
    .icon{ position:absolute; right:10px; top:10px; border:none; background:transparent; cursor:pointer; }
    .icon.danger{ color:#ef4444; }
    .empty{ margin-top:12px; color:#64748b; }
  `]
})
export class ConsultationNotesComponent {
  @Input({ required: true }) notes: ConsultationNote[] = [];
  @Input() doctorName = 'Doctor';

  @Output() addNote = new EventEmitter<{ author: string; content: string }>();
  @Output() deleteNote = new EventEmitter<string>();

  isCreating = false;

  form = new FormGroup({
    content: new FormControl<string>('', { nonNullable: true, validators: [Validators.required, Validators.minLength(2)] })
  });

  openNewNote(): void {
    this.isCreating = true;
    this.form.reset({ content: '' });
  }

  cancel(): void {
    this.isCreating = false;
  }

  save(): void {
    if (this.form.invalid) return;

    this.addNote.emit({
      author: this.doctorName,
      content: this.form.controls.content.value.trim()
    });

    this.isCreating = false;
  }
}