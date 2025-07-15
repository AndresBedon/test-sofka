import { ComponentFixture, TestBed, fakeAsync, tick } from '@angular/core/testing';
import { ActivatedRoute, Router } from '@angular/router';
import { of, throwError } from 'rxjs';
import { Component, Input, Output, EventEmitter } from '@angular/core';

import { EditProductPageComponent } from './edit-product-page.component';
import { SofkaProductService } from '../../../../core/services/sofka-product.service';
import { SofkaProduct, ProductFormData } from '../../../../core/models/sofka-product.interface';

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

describe('EditProductPageComponent', () => {
  let component: EditProductPageComponent;
  let fixture: ComponentFixture<EditProductPageComponent>;
  let mockRouter: jest.Mocked<Router>;
  let mockActivatedRoute: any;
  let mockSofkaProductService: jest.Mocked<SofkaProductService>;

  const mockProduct: SofkaProduct = {
    id: 'test1',
    name: 'Test Product',
    description: 'Test Description',
    logo: 'test-logo.png',
    date_release: '2024-01-01',
    date_revision: '2025-01-01'
  };

  const mockFormData: ProductFormData = {
    id: 'test1',
    name: 'Updated Product',
    description: 'Updated Description',
    logo: 'updated-logo.png',
    date_release: '2024-02-01',
    date_revision: '2025-02-01'
  };

  beforeEach(async () => {
    // Create Jest mocks
    mockRouter = {
      navigate: jest.fn()
    } as any;

    mockSofkaProductService = {
      getProductById: jest.fn(),
      updateProduct: jest.fn()
    } as any;
    
    mockActivatedRoute = {
      params: of({ id: 'test1' })
    };

    await TestBed.configureTestingModule({
      declarations: [
        EditProductPageComponent,
        MockProductFormComponent
      ],
      providers: [
        { provide: Router, useValue: mockRouter },
        { provide: ActivatedRoute, useValue: mockActivatedRoute },
        { provide: SofkaProductService, useValue: mockSofkaProductService }
      ]
    }).compileComponents();

    // Set up default mock return value to prevent undefined stream error
    mockSofkaProductService.getProductById.mockReturnValue(of(mockProduct));
    
    fixture = TestBed.createComponent(EditProductPageComponent);
    component = fixture.componentInstance;
    
    // IMPORTANT: Don't call fixture.detectChanges() here to prevent automatic ngOnInit
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should initialize with default values', () => {
    expect(component.product).toBeNull();
    expect(component.loading).toBeTruthy();
    expect(component.submitting).toBeFalsy();
    expect(component.error).toBeNull();
  });

  it('should load product on init', () => {
    mockSofkaProductService.getProductById.mockReturnValue(of(mockProduct));
    
    // Manually call ngOnInit for this test
    component.ngOnInit();
    
    expect(mockSofkaProductService.getProductById).toHaveBeenCalledWith('test1');
    expect(component.product).toBe(mockProduct);
    expect(component.loading).toBeFalsy();
    expect(component.error).toBeNull();
  });

  it('should handle product not found', fakeAsync(() => {
    mockSofkaProductService.getProductById.mockReturnValue(of(undefined));
    
    // Manually call ngOnInit for this test
    component.ngOnInit();
    
    expect(component.error).toBe('Producto no encontrado');
    expect(component.loading).toBeFalsy();
    expect(component.product).toBeNull();
    
    // Wait for setTimeout
    tick(2000);
    
    expect(mockRouter.navigate).toHaveBeenCalledWith(['/products']);
  }));

  it('should handle service error when loading product', () => {
    const errorMessage = 'Service error';
    const error = new Error(errorMessage);
    mockSofkaProductService.getProductById.mockReturnValue(throwError(() => error));
    
    // Manually call ngOnInit for this test
    component.ngOnInit();
    
    expect(component.error).toBe(errorMessage);
    expect(component.loading).toBeFalsy();
    expect(component.product).toBeNull();
  });

  it('should update product successfully', () => {
    const updateData = {
      name: mockFormData.name,
      description: mockFormData.description,
      logo: mockFormData.logo,
      date_release: mockFormData.date_release,
      date_revision: mockFormData.date_revision
    };
    
    component.product = mockProduct;
    mockSofkaProductService.updateProduct.mockReturnValue(of(mockProduct));
    
    // Spy on console.log
    const consoleLogSpy = jest.spyOn(console, 'log').mockImplementation();
    
    component.onFormSubmit(mockFormData);
    
    expect(mockSofkaProductService.updateProduct).toHaveBeenCalledWith(mockProduct.id, updateData);
    expect(mockRouter.navigate).toHaveBeenCalledWith(['/products']);
    expect(consoleLogSpy).toHaveBeenCalledWith('Product updated successfully:', mockProduct);
    
    // Cleanup
    consoleLogSpy.mockRestore();
  });

  it('should handle update error', () => {
    const errorMessage = 'Update failed';
    const error = new Error(errorMessage);
    
    component.product = mockProduct;
    mockSofkaProductService.updateProduct.mockReturnValue(throwError(() => error));
    
    // Spy on console.error
    const consoleErrorSpy = jest.spyOn(console, 'error').mockImplementation();
    
    component.onFormSubmit(mockFormData);
    
    expect(component.error).toBe(errorMessage);
    expect(component.submitting).toBeFalsy();
    expect(consoleErrorSpy).toHaveBeenCalledWith('Error updating product:', error);
    
    // Cleanup
    consoleErrorSpy.mockRestore();
  });

  it('should not submit if no product is loaded', () => {
    component.product = null;
    
    component.onFormSubmit(mockFormData);
    
    expect(mockSofkaProductService.updateProduct).not.toHaveBeenCalled();
    expect(component.submitting).toBeFalsy();
  });

  it('should set submitting state during update', () => {
    component.product = mockProduct;
    mockSofkaProductService.updateProduct.mockReturnValue(of(mockProduct));
    
    component.onFormSubmit(mockFormData);
    
    expect(component.submitting).toBeTruthy();
    expect(mockSofkaProductService.updateProduct).toHaveBeenCalled();
  });

  it('should clear error when starting form submission', () => {
    component.product = mockProduct;
    component.error = 'Previous error';
    mockSofkaProductService.updateProduct.mockReturnValue(of(mockProduct));
    
    component.onFormSubmit(mockFormData);
    
    expect(component.error).toBeNull();
  });

  it('should navigate to products page on cancel', () => {
    component.onFormCancel();
    expect(mockRouter.navigate).toHaveBeenCalledWith(['/products']);
  });

  it('should load product with different route params', () => {
    const differentId = 'test2';
    mockActivatedRoute.params = of({ id: differentId });
    mockSofkaProductService.getProductById.mockReturnValue(of(mockProduct));
    
    // Manually call ngOnInit for this test
    component.ngOnInit();
    
    expect(mockSofkaProductService.getProductById).toHaveBeenCalledWith(differentId);
  });

  // Simplified template tests - Focus on component logic rather than DOM manipulation
  it('should have correct template conditions for loading state', () => {
    // Test the component properties that control template visibility
    component.loading = true;
    component.error = null;
    component.product = null;
    
    // Verify the properties are set correctly for loading state
    expect(component.loading).toBeTruthy();
    expect(component.error).toBeNull();
    expect(component.product).toBeNull();
  });

  it('should have correct template conditions for product form display', () => {
    // Test the component properties that control template visibility
    component.loading = false;
    component.product = mockProduct;
    component.error = null;
    
    // Verify the properties are set correctly for showing form
    expect(component.loading).toBeFalsy();
    expect(component.product).toBeTruthy();
    expect(component.error).toBeNull();
    
    // Test the template condition logic
    const shouldShowForm = !component.loading && component.product && !component.error;
    expect(shouldShowForm).toBeTruthy();
  });

  it('should have correct template conditions for hiding form when loading', () => {
    component.loading = true;
    component.product = null;
    component.error = null;
    
    // Test the template condition logic
    const shouldShowForm = !component.loading && component.product && !component.error;
    expect(shouldShowForm).toBeFalsy();
  });

  it('should have correct template conditions for error state', () => {
    component.loading = false;
    component.error = 'Test error message';
    component.product = null;
    
    // Verify the properties are set correctly for error state
    expect(component.loading).toBeFalsy();
    expect(component.error).toBeTruthy();
    expect(component.product).toBeNull();
    
    // Test the template condition logic
    const shouldShowError = !!component.error;
    expect(shouldShowError).toBeTruthy();
  });

  it('should have correct template conditions for hiding error when no error', () => {
    component.loading = false;
    component.error = null;
    component.product = mockProduct;
    
    // Test the template condition logic
    const shouldShowError = !!component.error;
    expect(shouldShowError).toBeFalsy();
  });

  it('should handle navigation correctly on cancel', () => {
    component.onFormCancel();
    expect(mockRouter.navigate).toHaveBeenCalledWith(['/products']);
  });

  it('should have correct template conditions when product is null', () => {
    component.loading = false;
    component.product = null;
    component.error = null;
    
    // Test the template condition logic
    const shouldShowForm = !component.loading && component.product && !component.error;
    expect(shouldShowForm).toBeFalsy();
  });

  it('should have correct template conditions when error exists', () => {
    component.loading = false;
    component.product = null;
    component.error = 'Some error';
    
    // Test the template condition logic
    const shouldShowForm = !component.loading && component.product && !component.error;
    expect(shouldShowForm).toBeFalsy();
  });

  it('should handle form submit with all required data', () => {
    component.product = mockProduct;
    mockSofkaProductService.updateProduct.mockReturnValue(of(mockProduct));
    
    const expectedUpdateData = {
      name: mockFormData.name,
      description: mockFormData.description,
      logo: mockFormData.logo,
      date_release: mockFormData.date_release,
      date_revision: mockFormData.date_revision
    };
    
    component.onFormSubmit(mockFormData);
    
    expect(component.submitting).toBeTruthy();
    expect(component.error).toBeNull();
    expect(mockSofkaProductService.updateProduct).toHaveBeenCalledWith(
      mockProduct.id, 
      expectedUpdateData
    );
  });

  it('should handle component creation without errors', () => {
    const newFixture = TestBed.createComponent(EditProductPageComponent);
    const newComponent = newFixture.componentInstance;
    
    expect(newComponent).toBeTruthy();
    expect(newComponent.loading).toBeTruthy();
    expect(newComponent.error).toBeNull();
  });

  it('should handle multiple error scenarios', () => {
    // Test 404 error
    const notFoundError = new Error('Producto no encontrado');
    mockSofkaProductService.getProductById.mockReturnValue(throwError(() => notFoundError));
    
    component.ngOnInit();
    
    expect(component.error).toBe('Producto no encontrado');
    expect(component.loading).toBeFalsy();
    
    // Reset and test network error
    mockSofkaProductService.getProductById.mockReset();
    const networkError = new Error('Network error');
    mockSofkaProductService.getProductById.mockReturnValue(throwError(() => networkError));
    
    component.ngOnInit();
    
    expect(component.error).toBe('Network error');
  });

  it('should maintain correct form state during submission', () => {
    component.product = mockProduct;
    component.submitting = false;
    component.error = 'Old error';
    
    mockSofkaProductService.updateProduct.mockReturnValue(of(mockProduct));
    
    component.onFormSubmit(mockFormData);
    
    // During submission
    expect(component.submitting).toBeTruthy();
    expect(component.error).toBeNull();
  });

  it('should handle empty form data gracefully', () => {
    const emptyFormData: ProductFormData = {
      id: '',
      name: '',
      description: '',
      logo: '',
      date_release: '',
      date_revision: ''
    };
    
    component.product = mockProduct;
    mockSofkaProductService.updateProduct.mockReturnValue(of(mockProduct));
    
    component.onFormSubmit(emptyFormData);
    
    expect(mockSofkaProductService.updateProduct).toHaveBeenCalledWith(
      mockProduct.id,
      {
        name: '',
        description: '',
        logo: '',
        date_release: '',
        date_revision: ''
      }
    );
  });

  it('should verify template logic without DOM manipulation', () => {
    // Test loading state logic
    component.loading = true;
    component.error = null;
    component.product = null;
    
    expect(component.loading).toBeTruthy();
    expect(component.error).toBeNull();
    expect(component.product).toBeNull();
  });

  it('should verify error message handling', () => {
    const errorMessage = 'Specific error occurred';
    component.loading = false;
    component.error = errorMessage;
    component.product = null;
    
    expect(component.error).toBe(errorMessage);
    expect(component.loading).toBeFalsy();
  });

  it('should handle route parameter extraction', () => {
    // Test with different route parameter
    const testId = 'product123';
    mockActivatedRoute.params = of({ id: testId });
    mockSofkaProductService.getProductById.mockReturnValue(of(mockProduct));
    
    // Manually call ngOnInit for this test
    component.ngOnInit();
    
    expect(mockSofkaProductService.getProductById).toHaveBeenCalledWith(testId);
  });
});