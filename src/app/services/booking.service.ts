import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../environments/environment';

export interface BookingSlots {
  timeZone: string;
  slotMinutes: number;
  /** Startzeiten als ISO-Strings, aufsteigend. */
  slots: string[];
}

export interface BookingRequest {
  name: string;
  email: string;
  start: string;
  message: string;
  /** Honeypot - bleibt leer, außer ein Bot füllt ihn aus. */
  website?: string;
}

@Injectable({ providedIn: 'root' })
export class BookingService {
  private readonly http = inject(HttpClient);
  private readonly baseUrl = `${environment.contactApiUrl}/api/booking/${environment.contactSiteKey}`;

  loadSlots(): Observable<BookingSlots> {
    return this.http.get<BookingSlots>(`${this.baseUrl}/slots`);
  }

  requestAppointment(request: BookingRequest): Observable<{ ok: boolean }> {
    return this.http.post<{ ok: boolean }>(this.baseUrl, request);
  }
}
