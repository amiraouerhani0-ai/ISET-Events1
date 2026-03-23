import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable } from 'rxjs';
import { AuthService } from './auth.service';

export interface Event {
  id: number;
  title: string;
  description: string;
  date: string;
  location: string;
  capacity: number;
  attendees: number;
  status: 'upcoming' | 'ongoing' | 'completed' | 'cancelled';
  approvalStatus: 'pending' | 'approved' | 'rejected';
  rejectionReason?: string;
  organizer: number;
  organizerName: string;
  category?: string;
  tags?: string[];
  registrationDeadline?: string;
  image?: string;
  createdAt: string;
  updatedAt: string;
}

export interface CreateEventRequest {
  title: string;
  description: string;
  date: string;
  location: string;
  capacity: number;
  category?: string;
  tags?: string[];
  registrationDeadline?: string;
}

export interface EventFilters {
  status?: string;
  category?: string;
  search?: string;
  tags?: string;
  dateFrom?: string;
  dateTo?: string;
  page?: number;
  limit?: number;
  sortBy?: string;
  order?: 'asc' | 'desc';
}

export interface EventsResponse {
  events: Event[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    pages: number;
  };
}

@Injectable({
  providedIn: 'root'
})
export class EventService {
  private apiUrl = 'http://localhost:5000/api'; // À adapter selon votre backend

  constructor(
    private http: HttpClient,
    private authService: AuthService
  ) {}

  private getHeaders(): HttpHeaders {
    return this.authService.getAuthHeaders();
  }

  // Obtenir tous les événements (public)
  getEvents(filters?: EventFilters): Observable<EventsResponse> {
    const params = this.buildQueryParams(filters);
    return this.http.get<EventsResponse>(`${this.apiUrl}/events`, { params });
  }

  // Obtenir les événements en attente d'approbation (admin)
  getPendingEvents(filters?: EventFilters): Observable<EventsResponse> {
    const params = this.buildQueryParams(filters);
    return this.http.get<EventsResponse>(`${this.apiUrl}/events/pending`, 
      { params, headers: this.getHeaders() }
    );
  }

  // Obtenir mes événements (organisateur)
  getMyEvents(filters?: EventFilters): Observable<EventsResponse> {
    const params = this.buildQueryParams(filters);
    return this.http.get<EventsResponse>(`${this.apiUrl}/events/my-events`, 
      { params, headers: this.getHeaders() }
    );
  }

  // Obtenir un événement par ID
  getEventById(id: number): Observable<Event> {
    return this.http.get<Event>(`${this.apiUrl}/events/${id}`, 
      { headers: this.getHeaders() }
    );
  }

  // Créer un événement (organisateur)
  createEvent(eventData: CreateEventRequest): Observable<Event> {
    return this.http.post<Event>(`${this.apiUrl}/events`, eventData, 
      { headers: this.getHeaders() }
    );
  }

  // Mettre à jour un événement
  updateEvent(id: number, eventData: Partial<CreateEventRequest>): Observable<Event> {
    return this.http.put<Event>(`${this.apiUrl}/events/${id}`, eventData, 
      { headers: this.getHeaders() }
    );
  }

  // Supprimer un événement
  deleteEvent(id: number): Observable<void> {
    return this.http.delete<void>(`${this.apiUrl}/events/${id}`, 
      { headers: this.getHeaders() }
    );
  }

  // Approuver un événement (admin)
  approveEvent(id: number): Observable<Event> {
    return this.http.patch<Event>(`${this.apiUrl}/events/${id}/approve`, 
      { action: 'approve' }, 
      { headers: this.getHeaders() }
    );
  }

  // Rejeter un événement (admin)
  rejectEvent(id: number, reason: string): Observable<Event> {
    return this.http.patch<Event>(`${this.apiUrl}/events/${id}/approve`, 
      { action: 'reject', rejectionReason: reason }, 
      { headers: this.getHeaders() }
    );
  }

  // Obtenir les statistiques des événements (admin)
  getEventStats(): Observable<any> {
    return this.http.get(`${this.apiUrl}/events/stats`, 
      { headers: this.getHeaders() }
    );
  }

  // Helper pour construire les paramètres de requête
  private buildQueryParams(filters?: EventFilters): any {
    if (!filters) return {};

    const params: any = {};
    
    Object.keys(filters).forEach(key => {
      const value = filters[key as keyof EventFilters];
      if (value !== undefined && value !== null && value !== '') {
        params[key] = value;
      }
    });

    return params;
  }

  // Vérifier si un utilisateur peut s'inscrire à un événement
  canRegisterToEvent(event: Event): boolean {
    return event.approvalStatus === 'approved' && 
           event.status === 'upcoming' && 
           event.attendees < event.capacity;
  }

  // Calculer le taux de remplissage
  getFillRate(event: Event): number {
    return event.capacity > 0 ? Math.round((event.attendees / event.capacity) * 100) : 0;
  }

  // Obtenir les places restantes
  getRemainingPlaces(event: Event): number {
    return Math.max(0, event.capacity - event.attendees);
  }
}
