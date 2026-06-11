import { Component, Input, Output, EventEmitter } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-sidebar',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './sidebar.component.html'
})
export class SidebarComponent {
  @Input() activeView: string = 'home';
  @Output() onMenuSelect = new EventEmitter<string>();
  @Output() onLogout = new EventEmitter<void>();

  selectMenu(view: string) {
    this.onMenuSelect.emit(view);
  }

  logoutRequested() {
    this.onLogout.emit();
  }
}
