import {Component} from '@angular/core';
import {NgIf} from '@angular/common';
import {Router, RouterLink} from '@angular/router';
import {FormBuilder, FormGroup, ReactiveFormsModule, Validators} from '@angular/forms';
import {AuthService} from '../../../core/services/auth-service';
import {HttpErrorResponse} from '@angular/common/http';
import {UserService} from '../../../core/services/user-service';

@Component({
  selector: 'app-login-component',
  standalone: true,
  imports: [
    RouterLink,
    ReactiveFormsModule,
    NgIf
  ],
  templateUrl: './login-component.html',
  styleUrl: './login-component.css',
})
export class LoginComponent {
  form: FormGroup;

  constructor(private authService: AuthService,
              private fb: FormBuilder,
              private router: Router,
              private userService: UserService) {
    this.form = this.fb.group({
      login: ['', [Validators.required, Validators.email]],
      senha: ['', [Validators.required]]
    })
  }

  protected onSubmit() {
    if (this.form.valid) {
      const {login, senha} = this.form.value;
      this.authService.login(login, senha).subscribe({
        next: (response) => {
          this.authService.setToken(response.token);
          this.userService.getUserProfile().subscribe({
            next: (userProfile) => {
              this.authService.setUserProfile(userProfile);
              this.router.navigate(['/home']);
            },
            error: (error: HttpErrorResponse) => {
              console.error('Falha ao carregar perfil após login: ', error);
              this.router.navigate(['/home']);
            }
          })
        },
        error: (error: HttpErrorResponse) => {
          console.log('Login falhou: ', error)
        }
      });
    }
  }
}
