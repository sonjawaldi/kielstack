import { HttpErrorResponse, provideHttpClient } from "@angular/common/http";
import {
  HttpTestingController,
  provideHttpClientTesting,
} from "@angular/common/http/testing";
import { TestBed } from "@angular/core/testing";
import { BookingService, BookingSlots, isSlotTaken } from "./booking.service";
import { describeFormError } from "./contact.service";

const URL = "https://crm.sonjawaldenspuhl.de/api/public/booking/kielstack";

describe("BookingService", () => {
  let service: BookingService;
  let http: HttpTestingController;

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [provideHttpClient(), provideHttpClientTesting()],
    });
    service = TestBed.inject(BookingService);
    http = TestBed.inject(HttpTestingController);
  });

  afterEach(() => http.verify());

  it("laedt die Slots vom CRM und uebernimmt die Startzeiten", () => {
    let result: BookingSlots | undefined;
    service.loadSlots().subscribe((slots) => (result = slots));

    http.expectOne({ method: "GET", url: URL }).flush({
      slug: "kielstack",
      durationMinutes: 30,
      slots: [
        { start: "2026-11-18T08:30:00.000Z", end: "2026-11-18T09:00:00.000Z" },
        { start: "2026-11-18T09:00:00.000Z", end: "2026-11-18T09:30:00.000Z" },
      ],
    });

    expect(result).toEqual({
      timeZone: "Europe/Berlin",
      slotMinutes: 30,
      slots: ["2026-11-18T08:30:00.000Z", "2026-11-18T09:00:00.000Z"],
    });
  });

  it("fragt per POST auf dieselbe URL an", () => {
    const request = {
      name: "Erika Muster",
      email: "erika@example.com",
      start: "2026-11-18T08:30:00.000Z",
      message: "",
      website: "",
    };
    service.requestAppointment(request).subscribe();

    const call = http.expectOne({ method: "POST", url: URL });
    expect(call.request.body).toEqual(request);
    call.flush({ status: "pending" });
  });
});

describe("isSlotTaken", () => {
  it("erkennt den vergebenen Termin, aber keine Feldfehler", () => {
    const taken = {
      message:
        "Dieser Termin ist leider nicht mehr frei – bitte einen anderen wählen",
    };
    expect(
      isSlotTaken(new HttpErrorResponse({ status: 400, error: taken })),
    ).toBeTrue();
    expect(
      isSlotTaken(
        new HttpErrorResponse({
          status: 400,
          error: {
            message: "Invalid input",
            issues: [{ path: "email", message: "Ungültig" }],
          },
        }),
      ),
    ).toBeFalse();
    expect(isSlotTaken(new HttpErrorResponse({ status: 429 }))).toBeFalse();
  });
});

describe("describeFormError", () => {
  it("ordnet die Fehlerliste des CRM den Feldern zu", () => {
    const state = describeFormError(
      new HttpErrorResponse({
        status: 400,
        error: {
          message: "Invalid input",
          issues: [
            {
              path: "email",
              message: "Bitte eine gültige E-Mail-Adresse eingeben",
            },
          ],
        },
      }),
    );

    expect(state.fieldErrors).toEqual({
      email: "Bitte eine gültige E-Mail-Adresse eingeben",
    });
    expect(state.message).toBe("Bitte prüfen Sie die markierten Felder.");
  });
});
