// admin.guard.ts - Vérifiez que c'est comme ça
import { Injectable } from '@angular/core';
import { CanActivate, Router } from '@angular/router';

@Injectable({
  providedIn: 'root'
})
export class AdminGuard implements CanActivate {
  
  constructor(private router: Router) {}
  
  canActivate(): boolean {
    const currentUser = JSON.parse(localStorage.getItem('currentUser') || '{}');
    
    if (currentUser && currentUser.role === 'admin') {
      return true;
    }
    
    alert('Accès non autorisé! Réservé à l\'administrateur.');
    this.router.navigate(['/login']);
    return false;
  }
}