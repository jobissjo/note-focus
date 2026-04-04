import { Component, inject, OnInit, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { LucideAngularModule } from 'lucide-angular';
import { PublicContentService } from '../../../core/services/public-content.service';
import { Story } from '../../../core/interfaces';

@Component({
  selector: 'app-public-stories',
  standalone: true,
  imports: [CommonModule, RouterModule, LucideAngularModule],
  templateUrl: './public-stories.component.html'
})
export class PublicStoriesComponent implements OnInit {
  private api = inject(PublicContentService);
  stories = signal<Story[]>([]);
  loading = signal(true);

  ngOnInit() {
    this.api.getPublicStories().subscribe({
      next: data => this.stories.set(data),
      complete: () => this.loading.set(false),
      error: () => this.loading.set(false)
    });
  }
}
