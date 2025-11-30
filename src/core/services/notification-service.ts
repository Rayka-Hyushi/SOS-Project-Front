import { Injectable, Optional } from '@angular/core';
import { MatSnackBar } from '@angular/material/snack-bar';

@Injectable({
  providedIn: 'root',
})
export class NotificationService {
  constructor(@Optional() private snackBar: MatSnackBar | null) {}

  notify(title: string, body?: string): void {
    try {
      if ('Notification' in window && Notification.permission === 'granted') {
        new Notification(title, { body });
        return;
      }
    } catch (e) {
    }

    if (this.snackBar) {
      this.snackBar.open(title + (body ? ` — ${body}` : ''), 'Fechar', { duration: 5000 });
      return;
    }

    alert(title + (body ? `\n\n${body}` : ''));
  }

  notifyFromServerError(err: any): void {
    const status = err?.status;
    const detail = (() => {
      if (Array.isArray(err?.error?.details) && err.error.details.length) {
        return String(err.error.details[0]);
      }
      if (err?.error?.message) return String(err.error.message);
      if (err?.message) return String(err.message);
      return 'Erro desconhecido';
    })();

    const title = status === 403 ? 'Acesso negado' : status >= 500 ? 'Erro do servidor' : 'Erro';
    this.notify(`${title} (${status})`, detail);
  }
}
