import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable } from 'rxjs';
import { AuthService } from './auth.service';

export interface User {
  id: number;
  name: string;
  email: string;
  phone: string;
  role: 'admin' | 'organisateur' | 'participant';
  isActive: boolean;
  createdAt: string;
  lastLogin?: string;
}

export interface CreateUserRequest {
  name: string;
  email: string;
  password: string;
  phone: string;
  role: 'organisateur' | 'participant';
}

export interface UpdateUserRequest {
  name?: string;
  email?: string;
  phone?: string;
  role?: 'organisateur' | 'participant';
}

export interface UsersResponse {
  users: User[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    pages: number;
  };
}

export interface UserStats {
  total: number;
  byRole: {
    admin: number;
    organisateur: number;
    participant: number;
  };
  usersByMonth: any[];
  recentUsers: User[];
}

@Injectable({
  providedIn: 'root'
})
export class UserService {
  private apiUrl = 'http://localhost:5000/api'; // À adapter selon votre backend

  constructor(
    private http: HttpClient,
    private authService: AuthService
  ) {}

  private getHeaders(): HttpHeaders {
    return this.authService.getAuthHeaders();
  }

  // Obtenir tous les utilisateurs (admin)
  getUsers(page: number = 1, limit: number = 10, filters?: {
    role?: string;
    search?: string;
    isActive?: boolean;
    sortBy?: string;
    order?: 'asc' | 'desc';
  }): Observable<UsersResponse> {
    const params: any = { page, limit };
    
    if (filters) {
      Object.keys(filters).forEach(key => {
        const value = filters[key as keyof typeof filters];
        if (value !== undefined && value !== null && value !== '') {
          params[key] = value;
        }
      });
    }

    return this.http.get<UsersResponse>(`${this.apiUrl}/users`, 
      { params, headers: this.getHeaders() }
    );
  }

  // Obtenir les statistiques des utilisateurs (admin)
  getUserStats(): Observable<UserStats> {
    return this.http.get<UserStats>(`${this.apiUrl}/users/stats`, 
      { headers: this.getHeaders() }
    );
  }

  // Créer un utilisateur (admin)
  createUser(userData: CreateUserRequest): Observable<User> {
    return this.http.post<User>(`${this.apiUrl}/users`, userData, 
      { headers: this.getHeaders() }
    );
  }

  // Obtenir un utilisateur par ID
  getUserById(id: number): Observable<User> {
    return this.http.get<User>(`${this.apiUrl}/users/${id}`, 
      { headers: this.getHeaders() }
    );
  }

  // Mettre à jour un utilisateur (admin ou propriétaire)
  updateUser(id: number, userData: UpdateUserRequest): Observable<User> {
    return this.http.put<User>(`${this.apiUrl}/users/${id}`, userData, 
      { headers: this.getHeaders() }
    );
  }

  // Supprimer un utilisateur (admin)
  deleteUser(id: number): Observable<void> {
    return this.http.delete<void>(`${this.apiUrl}/users/${id}`, 
      { headers: this.getHeaders() }
    );
  }

  // Activer/Désactiver un utilisateur (admin)
  toggleUserStatus(id: number): Observable<User> {
    return this.http.patch<User>(`${this.apiUrl}/users/${id}/toggle-status`, {}, 
      { headers: this.getHeaders() }
    );
  }

  // Obtenir mon profil
  getMyProfile(): Observable<User> {
    return this.http.get<User>(`${this.apiUrl}/auth/me`, 
      { headers: this.getHeaders() }
    );
  }

  // Mettre à jour mon profil
  updateMyProfile(userData: Partial<UpdateUserRequest>): Observable<User> {
    return this.http.put<User>(`${this.apiUrl}/users/${this.authService.currentUser?.id}`, userData, 
      { headers: this.getHeaders() }
    );
  }

  // Helper methods
  getRoleText(role: string): string {
    switch (role) {
      case 'admin': return 'Admin';
      case 'organisateur': return 'Organisateur';
      case 'participant': return 'Participant';
      default: return role;
    }
  }

  getRoleColor(role: string): string {
    switch (role) {
      case 'admin': return '#f59e0b'; // amber
      case 'organisateur': return '#667eea'; // indigo
      case 'participant': return '#48bb78'; // green
      default: return '#6b7280'; // gray
    }
  }

  canEditUser(user: User): boolean {
    const currentUser = this.authService.currentUser;
    if (!currentUser) return false;
    
    // Admin peut tout modifier sauf son propre rôle
    if (currentUser.role === 'admin') {
      return user.id !== currentUser.id;
    }
    
    // Utilisateur peut modifier son propre profil
    return user.id === currentUser.id;
  }

  canDeleteUser(user: User): boolean {
    const currentUser = this.authService.currentUser;
    if (!currentUser) return false;
    
    // Seul l'admin peut supprimer
    if (currentUser.role !== 'admin') return false;
    
    // Ne peut pas supprimer son propre compte ou d'autres admins
    return user.id !== currentUser.id && user.role !== 'admin';
  }

  canToggleUserStatus(user: User): boolean {
    const currentUser = this.authService.currentUser;
    if (!currentUser) return false;
    
    // Seul l'admin peut modifier le statut
    if (currentUser.role !== 'admin') return false;
    
    // Ne peut pas modifier son propre statut ou celui d'autres admins actifs
    return user.id !== currentUser.id && !(user.role === 'admin' && user.isActive);
  }

  isCurrentUser(user: User): boolean {
    const currentUser = this.authService.currentUser;
    return currentUser ? user.id === currentUser.id : false;
  }

  formatDate(date: string): string {
    return new Date(date).toLocaleDateString('fr-FR');
  }

  formatDateTime(date: string): string {
    return new Date(date).toLocaleString('fr-FR');
  }

  isRecentUser(createdAt: string): boolean {
    const thirtyDaysAgo = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000);
    return new Date(createdAt) > thirtyDaysAgo;
  }

  getAccountAge(createdAt: string): string {
    const now = new Date();
    const created = new Date(createdAt);
    const diffMs = now.getTime() - created.getTime();
    
    const days = Math.floor(diffMs / (1000 * 60 * 60 * 24));
    const months = Math.floor(days / 30);
    const years = Math.floor(months / 12);
    
    if (years > 0) return `${years} an${years > 1 ? 's' : ''}`;
    if (months > 0) return `${months} mois`;
    return `${days} jour${days > 1 ? 's' : ''}`;
  }
}
