import { Component } from '@angular/core';
import { Router } from '@angular/router';
import { ProductFormData } from '../../../../core/models/sofka-product.interface';
import { SofkaProductService } from '../../../../core/services/sofka-product.service';

@Component({
  selector: 'app-add-product-page',
  templateUrl: './add-product-page.component.html',
  styleUrls: ['./add-product-page.component.scss']
})
export class AddProductPageComponent {
  submitting = false;
  error: string | null = null;

  constructor(
    private router: Router,
    private sofkaProductService: SofkaProductService
  ) {}

  /**
   * Maneja el envío del formulario de creación
   */
  onFormSubmit(formData: ProductFormData): void {
    this.submitting = true;
    this.error = null;

    this.sofkaProductService.createProduct(formData)
      .subscribe({
        next: (product) => {
          console.log('Product created successfully:', product);
          this.router.navigate(['/products']);
        },
        error: (error) => {
          this.submitting = false;
          this.error = error.message;
          console.error('Error creating product:', error);
        }
      });
  }

  /**
   * Maneja la cancelación del formulario
   */
  onFormCancel(): void {
    this.router.navigate(['/products']);
  }
}