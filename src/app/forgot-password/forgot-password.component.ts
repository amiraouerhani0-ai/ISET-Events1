import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { Router } from '@angular/router';

@Component({
  selector: 'app-forgot-password',
  templateUrl: './forgot-password.component.html',
  styleUrls: ['./forgot-password.component.css']
})
export class ForgotPasswordComponent implements OnInit {
  forgotForm!: FormGroup;
  isLoading = false;
  successMessage = '';
  errorMessage = '';

  constructor(
    private fb: FormBuilder,
    private router: Router
  ) {}

  ngOnInit(): void {
    this.forgotForm = this.fb.group({
      email: ['', [Validators.required, Validators.email]]
    });
  }

  get email() { return this.forgotForm.get('email'); }

  onSubmit(): void {
    if (this.forgotForm.invalid) {
      this.forgotForm.get('email')?.markAsTouched();
      return;
    }

    this.isLoading = true;
    this.successMessage = '';
    this.errorMessage = '';

    const { email } = this.forgotForm.value;

    setTimeout(() => {
      this.isLoading = false;
      
      const users = JSON.parse(localStorage.getItem('users') || '[]');
      const userExists = users.find((user: any) => user.email === email);
      
      if (userExists) {
        this.successMessage = 'Password reset link has been sent to your email. Please check your inbox.';
        this.forgotForm.reset();
        
        setTimeout(() => {
          this.router.navigate(['/login']);
        }, 3000);
      } else {
        this.errorMessage = 'No account found with this email address. Please sign up first.';
      }
    }, 1500);
  }
}