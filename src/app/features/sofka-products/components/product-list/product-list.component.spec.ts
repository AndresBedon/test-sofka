// src/app/features/sofka-products/components/product-list/product-list.component.spec.ts

import { ComponentFixture, TestBed } from '@angular/core/testing';
import { of, throwError } from 'rxjs';
import { ProductListComponent } from './product-list.component';
import { SofkaProductService } from '../../../../core/services/sofka-product.service';
import { SofkaProduct } from '../../../../core/models/sofka-product.interface';

describe('ProductListComponent', () => {
  let component: ProductListComponent;
  let fixture: ComponentFixture<ProductListComponent>;
  let mockSofkaProductService: jest.Mocked<SofkaProductService>;

  const mockProducts: SofkaProduct[] = [
    {
      id: 'test1',
      name: 'Test Product 1',
      description: 'Test Description 1',
      logo: 'test-logo1.png',
      date_release: '2024-01-01',
      date_revision: '2025-01-01'
    },
    {
      id: 'test2',
      name: 'Test Product 2',
      description: 'Test Description 2',
      logo: 'test-logo2.png',
      date_release: '2024-02-01',
      date_revision: '2025-02-01'
    }
  ];

  beforeEach(async () => {
    const spy = {
      getProducts: jest.fn().mockReturnValue(of(mockProducts)),
      searchProducts: jest.fn().mockReturnValue(of(mockProducts))
    };

    await TestBed.configureTestingModule({
      declarations: [ProductListComponent],
      providers: [
        { provide: SofkaProductService, useValue: spy }
      ]
    }).compileComponents();

    fixture = TestBed.createComponent(ProductListComponent);
    component = fixture.componentInstance;
    mockSofkaProductService = TestBed.inject(SofkaProductService) as jest.Mocked<SofkaProductService>;
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should initialize with default values', () => {
    expect(component.products).toEqual([]);
    expect(component.filteredProducts).toEqual([]);
    expect(component.paginatedProducts).toEqual([]);
    expect(component.searchTerm).toBe('');
    expect(component.pageSize).toBe(5);
    expect(component.currentPage).toBe(1);
    expect(component.totalProducts).toBe(0);
    expect(component.loading).toBe(false);
    expect(component.error).toBeNull();
    expect(component.showActions).toBe(false);
  });

  it('should load products on init', () => {
    mockSofkaProductService.getProducts.mockReturnValue(of(mockProducts));
    mockSofkaProductService.searchProducts.mockReturnValue(of(mockProducts));

    component.ngOnInit();

    expect(mockSofkaProductService.getProducts).toHaveBeenCalled();
    expect(component.loading).toBeFalsy();
  });

  it('should handle error when loading products', () => {
    const errorMessage = 'Test error';
    const consoleSpy = jest.spyOn(console, 'error').mockImplementation();
    mockSofkaProductService.getProducts.mockReturnValue(throwError(() => new Error(errorMessage)));

    component.loadProducts();

    expect(component.error).toBe(errorMessage);
    expect(component.loading).toBeFalsy();
    expect(consoleSpy).toHaveBeenCalled();
    
    consoleSpy.mockRestore();
  });

  it('should handle search input change event', () => {
    const mockEvent = {
      target: { value: 'test search' }
    } as unknown as Event;

    const searchChangeSpy = jest.spyOn(component, 'onSearchChange');
    
    component.onSearchInputChange(mockEvent);
    
    expect(searchChangeSpy).toHaveBeenCalledWith('test search');
  });

  it('should handle search input change with null target', () => {
    const mockEvent = {
      target: null
    } as unknown as Event;

    const searchChangeSpy = jest.spyOn(component, 'onSearchChange');
    
    component.onSearchInputChange(mockEvent);
    
    expect(searchChangeSpy).not.toHaveBeenCalled();
  });

  it('should handle page size change', () => {
    component.filteredProducts = mockProducts;
    component.totalProducts = mockProducts.length;

    component.onPageSizeChange(10);

    expect(component.pageSize).toBe(10);
    expect(component.currentPage).toBe(1);
  });

  it('should handle page size select change event', () => {
    const mockEvent = {
      target: { value: '10' }
    } as unknown as Event;

    const pageSizeChangeSpy = jest.spyOn(component, 'onPageSizeChange');
    
    component.onPageSizeSelectChange(mockEvent);
    
    expect(pageSizeChangeSpy).toHaveBeenCalledWith(10);
  });

  it('should handle page size select change with null target', () => {
    const mockEvent = {
      target: null
    } as unknown as Event;

    const pageSizeChangeSpy = jest.spyOn(component, 'onPageSizeChange');
    
    component.onPageSizeSelectChange(mockEvent);
    
    expect(pageSizeChangeSpy).not.toHaveBeenCalled();
  });

  it('should change page correctly', () => {
    component.filteredProducts = mockProducts;
    component.totalProducts = mockProducts.length;
    component.pageSize = 1;
    
    component.onPageChange(2);
    
    expect(component.currentPage).toBe(2);
    expect(component.paginatedProducts).toEqual([mockProducts[1]]);
  });

  it('should update pagination correctly', () => {
    component.filteredProducts = mockProducts;
    component.totalProducts = mockProducts.length;
    component.pageSize = 1;
    component.currentPage = 1;
    
    (component as any).updatePagination();
    
    expect(component.paginatedProducts).toEqual([mockProducts[0]]);
  });

  it('should calculate total pages correctly', () => {
    component.totalProducts = 25;
    component.pageSize = 10;

    expect(component.totalPages).toBe(3);
  });

  it('should calculate total pages with exact division', () => {
    component.totalProducts = 20;
    component.pageSize = 10;

    expect(component.totalPages).toBe(2);
  });

  it('should calculate total pages with zero products', () => {
    component.totalProducts = 0;
    component.pageSize = 10;

    expect(component.totalPages).toBe(0);
  });

  it('should calculate display range correctly', () => {
    component.totalProducts = 25;
    component.pageSize = 10;
    component.currentPage = 2;

    expect(component.displayRange).toBe('11-20 de 25 resultados');
  });

  it('should handle display range for first page', () => {
    component.totalProducts = 25;
    component.pageSize = 10;
    component.currentPage = 1;

    expect(component.displayRange).toBe('1-10 de 25 resultados');
  });

  it('should handle display range for last page with fewer items', () => {
    component.totalProducts = 15;
    component.pageSize = 10;
    component.currentPage = 2;

    expect(component.displayRange).toBe('11-15 de 15 resultados');
  });

  it('should handle display range with zero products', () => {
    component.totalProducts = 0;
    component.pageSize = 10;
    component.currentPage = 1;

    expect(component.displayRange).toBe('0 resultados');
  });

  it('should emit edit event when onEditProduct is called', () => {
    const editSpy = jest.spyOn(component.editProduct, 'emit');
    
    component.onEditProduct(mockProducts[0]);
    
    expect(editSpy).toHaveBeenCalledWith(mockProducts[0]);
  });

  it('should emit delete event when onDeleteProduct is called', () => {
    const deleteSpy = jest.spyOn(component.deleteProduct, 'emit');
    
    component.onDeleteProduct(mockProducts[0]);
    
    expect(deleteSpy).toHaveBeenCalledWith(mockProducts[0]);
  });

  it('should track products by ID', () => {
    const result = component.trackByProductId(0, mockProducts[0]);
    expect(result).toBe('test1');
  });

  it('should track products by ID for different products', () => {
    const result1 = component.trackByProductId(0, mockProducts[0]);
    const result2 = component.trackByProductId(1, mockProducts[1]);
    
    expect(result1).toBe('test1');
    expect(result2).toBe('test2');
    expect(result1).not.toBe(result2);
  });

  it('should apply filters when loading products', () => {
    const performSearchSpy = jest.spyOn(component as any, 'performSearch');
    mockSofkaProductService.getProducts.mockReturnValue(of(mockProducts));
    mockSofkaProductService.searchProducts.mockReturnValue(of(mockProducts));
    
    component.loadProducts();
    
    expect(performSearchSpy).toHaveBeenCalledWith('');
  });

  it('should reset to first page when performing search', () => {
    const filteredProducts = [mockProducts[0]];
    mockSofkaProductService.searchProducts.mockReturnValue(of(filteredProducts));
    
    component.currentPage = 3;
    (component as any).performSearch('test');
    
    expect(component.currentPage).toBe(1);
    expect(component.filteredProducts).toEqual(filteredProducts);
    expect(component.totalProducts).toBe(1);
  });

  it('should clean up subscriptions on destroy', () => {
    const destroySpy = jest.spyOn((component as any).destroy$, 'next');
    const completeSpy = jest.spyOn((component as any).destroy$, 'complete');
    
    component.ngOnDestroy();
    
    expect(destroySpy).toHaveBeenCalled();
    expect(completeSpy).toHaveBeenCalled();
  });

  it('should handle multiple page size changes', () => {
    component.filteredProducts = mockProducts;
    component.totalProducts = mockProducts.length;
    
    component.onPageSizeChange(1);
    expect(component.pageSize).toBe(1);
    expect(component.currentPage).toBe(1);
    
    component.onPageSizeChange(20);
    expect(component.pageSize).toBe(20);
    expect(component.currentPage).toBe(1);
  });

  it('should handle pagination with empty filtered products', () => {
    component.filteredProducts = [];
    component.totalProducts = 0;
    component.pageSize = 5;
    component.currentPage = 1;
    
    (component as any).updatePagination();
    
    expect(component.paginatedProducts).toEqual([]);
  });

  it('should clear error when loading products successfully', () => {
    component.error = 'Previous error';
    mockSofkaProductService.getProducts.mockReturnValue(of(mockProducts));
    mockSofkaProductService.searchProducts.mockReturnValue(of(mockProducts));
    
    component.loadProducts();
    
    expect(component.error).toBeNull();
  });

  it('should handle search with empty string', () => {
    component.onSearchChange('');
    
    expect(component.searchTerm).toBe('');
  });

  it('should handle search with whitespace', () => {
    const searchTerm = '   test   ';
    
    component.onSearchChange(searchTerm);
    
    expect(component.searchTerm).toBe(searchTerm);
  });

  it('should properly slice products for pagination', () => {
    component.filteredProducts = mockProducts;
    component.pageSize = 1;
    component.currentPage = 2;
    
    (component as any).updatePagination();
    
    const startIndex = (component.currentPage - 1) * component.pageSize;
    const endIndex = startIndex + component.pageSize;
    const expectedProducts = mockProducts.slice(startIndex, endIndex);
    
    expect(component.paginatedProducts).toEqual(expectedProducts);
  });

  it('should handle edge case with very large page numbers', () => {
    component.filteredProducts = mockProducts;
    component.totalProducts = mockProducts.length;
    component.pageSize = 1;
    
    component.onPageChange(100);
    
    expect(component.currentPage).toBe(100);
    expect(component.paginatedProducts).toEqual([]);
  });

  it('should setup search and load products on ngOnInit', () => {
    const setupSearchSpy = jest.spyOn(component as any, 'setupSearch');
    const loadProductsSpy = jest.spyOn(component, 'loadProducts');
    
    component.ngOnInit();
    
    expect(setupSearchSpy).toHaveBeenCalled();
    expect(loadProductsSpy).toHaveBeenCalled();
  });

  it('should search products when onSearchChange is called', () => {
    const searchTerm = 'test';
    
    component.onSearchChange(searchTerm);
    
    expect(component.searchTerm).toBe(searchTerm);
  });

  it('should retry loading products when retry is called', () => {
    const loadProductsSpy = jest.spyOn(component, 'loadProducts');
    
    component.retry();
    
    expect(loadProductsSpy).toHaveBeenCalled();
  });

  it('should handle search subject with debounce', (done) => {
    const searchTerm = 'test';
    mockSofkaProductService.searchProducts.mockReturnValue(of([mockProducts[0]]));
    
    // Llamar setupSearch directamente para evitar ngOnInit
    (component as any).setupSearch();
    
    component.onSearchChange(searchTerm);
    
    setTimeout(() => {
      expect(component.searchTerm).toBe(searchTerm);
      done();
    }, 350);
  });
});