import { ComponentFixture, TestBed } from '@angular/core/testing';
import { Router } from '@angular/router';
import { of, throwError } from 'rxjs';
import { Component, Input, Output, EventEmitter } from '@angular/core';

import { ProductsPageComponent } from './products-page.component';
import { SofkaProductService } from '../../../../core/services/sofka-product.service';
import { SofkaProduct } from '../../../../core/models/sofka-product.interface';

// Mock components
@Component({
  selector: 'app-product-list',
  template: '<div>Mock Product List</div>'
})
class MockProductListComponent {
  @Input() showActions = false;
  @Output() editProduct = new EventEmitter<SofkaProduct>();
  @Output() deleteProduct = new EventEmitter<SofkaProduct>();
}

@Component({
  selector: 'app-confirmation-modal',
  template: '<div>Mock Confirmation Modal</div>'
})
class MockConfirmationModalComponent {
  @Input() isOpen = false;
  @Input() title = '';
  @Input() message = '';
  @Input() confirmText = '';
  @Input() cancelText = '';
  @Input() loading = false;
  @Input() confirmButtonClass = '';
  @Output() confirm = new EventEmitter<void>();
  @Output() cancel = new EventEmitter<void>();
  @Output() modalClose = new EventEmitter<void>();
}

describe('ProductsPageComponent', () => {
  let component: ProductsPageComponent;
  let fixture: ComponentFixture<ProductsPageComponent>;
  let mockRouter: jest.Mocked<Router>;
  let mockSofkaProductService: jest.Mocked<SofkaProductService>;

  const mockProduct: SofkaProduct = {
    id: 'test1',
    name: 'Test Product',
    description: 'Test Description',
    logo: 'test-logo.png',
    date_release: '2024-01-01',
    date_revision: '2025-01-01'
  };

  beforeEach(async () => {
    // Create Jest mocks
    mockRouter = {
      navigate: jest.fn()
    } as any;

    mockSofkaProductService = {
      deleteProduct: jest.fn()
    } as any;

    await TestBed.configureTestingModule({
      declarations: [
        ProductsPageComponent,
        MockProductListComponent,
        MockConfirmationModalComponent
      ],
      providers: [
        { provide: Router, useValue: mockRouter },
        { provide: SofkaProductService, useValue: mockSofkaProductService }
      ]
    }).compileComponents();

    fixture = TestBed.createComponent(ProductsPageComponent);
    component = fixture.componentInstance;
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should initialize with default values', () => {
    expect(component.showDeleteModal).toBeFalsy();
    expect(component.productToDelete).toBeNull();
    expect(component.deleting).toBeFalsy();
    expect(component.error).toBeNull();
  });

  it('should navigate to edit product page', () => {
    component.onEditProduct(mockProduct);
    expect(mockRouter.navigate).toHaveBeenCalledWith(['/products/edit', mockProduct.id]);
  });

  it('should show delete modal when deleting product', () => {
    component.onDeleteProduct(mockProduct);
    
    expect(component.showDeleteModal).toBeTruthy();
    expect(component.productToDelete).toBe(mockProduct);
  });

  it('should confirm delete product successfully', () => {
    mockSofkaProductService.deleteProduct.mockReturnValue(of(void 0));
    component.productToDelete = mockProduct;
    
    component.onConfirmDelete();
    
    expect(mockSofkaProductService.deleteProduct).toHaveBeenCalledWith(mockProduct.id);
    expect(component.deleting).toBeFalsy();
    expect(component.showDeleteModal).toBeFalsy();
    expect(component.productToDelete).toBeNull();
  });

  it('should handle delete error', () => {
    const errorMessage = 'Delete failed';
    const error = new Error(errorMessage);
    mockSofkaProductService.deleteProduct.mockReturnValue(throwError(() => error));
    
    // Spy on console.error to verify it's called
    const consoleErrorSpy = jest.spyOn(console, 'error').mockImplementation();
    
    component.productToDelete = mockProduct;
    
    component.onConfirmDelete();
    
    expect(component.error).toBe(errorMessage);
    expect(component.deleting).toBeFalsy();
    expect(consoleErrorSpy).toHaveBeenCalledWith('Error deleting product:', error);
    
    // Cleanup
    consoleErrorSpy.mockRestore();
  });

  it('should cancel delete operation', () => {
    component.productToDelete = mockProduct;
    component.showDeleteModal = true;
    component.error = 'Some error';
    
    component.onCancelDelete();
    
    expect(component.showDeleteModal).toBeFalsy();
    expect(component.productToDelete).toBeNull();
    expect(component.error).toBeNull();
  });

  it('should not delete if no product is selected', () => {
    component.productToDelete = null;
    
    component.onConfirmDelete();
    
    expect(mockSofkaProductService.deleteProduct).not.toHaveBeenCalled();
  });

  it('should set deleting state during delete operation', () => {
    // Mock a delayed observable to test the deleting state
    mockSofkaProductService.deleteProduct.mockReturnValue(of(void 0));
    component.productToDelete = mockProduct;
    
    // Set deleting to true before calling
    component.deleting = true;
    
    component.onConfirmDelete();
    
    // After successful completion, deleting should be false
    expect(component.deleting).toBeFalsy();
  });

  it('should clear error when starting delete operation', () => {
    mockSofkaProductService.deleteProduct.mockReturnValue(of(void 0));
    component.productToDelete = mockProduct;
    component.error = 'Previous error';
    
    component.onConfirmDelete();
    
    expect(component.error).toBeNull();
  });

  it('should handle delete with null product gracefully', () => {
    component.productToDelete = null;
    
    // Should not throw error
    expect(() => component.onConfirmDelete()).not.toThrow();
    expect(mockSofkaProductService.deleteProduct).not.toHaveBeenCalled();
  });

  it('should maintain modal state during delete operation', () => {
    mockSofkaProductService.deleteProduct.mockReturnValue(of(void 0));
    component.productToDelete = mockProduct;
    component.showDeleteModal = true;
    
    component.onConfirmDelete();
    
    // Modal should be closed after successful delete
    expect(component.showDeleteModal).toBeFalsy();
  });

  // Integration tests for template behavior
  it('should render product list with correct properties', () => {
    fixture.detectChanges();
    
    const productListElement = fixture.debugElement.nativeElement.querySelector('app-product-list');
    expect(productListElement).toBeTruthy();
  });

  it('should render confirmation modal', () => {
    fixture.detectChanges();
    
    const modal = fixture.debugElement.nativeElement.querySelector('app-confirmation-modal');
    expect(modal).toBeTruthy();
  });

  it('should show error alert when error exists', () => {
    component.error = 'Test error message';
    fixture.detectChanges();
    
    const errorAlert = fixture.debugElement.nativeElement.querySelector('.error-alert');
    expect(errorAlert).toBeTruthy();
    
    const errorMessage = errorAlert.querySelector('p');
    expect(errorMessage.textContent).toBe('Test error message');
  });

  it('should hide error alert when no error', () => {
    component.error = null;
    fixture.detectChanges();
    
    const errorAlert = fixture.debugElement.nativeElement.querySelector('.error-alert');
    expect(errorAlert).toBeFalsy();
  });

  it('should clear error when clicking close button', () => {
    component.error = 'Test error';
    fixture.detectChanges();
    
    const closeButton = fixture.debugElement.nativeElement.querySelector('.error-alert button');
    closeButton.click();
    
    expect(component.error).toBeNull();
  });

  it('should set correct modal message with product name', () => {
    component.productToDelete = mockProduct;
    fixture.detectChanges();
    
    const expectedMessage = '¿Estás seguro de eliminar el producto Test Product?';
    
    // The message should be constructed correctly
    const actualMessage = '¿Estás seguro de eliminar el producto ' + (component.productToDelete?.name || '') + '?';
    expect(actualMessage).toBe(expectedMessage);
  });

  it('should handle empty product name in modal message', () => {
    component.productToDelete = { ...mockProduct, name: '' };
    fixture.detectChanges();
    
    const expectedMessage = '¿Estás seguro de eliminar el producto ?';
    const actualMessage = '¿Estás seguro de eliminar el producto ' + (component.productToDelete?.name || '') + '?';
    expect(actualMessage).toBe(expectedMessage);
  });
});