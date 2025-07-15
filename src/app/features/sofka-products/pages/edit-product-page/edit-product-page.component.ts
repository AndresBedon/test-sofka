
import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { switchMap } from 'rxjs/operators';
import { SofkaProduct, ProductFormData } from '../../../../core/models/sofka-product.interface';
import { SofkaProductService } from '../../../../core/services/sofka-product.service';

@Component({
  selector: 'app-edit-product-page',
  templateUrl: './edit-product-page.component.html',
  styleUrls: ['./edit-product-page.component.scss']
})
export class EditProductPageComponent implements OnInit {
  product: SofkaProduct | null = null;
  loading = true;
  submitting = false;
  error: string | null = null;

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private sofkaProductService: SofkaProductService
  ) {}

  ngOnInit(): void {
    this.loadProduct();
  }

  /**
   * Carga el producto a editar
   */
  private loadProduct(): void {
    this.route.params
      .pipe(
        switchMap(params => this.sofkaProductService.getProductById(params['id']))
      )
      .subscribe({
        next: (product) => {
          if (product) {
            this.product = product;
          } else {
            this.error = 'Producto no encontrado';
            setTimeout(() => this.router.navigate(['/products']), 2000);
          }
          this.loading = false;
        },
        error: (error) => {
          this.error = error.message;
          this.loading = false;
        }
      });
  }

  /**
   * Maneja el envío del formulario de edición
   */
  onFormSubmit(formData: ProductFormData): void {
    if (!this.product) return;

    this.submitting = true;
    this.error = null;

    const updateData = {
      name: formData.name,
      description: formData.description,
      logo: formData.logo,
      date_release: formData.date_release,
      date_revision: formData.date_revision
    };

    this.sofkaProductService.updateProduct(this.product.id, updateData)
      .subscribe({
        next: (product) => {
          console.log('Product updated successfully:', product);
          this.router.navigate(['/products']);
        },
        error: (error) => {
          this.submitting = false;
          this.error = error.message;
          console.error('Error updating product:', error);
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