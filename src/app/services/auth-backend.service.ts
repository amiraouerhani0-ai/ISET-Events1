import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable, BehaviorSubject } from 'rxjs';
import { tap, map, catchError } from 'rxjs/operators';

export interface User {
  id: number;
  firstname: string;
  lastname: string;
  email: string;
  phone: string;
  roles: string[];
  createdAt: string;
  updatedAt: string;
}

export interface LoginRequest {
  email: string;
  password: string;
}

export interface RegisterRequest {
  firstname: string;
  lastname: string;
  email: string;
  password: string;
  confirmPassword: string;
  phone: string;
  role?: 'PARTICIPANT' | 'ORGANISATEUR' | 'ADMIN';
}

export interface LoginResponse {
  token: string;
  type: string;
  id: number;
  email: string;
  roles: string[];
}

export interface RegisterResponse {
  id: number;
  firstname: string;
  lastname: string;
  email: string;
  phone: string;
  role: string;
  createdAt: string;
  message: string;
}

export interface LogoutResponse {
  message: string;
  success: boolean;
}

@Injectable({
  providedIn: 'root'
})
export class AuthService {
  private apiUrl = 'http://localhost:8080/api'; // Port par défaut Spring Boot
  private currentUserSubject = new BehaviorSubject<User | null>(null);
  private tokenSubject = new BehaviorSubject<string | null>(null);

  currentUser$ = this.currentUserSubject.asObservable();
  token$ = this.tokenSubject.asObservable();

  constructor(private http: HttpClient) {
    this.loadStoredUser();
  }

  private loadStoredUser(): void {
    const storedUser = localStorage.getItem('currentUser');
    const storedToken = localStorage.getItem('token');
    
    if (storedUser && storedToken) {
      this.currentUserSubject.next(JSON.parse(storedUser));
      this.tokenSubject.next(storedToken);
    }
  }

  login(credentials: LoginRequest): Observable<LoginResponse> {
    return this.http.post<LoginResponse>(`${this.apiUrl}/auth/login`, credentials)
      .pipe(
        tap(response => {
          const user: User = {
            id: response.id,
            firstname: '', // Sera rempli par le backend
            lastname: '',
            email: response.email,
            phone: '',
            roles: response.roles,
            createdAt: '',
            updatedAt: ''
          };
          
          localStorage.setItem('currentUser', JSON.stringify(user));
          localStorage.setItem('token', response.token);
          this.currentUserSubject.next(user);
          this.tokenSubject.next(response.token);
        })
      );
  }

  register(userData: RegisterRequest): Observable<RegisterResponse> {
    return this.http.post<RegisterResponse>(`${this.apiUrl}/auth/register`, userData)
      .pipe(
        tap(response => {
          // Après inscription, ne pas connecter automatiquement
          // L'utilisateur doit se connecter manuellement
        })
      );
  }

  logout(): Observable<LogoutResponse> {
    return this.http.post<LogoutResponse>(`${this.apiUrl}/auth/logout`, {})
      .pipe(
        tap(() => {
          localStorage.removeItem('currentUser');
          localStorage.removeItem('token');
          this.currentUserSubject.next(null);
          this.tokenSubject.next(null);
        })
      );
  }

  get currentUser(): User | null {
    return this.currentUserSubject.value;
  }

  get token(): string | null {
    return this.tokenSubject.value;
  }

  get isAuthenticated(): boolean {
    return !!this.token;
  }

  get isAdmin(): boolean {
    return this.currentUser?.roles.includes('ADMIN') || false;
  }

  get isOrganisateur(): boolean {
    return this.currentUser?.roles.includes('ORGANISATEUR') || false;
  }

  get isParticipant(): boolean {
    return this.currentUser?.roles.includes('PARTICIPANT') || false;
  }

  getAuthHeaders(): HttpHeaders {
    const token = this.token;
    return new HttpHeaders({
      'Authorization': `Bearer ${token}`,
      'Content-Type': 'application/json'
    });
  }

  getFullName(): string {
    const user = this.currentUser;
    if (user) {
      return `${user.firstname} ${user.lastname}`.trim();
    }
    return '';
  }

  getPrimaryRole(): string {
    const user = this.currentUser;
    if (!user || !user.roles || user.roles.length === 0) {
      return '';
    }
    
    // Ordre de priorité des rôles
    if (user.roles.includes('ADMIN')) return 'ADMIN';
    if (user.roles.includes('ORGANISATEUR')) return 'ORGANISATEUR';
    if (user.roles.includes('PARTICIPANT')) return 'PARTICIPANT';
    
    return user.roles[0];
  }

  getRoleDisplayName(): string {
    const role = this.getPrimaryRole();
    switch (role) {
      case 'ADMIN': return 'Admin';
      case 'ORGANISATEUR': return 'Organisateur';
      case 'PARTICIPANT': return 'Participant';
      default: return role;
    }
  }

  // Test de connexion à l'API
  testConnection(): Observable<string> {
    return this.http.get<string>(`${this.apiUrl}/auth/test`);
  }

  // Rafraîchir le profil utilisateur
  refreshProfile(): Observable<User> {
    return this.http.get<any>(`${this.apiUrl}/users/profile`, { headers: this.getAuthHeaders() })
      .pipe(
        tap(userProfile => {
          const user: User = {
            id: userProfile.id,
            firstname: userProfile.firstname,
            lastname: userProfile.lastname,
            email: userProfile.email,
            phone: userProfile.phone,
            roles: userProfile.roles,
            createdAt: userProfile.createdAt,
            updatedAt: userProfile.updatedAt
          };
          
          localStorage.setItem('currentUser', JSON.stringify(user));
          this.currentUserSubject.next(user);
        })
      );
  }

  // Vérifier si le token est valide (optionnel)
  validateToken(): Observable<boolean> {
    if (!this.token) {
      return new Observable(observer => observer.next(false));
    }
    
    return this.http.get<any>(`${this.apiUrl}/events/dashboard`, { headers: this.getAuthHeaders() })
      .pipe(
        tap(() => {}),
        map(() => true),
        catchError(() => {
          this.logout();
          return [false];
        })
      );
  }
}
