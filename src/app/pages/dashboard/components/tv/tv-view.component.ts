import { Component, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Subscription } from 'rxjs';
import { TvCategoriesComponent } from './components/tv-categories/tv-categories.component';
import { TvChannelsComponent } from './components/tv-channels/tv-channels.component';
import { TvEpgComponent } from './components/tv-epg/tv-epg.component';
import { IptvApiService } from '../../../../services/iptv-api.service';

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
export class TvViewComponent implements OnInit, OnDestroy {
  categories: any[] = [];
  currentChannels: any[] = [];
  currentEpg: any[] | null = null;

  selectedCategoryId: string | null = null;
  selectedChannelId: number | null = null;
  
  private channelSub: Subscription | null = null;

  constructor(private iptvApi: IptvApiService) {}

  ngOnInit() {
    this.iptvApi.getCategories().subscribe({
      next: (data) => {
        this.categories = data;
      },
      error: (err) => console.error('Failed to load categories', err)
    });

    this.channelSub = this.iptvApi.currentChannel$.subscribe(channel => {
      if (channel) {
        if (this.selectedCategoryId !== channel.category_id) {
          this.selectedCategoryId = channel.category_id;
          this.iptvApi.getLiveStreams(channel.category_id).subscribe({
            next: (data) => {
              this.currentChannels = data;
            },
            error: (err) => console.error('Failed to load streams', err)
          });
        }
        
        if (this.selectedChannelId !== channel.stream_id) {
          this.selectedChannelId = channel.stream_id;
          this.iptvApi.getShortEpg(channel.stream_id).subscribe({
            next: (data) => {
              if (data && data.epg_listings) {
                this.currentEpg = data.epg_listings;
              } else {
                this.currentEpg = null;
              }
            },
            error: (err) => console.error('Failed to load EPG', err)
          });
        }
      }
    });
  }

  ngOnDestroy() {
    if (this.channelSub) {
      this.channelSub.unsubscribe();
    }
  }

  onCategorySelected(category: any) {
    this.selectedCategoryId = category.category_id;
    
    this.iptvApi.getLiveStreams(category.category_id).subscribe({
      next: (data) => {
        this.currentChannels = data;
      },
      error: (err) => console.error('Failed to load streams', err)
    });
    
    this.selectedChannelId = null;
    this.currentEpg = null;
  }

  onChannelSelected(channel: any) {
    this.selectedChannelId = channel.stream_id;
    
    this.iptvApi.getShortEpg(channel.stream_id).subscribe({
      next: (data) => {
        if (data && data.epg_listings) {
          this.currentEpg = data.epg_listings;
        } else {
          this.currentEpg = null;
        }
      },
      error: (err) => console.error('Failed to load EPG', err)
    });
  }

  onPlayRequested(channel: any) {
    this.iptvApi.playChannel(channel);
    console.log('TvView: Solicitud de reproducción para', channel.name);
  }
}
