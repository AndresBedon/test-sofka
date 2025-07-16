import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ConfirmationModalComponent } from './components/confirmation-modal/confirmation-modal.component';
import { HeaderComponent } from './components/header/header.component';

@NgModule({
  declarations: [
    ConfirmationModalComponent,
    HeaderComponent
  ],
  imports: [
    CommonModule
  ],
  exports: [
    ConfirmationModalComponent,
    HeaderComponent
  ]
})
export class SharedModule { }