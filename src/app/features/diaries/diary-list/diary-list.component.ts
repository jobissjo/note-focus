import { Component, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { LucideAngularModule } from 'lucide-angular';
import { DiaryService } from '../../../core/services/diary.service';
import { AlertService } from '../../../core/services/alert.service';
import { ModalComponent } from '../../../shared/components/modal/modal.component';
import { Diary } from '../../../core/interfaces';

@Component({
  selector: 'app-diary-list',
  standalone: true,
  imports: [CommonModule, RouterModule, ReactiveFormsModule, LucideAngularModule, ModalComponent],
  templateUrl: './diary-list.component.html'
})
export class DiaryListComponent {
  diaryService = inject(DiaryService);
  private alertService = inject(AlertService);
  private fb = inject(FormBuilder);

  showCreateModal = signal(false);
  isSubmitting = signal(false);
  activeDiaryForEdit = signal<Diary | null>(null);

  diaryForm = this.fb.group({
    name: ['', [Validators.required, Validators.minLength(2)]],
    description: ['']
  });

  openCreateModal() {
    this.activeDiaryForEdit.set(null);
    this.diaryForm.reset();
    this.showCreateModal.set(true);
  }

  openEditModal(diary: Diary) {
    this.activeDiaryForEdit.set(diary);
    this.diaryForm.patchValue({
      name: diary.name,
      description: diary.description || ''
    });
    this.showCreateModal.set(true);
  }

  async onDeleteDiary(diary: Diary) {
    const confirmed = await this.alertService.confirm(
      'Delete Journal?',
      `Are you sure you want to delete "${diary.name}"? This action cannot be undone and will delete all entries associated with it.`
    );

    if (confirmed) {
      this.diaryService.deleteDiary(diary.id).subscribe({
        next: () => this.alertService.success('Deleted!', 'The journal has been deleted.'),
        error: () => this.alertService.error('Error', 'Failed to delete the journal.')
      });
    }
  }

  onSubmit() {
    if (this.diaryForm.invalid) return;

    this.isSubmitting.set(true);
    const formValue = this.diaryForm.value as { name: string; description?: string };
    const editingDiary = this.activeDiaryForEdit();

    if (editingDiary) {
      this.diaryService.updateDiary(editingDiary.id, formValue).subscribe({
        next: () => {
          this.isSubmitting.set(false);
          this.showCreateModal.set(false);
          this.alertService.success('Updated!', 'Journal has been updated.');
        },
        error: () => {
          this.isSubmitting.set(false);
          this.alertService.error('Error', 'Failed to update journal.');
        }
      });
    } else {
      this.diaryService.createDiary(formValue).subscribe({
        next: () => {
          this.isSubmitting.set(false);
          this.showCreateModal.set(false);
          this.alertService.success('Created!', 'Journal has been created.');
        },
        error: () => {
          this.isSubmitting.set(false);
          this.alertService.error('Error', 'Failed to create journal.');
        }
      });
    }
  }
}
