import { Component, HostListener } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { SidebarComponent } from '../../components/sidebar/sidebar.component';
import { TvViewComponent } from './components/tv/tv-view.component';
import { SearchViewComponent } from './components/search/search-view.component';
import { ProfileViewComponent } from './components/profile/profile-view.component';
import { TvPlayerComponent } from './components/tv-player/tv-player.component';

@Component({
  selector: 'app-dashboard',
  standalone: true,
  imports: [CommonModule, SidebarComponent, TvViewComponent, SearchViewComponent, ProfileViewComponent, TvPlayerComponent],
  templateUrl: './dashboard.html',
  styleUrl: './dashboard.scss',
})
export class Dashboard {
  currentView: string = 'home';
  showLogoutConfirm: boolean = false;

  constructor(private router: Router) {}

  @HostListener('document:keydown', ['$event'])
  onKeyDown(event: KeyboardEvent): void {
    // Escape closes any open panel or modal
    if (event.key === 'Escape') {
      if (this.showLogoutConfirm) {
        this.closeLogoutConfirm();
      } else if (this.currentView !== 'home') {
        this.currentView = 'home';
      }
    }
  }

  changeView(view: string) {
    if (this.currentView === view) {
      this.currentView = 'home';
    } else {
      this.currentView = view;
    }
  }

  closePanel(_event: MouseEvent) {
    this.currentView = 'home';
  }

  openLogoutConfirm() {
    this.showLogoutConfirm = true;
  }

  closeLogoutConfirm() {
    this.showLogoutConfirm = false;
  }

  confirmLogout() {
    this.showLogoutConfirm = false;
    this.router.navigate(['/login']);
  }
}
