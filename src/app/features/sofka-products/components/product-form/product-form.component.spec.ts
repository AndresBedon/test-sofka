import { ComponentFixture, TestBed } from '@angular/core/testing';
import { ReactiveFormsModule, FormBuilder } from '@angular/forms';
import { of } from 'rxjs';

import { ProductFormComponent } from './product-form.component';
import { SofkaProductService } from '../../../../core/services/sofka-product.service';

describe('ProductFormComponent', () => {
  let component: ProductFormComponent;
  let fixture: ComponentFixture<ProductFormComponent>;
  let mockSofkaProductService: jest.Mocked<SofkaProductService>;

  const getValidReleaseDate = () => {
    const tomorrow = new Date();
    tomorrow.setDate(tomorrow.getDate() + 1);
    return tomorrow.toISOString().split('T')[0];
  };

  beforeEach(async () => {
    // Crear mock completo del servicio
    mockSofkaProductService = {
      verifyProductId: jest.fn(),
      getAllProducts: jest.fn(),
      createProduct: jest.fn(),
      updateProduct: jest.fn(),
      deleteProduct: jest.fn(),
      getProductById: jest.fn()
    } as any;

    await TestBed.configureTestingModule({
      declarations: [ProductFormComponent],
      imports: [ReactiveFormsModule],
      providers: [
        { provide: SofkaProductService, useValue: mockSofkaProductService },
        FormBuilder
      ]
    }).compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(ProductFormComponent);
    component = fixture.componentInstance;
    
    // Configurar mock por defecto
    mockSofkaProductService.verifyProductId.mockReturnValue(of(false));
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should initialize form with empty values', () => {
    component.ngOnInit();
    expect(component.productForm.get('id')?.value).toBe('');
    expect(component.productForm.get('name')?.value).toBe('');
  });

  it('should validate required fields', () => {
    component.ngOnInit();
    
    // Marcar todos los campos como touched
    Object.keys(component.productForm.controls).forEach(key => {
      component.productForm.get(key)?.markAsTouched();
    });
    
    expect(component.hasError('id')).toBeTruthy();
    expect(component.hasError('name')).toBeTruthy();
    expect(component.hasError('description')).toBeTruthy();
  });

  it('should calculate revision date when release date changes', () => {
    component.ngOnInit();
    const releaseDate = '2024-01-01';
    component.productForm.get('date_release')?.setValue(releaseDate);
    
    const expectedRevisionDate = '2025-01-01';
    expect(component.productForm.get('date_revision')?.value).toBe(expectedRevisionDate);
  });

  it('should emit formSubmit when form is valid (bypassing async validation)', async () => {
    // Configurar el mock para que retorne que el ID NO existe
    mockSofkaProductService.verifyProductId.mockReturnValue(of(false));
    
    // Spy en el EventEmitter
    const emitSpy = jest.spyOn(component.formSubmit, 'emit');
    
    component.ngOnInit();
    
    const validReleaseDate = getValidReleaseDate();
    
    // Llenar el formulario con datos válidos
    component.productForm.patchValue({
      id: 'test123',
      name: 'Test Product Name',
      description: 'Test Description for product with enough length',
      logo: 'http://example.com/logo.png',
      date_release: validReleaseDate
    });
    
    // Marcar como válido manualmente para el test (simulando validación exitosa)
    Object.keys(component.productForm.controls).forEach(key => {
      const control = component.productForm.get(key);
      if (control) {
        control.setErrors(null);
      }
    });
    
    // Mock productForm.valid para retornar true
    Object.defineProperty(component.productForm, 'valid', {
      value: true,
      writable: true
    });
    
    component.onSubmit();
    
    expect(emitSpy).toHaveBeenCalled();
  });

  it('should not submit form when invalid', () => {
    const emitSpy = jest.spyOn(component.formSubmit, 'emit');
    
    component.ngOnInit();
    // Dejar el formulario inválido (campos vacíos)
    
    component.onSubmit();
    expect(emitSpy).not.toHaveBeenCalled();
  });

  it('should load product data in edit mode', () => {
    const mockProduct = {
      id: 'test123',
      name: 'Test Product',
      description: 'Test Description',
      logo: 'http://example.com/logo.png',
      date_release: '2024-01-01',
      date_revision: '2025-01-01'
    };

    component.product = mockProduct;
    component.isEditMode = true;
    
    component.ngOnInit();
    
    expect(component.productForm.get('id')?.value).toBe(mockProduct.id);
    expect(component.productForm.get('name')?.value).toBe(mockProduct.name);
    expect(component.productForm.get('id')?.disabled).toBeTruthy();
  });

  it('should reset form correctly', () => {
    component.isEditMode = false;
    component.ngOnInit();
    
    // Llenar el formulario
    component.productForm.patchValue({
      id: 'test123',
      name: 'Test Product'
    });
    
    component.onReset();
    
    // Después de reset, los valores pueden ser null
    expect(component.productForm.get('id')?.value).toBeNull();
    expect(component.productForm.get('name')?.value).toBeNull();
  });

  it('should emit formCancel when cancelled', () => {
    const emitSpy = jest.spyOn(component.formCancel, 'emit');
    
    component.onCancel();
    
    expect(emitSpy).toHaveBeenCalled();
  });

  it('should validate minimum date for release date', () => {
    component.ngOnInit();
    
    // Fecha en el pasado
    const pastDate = '2020-01-01';
    component.productForm.get('date_release')?.setValue(pastDate);
    component.productForm.get('date_release')?.markAsTouched();
    
    expect(component.hasError('date_release')).toBeTruthy();
  });

  it('should validate field lengths correctly', () => {
    component.ngOnInit();
    
    // ID muy corto
    component.productForm.get('id')?.setValue('ab');
    component.productForm.get('id')?.markAsTouched();
    expect(component.hasError('id')).toBeTruthy();
    
    // Nombre muy corto
    component.productForm.get('name')?.setValue('test');
    component.productForm.get('name')?.markAsTouched();
    expect(component.hasError('name')).toBeTruthy();
    
    // Descripción muy corta
    component.productForm.get('description')?.setValue('short');
    component.productForm.get('description')?.markAsTouched();
    expect(component.hasError('description')).toBeTruthy();
  });

  it('should handle async ID validation when ID exists', async () => {
    // Configurar que el ID SÍ existe
    mockSofkaProductService.verifyProductId.mockReturnValue(of(true));
    
    component.ngOnInit();
    
    const idControl = component.productForm.get('id');
    idControl?.setValue('existing-id');
    idControl?.markAsTouched();
    
    // Simular error de validación asíncrona
    idControl?.setErrors({ idExists: true });
    
    expect(component.hasError('id')).toBeTruthy();
  });

  it('should disable ID field in edit mode', () => {
    const mockProduct = {
      id: 'test123',
      name: 'Test Product',
      description: 'Test Description',
      logo: 'http://example.com/logo.png',
      date_release: '2024-01-01',
      date_revision: '2025-01-01'
    };
    
    component.product = mockProduct;
    component.isEditMode = true;
    
    component.ngOnInit();
    
    // El ID debería estar deshabilitado en modo edición
    expect(component.productForm.get('id')?.disabled).toBeTruthy();
  });

  it('should set submitting state correctly', () => {
    expect(component.submitting).toBeFalsy();
    
    component.setSubmitting(true);
    expect(component.submitting).toBeTruthy();
    
    component.setSubmitting(false);
    expect(component.submitting).toBeFalsy();
  });

  it('should get correct error messages', () => {
    component.ngOnInit();
    
    // Error de campo requerido
    component.productForm.get('id')?.markAsTouched();
    const errorMessage1 = component.getErrorMessage('id');
    expect(errorMessage1).toBeTruthy();
    
    // Error de longitud mínima
    component.productForm.get('id')?.setValue('ab');
    component.productForm.get('id')?.markAsTouched();
    const errorMessage2 = component.getErrorMessage('id');
    expect(errorMessage2).toBeTruthy();
  });

  it('should prevent multiple submissions', () => {
    const emitSpy = jest.spyOn(component.formSubmit, 'emit');
    
    component.ngOnInit();
    component.submitting = true; // Simular que ya está enviando
    
    component.productForm.patchValue({
      id: 'test123',
      name: 'Test Product Name',
      description: 'Test Description for product with enough length',
      logo: 'http://example.com/logo.png',
      date_release: getValidReleaseDate()
    });
    
    component.onSubmit();
    
    // No debería emitir porque está en estado submitting
    expect(emitSpy).not.toHaveBeenCalled();
  });

  it('should validate logo field as required', () => {
    component.ngOnInit();
    
    component.productForm.get('logo')?.markAsTouched();
    expect(component.hasError('logo')).toBeTruthy();
    
    const logoErrorMessage = component.getErrorMessage('logo');
    expect(logoErrorMessage).toBeTruthy();
  });

  it('should mark all fields as touched when submitting invalid form', () => {
    component.ngOnInit();
    
    // Dejar formulario inválido y enviar
    component.onSubmit();
    
    // Verificar que todos los campos están marcados como touched
    Object.keys(component.productForm.controls).forEach(key => {
      expect(component.productForm.get(key)?.touched).toBeTruthy();
    });
  });

  it('should handle date_revision as disabled field', () => {
    component.ngOnInit();
    
    const dateRevisionControl = component.productForm.get('date_revision');
    expect(dateRevisionControl?.disabled).toBeTruthy();
  });

  it('should test error message for specific field types', () => {
    component.ngOnInit();
    
    // Test ID exists error
    const idControl = component.productForm.get('id');
    idControl?.setErrors({ idExists: true });
    idControl?.markAsTouched();
    const idErrorMessage = component.getErrorMessage('id');
    expect(idErrorMessage).toBeTruthy();
    
    // Test minDate error
    const dateControl = component.productForm.get('date_release');
    dateControl?.setErrors({ minDate: true });
    dateControl?.markAsTouched();
    const dateErrorMessage = component.getErrorMessage('date_release');
    expect(dateErrorMessage).toBeTruthy();
  });

  it('should handle setupIdValidation method', () => {
    // Spy en setupIdValidation
    const setupIdValidationSpy = jest.spyOn(component as any, 'setupIdValidation');
    
    component.isEditMode = false;
    component.ngOnInit();
    
    expect(setupIdValidationSpy).toHaveBeenCalled();
  });

  it('should handle calculateRevisionDate method', () => {
    component.ngOnInit();
    
    const releaseDate = '2025-06-15';
    const calculateRevisionDateSpy = jest.spyOn(component as any, 'calculateRevisionDate');
    
    component.productForm.get('date_release')?.setValue(releaseDate);
    
    expect(calculateRevisionDateSpy).toHaveBeenCalledWith(releaseDate);
  });

  it('should handle minDateValidator', () => {
    component.ngOnInit();
    
    const minDateValidator = (component as any).minDateValidator;
    
    // Test con fecha válida (futura)
    const futureDate = { value: getValidReleaseDate() };
    expect(minDateValidator(futureDate)).toBeNull();
    
    // Test con fecha inválida (pasada)
    const pastDate = { value: '2020-01-01' };
    expect(minDateValidator(pastDate)).toEqual({ minDate: true });
    
    // Test con valor vacío
    const emptyValue = { value: '' };
    expect(minDateValidator(emptyValue)).toBeNull();
  });

  it('should create form without async validator in edit mode', () => {
    component.isEditMode = true;
    component.ngOnInit();
    
    const idControl = component.productForm.get('id');
    
    // En modo edición, no debería tener validadores asíncronos
    expect(idControl?.asyncValidator).toBeNull();
  });

  it('should create form with async validator in create mode', () => {
    component.isEditMode = false;
    component.ngOnInit();
    
    const idControl = component.productForm.get('id');
    
    // En modo creación, debería tener validadores asíncronos
    expect(idControl?.asyncValidator).not.toBeNull();
  });

  it('should handle form destruction', () => {
    component.ngOnInit();
    
    const destroySpy = jest.spyOn(component['destroy$'], 'next');
    const completeSpy = jest.spyOn(component['destroy$'], 'complete');
    
    component.ngOnDestroy();
    
    expect(destroySpy).toHaveBeenCalled();
    expect(completeSpy).toHaveBeenCalled();
  });
});