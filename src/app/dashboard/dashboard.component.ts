import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { Router } from '@angular/router';

@Component({
  selector: 'app-dashboard',
  templateUrl: './dashboard.component.html',
  styleUrls: ['./dashboard.component.css']
})
export class DashboardComponent implements OnInit {
  currentUser: any;
  events: any[] = [];
  availableEvents: any[] = [];
  myEvents: any[] = [];
  registeredEvents = 0;
  upcomingEvents = 0;
  upcomingEventsParticipant = 0;
  totalAttendees = 0;
  showCreateEventModal = false;
  eventForm!: FormGroup;
  today: string;

  constructor(
    private router: Router,
    private fb: FormBuilder
  ) {
    this.today = new Date().toISOString().split('T')[0];
  }

 ngOnInit(): void {
  this.currentUser = JSON.parse(localStorage.getItem('currentUser') || '{}');
  
  if (!this.currentUser || !this.currentUser.id) {
    this.router.navigate(['/login']);
    return;
  }

  this.eventForm = this.fb.group({
    title: ['', Validators.required],
    description: ['', Validators.required],
    date: ['', Validators.required],
    location: ['', Validators.required],
    capacity: ['', [Validators.required, Validators.min(1)]]
  });

  this.loadEvents();
  this.calculateStats();
}

  loadEvents(): void {
    const allEvents = JSON.parse(localStorage.getItem('events') || '[]');
    
    if (this.currentUser.role === 'organisateur') {
      this.events = allEvents.filter((event: any) => event.organisateurId === this.currentUser.id);
      this.calculateOrganisateurStats();
    } else {
      this.availableEvents = allEvents;
      const registrations = JSON.parse(localStorage.getItem('registrations') || '[]');
      const myEventIds = registrations
        .filter((reg: any) => reg.userId === this.currentUser.id)
        .map((reg: any) => reg.eventId);
      this.myEvents = allEvents.filter((event: any) => myEventIds.includes(event.id));
      this.registeredEvents = this.myEvents.length;
      this.upcomingEventsParticipant = this.myEvents.filter((event: any) => event.status === 'upcoming').length;
    }
  }

  calculateOrganisateurStats(): void {
    this.upcomingEvents = this.events.filter((event: any) => event.status === 'upcoming').length;
    this.totalAttendees = this.events.reduce((sum, event) => sum + (event.attendees || 0), 0);
  }

  calculateStats(): void {
    if (this.currentUser.role === 'organisateur') {
      this.calculateOrganisateurStats();
    }
  }

  createEvent(): void {
    if (this.eventForm.invalid) return;

    const newEvent = {
      id: Date.now(),
      ...this.eventForm.value,
      organisateurId: this.currentUser.id,
      organisateurName: this.currentUser.name,
      attendees: 0,
      status: 'upcoming',
      createdAt: new Date()
    };

    const allEvents = JSON.parse(localStorage.getItem('events') || '[]');
    allEvents.push(newEvent);
    localStorage.setItem('events', JSON.stringify(allEvents));

    this.showCreateEventModal = false;
    this.eventForm.reset();
    this.loadEvents();
    this.calculateStats();
  }

  editEvent(event: any): void {
    this.eventForm.patchValue(event);
    this.showCreateEventModal = true;
  }

  deleteEvent(eventId: number): void {
    if (confirm('Êtes-vous sûr de vouloir supprimer cet événement ?')) {
      let allEvents = JSON.parse(localStorage.getItem('events') || '[]');
      allEvents = allEvents.filter((event: any) => event.id !== eventId);
      localStorage.setItem('events', JSON.stringify(allEvents));
      
      const registrations = JSON.parse(localStorage.getItem('registrations') || '[]');
      const updatedRegistrations = registrations.filter((reg: any) => reg.eventId !== eventId);
      localStorage.setItem('registrations', JSON.stringify(updatedRegistrations));
      
      this.loadEvents();
      this.calculateStats();
    }
  }

  viewAttendees(event: any): void {
    const registrations = JSON.parse(localStorage.getItem('registrations') || '[]');
    const attendees = registrations
      .filter((reg: any) => reg.eventId === event.id)
      .map((reg: any) => reg.userName);
    
    alert(`Participants pour ${event.title}:\n\n${attendees.length > 0 ? attendees.join('\n') : 'Aucun participant pour le moment'}`);
  }

  joinEvent(event: any): void {
    if (event.attendees >= event.capacity) {
      alert('Cet événement est complet !');
      return;
    }

    const registrations = JSON.parse(localStorage.getItem('registrations') || '[]');
    const alreadyRegistered = registrations.some(
      (reg: any) => reg.userId === this.currentUser.id && reg.eventId === event.id
    );

    if (alreadyRegistered) {
      alert('Vous êtes déjà inscrit à cet événement !');
      return;
    }

    registrations.push({
      userId: this.currentUser.id,
      userName: this.currentUser.name,
      eventId: event.id,
      eventTitle: event.title,
      registeredAt: new Date()
    });

    localStorage.setItem('registrations', JSON.stringify(registrations));

    let allEvents = JSON.parse(localStorage.getItem('events') || '[]');
    const eventIndex = allEvents.findIndex((e: any) => e.id === event.id);
    if (eventIndex !== -1) {
      allEvents[eventIndex].attendees = (allEvents[eventIndex].attendees || 0) + 1;
      localStorage.setItem('events', JSON.stringify(allEvents));
    }

    this.loadEvents();
    alert('Inscription réussie !');
  }

  cancelEvent(eventId: number): void {
    if (confirm('Êtes-vous sûr de vouloir annuler votre inscription ?')) {
      let registrations = JSON.parse(localStorage.getItem('registrations') || '[]');
      registrations = registrations.filter(
        (reg: any) => !(reg.userId === this.currentUser.id && reg.eventId === eventId)
      );
      localStorage.setItem('registrations', JSON.stringify(registrations));

      let allEvents = JSON.parse(localStorage.getItem('events') || '[]');
      const eventIndex = allEvents.findIndex((e: any) => e.id === eventId);
      if (eventIndex !== -1 && allEvents[eventIndex].attendees > 0) {
        allEvents[eventIndex].attendees -= 1;
        localStorage.setItem('events', JSON.stringify(allEvents));
      }

      this.loadEvents();
      alert('Inscription annulée avec succès !');
    }
  }

  isRegistered(eventId: number): boolean {
    const registrations = JSON.parse(localStorage.getItem('registrations') || '[]');
    return registrations.some(
      (reg: any) => reg.userId === this.currentUser.id && reg.eventId === eventId
    );
  }

  logout(): void {
    localStorage.removeItem('currentUser');
    this.router.navigate(['/login']);
  }
  
}