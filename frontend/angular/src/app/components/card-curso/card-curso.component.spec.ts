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
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
