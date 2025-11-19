import { Component } from '@angular/core';
import {AuthService} from '../../core/services/auth-service';
import {MatToolbar} from '@angular/material/toolbar';
import {MatIcon} from '@angular/material/icon';
import {RouterLink, RouterOutlet} from '@angular/router';
import {MatButton} from '@angular/material/button';

@Component({
  selector: 'app-home-component',
  imports: [
    MatToolbar,
    MatIcon,
    RouterOutlet,
    RouterLink,
    MatButton
  ],
  templateUrl: './home-component.html',
  styleUrl: './home-component.css',
})
export class HomeComponent {
  constructor(private authService: AuthService) {
  }

  protected logout() {
    this.authService.logout();
  }
}
