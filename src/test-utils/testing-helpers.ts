
import { ComponentFixture } from '@angular/core/testing';
import { DebugElement } from '@angular/core';
import { By } from '@angular/platform-browser';

/**
 * Helper para buscar elementos por selector CSS
 */
export function findByCss<T>(fixture: ComponentFixture<T>, selector: string): DebugElement {
  return fixture.debugElement.query(By.css(selector));
}

/**
 * Helper para buscar múltiples elementos por selector CSS
 */
export function findAllByCss<T>(fixture: ComponentFixture<T>, selector: string): DebugElement[] {
  return fixture.debugElement.queryAll(By.css(selector));
}

/**
 * Helper para buscar elemento por atributo de testing
 */
export function findByTestId<T>(fixture: ComponentFixture<T>, testId: string): DebugElement {
  return findByCss(fixture, `[data-testid="${testId}"]`);
}

/**
 * Helper para hacer click en un elemento
 */
export function click<T>(fixture: ComponentFixture<T>, selector: string): void {
  const element = findByCss(fixture, selector);
  if (element) {
    element.nativeElement.click();
    fixture.detectChanges();
  }
}

/**
 * Helper para escribir en un input
 */
export function setInputValue<T>(fixture: ComponentFixture<T>, selector: string, value: string): void {
  const input = findByCss(fixture, selector);
  if (input) {
    input.nativeElement.value = value;
    input.nativeElement.dispatchEvent(new Event('input'));
    fixture.detectChanges();
  }
}

/**
 * Helper para esperar a que se resuelvan las promesas
 */
export function flushPromises(): Promise<void> {
  return new Promise(resolve => setTimeout(resolve, 0));
}

/**
 * Mock para ActivatedRoute
 */
export function createActivatedRouteMock(params = {}, queryParams = {}) {
  return {
    params: { ...params },
    queryParams: { ...queryParams },
    snapshot: {
      params: { ...params },
      queryParams: { ...queryParams }
    }
  };
}