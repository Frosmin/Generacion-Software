import { ComponentFixture, TestBed } from '@angular/core/testing';
import { RouterTestingModule } from '@angular/router/testing';
import { TranslateModule } from '@ngx-translate/core';
import { NavbarComponent } from './navbar.component';

describe('NavbarComponent', () => {
  let component: NavbarComponent;
  let fixture: ComponentFixture<NavbarComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [
        RouterTestingModule,
        TranslateModule.forRoot(),
        NavbarComponent,
      ],
    }).compileComponents();

    fixture = TestBed.createComponent(NavbarComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create the navbar component', () => {
    expect(component).toBeTruthy();
  });

  it('should set default language as "es"', () => {
    expect(component.currentLanguage).toBe('es');
  });

  it('should toggle menu state', () => {
    component.toggleMenu();
    expect(component.isMenuActive).toBeTrue();
    component.toggleMenu();
    expect(component.isMenuActive).toBeFalse();
  });

  it('should change language and update localStorage', () => {
    const newLang = 'en';
    component.changeLanguage(newLang);
    expect(component.currentLanguage).toBe(newLang);
    expect(localStorage.getItem('selectedLanguage')).toBe(newLang);
  });
});
