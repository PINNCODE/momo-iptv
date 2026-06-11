import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { SidebarComponent } from '../../components/sidebar/sidebar.component';
import { TvViewComponent } from './components/tv/tv-view.component';
import { SearchViewComponent } from './components/search/search-view.component';
import { ProfileViewComponent } from './components/profile/profile-view.component';

@Component({
  selector: 'app-dashboard',
  standalone: true,
  imports: [CommonModule, SidebarComponent, TvViewComponent, SearchViewComponent, ProfileViewComponent],
  templateUrl: './dashboard.html',
  styleUrl: './dashboard.scss',
})
export class Dashboard {
  currentView: string = 'home';
  showLogoutConfirm: boolean = false;

  constructor(private router: Router) {}

  changeView(view: string) {
    this.currentView = view;
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
