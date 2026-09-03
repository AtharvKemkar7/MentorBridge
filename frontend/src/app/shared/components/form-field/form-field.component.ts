import { Component, input, output, forwardRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ControlValueAccessor, NG_VALUE_ACCESSOR, ReactiveFormsModule, FormsModule } from '@angular/forms';

@Component({
  selector: 'ab-form-field',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, FormsModule],
  template: `
    <div class="form-field" [class.disabled]="disabled()" [class.has-error]="hasError()" [class.focused]="focused()">
      @if (label()) {
        <label class="form-label" [for]="id()">{{ label() }} @if (required()) {<span class="required" aria-hidden="true">*</span>}</label>
      }
      <div class="form-input-wrapper">
        @if (prefix()) {
          <span class="form-prefix" [innerHTML]="prefix()"></span>
        }
        <input
          [id]="id()"
          [type]="type()"
          [placeholder]="placeholder()"
          [value]="value()"
          [disabled]="disabled()"
          [readonly]="readonly()"
          [required]="required()"
          [aria-invalid]="hasError()"
          [aria-describedby]="hasError() ? errorId() : (hint() ? hintId() : null)"
          (input)="onInput($event)"
          (blur)="onBlur()"
          (focus)="onFocus()"
          class="form-input"
        />
        @if (suffix()) {
          <span class="form-suffix" [innerHTML]="suffix()"></span>
        }
      </div>
      @if (hasError()) {
        <div class="form-error" [id]="errorId()" role="alert">{{ errorMessage() }}</div>
      } @else if (hint()) {
        <div class="form-hint" [id]="hintId()">{{ hint() }}</div>
      }
    </div>
  `,
  styles: [`
    .form-field { display: flex; flex-direction: column; gap: 0.375rem; }
    .form-label { font-size: 0.8125rem; font-weight: 500; color: #2c3e50; }
    .required { color: #dc3545; }
    .form-input-wrapper { position: relative; display: flex; align-items: center; }
    .form-prefix, .form-suffix { display: flex; align-items: center; padding: 0 0.75rem; color: #6c757d; font-size: 0.875rem; background: #f8f9fa; border: 1px solid #dee2e6; }
    .form-prefix { border-right: none; border-radius: 0.375rem 0 0 0.375rem; }
    .form-suffix { border-left: none; border-radius: 0 0.375rem 0.375rem 0; }
    .form-input {
      flex: 1;
      width: 100%;
      padding: 0.625rem 0.875rem;
      font-size: 0.9375rem;
      color: #2c3e50;
      background: #fff;
      border: 1px solid #dee2e6;
      border-radius: 0.375rem;
      transition: border-color 0.2s ease, box-shadow 0.2s ease;
    }
    .form-input:focus { outline: none; border-color: #2c3e50; box-shadow: 0 0 0 3px rgba(44, 62, 80, 0.15); }
    .form-input:disabled { background: #f8f9fa; color: #6c757d; cursor: not-allowed; }
    .form-input::placeholder { color: #adb5bd; }
    .form-field.has-error .form-input { border-color: #dc3545; }
    .form-field.has-error .form-input:focus { box-shadow: 0 0 0 3px rgba(220, 53, 69, 0.15); }
    .form-error { font-size: 0.75rem; color: #dc3545; }
    .form-hint { font-size: 0.75rem; color: #6c757d; }
    .form-field.focused .form-label { color: #2c3e50; }
  `],
  providers: [{
    provide: NG_VALUE_ACCESSOR,
    useExisting: forwardRef(() => FormFieldComponent),
    multi: true
  }]
})
export class FormFieldComponent implements ControlValueAccessor {
  id = input.required<string>();
  label = input<string>('');
  placeholder = input<string>('');
  type = input<'text' | 'email' | 'password' | 'number' | 'tel' | 'url'>('text');
  required = input(false);
  disabled = input(false);
  readonly = input(false);
  prefix = input<string>('');
  suffix = input<string>('');
  hint = input<string>('');
  errorMessage = input<string>('');

  value = signal<string>('');
  focused = signal(false);
  touched = false;

  private onChange = (v: string) => {};
  private onTouched = () => {};

  hasError = computed(() => !!this.errorMessage() && (this.touched || this.focused()));
  errorId = computed(() => `${this.id()}-error`);
  hintId = computed(() => `${this.id()}-hint`);

  onInput(event: Event): void {
    const input = event.target as HTMLInputElement;
    this.value.set(input.value);
    this.onChange(input.value);
  }

  onBlur(): void {
    this.focused.set(false);
    if (!this.touched) {
      this.touched = true;
      this.onTouched();
    }
  }

  onFocus(): void {
    this.focused.set(true);
  }

  writeValue(value: string): void {
    this.value.set(value ?? '');
  }

  registerOnChange(fn: (v: string) => void): void {
    this.onChange = fn;
  }

  registerOnTouched(fn: () => void): void {
    this.onTouched = fn;
  }

  setDisabledState(isDisabled: boolean): void {
    this.disabled.set(isDisabled);
  }
}