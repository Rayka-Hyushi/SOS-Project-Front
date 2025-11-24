import {Component} from '@angular/core';
import {AuthService} from '../../core/services/auth-service';
import {MatToolbar} from '@angular/material/toolbar';
import {MatIcon} from '@angular/material/icon';
import {RouterLink, RouterLinkActive, RouterOutlet} from '@angular/router';
import {MatButton, MatIconButton} from '@angular/material/button';
import {UsuarioPerfilDTO} from '../../core/models/usuario';
import {MatMenu, MatMenuItem, MatMenuTrigger} from '@angular/material/menu';
import {MatDivider} from '@angular/material/divider';
import {NgClass, NgIf, NgTemplateOutlet} from '@angular/common';

@Component({
  selector: 'app-home-component',
  imports: [
    MatToolbar,
    MatIcon,
    RouterOutlet,
    RouterLink,
    MatButton,
    MatMenuTrigger,
    MatMenu,
    MatMenuItem,
    RouterLinkActive,
    MatDivider,
    NgClass,
    NgTemplateOutlet,
    MatIconButton,
    NgIf
  ],
  templateUrl: './home-component.html',
  styleUrl: './home-component.css',
})
export class HomeComponent {
  isNavCollapsed = true;

  constructor(
    protected authService: AuthService
  ) {
  }

  loadUserMiniPhoto() {
    const user = this.authService.getUser() as UsuarioPerfilDTO | null;
    if (user && user.photo && user.photoType) {
      return `data:${user.photoType};base64,${user.photo}`;
    }
    return undefined;
  }

  protected logout() {
    this.authService.logout();
  }
}
