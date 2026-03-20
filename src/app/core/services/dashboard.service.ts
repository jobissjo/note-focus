import { Injectable, signal } from '@angular/core';
import { BaseApiService } from './base-api.service';
import { DashboardSummary } from '../interfaces';
import { tap } from 'rxjs';

@Injectable({
  providedIn: 'root',
})
export class DashboardService extends BaseApiService {
  summary = signal<DashboardSummary | null>(null);

  getDashboardSummary() {
    return this.get<DashboardSummary>('dashboard').pipe(
      tap(res => this.summary.set(res))
    );
  }
}
