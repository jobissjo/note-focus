import { Component, effect, inject, signal, OnInit, OnDestroy, PLATFORM_ID } from '@angular/core';
import { isPlatformBrowser, CommonModule } from '@angular/common';
import { ActivatedRoute, RouterModule } from '@angular/router';
import { FormBuilder, ReactiveFormsModule, FormsModule, Validators } from '@angular/forms';
import { LucideAngularModule } from 'lucide-angular';
import { DiaryService } from '../../../core/services/diary.service';
import { DiaryEntryService } from '../../../core/services/diary-entry.service';
import { AlertService } from '../../../core/services/alert.service';
import { ModalComponent } from '../../../shared/components/modal/modal.component';
import { DiaryEntry } from '../../../core/interfaces';
import { Editor, NgxEditorModule, Toolbar } from 'ngx-editor';

@Component({
  selector: 'app-diary-detail',
  standalone: true,
  imports: [CommonModule, RouterModule, ReactiveFormsModule, FormsModule, LucideAngularModule, ModalComponent, NgxEditorModule],
  templateUrl: './diary-detail.component.html',
  styleUrls: ['./diary-detail.component.css']
})
export class DiaryDetailComponent implements OnInit, OnDestroy {
  private route = inject(ActivatedRoute);
  private fb = inject(FormBuilder);
  private platformId = inject(PLATFORM_ID);
  
  diaryService = inject(DiaryService);
  diaryEntryService = inject(DiaryEntryService);
  private alertService = inject(AlertService);

  isBrowser = isPlatformBrowser(this.platformId);

  editor!: Editor;
  toolbar: Toolbar = [
    ['bold', 'italic'],
    ['underline', 'strike'],
    ['code', 'blockquote'],
    ['ordered_list', 'bullet_list'],
    [{ heading: ['h1', 'h2', 'h3', 'h4', 'h5', 'h6'] }],
    ['text_color', 'background_color'],
    ['align_left', 'align_center', 'align_right', 'align_justify'],
  ];

  showEntryModal = signal(false);
  isSubmitting = signal(false);
  isSaving = signal(false);
  
  // Create / Edit modal state
  activeEntryForEdit = signal<DiaryEntry | null>(null);

  entryModalForm = this.fb.group({
    title: [''],
    date: [this.getTodayDateString(), [Validators.required]]
  });

  private timeoutRef: any;

  ngOnInit() {
    if (this.isBrowser) {
      this.editor = new Editor();
    }

    this.route.paramMap.subscribe(params => {
      const id = params.get('id');
      if (id) {
        this.diaryService.getDiary(id).subscribe({
          error: () => this.alertService.error('Error', 'Journal not found.')
        });
      }
    });
  }

  ngOnDestroy() {
    if (this.isBrowser && this.editor) {
      this.editor.destroy();
    }
    if (this.timeoutRef) clearTimeout(this.timeoutRef);
    this.diaryService.activeDiary.set(null);
    this.diaryEntryService.activeEntry.set(null);
    this.diaryEntryService.entries.set([]);
  }

  getTodayDateString() {
    return new Date().toISOString().split('T')[0];
  }

  selectEntry(entry: DiaryEntry) {
    this.diaryEntryService.activeEntry.set(entry);
  }

  onContentChange(newContent: any) {
    const entry = this.diaryEntryService.activeEntry();
    if (!entry) return;

    if (this.timeoutRef) clearTimeout(this.timeoutRef);
    
    this.isSaving.set(true);
    
    this.timeoutRef = setTimeout(() => {
      this.diaryEntryService.updateEntry(entry.id, { content: newContent }).subscribe({
        next: () => this.isSaving.set(false),
        error: () => {
          this.isSaving.set(false);
          this.alertService.error('Save Failed', 'Could not save the entry.');
        }
      });
    }, 1000);
  }

  openCreateEntryModal() {
    this.activeEntryForEdit.set(null);
    this.entryModalForm.reset({ date: this.getTodayDateString(), title: '' });
    this.showEntryModal.set(true);
  }

  openEditEntryModal(entry: DiaryEntry) {
    this.activeEntryForEdit.set(entry);
    this.entryModalForm.patchValue({
      title: entry.title || '',
      date: new Date(entry.date).toISOString().split('T')[0]
    });
    this.showEntryModal.set(true);
  }

  async onDeleteEntry(entry: DiaryEntry) {
    const confirmed = await this.alertService.confirm(
      'Delete Entry?',
      'Are you sure you want to delete this entry? This action cannot be undone.'
    );

    if (confirmed) {
      this.diaryEntryService.deleteEntry(entry.id).subscribe({
        next: () => this.alertService.success('Deleted!', 'The entry has been deleted.'),
        error: () => this.alertService.error('Error', 'Failed to delete the entry.')
      });
    }
  }

  onSubmitEntry() {
    if (this.entryModalForm.invalid) return;

    this.isSubmitting.set(true);
    const formValue = this.entryModalForm.value;
    const editingEntry = this.activeEntryForEdit();
    const currDiary = this.diaryService.activeDiary();

    if (!currDiary) return;

    if (editingEntry) {
      this.diaryEntryService.updateEntry(editingEntry.id, {
        title: formValue.title || undefined,
        date: new Date(formValue.date ?? this.getTodayDateString()).toISOString()
      }).subscribe({
        next: () => {
          this.isSubmitting.set(false);
          this.showEntryModal.set(false);
          this.alertService.success('Updated!', 'Entry updated.');
        },
        error: () => {
          this.isSubmitting.set(false);
          this.alertService.error('Error', 'Failed to update entry.');
        }
      });
    } else {
      this.diaryEntryService.createEntry(currDiary.id, {
        title: formValue.title || undefined,
        date: new Date(formValue.date ?? this.getTodayDateString()).toISOString(),
        content: { type: 'doc', content: [] }
      }).subscribe({
        next: () => {
          this.isSubmitting.set(false);
          this.showEntryModal.set(false);
          this.alertService.success('Created!', 'New entry added.');
        },
        error: () => {
          this.isSubmitting.set(false);
          this.alertService.error('Error', 'Failed to create entry.');
        }
      });
    }
  }
}
