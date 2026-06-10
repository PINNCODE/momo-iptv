import { Component, Input } from '@angular/core';

@Component({
  selector: 'app-glass-button',
  standalone: true,
  template: `
    <button 
      [type]="type"
      [disabled]="disabled"
      class="w-full py-3 px-4 bg-white/10 dark:bg-white/5 hover:bg-white/20 dark:hover:bg-white/10 backdrop-blur-md border border-white/30 dark:border-white/10 shadow-lg rounded-xl text-gray-800 dark:text-white font-semibold transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed">
      <ng-content></ng-content>
    </button>
  `
})
export class GlassButtonComponent {
  @Input() type: 'button' | 'submit' | 'reset' = 'button';
  @Input() disabled = false;
}
