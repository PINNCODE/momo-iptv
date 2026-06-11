import { Injectable, signal } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable, BehaviorSubject, of, throwError } from 'rxjs';
import { map, tap, catchError } from 'rxjs/operators';

export interface IptvCredentials {
  serverUrl: string;
  username: string;
  password: string;
}

@Injectable({
  providedIn: 'root'
})
export class IptvApiService {
  private credentialsKey = 'iptv_credentials';
  private lastChannelKey = 'iptv_last_channel';
  
  // State for credentials using Signals
  public credentials = signal<IptvCredentials | null>(null);

  // State for the currently playing channel
  private currentStreamUrlSubject = new BehaviorSubject<string>('');
  public currentStreamUrl$ = this.currentStreamUrlSubject.asObservable();

  private currentChannelSubject = new BehaviorSubject<any>(null);
  public currentChannel$ = this.currentChannelSubject.asObservable();

  constructor(private http: HttpClient) {
    this.loadCredentials();
    this.loadLastChannel();
  }

  private loadLastChannel() {
    const saved = localStorage.getItem(this.lastChannelKey);
    if (saved) {
      try {
        const channel = JSON.parse(saved);
        this.currentChannelSubject.next(channel);
      } catch (e) {
        console.error('Failed to parse last channel', e);
      }
    }
  }

  private decodeBase64(str: string | null | undefined): string {
    if (!str) return '';
    try {
      return decodeURIComponent(escape(atob(str)));
    } catch (e) {
      // Fallback if not valid base64 or decode fails
      try {
        return atob(str);
      } catch(err) {
        return str;
      }
    }
  }

  private loadCredentials() {
    const saved = localStorage.getItem(this.credentialsKey);
    if (saved) {
      try {
        this.credentials.set(JSON.parse(saved));
      } catch (e) {
        console.error('Failed to parse saved credentials', e);
      }
    }
  }

  public saveCredentials(creds: IptvCredentials) {
    localStorage.setItem(this.credentialsKey, JSON.stringify(creds));
    this.credentials.set(creds);
  }

  public clearCredentials() {
    localStorage.removeItem(this.credentialsKey);
    this.credentials.set(null);
  }

  private getBaseUrl(): string {
    const creds = this.credentials();
    if (!creds || !creds.serverUrl) return '';
    let url = creds.serverUrl;
    if (url.endsWith('/')) {
      url = url.slice(0, -1);
    }
    return url;
  }

  private getBaseParams(): HttpParams {
    const creds = this.credentials();
    if (!creds) throw new Error('No credentials found');
    return new HttpParams()
      .set('username', creds.username)
      .set('password', creds.password);
  }

  public login(serverUrl: string, username: string, password: string): Observable<any> {
    let formattedUrl = serverUrl;
    if (formattedUrl.endsWith('/')) {
      formattedUrl = formattedUrl.slice(0, -1);
    }
    
    const params = new HttpParams()
      .set('username', username)
      .set('password', password);

    return this.http.get(`${formattedUrl}/player_api.php`, { params }).pipe(
      tap((response: any) => {
        // Typically the API returns user_info on success
        if (response && response.user_info) {
          this.saveCredentials({ serverUrl: formattedUrl, username, password });
        } else {
          throw new Error('Invalid credentials');
        }
      })
    );
  }

  public getCategories(): Observable<any[]> {
    const baseUrl = this.getBaseUrl();
    if (!baseUrl) return of([]);

    const params = this.getBaseParams().set('action', 'get_live_categories');
    return this.http.get<any[]>(`${baseUrl}/player_api.php`, { params });
  }

  public getLiveStreams(categoryId?: string): Observable<any[]> {
    const baseUrl = this.getBaseUrl();
    if (!baseUrl) return of([]);

    let params = this.getBaseParams().set('action', 'get_live_streams');
    if (categoryId) {
      params = params.set('category_id', categoryId);
    }
    return this.http.get<any[]>(`${baseUrl}/player_api.php`, { params }).pipe(
      map(streams => streams.map(stream => ({
        ...stream,
        name: stream.name ? this.decodeBase64(stream.name) : stream.name
      })))
    );
  }

  public getShortEpg(streamId: string | number): Observable<any> {
    const baseUrl = this.getBaseUrl();
    if (!baseUrl) return of(null);

    const params = this.getBaseParams()
      .set('action', 'get_short_epg')
      .set('stream_id', streamId.toString());
      
    return this.http.get<any>(`${baseUrl}/player_api.php`, { params }).pipe(
      map(data => {
        if (data && data.epg_listings) {
          data.epg_listings = data.epg_listings.map((epg: any) => ({
            ...epg,
            title: epg.title ? this.decodeBase64(epg.title) : epg.title,
            description: epg.description ? this.decodeBase64(epg.description) : epg.description
          }));
        }
        return data;
      })
    );
  }

  public getStreamUrl(channelId: string | number): string {
    const creds = this.credentials();
    if (!creds) return '';
    const baseUrl = this.getBaseUrl();
    return `${baseUrl}/live/${creds.username}/${creds.password}/${channelId}.m3u8`;
  }

  public playChannel(channel: any) {
    this.currentChannelSubject.next(channel);
    if (channel && channel.stream_id) {
      localStorage.setItem(this.lastChannelKey, JSON.stringify(channel));
      const url = this.getStreamUrl(channel.stream_id);
      this.currentStreamUrlSubject.next(url);
    }
  }
}
