// courses-list.component.ts
import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import jsPDF from 'jspdf';

interface SectionContent {
  title: string;
  content: string;
}

@Component({
  selector: 'app-courses-list',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './courses-list.component.html',
  styleUrl: './courses-list.component.scss'
})
export class CoursesListComponent {
  currentSection = 'intro';
  
  // Array con todas las lecciones en orden
  sections: string[] = [
    'intro', 'started', 'syntax', 'comments', 'variables', 'datatypes', 
    'numbers', 'casting', 'strings', 'booleans', 'operators',
    'lists', 'tuples', 'sets', 'dictionaries',
    'ifelse', 'while', 'for',
    'functions', 'lambda',
    'classes', 'inheritance',
    'filehandling'
  ];


  // Secciones que tienen contenido implementado
  implementedSections: string[] = [
    'intro', 'started', 'syntax', 'comments', 'variables', 'datatypes', 'strings', 'lists', 'functions'
  ];

  // Ejemplos de código para secciones especiales
examples: Record<string, { title: string, code: string, description: string, tips: string[], operations: string[] }> = {
  lists: {
    title: 'Listas en Python',
    description: 'Las listas son colecciones ordenadas y mutables que permiten elementos duplicados. Son ideales para almacenar secuencias de datos.',
    code: `# Creamos una lista con tres frutas
mi_lista = ["manzana", "plátano", "cereza"]

# Mostramos toda la lista
print(mi_lista)

# Accedemos al segundo elemento (índice 1)
print(mi_lista[1])  # Resultado: plátano

# Agregamos una nueva fruta al final
mi_lista.append("naranja")

# Mostramos la lista actualizada
print(mi_lista)`,
    tips: [
      'Puedes mezclar tipos de datos en una lista.',
      'Las listas pueden contener otras listas (listas anidadas).',
      'Usa slicing: mi_lista[1:3] para obtener una sublista.'
    ],
    operations: [
      'append(x): Agrega un elemento al final',
      'remove(x): Elimina la primera aparición de x',
      'pop(i): Elimina y retorna el elemento en la posición i',
      'sort(): Ordena la lista',
      'reverse(): Invierte el orden de la lista'
    ]
  },
  tuples: {
    title: 'Tuplas en Python',
    description: 'Las tuplas son como listas, pero inmutables. Útiles para datos que no deben cambiar.',
    code: `# Creamos una tupla con tres frutas
mia_tupla = ("manzana", "plátano", "cereza")

# Mostramos toda la tupla
print(mia_tupla)

# Accedemos al primer elemento (índice 0)
print(mia_tupla[0])  # Resultado: manzana`,
    tips: [
      'Las tuplas pueden ser usadas como claves en diccionarios.',
      'Para crear una tupla de un solo elemento: tupla = ("manzana",)',
      'Son más rápidas que las listas para operaciones de solo lectura.'
    ],
    operations: [
      'count(x): Cuenta cuántas veces aparece x',
      'index(x): Devuelve el índice de la primera aparición de x'
    ]
  },
  sets: {
    title: 'Sets en Python',
    description: 'Los sets son colecciones desordenadas, sin elementos duplicados. Ideales para operaciones de conjuntos.',
    code: `# Creamos un set con tres frutas (sin duplicados)
miset = {"manzana", "plátano", "cereza"}

# Mostramos el set
print(miset)

# Agregamos una nueva fruta al set
miset.add("naranja")

# Mostramos el set actualizado
print(miset)`,
    tips: [
      'No puedes acceder a los elementos por índice.',
      'Perfectos para eliminar duplicados de una lista: set([1,2,2,3])',
      'Puedes hacer uniones, intersecciones y diferencias.'
    ],
    operations: [
      'add(x): Agrega un elemento',
      'remove(x): Elimina x (error si no existe)',
      'discard(x): Elimina x (sin error si no existe)',
      'union(set2): Unión de sets',
      'intersection(set2): Intersección de sets',
      'difference(set2): Diferencia de sets'
    ]
  },
  dictionaries: {
    title: 'Diccionarios en Python',
    description: 'Los diccionarios almacenan pares clave:valor. Son ideales para representar entidades y sus atributos.',
    code: `# Creamos un diccionario con dos pares clave:valor
mi_diccionario = {"nombre": "Juan", "edad": 30}

# Mostramos todo el diccionario
print(mi_diccionario)

# Agregamos una nueva clave 'ciudad'
mi_diccionario["ciudad"] = "Bogotá"

# Mostramos el valor asociado a la clave 'nombre'
print(mi_diccionario["nombre"])  # Resultado: Juan` ,
    tips: [
      'Las claves deben ser únicas y de tipo inmutable.',
      'Puedes iterar sobre claves, valores o ambos.',
      'Método get() para acceso seguro: mi_diccionario.get("clave")'
    ],
    operations: [
      'keys(): Lista todas las claves',
      'values(): Lista todos los valores',
      'items(): Lista pares clave-valor',
      'update(dict2): Actualiza con otro diccionario',
      'pop(clave): Elimina clave y retorna su valor'
    ]
  }
};

// Mapeo del contenido de cada sección para exportación
  private sectionContent: Record<string, SectionContent> = {
    intro: {
      title: '¿Qué es Python?',
      content: `Python es un lenguaje de programación popular.

• Python puede ser usado en un servidor para crear aplicaciones web.
• Python puede ser usado junto a software para crear flujos de trabajo.
• Python puede conectarse a sistemas de bases de datos. También puede leer y modificar archivos.
• Python puede ser usado para manejar big data y realizar matemáticas complejas.
• Python puede ser usado para prototipado rápido, o para desarrollo de software listo para producción.

¿Por qué Python?
• Python funciona en diferentes plataformas (Windows, Mac, Linux, Raspberry Pi, etc).
• Python tiene una sintaxis simple similar al idioma inglés.
• Python tiene sintaxis que permite a los desarrolladores escribir programas con menos líneas que otros lenguajes de programación.
• Python funciona en un sistema intérprete, lo que significa que el código puede ser ejecutado tan pronto como se escribe.`
    },
    started: {
      title: 'Python - Empezar',
      content: `Python es un lenguaje de programación interpretado, esto significa que como desarrollador escribes archivos Python (.py) en un editor de texto y luego pones esos archivos en el intérprete de Python para ser ejecutados.

Ejemplo:
print("¡Hola, Mundo!")

Instalación de Python
Muchas PC y Mac ya tendrán Python instalado.
Para verificar si tienes Python instalado en una PC con Windows, busca Python en el menú de inicio o ejecuta lo siguiente en la línea de comandos:

C:\\Users\\Tu Nombre>python --version`
    },
    syntax: {
      title: 'Sintaxis de Python',
      content: `La sintaxis de Python puede ser ejecutada escribiendo directamente en la línea de comandos:

Ejemplo:
>>> print("¡Hola, Mundo!")
¡Hola, Mundo!

Indentación de Python
La indentación se refiere a los espacios al comienzo de una línea de código.
Donde en otros lenguajes de programación la indentación en el código es solo para legibilidad, la indentación en Python es muy importante.

Ejemplo:
if 5 > 2:
    print("Cinco es mayor que dos!")`
    },
    comments: {
      title: 'Comentarios en Python',
      content: `Los comentarios pueden ser usados para explicar código Python.
Los comentarios pueden ser usados para hacer el código más legible.
Los comentarios pueden ser usados para prevenir ejecución cuando se prueba código.

Creando un Comentario
Los comentarios comienzan con un #, y Python los ignorará:

Ejemplo:
# Esto es un comentario
print("¡Hola, Mundo!")

Comentarios Multilínea
Python realmente no tiene una sintaxis para comentarios multilínea.
Para agregar un comentario multilínea puedes insertar un # para cada línea:

Ejemplo:
# Este es un comentario
# escrito en
# más de una línea
print("¡Hola, Mundo!")`
    },
    variables: {
      title: 'Variables de Python',
      content: `Las variables son contenedores para almacenar valores de datos.

Creando Variables
Python no tiene comando para declarar una variable.
Una variable se crea en el momento que le asignas un valor por primera vez.

Ejemplo:
x = 5
y = "Juan"
print(x)
print(y)

Las variables no necesitan ser declaradas con ningún tipo particular, e incluso pueden cambiar de tipo después de haber sido establecidas.

Ejemplo:
x = 4       # x es de tipo int
x = "Sally" # x es ahora de tipo str
print(x)`
    },
    datatypes: {
      title: 'Tipos de Datos en Python',
      content: `En programación, el tipo de dato es un concepto importante.
Las variables pueden almacenar datos de diferentes tipos, y diferentes tipos pueden hacer diferentes cosas.

Python tiene los siguientes tipos de datos incorporados por defecto, en estas categorías:

• Tipo Texto: str
• Tipos Numéricos: int, float, complex
• Tipos Secuencia: list, tuple, range
• Tipo Mapeo: dict
• Tipos Set: set, frozenset
• Tipo Booleano: bool
• Tipos Binarios: bytes, bytearray, memoryview

Ejemplo:
x = 5
print(type(x))`
    },
    strings: {
      title: 'Python Strings',
      content: `Las cadenas en Python están rodeadas por comillas simples o dobles.
'hola' es lo mismo que "hola".
Puedes mostrar una cadena literal con la función print():

Ejemplo:
print("Hola")
print('Hola')

Strings Multilínea
Puedes asignar un string multilínea a una variable usando tres comillas:

Ejemplo:
a = """Lorem ipsum dolor sit amet,
consectetur adipiscing elit,
sed do eiusmod tempor incididunt
ut labore et dolore magna aliqua."""
print(a)

Los Strings son Arrays
Como muchos otros lenguajes de programación populares, los strings en Python son arrays de bytes que representan caracteres unicode.

Ejemplo:
a = "Hola, Mundo!"
print(a[1])
Resultado: o`
    },
    lists: {
      title: 'Listas en Python',
      content: `Las listas se usan para almacenar múltiples elementos en una sola variable.
Las listas son uno de los 4 tipos de datos incorporados en Python usados para almacenar colecciones de datos.

Ejemplo:
mialista = ["manzana", "plátano", "cereza"]
print(mialista)

Elementos de Lista
Los elementos de lista están ordenados, son cambiables, y permiten valores duplicados.
Los elementos de lista están indexados, el primer elemento tiene índice [0], el segundo elemento tiene índice [1] etc.

Ejemplo:
mialista = ["manzana", "plátano", "cereza"]
print(mialista[0])`
    },
    functions: {
      title: 'Funciones en Python',
      content: `Una función es un bloque de código que solo se ejecuta cuando es llamado.
Puedes pasar datos, conocidos como parámetros, a una función.
Una función puede devolver datos como resultado.

Creando una Función
En Python una función se define usando la palabra clave def:

Ejemplo:
def mi_funcion():
    print("Hola desde una función")

Llamando una Función
Para llamar una función, usa el nombre de la función seguido de paréntesis:

Ejemplo:
def mi_funcion():
    print("Hola desde una función")

mi_funcion()`
    }
  };

  changeSection(section: string): void {
    this.currentSection = section;
  }

  isValidSection(section: string): boolean {
    return this.implementedSections.includes(section);
  }

  getCurrentSectionIndex(): number {
    return this.sections.indexOf(this.currentSection);
  }

  isFirstSection(): boolean {
    return this.getCurrentSectionIndex() === 0;
  }

  isLastSection(): boolean {
    return this.getCurrentSectionIndex() === this.sections.length - 1;
  }

  previousSection(): void {
    const currentIndex = this.getCurrentSectionIndex();
    if (currentIndex > 0) {
      this.currentSection = this.sections[currentIndex - 1];
    }
  }

  nextSection(): void {
    const currentIndex = this.getCurrentSectionIndex();
    if (currentIndex < this.sections.length - 1) {
      this.currentSection = this.sections[currentIndex + 1];
    }
  }

  descargarComoTxt(): void {
    try {
      const currentContent = this.sectionContent[this.currentSection];
      
      if (!currentContent) {
        alert('El contenido de esta sección no está disponible para descarga.');
        return;
      }

      const content = `${currentContent.title}\n${'='.repeat(currentContent.title.length)}\n\n${currentContent.content}`;
      
      const blob = new Blob([content], { type: 'text/plain;charset=utf-8' });
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement('a');
      
      link.href = url;
      link.download = `python-tutorial-${this.currentSection}.txt`;
      document.body.appendChild(link);
      link.click();
      
      // Limpieza
      document.body.removeChild(link);
      window.URL.revokeObjectURL(url);
    } catch (error) {
      console.error('Error al descargar archivo TXT:', error);
      alert('Hubo un error al descargar el archivo. Por favor, inténtalo de nuevo.');
    }
  }

  descargarComoPDF(): void {
    try {
      const currentContent = this.sectionContent[this.currentSection];
      
      if (!currentContent) {
        alert('El contenido de esta sección no está disponible para descarga.');
        return;
      }

      const doc = new jsPDF();
      
      // Configuración de fuentes y colores
      doc.setFont('helvetica', 'bold');
      doc.setFontSize(18);
      doc.setTextColor(255, 110, 196); // Color rosa similar al diseño
      
      // Título
      const title = currentContent.title;
      doc.text(title, 20, 30);
      
      // Línea decorativa
      doc.setDrawColor(255, 110, 196);
      doc.setLineWidth(0.5);
      doc.line(20, 35, 190, 35);
      
      // Contenido
      doc.setFont('helvetica', 'normal');
      doc.setFontSize(11);
      doc.setTextColor(60, 60, 60);
      
      const content = currentContent.content;
      const lines = doc.splitTextToSize(content, 170);
      
      let yPosition = 50;
      const pageHeight = doc.internal.pageSize.height;
      const marginBottom = 20;
      
      for (const line of lines) {
        if (yPosition > pageHeight - marginBottom) {
          doc.addPage();
          yPosition = 30;
        }
        
        doc.text(line, 20, yPosition);
        yPosition += 6;
      }
      
      // Footer
       // Footer
      const pageCount = doc.getNumberOfPages(); 
      for (let i = 1; i <= pageCount; i++) {
        doc.setPage(i);
        doc.setFontSize(8);
        doc.setTextColor(150, 150, 150);
        doc.text(`Tutorial Python - ${title}`, 20, pageHeight - 10);
        doc.text(`Página ${i} de ${pageCount}`, 170, pageHeight - 10);
      }
      
      // Guardar archivo
      doc.save(`python-tutorial-${this.currentSection}.pdf`);
      
    } catch (error) {
      console.error('Error al generar PDF:', error);
      alert('Hubo un error al generar el PDF. Por favor, inténtalo de nuevo.');
    }
    
  }


}