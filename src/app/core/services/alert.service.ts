import { Injectable } from '@angular/core';
import Swal, { SweetAlertIcon } from 'sweetalert2';

@Injectable({
  providedIn: 'root'
})
export class AlertService {
  
  async confirm(title: string, text: string, icon: SweetAlertIcon = 'warning'): Promise<boolean> {
    const isDark = document.documentElement.classList.contains('dark');
    
    const result = await Swal.fire({
      title,
      text,
      icon,
      showCancelButton: true,
      confirmButtonColor: '#4f46e5', // Indigo-600
      cancelButtonColor: '#ef4444', // Red-500
      confirmButtonText: 'Yes, delete it!',
      background: isDark ? '#171717' : '#ffffff',
      color: isDark ? '#ffffff' : '#171717',
      customClass: {
        popup: `rounded-3xl border shadow-2xl ${isDark ? 'border-neutral-800' : 'border-neutral-200'}`,
        title: 'text-xl font-bold',
        htmlContainer: isDark ? 'text-neutral-400' : 'text-neutral-500',
        confirmButton: 'rounded-xl font-bold py-3 px-6',
        cancelButton: 'rounded-xl font-bold py-3 px-6'
      }
    });

    return result.isConfirmed;
  }

  success(title: string, text: string) {
    Swal.fire({
      title,
      text,
      icon: 'success',
      timer: 2000,
      showConfirmButton: false,
      background: document.documentElement.classList.contains('dark') ? '#171717' : '#ffffff',
      color: document.documentElement.classList.contains('dark') ? '#ffffff' : '#171717',
      customClass: {
        popup: 'rounded-3xl border border-neutral-200 dark:border-neutral-800 shadow-2xl'
      }
    });
  }

  error(title: string, text: string) {
    Swal.fire({
      title,
      text,
      icon: 'error',
      background: document.documentElement.classList.contains('dark') ? '#171717' : '#ffffff',
      color: document.documentElement.classList.contains('dark') ? '#ffffff' : '#171717',
      customClass: {
        popup: 'rounded-3xl border border-neutral-200 dark:border-neutral-800 shadow-2xl'
      }
    });
  }
}
