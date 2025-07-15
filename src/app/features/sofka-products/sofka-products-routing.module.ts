import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { ProductsPageComponent } from './pages/products-page/products-page.component';
import { AddProductPageComponent } from './pages/add-product-page/add-product-page.component';
import { EditProductPageComponent } from './pages/edit-product-page/edit-product-page.component';

const routes: Routes = [
  {
    path: '',
    component: ProductsPageComponent
  },
  {
    path: 'add',
    component: AddProductPageComponent
  },
  {
    path: 'edit/:id',
    component: EditProductPageComponent
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class SofkaProductsRoutingModule { }
