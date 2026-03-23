import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable } from 'rxjs';
import { AuthService } from './auth.service';

export interface Registration {
  id: number;
  userId: number;
  eventId: number;
  registrationDate: string;
  status: 'registered' | 'cancelled' | 'attended';
  cancellationReason?: string;
  notes?: string;
  qrCode?: string;
  checkedIn: boolean;
  checkedInAt?: string;
  feedback?: {
    rating: number;
    comment?: string;
    submittedAt: string;
  };
  eventDetails?: {
    id: number;
    title: string;
    date: string;
    location: string;
    status: string;
    capacity: number;
    attendees: number;
  };
  userDetails?: {
    id: number;
    name: string;
    email: string;
    phone: string;
  };
}

export interface CreateRegistrationRequest {
  eventId: number;
}

export interface RegistrationsResponse {
  registrations: Registration[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    pages: number;
  };
}

export interface RegistrationStats {
  total: number;
  byStatus: {
    active: number;
    cancelled: number;
    attended: number;
  };
  registrationsByMonth: any[];
  topEventsByRegistrations: any[];
}

@Injectable({
  providedIn: 'root'
})
export class RegistrationService {
  private apiUrl = 'http://localhost:5000/api'; // À adapter selon votre backend

  constructor(
    private http: HttpClient,
    private authService: AuthService
  ) {}

  private getHeaders(): HttpHeaders {
    return this.authService.getAuthHeaders();
  }

  // S'inscrire à un événement
  registerToEvent(eventId: number): Observable<Registration> {
    return this.http.post<Registration>(`${this.apiUrl}/registrations`, 
      { eventId }, 
      { headers: this.getHeaders() }
    );
  }

  // Obtenir mes inscriptions
  getMyRegistrations(page: number = 1, limit: number = 10, status?: string): Observable<RegistrationsResponse> {
    const params: any = { page, limit };
    if (status) params.status = status;
    
    return this.http.get<RegistrationsResponse>(`${this.apiUrl}/registrations/my-registrations`, 
      { params, headers: this.getHeaders() }
    );
  }

  // Obtenir les inscriptions d'un événement (admin/organisateur)
  getEventRegistrations(eventId: number, page: number = 1, limit: number = 10, status?: string): Observable<RegistrationsResponse> {
    const params: any = { page, limit };
    if (status) params.status = status;
    
    return this.http.get<RegistrationsResponse>(`${this.apiUrl}/registrations/event/${eventId}`, 
      { params, headers: this.getHeaders() }
    );
  }

  // Annuler une inscription
  cancelRegistration(registrationId: number, reason?: string): Observable<Registration> {
    return this.http.delete<Registration>(`${this.apiUrl}/registrations/${registrationId}`, 
      { 
        headers: this.getHeaders(),
        body: reason ? { cancellationReason: reason } : undefined
      }
    );
  }

  // Check-in pour un événement (admin/organisateur)
  checkInRegistration(registrationId: number): Observable<Registration> {
    return this.http.patch<Registration>(`${this.apiUrl}/registrations/${registrationId}/checkin`, 
      {}, 
      { headers: this.getHeaders() }
    );
  }

  // Ajouter un feedback après événement
  addFeedback(registrationId: number, rating: number, comment?: string): Observable<Registration> {
    return this.http.post<Registration>(`${this.apiUrl}/registrations/${registrationId}/feedback`, 
      { rating, comment }, 
      { headers: this.getHeaders() }
    );
  }

  // Obtenir les statistiques des inscriptions (admin)
  getRegistrationStats(): Observable<RegistrationStats> {
    return this.http.get<RegistrationStats>(`${this.apiUrl}/registrations/stats`, 
      { headers: this.getHeaders() }
    );
  }

  // Vérifier si l'utilisateur est inscrit à un événement
  isRegisteredToEvent(eventId: number): Observable<boolean> {
    return this.http.get<boolean>(`${this.apiUrl}/registrations/check/${eventId}`, 
      { headers: this.getHeaders() }
    );
  }

  // Obtenir une inscription par ID
  getRegistrationById(registrationId: number): Observable<Registration> {
    return this.http.get<Registration>(`${this.apiUrl}/registrations/${registrationId}`, 
      { headers: this.getHeaders() }
    );
  }

  // Helper methods
  canCancelRegistration(registration: Registration): boolean {
    return registration.status === 'registered' && 
           !!registration.eventDetails && 
           new Date(registration.eventDetails.date) > new Date();
  }

  canAddFeedback(registration: Registration): boolean {
    return registration.status === 'attended' && 
           registration.eventDetails?.status === 'completed' && 
           !registration.feedback;
  }

  getRegistrationStatusText(status: string): string {
    switch (status) {
      case 'registered': return 'Inscrit';
      case 'cancelled': return 'Annulé';
      case 'attended': return 'Présent';
      default: return status;
    }
  }

  getRegistrationStatusColor(status: string): string {
    switch (status) {
      case 'registered': return '#10b981'; // green
      case 'cancelled': return '#ef4444'; // red
      case 'attended': return '#3b82f6'; // blue
      default: return '#6b7280'; // gray
    }
  }
}
