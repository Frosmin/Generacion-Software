import { Component } from '@angular/core';
import { ExerciseComponent } from '../../components/exercise/exercise.component';

@Component({
  selector: 'app-exercises-list',
  imports: [ExerciseComponent],
  templateUrl: './exercises-list.component.html',
  styleUrl: './exercises-list.component.scss',
})
export class ExercisesListComponent {
  mock = [
    {
      id: 0,
      title: 'Trippi Troppi',
      statement:
        'Trippi Troppi reside en un mundo extraño. El nombre antiguo de cada país consta de tres cadenas. La primera letra de cada cadena se concatena para formar el nombre moderno del país.',
    },
    {
      id: 1,
      title: 'Bobritto Bandito',
      statement:
        'En la ciudad de residencia de Bobritto Bandito, hay un número infinito de casas en una recta numérica infinita, con casas en ...,-2,-1,0,1,2,.... El día 0 inició una plaga infectando a los desafortunados habitantes de la casa 0',
    },
    {
      id: 2,
      title: 'Brr Brrr Patapim',
      statement:
        'Brr Brrr Patapim intenta conocer la clave secreta de Tiramisù, que es una permutación de 2⋅n elementos. Para ayudar a Patapim a adivinarlo, Tiramisù le ha dado una cuadrícula G de n×n, en la que Gi,j',
    },
    {
      id: 3,
      title: 'Apples in Boxes',
      statement:
        'Tom y Jerry encontraron unas manzanas en el sótano. Decidieron jugar a un juego para conseguir algunas manzanas. Hay n cajas, y la i-ésima caja tiene ai manzanas dentro. Tom y Jerry se turnan para coger las manzanas. Tom va primero. En su turno, tienen que hacer lo siguiente:',
    },
  ];
}
