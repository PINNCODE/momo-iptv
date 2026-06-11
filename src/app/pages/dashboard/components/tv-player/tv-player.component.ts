import {
  Component,
  OnInit,
  OnDestroy,
  AfterViewInit,
  ElementRef,
  ViewChild,
  NgZone,
  ChangeDetectorRef,
} from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import Hls from 'hls.js';
import { IptvApiService } from '../../../../services/iptv-api.service';
import { Subscription } from 'rxjs';

interface EpgEntry {
  id: string;
  title: string;
  start: string;
  end: string;
  now_playing: number;
}

@Component({
  selector: 'app-tv-player',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './tv-player.component.html',
  styleUrl: './tv-player.component.scss',
})
export class TvPlayerComponent implements OnInit, AfterViewInit, OnDestroy {
  @ViewChild('videoEl') videoRef!: ElementRef<HTMLVideoElement>;

  private hls: Hls | null = null;
  private hideTimer: ReturnType<typeof setTimeout> | null = null;
  /** Listeners added outside zone — stored for cleanup on destroy */
  private mouseMoveListener!: () => void;
  private mouseLeaveListener!: () => void;
  private scrollListener!: () => void;

  isPlaying = false;
  isMuted = false;
  volume = 1;
  controlsVisible = false;
  isLoading = true;
  hasError = false;
  hasChannel = false;
  currentChannel: any = null;

  // EPG
  currentEpg: EpgEntry | null = null;
  upcomingEpg: EpgEntry[] = [];

  private channelSub: Subscription | null = null;

  constructor(
    private iptvApi: IptvApiService,
    private ngZone: NgZone,
    private cdr: ChangeDetectorRef,
    private hostRef: ElementRef<HTMLElement>
  ) {}

  ngOnInit(): void {
    const savedVolume = localStorage.getItem('iptv_volume');
    const savedMuted = localStorage.getItem('iptv_muted');
    if (savedVolume !== null) {
      this.volume = parseFloat(savedVolume);
    }
    if (savedMuted !== null) {
      this.isMuted = savedMuted === 'true';
    }
  }

  ngAfterViewInit(): void {
    const video = this.videoRef.nativeElement;
    video.volume = this.volume;
    video.muted = this.isMuted;

    this.channelSub = this.iptvApi.currentChannel$.subscribe(channel => {
      setTimeout(() => {
        this.currentChannel = channel;
        if (channel) {
          this.hasChannel = true;
          this.loadChannel(channel);
        } else {
          this.hasChannel = false;
        }
      });
    });

    Promise.resolve().then(() => {
      this.initMouseIdleDetection();
    });
  }

  private loadChannel(channel: any): void {
    const url = this.iptvApi.getStreamUrl(channel.stream_id);
    this.loadEpg(channel.stream_id);
    this.initPlayer(url);
  }

  private loadEpg(streamId: number): void {
    this.iptvApi.getShortEpg(streamId).subscribe({
      next: (data) => {
        if (data && data.epg_listings) {
          const listings = data.epg_listings as EpgEntry[];
          this.currentEpg = listings.find((e) => e.now_playing === 1) ?? listings[0] ?? null;
          const currentIdx = this.currentEpg ? listings.indexOf(this.currentEpg) : -1;
          this.upcomingEpg = listings.slice(currentIdx + 1, currentIdx + 4);
          this.cdr.markForCheck();
        } else {
          this.currentEpg = null;
          this.upcomingEpg = [];
          this.cdr.markForCheck();
        }
      },
      error: () => {
        this.currentEpg = null;
        this.upcomingEpg = [];
        this.cdr.markForCheck();
      }
    });
  }

  private initPlayer(url: string): void {
    const video = this.videoRef.nativeElement;

    if (this.hls) {
      this.hls.destroy();
      this.hls = null;
    }

    if (Hls.isSupported()) {
      this.hls = new Hls({
        lowLatencyMode: true,
        enableWorker: true,
      });

      this.hls.loadSource(url);
      this.hls.attachMedia(video);

      this.hls.on(Hls.Events.MANIFEST_PARSED, () => {
        this.ngZone.run(() => {
          this.isLoading = false;
          this.cdr.detectChanges();
          video.play().then(() => {
            this.isPlaying = true;
            this.cdr.detectChanges();
          }).catch(() => {
            // Autoplay blocked — user must click play
            this.isPlaying = false;
            this.cdr.detectChanges();
          });
        });
      });

      this.hls.on(Hls.Events.ERROR, (_event, data) => {
        if (data.fatal) {
          this.ngZone.run(() => {
            this.hasError = true;
            this.isLoading = false;
            this.cdr.detectChanges();
          });
        }
      });

    } else if (video.canPlayType('application/vnd.apple.mpegurl')) {
      // Safari native HLS
      video.src = url;
      video.addEventListener('loadedmetadata', () => {
        this.ngZone.run(() => { 
          this.isLoading = false; 
          this.cdr.detectChanges();
        });
        video.play()
          .then(() => this.ngZone.run(() => {
            this.isPlaying = true;
            this.cdr.detectChanges();
          }))
          .catch(() => {});
      });

    } else {
      this.ngZone.run(() => {
        this.hasError = true;
        this.isLoading = false;
        this.cdr.detectChanges();
      });
    }

    video.volume = this.volume;
    video.muted = this.isMuted;

    video.addEventListener('waiting', () => this.ngZone.run(() => {
      this.isLoading = true;
      this.cdr.detectChanges();
    }));
    video.addEventListener('playing', () => this.ngZone.run(() => {
      this.isLoading = false;
      this.cdr.detectChanges();
    }));
  }

  // ─── Controls ────────────────────────────────────────────────────────────────

  togglePlay(): void {
    const video = this.videoRef.nativeElement;
    if (video.paused) {
      video.play();
      this.isPlaying = true;
    } else {
      video.pause();
      this.isPlaying = false;
    }
    // Show controls briefly on click so user sees state change feedback
    this.showControlsBriefly();
  }

  toggleMute(): void {
    const video = this.videoRef.nativeElement;
    this.isMuted = !this.isMuted;
    video.muted = this.isMuted;
    this.saveVolumeState();
    this.scheduleHide();
  }

  onVolumeChange(event: Event): void {
    const input = event.target as HTMLInputElement;
    this.volume = parseFloat(input.value);
    const video = this.videoRef.nativeElement;
    video.volume = this.volume;
    this.isMuted = this.volume === 0;
    video.muted = this.isMuted;
    this.saveVolumeState();
    this.scheduleHide();
  }

  private saveVolumeState(): void {
    localStorage.setItem('iptv_volume', this.volume.toString());
    localStorage.setItem('iptv_muted', this.isMuted.toString());
  }

  // ─── Controls visibility ─────────────────────────────────────────────────────

  /**
   * Attach mousemove/mouseleave listeners on the HOST element outside Angular's
   * zone. This is the correct way: the host element wraps the entire component
   * (including `.player-root`). Using the host avoids `closest()` which is
   * unreliable with Angular's component element boundaries.
   *
   * Listeners are stored so they can be properly removed in ngOnDestroy.
   */
  private initMouseIdleDetection(): void {
    const host = this.hostRef.nativeElement;

    this.mouseMoveListener = () => this.showControls();
    this.mouseLeaveListener = () => this.hideControls();
    this.scrollListener = () => this.showControls();

    this.ngZone.runOutsideAngular(() => {
      host.addEventListener('mousemove', this.mouseMoveListener, { passive: true });
      host.addEventListener('mouseleave', this.mouseLeaveListener);
      window.addEventListener('scroll', this.scrollListener, { passive: true });
    });
  }

  private showControls(): void {
    if (!this.controlsVisible) {
      this.ngZone.run(() => {
        this.controlsVisible = true;
        this.cdr.markForCheck();
      });
    }
    this.scheduleHide();
  }

  /** Called on click-to-play so controls flash visible then auto-hide */
  private showControlsBriefly(): void {
    this.ngZone.run(() => {
      this.controlsVisible = true;
      this.cdr.markForCheck();
    });
    this.scheduleHide();
  }

  private hideControls(): void {
    this.ngZone.run(() => {
      this.controlsVisible = false;
      this.cdr.markForCheck();
    });
    if (this.hideTimer) {
      clearTimeout(this.hideTimer);
      this.hideTimer = null;
    }
  }

  /**
   * Schedule hiding controls after 5 s of inactivity.
   * MUST run outside Angular zone so the timer does not keep Angular's
   * change detection loop alive on every tick.
   */
  private scheduleHide(): void {
    if (this.hideTimer) clearTimeout(this.hideTimer);
    this.ngZone.runOutsideAngular(() => {
      this.hideTimer = setTimeout(() => {
        this.ngZone.run(() => {
          this.controlsVisible = false;
          this.cdr.markForCheck();
        });
      }, 5000);
    });
  }

  // ─── Lifecycle ────────────────────────────────────────────────────────────────

  ngOnDestroy(): void {
    if (this.channelSub) {
      this.channelSub.unsubscribe();
    }
    if (this.hls) {
      this.hls.destroy();
      this.hls = null;
    }
    if (this.hideTimer) clearTimeout(this.hideTimer);

    // Clean up manually-added listeners
    const host = this.hostRef.nativeElement;
    host.removeEventListener('mousemove', this.mouseMoveListener);
    host.removeEventListener('mouseleave', this.mouseLeaveListener);
    window.removeEventListener('scroll', this.scrollListener);
  }

  // ─── Helpers ─────────────────────────────────────────────────────────────────

  formatTime(datetime: string): string {
    const d = new Date(datetime);
    return d.toLocaleTimeString('es-MX', { hour: '2-digit', minute: '2-digit' });
  }
}
