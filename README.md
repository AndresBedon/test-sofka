# Sofka Products - Prueba Técnica Angular

Aplicación Angular para la gestión de productos desarrollada como prueba técnica.

## 🚀 Características Implementadas

### Funcionalidades Base (Junior)

- ✅ **F1**: Listado de productos financieros con diseño D1
- ✅ **F2**: Búsqueda de productos financieros
- ✅ **F3**: Control de cantidad de registros (5, 10, 20)

### Funcionalidades Intermedias (Semi-Senior)

- ✅ **F4**: Agregar productos con formulario completo y validaciones
- ✅ **Rutas**: Navegación entre páginas

### Funcionalidades Avanzadas (Senior)

- ✅ **F5**: Editar productos con menú contextual
- ✅ **F6**: Eliminar productos con modal de confirmación
- ✅ **Performance**: Implementación de OnPush strategy y trackBy
- ✅ **Responsive Design**: Diseño adaptativo para móviles
- ✅ **Loading States**: Skeletons y estados de carga

## 🛠️ Tecnologías Utilizadas

- **Angular 15+**: Framework principal
- **TypeScript 4.8+**: Lenguaje de programación
- **SCSS**: Preprocesador CSS
- **RxJS**: Programación reactiva
- **Jest**: Testing framework
- **Angular Reactive Forms**: Formularios reactivos
- **HttpClient**: Cliente HTTP para APIs

## 📋 Requisitos Previos

- Node.js 20.19+
- npm 8

### Ejecutar pruebas

```bash
# Ejecutar todas las pruebas
npm test

# Ejecutar con cobertura
npm run test:coverage

# Ejecutar en modo watch
npm run test:watch
```

## 📊 Cobertura de Pruebas

```
Statements   : 88.76% ( 324/365 )
Branches     : 74.68% ( 59/79 )
Functions    : 94.39% ( 101/107 )
Lines        : 91.54% ( 303/331 )
```

✅ **Cumple con el mínimo de 70% requerido**

## 🔧 Configuración del Proxy

Para evitar problemas de CORS, se configuró un proxy en `proxy.conf.json`:

```json
{
  "/bp/*": {
    "target": "http://localhost:3002",
    "secure": false,
    "changeOrigin": true,
    "logLevel": "debug"
  }
}
```

## 👨‍💻 Autor

**Andrés Bedón**  
Desarrollador Frontend
