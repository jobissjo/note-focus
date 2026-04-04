import { Component, inject, OnInit, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, RouterModule } from '@angular/router';
import { LucideAngularModule } from 'lucide-angular';
import { PublicContentService } from '../../../core/services/public-content.service';
import { Story } from '../../../core/interfaces';

@Component({
  selector: 'app-public-story-detail',
  standalone: true,
  imports: [CommonModule, RouterModule, LucideAngularModule],
  templateUrl: './public-story-detail.component.html'
})
export class PublicStoryDetailComponent implements OnInit {
  private route = inject(ActivatedRoute);
  private api = inject(PublicContentService);

  story = signal<Story | null>(null);
  loading = signal(true);

  ngOnInit() {
    this.route.paramMap.subscribe(params => {
      const id = params.get('id');
      if (id) {
        this.api.getPublicStory(id).subscribe({
          next: data => this.story.set(data),
          complete: () => this.loading.set(false),
          error: () => this.loading.set(false)
        });
      }
    });
  }
}
