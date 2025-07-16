// src/app/features/sofka-products/sofka-products.module.ts

import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule } from '@angular/forms';
import { HttpClientModule } from '@angular/common/http';




// Pages
import { ProductsPageComponent } from './pages/products-page/products-page.component';
import { AddProductPageComponent } from './pages/add-product-page/add-product-page.component';
import { EditProductPageComponent } from './pages/edit-product-page/edit-product-page.component';

// Components
import { ProductListComponent } from './components/product-list/product-list.component';
import { ProductFormComponent } from './components/product-form/product-form.component';
import { SofkaProductsRoutingModule } from './sofka-products-routing.module';
import { SharedModule } from 'src/app/shared/shared.module';

@NgModule({
  declarations: [
    // Paginas
    ProductsPageComponent,
    AddProductPageComponent,
    EditProductPageComponent,
    
    // Componentes
    ProductListComponent,
    ProductFormComponent,
    
  ],
  imports: [
    CommonModule,
    ReactiveFormsModule,
    HttpClientModule,
    SofkaProductsRoutingModule,
    SharedModule,
  ]
})
export class SofkaProductsModule { }