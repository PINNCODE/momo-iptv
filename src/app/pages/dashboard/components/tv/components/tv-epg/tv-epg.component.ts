import { Component, Input } from '@angular/core';
import { CommonModule, DatePipe } from '@angular/common';

@Component({
  selector: 'app-tv-epg',
  standalone: true,
  imports: [CommonModule],
  providers: [DatePipe],
  template: `
    <div class="h-full flex flex-col rounded-[2.5rem] bg-white/40 dark:bg-black/20 backdrop-blur-2xl border border-white/50 dark:border-white/10 shadow-[0_8px_32px_0_rgba(0,0,0,0.1)] dark:shadow-[0_8px_32px_0_rgba(0,0,0,0.3)] transform-gpu p-6 animate-fade-in">
      <h2 class="text-xl font-bold mb-4 text-gray-800 dark:text-white px-2">Guía (EPG)</h2>
      
      <div class="flex-grow overflow-y-auto pr-2 scrollbar-hide">
        <div *ngIf="!epgData || epgData.length === 0" class="text-center text-gray-500 dark:text-gray-400 mt-10">
          Selecciona un canal para ver la guía
        </div>

        <div *ngIf="epgData && epgData.length > 0" class="relative">
          <!-- Línea vertical del timeline -->
          <div class="absolute top-0 bottom-0 left-6 w-px bg-gray-200 dark:bg-gray-700"></div>
          
          <div class="space-y-6">
            <div *ngFor="let program of epgData; let i = index" class="relative pl-14">
              <!-- Indicador de timeline -->
              <div class="absolute left-4 top-1.5 w-4 h-4 rounded-full border-4 border-white dark:border-black/50 shadow-sm z-10"
                   [ngClass]="program.now_playing === 1 ? 'bg-white shadow-[0_0_10px_rgba(255,255,255,0.8)] animate-pulse' : 'bg-gray-300 dark:bg-gray-600'">
              </div>
              
              <div class="bg-white/40 dark:bg-black/20 backdrop-blur-md rounded-xl p-4 shadow-sm border"
                   [ngClass]="program.now_playing === 1 ? 'border-white dark:border-white/50 shadow-[0_4px_16px_rgba(255,255,255,0.2)]' : 'border-white/50 dark:border-white/10'">
                
                <div class="flex items-center justify-between mb-1">
                  <div class="flex items-center space-x-2 text-sm">
                    <span class="font-bold text-gray-900 dark:text-white">{{ program.start | date:'shortTime' }}</span>
                    <span class="text-gray-400">-</span>
                    <span class="text-gray-500 dark:text-gray-400">{{ program.end | date:'shortTime' }}</span>
                  </div>
                  
                  <span *ngIf="program.now_playing === 1" class="text-[10px] font-bold uppercase tracking-wider text-gray-900 dark:text-white bg-white/60 dark:bg-white/20 border border-white/50 px-2 py-0.5 rounded shadow-sm">
                    En Vivo
                  </span>
                </div>
                
                <h3 class="text-base font-semibold text-gray-800 dark:text-gray-100 mb-2 leading-tight">
                  {{ program.title }}
                </h3>
                
                <p class="text-sm text-gray-600 dark:text-gray-400 line-clamp-2">
                  {{ program.description === 'No Description Info' || program.description === 'IE5vIERlc2NyaXB0aW9uIEluZm8=' ? 'Sin descripción disponible.' : program.description }}
                </p>
              </div>
            </div>
          </div>
        </div>
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
export class TvEpgComponent {
  @Input() epgData: any[] | null = null;
}
