import { Service, signal, Signal } from '@angular/core';

@Service()
export default class TokenStorageService {
  private readonly storageKey: string = 'tpv-backup-admin-token';
  private readonly tokenState = signal<string | null>(sessionStorage.getItem(this.storageKey));

  readonly token: Signal<string | null> = this.tokenState.asReadonly();

  setToken(token: string): void {
    sessionStorage.setItem(this.storageKey, token);
    this.tokenState.set(token);
  }

  clear(): void {
    sessionStorage.removeItem(this.storageKey);
    this.tokenState.set(null);
  }
}
