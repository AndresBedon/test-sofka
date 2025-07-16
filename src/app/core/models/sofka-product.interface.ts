export interface SofkaProduct {
  id: string;
  name: string;
  description: string;
  logo: string;
  date_release: string; // Format: YYYY-MM-DD
  date_revision: string; // Format: YYYY-MM-DD
}

export interface ApiResponse<T> {
  data: T;
  message?: string;
}

export interface ProductsResponse {
  data: SofkaProduct[];
}

export interface ProductResponse {
  message: string;
  data: SofkaProduct;
}

export interface ErrorResponse {
  name: string;
  message: string;
  errors?: any;
}

// Tipos para formularios
export interface ProductFormData {
  id: string;
  name: string;
  description: string;
  logo: string;
  date_release: string;
  date_revision: string;
}

// Tipos para validaciones
export interface ValidationError {
  field: string;
  message: string;
}

// Constantes para la aplicación
export const API_ENDPOINTS = {
  //BASE_URL: 'http://localhost:3002',
  BASE_URL: '',
  PRODUCTS: '/bp/products',
  VERIFICATION: '/bp/products/verification'
} as const;

export const PAGINATION_OPTIONS = [5, 10, 20] as const;

export const VALIDATION_MESSAGES = {
  ID: {
    REQUIRED: 'El ID es requerido',
    MIN_LENGTH: 'El ID debe tener mínimo 3 caracteres',
    MAX_LENGTH: 'El ID debe tener máximo 10 caracteres',
    EXISTS: 'Este ID ya existe'
  },
  NAME: {
    REQUIRED: 'El nombre es requerido',
    MIN_LENGTH: 'El nombre debe tener mínimo 5 caracteres',
    MAX_LENGTH: 'El nombre debe tener máximo 100 caracteres'
  },
  DESCRIPTION: {
    REQUIRED: 'La descripción es requerida',
    MIN_LENGTH: 'La descripción debe tener mínimo 10 caracteres',
    MAX_LENGTH: 'La descripción debe tener máximo 200 caracteres'
  },
  LOGO: {
    REQUIRED: 'El logo es requerido'
  },
  DATE_RELEASE: {
    REQUIRED: 'La fecha de liberación es requerida',
    MIN_DATE: 'La fecha debe ser igual o mayor a la fecha actual'
  },
  DATE_REVISION: {
    REQUIRED: 'La fecha de revisión es requerida',
    INVALID: 'La fecha debe ser exactamente un año posterior a la fecha de liberación'
  }
} as const;