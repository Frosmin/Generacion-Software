export interface CursoEjemplo {
  subtitle: string;
  subparagraph: string[];
  example: string[];
}

export interface ContenidoCurso {
  title: string;
  paragraph: string[];
  subcontent: CursoEjemplo[];
  instrucciones?: string;
  codigo_incompleto?: string;
  solucion_correcta?: string;
}

export interface CursoDisponible {
  nombre: string;
  mock: ContenidoCurso[];
}