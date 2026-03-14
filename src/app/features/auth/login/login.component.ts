import { Component, inject, signal } from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { RouterModule } from '@angular/router';
import { AuthService } from '../../../core/services/auth.service';
import { LucideAngularModule, Mail, Lock, Loader2 } from 'lucide-angular';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, RouterModule, LucideAngularModule],
  template: `
    <div class="min-h-screen flex items-center justify-center bg-neutral-50 dark:bg-neutral-950 p-4 font-sans relative overflow-hidden">
      <!-- Background Blobs -->
      <div class="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] bg-indigo-500/10 blur-[120px] rounded-full"></div>
      <div class="absolute bottom-[-10%] right-[-10%] w-[40%] h-[40%] bg-purple-500/10 blur-[120px] rounded-full"></div>

      <div class="w-full max-w-md">
        <!-- Logo Area -->
        <div class="text-center mb-8">
          <div class="inline-flex h-12 w-12 rounded-xl bg-gradient-to-br from-indigo-500 to-purple-600 items-center justify-center text-white shadow-xl shadow-indigo-500/20 mb-4">
            <span class="font-bold text-xl">N</span>
          </div>
          <h1 class="text-3xl font-bold text-neutral-900 dark:text-white tracking-tight">Welcome Back</h1>
          <p class="text-neutral-500 dark:text-neutral-400 mt-2">Log in to your NoteFocus account</p>
        </div>

        <!-- Glass card -->
        <div class="bg-white/70 dark:bg-neutral-900/70 backdrop-blur-2xl border border-white dark:border-neutral-800 rounded-3xl p-8 shadow-2xl">
          <form [formGroup]="loginForm" (ngSubmit)="onSubmit()" class="space-y-6">
            <div class="space-y-2">
              <label class="text-sm font-medium text-neutral-700 dark:text-neutral-300">Email Address</label>
              <div class="relative group">
                <lucide-icon [name]="'Mail'" class="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-neutral-400 group-focus-within:text-indigo-500 transition-colors" />
                <input 
                  formControlName="email"
                  type="email" 
                  placeholder="name@example.com"
                  class="w-full bg-neutral-100 dark:bg-neutral-800/50 border border-transparent focus:border-indigo-500 rounded-xl py-3 pl-11 pr-4 outline-none transition-all dark:text-white"
                />
              </div>
            </div>

            <div class="space-y-2">
              <div class="flex items-center justify-between">
                <label class="text-sm font-medium text-neutral-700 dark:text-neutral-300">Password</label>
                <a href="#" class="text-xs text-indigo-500 hover:text-indigo-600 font-medium">Forgot password?</a>
              </div>
              <div class="relative group">
                <lucide-icon [name]="'Lock'" class="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-neutral-400 group-focus-within:text-indigo-500 transition-colors" />
                <input 
                  formControlName="password"
                  type="password" 
                  placeholder="••••••••"
                  class="w-full bg-neutral-100 dark:bg-neutral-800/50 border border-transparent focus:border-indigo-500 rounded-xl py-3 pl-11 pr-4 outline-none transition-all dark:text-white"
                />
              </div>
            </div>

            <button 
              [disabled]="loginForm.invalid || isLoading()"
              type="submit"
              class="w-full bg-neutral-900 dark:bg-white text-white dark:text-neutral-900 font-bold py-3.5 rounded-xl hover:scale-[1.02] active:scale-[0.98] transition-all disabled:opacity-50 disabled:scale-100 shadow-xl shadow-black/10 dark:shadow-white/5 flex items-center justify-center gap-2"
            >
              @if (isLoading()) {
                <lucide-icon [name]="'Loader2'" class="h-5 w-5 animate-spin" />
                <span>Signing In...</span>
              } @else {
                <span>Sign In</span>
              }
            </button>
          </form>

          <div class="mt-8 text-center">
            <p class="text-neutral-500 dark:text-neutral-400 text-sm">
              Don't have an account? 
              <a routerLink="/auth/register" class="text-indigo-500 hover:text-indigo-600 font-bold ml-1">Create one</a>
            </p>
          </div>
        </div>
      </div>
    </div>
  `
})
export class LoginComponent {
  private fb = inject(FormBuilder);
  private authService = inject(AuthService);
  
  isLoading = signal(false);

  loginForm = this.fb.group({
    email: ['', [Validators.required, Validators.email]],
    password: ['', [Validators.required, Validators.minLength(6)]]
  });

  readonly Mail = Mail;
  readonly Lock = Lock;
  readonly Loader2 = Loader2;

  onSubmit() {
    if (this.loginForm.valid) {
      this.isLoading.set(true);
      const { email, password } = this.loginForm.value;
      this.authService.login({ email: email!, password: password! }).subscribe({
        next: () => this.isLoading.set(false),
        error: () => this.isLoading.set(false)
      });
    }
  }
}
