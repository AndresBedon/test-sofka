import { Component, OnInit, Input, Output, EventEmitter, OnDestroy } from '@angular/core';
import { FormBuilder, FormGroup, Validators, AbstractControl, ValidationErrors } from '@angular/forms';
import { of, Subject, Observable } from 'rxjs';
import { takeUntil, debounceTime, distinctUntilChanged, switchMap, map, catchError } from 'rxjs/operators';

import { SofkaProduct, ProductFormData, VALIDATION_MESSAGES } from '../../../../core/models/sofka-product.interface';
import { SofkaProductService } from '../../../../core/services/sofka-product.service';

@Component({
  selector: 'app-product-form',
  templateUrl: './product-form.component.html',
  styleUrls: ['./product-form.component.scss']
})
export class ProductFormComponent implements OnInit, OnDestroy {
  @Input() product: SofkaProduct | null = null; // Para edición
  @Input() isEditMode = false;
  @Output() formSubmit = new EventEmitter<ProductFormData>();
  @Output() formCancel = new EventEmitter<void>();

  productForm: FormGroup;
  loading = false;
  submitting = false;
  readonly validationMessages = VALIDATION_MESSAGES;
  
  private destroy$ = new Subject<void>();
  private idCheckSubject = new Subject<string>();

  constructor(
    private fb: FormBuilder,
    private sofkaProductService: SofkaProductService
  ) {
    
    this.productForm = this.fb.group({});
  }

  ngOnInit(): void {
   
    this.productForm = this.createForm();
    
    this.setupIdValidation();
    
    if (this.product && this.isEditMode) {
      this.loadProductData();
    }

    
    this.productForm.get('date_release')?.valueChanges
      .pipe(takeUntil(this.destroy$))
      .subscribe(releaseDate => {
        if (releaseDate) {
          this.calculateRevisionDate(releaseDate);
        }
      });
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }

  /**
   * Crea el formulario reactivo con validaciones
   */
  private createForm(): FormGroup {
    
    const idValidators = [
      Validators.required,
      Validators.minLength(3),
      Validators.maxLength(10)
    ];

    
    const idAsyncValidators = this.isEditMode ? [] : [this.idExistsValidator.bind(this)];

    return this.fb.group({
      id: [
        '', 
        idValidators,
        idAsyncValidators 
      ],
      name: [
        '', 
        [
          Validators.required,
          Validators.minLength(5),
          Validators.maxLength(100)
        ]
      ],
      description: [
        '', 
        [
          Validators.required,
          Validators.minLength(10),
          Validators.maxLength(200)
        ]
      ],
      logo: ['', Validators.required],
      date_release: [
        '', 
        [
          Validators.required,
          this.minDateValidator
        ]
      ],
      date_revision: [
        { value: '', disabled: true }, 
        Validators.required
      ]
    });
  }

  /**
   * Configura la validación asíncrona del ID
   */
  private setupIdValidation(): void {
    if (!this.isEditMode) {
      this.idCheckSubject
        .pipe(
          debounceTime(500),
          distinctUntilChanged(),
          switchMap(id => this.sofkaProductService.verifyProductId(id)),
          takeUntil(this.destroy$)
        )
        .subscribe();
    }
  }

  /**
   * Carga los datos del producto en modo edición
   */
  private loadProductData(): void {
    if (this.product) {
      this.productForm.patchValue({
        id: this.product.id,
        name: this.product.name,
        description: this.product.description,
        logo: this.product.logo,
        date_release: this.product.date_release,
        date_revision: this.product.date_revision
      });

      this.productForm.get('id')?.disable();
    }
  }

  /**
   * Validador personalizado para fecha mínima
   */
  private minDateValidator(control: AbstractControl): ValidationErrors | null {
    if (!control.value) return null;
    
    const inputDate = new Date(control.value);
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    
    return inputDate >= today ? null : { minDate: true };
  }

  /**
   * Validador asíncrono para verificar si el ID existe
   * NOTA: Este método solo se llamará en modo NO edición
   */
  private idExistsValidator(control: AbstractControl): Observable<ValidationErrors | null> {
    if (!control.value) {
      return of(null);
    }
    
    return this.sofkaProductService.verifyProductId(control.value)
      .pipe(
        takeUntil(this.destroy$),
        map(exists => exists ? { idExists: true } : null),
        catchError(() => of(null))
      );
  }

  /**
   * Calcula automáticamente la fecha de revisión (un año después)
   */
  private calculateRevisionDate(releaseDate: string): void {
    const release = new Date(releaseDate);
    const revision = new Date(release);
    revision.setFullYear(revision.getFullYear() + 1);
    
    const revisionDateString = revision.toISOString().split('T')[0];
    this.productForm.get('date_revision')?.setValue(revisionDateString);
  }

  /**
   * Maneja el envío del formulario
   */
  onSubmit(): void {
    if (this.productForm.valid && !this.submitting) {
      this.submitting = true;
      
      const formData: ProductFormData = {
        ...this.productForm.getRawValue()
      };

      this.formSubmit.emit(formData);
    } else {
      this.markFormGroupTouched();
    }
  }

  /**
   * Reinicia el formulario
   */
  onReset(): void {
    this.productForm.reset();
    
    if (this.isEditMode && this.product) {
      this.loadProductData();
    }
  }

  /**
   * Cancela la operación
   */
  onCancel(): void {
    this.formCancel.emit();
  }

  /**
   * Marca todos los campos como touched para mostrar errores
   */
  private markFormGroupTouched(): void {
    Object.keys(this.productForm.controls).forEach(key => {
      const control = this.productForm.get(key);
      control?.markAsTouched();
    });
  }

  /**
   * Verifica si un campo tiene errores y ha sido touched
   */
  hasError(fieldName: string): boolean {
    const field = this.productForm.get(fieldName);
    return !!(field?.errors && field?.touched);
  }

  /**
   * Obtiene el mensaje de error para un campo específico
   */
  getErrorMessage(fieldName: string): string {
    const field = this.productForm.get(fieldName);
    
    if (!field?.errors || !field?.touched) return '';

    const errors = field.errors;
    
    switch (fieldName) {
      case 'id':
        if (errors['required']) return this.validationMessages.ID.REQUIRED;
        if (errors['minlength']) return this.validationMessages.ID.MIN_LENGTH;
        if (errors['maxlength']) return this.validationMessages.ID.MAX_LENGTH;
        if (errors['idExists']) return this.validationMessages.ID.EXISTS;
        break;
        
      case 'name':
        if (errors['required']) return this.validationMessages.NAME.REQUIRED;
        if (errors['minlength']) return this.validationMessages.NAME.MIN_LENGTH;
        if (errors['maxlength']) return this.validationMessages.NAME.MAX_LENGTH;
        break;
        
      case 'description':
        if (errors['required']) return this.validationMessages.DESCRIPTION.REQUIRED;
        if (errors['minlength']) return this.validationMessages.DESCRIPTION.MIN_LENGTH;
        if (errors['maxlength']) return this.validationMessages.DESCRIPTION.MAX_LENGTH;
        break;
        
      case 'logo':
        if (errors['required']) return this.validationMessages.LOGO.REQUIRED;
        break;
        
      case 'date_release':
        if (errors['required']) return this.validationMessages.DATE_RELEASE.REQUIRED;
        if (errors['minDate']) return this.validationMessages.DATE_RELEASE.MIN_DATE;
        break;
        
      case 'date_revision':
        if (errors['required']) return this.validationMessages.DATE_REVISION.REQUIRED;
        break;
    }
    
    return '';
  }

  /**
   * Actualiza el estado de envío
   */
  setSubmitting(submitting: boolean): void {
    this.submitting = submitting;
  }
}