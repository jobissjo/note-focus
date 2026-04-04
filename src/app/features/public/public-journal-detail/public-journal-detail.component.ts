import { Component, inject, OnInit, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, RouterModule } from '@angular/router';
import { LucideAngularModule } from 'lucide-angular';
import { PublicContentService } from '../../../core/services/public-content.service';
import { Diary, DiaryEntry } from '../../../core/interfaces';

@Component({
  selector: 'app-public-journal-detail',
  standalone: true,
  imports: [CommonModule, RouterModule, LucideAngularModule],
  templateUrl: './public-journal-detail.component.html'
})
export class PublicJournalDetailComponent implements OnInit {
  private route = inject(ActivatedRoute);
  private api = inject(PublicContentService);

  journal = signal<Diary | null>(null);
  loading = signal(true);

  ngOnInit() {
    this.route.paramMap.subscribe(params => {
      const id = params.get('id');
      if (id) {
        this.api.getPublicJournal(id).subscribe({
          next: data => this.journal.set(data),
          complete: () => this.loading.set(false),
          error: () => this.loading.set(false)
        });
      }
    });
  }

  entries(): DiaryEntry[] {
    return this.journal()?.entries || [];
  }
}
