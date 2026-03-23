import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable } from 'rxjs';
import { AuthService } from './auth-backend.service';

export interface RedirectResponse {
  redirect: string;
  role: string;
  message: string;
  user: {
    id: number;
    firstname: string;
    lastname: string;
    email: string;
  };
}

@Injectable({
  providedIn: 'root'
})
export class RedirectService {
  private apiUrl = 'http://localhost:8080/api';

  constructor(
    private http: HttpClient,
    private authService: AuthService
  ) {}

  private getHeaders(): HttpHeaders {
    return this.authService.getAuthHeaders();
  }

  // Obtenir la redirection après connexion
  getRedirectAfterLogin(): Observable<RedirectResponse> {
    return this.http.get<RedirectResponse>(`${this.apiUrl}/redirect/after-login`, 
      { headers: this.getHeaders() }
    );
  }

  // Déterminer la route de redirection localement (fallback)
  getLocalRedirect(): string {
    const user = this.authService.currentUser;
    
    if (!user) {
      return '/login';
    }

    // Logique de redirection selon les rôles
    if (user.roles.includes('ADMIN')) {
      return '/admin-dashboard';
    } else if (user.roles.includes('ORGANISATEUR')) {
      return '/dashboard';
    } else if (user.roles.includes('PARTICIPANT')) {
      return '/dashboard';
    }
    
    return '/dashboard';
  }

  // Obtenir la route de redirection selon le rôle
  getRouteByRole(role: string): string {
    switch (role) {
      case 'ADMIN':
        return '/admin-dashboard';
      case 'ORGANISATEUR':
        return '/dashboard';
      case 'PARTICIPANT':
        return '/dashboard';
      default:
        return '/dashboard';
    }
  }

  // Vérifier si une route est accessible selon le rôle
  isRouteAccessible(route: string): boolean {
    const user = this.authService.currentUser;
    if (!user) return false;

    // Routes admin
    if (route.startsWith('/admin-dashboard')) {
      return user.roles.includes('ADMIN');
    }

    // Routes organisateur
    if (route.includes('/create-event') || route.includes('/manage-users')) {
      return user.roles.includes('ADMIN') || user.roles.includes('ORGANISATEUR');
    }

    // Routes participant (accessibles par tous)
    if (route === '/dashboard' || route === '/profile') {
      return true;
    }

    return false;
  }

  // Obtenir les routes disponibles selon le rôle
  getAvailableRoutes(): string[] {
    const user = this.authService.currentUser;
    if (!user) return [];

    const routes: string[] = ['/dashboard', '/profile'];

    if (user.roles.includes('ADMIN')) {
      routes.push('/admin-dashboard', '/manage-users', '/create-event');
    }

    if (user.roles.includes('ORGANISATEUR')) {
      routes.push('/create-event', '/my-events');
    }

    if (user.roles.includes('PARTICIPANT')) {
      routes.push('/events', '/my-registrations', '/favorites');
    }

    return routes;
  }

  // Obtenir le menu de navigation selon le rôle
  getNavigationMenu(): Array<{ path: string; label: string; icon: string; roles: string[] }> {
    return [
      {
        path: '/dashboard',
        label: 'Dashboard',
        icon: '🏠',
        roles: ['ADMIN', 'ORGANISATEUR', 'PARTICIPANT']
      },
      {
        path: '/admin-dashboard',
        label: 'Admin',
        icon: '👑',
        roles: ['ADMIN']
      },
      {
        path: '/create-event',
        label: 'Créer Événement',
        icon: '➕',
        roles: ['ADMIN', 'ORGANISATEUR']
      },
      {
        path: '/manage-users',
        label: 'Gérer Utilisateurs',
        icon: '👥',
        roles: ['ADMIN']
      },
      {
        path: '/events',
        label: 'Événements',
        icon: '📅',
        roles: ['PARTICIPANT', 'ORGANISATEUR']
      },
      {
        path: '/my-events',
        label: 'Mes Événements',
        icon: '📋',
        roles: ['ORGANISATEUR']
      },
      {
        path: '/my-registrations',
        label: 'Mes Inscriptions',
        icon: '✅',
        roles: ['PARTICIPANT']
      },
      {
        path: '/favorites',
        label: 'Favoris',
        icon: '❤️',
        roles: ['PARTICIPANT']
      },
      {
        path: '/profile',
        label: 'Profil',
        icon: '👤',
        roles: ['ADMIN', 'ORGANISATEUR', 'PARTICIPANT']
      }
    ];
  }

  // Filtrer le menu selon le rôle de l'utilisateur
  getFilteredNavigationMenu(): Array<{ path: string; label: string; icon: string }> {
    const user = this.authService.currentUser;
    if (!user) return [];

    return this.getNavigationMenu()
      .filter(item => item.roles.some(role => user.roles.includes(role)))
      .map(item => ({
        path: item.path,
        label: item.label,
        icon: item.icon
      }));
  }

  // Obtenir le titre de la page selon la route
  getPageTitle(route: string): string {
    const user = this.authService.currentUser;
    if (!user) return 'ISET Events';

    const baseTitle = 'ISET Events';
    
    if (route.includes('/admin-dashboard')) {
      return `${baseTitle} - Admin`;
    } else if (route.includes('/dashboard')) {
      if (user.roles.includes('ADMIN')) {
        return `${baseTitle} - Dashboard Admin`;
      } else if (user.roles.includes('ORGANISATEUR')) {
        return `${baseTitle} - Dashboard Organisateur`;
      } else {
        return `${baseTitle} - Dashboard Participant`;
      }
    } else if (route.includes('/create-event')) {
      return `${baseTitle} - Créer Événement`;
    } else if (route.includes('/manage-users')) {
      return `${baseTitle} - Gérer Utilisateurs`;
    } else if (route.includes('/events')) {
      return `${baseTitle} - Événements`;
    } else if (route.includes('/my-events')) {
      return `${baseTitle} - Mes Événements`;
    } else if (route.includes('/my-registrations')) {
      return `${baseTitle} - Mes Inscriptions`;
    } else if (route.includes('/favorites')) {
      return `${baseTitle} - Favoris`;
    } else if (route.includes('/profile')) {
      return `${baseTitle} - Profil`;
    }

    return baseTitle;
  }

  // Rediriger vers la page d'accueil appropriée
  redirectToHome(): string {
    return this.getLocalRedirect();
  }

  // Rediriger vers la page de login
  redirectToLogin(): string {
    return '/login';
  }

  // Rediriger vers la page d'accueil après déconnexion
  getLogoutRedirect(): string {
    return '/login';
  }
}
