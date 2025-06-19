import { ComponentFixture, TestBed } from '@angular/core/testing';
import { CardCursoComponent } from './card-curso.component';
import { ActivatedRoute } from '@angular/router';

describe('CardCursoComponent', () => {
  let component: CardCursoComponent;
  let fixture: ComponentFixture<CardCursoComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [CardCursoComponent],
      providers: [
        { provide: ActivatedRoute, useValue: {} } // ActivatedRoute mockeado
      ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(CardCursoComponent);
    component = fixture.componentInstance;
    //Asignar un valor de prueba al input content
    component.content = { id:10, goto: 'ruta-prueba', title: 'Curso de Prueba', description: 'Descripción del curso de prueba' };
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
