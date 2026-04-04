import { Component, inject, OnInit, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { LucideAngularModule } from 'lucide-angular';
import { PublicContentService } from '../../../core/services/public-content.service';
import { Note } from '../../../core/interfaces';

@Component({
  selector: 'app-public-notes',
  standalone: true,
  imports: [CommonModule, RouterModule, LucideAngularModule],
  templateUrl: './public-notes.component.html'
})
export class PublicNotesComponent implements OnInit {
  private api = inject(PublicContentService);
  notes = signal<Note[]>([]);
  loading = signal(true);

  ngOnInit() {
    this.api.getPublicNotes().subscribe({
      next: data => this.notes.set(data),
      complete: () => this.loading.set(false),
      error: () => this.loading.set(false)
    });
  }
}
