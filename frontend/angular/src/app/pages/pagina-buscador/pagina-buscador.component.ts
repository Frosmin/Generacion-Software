import { Component } from '@angular/core';
import { BuscadorComponent } from '../../components/buscador/buscador.component';  // Importa el componente buscador

@Component({
  selector: 'app-pagina-buscador',
  standalone: true,
  imports: [BuscadorComponent],  // Asegúrate de que BuscadorComponent esté aquí
  templateUrl: './pagina-buscador.component.html',
})
export class PaginaBuscadorComponent {}
