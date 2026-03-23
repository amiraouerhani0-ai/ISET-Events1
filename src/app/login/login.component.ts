// login.component.ts
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
  showAdminHint = false;

  constructor(
    private fb: FormBuilder,
    private router: Router
  ) {}

  ngOnInit(): void {
    this.loginForm = this.fb.group({
      email: ['', [Validators.required, Validators.email]],
      password: ['', [Validators.required, Validators.minLength(6)]]
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
      
      // Vérifier les identifiants admin par défaut
      if (email === 'admin@iset.tn' && password === 'admin123') {
        const adminUser = {
          id: 0,
          name: 'Administrateur',
          email: 'admin@iset.tn',
          phone: '00000000',
          role: 'admin',
          createdAt: new Date()
        };
        
        // Vérifier si l'admin existe déjà dans localStorage
        const users = JSON.parse(localStorage.getItem('users') || '[]');
        const adminExists = users.find((user: any) => user.email === 'admin@iset.tn');
        
        if (!adminExists) {
          // Ajouter l'admin au localStorage s'il n'existe pas
          users.push(adminUser);
          localStorage.setItem('users', JSON.stringify(users));
        }
        
        localStorage.setItem('currentUser', JSON.stringify(adminUser));
        this.router.navigate(['/admin']);
        return;
      }
      
      const users = JSON.parse(localStorage.getItem('users') || '[]');
      const userExists = users.find((user: any) => user.email === email && user.password === password);
      
      if (userExists) {
        localStorage.setItem('currentUser', JSON.stringify(userExists));
        
        // Redirection selon le rôle
        if (userExists.role === 'admin') {
          this.router.navigate(['/admin']);
        } else {
          this.router.navigate(['/dashboard']);
        }
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

  toggleAdminHint(): void {
    this.showAdminHint = !this.showAdminHint;
  }
}