import { Injectable } from '@angular/core';

const STREAM_KEY = 'iptv_stream_url';

@Injectable({ providedIn: 'root' })
export class StreamService {
  /**
   * Returns the stream URL stored in localStorage.
   * If none exists, initialises with the default URL (for development).
   */
  getStreamUrl(): string {
    let url = localStorage.getItem(STREAM_KEY);
    if (!url) {
      const defaultUrl = [
        'https://ftvpro.net:8443/live/',
        'Trujillo2303',
        '/SAFJC4xWVRp5/',
        '8.m3u8',
      ].join('');
      localStorage.setItem(STREAM_KEY, defaultUrl);
      url = defaultUrl;
    }
    return url;
  }

  setStreamUrl(url: string): void {
    localStorage.setItem(STREAM_KEY, url);
  }
}
