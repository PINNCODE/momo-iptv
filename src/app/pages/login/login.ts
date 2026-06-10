import { Component } from '@angular/core';
import { ReactiveFormsModule, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { GlassButtonComponent } from '../../components/glass-button/glass-button.component';
import { GlassInputComponent } from '../../components/glass-input/glass-input.component';

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [ReactiveFormsModule, CommonModule, GlassButtonComponent, GlassInputComponent],
  templateUrl: './login.html',
  styleUrl: './login.scss',
})
export class Login {
  loginForm: FormGroup;

  constructor(private fb: FormBuilder) {
    // Definimos el formulario y sus validaciones
    this.loginForm = this.fb.group({
      serverUrl: ['', [
        Validators.required, 
        Validators.pattern('https?://.+') // Valida que empiece con http:// o https://
      ]],
      username: ['', Validators.required],
      password: ['', Validators.required]
    });
  }

  onSubmit() {
    if (this.loginForm.valid) {
      console.log('Formulario válido:', this.loginForm.value);
      // Aquí iría la lógica de autenticación
    } else {
      // Si el formulario es inválido, marcamos todos los campos como tocados para mostrar los errores
      this.loginForm.markAllAsTouched();
    }
  }
}
