import Store from 'electron-store';

/**
 * Basic wrapper over electron-store. 
 * Allows separating concerns and providing a typed store.
 */
export class LocalState<T extends Record<string, any>> {
  private store: Store<T>;

  constructor(name: string, defaults?: T) {
    this.store = new Store<T>({ name, defaults });
  }

  get<K extends keyof T>(key: K): T[K] {
    return this.store.get(key);
  }

  set<K extends keyof T>(key: K, value: T[K]): void {
    this.store.set(key, value);
  }

  has<K extends keyof T>(key: K): boolean {
    return this.store.has(key);
  }

  delete<K extends keyof T>(key: K): void {
    this.store.delete(key);
  }
  
  clear(): void {
    this.store.clear();
  }
}
