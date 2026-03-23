import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable } from 'rxjs';
import { AuthService } from './auth.service';

export interface Favorite {
  id: number;
  userId: number;
  eventId: number;
  addedAt: string;
  notes?: string;
  priority: 'low' | 'medium' | 'high';
  event?: {
    id: number;
    title: string;
    date: string;
    location: string;
    status: string;
    approvalStatus: string;
    capacity: number;
    attendees: number;
  };
}

export interface CreateFavoriteRequest {
  eventId: number;
  notes?: string;
  priority?: 'low' | 'medium' | 'high';
}

export interface FavoritesResponse {
  favorites: Favorite[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    pages: number;
  };
}

export interface FavoriteStats {
  totalFavorites: number;
  recentFavorites: number;
  byStatus: Record<string, number>;
  byCategory: Record<string, number>;
  byPriority: Record<string, number>;
}

@Injectable({
  providedIn: 'root'
})
export class FavoriteService {
  private apiUrl = 'http://localhost:5000/api'; // À adapter selon votre backend

  constructor(
    private http: HttpClient,
    private authService: AuthService
  ) {}

  private getHeaders(): HttpHeaders {
    return this.authService.getAuthHeaders();
  }

  // Ajouter un événement aux favoris
  addToFavorites(eventId: number, notes?: string, priority: 'low' | 'medium' | 'high' = 'medium'): Observable<Favorite> {
    return this.http.post<Favorite>(`${this.apiUrl}/favorites`, 
      { eventId, notes, priority }, 
      { headers: this.getHeaders() }
    );
  }

  // Obtenir mes favoris
  getMyFavorites(page: number = 1, limit: number = 10, sortBy: string = 'addedAt'): Observable<FavoritesResponse> {
    const params = { page, limit, sortBy };
    return this.http.get<FavoritesResponse>(`${this.apiUrl}/favorites`, 
      { params, headers: this.getHeaders() }
    );
  }

  // Obtenir les statistiques des favoris
  getFavoriteStats(): Observable<FavoriteStats> {
    return this.http.get<FavoriteStats>(`${this.apiUrl}/favorites/stats`, 
      { headers: this.getHeaders() }
    );
  }

  // Retirer un événement des favoris (par ID de favori)
  removeFromFavorites(favoriteId: number): Observable<void> {
    return this.http.delete<void>(`${this.apiUrl}/favorites/${favoriteId}`, 
      { headers: this.getHeaders() }
    );
  }

  // Retirer un événement des favoris (par ID d'événement)
  removeFromFavoritesByEventId(eventId: number): Observable<void> {
    return this.http.delete<void>(`${this.apiUrl}/favorites/event/${eventId}`, 
      { headers: this.getHeaders() }
    );
  }

  // Mettre à jour un favori
  updateFavorite(favoriteId: number, notes?: string, priority?: 'low' | 'medium' | 'high'): Observable<Favorite> {
    const body: any = {};
    if (notes !== undefined) body.notes = notes;
    if (priority !== undefined) body.priority = priority;

    return this.http.patch<Favorite>(`${this.apiUrl}/favorites/${favoriteId}`, 
      body, 
      { headers: this.getHeaders() }
    );
  }

  // Vérifier si un événement est dans les favoris
  isFavorite(eventId: number): Observable<{ isFavorite: boolean; favorite: Favorite | null }> {
    return this.http.get<{ isFavorite: boolean; favorite: Favorite | null }>(`${this.apiUrl}/favorites/check/${eventId}`, 
      { headers: this.getHeaders() }
    );
  }

  // Obtenir les événements les plus favoris (admin)
  getMostFavoritedEvents(limit: number = 10): Observable<{ events: any[] }> {
    const params = { limit };
    return this.http.get<{ events: any[] }>(`${this.apiUrl}/favorites/most-favorited`, 
      { params, headers: this.getHeaders() }
    );
  }

  // Exporter les favoris
  exportFavorites(format: 'json' | 'csv' = 'json'): Observable<any> {
    const params = { format };
    return this.http.get(`${this.apiUrl}/favorites/export`, 
      { params, headers: this.getHeaders() }
    );
  }

  // Helper methods
  getPriorityText(priority: string): string {
    switch (priority) {
      case 'low': return 'Basse';
      case 'medium': return 'Moyenne';
      case 'high': return 'Haute';
      default: return priority;
    }
  }

  getPriorityColor(priority: string): string {
    switch (priority) {
      case 'low': return '#10b981'; // green
      case 'medium': return '#f59e0b'; // yellow
      case 'high': return '#ef4444'; // red
      default: return '#6b7280'; // gray
    }
  }

  isRecentFavorite(addedAt: string): boolean {
    const sevenDaysAgo = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000);
    return new Date(addedAt) > sevenDaysAgo;
  }

  getTimeSinceAdded(addedAt: string): string {
    const now = new Date();
    const added = new Date(addedAt);
    const diffMs = now.getTime() - added.getTime();
    
    const days = Math.floor(diffMs / (1000 * 60 * 60 * 24));
    const hours = Math.floor((diffMs % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
    
    if (days > 0) return `Il y a ${days} jour${days > 1 ? 's' : ''}`;
    if (hours > 0) return `Il y a ${hours} heure${hours > 1 ? 's' : ''}`;
    return 'Il y a moins d\'une heure';
  }
}
