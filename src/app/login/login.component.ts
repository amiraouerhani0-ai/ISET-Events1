import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { Router } from '@angular/router';

@Component({
  selector: 'app-login',
  templateUrl: './login.component.html',
  styleUrls: ['./login.component.css']
})
export class LoginComponent implements OnInit {
  loginForm!: FormGroup;
  showPassword = false;
  isLoading = false;
  errorMessage = '';

  constructor(
    private fb: FormBuilder,
    private router: Router
  ) {}

  ngOnInit(): void {
    this.loginForm = this.fb.group({
      email: ['', [Validators.required, Validators.email]],  // Champ vide
      password: ['', [Validators.required, Validators.minLength(6)]]  // Champ vide
    });
  }

  get email() { return this.loginForm.get('email'); }
  get password() { return this.loginForm.get('password'); }

  togglePasswordVisibility(): void {
    this.showPassword = !this.showPassword;
  }

  onSubmit(): void {
    if (this.loginForm.invalid) {
      Object.keys(this.loginForm.controls).forEach(key => {
        this.loginForm.get(key)?.markAsTouched();
      });
      return;
    }

    this.isLoading = true;
    this.errorMessage = '';

    const { email, password } = this.loginForm.value;

    setTimeout(() => {
      this.isLoading = false;
      
      const users = JSON.parse(localStorage.getItem('users') || '[]');
      const userExists = users.find((user: any) => user.email === email && user.password === password);
      
      if (userExists) {
        localStorage.setItem('currentUser', JSON.stringify(userExists));
        this.router.navigate(['/dashboard']);
      } else {
        const emailExists = users.find((user: any) => user.email === email);
        if (emailExists) {
          this.errorMessage = 'Mot de passe incorrect. Veuillez réessayer.';
        } else {
          this.errorMessage = 'Compte non trouvé. Veuillez vous inscrire d\'abord.';
        }
      }
    }, 1500);
  }
}