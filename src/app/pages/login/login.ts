import { Component, signal, OnInit } from '@angular/core';
import { ReactiveFormsModule, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { GlassButtonComponent } from '../../components/glass-button/glass-button.component';
import { GlassInputComponent } from '../../components/glass-input/glass-input.component';
import { IptvApiService } from '../../services/iptv-api.service';

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [ReactiveFormsModule, CommonModule, GlassButtonComponent, GlassInputComponent],
  templateUrl: './login.html',
  styleUrl: './login.scss',
})
export class Login implements OnInit {
  loginForm: FormGroup;
  isLoading = signal(false);
  errorMessage = signal<string | null>(null);

  constructor(
    private fb: FormBuilder,
    private iptvApi: IptvApiService,
    private router: Router
  ) {
    this.loginForm = this.fb.group({
      serverUrl: ['', [
        Validators.required, 
        Validators.pattern('https?://.+')
      ]],
      username: ['', Validators.required],
      password: ['', Validators.required]
    });
  }

  ngOnInit() {
    if (this.iptvApi.credentials()) {
      this.router.navigate(['/dashboard']);
    }
  }

  onSubmit() {
    if (this.loginForm.valid) {
      this.isLoading.set(true);
      this.errorMessage.set(null);
      
      const { serverUrl, username, password } = this.loginForm.value;
      
      this.iptvApi.login(serverUrl, username, password).subscribe({
        next: () => {
          this.isLoading.set(false);
          this.router.navigate(['/dashboard']);
        },
        error: (err) => {
          this.isLoading.set(false);
          this.errorMessage.set('Error de inicio de sesión. Por favor, verifica tus credenciales.');
          console.error('Login error:', err);
        }
      });
    } else {
      this.loginForm.markAllAsTouched();
    }
  }
}
