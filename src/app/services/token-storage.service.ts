import { Service, signal, Signal } from '@angular/core';

@Service()
export default class TokenStorageService {
  private readonly storageKey: string = 'tpv-backup-admin-token';
  private readonly tokenState = signal<string | null>(sessionStorage.getItem(this.storageKey));

  readonly token: Signal<string | null> = this.tokenState.asReadonly();

  /**
   * Stores the administration token in session storage.
   *
   * @param token Token to store.
   *
   * @returns void
   */
  setToken(token: string): void {
    const cleanToken: string = token.trim();

    if (cleanToken === '') {
      this.clear();
      return;
    }

    sessionStorage.setItem(this.storageKey, cleanToken);
    this.tokenState.set(cleanToken);
  }

  /**
   * Removes the administration token from session storage.
   *
   * @returns void
   */
  clear(): void {
    sessionStorage.removeItem(this.storageKey);
    this.tokenState.set(null);
  }
}
