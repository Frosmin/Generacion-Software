import { Component } from '@angular/core';
import { Router, NavigationEnd, RouterOutlet } from '@angular/router';
import { CommonModule } from '@angular/common';
import { NavbarComponent } from './shared/navbar/navbar.component';
import { FooterComponent } from './shared/footer/footer.component';
import { TranslateService } from '@ngx-translate/core';
import { filter } from 'rxjs/operators';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [CommonModule, NavbarComponent, FooterComponent, RouterOutlet],
  templateUrl: './app.component.html',
  styleUrl: './app.component.scss',
})
export class AppComponent {
  title = 'angular';
  showLayout = true;

  constructor(private router: Router, private translate: TranslateService) {
    this.router.events
      .pipe(filter((event) => event instanceof NavigationEnd))
      .subscribe((event: NavigationEnd) => {
        const cleanUrl = event.urlAfterRedirects || event.url;
        this.showLayout = !cleanUrl.includes('/login');
      });

    // Configuracion del idioma activo espanol por defecto
    const browserLang = this.translate.getBrowserLang();
    const lang = browserLang?.match(/es|en|qu/) ? browserLang : 'es';

    this.translate.setDefaultLang('es');
    this.translate.use(lang);
  }
}
