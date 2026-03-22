import { Component, inject, OnInit, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { RouterModule } from '@angular/router';
import { StoryService } from '../../../core/services/story.service';
import { AuthService } from '../../../core/services/auth.service';
import { AlertService } from '../../../core/services/alert.service';
import { LucideAngularModule, BookOpen, Plus, Pencil, Trash2, CalendarDays, BookPlus, Loader2, Sparkles, Lock, Unlock } from 'lucide-angular';
import { ModalComponent } from '../../../shared/components/modal/modal.component';
import { Story } from '../../../core/interfaces';
import { Router } from '@angular/router';
import Swal from 'sweetalert2';

@Component({
  selector: 'app-story-list',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, RouterModule, LucideAngularModule, ModalComponent],
  templateUrl: './story-list.component.html',
  styleUrls: ['./story-list.component.css']
})
export class StoryListComponent implements OnInit {
  private fb = inject(FormBuilder);
  storyService = inject(StoryService);
  authService = inject(AuthService);
  private alertService = inject(AlertService);
  private router = inject(Router);

  showCreateModal = signal(false);
  isSubmitting = signal(false);
  activeStoryForEdit = signal<Story | null>(null);

  storyForm = this.fb.group({
    title: ['', [Validators.required, Validators.minLength(2)]],
    isLocked: [false]
  });

  readonly BookOpen = BookOpen;
  readonly Plus = Plus;
  readonly Pencil = Pencil;
  readonly Trash2 = Trash2;
  readonly CalendarDays = CalendarDays;
  readonly BookPlus = BookPlus;
  readonly Loader2 = Loader2;
  readonly Sparkles = Sparkles;
  readonly Lock = Lock;
  readonly Unlock = Unlock;

  ngOnInit() {
    this.storyService.getStories().subscribe();
  }

  openCreateModal() {
    this.activeStoryForEdit.set(null);
    this.storyForm.reset();
    this.showCreateModal.set(true);
  }

  openEditModal(story: Story) {
    this.activeStoryForEdit.set(story);
    this.storyForm.patchValue({
      title: story.title,
      isLocked: story.isLocked || false
    });
    this.showCreateModal.set(true);
  }

  async onStoryClick(story: Story) {
    if (story.isLocked) {
      const isDark = document.documentElement.classList.contains('dark');
      const { value: pin } = await Swal.fire({
        title: 'Story Locked',
        text: 'Please enter your security PIN to access this story.',
        input: 'password',
        inputPlaceholder: 'Enter PIN',
        inputAttributes: {
          maxlength: '10',
          autocapitalize: 'off',
          autocorrect: 'off'
        },
        showCancelButton: true,
        confirmButtonText: 'Unlock',
        confirmButtonColor: 'var(--accent)',
        background: isDark ? '#171717' : '#ffffff',
        color: isDark ? '#ffffff' : '#171717',
        customClass: {
          popup: 'rounded-3xl border border-neutral-200 dark:border-neutral-800 shadow-2xl',
          input: 'rounded-xl border border-neutral-200 dark:border-neutral-800'
        }
      });

      if (pin) {
        this.authService.verifyPin(pin).subscribe({
          next: () => {
            this.router.navigate(['/dashboard/stories', story.id]);
          },
          error: (err) => {
            this.alertService.error('Invalid PIN', err.error?.message || 'Access denied.');
          }
        });
      }
    } else {
      this.router.navigate(['/dashboard/stories', story.id]);
    }
  }

  async toggleLock(story: Story) {
    const user = this.authService.currentUser();
    if (!user?.hasPin) {
      this.alertService.error('PIN Required', 'Please set a security PIN in settings before locking items.');
      return;
    }

    const newLockStatus = !story.isLocked;
    this.storyService.updateStory(story.id, { isLocked: newLockStatus }).subscribe({
      next: () => {
        this.alertService.success(
          newLockStatus ? 'Story Locked' : 'Story Unlocked',
          `"${story.title}" has been ${newLockStatus ? 'locked' : 'unlocked'}.`
        );
      }
    });
  }

  onSubmit() {
    if (this.storyForm.valid) {
      this.isSubmitting.set(true);
      const { title, isLocked } = this.storyForm.value;
      const storyToEdit = this.activeStoryForEdit();

      if (storyToEdit) {
        this.storyService.updateStory(storyToEdit.id, { title: title!, isLocked: isLocked! }).subscribe({
          next: () => {
            this.isSubmitting.set(false);
            this.showCreateModal.set(false);
          },
          error: () => this.isSubmitting.set(false)
        });
      } else {
        // New story with default empty content
        const emptyContent = { type: 'doc', content: [] };
        this.storyService.createStory(title!, emptyContent).subscribe({
          next: () => {
            this.isSubmitting.set(false);
            this.showCreateModal.set(false);
          },
          error: () => this.isSubmitting.set(false)
        });
      }
    }
  }

  async onDeleteStory(story: Story) {
    const confirmed = await this.alertService.confirm(
      'Delete Story',
      `Are you sure you want to delete "${story.title}"? This action cannot be undone.`
    );

    if (confirmed) {
      this.storyService.deleteStory(story.id).subscribe();
    }
  }
}
