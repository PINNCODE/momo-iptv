import { Component, Input, Output, EventEmitter } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-sidebar',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './sidebar.component.html'
})
export class SidebarComponent {
  // Input para poder cambiar las iniciales del usuario desde el componente padre
  @Input() userInitials: string = 'U';
  @Input() activeView: string = 'home';
  @Output() onMenuSelect = new EventEmitter<string>();

  selectMenu(view: string) {
    this.onMenuSelect.emit(view);
  }
}
