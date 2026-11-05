import { Injectable, inject } from '@angular/core';
import { HttpClient, HttpErrorResponse } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../environments/environment';

export interface ContactRequest {
  name: string;
  email: string;
  message: string;
  /** Honeypot - bleibt leer, außer ein Bot füllt ihn aus. */
  website?: string;
}

interface FormFieldError {
  field: string;
  message: string;
}

interface FormErrorResponse {
  error: string;
  details?: FormFieldError[];
}

export interface FormErrorState {
  message: string;
  fieldErrors: Record<string, string>;
}

/** Übersetzt die Antwort des Servers in Meldungen, die im Formular stehen können. */
export function describeFormError(error: HttpErrorResponse): FormErrorState {
  const body = error.error as FormErrorResponse | null;

  if (error.status === 400 && body?.details?.length) {
    const fieldErrors: Record<string, string> = {};
    for (const detail of body.details) {
      fieldErrors[detail.field] = detail.message;
    }
    return { message: 'Bitte prüfen Sie die markierten Felder.', fieldErrors };
  }

  if (error.status === 429) {
    return {
      message: 'Es wurden zu viele Anfragen gesendet. Bitte versuchen Sie es später noch einmal.',
      fieldErrors: {},
    };
  }

  if (error.status === 0) {
    return {
      message: 'Der Server ist gerade nicht erreichbar. Bitte versuchen Sie es später noch einmal.',
      fieldErrors: {},
    };
  }

  return {
    message:
      'Ihre Anfrage konnte leider nicht gesendet werden. Schreiben Sie mir gern direkt an business@kielstack.de.',
    fieldErrors: {},
  };
}

@Injectable({ providedIn: 'root' })
export class ContactService {
  private readonly http = inject(HttpClient);

  sendContact(request: ContactRequest): Observable<{ ok: boolean }> {
    const url = `${environment.contactApiUrl}/api/contact/${environment.contactSiteKey}`;
    return this.http.post<{ ok: boolean }>(url, request);
  }
}
