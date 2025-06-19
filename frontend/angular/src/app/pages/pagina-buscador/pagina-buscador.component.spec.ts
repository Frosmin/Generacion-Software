import { ComponentFixture, TestBed } from '@angular/core/testing';

import { PaginaBuscadorComponent } from './pagina-buscador.component';

describe('PaginaBuscadorComponent', () => {
  let component: PaginaBuscadorComponent;
  let fixture: ComponentFixture<PaginaBuscadorComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [PaginaBuscadorComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(PaginaBuscadorComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
