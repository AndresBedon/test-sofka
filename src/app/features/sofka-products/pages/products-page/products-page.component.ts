import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { SofkaProduct } from '../../../../core/models/sofka-product.interface';
import { SofkaProductService } from '../../../../core/services/sofka-product.service';

@Component({
  selector: 'app-products-page',
  templateUrl: './products-page.component.html',
  styleUrls: ['./products-page.component.scss']
})
export class ProductsPageComponent implements OnInit {
  showDeleteModal = false;
  productToDelete: SofkaProduct | null = null;
  deleting = false;
  error: string | null = null;

  constructor(
    private router: Router,
    private sofkaProductService: SofkaProductService
  ) {}

  ngOnInit(): void {}

  /**
   * Navega al formulario de agregar producto
   */
  onAddProduct(): void {
    this.router.navigate(['/products/add']);
  }

  /**
   * Navega al formulario de editar producto
   */
  onEditProduct(product: SofkaProduct): void {
    this.router.navigate(['/products/edit', product.id]);
  }

  /**
   * Muestra el modal de confirmación para eliminar
   */
  onDeleteProduct(product: SofkaProduct): void {
    this.productToDelete = product;
    this.showDeleteModal = true;
  }

  /**
   * Confirma la eliminación del producto
   */
  onConfirmDelete(): void {
    if (this.productToDelete) {
      this.deleting = true;
      this.error = null;

      this.sofkaProductService.deleteProduct(this.productToDelete.id)
        .subscribe({
          next: () => {
            this.deleting = false;
            this.showDeleteModal = false;
            this.productToDelete = null;
            // El servicio actualizará automáticamente la lista
          },
          error: (error) => {
            this.deleting = false;
            this.error = error.message;
            console.error('Error deleting product:', error);
          }
        });
    }
  }

  /**
   * Cancela la eliminación
   */
  onCancelDelete(): void {
    this.showDeleteModal = false;
    this.productToDelete = null;
    this.error = null;
  }
}