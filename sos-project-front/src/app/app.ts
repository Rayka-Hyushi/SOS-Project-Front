import {Component} from '@angular/core';
import {RouterOutlet} from '@angular/router';
import {AuthService} from '../core/services/auth-service';

@Component({
  selector: 'app-root',
  imports: [RouterOutlet],
  templateUrl: './app.html',
  styleUrl: './app.css'
})
export class App {
  constructor(private authService: AuthService) {
    if (this.authService.isLogged()) {
      this.authService.redirect();
    }
  }
}
