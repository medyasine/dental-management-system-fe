// src/app/features/patient-profile/rgv-reports/rgv-report-dialog/rgv-report-dialog.component.ts
import {
  Component,
  EventEmitter,
  Input,
  OnChanges,
  Output,
  SimpleChanges,
} from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { DialogModule } from 'primeng/dialog';

export interface UploadedFile {
  file: File;
  preview: string;
  name: string;
}

export interface ReportSubmitPayload {
  files: File[];
  note: string;
}

@Component({
  selector: 'app-rgv-report-dialog',
  standalone: true,
  imports: [CommonModule, FormsModule, DialogModule],
  templateUrl: './rgv-report-dialog.component.html',
  styleUrls: ['./rgv-report-dialog.component.scss'],
})
export class RgvReportDialogComponent implements OnChanges {
  /** Two-way binding: controls dialog visibility from parent */
  @Input() visible = false;
  @Output() visibleChange = new EventEmitter<boolean>();

  /** Emitted when the user clicks Submit with valid data */
  @Output() submitted = new EventEmitter<ReportSubmitPayload>();

  /** Maximum number of images allowed per upload session */
  readonly maxFiles = 10;

  uploadedFiles: UploadedFile[] = [];
  noteText = '';
  isSubmitting = false;

  ngOnChanges(changes: SimpleChanges): void {
    // Reset state every time the dialog is opened fresh
    if (changes['visible']?.currentValue === true) {
      this.reset();
    }
  }

  // ── File handling ──────────────────────────────────────────────────────────

  onFilesSelected(event: Event): void {
    const input = event.target as HTMLInputElement;
    if (!input.files?.length) return;

    const remaining = this.maxFiles - this.uploadedFiles.length;
    const incoming = Array.from(input.files).slice(0, remaining);

    incoming.forEach((file) => {
      const reader = new FileReader();
      reader.onload = () => {
        this.uploadedFiles.push({
          file,
          preview: reader.result as string,
          name: this.formatFileName(file.name),
        });
      };
      reader.readAsDataURL(file);
    });

    // Allow re-selecting the same file next time
    input.value = '';
  }

  removeFile(index: number): void {
    this.uploadedFiles.splice(index, 1);
  }

  // ── Dialog actions ─────────────────────────────────────────────────────────

  onSubmit(): void {
    if (!this.uploadedFiles.length && !this.noteText.trim()) return;

    this.isSubmitting = true;

    // Simulate async save — replace with real service call
    setTimeout(() => {
      this.submitted.emit({
        files: this.uploadedFiles.map((f) => f.file),
        note: this.noteText.trim(),
      });
      this.isSubmitting = false;
      this.closeDialog();
    }, 600);
  }

  onCancel(): void {
    this.closeDialog();
  }

  // ── Helpers ────────────────────────────────────────────────────────────────

  private closeDialog(): void {
    this.visible = false;
    this.visibleChange.emit(false);
  }

  private reset(): void {
    this.uploadedFiles = [];
    this.noteText = '';
    this.isSubmitting = false;
  }

  private formatFileName(raw: string): string {
    return raw.replace(/\.[^/.]+$/, '').replace(/[-_]/g, ' ');
  }
}