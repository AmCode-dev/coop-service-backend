import { Injectable, MessageEvent } from '@nestjs/common';
import { Observable, Subject } from 'rxjs';
import { filter, map } from 'rxjs/operators';

export interface ProgressEvent {
  sessionId: string;
  step: string;
  message: string;
  progress: number; // 0-100
  status: 'info' | 'success' | 'error' | 'warning';
  data?: unknown;
}

@Injectable()
export class CooperativasProgressService {
  private progressSubject = new Subject<ProgressEvent>();

  emitProgress(event: ProgressEvent): void {
    this.progressSubject.next(event);
  }

  getProgressStream(sessionId: string): Observable<MessageEvent> {
    return this.progressSubject.asObservable().pipe(
      filter((event) => event.sessionId === sessionId),
      map((event) => ({
        data: JSON.stringify(event),
        type: 'progress',
        id: Date.now().toString(),
        retry: 3000,
      })),
    );
  }

  // Métodos helper para diferentes pasos
  emitStepStart(
    sessionId: string,
    step: string,
    message: string,
    progress: number,
  ) {
    this.emitProgress({
      sessionId,
      step,
      message,
      progress,
      status: 'info',
    });
  }

  emitStepSuccess(
    sessionId: string,
    step: string,
    message: string,
    progress: number,
    data?: unknown,
  ) {
    this.emitProgress({
      sessionId,
      step,
      message,
      progress,
      status: 'success',
      data,
    });
  }

  emitStepError(
    sessionId: string,
    step: string,
    message: string,
    progress: number,
    error?: unknown,
  ) {
    this.emitProgress({
      sessionId,
      step,
      message,
      progress,
      status: 'error',
      data: {
        error:
          error && typeof error === 'object' && 'message' in error
            ? (error as { message: string }).message
            : error,
      },
    });
  }
}
