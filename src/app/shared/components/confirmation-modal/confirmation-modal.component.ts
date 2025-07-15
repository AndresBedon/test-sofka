import { Component, Input, Output, EventEmitter, OnInit, OnDestroy } from '@angular/core';

@Component({
  selector: 'app-confirmation-modal',
  templateUrl: './confirmation-modal.component.html',
  styleUrls: ['./confirmation-modal.component.scss']
})
export class ConfirmationModalComponent implements OnInit, OnDestroy {
  @Input() isOpen = false;
  @Input() title = '¿Estás seguro?';
  @Input() message = '';
  @Input() confirmText = 'Confirmar';
  @Input() cancelText = 'Cancelar';
  @Input() confirmButtonClass = 'btn-danger';
  @Input() loading = false;

  @Output() confirm = new EventEmitter<void>();
  @Output() cancel = new EventEmitter<void>();
  @Output() modalClose = new EventEmitter<void>();

  ngOnInit(): void {
    if (this.isOpen) {
      this.addBodyClass();
    }
  }

  ngOnDestroy(): void {
    this.removeBodyClass();
  }

  ngOnChanges(): void {
    if (this.isOpen) {
      this.addBodyClass();
    } else {
      this.removeBodyClass();
    }
  }

  onConfirm(): void {
    if (!this.loading) {
      this.confirm.emit();
    }
  }

  onCancel(): void {
    if (!this.loading) {
      this.cancel.emit();
      this.close();
    }
  }

  onBackdropClick(event: MouseEvent): void {
    if (event.target === event.currentTarget && !this.loading) {
      this.cancel.emit();
      this.close();
    }
  }

  onEscapeKey(event: KeyboardEvent): void {
    if (event.key === 'Escape' && !this.loading) {
      this.cancel.emit();
      this.close();
    }
  }

  private close(): void {
    this.modalClose.emit();
    this.removeBodyClass();
  }

  private addBodyClass(): void {
    document.body.classList.add('modal-open');
  }

  private removeBodyClass(): void {
    document.body.classList.remove('modal-open');
  }
}