// src/app/features/patient-profile/consultation-notes/consultation-notes.component.ts
import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { PatientProfileStore } from '../store/patient-profile.store';

export interface ConsultationNote {
  id: number;
  author: string;
  date: string;
  content: string;
}

@Component({
  selector: 'app-consultation-notes',
  standalone: true,
  imports: [CommonModule, FormsModule],
  template: `
    <div class="notes-card">
      <h3 class="notes-title">Consultation Notes</h3>

      <div class="note-write">
        <textarea
          class="note-textarea"
          [(ngModel)]="draftNote"
          placeholder="Write consultation notes here..."
          rows="4">
        </textarea>
        <div class="note-actions">
          <button class="btn-save-note"
            [disabled]="!draftNote.trim()"
            (click)="saveNote()">
            Save Note
          </button>
        </div>
      </div>

      <div class="notes-history" *ngIf="notes.length > 0">
        <div class="note-entry" *ngFor="let n of notes">
          <div class="note-meta">
            <span class="note-author">{{ n.author }}</span>
            <span class="note-date">{{ n.date }}</span>
          </div>
          <p class="note-content">{{ n.content }}</p>
        </div>
      </div>

      <div class="notes-empty" *ngIf="notes.length === 0 && !draftNote">
        <p>No consultation notes yet.</p>
      </div>
    </div>
  `,
  styles: [`
    .notes-card {
      background: var(--surface-0, #fff);
      border: 1px solid var(--surface-200, #e5e7eb);
      border-radius: 14px;
      padding: 1.5rem;
    }
    .notes-title { font-size: 1.05rem; font-weight: 700; color: #111827; margin: 0 0 1rem; }

    .note-write { display: flex; flex-direction: column; gap: 0.75rem; }
    .note-textarea {
      width: 100%; box-sizing: border-box;
      border: 1.5px solid #e5e7eb; border-radius: 10px;
      padding: 0.875rem 1rem; font-size: 0.9rem; color: #374151;
      outline: none; resize: vertical; font-family: inherit;
      transition: border-color 0.15s, box-shadow 0.15s;
      &::placeholder { color: #9ca3af; }
      &:focus { border-color: #2dd4bf; box-shadow: 0 0 0 3px rgba(45,212,191,0.1); }
    }
    .note-actions { display: flex; justify-content: flex-end; }
    .btn-save-note {
      padding: 0.55rem 1.5rem; border: none; border-radius: 8px;
      background: #2dd4bf; color: #fff; font-size: 0.875rem; font-weight: 700;
      cursor: pointer; transition: background 0.15s, opacity 0.15s;
      &:hover:not(:disabled) { background: #14b8a6; }
      &:disabled { opacity: 0.4; cursor: not-allowed; }
    }

    .notes-history { margin-top: 1.25rem; display: flex; flex-direction: column; gap: 0.875rem; }
    .note-entry {
      padding: 0.875rem 1rem; background: #f9fafb;
      border-radius: 10px; border-left: 3px solid #2dd4bf;
    }
    .note-meta { display: flex; align-items: center; gap: 0.75rem; margin-bottom: 0.4rem; }
    .note-author { font-size: 0.82rem; font-weight: 700; color: #0f766e; }
    .note-date   { font-size: 0.78rem; color: #9ca3af; }
    .note-content { font-size: 0.875rem; color: #374151; margin: 0; line-height: 1.5; }

    .notes-empty { padding: 1.5rem; text-align: center; color: #9ca3af; font-size: 0.875rem; font-style: italic; }
    .notes-empty p { margin: 0; }
  `]
})
export class ConsultationNotesComponent {
  constructor(private readonly store: PatientProfileStore) {}

  get draftNote(): string {
    return this.store.state.consultation.draftNote;
  }

  set draftNote(value: string) {
    this.store.setConsultationState({ draftNote: value });
  }

  get notes(): ConsultationNote[] {
    return this.store.state.consultation.notes;
  }

  saveNote(): void {
    if (!this.draftNote.trim()) {
      return;
    }

    const updated: ConsultationNote[] = [
      {
        id: Date.now(),
        author: 'Dr. Arjun',
        date: new Date().toLocaleDateString('en-GB', {
          day: '2-digit',
          month: 'short',
          year: 'numeric',
        }),
        content: this.draftNote.trim(),
      },
      ...this.notes,
    ];

    this.store.setConsultationState({
      notes: updated,
      draftNote: '',
    });
  }
}
