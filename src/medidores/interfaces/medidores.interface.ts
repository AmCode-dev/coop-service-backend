export interface MedidorDetalle {
  id: string;
  numeroMedidor: string;
  marca?: string;
  modelo?: string;
  fechaInstalacion?: Date;
  activo: boolean;
  observaciones?: string;
  createdAt: Date;
  updatedAt: Date;
  cooperativaId: string;
  inmuebleId?: string;
  
  // Relaciones pobladas
  cooperativa?: {
    id: string;
    nombre: string;
  };
  inmueble?: {
    id: string;
    domicilio: string;
    localidad: string;
    titularInmueble: {
      nombreCompleto: string;
    };
  };
  cuentasServicios?: Array<{
    id: string;
    activo: boolean;
    servicio: {
      nombre: string;
      codigo: string;
    };
    categoria: {
      nombre: string;
    };
  }>;
  lecturaActual?: {
    id: string;
    valorLectura: number;
    fechaLectura: Date;
    consumoCalculado?: number;
  };
  ultimasLecturas?: LecturaResumen[];
}

export interface LecturaDetalle {
  id: string;
  fechaLectura: Date;
  valorLectura: number;
  consumoCalculado?: number;
  mes: number;
  anio: number;
  observaciones?: string;
  esPrincipal: boolean;
  lecturaAnterior?: number;
  anomalia: boolean;
  tipoAnomalia?: string;
  createdAt: Date;
  
  medidorId: string;
  medidor?: {
    id: string;
    numeroMedidor: string;
    marca?: string;
    modelo?: string;
  };
  
  tomadoPorId?: string;
  tomadoPor?: {
    id: string;
    nombre: string;
    apellido: string;
  };
  
  facturaId?: string;
  factura?: {
    id: string;
    numeroFactura: string;
    periodo: string;
  };
}

export interface LecturaResumen {
  id: string;
  fechaLectura: Date;
  valorLectura: number;
  consumoCalculado?: number;
  mes: number;
  anio: number;
  esPrincipal: boolean;
  anomalia: boolean;
}

export interface EstadisticasMedidor {
  medidorId: string;
  numeroMedidor: string;
  
  // Estadísticas temporales
  tiempoInstalacion: {
    dias: number;
    meses: number;
    años: number;
    necesitaCambio: boolean; // Si lleva más de X años
  };
  
  // Estadísticas de consumo
  consumo: {
    promedioMensual: number;
    ultimosSeisPromedios: number[];
    variacionPorcentual: number;
    tieneCreceimientoAnomalov: boolean; // Más del 30%
    tendencia: 'CRECIENTE' | 'DECRECIENTE' | 'ESTABLE';
  };
  
  // Lecturas
  lecturas: {
    total: number;
    ultimaLectura?: LecturaResumen;
    lecturaMasAntigua?: LecturaResumen;
    anomaliasDetectadas: number;
    frecuenciaLecturas: 'REGULAR' | 'IRREGULAR' | 'ESCASA';
  };
  
  // Estado general
  estado: {
    activo: boolean;
    necesitaAtencion: boolean;
    motivosAtencion: string[];
    puntuacionSalud: number; // 0-100
  };
}

export interface HistorialVinculacion {
  id: string;
  tipoVinculacion: 'CUENTA_SERVICIO' | 'INMUEBLE';
  accion: 'VINCULACION' | 'DESVINCULACION' | 'CAMBIO';
  entidadAnteriorId?: string;
  entidadNuevaId?: string;
  motivo?: string;
  observaciones?: string;
  fechaOperacion: Date;
  
  medidorId: string;
  operadoPorId: string;
  operadoPor: {
    id: string;
    nombre: string;
    apellido: string;
  };
}

export interface FiltrosMedidores {
  activo?: boolean;
  inmuebleId?: string;
  marca?: string;
  modelo?: string;
  fechaInstalacionDesde?: Date;
  fechaInstalacionHasta?: Date;
  conLecturasRecientes?: boolean;
  necesitaAtencion?: boolean;
  busqueda?: string; // Buscar en número, marca, modelo
  limite?: number;
  pagina?: number;
  ordenPor?: 'numeroMedidor' | 'fechaInstalacion' | 'ultimaLectura';
  orden?: 'asc' | 'desc';
}

export interface ResultadoPaginado<T> {
  items: T[];
  total: number;
  pagina: number;
  limite: number;
  totalPaginas: number;
}