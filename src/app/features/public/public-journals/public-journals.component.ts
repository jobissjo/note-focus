import { Component, inject, OnInit, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { LucideAngularModule } from 'lucide-angular';
import { PublicContentService } from '../../../core/services/public-content.service';
import { Diary } from '../../../core/interfaces';

@Component({
  selector: 'app-public-journals',
  standalone: true,
  imports: [CommonModule, RouterModule, LucideAngularModule],
  templateUrl: './public-journals.component.html'
})
export class PublicJournalsComponent implements OnInit {
  private api = inject(PublicContentService);
  journals = signal<Diary[]>([]);
  loading = signal(true);

  ngOnInit() {
    this.api.getPublicJournals().subscribe({
      next: data => this.journals.set(data),
      complete: () => this.loading.set(false),
      error: () => this.loading.set(false)
    });
  }
}
