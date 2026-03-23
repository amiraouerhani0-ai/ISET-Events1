import { Component, OnInit } from '@angular/core';
import { AuthBackendService } from '../services/auth-backend.service';
import { EventBackendService } from '../services/event-backend.service';
import { SpringBootConfigHelper } from '../config/spring-boot.config';

@Component({
  selector: 'app-connection-test',
  template: `
    <div class="connection-test">
      <h2>🔍 Test de Connexion Backend Spring Boot</h2>
      
      <div class="test-section">
        <h3>📡 Test API Connection</h3>
        <button (click)="testConnection()" [disabled]="testing">
          {{ testing ? 'Testing...' : 'Tester Connection' }}
        </button>
        <div *ngIf="connectionResult" class="result" [class.success]="connectionResult.success" [class.error]="!connectionResult.success">
          {{ connectionResult.message }}
        </div>
      </div>

      <div class="test-section">
        <h3>🔐 Test Authentification</h3>
        <button (click)="testAuth()" [disabled]="testing">
          {{ testing ? 'Testing...' : 'Tester Auth' }}
        </button>
        <div *ngIf="authResult" class="result" [class.success]="authResult.success" [class.error]="!authResult.success">
          {{ authResult.message }}
        </div>
      </div>

      <div class="test-section">
        <h3>📊 Test Dashboard</h3>
        <button (click)="testDashboard()" [disabled]="testing || !isAuthenticated">
          {{ testing ? 'Testing...' : 'Tester Dashboard' }}
        </button>
        <div *ngIf="dashboardResult" class="result" [class.success]="dashboardResult.success" [class.error]="!dashboardResult.success">
          {{ dashboardResult.message }}
        </div>
      </div>

      <div class="info-section">
        <h3>ℹ️ Configuration Info</h3>
        <p><strong>Backend URL:</strong> {{ backendUrl }}</p>
        <p><strong>Auth Status:</strong> {{ isAuthenticated ? '✅ Connected' : '❌ Not Connected' }}</p>
        <p><strong>Current User:</strong> {{ currentUser ? currentUser.email : 'None' }}</p>
        <p><strong>User Roles:</strong> {{ currentUser ? currentUser.roles.join(', ') : 'None' }}</p>
      </div>

      <div class="test-section">
        <h3>🧪 Test Inscription</h3>
        <button (click)="testRegister()" [disabled]="testing">
          {{ testing ? 'Testing...' : 'Tester Inscription' }}
        </button>
        <div *ngIf="registerResult" class="result" [class.success]="registerResult.success" [class.error]="!registerResult.success">
          {{ registerResult.message }}
        </div>
      </div>

      <div class="test-section">
        <h3>🔑 Test Login</h3>
        <button (click)="testLogin()" [disabled]="testing">
          {{ testing ? 'Testing...' : 'Tester Login' }}
        </button>
        <div *ngIf="loginResult" class="result" [class.success]="loginResult.success" [class.error]="!loginResult.success">
          {{ loginResult.message }}
        </div>
      </div>
    </div>
  `,
  styles: [`
    .connection-test {
      padding: 20px;
      max-width: 800px;
      margin: 0 auto;
    }
    
    .test-section {
      margin: 20px 0;
      padding: 15px;
      border: 1px solid #ddd;
      border-radius: 8px;
    }
    
    .info-section {
      margin: 20px 0;
      padding: 15px;
      background-color: #f5f5f5;
      border-radius: 8px;
    }
    
    button {
      background-color: #007bff;
      color: white;
      border: none;
      padding: 10px 20px;
      border-radius: 4px;
      cursor: pointer;
      margin: 5px;
    }
    
    button:disabled {
      background-color: #ccc;
      cursor: not-allowed;
    }
    
    .result {
      margin-top: 10px;
      padding: 10px;
      border-radius: 4px;
    }
    
    .success {
      background-color: #d4edda;
      color: #155724;
      border: 1px solid #c3e6cb;
    }
    
    .error {
      background-color: #f8d7da;
      color: #721c24;
      border: 1px solid #f5c6cb;
    }
    
    h2, h3 {
      color: #333;
    }
    
    p {
      margin: 5px 0;
    }
  `]
})
export class ConnectionTestComponent implements OnInit {
  backendUrl = SpringBootConfigHelper.getApiUrl('');
  testing = false;
  connectionResult: { success: boolean; message: string } | null = null;
  authResult: { success: boolean; message: string } | null = null;
  dashboardResult: { success: boolean; message: string } | null = null;
  registerResult: { success: boolean; message: string } | null = null;
  loginResult: { success: boolean; message: string } | null = null;

  constructor(
    private authService: AuthBackendService,
    private eventService: EventBackendService
  ) {}

  ngOnInit() {
    this.checkCurrentStatus();
  }

  get isAuthenticated() {
    return this.authService.isAuthenticated;
  }

  get currentUser() {
    return this.authService.currentUser;
  }

  checkCurrentStatus() {
    console.log('🔍 Vérification status actuel...');
    console.log('Backend URL:', this.backendUrl);
    console.log('Is Authenticated:', this.isAuthenticated);
    console.log('Current User:', this.currentUser);
  }

  testConnection() {
    this.testing = true;
    this.connectionResult = null;
    
    console.log('📡 Test de connexion à:', this.backendUrl);
    
    this.authService.testConnection().subscribe({
      next: (response) => {
        console.log('✅ Connection test successful:', response);
        this.connectionResult = {
          success: true,
          message: `✅ Backend connecté! Réponse: ${response}`
        };
        this.testing = false;
      },
      error: (error) => {
        console.error('❌ Connection test failed:', error);
        this.connectionResult = {
          success: false,
          message: `❌ Erreur de connexion: ${error.message || error}`
        };
        this.testing = false;
      }
    });
  }

  testAuth() {
    this.testing = true;
    this.authResult = null;
    
    console.log('🔐 Test authentification...');
    
    if (this.isAuthenticated) {
      this.authResult = {
        success: true,
        message: '✅ Utilisateur déjà authentifié'
      };
      this.testing = false;
      return;
    }

    // Test avec des identifiants de test
    this.authService.login({
      email: 'admin@example.com',
      password: 'admin123'
    }).subscribe({
      next: (response) => {
        console.log('✅ Auth test successful:', response);
        this.authResult = {
          success: true,
          message: `✅ Login réussi! Token: ${response.token.substring(0, 20)}...`
        };
        this.testing = false;
      },
      error: (error) => {
        console.error('❌ Auth test failed:', error);
        this.authResult = {
          success: false,
          message: `❌ Erreur auth: ${error.message || error}`
        };
        this.testing = false;
      }
    });
  }

  testDashboard() {
    this.testing = true;
    this.dashboardResult = null;
    
    console.log('📊 Test dashboard...');
    
    this.eventService.getDashboard().subscribe({
      next: (response) => {
        console.log('✅ Dashboard test successful:', response);
        this.dashboardResult = {
          success: true,
          message: `✅ Dashboard accessible! Message: ${response.message}`
        };
        this.testing = false;
      },
      error: (error) => {
        console.error('❌ Dashboard test failed:', error);
        this.dashboardResult = {
          success: false,
          message: `❌ Erreur dashboard: ${error.message || error}`
        };
        this.testing = false;
      }
    });
  }

  testRegister() {
    this.testing = true;
    this.registerResult = null;
    
    console.log('🧪 Test inscription...');
    
    const testUser = {
      firstname: 'Test',
      lastname: 'User',
      email: `test${Date.now()}@example.com`,
      password: 'password123',
      confirmPassword: 'password123',
      phone: '12345678',
      role: 'PARTICIPANT' as const
    };
    
    this.authService.register(testUser).subscribe({
      next: (response) => {
        console.log('✅ Register test successful:', response);
        this.registerResult = {
          success: true,
          message: `✅ Inscription réussie! User ID: ${response.id}`
        };
        this.testing = false;
      },
      error: (error) => {
        console.error('❌ Register test failed:', error);
        this.registerResult = {
          success: false,
          message: `❌ Erreur inscription: ${error.message || error}`
        };
        this.testing = false;
      }
    });
  }

  testLogin() {
    this.testing = true;
    this.loginResult = null;
    
    console.log('🔑 Test login...');
    
    // D'abord s'inscrire, puis se connecter
    const email = `login${Date.now()}@example.com`;
    
    this.authService.register({
      firstname: 'Login',
      lastname: 'Test',
      email: email,
      password: 'password123',
      confirmPassword: 'password123',
      phone: '12345678',
      role: 'PARTICIPANT'
    }).subscribe({
      next: () => {
        // Maintenant se connecter
        this.authService.login({
          email: email,
          password: 'password123'
        }).subscribe({
          next: (response) => {
            console.log('✅ Login test successful:', response);
            this.loginResult = {
              success: true,
              message: `✅ Login réussi! Rôle: ${response.roles.join(', ')}`
            };
            this.testing = false;
          },
          error: (error) => {
            console.error('❌ Login test failed:', error);
            this.loginResult = {
              success: false,
              message: `❌ Erreur login: ${error.message || error}`
            };
            this.testing = false;
          }
        });
      },
      error: (error) => {
        console.error('❌ Register for login test failed:', error);
        this.loginResult = {
          success: false,
          message: `❌ Erreur préparation login: ${error.message || error}`
        };
        this.testing = false;
      }
    });
  }
}
