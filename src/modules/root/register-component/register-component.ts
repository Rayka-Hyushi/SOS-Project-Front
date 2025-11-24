import {Component} from '@angular/core';
import {
  AbstractControl,
  FormBuilder,
  FormGroup,
  FormsModule,
  ReactiveFormsModule, ValidationErrors,
  ValidatorFn,
  Validators
} from '@angular/forms';
import {UserService} from '../../../core/services/user-service';
import {UsuarioRequestDTO} from '../../../core/models/usuario';
import {HttpErrorResponse} from '@angular/common/http';
import {Router, RouterLink} from '@angular/router';
import {NgIf} from '@angular/common';

const MAX_FILE_SIZE_BYTES = 10 * 1024 * 1024;
const ALLOWED_FILE_TYPES = ['image/png', 'image/jpeg', 'image/jpg'];

function maxFileSizeValidator(): ValidatorFn {
  return (control: AbstractControl): ValidationErrors | null => {
    const hasError = control.hasError('maxFileSize');
    return hasError ? {maxFileSize: {requiredSize: MAX_FILE_SIZE_BYTES}} : null;
  };
}

@Component({
  selector: 'app-register-component',
  standalone: true,
  imports: [
    FormsModule,
    ReactiveFormsModule,
    RouterLink,
    NgIf
  ],
  templateUrl: './register-component.html',
  styleUrl: './register-component.css',
})
export class RegisterComponent {
  form!: FormGroup;
  file: File | null = null;

  constructor(
    private userService: UserService,
    private fb: FormBuilder,
    private router: Router
  ) {
  }

  protected ngOnInit() {
    this.form = this.fb.group({
      name: ['', [Validators.required]],
      email: ['', [Validators.required, Validators.email]],
      pass: ['', [Validators.required, Validators.minLength(8)]],
      photo: ['', [maxFileSizeValidator()]]
    })
  }

  protected onFileSelected(event: any) {
    const photoControl = this.form.get('photo');
    if (!photoControl) return;
    const file: File = event.target.files[0];
    if (photoControl.hasError('maxFileSize')) {
      photoControl.setErrors(null);
    }
    if (file) {
      if (!ALLOWED_FILE_TYPES.includes(file.type)) {
        photoControl.setErrors({invalidFileType: true});
        this.file = null;
        alert('Formato de arquivo inválido: ' + file.type);
        photoControl.markAsTouched();
        photoControl.updateValueAndValidity();
        return;
      }
      if (file.size > MAX_FILE_SIZE_BYTES) {
        photoControl.setErrors({maxFileSize: true});
        this.file = null;
        console.warn('Arquivo excede 10MB:', file.size);
      } else {
        this.file = file;
        if (photoControl.value === '' && photoControl.hasError('required')) {
          photoControl.setErrors(null);
        }
        photoControl.updateValueAndValidity();
      }
    } else {
      this.file = null;
      photoControl.setValue('');
      photoControl.markAsTouched();
      photoControl.setErrors({required: true});
    }
  }

  protected onSubmit() {
    if (this.form.valid && this.file) {
      const usuario: UsuarioRequestDTO = this.form.value;
      const file: File = this.file;

      this.userService.createUser(usuario, file).subscribe({
        next: (response) => {
          this.router.navigate(['/login']);
        },
        error: (error: HttpErrorResponse) => {
          console.error('Falha ao criar usuário: ', error);
        }
      })
    } else {
      this.form.markAllAsTouched();
      console.error('Formulário inválido ou arquivo ausente/inválido.');
    }
  }
}
