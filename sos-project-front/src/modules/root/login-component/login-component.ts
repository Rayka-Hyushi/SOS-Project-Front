import { Component } from '@angular/core';
import {MatError, MatFormField, MatLabel} from '@angular/material/form-field';
import {MatInput} from '@angular/material/input';
import {MatButton} from '@angular/material/button';
import {MatCardActions} from '@angular/material/card';
import {RouterLink} from '@angular/router';
import {FormBuilder, FormGroup, ReactiveFormsModule, Validators} from '@angular/forms';
import {AuthService} from '../../../core/services/auth-service';

@Component({
  selector: 'app-login-component',
  imports: [
    MatFormField,
    MatLabel,
    MatError,
    MatInput,
    MatButton,
    MatCardActions,
    RouterLink,
    ReactiveFormsModule
  ],
  templateUrl: './login-component.html',
  styleUrl: './login-component.css',
})
export class LoginComponent {
  form: FormGroup;

  constructor(private authService: AuthService,
              private fb: FormBuilder) {
    this.form = this.fb.group({
      login: ['', [Validators.required, Validators.email]],
      senha: ['', [Validators.required]]
    })
  }

  protected onSubmit() {
    if (this.form.valid) {
      const {login, senha} = this.form.value;
      this.authService.login(login, senha).subscribe({
        next: (token:string) => {
          console.log('Login com sucesso, token', token);
        },
        error: (err) => {
          console.log('Login falhou', err)
        }
      });

      console.log('Declarado após login');
    }
  }
}
