import { ComponentFixture, TestBed } from '@angular/core/testing';

import { CardCursoComponent } from './card-curso.component';

describe('CardCursoComponent', () => {
  let component: CardCursoComponent;
  let fixture: ComponentFixture<CardCursoComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [CardCursoComponent]
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
