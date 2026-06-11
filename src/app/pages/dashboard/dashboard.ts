import { Component, HostListener, OnInit, OnDestroy } from '@angular/core';
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
export class Dashboard implements OnInit, OnDestroy {
  currentView: string = 'home';
  showLogoutConfirm: boolean = false;
  sidebarVisible: boolean = true;

  private hideTimer: any = null;
  private isHovered: boolean = false;
  private isPanelHovered: boolean = false;

  constructor(private router: Router) {}

  ngOnInit(): void {
    this.resetHideTimer();
  }

  ngOnDestroy(): void {
    this.cancelHideTimer();
  }

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

    // Toggle sidebar on 'M' / 'm' key press (outside of inputs/textareas)
    if (event.key === 'm' || event.key === 'M') {
      const activeEl = document.activeElement;
      if (activeEl) {
        const tagName = activeEl.tagName.toUpperCase();
        const type = (activeEl as HTMLInputElement).type?.toLowerCase();
        const isInput = tagName === 'INPUT' && type !== 'range' && type !== 'checkbox' && type !== 'radio';
        const isTextarea = tagName === 'TEXTAREA';
        const isEditable = activeEl.hasAttribute('contenteditable') || activeEl.getAttribute('contenteditable') === 'true';

        if (isInput || isTextarea || isEditable) {
          // User is typing, do not toggle sidebar
          return;
        }
      }

      this.toggleSidebar();
    }
  }

  @HostListener('document:mousemove', ['$event'])
  onMouseMove(event: MouseEvent): void {
    const baseFontSize = parseFloat(getComputedStyle(document.documentElement).fontSize) || 16;
    const threshold = baseFontSize * 5; // 5rem proximity threshold
    if (event.clientX < threshold) {
      if (!this.sidebarVisible) {
        this.sidebarVisible = true;
      }
      this.resetHideTimer();
    }
  }

  toggleSidebar() {
    this.sidebarVisible = !this.sidebarVisible;
    if (!this.sidebarVisible) {
      this.currentView = 'home'; // Hide panel as well when sidebar is hidden
      this.cancelHideTimer();
    } else {
      this.resetHideTimer();
    }
  }

  changeView(view: string) {
    if (this.currentView === view) {
      this.currentView = 'home';
    } else {
      this.currentView = view;
    }
    this.sidebarVisible = true; // Show sidebar when selecting a view
    this.resetHideTimer();
  }

  closePanel(_event: MouseEvent) {
    this.currentView = 'home';
    this.resetHideTimer();
  }

  openLogoutConfirm() {
    this.showLogoutConfirm = true;
    this.cancelHideTimer();
  }

  closeLogoutConfirm() {
    this.showLogoutConfirm = false;
    this.resetHideTimer();
  }

  confirmLogout() {
    this.showLogoutConfirm = false;
    this.router.navigate(['/login']);
  }

  // ─── Hide Timers ──────────────────────────────────────────────────────────

  onSidebarHover(hovering: boolean) {
    this.isHovered = hovering;
    if (hovering) {
      this.cancelHideTimer();
    } else {
      this.resetHideTimer();
    }
  }

  onPanelHover(hovering: boolean) {
    this.isPanelHovered = hovering;
    if (hovering) {
      this.cancelHideTimer();
    } else {
      this.resetHideTimer();
    }
  }

  resetHideTimer() {
    this.cancelHideTimer();
    if (this.sidebarVisible && !this.isHovered && !this.isPanelHovered && !this.showLogoutConfirm) {
      this.hideTimer = setTimeout(() => {
        this.sidebarVisible = false;
        this.currentView = 'home';
      }, 5000);
    }
  }

  cancelHideTimer() {
    if (this.hideTimer) {
      clearTimeout(this.hideTimer);
      this.hideTimer = null;
    }
  }
}
