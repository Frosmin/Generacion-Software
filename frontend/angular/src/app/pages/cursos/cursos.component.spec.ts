import { ComponentFixture, TestBed } from '@angular/core/testing';
import { CursosComponent } from './cursos.component';
import { ActivatedRoute } from '@angular/router';

describe('CursosComponent', () => {
  let component: CursosComponent;
  let fixture: ComponentFixture<CursosComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [CursosComponent],
      providers: [
        {provide: ActivatedRoute, useValue: {} } //mockear ActivatedRoute para evitar errores
      ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(CursosComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
