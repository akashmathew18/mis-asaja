// dialog.service.ts
import { Injectable } from '@angular/core';
import { BehaviorSubject, Observable } from 'rxjs';

export type DialogType = 'success' | 'error' | 'warning' | 'info';

export interface DialogConfig {
  title: string;
  message: string;
  type: DialogType;
  showCreateAnother?: boolean;
  okText?: string;
  createAnotherText?: string;
  onOk?: () => void;
  onCreateAnother?: () => void;
  onClose?: () => void;
}

@Injectable({
  providedIn: 'root'
})
export class DialogService {
  private visibleSubject = new BehaviorSubject<boolean>(false);
  private configSubject = new BehaviorSubject<DialogConfig | null>(null);

  visible$: Observable<boolean> = this.visibleSubject.asObservable();
  config$: Observable<DialogConfig | null> = this.configSubject.asObservable();

  show(config: DialogConfig): void {
    this.configSubject.next(config);
    this.visibleSubject.next(true);
  }

  close(): void {
    const currentConfig = this.configSubject.value;
    if (currentConfig?.onClose) {
      currentConfig.onClose();
    }
    this.visibleSubject.next(false);
    // Don't clear config immediately to allow exit animation
    setTimeout(() => {
      if (!this.visibleSubject.value) {
        this.configSubject.next(null);
      }
    }, 200);
  }

  // Helper methods for common dialog types
  success(title: string, message: string, options?: Partial<DialogConfig>): void {
    this.show({
      title,
      message,
      type: 'success',
      ...options
    });
  }

  error(title: string, message: string, options?: Partial<DialogConfig>): void {
    this.show({
      title,
      message,
      type: 'error',
      ...options
    });
  }

  warning(title: string, message: string, options?: Partial<DialogConfig>): void {
    this.show({
      title,
      message,
      type: 'warning',
      ...options
    });
  }

  info(title: string, message: string, options?: Partial<DialogConfig>): void {
    this.show({
      title,
      message,
      type: 'info',
      ...options
    });
  }
}