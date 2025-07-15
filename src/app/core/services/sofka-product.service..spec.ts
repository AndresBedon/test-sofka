import { TestBed } from '@angular/core/testing';
import { HttpClientTestingModule, HttpTestingController } from '@angular/common/http/testing';
import { SofkaProductService } from './sofka-product.service';
import { SofkaProduct, API_ENDPOINTS, ProductFormData } from '../models/sofka-product.interface';

describe('SofkaProductService', () => {
  let service: SofkaProductService;
  let httpMock: HttpTestingController;

  const mockProduct: SofkaProduct = {
    id: 'test-id',
    name: 'Test Product',
    description: 'Test Description',
    logo: 'test-logo.png',
    date_release: '2024-01-01',
    date_revision: '2025-01-01'
  };

  const mockProductFormData: ProductFormData = {
    id: 'test-id',
    name: 'Test Product',
    description: 'Test Description',
    logo: 'test-logo.png',
    date_release: '2024-01-01',
    date_revision: '2025-01-01'
  };

  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [HttpClientTestingModule],
      providers: [SofkaProductService]
    });

    service = TestBed.inject(SofkaProductService);
    httpMock = TestBed.inject(HttpTestingController);
  });

  afterEach(() => {
    httpMock.verify();
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });

  it('should fetch products', () => {
    const mockResponse = { data: [mockProduct] };

    service.getProducts().subscribe(products => {
      expect(products).toEqual([mockProduct]);
    });

    const req = httpMock.expectOne(`${API_ENDPOINTS.BASE_URL}${API_ENDPOINTS.PRODUCTS}`);
    expect(req.request.method).toBe('GET');
    req.flush(mockResponse);
  });

  it('should create a product', () => {
    const mockCreateResponse = { message: 'Product added successfully', data: mockProduct };
    const mockGetResponse = { data: [mockProduct] };

    service.createProduct(mockProductFormData).subscribe(product => {
      expect(product).toEqual(mockProduct);
    });

    // Expect the POST request (createProduct)
    const createReq = httpMock.expectOne(`${API_ENDPOINTS.BASE_URL}${API_ENDPOINTS.PRODUCTS}`);
    expect(createReq.request.method).toBe('POST');
    expect(createReq.request.body).toEqual(mockProductFormData);
    createReq.flush(mockCreateResponse);

    // Expect the GET request (refreshProducts)
    const refreshReq = httpMock.expectOne(`${API_ENDPOINTS.BASE_URL}${API_ENDPOINTS.PRODUCTS}`);
    expect(refreshReq.request.method).toBe('GET');
    refreshReq.flush(mockGetResponse);
  });

  it('should update a product', () => {
    const updateData: Omit<ProductFormData, 'id'> = {
      name: 'Updated Product',
      description: 'Updated Description',
      logo: 'updated-logo.png',
      date_release: '2024-02-01',
      date_revision: '2025-02-01'
    };
    const mockUpdateResponse = { data: { ...mockProduct, ...updateData } };
    const mockGetResponse = { data: [{ ...mockProduct, ...updateData }] };

    service.updateProduct('test-id', updateData).subscribe(product => {
      expect(product.name).toBe('Updated Product');
    });

    // Expect the PUT request (updateProduct)
    const updateReq = httpMock.expectOne(`${API_ENDPOINTS.BASE_URL}${API_ENDPOINTS.PRODUCTS}/test-id`);
    expect(updateReq.request.method).toBe('PUT');
    expect(updateReq.request.body).toEqual(updateData);
    updateReq.flush(mockUpdateResponse);

    // Expect the GET request (refreshProducts)
    const refreshReq = httpMock.expectOne(`${API_ENDPOINTS.BASE_URL}${API_ENDPOINTS.PRODUCTS}`);
    expect(refreshReq.request.method).toBe('GET');
    refreshReq.flush(mockGetResponse);
  });

  it('should delete a product', () => {
    const mockDeleteResponse = { message: 'Product deleted successfully' };
    const mockGetResponse = { data: [] };

    service.deleteProduct('test-id').subscribe(result => {
      expect(result).toBeUndefined();
    });

    // Expect the DELETE request (deleteProduct)
    const deleteReq = httpMock.expectOne(`${API_ENDPOINTS.BASE_URL}${API_ENDPOINTS.PRODUCTS}/test-id`);
    expect(deleteReq.request.method).toBe('DELETE');
    deleteReq.flush(mockDeleteResponse);

    // Expect the GET request (refreshProducts)
    const refreshReq = httpMock.expectOne(`${API_ENDPOINTS.BASE_URL}${API_ENDPOINTS.PRODUCTS}`);
    expect(refreshReq.request.method).toBe('GET');
    refreshReq.flush(mockGetResponse);
  });

  it('should verify product ID', () => {
    service.verifyProductId('test-id').subscribe(exists => {
      expect(exists).toBe(true);
    });

    const req = httpMock.expectOne(`${API_ENDPOINTS.BASE_URL}${API_ENDPOINTS.VERIFICATION}/test-id`);
    expect(req.request.method).toBe('GET');
    req.flush(true);
  });

  it('should verify product ID returns false', () => {
    service.verifyProductId('non-existent-id').subscribe(exists => {
      expect(exists).toBe(false);
    });

    const req = httpMock.expectOne(`${API_ENDPOINTS.BASE_URL}${API_ENDPOINTS.VERIFICATION}/non-existent-id`);
    expect(req.request.method).toBe('GET');
    req.flush(false);
  });

  it('should get product by ID from local state', () => {
    // Primero cargar productos en el estado
    service.getProducts().subscribe();
    
    const getReq = httpMock.expectOne(`${API_ENDPOINTS.BASE_URL}${API_ENDPOINTS.PRODUCTS}`);
    getReq.flush({ data: [mockProduct] });

    // Ahora buscar por ID
    service.getProductById('test-id').subscribe(product => {
      expect(product).toEqual(mockProduct);
    });

    service.getProductById('non-existent').subscribe(product => {
      expect(product).toBeUndefined();
    });
  });

  it('should search products', () => {
    // Primero cargar productos en el estado
    const products = [
      mockProduct,
      { ...mockProduct, id: 'test-2', name: 'Another Product', description: 'Another Description' }
    ];

    service.getProducts().subscribe();
    
    const getReq = httpMock.expectOne(`${API_ENDPOINTS.BASE_URL}${API_ENDPOINTS.PRODUCTS}`);
    getReq.flush({ data: products });

    // Buscar por nombre
    service.searchProducts('Test').subscribe(result => {
      expect(result.length).toBe(1);
      expect(result[0].name).toBe('Test Product');
    });

    // Buscar por descripción
    service.searchProducts('Another').subscribe(result => {
      expect(result.length).toBe(1);
      expect(result[0].id).toBe('test-2');
    });

    // Búsqueda vacía debería retornar todos
    service.searchProducts('').subscribe(result => {
      expect(result.length).toBe(2);
    });

    // Búsqueda sin resultados
    service.searchProducts('NonExistent').subscribe(result => {
      expect(result.length).toBe(0);
    });
  });

  it('should handle HTTP errors', () => {
    service.getProducts().subscribe({
      next: () => fail('should have failed'),
      error: (error) => {
        expect(error.message).toBeTruthy();
      }
    });

    const req = httpMock.expectOne(`${API_ENDPOINTS.BASE_URL}${API_ENDPOINTS.PRODUCTS}`);
    req.flush('Error occurred', { status: 500, statusText: 'Internal Server Error' });
  });

  it('should handle 404 errors', () => {
    service.verifyProductId('non-existent').subscribe({
      next: () => fail('should have failed'),
      error: (error) => {
        expect(error.message).toContain('no encontrado');
      }
    });

    const req = httpMock.expectOne(`${API_ENDPOINTS.BASE_URL}${API_ENDPOINTS.VERIFICATION}/non-existent`);
    req.flush('Not found', { status: 404, statusText: 'Not Found' });
  });

  it('should handle 400 errors', () => {
    const invalidProduct = { ...mockProductFormData, name: '' };

    service.createProduct(invalidProduct).subscribe({
      next: () => fail('should have failed'),
      error: (error) => {
        expect(error.message).toContain('Datos inválidos');
      }
    });

    const req = httpMock.expectOne(`${API_ENDPOINTS.BASE_URL}${API_ENDPOINTS.PRODUCTS}`);
    req.flush('Bad request', { status: 400, statusText: 'Bad Request' });
  });

  it('should handle network errors', () => {
    service.getProducts().subscribe({
      next: () => fail('should have failed'),
      error: (error) => {
        expect(error.message).toContain('conexión');
      }
    });

    const req = httpMock.expectOne(`${API_ENDPOINTS.BASE_URL}${API_ENDPOINTS.PRODUCTS}`);
    req.flush('Network error', { status: 0, statusText: 'Unknown Error' });
  });

  it('should update products subject when getting products', () => {
    const products = [mockProduct];
    let receivedProducts: SofkaProduct[] = [];

    // Suscribirse al BehaviorSubject
    service.products$.subscribe(prods => {
      receivedProducts = prods;
    });

    // Llamar getProducts
    service.getProducts().subscribe();

    const req = httpMock.expectOne(`${API_ENDPOINTS.BASE_URL}${API_ENDPOINTS.PRODUCTS}`);
    req.flush({ data: products });

    expect(receivedProducts).toEqual(products);
  });
});