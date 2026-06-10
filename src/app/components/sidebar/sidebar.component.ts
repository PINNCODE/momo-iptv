import { Component, Input } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-sidebar',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './sidebar.component.html'
})
export class SidebarComponent {
  // Input para poder cambiar las iniciales del usuario desde el componente padre
  @Input() userInitials: string = 'JD';

  isProfileOpen: boolean = false;

  // Datos mockeados basados en la estructura JSON proporcionada por el usuario
  // Solo exponemos información no sensible en el popover
  userInfo = {
    status: 'Active',
    exp_date: '31 Diciembre 2026',
    active_cons: 2,
    max_connections: 3,
    is_trial: 'false'
  };

  serverInfo = {
    url: 'tv.momo-iptv.com',
    port: '8080',
    server_protocol: 'http',
    timezone: 'America/Mexico_City'
  };

  toggleProfile() {
    this.isProfileOpen = !this.isProfileOpen;
  }
}
