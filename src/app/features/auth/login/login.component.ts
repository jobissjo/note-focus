import { Component, inject, OnInit, signal } from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { RouterModule } from '@angular/router';
import { AuthService } from '../../../core/services/auth.service';
import { LucideAngularModule, Mail, Lock, Loader2 } from 'lucide-angular';
import { CommonModule } from '@angular/common';

import { Title, Meta } from '@angular/platform-browser';

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, RouterModule, LucideAngularModule],
  templateUrl: './login.component.html'
})
export class LoginComponent implements OnInit {
  private title = inject(Title);
  private meta = inject(Meta);
  
  ngOnInit(): void {
    this.title.setTitle('Login | NoteFocus');
    this.meta.updateTag({ name: 'description', content: 'Securely login to your NoteFocus account and access your personal workspaces and journals.' });
  }

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
