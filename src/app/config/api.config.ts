export const API_CONFIG = {
  // URL de l'API backend - à adapter selon votre configuration
  BASE_URL: 'http://localhost:5000/api',
  
  // Timeout pour les requêtes HTTP (en millisecondes)
  TIMEOUT: 30000,
  
  // Routes publiques (pas besoin d'authentification)
  PUBLIC_ROUTES: [
    '/auth/login',
    '/auth/register',
    '/health'
  ],
  
  // Configuration des tokens
  TOKEN: {
    STORAGE_KEY: 'token',
    USER_KEY: 'currentUser',
    REFRESH_THRESHOLD: 5 * 60 * 1000 // 5 minutes avant expiration
  },
  
  // Configuration de la pagination
  PAGINATION: {
    DEFAULT_LIMIT: 10,
    MAX_LIMIT: 100
  },
  
  // Configuration des fichiers
  UPLOAD: {
    MAX_SIZE: 5 * 1024 * 1024, // 5MB
    ALLOWED_TYPES: ['image/jpeg', 'image/png', 'image/gif', 'application/pdf'],
    IMAGE_TYPES: ['image/jpeg', 'image/png', 'image/gif']
  }
};

export const ENDPOINTS = {
  AUTH: {
    LOGIN: '/auth/login',
    REGISTER: '/auth/register',
    ME: '/auth/me',
    REFRESH: '/auth/refresh',
    LOGOUT: '/auth/logout',
    CHANGE_PASSWORD: '/auth/change-password'
  },
  
  USERS: {
    LIST: '/users',
    CREATE: '/users',
    GET: '/users/:id',
    UPDATE: '/users/:id',
    DELETE: '/users/:id',
    TOGGLE_STATUS: '/users/:id/toggle-status',
    STATS: '/users/stats'
  },
  
  EVENTS: {
    LIST: '/events',
    CREATE: '/events',
    GET: '/events/:id',
    UPDATE: '/events/:id',
    DELETE: '/events/:id',
    PENDING: '/events/pending',
    MY_EVENTS: '/events/my-events',
    APPROVE: '/events/:id/approve',
    STATS: '/events/stats'
  },
  
  REGISTRATIONS: {
    CREATE: '/registrations',
    MY_REGISTRATIONS: '/registrations/my-registrations',
    EVENT_REGISTRATIONS: '/registrations/event/:eventId',
    CANCEL: '/registrations/:id',
    CHECKIN: '/registrations/:id/checkin',
    FEEDBACK: '/registrations/:id/feedback',
    STATS: '/registrations/stats',
    CHECK: '/registrations/check/:eventId'
  },
  
  FAVORITES: {
    CREATE: '/favorites',
    LIST: '/favorites',
    DELETE: '/favorites/:id',
    DELETE_BY_EVENT: '/favorites/event/:eventId',
    UPDATE: '/favorites/:id',
    CHECK: '/favorites/check/:eventId',
    STATS: '/favorites/stats',
    MOST_FAVORITED: '/favorites/most-favorited',
    EXPORT: '/favorites/export'
  }
};

export const HTTP_STATUS = {
  OK: 200,
  CREATED: 201,
  NO_CONTENT: 204,
  BAD_REQUEST: 400,
  UNAUTHORIZED: 401,
  FORBIDDEN: 403,
  NOT_FOUND: 404,
  CONFLICT: 409,
  UNPROCESSABLE_ENTITY: 422,
  INTERNAL_SERVER_ERROR: 500,
  SERVICE_UNAVAILABLE: 503
};

export const ERROR_MESSAGES = {
  NETWORK_ERROR: 'Erreur réseau. Vérifiez votre connexion.',
  TIMEOUT_ERROR: 'La requête a expiré. Veuillez réessayer.',
  UNAUTHORIZED: 'Non autorisé. Veuillez vous connecter.',
  FORBIDDEN: 'Accès refusé. Permissions insuffisantes.',
  NOT_FOUND: 'Ressource non trouvée.',
  SERVER_ERROR: 'Erreur serveur. Veuillez réessayer plus tard.',
  VALIDATION_ERROR: 'Données invalides.',
  UNKNOWN_ERROR: 'Une erreur inattendue est survenue.'
};
