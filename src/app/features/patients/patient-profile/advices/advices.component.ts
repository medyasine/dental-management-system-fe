import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { PatientProfileStore } from '../store/patient-profile.store';

export interface AdviceSession {
  label: string;
  date: string;
  isToday: boolean;
  advices: string[];
}

@Component({
  selector: 'app-advices',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './advices.component.html',
  styleUrls: ['./advices.component.scss'],
})
export class AdvicesComponent {
  constructor(private readonly store: PatientProfileStore) {}

  get sessions(): AdviceSession[] {
    return this.store.state.advices.sessions;
  }

  get activeSessionIndex(): number {
    return this.store.state.advices.activeSessionIndex;
  }

  set activeSessionIndex(value: number) {
    this.store.setAdvicesState({ activeSessionIndex: value });
  }

  get newAdvice(): string {
    return this.store.state.advices.newAdvice;
  }

  set newAdvice(value: string) {
    this.store.setAdvicesState({ newAdvice: value });
  }

  get activeSession(): AdviceSession {
    return this.sessions[this.activeSessionIndex];
  }

  addAdvice(): void {
    const value = this.newAdvice.trim();
    if (!value) {
      return;
    }

    const updatedSessions = this.sessions.map((session, index) =>
      index === this.activeSessionIndex
        ? { ...session, advices: [...session.advices, value] }
        : session,
    );

    this.store.setAdvicesState({ sessions: updatedSessions, newAdvice: '' });
  }

  removeAdvice(item: string): void {
    const updatedSessions = this.sessions.map((session, index) =>
      index === this.activeSessionIndex
        ? {
            ...session,
            advices: session.advices.filter((advice) => advice !== item),
          }
        : session,
    );

    this.store.setAdvicesState({ sessions: updatedSessions });
  }

  onEnter(event: Event): void {
    event.preventDefault();
    this.addAdvice();
  }
}
