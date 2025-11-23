import {Component} from '@angular/core';
import {AuthService} from '../../core/services/auth-service';
import {MatToolbar} from '@angular/material/toolbar';
import {MatIcon} from '@angular/material/icon';
import {RouterLink, RouterLinkActive, RouterOutlet} from '@angular/router';
import {MatButton} from '@angular/material/button';
import {UsuarioPerfilDTO} from '../../core/models/UsuarioPerfilDTO';
import {MatMenu, MatMenuItem, MatMenuTrigger} from '@angular/material/menu';

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
    RouterLinkActive
  ],
  templateUrl: './home-component.html',
  styleUrl: './home-component.css',
})
export class HomeComponent {
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

  loadUserMiniName() {
    const user = this.authService.getUser() as UsuarioPerfilDTO | null;
    if (user && user.name) {
      return user.name;
    }
    return 'Erro ao carregar nome de usuário';
  }

  protected logout() {
    this.authService.logout();
  }
}
