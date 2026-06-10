import { Component, Input, Output, EventEmitter } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-tv-channels',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="h-full flex flex-col rounded-[2.5rem] bg-white/40 dark:bg-black/20 backdrop-blur-2xl border border-white/50 dark:border-white/10 shadow-[0_8px_32px_0_rgba(0,0,0,0.1)] dark:shadow-[0_8px_32px_0_rgba(0,0,0,0.3)] transform-gpu p-6 animate-fade-in">
      <h2 class="text-xl font-bold mb-4 text-gray-800 dark:text-white px-2">Canales</h2>
      
      <div class="flex-grow overflow-y-auto pr-2 space-y-2 scrollbar-hide">
        <div *ngIf="channels.length === 0" class="text-center text-gray-500 dark:text-gray-400 mt-10">
          Selecciona una categoría para ver los canales
        </div>

        <div *ngFor="let channel of channels"
                (click)="selectChannel(channel)"
                class="w-full text-left p-4 rounded-xl transition-all duration-200 group flex flex-col border cursor-pointer"
                [ngClass]="{
                  'bg-white/40 dark:bg-white/10 font-bold shadow-inner border border-white/50 dark:border-white/20': selectedChannelId === channel.stream_id,
                  'bg-white/10 dark:bg-black/10 border-transparent hover:bg-white/20 dark:hover:bg-white/5 hover:border-white/30 dark:hover:border-white/10': selectedChannelId !== channel.stream_id
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
          
          <!-- Botones de Acción -->
          <div class="flex justify-end space-x-2 mt-3" *ngIf="selectedChannelId === channel.stream_id">
            <button (click)="viewEpg(channel, $event)" class="px-4 py-1.5 text-xs font-bold rounded-lg bg-white/30 hover:bg-white/50 dark:bg-black/30 dark:hover:bg-black/50 text-white transition-colors backdrop-blur-md border border-white/30 shadow-sm">
              Ver EPG
            </button>
            <button (click)="playChannel(channel, $event)" class="px-4 py-1.5 text-xs font-bold rounded-lg bg-blue-500/80 hover:bg-blue-500 text-white transition-colors backdrop-blur-md border border-blue-400/50 shadow-md">
              Ver Ahora!
            </button>
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
export class TvChannelsComponent {
  @Input() channels: any[] = [];
  @Input() selectedChannelId: number | null = null;
  @Output() channelSelected = new EventEmitter<any>();
  @Output() epgRequested = new EventEmitter<any>();
  @Output() playRequested = new EventEmitter<any>();

  selectChannel(channel: any) {
    this.selectedChannelId = channel.stream_id;
  }

  viewEpg(channel: any, event: Event) {
    event.stopPropagation();
    this.selectedChannelId = channel.stream_id;
    this.channelSelected.emit(channel);
  }

  playChannel(channel: any, event: Event) {
    event.stopPropagation();
    this.playRequested.emit(channel);
    // Aquí puedes emitir al dashboard para abrir el reproductor
    console.log('Reproduciendo canal:', channel.name);
  }
}
