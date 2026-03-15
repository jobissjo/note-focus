import { Component, inject, signal } from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { RouterModule } from '@angular/router';
import { AuthService } from '../../../core/services/auth.service';
import { LucideAngularModule, Mail, Lock, User, Loader2 } from 'lucide-angular';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-register',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, RouterModule, LucideAngularModule],
  templateUrl: './register.component.html'
})
export class RegisterComponent {
  private fb = inject(FormBuilder);
  private authService = inject(AuthService);
  
  isLoading = signal(false);

  registerForm = this.fb.group({
    name: ['', [Validators.required, Validators.minLength(2)]],
    email: ['', [Validators.required, Validators.email]],
    password: ['', [Validators.required, Validators.minLength(6)]]
  });

  readonly Mail = Mail;
  readonly Lock = Lock;
  readonly User = User;
  readonly Loader2 = Loader2;

  onSubmit() {
    if (this.registerForm.valid) {
      this.isLoading.set(true);
      this.authService.register(this.registerForm.value).subscribe({
        next: () => this.isLoading.set(false),
        error: () => this.isLoading.set(false)
      });
    }
  }
}
