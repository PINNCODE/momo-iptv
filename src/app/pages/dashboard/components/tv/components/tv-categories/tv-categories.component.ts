import { Component, Input, Output, EventEmitter } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-tv-categories',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="h-full flex flex-col rounded-[2.5rem] bg-white/40 dark:bg-black/20 backdrop-blur-2xl border border-white/50 dark:border-white/10 shadow-[0_8px_32px_0_rgba(0,0,0,0.1)] dark:shadow-[0_8px_32px_0_rgba(0,0,0,0.3)] transform-gpu p-6 animate-fade-in">
      <h2 class="text-xl font-bold mb-4 text-gray-800 dark:text-white px-2">Categorías</h2>
      
      <div class="flex-grow overflow-y-auto pr-2 space-y-1 scrollbar-hide">
        <button *ngFor="let category of categories"
                (click)="selectCategory(category)"
                class="w-full text-left h-20 px-5 rounded-xl transition-all duration-200 group flex items-center justify-between"
                [ngClass]="{
                  'bg-white/40 dark:bg-white/10 text-white font-bold shadow-inner border border-white/50 dark:border-white/20': selectedCategoryId === category.category_id,
                  'text-gray-800 dark:text-gray-200 hover:bg-white/20 dark:hover:bg-white/5 border border-transparent': selectedCategoryId !== category.category_id
                }">
          <span class="truncate" [ngClass]="{'drop-shadow-md': selectedCategoryId === category.category_id}">{{ category.category_name }}</span>
          <svg *ngIf="selectedCategoryId === category.category_id" class="w-5 h-5 text-white drop-shadow-md" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 5l7 7-7 7"></path>
          </svg>
        </button>
      </div>
    </div>
  `,
  styles: [`
    .scrollbar-hide::-webkit-scrollbar {
        display: none;
    }
    .scrollbar-hide {
        -ms-overflow-style: none;
        scrollbar-width: none;
    }
  `]
})
export class TvCategoriesComponent {
  @Input() categories: any[] = [];
  @Input() selectedCategoryId: string | null = null;
  @Output() categorySelected = new EventEmitter<any>();

  selectCategory(category: any) {
    this.categorySelected.emit(category);
  }
}
