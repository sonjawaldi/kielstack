import { Injectable, inject } from "@angular/core";
import { HttpClient, HttpErrorResponse } from "@angular/common/http";
import { Observable, map } from "rxjs";
import { environment } from "../../environments/environment";

/** Antwort des CRM auf GET /api/public/booking/:slug. */
interface PublicBookingResponse {
  durationMinutes: number;
  slots: { start: string; end: string }[];
}

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

@Injectable({ providedIn: "root" })
export class BookingService {
  private readonly http = inject(HttpClient);
  private readonly url = `${environment.bookingApiUrl}/api/public/booking/${environment.bookingSlug}`;

  loadSlots(): Observable<BookingSlots> {
    return this.http.get<PublicBookingResponse>(this.url).pipe(
      map((response) => ({
        // Das CRM liefert UTC-Zeiten; angezeigt wird immer Berliner Zeit.
        timeZone: "Europe/Berlin",
        slotMinutes: response.durationMinutes,
        slots: response.slots.map((slot) => slot.start),
      })),
    );
  }

  requestAppointment(request: BookingRequest): Observable<unknown> {
    return this.http.post(this.url, request);
  }
}

/** Das CRM meldet einen vergebenen Termin als 400 ohne Feldfehler. */
export function isSlotTaken(error: HttpErrorResponse): boolean {
  const body = error.error as { message?: unknown; issues?: unknown } | null;
  return (
    error.status === 400 &&
    !body?.issues &&
    typeof body?.message === "string" &&
    body.message.includes("nicht mehr frei")
  );
}
