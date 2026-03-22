import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { Router } from '@angular/router';

@Component({
  selector: 'app-admin-dashboard',
  templateUrl: './admin-dashboard.component.html',
  styleUrls: ['./admin-dashboard.component.css']
})
export class AdminDashboardComponent implements OnInit {
  currentUser: any;
  activeTab: string = 'users';
  
  // Statistiques
  totalUsers = 0;
  totalEvents = 0;
  totalRegistrations = 0;
  organisateursCount = 0;
  participantsCount = 0;
  upcomingEventsCount = 0;
  completedEventsCount = 0;
  registrationRate = 0;
  
  // Listes
  users: any[] = [];
  events: any[] = [];
  registrations: any[] = [];
  
  // Filtres
  searchUser = '';
  searchEvent = '';
  
  // Modals
  showEditUserModal = false;
  showEventDetailsModal = false;
  selectedEvent: any = null;
  eventAttendees: any[] = [];
  editUserForm!: FormGroup;
  selectedUser: any = null;
  
  // Statistiques
  monthlyStats: any[] = [];
  topEvents: any[] = [];
  recentActivities: any[] = [];
  organisateurPercentage = 0;
  participantPercentage = 0;

  constructor(
    private router: Router,
    private fb: FormBuilder
  ) {}

  ngOnInit(): void {
    this.currentUser = JSON.parse(localStorage.getItem('currentUser') || '{}');
    
    // Vérifier si l'utilisateur est admin
    if (!this.currentUser || this.currentUser.role !== 'admin') {
      alert('Accès non autorisé!');
      this.router.navigate(['/login']);
      return;
    }

    this.editUserForm = this.fb.group({
      name: ['', Validators.required],
      email: ['', [Validators.required, Validators.email]],
      phone: ['', Validators.required],
      role: ['', Validators.required]
    });

    this.loadData();
    this.calculateStats();
    this.generateMonthlyStats();
    this.generateRecentActivities();
  }

  loadData(): void {
    this.users = JSON.parse(localStorage.getItem('users') || '[]');
    this.events = JSON.parse(localStorage.getItem('events') || '[]');
    this.registrations = JSON.parse(localStorage.getItem('registrations') || '[]');
    
    this.totalUsers = this.users.length;
    this.totalEvents = this.events.length;
    this.totalRegistrations = this.registrations.length;
    
    this.organisateursCount = this.users.filter(u => u.role === 'organisateur').length;
    this.participantsCount = this.users.filter(u => u.role === 'participant').length;
    
    this.upcomingEventsCount = this.events.filter(e => e.status === 'upcoming').length;
    this.completedEventsCount = this.events.filter(e => e.status === 'completed').length;
    
    const totalCapacity = this.events.reduce((sum, e) => sum + e.capacity, 0);
    this.registrationRate = totalCapacity > 0 
      ? Math.round((this.totalRegistrations / totalCapacity) * 100) 
      : 0;
    
    this.organisateurPercentage = this.totalUsers > 0 
      ? Math.round((this.organisateursCount / this.totalUsers) * 100) 
      : 0;
    this.participantPercentage = this.totalUsers > 0 
      ? Math.round((this.participantsCount / this.totalUsers) * 100) 
      : 0;
    
    this.topEvents = [...this.events]
      .sort((a, b) => b.attendees - a.attendees)
      .slice(0, 5);
  }

  calculateStats(): void {
    // Statistiques supplémentaires
  }

  generateMonthlyStats(): void {
    const months = ['Jan', 'Fév', 'Mar', 'Avr', 'Mai', 'Juin', 'Juil', 'Aoû', 'Sep', 'Oct', 'Nov', 'Déc'];
    const currentMonth = new Date().getMonth();
    
    this.monthlyStats = [];
    for (let i = 5; i >= 0; i--) {
      const monthIndex = (currentMonth - i + 12) % 12;
      const registrationsCount = this.registrations.filter(reg => {
        const regDate = new Date(reg.registeredAt);
        return regDate.getMonth() === monthIndex;
      }).length;
      
      const maxRegistrations = Math.max(...this.monthlyStats.map(s => s.count), registrationsCount, 1);
      const percentage = (registrationsCount / maxRegistrations) * 100;
      
      this.monthlyStats.push({
        month: months[monthIndex],
        count: registrationsCount,
        percentage: percentage
      });
    }
  }

  generateRecentActivities(): void {
  const activities: Array<{icon: string, text: string, time: string}> = [];
  
  this.registrations.slice(-5).reverse().forEach(reg => {
    activities.push({
      icon: '✅',
      text: `${reg.userName} s'est inscrit à "${reg.eventTitle}"`,
      time: this.getTimeAgo(new Date(reg.registeredAt))
    });
  });
  
  this.events.slice(-3).reverse().forEach(event => {
    activities.push({
      icon: '📅',
      text: `Nouvel événement créé: "${event.title}" par ${event.organisateurName}`,
      time: this.getTimeAgo(new Date(event.createdAt))
    });
  });
  
  this.users.slice(-3).reverse().forEach(user => {
    activities.push({
      icon: '👤',
      text: `Nouvel utilisateur inscrit: ${user.name} (${user.role === 'organisateur' ? 'Organisateur' : 'Participant'})`,
      time: this.getTimeAgo(new Date(user.createdAt))
    });
  });
  
  this.recentActivities = activities.sort((a, b) => {
    if (a.time === 'À l\'instant') return -1;
    if (b.time === 'À l\'instant') return 1;
    return 0;
  }).slice(0, 10);
}

  getTimeAgo(date: Date): string {
    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    const diffMins = Math.floor(diffMs / 60000);
    const diffHours = Math.floor(diffMins / 60);
    const diffDays = Math.floor(diffHours / 24);
    
    if (diffMins < 1) return 'À l\'instant';
    if (diffMins < 60) return `il y a ${diffMins} min`;
    if (diffHours < 24) return `il y a ${diffHours} h`;
    if (diffDays === 1) return 'hier';
    return `il y a ${diffDays} jours`;
  }

  get filteredUsers() {
    return this.users.filter(user =>
      user.name.toLowerCase().includes(this.searchUser.toLowerCase()) ||
      user.email.toLowerCase().includes(this.searchUser.toLowerCase())
    );
  }

  get filteredEvents() {
    return this.events.filter(event =>
      event.title.toLowerCase().includes(this.searchEvent.toLowerCase()) ||
      event.organisateurName.toLowerCase().includes(this.searchEvent.toLowerCase())
    );
  }

  editUser(user: any): void {
    this.selectedUser = user;
    this.editUserForm.patchValue({
      name: user.name,
      email: user.email,
      phone: user.phone,
      role: user.role
    });
    this.showEditUserModal = true;
  }

  updateUser(): void {
    if (this.editUserForm.invalid) return;
    
    const updatedUser = {
      ...this.selectedUser,
      ...this.editUserForm.value
    };
    
    const index = this.users.findIndex(u => u.id === this.selectedUser.id);
    if (index !== -1) {
      this.users[index] = updatedUser;
      localStorage.setItem('users', JSON.stringify(this.users));
      
      if (this.currentUser.id === this.selectedUser.id) {
        localStorage.setItem('currentUser', JSON.stringify(updatedUser));
        this.currentUser = updatedUser;
      }
      
      this.loadData();
      this.showEditUserModal = false;
      alert('Utilisateur modifié avec succès!');
    }
  }

  deleteUser(userId: number): void {
    if (confirm('Êtes-vous sûr de vouloir supprimer cet utilisateur ?')) {
      this.users = this.users.filter(u => u.id !== userId);
      localStorage.setItem('users', JSON.stringify(this.users));
      
      this.events = this.events.filter(e => e.organisateurId !== userId);
      localStorage.setItem('events', JSON.stringify(this.events));
      
      this.registrations = this.registrations.filter(r => r.userId !== userId);
      localStorage.setItem('registrations', JSON.stringify(this.registrations));
      
      this.loadData();
      this.calculateStats();
      alert('Utilisateur supprimé avec succès!');
    }
  }

  deleteEvent(eventId: number): void {
    if (confirm('Êtes-vous sûr de vouloir supprimer cet événement ?')) {
      this.events = this.events.filter(e => e.id !== eventId);
      localStorage.setItem('events', JSON.stringify(this.events));
      
      this.registrations = this.registrations.filter(r => r.eventId !== eventId);
      localStorage.setItem('registrations', JSON.stringify(this.registrations));
      
      this.loadData();
      this.calculateStats();
      alert('Événement supprimé avec succès!');
    }
  }

  viewEventDetails(event: any): void {
    this.selectedEvent = event;
    this.eventAttendees = this.registrations.filter(r => r.eventId === event.id);
    this.showEventDetailsModal = true;
  }

  logout(): void {
    localStorage.removeItem('currentUser');
    this.router.navigate(['/login']);
  }
}