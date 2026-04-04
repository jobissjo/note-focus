import { Component, inject, OnInit, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, RouterModule } from '@angular/router';
import { LucideAngularModule } from 'lucide-angular';
import { PublicContentService } from '../../../core/services/public-content.service';
import { Note } from '../../../core/interfaces';

@Component({
  selector: 'app-public-note-detail',
  standalone: true,
  imports: [CommonModule, RouterModule, LucideAngularModule],
  templateUrl: './public-note-detail.component.html'
})
export class PublicNoteDetailComponent implements OnInit {
  private route = inject(ActivatedRoute);
  private api = inject(PublicContentService);

  note = signal<Note | null>(null);
  loading = signal(true);

  ngOnInit() {
    this.route.paramMap.subscribe(params => {
      const id = params.get('id');
      if (id) {
        this.api.getPublicNote(id).subscribe({
          next: data => this.note.set(data),
          complete: () => this.loading.set(false),
          error: () => this.loading.set(false)
        });
      }
    });
  }
}
