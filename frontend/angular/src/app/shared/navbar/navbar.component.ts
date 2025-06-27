import { Component, HostListener, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink, RouterLinkActive } from '@angular/router';
import { TranslateModule, TranslateService } from '@ngx-translate/core';

interface Language {
  code: string;
  name: string;
  flag: string;
}

@Component({
  selector: 'app-navbar',
  standalone: true,
  imports: [CommonModule, RouterLink, RouterLinkActive, TranslateModule],
  templateUrl: './navbar.component.html',
  styleUrl: './navbar.component.scss',
})
export class NavbarComponent implements OnInit {
  isScrolled = false;
  isMenuActive = false;
  isLanguageDropdownOpen = false;
  currentLanguage = 'es';

  languages: Language[] = [
    { code: 'es', name: 'Español', flag: '🇪🇸' },
    { code: 'en', name: 'English', flag: '🇺🇸' },
    { code: 'qu', name: 'Runasimi', flag: '🇧🇴' },
   ];  

  constructor(private translate: TranslateService) {
    this.translate.setDefaultLang('es');

    const savedLanguage = localStorage.getItem('selectedLanguage') || 'es';
    this.currentLanguage = savedLanguage;
    this.translate.use(savedLanguage);
  }

  ngOnInit(): void {
    this.checkScroll();
  }

  toggleMenu() {
    this.isMenuActive = !this.isMenuActive;
    if (this.isLanguageDropdownOpen) {
      this.isLanguageDropdownOpen = false;
    }
  }

  closeMenu() {
    this.isMenuActive = false;
  }

  toggleLanguageDropdown() {
    this.isLanguageDropdownOpen = !this.isLanguageDropdownOpen;
    // Cerrar menú móvil si está abierto
    if (this.isMenuActive) {
      this.isMenuActive = false;
    }
  }

  closeLanguageDropdown() {
    this.isLanguageDropdownOpen = false;
  }

  changeLanguage(languageCode: string) {
    this.currentLanguage = languageCode;
    this.translate.use(languageCode);
    localStorage.setItem('selectedLanguage', languageCode);
    this.closeLanguageDropdown();
  }

  getCurrentLanguageName(): string {
    const currentLang = this.languages.find(
      (lang) => lang.code === this.currentLanguage
    );
    return currentLang ? currentLang.name : 'Español';
  }

  @HostListener('window:scroll', [])
  checkScroll() {
    const scrollPosition =
      window.pageYOffset ||
      document.documentElement.scrollTop ||
      document.body.scrollTop ||
      0;
    this.isScrolled = scrollPosition > 100;
  }

  @HostListener('document:click', ['$event'])
  onDocumentClick(event: Event) {
    const target = event.target as HTMLElement;
    const languageSelector = target.closest('.language-selector');

    if (!languageSelector && this.isLanguageDropdownOpen) {
      this.closeLanguageDropdown();
    }
  }
}
