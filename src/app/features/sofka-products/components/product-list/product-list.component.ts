import { Component, OnInit, OnDestroy, Input, Output, EventEmitter } from '@angular/core';
import { Subject } from 'rxjs';
import { takeUntil, debounceTime, distinctUntilChanged } from 'rxjs/operators';

import { SofkaProduct, PAGINATION_OPTIONS } from '../../../../core/models/sofka-product.interface';
import { SofkaProductService } from '../../../../core/services/sofka-product.service';
import { Router } from '@angular/router';

@Component({
  selector: 'app-product-list',
  templateUrl: './product-list.component.html',
  styleUrls: ['./product-list.component.scss']
})
export class ProductListComponent implements OnInit, OnDestroy {
  @Input() showActions = false; 
  @Output() editProduct = new EventEmitter<SofkaProduct>();
  @Output() deleteProduct = new EventEmitter<SofkaProduct>();

  products: SofkaProduct[] = [];
  filteredProducts: SofkaProduct[] = [];
  paginatedProducts: SofkaProduct[] = [];
  
  searchTerm = '';
  pageSize = 5;
  currentPage = 1;
  totalProducts = 0;
  loading = false;
  error: string | null = null;

  brokenImages: { [productId: string]: boolean } = {};
  
  readonly paginationOptions = PAGINATION_OPTIONS;
  private destroy$ = new Subject<void>();
  private searchSubject = new Subject<string>();

  constructor(private sofkaProductService: SofkaProductService,private router: Router,) {}

  ngOnInit(): void {
    this.setupSearch();
    this.loadProducts();
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }

  /**
   * Configura la búsqueda con debounce
   */
  private setupSearch(): void {
    this.searchSubject
      .pipe(
        debounceTime(300),
        distinctUntilChanged(),
        takeUntil(this.destroy$)
      )
      .subscribe(searchTerm => {
        this.performSearch(searchTerm);
      });
  }

  /**
   * Carga los productos desde el servicio
   */
  loadProducts(): void {
    this.loading = true;
    this.error = null;

    this.sofkaProductService.getProducts()
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: (products) => {
          this.products = products;
          this.applyFilters();
          this.loading = false;
        },
        error: (error) => {
          this.error = error.message;
          this.loading = false;
          console.error('Error loading products:', error);
        }
      });
  }

  /**
   * Maneja el cambio en el campo de búsqueda
   */
  onSearchChange(searchTerm: string): void {
    this.searchTerm = searchTerm;
    this.searchSubject.next(searchTerm);
  }

  /**
   * Realiza la búsqueda
   */
  private performSearch(searchTerm: string): void {
    this.sofkaProductService.searchProducts(searchTerm)
      .pipe(takeUntil(this.destroy$))
      .subscribe(products => {
        this.filteredProducts = products;
        this.totalProducts = products.length;
        this.currentPage = 1; 
        this.updatePagination();
      });
  }

  /**
   * Aplica filtros y paginación
   */
  private applyFilters(): void {
    this.performSearch(this.searchTerm);
  }

  /**
   * Maneja el cambio de tamaño de página
   */
  onPageSizeChange(size: number): void {
    this.pageSize = size;
    this.currentPage = 1;
    this.updatePagination();
  }

  /**
   * Maneja el cambio de página
   */
  onPageChange(page: number): void {
    this.currentPage = page;
    this.updatePagination();
  }

  /**
   * Actualiza la paginación
   */
  private updatePagination(): void {
    const startIndex = (this.currentPage - 1) * this.pageSize;
    const endIndex = startIndex + this.pageSize;
    this.paginatedProducts = this.filteredProducts.slice(startIndex, endIndex);
  }

  /**
   * Calcula el total de páginas
   */
  get totalPages(): number {
    return Math.ceil(this.totalProducts / this.pageSize);
  }

  /**
   * Obtiene el rango de productos mostrados
   */
  get displayRange(): string {
    if (this.totalProducts === 0) return '0 resultados';
    
    const start = (this.currentPage - 1) * this.pageSize + 1;
    const end = Math.min(this.currentPage * this.pageSize, this.totalProducts);
    return `${start}-${end} de ${this.totalProducts} resultados`;
  }

  /**
   * Maneja la acción de editar producto
   */
  onEditProduct(product: SofkaProduct): void {
    this.editProduct.emit(product);
  }

  /**
   * Maneja la acción de eliminar producto
   */
  onDeleteProduct(product: SofkaProduct): void {
    this.deleteProduct.emit(product);
  }

  /**
   * Reintenta cargar los productos
   */
  retry(): void {
    this.loadProducts();
  }

// TrackBy function para mejor performance
trackByProductId(index: number, product: SofkaProduct): string {
  return product.id;
}

/**
 * Maneja el evento de input de búsqueda
 */
onSearchInputChange(event: Event): void {
  const target = event.target as HTMLInputElement;
  if (target) {
    this.onSearchChange(target.value);
  }
}

/**
 * Maneja el evento de cambio de tamaño de página
 */
onPageSizeSelectChange(event: Event): void {
  const target = event.target as HTMLSelectElement;
  if (target) {
    this.onPageSizeChange(+target.value);
  }
}

/**
   * Navega al formulario de agregar producto
   */
  onAddProduct(): void {
    this.router.navigate(['/products/add']);
  }

  onImageError(productId: string): void {
  this.brokenImages[productId] = true;
}

getInitials(name: string): string {
  if (!name) return '';
  const words = name.trim().split(' ');
  if (words.length === 1) return words[0].substring(0, 2).toUpperCase();
  return (words[0][0] + words[1][0]).toUpperCase();
}
}