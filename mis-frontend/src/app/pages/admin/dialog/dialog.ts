// dialog.component.ts
import { Component, OnInit, OnDestroy, HostListener } from '@angular/core';
import { CommonModule } from '@angular/common';
import { DialogService, DialogConfig, DialogType } from '../../../core/services/admin-dialog.service';
import { Subscription } from 'rxjs';

@Component({
  selector: 'app-dialog',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './dialog.html',
  styleUrls: ['./dialog.css']
})
export class DialogComponent implements OnInit, OnDestroy {
  visible = false;
  config: DialogConfig | null = null;
  private subscriptions: Subscription = new Subscription();

  // Animation state for entry/exit
  animationState = 'hidden';

  constructor(public dialogService: DialogService) { }

  ngOnInit(): void {
    this.subscriptions.add(
      this.dialogService.visible$.subscribe(visible => {
        if (visible) {
          this.visible = true;
          // Trigger enter animation after next tick
          queueMicrotask(() => {
            this.animationState = 'visible';
          });
        } else {
          this.animationState = 'hidden';
          // Wait for animation to complete before hiding
          setTimeout(() => {
            this.visible = false;
          }, 200);
        }
      })
    );

    this.subscriptions.add(
      this.dialogService.config$.subscribe(config => {
        this.config = config;
      })
    );
  }

  ngOnDestroy(): void {
    this.subscriptions.unsubscribe();
  }

  getIconForType(type: DialogType): string {
    const icons = {
      success: '✓',
      error: '✗',
      warning: '⚠',
      info: 'ℹ'
    };
    return icons[type] || 'ℹ';
  }

  getHeaderClass(): string {
    if (!this.config) return '';
    return `dialog-header-${this.config.type}`;
  }

  onOk(): void {
    if (this.config?.onOk) {
      this.config.onOk();
    }
    this.dialogService.close();
  }

  onCreateAnother(): void {
    if (this.config?.onCreateAnother) {
      this.config.onCreateAnother();
    }
    // Dialog stays open for "Create Another" actions
    // Parent can close manually via service if needed
  }

  onClose(): void {
    this.dialogService.close();
  }

  @HostListener('document:keydown.escape', ['$event'])
  handleEscapeKey(event: Event): void {
    if (!(event instanceof KeyboardEvent)) {
      return;
    }

    if (this.visible) {
      this.onClose();
    }
  }

  onBackdropClick(event: MouseEvent): void {
    // Close only if clicking the backdrop itself, not the modal content
    if ((event.target as HTMLElement).classList.contains('dialog-overlay')) {
      this.onClose();
    }
  }
}