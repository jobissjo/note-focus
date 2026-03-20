import { Component, inject, OnInit, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { RouterModule } from '@angular/router';
import { StoryService } from '../../../core/services/story.service';
import { AlertService } from '../../../core/services/alert.service';
import { LucideAngularModule, BookOpen, Plus, Pencil, Trash2, CalendarDays, BookPlus, Loader2, Sparkles } from 'lucide-angular';
import { ModalComponent } from '../../../shared/components/modal/modal.component';
import { Story } from '../../../core/interfaces';

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
  private alertService = inject(AlertService);

  showCreateModal = signal(false);
  isSubmitting = signal(false);
  activeStoryForEdit = signal<Story | null>(null);

  storyForm = this.fb.group({
    title: ['', [Validators.required, Validators.minLength(2)]],
  });

  readonly BookOpen = BookOpen;
  readonly Plus = Plus;
  readonly Pencil = Pencil;
  readonly Trash2 = Trash2;
  readonly CalendarDays = CalendarDays;
  readonly BookPlus = BookPlus;
  readonly Loader2 = Loader2;
  readonly Sparkles = Sparkles;

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
      title: story.title
    });
    this.showCreateModal.set(true);
  }

  onSubmit() {
    if (this.storyForm.valid) {
      this.isSubmitting.set(true);
      const { title } = this.storyForm.value;
      const storyToEdit = this.activeStoryForEdit();

      if (storyToEdit) {
        this.storyService.updateStory(storyToEdit.id, { title: title! }).subscribe({
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
