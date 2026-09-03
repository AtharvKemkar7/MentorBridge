import { Component } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { MainLayoutComponent } from './layout/main-layout/main-layout.component';

@Component({
  selector: 'ab-root',
  standalone: true,
  imports: [RouterOutlet, MainLayoutComponent],
  template: `
    <ab-main-layout>
      <router-outlet></router-outlet>
    </ab-main-layout>
  `
})
export class AppComponent {}