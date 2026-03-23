import { Injectable } from '@angular/core';
import { HttpInterceptor, HttpRequest, HttpHandler, HttpEvent, HttpErrorResponse } from '@angular/common/http';
import { Observable, throwError, BehaviorSubject } from 'rxjs';
import { catchError, finalize } from 'rxjs/operators';
import { AuthService } from '../services/auth-backend.service';

@Injectable()
export class SpringBootAuthInterceptor implements HttpInterceptor {
  constructor(private authService: AuthService) {}

  intercept(req: HttpRequest<any>, next: HttpHandler): Observable<HttpEvent<any>> {
    // URL de votre backend Spring Boot (port 8080 par défaut)
    const springBootUrl = 'http://localhost:8080/api';
    
    // Vérifier si la requête est pour votre backend Spring Boot
    if (req.url.startsWith(springBootUrl)) {
      // Ajouter le token JWT pour les routes sécurisées
      const authReq = this.addTokenToRequest(req);
      
      return next.handle(authReq).pipe(
        catchError((error: HttpErrorResponse) => this.handleSpringBootError(error))
      );
    }

    // Pour les autres requêtes, les laisser passer sans modification
    return next.handle(req);
  }

  private addTokenToRequest(req: HttpRequest<any>): HttpRequest<any> {
    const token = this.authService.token;
    
    // Routes publiques qui n'ont pas besoin de token
    const publicRoutes = ['/auth/login', '/auth/register', '/auth/test'];
    const isPublicRoute = publicRoutes.some(route => req.url.includes(route));
    
    if (token && !isPublicRoute) {
      return req.clone({
        setHeaders: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });
    }
    
    return req;
  }

  private handleSpringBootError(error: HttpErrorResponse): Observable<never> {
    let errorMessage = 'Une erreur est survenue';

    if (error.error instanceof ErrorEvent) {
      // Erreur côté client
      errorMessage = `Erreur: ${error.error.message}`;
    } else {
      // Erreur côté serveur Spring Boot
      switch (error.status) {
        case 400:
          // Spring Boot retourne souvent des messages d'erreur simples
          errorMessage = this.extractSpringBootErrorMessage(error);
          break;
        case 401:
          errorMessage = 'Non autorisé. Veuillez vous connecter.';
          // Auto-déconnexion si token invalide
          if (this.authService.token) {
            this.authService.logout();
          }
          break;
        case 403:
          errorMessage = 'Accès refusé. Permissions insuffisantes.';
          break;
        case 404:
          errorMessage = 'Ressource non trouvée.';
          break;
        case 422:
          errorMessage = this.extractSpringBootErrorMessage(error);
          break;
        case 500:
          errorMessage = 'Erreur serveur. Veuillez réessayer plus tard.';
          break;
        default:
          errorMessage = this.extractSpringBootErrorMessage(error) || 
                         `Erreur ${error.status}: ${error.message}`;
      }
    }

    console.error('Spring Boot API Error:', {
      url: error.url,
      status: error.status,
      statusText: error.statusText,
      error: error.error
    });

    return throwError(() => errorMessage);
  }

  private extractSpringBootErrorMessage(error: HttpErrorResponse): string {
    // Spring Boot peut retourner différents formats d'erreur
    if (typeof error.error === 'string') {
      return error.error;
    }
    
    if (error.error?.message) {
      return error.error.message;
    }
    
    if (error.error?.error) {
      return error.error.error;
    }
    
    // Pour les erreurs de validation Spring Boot
    if (error.error?.errors && Array.isArray(error.error.errors)) {
      const validationErrors = error.error.errors
        .map((err: any) => err.defaultMessage || err.message)
        .join(', ');
      return `Erreurs de validation: ${validationErrors}`;
    }
    
    // Message par défaut selon le statut
    switch (error.status) {
      case 400: return 'Requête invalide';
      case 401: return 'Non autorisé';
      case 403: return 'Accès refusé';
      case 404: return 'Ressource non trouvée';
      case 422: return 'Données invalides';
      case 500: return 'Erreur serveur interne';
      default: return 'Erreur inconnue';
    }
  }
}

@Injectable()
export class SpringBootErrorInterceptor implements HttpInterceptor {
  intercept(req: HttpRequest<any>, next: HttpHandler): Observable<HttpEvent<any>> {
    return next.handle(req).pipe(
      catchError((error: HttpErrorResponse) => {
        // Log détaillé pour le debugging avec Spring Boot
        console.group('🔴 Spring Boot API Error Details');
        console.error('📍 URL:', error.url);
        console.error('📊 Status:', error.status);
        console.error('📝 Status Text:', error.statusText);
        console.error('🔍 Error Object:', error.error);
        console.error('⏰ Timestamp:', new Date().toISOString());
        
        // Log spécifique pour les erreurs Spring Boot
        if (error.status === 401) {
          console.error('🔐 Authentication failed - Token may be expired');
        } else if (error.status === 403) {
          console.error('🚫 Access denied - Insufficient permissions');
        } else if (error.status === 400) {
          console.error('⚠️ Bad request - Validation error');
        }
        
        console.groupEnd();
        return throwError(error);
      })
    );
  }
}

@Injectable()
export class SpringBootLoadingInterceptor implements HttpInterceptor {
  private activeRequests = 0;
  private loadingSubject = new BehaviorSubject<boolean>(false);
  public loading$ = this.loadingSubject.asObservable();

  intercept(req: HttpRequest<any>, next: HttpHandler): Observable<HttpEvent<any>> {
    // Ignorer les requêtes qui ne sont pas pour Spring Boot
    if (!req.url.includes('localhost:8080')) {
      return next.handle(req);
    }

    if (this.activeRequests === 0) {
      this.loadingSubject.next(true);
    }

    this.activeRequests++;

    return next.handle(req).pipe(
      catchError((error) => {
        this.decrementRequests();
        return throwError(error);
      }),
      // Utiliser l'opérateur finalize pour garantir le décrément
      // Note: Vous devrez importer 'finalize' de 'rxjs/operators'
      finalize(() => {
        this.decrementRequests();
      })
    );
  }

  private decrementRequests(): void {
    this.activeRequests--;
    if (this.activeRequests === 0) {
      this.loadingSubject.next(false);
    }
  }
}
