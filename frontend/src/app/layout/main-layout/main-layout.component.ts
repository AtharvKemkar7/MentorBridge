import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterOutlet } from '@angular/router';
import { HeaderComponent } from '../header/header.component';
import { FooterComponent } from '../footer/footer.component';

@Component({
  selector: 'ab-main-layout',
  standalone: true,
  imports: [CommonModule, RouterOutlet, HeaderComponent, FooterComponent],
  template: `
    <div class="app-layout">
      <ab-header></ab-header>
      <main class="app-main" role="main">
        <div class="container">
          <router-outlet></router-outlet>
        </div>
      </main>
      <ab-footer></ab-footer>
    </div>
  `
})
export class MainLayoutComponent {}