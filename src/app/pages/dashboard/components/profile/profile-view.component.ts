import { Component, Input, effect } from '@angular/core';
import { CommonModule } from '@angular/common';
import { IptvApiService } from '../../../../services/iptv-api.service';

@Component({
  selector: 'app-profile-view',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="h-full w-full flex items-center justify-center p-4 md:p-8 animate-fade-in">
      <!-- Card Contenedor Principal (Glassmorphism Premium) -->
      <div class="w-full max-w-2xl rounded-[2.5rem] bg-white/30 dark:bg-black/30 backdrop-blur-2xl border border-white/50 dark:border-white/10 shadow-[0_12px_40px_0_rgba(0,0,0,0.15)] dark:shadow-[0_12px_40px_0_rgba(0,0,0,0.4)] p-8 md:p-12 transform-gpu">
        
        <!-- Cabecera -->
        <div class="flex flex-col sm:flex-row items-center sm:items-start space-y-4 sm:space-y-0 sm:space-x-6 pb-6 mb-8 border-b border-white/20 dark:border-white/10">
          <div class="w-20 h-20 rounded-[2rem] border-2 border-white/50 flex items-center justify-center text-white text-3xl font-extrabold bg-gradient-to-tr from-blue-500/30 to-purple-500/30 shadow-lg backdrop-blur-md">
            {{ userInitials }}
          </div>
          <div class="text-center sm:text-left flex-grow">
            <h2 class="text-2xl font-bold text-gray-900 dark:text-white tracking-tight">Detalles de la Cuenta</h2>
            <p class="text-gray-700 dark:text-white/60 text-sm mt-1">Información de suscripción y conexión al servidor</p>
            <div class="inline-flex items-center space-x-2 mt-3 px-3 py-1 rounded-full bg-white/20 dark:bg-white/5 border border-white/30 dark:border-white/10">
              <span class="w-2.5 h-2.5 rounded-full animate-pulse" [ngClass]="{'bg-green-400': userInfo.status === 'Active', 'bg-red-400': userInfo.status !== 'Active'}"></span>
              <span class="text-gray-900 dark:text-white text-xs font-semibold uppercase tracking-wider">{{ userInfo.status }}</span>
            </div>
          </div>
        </div>
        
        <!-- Grid de Detalles -->
        <div class="grid grid-cols-1 md:grid-cols-2 gap-8">
          
          <!-- Columna Suscripción -->
          <div class="space-y-6">
            <h3 class="text-xs font-bold uppercase tracking-widest text-blue-600 dark:text-blue-400">Suscripción</h3>
            
            <!-- Expiración -->
            <div class="flex items-start space-x-3">
              <div class="p-2 rounded-xl bg-white/20 dark:bg-white/5 text-gray-900 dark:text-white/80">
                <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"></path>
                </svg>
              </div>
              <div>
                <p class="text-[10px] uppercase tracking-wider text-gray-600 dark:text-white/50 font-bold">Fecha de Expiración</p>
                <p class="text-gray-900 dark:text-white text-base font-semibold mt-0.5">{{ formatExpDate(userInfo.exp_date) }}</p>
              </div>
            </div>
            
            <!-- Conexiones / Pantallas -->
            <div class="space-y-2">
              <div class="flex justify-between items-end">
                <div class="flex items-center space-x-3">
                  <div class="p-2 rounded-xl bg-white/20 dark:bg-white/5 text-gray-900 dark:text-white/80">
                    <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9.75 17L9 20l-1 1h8l-1-1-.75-3M3 13h18M5 17h14a2 2 0 002-2V5a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z"></path>
                    </svg>
                  </div>
                  <div>
                    <p class="text-[10px] uppercase tracking-wider text-gray-600 dark:text-white/50 font-bold">Dispositivos / Conexiones</p>
                  </div>
                </div>
                <span class="text-gray-900 dark:text-white text-sm font-bold">{{ userInfo.active_cons || 0 }} / {{ userInfo.max_connections || 0 }}</span>
              </div>
              <div class="w-full bg-black/10 dark:bg-white/10 rounded-full h-2 shadow-inner overflow-hidden">
                <div class="bg-gradient-to-r from-blue-500 to-indigo-500 dark:from-blue-400 dark:to-indigo-400 h-full rounded-full transition-all duration-1000 ease-out" [style.width.%]="getConnectionPercentage()"></div>
              </div>
            </div>
          </div>
          
          <!-- Columna Servidor -->
          <div class="space-y-6">
            <h3 class="text-xs font-bold uppercase tracking-widest text-purple-600 dark:text-purple-400">Servidor</h3>
            
            <!-- Host / Dirección -->
            <div class="flex items-start space-x-3">
              <div class="p-2 rounded-xl bg-white/20 dark:bg-white/5 text-gray-900 dark:text-white/80">
                <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M21 12a9 9 0 01-9 9m9-9a9 9 0 00-9-9m9 9H3m9 9a9 9 0 01-9-9m9 9c1.657 0 3-4.03 3-9s-1.343-9-3-9m0 18c-1.657 0-3-4.03-3-9s1.343-9 3-9m-9 9a9 9 0 019-9"></path>
                </svg>
              </div>
              <div class="min-w-0 flex-1">
                <p class="text-[10px] uppercase tracking-wider text-gray-600 dark:text-white/50 font-bold">Servidor Principal</p>
                <p class="text-gray-900 dark:text-white text-sm font-semibold mt-0.5 truncate">{{ serverInfo.url }}</p>
              </div>
            </div>
            
            <!-- Zona Horaria -->
            <div class="flex items-start space-x-3">
              <div class="p-2 rounded-xl bg-white/20 dark:bg-white/5 text-gray-900 dark:text-white/80">
                <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"></path>
                </svg>
              </div>
              <div>
                <p class="text-[10px] uppercase tracking-wider text-gray-600 dark:text-white/50 font-bold">Zona Horaria</p>
                <p class="text-gray-900 dark:text-white text-sm font-semibold mt-0.5">{{ serverInfo.timezone || 'Desconocida' }}</p>
              </div>
            </div>
          </div>
          
        </div>
        
      </div>
    </div>
  `,
  styles: [`
    @keyframes fadeIn {
      from { opacity: 0; transform: translateY(15px); }
      to { opacity: 1; transform: translateY(0); }
    }
    .animate-fade-in {
      animation: fadeIn 0.5s cubic-bezier(0.16, 1, 0.3, 1) forwards;
    }
  `]
})
export class ProfileViewComponent {
  @Input() userInitials: string = '';

  userInfo: any = {
    status: 'Unknown',
    exp_date: 'N/A',
    active_cons: 0,
    max_connections: 0,
    is_trial: 'false'
  };

  serverInfo: any = {
    url: 'N/A',
    port: 'N/A',
    server_protocol: 'http',
    timezone: 'N/A'
  };

  constructor(private iptvApi: IptvApiService) {
    effect(() => {
      const profile = this.iptvApi.profileInfo();
      if (profile) {
        if (profile.userInfo) {
          this.userInfo = { ...this.userInfo, ...profile.userInfo };
          if (!this.userInitials && profile.userInfo.username) {
            this.userInitials = profile.userInfo.username.substring(0, 2).toUpperCase();
          }
        }
        if (profile.serverInfo) {
          this.serverInfo = { ...this.serverInfo, ...profile.serverInfo };
        }
      }
    });
  }

  formatExpDate(exp_date: string | number | undefined): string {
    if (!exp_date) return 'N/A';
    // If it's numeric (Unix timestamp in seconds)
    if (!isNaN(Number(exp_date))) {
      const date = new Date(Number(exp_date) * 1000);
      return date.toLocaleDateString('es-MX', {
        year: 'numeric', month: 'long', day: 'numeric'
      });
    }
    return String(exp_date);
  }

  getConnectionPercentage(): number {
    const active = Number(this.userInfo.active_cons) || 0;
    const max = Number(this.userInfo.max_connections) || 1;
    return Math.min((active / max) * 100, 100);
  }
}
