import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { BehaviorSubject, catchError, map, of, shareReplay, tap, type Observable } from 'rxjs';


interface CarQueryResponse {
  Makes: Array<{ make_display: string }>;
}

@Injectable({ providedIn: 'root' })
export class VehicleMakesService {
  private readonly makesSubject = new BehaviorSubject<string[]>([]);
  private readonly makes$ = this.makesSubject.asObservable();
  private readonly fetch$;

  constructor(private readonly http: HttpClient) {
    this.fetch$ = this.http
      .jsonp<CarQueryResponse>('https://www.carqueryapi.com/api/0.3/?cmd=getMakes', 'callback')
      .pipe(
        tap((a) => console.log('ASD', a)),
        map((response) =>
          response.Makes.map((make) => make.make_display).filter((make) => make.length > 0)
        ),
        map((makes) => Array.from(new Set(makes)).sort((a, b) => a.localeCompare(b))),
        catchError(() => of([])),
        tap((makes) => this.makesSubject.next(makes)),
        shareReplay({ bufferSize: 1, refCount: false })
      );
  }

  getMakes(query: string, limit = 5): Observable<string[]> {
    const trimmed = query.trim().toLowerCase();
    return this.makes$.pipe(
      map((makes) =>
        (trimmed ? makes.filter((make) => make.toLowerCase().includes(trimmed)) : makes).slice(
          0,
          limit
        )
      ),
      catchError(() => of([]))
    );
  }

  prefetch(): Observable<string[]> {
    return this.fetch$;
  }

  getAllMakesStream(): Observable<string[]> {
    return this.makes$;
  }
}
