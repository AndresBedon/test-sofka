import { Injectable } from '@angular/core';
import { HttpClient, HttpErrorResponse } from '@angular/common/http';
import { Observable, throwError, BehaviorSubject } from 'rxjs';
import { catchError, map, tap } from 'rxjs/operators';

import {
  SofkaProduct,
  ProductsResponse,
  ProductResponse,
  ProductFormData,
  API_ENDPOINTS
} from '../models/sofka-product.interface';

@Injectable({
  providedIn: 'root'
})
export class SofkaProductService {
  private readonly baseUrl = API_ENDPOINTS.BASE_URL;
  private productsSubject = new BehaviorSubject<SofkaProduct[]>([]);
  public products$ = this.productsSubject.asObservable();

  constructor(private http: HttpClient) {}

  /**
   * Obtiene todos los productos financieros
   */
  getProducts(): Observable<SofkaProduct[]> {
    return this.http.get<ProductsResponse>(`${this.baseUrl}${API_ENDPOINTS.PRODUCTS}`)
      .pipe(
        map(response => response.data),
        tap(products => this.productsSubject.next(products)),
        catchError(this.handleError)
      );
  }

  /**
   * Crea un nuevo producto financiero
   */
  createProduct(product: ProductFormData): Observable<SofkaProduct> {
    return this.http.post<ProductResponse>(`${this.baseUrl}${API_ENDPOINTS.PRODUCTS}`, product)
      .pipe(
        map(response => response.data),
        tap(() => this.refreshProducts()),
        catchError(this.handleError)
      );
  }

  /**
   * Actualiza un producto financiero existente
   */
  updateProduct(id: string, product: Omit<ProductFormData, 'id'>): Observable<SofkaProduct> {
    return this.http.put<ProductResponse>(`${this.baseUrl}${API_ENDPOINTS.PRODUCTS}/${id}`, product)
      .pipe(
        map(response => response.data),
        tap(() => this.refreshProducts()),
        catchError(this.handleError)
      );
  }

  /**
   * Elimina un producto financiero
   */
  deleteProduct(id: string): Observable<void> {
    return this.http.delete<{ message: string }>(`${this.baseUrl}${API_ENDPOINTS.PRODUCTS}/${id}`)
      .pipe(
        map(() => void 0),
        tap(() => this.refreshProducts()),
        catchError(this.handleError)
      );
  }

  /**
   * Verifica si un ID ya existe
   */
  verifyProductId(id: string): Observable<boolean> {
    return this.http.get<boolean>(`${this.baseUrl}${API_ENDPOINTS.VERIFICATION}/${id}`)
      .pipe(
        catchError(this.handleError)
      );
  }

  /**
   * Obtiene un producto por ID (desde el estado local)
   */
  getProductById(id: string): Observable<SofkaProduct | undefined> {
    return this.products$.pipe(
      map(products => products.find(product => product.id === id))
    );
  }

  /**
   * Filtra productos por término de búsqueda
   */
  searchProducts(searchTerm: string): Observable<SofkaProduct[]> {
    return this.products$.pipe(
      map(products => {
        if (!searchTerm.trim()) {
          return products;
        }
        
        const term = searchTerm.toLowerCase();
        return products.filter(product =>
          product.name.toLowerCase().includes(term) ||
          product.description.toLowerCase().includes(term) ||
          product.id.toLowerCase().includes(term)
        );
      })
    );
  }

  /**
   * Refresca la lista de productos
   */
  private refreshProducts(): void {
    this.getProducts().subscribe();
  }

  /**
   * Maneja errores HTTP
   */
  private handleError(error: HttpErrorResponse): Observable<never> {
    let errorMessage = 'Ha ocurrido un error inesperado';
    
    if (error.error instanceof ErrorEvent) {
      // Error del lado del cliente
      errorMessage = `Error: ${error.error.message}`;
    } else {
      // Error del lado del servidor
      if (error.status === 400) {
        errorMessage = 'Datos inválidos. Por favor verifica la información ingresada.';
      } else if (error.status === 404) {
        errorMessage = 'Producto no encontrado.';
      } else if (error.status === 500) {
        errorMessage = 'Error interno del servidor. Intenta más tarde.';
      } else if (error.status === 0) {
        errorMessage = 'No se pudo conectar con el servidor. Verifica tu conexión.';
      }
    }

    console.error('Error en SofkaProductService:', error);
    return throwError(() => new Error(errorMessage));
  }
}
