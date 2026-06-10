import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { SidebarComponent } from '../../components/sidebar/sidebar.component';
import { TvViewComponent } from './components/tv/tv-view.component';

@Component({
  selector: 'app-dashboard',
  imports: [CommonModule, SidebarComponent, TvViewComponent],
  templateUrl: './dashboard.html',
  styleUrl: './dashboard.scss',
})
export class Dashboard {
  currentView: string = 'home';

  changeView(view: string) {
    this.currentView = view;
  }
}
