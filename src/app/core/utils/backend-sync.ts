import { Observable, catchError, of } from 'rxjs';

export function runBackendEffect<T>(enabled: boolean, request: Observable<T> | null | undefined, fallback: T): void {
  if (!enabled || !request) {
    return;
  }

  request.pipe(catchError(() => of(fallback))).subscribe();
}

export function runBackendSubscription<T>(
  enabled: boolean,
  request: Observable<T> | null | undefined,
  fallback: T,
  next: (value: T) => void
): void {
  if (!enabled || !request) {
    return;
  }

  request.pipe(catchError(() => of(fallback))).subscribe(next);
}
