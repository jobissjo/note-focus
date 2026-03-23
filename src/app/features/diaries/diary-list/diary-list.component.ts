import { Component, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { LucideAngularModule } from 'lucide-angular';
import { DiaryService } from '../../../core/services/diary.service';
import { AuthService } from '../../../core/services/auth.service';
import { AlertService } from '../../../core/services/alert.service';
import { ModalComponent } from '../../../shared/components/modal/modal.component';
import { Diary } from '../../../core/interfaces';
import { Router } from '@angular/router';

@Component({
  selector: 'app-diary-list',
  standalone: true,
  imports: [CommonModule, RouterModule, ReactiveFormsModule, LucideAngularModule, ModalComponent],
  templateUrl: './diary-list.component.html'
})
export class DiaryListComponent {
  diaryService = inject(DiaryService);
  authService = inject(AuthService);
  private alertService = inject(AlertService);
  private fb = inject(FormBuilder);
  private router = inject(Router);

  showCreateModal = signal(false);
  isSubmitting = signal(false);
  activeDiaryForEdit = signal<Diary | null>(null);

  diaryForm = this.fb.group({
    name: ['', [Validators.required, Validators.minLength(2)]],
    description: [''],
    isLocked: [false]
  });

  openCreateModal() {
    this.activeDiaryForEdit.set(null);
    this.diaryForm.reset();
    this.showCreateModal.set(true);
  }

  async openEditModal(diary: Diary) {
    if (diary.isLocked) {
      const isVerified = await this.authService.requestPinVerification(
        'Access Locked Journal',
        'Please enter your security PIN to edit this journal.'
      );
      if (!isVerified) return;
    }

    this.activeDiaryForEdit.set(diary);
    this.diaryForm.patchValue({
      name: diary.name,
      description: diary.description || '',
      isLocked: diary.isLocked || false
    });
    this.showCreateModal.set(true);
  }

  async onDiaryClick(diary: Diary) {
    if (diary.isLocked) {
      const isVerified = await this.authService.requestPinVerification(
        'Journal Locked',
        'Please enter your security PIN to access this journal.'
      );
      if (isVerified) {
        this.router.navigate(['/dashboard/diaries', diary.id]);
      } else {
        this.alertService.error('Access Denied', 'Invalid PIN or verification cancelled.');
      }
    } else {
      this.router.navigate(['/dashboard/diaries', diary.id]);
    }
  }

  async toggleLock(diary: Diary) {
    const user = this.authService.currentUser();
    if (!user?.hasPin) {
      this.alertService.error('PIN Required', 'Please set a security PIN in settings before locking items.');
      return;
    }

    const isUnlocking = diary.isLocked;
    
    if (isUnlocking) {
      const isVerified = await this.authService.requestPinVerification(
        'Unlock Journal',
        'Please enter your security PIN to unlock this journal.'
      );
      if (!isVerified) return;
    }

    const newLockStatus = !diary.isLocked;
    this.diaryService.updateDiary(diary.id, { isLocked: newLockStatus }).subscribe({
      next: () => {
        this.alertService.success(
          newLockStatus ? 'Journal Locked' : 'Journal Unlocked',
          `"${diary.name}" has been ${newLockStatus ? 'locked' : 'unlocked'}.`
        );
      }
    });
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
    const formValue = this.diaryForm.value as { name: string; description?: string; isLocked: boolean };
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
