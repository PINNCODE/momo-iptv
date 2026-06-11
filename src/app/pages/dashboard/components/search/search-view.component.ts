import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { TvEpgComponent } from '../tv/components/tv-epg/tv-epg.component';
import { TV_MOCK_DATA } from '../tv/tv-mock-data';

interface GroupedChannels {
  categoryId: string;
  categoryName: string;
  channels: any[];
}

@Component({
  selector: 'app-search-view',
  standalone: true,
  imports: [CommonModule, FormsModule, TvEpgComponent],
  template: `
    <div class="h-full w-full grid grid-cols-1 md:grid-cols-2 gap-6 animate-fade-in">
      
      <!-- Columna 1: Buscador y Resultados -->
      <div class="h-full flex flex-col rounded-[2.5rem] bg-white/40 dark:bg-black/20 backdrop-blur-2xl border border-white/50 dark:border-white/10 shadow-[0_8px_32px_0_rgba(0,0,0,0.1)] dark:shadow-[0_8px_32px_0_rgba(0,0,0,0.3)] transform-gpu p-6">
        <!-- Input de Búsqueda -->
        <div class="mb-6 relative">
          <div class="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
            <svg class="h-5 w-5 text-gray-500 dark:text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"></path>
            </svg>
          </div>
          <input 
            type="text" 
            [(ngModel)]="searchTerm" 
            (ngModelChange)="onSearch()"
            placeholder="Buscar canales..." 
            class="w-full pl-11 pr-4 py-3 rounded-2xl bg-white/50 dark:bg-black/30 border border-white/30 dark:border-white/10 focus:outline-none focus:ring-2 focus:ring-blue-500/50 text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400 shadow-inner backdrop-blur-sm transition-all"
          >
        </div>

        <!-- Resultados agrupados -->
        <div class="flex-grow overflow-y-auto pr-2 space-y-6 scrollbar-hide">
          <div *ngIf="searchTerm.trim() === ''" class="text-center text-gray-500 dark:text-gray-400 mt-10">
            Escribe para buscar canales...
          </div>
          
          <div *ngIf="searchTerm.trim() !== '' && groupedResults.length === 0" class="text-center text-gray-500 dark:text-gray-400 mt-10">
            No se encontraron canales que coincidan con "{{ searchTerm }}".
          </div>

          <div *ngFor="let group of groupedResults" class="space-y-3">
            <h3 class="text-lg font-bold text-gray-800 dark:text-gray-200 border-b border-gray-300 dark:border-gray-700 pb-1">
              {{ group.categoryName }}
            </h3>
            
            <div class="space-y-2">
              <div *ngFor="let channel of group.channels"
                   (click)="selectChannel(channel)"
                   class="w-full text-left rounded-xl transition-all duration-200 group flex flex-col border cursor-pointer justify-center px-5"
                   [ngClass]="{
                     'bg-white/40 dark:bg-white/10 font-bold shadow-inner border border-white/50 dark:border-white/20 min-h-[80px] h-auto py-4': selectedChannelId === channel.stream_id,
                     'bg-white/10 dark:bg-black/10 border-transparent hover:bg-white/20 dark:hover:bg-white/5 hover:border-white/30 dark:hover:border-white/10 h-20': selectedChannelId !== channel.stream_id
                   }">
                
                <div class="flex items-center space-x-4">
                  <!-- Channel Number -->
                  <div class="flex-shrink-0 w-8 text-center text-sm font-bold text-gray-400 dark:text-gray-500">
                    {{ channel.num }}
                  </div>
                  
                  <!-- Channel Icon -->
                  <div class="flex-shrink-0 w-12 h-12 rounded-lg bg-white/50 dark:bg-black/50 border border-white/30 dark:border-white/10 p-1 flex items-center justify-center overflow-hidden shadow-inner">
                    <img [src]="channel.stream_icon" [alt]="channel.name" class="max-w-full max-h-full object-contain" onerror="this.style.display='none'">
                    <div *ngIf="!channel.stream_icon" class="text-xs text-gray-500 dark:text-gray-400">TV</div>
                  </div>
                  
                  <!-- Channel Name -->
                  <div class="flex-grow min-w-0">
                    <p class="text-sm font-medium truncate"
                       [ngClass]="{'text-white drop-shadow-md': selectedChannelId === channel.stream_id, 'text-gray-800 dark:text-gray-200': selectedChannelId !== channel.stream_id}">
                      {{ channel.name }}
                    </p>
                    <div class="flex items-center mt-1">
                      <span class="inline-flex items-center px-2 py-0.5 rounded text-[10px] font-medium"
                            [ngClass]="channel.stream_type === 'live' ? 'bg-red-500/20 text-red-700 dark:text-red-300 border border-red-500/30' : 'bg-gray-500/20 text-gray-800 dark:text-gray-300 border border-gray-500/30'">
                        {{ channel.stream_type | uppercase }}
                      </span>
                    </div>
                  </div>
                </div>
                
                <!-- Acciones -->
                <div class="flex justify-end space-x-2 mt-3" *ngIf="selectedChannelId === channel.stream_id">
                  <button (click)="viewEpg(channel, $event)" 
                          class="p-2 text-xs font-bold rounded-xl bg-white/35 hover:bg-white/55 dark:bg-white/5 dark:hover:bg-white/10 text-white transition-colors backdrop-blur-md border border-white/35 dark:border-white/10 shadow-sm flex items-center justify-center cursor-pointer"
                          title="Ver Guía EPG">
                    <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"></path>
                    </svg>
                  </button>
                  <button (click)="playChannel(channel, $event)" 
                          class="p-2 text-xs font-bold rounded-xl bg-blue-500/85 hover:bg-blue-500 text-white transition-colors backdrop-blur-md border border-blue-400/50 shadow-md flex items-center justify-center cursor-pointer"
                          title="Ver Canal Ahora">
                    <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M14.752 11.168l-3.197-2.132A1 1 0 0010 9.87v4.263a1 1 0 001.555.832l3.197-2.132a1 1 0 000-1.664z"></path>
                      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M21 12a9 9 0 11-18 0 9 9 0 0118 0z"></path>
                    </svg>
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <!-- Columna 2: EPG -->
      <div class="h-full overflow-hidden">
        <app-tv-epg *ngIf="selectedChannelEpg"
          [epgData]="currentEpg">
        </app-tv-epg>
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
    @keyframes fadeIn {
      from { opacity: 0; transform: translateY(10px); }
      to { opacity: 1; transform: translateY(0); }
    }
    .animate-fade-in {
      animation: fadeIn 0.4s ease-out forwards;
    }
  `]
})
export class SearchViewComponent implements OnInit {
  searchTerm: string = '';
  groupedResults: GroupedChannels[] = [];
  
  selectedChannelId: number | null = null;
  selectedChannelEpg: number | null = null;
  currentEpg: any[] | null = null;

  categoriesMap: Map<string, string> = new Map();

  ngOnInit() {
    // Inicializar mapa de categorías para búsquedas rápidas del nombre
    TV_MOCK_DATA.categories.forEach(cat => {
      this.categoriesMap.set(cat.category_id, cat.category_name);
    });
  }

  onSearch() {
    const term = this.searchTerm.trim().toLowerCase();
    
    if (!term) {
      this.groupedResults = [];
      return;
    }

    // Filtrar canales
    const matchedChannels = TV_MOCK_DATA.channels.filter(channel => 
      channel.name.toLowerCase().includes(term)
    );

    // Agrupar por categoría
    const groupsMap = new Map<string, GroupedChannels>();

    matchedChannels.forEach(channel => {
      const catId = channel.category_id;
      if (!groupsMap.has(catId)) {
        groupsMap.set(catId, {
          categoryId: catId,
          categoryName: this.categoriesMap.get(catId) || 'Otros',
          channels: []
        });
      }
      groupsMap.get(catId)!.channels.push(channel);
    });

    this.groupedResults = Array.from(groupsMap.values());
  }

  selectChannel(channel: any) {
    this.selectedChannelId = channel.stream_id;
  }

  viewEpg(channel: any, event: Event) {
    event.stopPropagation();
    this.selectedChannelId = channel.stream_id;
    this.selectedChannelEpg = channel.stream_id;
    
    // Obtenemos la EPG simulada
    this.currentEpg = TV_MOCK_DATA.epg.epg_listings;
  }

  playChannel(channel: any, event: Event) {
    event.stopPropagation();
    console.log('SearchView: Reproduciendo canal:', channel.name);
  }
}
