import { bootstrapApplication } from '@angular/platform-browser';
import { provideHttpClient, withFetch } from '@angular/common/http';
import { provideRouter, withRouterConfig } from '@angular/router';
import { AppComponent } from './app/app.component';
import { routes } from './app/app.routes';

bootstrapApplication(AppComponent, {
  providers: [
    provideHttpClient(withFetch()),
    provideRouter(
      routes,
      // Ohne 'reload' meldet der Router einen erneuten Klick auf denselben
      // Abschnitt gar nicht - man waere weggescrollt und der Link tot.
      withRouterConfig({ onSameUrlNavigation: 'reload' }),
    ),
  ],
}).catch((error) => console.error(error));
