import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { TvCategoriesComponent } from './components/tv-categories/tv-categories.component';
import { TvChannelsComponent } from './components/tv-channels/tv-channels.component';
import { TvEpgComponent } from './components/tv-epg/tv-epg.component';
import { TV_MOCK_DATA } from './tv-mock-data';

@Component({
  selector: 'app-tv-view',
  standalone: true,
  imports: [CommonModule, TvCategoriesComponent, TvChannelsComponent, TvEpgComponent],
  template: `
    <div class="h-full w-full grid grid-cols-1 md:grid-cols-3 gap-6 animate-fade-in">
      
      <!-- Column 1: Categorías -->
      <div class="h-full overflow-hidden">
        <app-tv-categories
          [categories]="categories"
          [selectedCategoryId]="selectedCategoryId"
          (categorySelected)="onCategorySelected($event)">
        </app-tv-categories>
      </div>

      <!-- Column 2: Canales -->
      <div class="h-full overflow-hidden">
        <app-tv-channels *ngIf="selectedCategoryId"
          [channels]="currentChannels"
          [selectedChannelId]="selectedChannelId"
          (channelSelected)="onChannelSelected($event)"
          (playRequested)="onPlayRequested($event)">
        </app-tv-channels>
      </div>

      <!-- Column 3: EPG -->
      <div class="h-full overflow-hidden">
        <app-tv-epg *ngIf="selectedChannelId"
          [epgData]="currentEpg">
        </app-tv-epg>
      </div>

    </div>
  `,
  styles: [`
    @keyframes fadeIn {
      from { opacity: 0; transform: translateY(10px); }
      to { opacity: 1; transform: translateY(0); }
    }
    .animate-fade-in {
      animation: fadeIn 0.4s ease-out forwards;
    }
  `]
})
export class TvViewComponent implements OnInit {
  categories: any[] = [];
  currentChannels: any[] = [];
  currentEpg: any[] | null = null;

  selectedCategoryId: string | null = null;
  selectedChannelId: number | null = null;

  ngOnInit() {
    // Load mock data
    this.categories = TV_MOCK_DATA.categories;
  }

  onCategorySelected(category: any) {
    this.selectedCategoryId = category.category_id;
    
    // Filtramos los canales usando los datos mockeados
    // En el futuro esto sería una llamada al backend
    this.currentChannels = TV_MOCK_DATA.channels.filter(c => c.category_id === category.category_id);
    
    // Reseteamos el canal seleccionado y la guía
    this.selectedChannelId = null;
    this.currentEpg = null;
  }

  onChannelSelected(channel: any) {
    this.selectedChannelId = channel.stream_id;
    
    // Obtenemos la EPG simulada
    // En el futuro esto sería una llamada al backend con el channel.stream_id o epg_channel_id
    this.currentEpg = TV_MOCK_DATA.epg.epg_listings;
  }

  onPlayRequested(channel: any) {
    // Aquí podemos emitir un evento para abrir el reproductor global
    console.log('TvView: Solicitud de reproducción para', channel.name);
  }
}
