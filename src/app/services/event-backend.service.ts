import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';
import { AuthService } from './auth-backend.service';

export interface DashboardResponse {
  message: string;
  user: {
    id: number;
    email: string;
    firstname: string;
    lastname: string;
    roles: string[];
  };
  features: string[];
}

export interface AdminFeaturesResponse {
  message: string;
  features: string[];
}

export interface OrganisateurFeaturesResponse {
  message: string;
  features: string[];
}

export interface ParticipantFeaturesResponse {
  message: string;
  features: string[];
}

@Injectable({
  providedIn: 'root'
})
export class EventBackendService {
  private apiUrl = 'http://localhost:8080/api'; // Port par défaut Spring Boot

  constructor(
    private http: HttpClient,
    private authService: AuthService
  ) {}

  private getHeaders(): HttpHeaders {
    return this.authService.getAuthHeaders();
  }

  // Obtenir le dashboard selon le rôle de l'utilisateur
  getDashboard(): Observable<DashboardResponse> {
    return this.http.get<DashboardResponse>(`${this.apiUrl}/events/dashboard`, 
      { headers: this.getHeaders() }
    );
  }

  // Obtenir les fonctionnalités admin
  getAdminFeatures(): Observable<AdminFeaturesResponse> {
    return this.http.get<AdminFeaturesResponse>(`${this.apiUrl}/events/admin`, 
      { headers: this.getHeaders() }
    );
  }

  // Obtenir les fonctionnalités organisateur
  getOrganisateurFeatures(): Observable<OrganisateurFeaturesResponse> {
    return this.http.get<OrganisateurFeaturesResponse>(`${this.apiUrl}/events/organisateur`, 
      { headers: this.getHeaders() }
    );
  }

  // Obtenir les fonctionnalités participant
  getParticipantFeatures(): Observable<ParticipantFeaturesResponse> {
    return this.http.get<ParticipantFeaturesResponse>(`${this.apiUrl}/events/participant`, 
      { headers: this.getHeaders() }
    );
  }

  // Obtenir les fonctionnalités selon le rôle actuel
  getFeaturesByRole(): Observable<any> {
    const user = this.authService.currentUser;
    
    if (!user) {
      throw new Error('Utilisateur non connecté');
    }

    if (user.roles.includes('ADMIN')) {
      return this.getAdminFeatures();
    } else if (user.roles.includes('ORGANISATEUR')) {
      return this.getOrganisateurFeatures();
    } else if (user.roles.includes('PARTICIPANT')) {
      return this.getParticipantFeatures();
    } else {
      return this.getDashboard(); // Fallback
    }
  }

  // Helper pour déterminer la route de redirection selon le rôle
  getRedirectRoute(): string {
    const user = this.authService.currentUser;
    
    if (!user) {
      return '/login';
    }

    if (user.roles.includes('ADMIN')) {
      return '/admin-dashboard';
    } else if (user.roles.includes('ORGANISATEUR')) {
      return '/dashboard';
    } else if (user.roles.includes('PARTICIPANT')) {
      return '/dashboard';
    }
    
    return '/dashboard';
  }

  // Vérifier si l'utilisateur a accès à une fonctionnalité
  hasPermission(feature: string): boolean {
    const user = this.authService.currentUser;
    if (!user) return false;

    // Permissions selon les rôles
    const permissions = {
      'ADMIN': [
        'Gestion des utilisateurs',
        'Gestion des rôles', 
        'Configuration système',
        'Rapports et statistiques',
        'Sauvegarde des données',
        'Accès administrateur complet'
      ],
      'ORGANISATEUR': [
        'Création d\'événements',
        'Gestion des participants',
        'Modification des événements',
        'Statistiques des événements',
        'Export des données'
      ],
      'PARTICIPANT': [
        'Consultation des événements',
        'Inscription aux événements',
        'Historique des participations',
        'Profil personnel',
        'Notifications'
      ]
    };

    return Object.values(permissions).some(rolePermissions => 
      user.roles.some(role => 
        rolePermissions.includes(feature) && 
        permissions[role as keyof typeof permissions]
      )
    );
  }

  // Obtenir les fonctionnalités disponibles pour l'utilisateur actuel
  getAvailableFeatures(): Observable<string[]> {
    return this.getDashboard().pipe(
      map((response: DashboardResponse) => response.features || [])
    );
  }

  // Vérifier si l'utilisateur peut créer des événements
  canCreateEvents(): boolean {
    const user = this.authService.currentUser;
    return user ? (user.roles.includes('ADMIN') || user.roles.includes('ORGANISATEUR')) : false;
  }

  // Vérifier si l'utilisateur peut gérer les utilisateurs
  canManageUsers(): boolean {
    return this.authService.isAdmin;
  }

  // Vérifier si l'utilisateur peut voir les statistiques
  canViewStats(): boolean {
    const user = this.authService.currentUser;
    return user ? user.roles.some(role => ['ADMIN', 'ORGANISATEUR'].includes(role)) : false;
  }

  // Obtenir le titre du dashboard selon le rôle
  getDashboardTitle(): string {
    const user = this.authService.currentUser;
    if (!user) return 'Dashboard';

    if (user.roles.includes('ADMIN')) {
      return 'Dashboard Administrateur';
    } else if (user.roles.includes('ORGANISATEUR')) {
      return 'Dashboard Organisateur';
    } else if (user.roles.includes('PARTICIPANT')) {
      return 'Dashboard Participant';
    }
    
    return 'Dashboard';
  }

  // Formater les fonctionnalités pour l'affichage
  formatFeatures(features: string[]): Array<{ icon: string; text: string; description: string }> {
    return features.map(feature => {
      const featureMap: { [key: string]: { icon: string; description: string } } = {
        'Gestion des utilisateurs': { icon: '👥', description: 'Créer, modifier et supprimer des utilisateurs' },
        'Gestion des rôles': { icon: '🔑', description: 'Assigner et gérer les rôles des utilisateurs' },
        'Configuration système': { icon: '⚙️', description: 'Paramètres et configuration de la plateforme' },
        'Rapports et statistiques': { icon: '📊', description: 'Rapports détaillés et statistiques' },
        'Sauvegarde des données': { icon: '💾', description: 'Sauvegarder et restaurer les données' },
        'Création d\'événements': { icon: '📅', description: 'Créer de nouveaux événements' },
        'Gestion des participants': { icon: '👥', description: 'Gérer les inscriptions aux événements' },
        'Modification des événements': { icon: '✏️', description: 'Modifier les détails des événements' },
        'Statistiques des événements': { icon: '📈', description: 'Statistiques sur les événements' },
        'Export des données': { icon: '📤', description: 'Exporter les données des événements' },
        'Consultation des événements': { icon: '👁️', description: 'Voir les événements disponibles' },
        'Inscription aux événements': { icon: '✅', description: 'S\'inscrire aux événements' },
        'Historique des participations': { icon: '📋', description: 'Voir l\'historique des participations' },
        'Profil personnel': { icon: '👤', description: 'Gérer votre profil personnel' },
        'Notifications': { icon: '🔔', description: 'Recevoir des notifications' }
      };

      const mappedFeature = featureMap[feature] || { icon: '📌', description: feature };
      
      return {
        icon: mappedFeature.icon,
        text: feature,
        description: mappedFeature.description
      };
    });
  }
}
