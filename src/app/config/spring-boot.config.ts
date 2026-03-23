export const SPRING_BOOT_CONFIG = {
  // Configuration de l'API Spring Boot
  API: {
    BASE_URL: 'http://localhost:8080/api',
    TIMEOUT: 30000,
    DEFAULT_HEADERS: {
      'Content-Type': 'application/json',
      'Accept': 'application/json'
    }
  },

  // Endpoints de l'API Spring Boot
  ENDPOINTS: {
    AUTH: {
      LOGIN: '/auth/login',
      REGISTER: '/auth/register',
      LOGOUT: '/auth/logout',
      TEST: '/auth/test'
    },
    EVENTS: {
      DASHBOARD: '/events/dashboard',
      ADMIN: '/events/admin',
      ORGANISATEUR: '/events/organisateur',
      PARTICIPANT: '/events/participant'
    },
    USERS: {
      PROFILE: '/users/profile'
    },
    REDIRECT: {
      AFTER_LOGIN: '/redirect/after-login'
    }
  },

  // Rôles définis dans votre backend
  ROLES: {
    ADMIN: 'ADMIN',
    ORGANISATEUR: 'ORGANISATEUR',
    PARTICIPANT: 'PARTICIPANT'
  },

  // Configuration de l'authentification
  AUTH: {
    TOKEN_KEY: 'token',
    USER_KEY: 'currentUser',
    TOKEN_PREFIX: 'Bearer ',
    // Les tokens JWT dans Spring Boot expirent généralement après 24h
    TOKEN_EXPIRY_HOURS: 24
  },

  // Messages d'erreur spécifiques à Spring Boot
  ERROR_MESSAGES: {
    NETWORK_ERROR: 'Erreur de connexion au serveur Spring Boot',
    TIMEOUT_ERROR: 'Le serveur Spring Boot ne répond pas',
    AUTHENTICATION_FAILED: 'Échec de l\'authentification',
    ACCESS_DENIED: 'Accès refusé - permissions insuffisantes',
    VALIDATION_FAILED: 'Erreur de validation des données',
    RESOURCE_NOT_FOUND: 'Ressource non trouvée',
    SERVER_ERROR: 'Erreur interne du serveur Spring Boot'
  },

  // Routes de redirection selon les rôles
  REDIRECTS: {
    ADMIN: '/admin-dashboard',
    ORGANISATEUR: '/dashboard',
    PARTICIPANT: '/dashboard',
    DEFAULT: '/dashboard',
    LOGIN: '/login'
  },

  // Configuration des fonctionnalités par rôle
  FEATURES: {
    ADMIN: [
      'Gestion des utilisateurs',
      'Gestion des rôles',
      'Configuration système',
      'Rapports et statistiques',
      'Sauvegarde des données'
    ],
    ORGANISATEUR: [
      'Création d\'événements',
      'Gestion des participants',
      'Modification des événements',
      'Statistiques des événements',
      'Export des données'
    ],
    PARTICIPANT: [
      'Consultation des événements',
      'Inscription aux événements',
      'Historique des participations',
      'Profil personnel',
      'Notifications'
    ]
  },

  // Configuration des validations (basées sur vos annotations Spring Boot)
  VALIDATION: {
    FIRSTNAME: {
      REQUIRED: true,
      MAX_LENGTH: 50,
      PATTERN: null
    },
    LASTNAME: {
      REQUIRED: true,
      MAX_LENGTH: 50,
      PATTERN: null
    },
    EMAIL: {
      REQUIRED: true,
      MAX_LENGTH: 100,
      PATTERN: 'email'
    },
    PASSWORD: {
      REQUIRED: true,
      MIN_LENGTH: 6,
      MAX_LENGTH: 120
    },
    PHONE: {
      REQUIRED: false,
      PATTERN: '^[0-9]{8}$', // 8 chiffres pour la Tunisie
      MESSAGE: 'Le téléphone doit contenir 8 chiffres'
    }
  },

  // Configuration du frontend pour Spring Boot
  FRONTEND: {
    DEFAULT_PAGE_SIZE: 10,
    MAX_PAGE_SIZE: 50,
    DATE_FORMAT: 'dd/MM/yyyy',
    DATETIME_FORMAT: 'dd/MM/yyyy HH:mm',
    TIMEZONE: 'Africa/Tunis'
  }
};

// Helper functions pour la configuration Spring Boot
export class SpringBootConfigHelper {
  static getApiUrl(endpoint: string): string {
    return `${SPRING_BOOT_CONFIG.API.BASE_URL}${endpoint}`;
  }

  static getAuthHeaders(token?: string): { [key: string]: string } {
    const headers: { [key: string]: string } = { ...SPRING_BOOT_CONFIG.API.DEFAULT_HEADERS };
    
    if (token) {
      headers['Authorization'] = `${SPRING_BOOT_CONFIG.AUTH.TOKEN_PREFIX}${token}`;
    }
    
    return headers;
  }

  static getRoleDisplayName(role: string): string {
    switch (role) {
      case SPRING_BOOT_CONFIG.ROLES.ADMIN:
        return 'Admin';
      case SPRING_BOOT_CONFIG.ROLES.ORGANISATEUR:
        return 'Organisateur';
      case SPRING_BOOT_CONFIG.ROLES.PARTICIPANT:
        return 'Participant';
      default:
        return role;
    }
  }

  static getRedirectPath(role: string): string {
    switch (role) {
      case SPRING_BOOT_CONFIG.ROLES.ADMIN:
        return SPRING_BOOT_CONFIG.REDIRECTS.ADMIN;
      case SPRING_BOOT_CONFIG.ROLES.ORGANISATEUR:
        return SPRING_BOOT_CONFIG.REDIRECTS.ORGANISATEUR;
      case SPRING_BOOT_CONFIG.ROLES.PARTICIPANT:
        return SPRING_BOOT_CONFIG.REDIRECTS.PARTICIPANT;
      default:
        return SPRING_BOOT_CONFIG.REDIRECTS.DEFAULT;
    }
  }

  static getFeaturesForRole(role: string): string[] {
    switch (role) {
      case SPRING_BOOT_CONFIG.ROLES.ADMIN:
        return SPRING_BOOT_CONFIG.FEATURES.ADMIN;
      case SPRING_BOOT_CONFIG.ROLES.ORGANISATEUR:
        return SPRING_BOOT_CONFIG.FEATURES.ORGANISATEUR;
      case SPRING_BOOT_CONFIG.ROLES.PARTICIPANT:
        return SPRING_BOOT_CONFIG.FEATURES.PARTICIPANT;
      default:
        return [];
    }
  }

  static validatePhoneNumber(phone: string): boolean {
    const pattern = new RegExp(SPRING_BOOT_CONFIG.VALIDATION.PHONE.PATTERN);
    return pattern.test(phone);
  }

  static validateEmail(email: string): boolean {
    const pattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return pattern.test(email);
  }

  static validatePassword(password: string): { isValid: boolean; message?: string } {
    if (password.length < SPRING_BOOT_CONFIG.VALIDATION.PASSWORD.MIN_LENGTH) {
      return {
        isValid: false,
        message: `Le mot de passe doit contenir au moins ${SPRING_BOOT_CONFIG.VALIDATION.PASSWORD.MIN_LENGTH} caractères`
      };
    }

    if (password.length > SPRING_BOOT_CONFIG.VALIDATION.PASSWORD.MAX_LENGTH) {
      return {
        isValid: false,
        message: `Le mot de passe ne peut pas dépasser ${SPRING_BOOT_CONFIG.VALIDATION.PASSWORD.MAX_LENGTH} caractères`
      };
    }

    return { isValid: true };
  }

  static formatDate(date: Date | string): string {
    const d = new Date(date);
    return d.toLocaleDateString('fr-TN', {
      year: 'numeric',
      month: '2-digit',
      day: '2-digit'
    });
  }

  static formatDateTime(date: Date | string): string {
    const d = new Date(date);
    return d.toLocaleString('fr-TN', {
      year: 'numeric',
      month: '2-digit',
      day: '2-digit',
      hour: '2-digit',
      minute: '2-digit'
    });
  }
}
