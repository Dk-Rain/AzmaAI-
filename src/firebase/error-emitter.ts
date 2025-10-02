
import { EventEmitter } from 'events';
import type { FirestorePermissionError } from './errors';

type ErrorEvents = {
  'permission-error': (error: FirestorePermissionError) => void;
};

class ErrorEventEmitter extends EventEmitter {
  emit<T extends keyof ErrorEvents>(event: T, ...args: Parameters<ErrorEvents[T]>): boolean {
    return super.emit(event, ...args);
  }

  on<T extends keyof ErrorEvents>(event: T, listener: ErrorEvents[T]): this {
    return super.on(event, listener);
  }
}

export const errorEmitter = new ErrorEventEmitter();
