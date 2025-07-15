import { ComponentFixture, TestBed } from '@angular/core/testing';
import { ConfirmationModalComponent } from './confirmation-modal.component';

describe('ConfirmationModalComponent', () => {
  let component: ConfirmationModalComponent;
  let fixture: ComponentFixture<ConfirmationModalComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ConfirmationModalComponent]
    }).compileComponents();

    fixture = TestBed.createComponent(ConfirmationModalComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should emit confirm event when onConfirm is called', () => {
    const confirmSpy = jest.spyOn(component.confirm, 'emit');
    component.onConfirm();
    expect(confirmSpy).toHaveBeenCalled();
  });

  it('should emit cancel event when onCancel is called', () => {
    const cancelSpy = jest.spyOn(component.cancel, 'emit');
    const modalCloseSpy = jest.spyOn(component.modalClose, 'emit');
    
    component.onCancel();
    
    expect(cancelSpy).toHaveBeenCalled();
    expect(modalCloseSpy).toHaveBeenCalled();
  });

  it('should not emit events when loading', () => {
    component.loading = true;
    const confirmSpy = jest.spyOn(component.confirm, 'emit');
    const cancelSpy = jest.spyOn(component.cancel, 'emit');
    
    component.onConfirm();
    component.onCancel();
    
    expect(confirmSpy).not.toHaveBeenCalled();
    expect(cancelSpy).not.toHaveBeenCalled();
  });

  it('should close modal on backdrop click', () => {
    const cancelSpy = jest.spyOn(component.cancel, 'emit');
    const modalCloseSpy = jest.spyOn(component.modalClose, 'emit');
    
    const mockEvent = {
      target: {},
      currentTarget: {}
    } as MouseEvent;
    
    // Mock que target sea igual a currentTarget
    Object.defineProperty(mockEvent, 'target', { value: mockEvent.currentTarget });
    
    component.onBackdropClick(mockEvent);
    
    expect(cancelSpy).toHaveBeenCalled();
    expect(modalCloseSpy).toHaveBeenCalled();
  });

  it('should close modal on escape key', () => {
    const cancelSpy = jest.spyOn(component.cancel, 'emit');
    const modalCloseSpy = jest.spyOn(component.modalClose, 'emit');
    
    const mockEvent = new KeyboardEvent('keydown', { key: 'Escape' });
    
    component.onEscapeKey(mockEvent);
    
    expect(cancelSpy).toHaveBeenCalled();
    expect(modalCloseSpy).toHaveBeenCalled();
  });

  it('should add body class when modal opens', () => {
    component.isOpen = true;
    component.ngOnInit();
    
    expect(document.body.classList.contains('modal-open')).toBe(true);
  });

  it('should remove body class when component destroys', () => {
    document.body.classList.add('modal-open');
    component.ngOnDestroy();
    
    expect(document.body.classList.contains('modal-open')).toBe(false);
  });

  it('should handle modal state changes', () => {
    const addBodyClassSpy = jest.spyOn(component as any, 'addBodyClass');
    const removeBodyClassSpy = jest.spyOn(component as any, 'removeBodyClass');
    
    component.isOpen = true;
    component.ngOnChanges();
    
    expect(addBodyClassSpy).toHaveBeenCalled();
    
    component.isOpen = false;
    component.ngOnChanges();
    
    expect(removeBodyClassSpy).toHaveBeenCalled();
  });

  it('should not close modal when loading during backdrop click', () => {
    component.loading = true;
    const cancelSpy = jest.spyOn(component.cancel, 'emit');
    
    const mockEvent = {
      target: {},
      currentTarget: {}
    } as MouseEvent;
    
    Object.defineProperty(mockEvent, 'target', { value: mockEvent.currentTarget });
    
    component.onBackdropClick(mockEvent);
    
    expect(cancelSpy).not.toHaveBeenCalled();
  });

  it('should not close modal when loading during escape key', () => {
    component.loading = true;
    const cancelSpy = jest.spyOn(component.cancel, 'emit');
    
    const mockEvent = new KeyboardEvent('keydown', { key: 'Escape' });
    
    component.onEscapeKey(mockEvent);
    
    expect(cancelSpy).not.toHaveBeenCalled();
  });
});
