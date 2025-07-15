import { ComponentFixture, TestBed } from '@angular/core/testing';
import { Router } from '@angular/router';
import { of, throwError } from 'rxjs';
import { Component, Input, Output, EventEmitter } from '@angular/core';

import { AddProductPageComponent } from './add-product-page.component';
import { SofkaProductService } from '../../../../core/services/sofka-product.service';
import { ProductFormData, SofkaProduct } from '../../../../core/models/sofka-product.interface';

// Mock component for app-product-form
@Component({
  selector: 'app-product-form',
  template: '<div>Mock Product Form</div>'
})
class MockProductFormComponent {
  @Input() product: SofkaProduct | null = null;
  @Input() isEditMode = false;
  @Output() formSubmit = new EventEmitter<ProductFormData>();
  @Output() formCancel = new EventEmitter<void>();
}

describe('AddProductPageComponent', () => {
  let component: AddProductPageComponent;
  let fixture: ComponentFixture<AddProductPageComponent>;
  let mockRouter: jest.Mocked<Router>;
  let mockSofkaProductService: jest.Mocked<SofkaProductService>;

  const mockFormData: ProductFormData = {
    id: 'test1',
    name: 'Test Product',
    description: 'Test Description',
    logo: 'test-logo.png',
    date_release: '2024-01-01',
    date_revision: '2025-01-01'
  };

  const mockProduct: SofkaProduct = { ...mockFormData };

  beforeEach(async () => {
    // Create Jest mocks
    mockRouter = {
      navigate: jest.fn()
    } as any;

    mockSofkaProductService = {
      createProduct: jest.fn()
    } as any;

    await TestBed.configureTestingModule({
      declarations: [
        AddProductPageComponent,
        MockProductFormComponent
      ],
      providers: [
        { provide: Router, useValue: mockRouter },
        { provide: SofkaProductService, useValue: mockSofkaProductService }
      ]
    }).compileComponents();

    fixture = TestBed.createComponent(AddProductPageComponent);
    component = fixture.componentInstance;
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should initialize with default values', () => {
    expect(component.submitting).toBeFalsy();
    expect(component.error).toBeNull();
  });

  it('should create product successfully', () => {
    mockSofkaProductService.createProduct.mockReturnValue(of(mockProduct));
    
    // Spy on console.log
    const consoleLogSpy = jest.spyOn(console, 'log').mockImplementation();
    
    component.onFormSubmit(mockFormData);
    
    expect(mockSofkaProductService.createProduct).toHaveBeenCalledWith(mockFormData);
    expect(mockRouter.navigate).toHaveBeenCalledWith(['/products']);
    expect(consoleLogSpy).toHaveBeenCalledWith('Product created successfully:', mockProduct);
    
    // Cleanup
    consoleLogSpy.mockRestore();
  });

  it('should handle create error', () => {
    const errorMessage = 'Create failed';
    const error = new Error(errorMessage);
    mockSofkaProductService.createProduct.mockReturnValue(throwError(() => error));
    
    // Spy on console.error
    const consoleErrorSpy = jest.spyOn(console, 'error').mockImplementation();
    
    component.onFormSubmit(mockFormData);
    
    expect(component.error).toBe(errorMessage);
    expect(component.submitting).toBeFalsy();
    expect(consoleErrorSpy).toHaveBeenCalledWith('Error creating product:', error);
    
    // Cleanup
    consoleErrorSpy.mockRestore();
  });

  it('should navigate to products page on cancel', () => {
    component.onFormCancel();
    expect(mockRouter.navigate).toHaveBeenCalledWith(['/products']);
  });

  it('should set submitting state during form submission', () => {
    mockSofkaProductService.createProduct.mockReturnValue(of(mockProduct));
    
    component.onFormSubmit(mockFormData);
    
    expect(component.submitting).toBeTruthy();
    expect(component.error).toBeNull();
  });

  it('should clear error when starting new submission', () => {
    // Set previous error
    component.error = 'Previous error';
    mockSofkaProductService.createProduct.mockReturnValue(of(mockProduct));
    
    component.onFormSubmit(mockFormData);
    
    expect(component.error).toBeNull();
  });

  it('should handle form submission with different data', () => {
    const differentFormData: ProductFormData = {
      id: 'test2',
      name: 'Different Product',
      description: 'Different Description',
      logo: 'different-logo.png',
      date_release: '2024-02-01',
      date_revision: '2025-02-01'
    };
    
    const differentProduct: SofkaProduct = { ...differentFormData };
    mockSofkaProductService.createProduct.mockReturnValue(of(differentProduct));
    
    component.onFormSubmit(differentFormData);
    
    expect(mockSofkaProductService.createProduct).toHaveBeenCalledWith(differentFormData);
    expect(mockRouter.navigate).toHaveBeenCalledWith(['/products']);
  });

  it('should handle multiple form submissions', () => {
    // First submission - success
    mockSofkaProductService.createProduct.mockReturnValue(of(mockProduct));
    component.onFormSubmit(mockFormData);
    
    expect(mockSofkaProductService.createProduct).toHaveBeenCalledWith(mockFormData);
    expect(mockRouter.navigate).toHaveBeenCalledWith(['/products']);
    
    // Reset mocks
    mockSofkaProductService.createProduct.mockClear();
    mockRouter.navigate.mockClear();
    
    // Second submission - error
    const error = new Error('Second submission failed');
    mockSofkaProductService.createProduct.mockReturnValue(throwError(() => error));
    
    component.onFormSubmit(mockFormData);
    
    expect(component.error).toBe('Second submission failed');
    expect(component.submitting).toBeFalsy();
  });

  it('should handle network errors correctly', () => {
    const networkError = new Error('Network connection failed');
    mockSofkaProductService.createProduct.mockReturnValue(throwError(() => networkError));
    
    component.onFormSubmit(mockFormData);
    
    expect(component.error).toBe('Network connection failed');
    expect(component.submitting).toBeFalsy();
  });

  it('should handle server errors correctly', () => {
    const serverError = new Error('Internal server error');
    mockSofkaProductService.createProduct.mockReturnValue(throwError(() => serverError));
    
    component.onFormSubmit(mockFormData);
    
    expect(component.error).toBe('Internal server error');
    expect(component.submitting).toBeFalsy();
  });

  it('should maintain correct state during successful submission flow', () => {
    mockSofkaProductService.createProduct.mockReturnValue(of(mockProduct));
    
    // Initial state
    expect(component.submitting).toBeFalsy();
    expect(component.error).toBeNull();
    
    // During submission
    component.onFormSubmit(mockFormData);
    
    // State during submission
    expect(component.submitting).toBeTruthy();
    expect(component.error).toBeNull();
    
    // Navigation should occur
    expect(mockRouter.navigate).toHaveBeenCalledWith(['/products']);
  });

  it('should handle empty form data', () => {
    const emptyFormData: ProductFormData = {
      id: '',
      name: '',
      description: '',
      logo: '',
      date_release: '',
      date_revision: ''
    };
    
    const emptyProduct: SofkaProduct = { ...emptyFormData };
    mockSofkaProductService.createProduct.mockReturnValue(of(emptyProduct));
    
    component.onFormSubmit(emptyFormData);
    
    expect(mockSofkaProductService.createProduct).toHaveBeenCalledWith(emptyFormData);
    expect(mockRouter.navigate).toHaveBeenCalledWith(['/products']);
  });

  // Template-related logic tests (without DOM manipulation)
  it('should have correct properties for template rendering', () => {
    // Test initial state
    expect(component.submitting).toBeFalsy();
    expect(component.error).toBeNull();
    
    // Test submitting state
    component.submitting = true;
    expect(component.submitting).toBeTruthy();
    
    // Test error state
    component.error = 'Test error';
    expect(component.error).toBe('Test error');
  });

  it('should handle form data with special characters', () => {
    const specialFormData: ProductFormData = {
      id: 'test-1',
      name: 'Product with "quotes" & symbols',
      description: 'Description with <html> & special chars',
      logo: 'https://example.com/logo-with-special_chars.png',
      date_release: '2024-01-01',
      date_revision: '2025-01-01'
    };
    
    const specialProduct: SofkaProduct = { ...specialFormData };
    mockSofkaProductService.createProduct.mockReturnValue(of(specialProduct));
    
    component.onFormSubmit(specialFormData);
    
    expect(mockSofkaProductService.createProduct).toHaveBeenCalledWith(specialFormData);
    expect(mockRouter.navigate).toHaveBeenCalledWith(['/products']);
  });

  it('should handle concurrent form submissions', () => {
    // First submission still in progress
    component.submitting = true;
    component.error = null;
    
    mockSofkaProductService.createProduct.mockReturnValue(of(mockProduct));
    
    component.onFormSubmit(mockFormData);
    
    // Should still process the submission
    expect(mockSofkaProductService.createProduct).toHaveBeenCalledWith(mockFormData);
  });

  it('should reset error state on new submission attempt', () => {
    // Set initial error state
    component.error = 'Previous submission failed';
    component.submitting = false;
    
    mockSofkaProductService.createProduct.mockReturnValue(of(mockProduct));
    
    component.onFormSubmit(mockFormData);
    
    // Error should be cleared
    expect(component.error).toBeNull();
    expect(component.submitting).toBeTruthy();
  });
});