import { Injectable } from '@angular/core';
import { HttpInterceptor, HttpRequest, HttpHandler, HttpEvent, HttpResponse, HttpErrorResponse } from '@angular/common/http';
import { Observable, throwError, BehaviorSubject } from 'rxjs';
import { catchError, filter, take, switchMap } from 'rxjs/operators';
import { AuthService } from '../services/auth.service';

@Injectable()
export class AuthInterceptor implements HttpInterceptor {
  private isRefreshing = false;
  private refreshTokenSubject: BehaviorSubject<any> = new BehaviorSubject<any>(null);

  constructor(private authService: AuthService) {}

  intercept(req: HttpRequest<any>, next: HttpHandler): Observable<HttpEvent<any>> {
    // Ajouter le token aux requêtes authentifiées
    const authReq = this.addToken(req);

    return next.handle(authReq).pipe(
      catchError((error: HttpErrorResponse) => {
        if (error.status === 401 && this.authService.token) {
          // Token expiré, essayer de le rafraîchir
          return this.handle401Error(authReq, next);
        }
        
        return this.handleError(error);
      })
    );
  }

  private addToken(req: HttpRequest<any>): HttpRequest<any> {
    const token = this.authService.token;
    
    // Ne pas ajouter de token pour les routes publiques
    const publicRoutes = ['/auth/login', '/auth/register', '/health'];
    const isPublicRoute = publicRoutes.some(route => req.url.includes(route));
    
    if (token && !isPublicRoute) {
      return req.clone({
        setHeaders: {
          Authorization: `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });
    }
    
    return req;
  }

  private handle401Error(req: HttpRequest<any>, next: HttpHandler): Observable<HttpEvent<any>> {
    if (!this.isRefreshing) {
      this.isRefreshing = true;
      this.refreshTokenSubject.next(null);

      return this.authService.refreshToken().pipe(
        switchMap((tokenResponse: any) => {
          this.isRefreshing = false;
          this.refreshTokenSubject.next(tokenResponse.token);
          return next.handle(this.addToken(req));
        }),
        catchError((error) => {
          this.isRefreshing = false;
          this.authService.logout();
          return throwError(error);
        })
      );
    }

    return this.refreshTokenSubject.pipe(
      filter(token => token !== null),
      take(1),
      switchMap(token => next.handle(this.addToken(req)))
    );
  }

  private handleError(error: HttpErrorResponse): Observable<never> {
    let errorMessage = 'Une erreur est survenue';

    if (error.error instanceof ErrorEvent) {
      // Erreur côté client
      errorMessage = `Erreur: ${error.error.message}`;
    } else {
      // Erreur côté serveur
      switch (error.status) {
        case 400:
          errorMessage = error.error?.message || 'Requête invalide';
          break;
        case 401:
          errorMessage = 'Non autorisé. Veuillez vous connecter.';
          if (!this.authService.token) {
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
          errorMessage = error.error?.message || 'Données invalides';
          break;
        case 500:
          errorMessage = 'Erreur serveur. Veuillez réessayer plus tard.';
          break;
        default:
          errorMessage = error.error?.message || `Erreur ${error.status}: ${error.message}`;
      }
    }

    console.error('HTTP Error:', error);
    return throwError(() => errorMessage);
  }
}

@Injectable()
export class ErrorInterceptor implements HttpInterceptor {
  intercept(req: HttpRequest<any>, next: HttpHandler): Observable<HttpEvent<any>> {
    return next.handle(req).pipe(
      catchError((error: HttpErrorResponse) => {
        // Log des erreurs pour le debugging
        console.group('HTTP Error Details');
        console.error('URL:', req.url);
        console.error('Method:', req.method);
        console.error('Status:', error.status);
        console.error('Status Text:', error.statusText);
        console.error('Error:', error);
        console.groupEnd();

        return throwError(error);
      })
    );
  }
}

@Injectable()
export class LoadingInterceptor implements HttpInterceptor {
  private activeRequests = 0;
  private loadingSubject = new BehaviorSubject<boolean>(false);
  public loading$ = this.loadingSubject.asObservable();

  intercept(req: HttpRequest<any>, next: HttpHandler): Observable<HttpEvent<any>> {
    if (this.activeRequests === 0) {
      this.loadingSubject.next(true);
    }

    this.activeRequests++;

    return next.handle(req).pipe(
      catchError((error) => {
        this.decrementRequests();
        return throwError(error);
      }),
      switchMap((event) => {
        if (event instanceof HttpResponse) {
          this.decrementRequests();
        }
        return [event];
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
