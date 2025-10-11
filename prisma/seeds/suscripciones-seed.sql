-- ============================================
-- SCRIPT DE DATOS INICIALES PARA SUSCRIPCIONES
-- ============================================

-- Insertar configuración de datos bancarios por defecto
INSERT INTO configuraciones_datos_bancarios (
    id,
    nombre_cuenta,
    nombre_banco,
    cbu,
    alias,
    razon_social_titular,
    cuit_titular,
    domicilio_fiscal,
    activo,
    es_principal,
    instrucciones_pago,
    horario_atencion,
    email_contacto,
    telefono_contacto,
    creado_por_super_admin,
    created_at,
    updated_at
) VALUES (
    gen_random_uuid(),
    'Sistema Cooperativo S.A.',
    'Banco de la Nación Argentina',
    '0110599520000001234567',
    'SISTEMA.COOP.AR',
    'Sistema Cooperativo S.A.',
    '30-12345678-9',
    'Av. Corrientes 1234, CABA, Argentina',
    true,
    true,
    'Transferir a la cuenta indicada con el número de factura en el concepto. Una vez realizada la transferencia, enviar comprobante por email.',
    'Lunes a Viernes de 9:00 a 17:00 hs',
    'pagos@sistemacooperativo.com',
    '+54 11 4000-0000',
    'sistema',
    NOW(),
    NOW()
);

-- Función para crear configuración de suscripción por defecto
CREATE OR REPLACE FUNCTION crear_configuracion_suscripcion_default(
    p_cooperativa_id VARCHAR(25),
    p_porcentaje_comision DECIMAL(5,4) DEFAULT 2.5000
)
RETURNS VARCHAR(25)
LANGUAGE plpgsql
AS $$
DECLARE
    v_config_id VARCHAR(25);
BEGIN
    -- Generar ID para la configuración
    v_config_id := gen_random_uuid()::text;
    
    -- Insertar configuración de suscripción
    INSERT INTO configuraciones_suscripcion (
        id,
        cooperativa_id,
        porcentaje_comision,
        comision_minima,
        dia_generacion_factura,
        dias_vencimiento_factura,
        incluye_iva,
        porcentaje_iva,
        observaciones,
        activa,
        fecha_inicio_suscripcion,
        fecha_ultim_modificacion,
        notificar_generacion_factura,
        notificar_vencimiento_factura,
        dias_aviso_vencimiento,
        modificado_por_super_admin,
        created_at,
        updated_at
    ) VALUES (
        v_config_id,
        p_cooperativa_id,
        p_porcentaje_comision,
        0.00,
        1, -- Día 1 de cada mes
        30, -- 30 días de vencimiento
        true,
        21.00, -- 21% IVA
        'Configuración inicial del sistema',
        true,
        NOW(),
        NOW(),
        true,
        true,
        7, -- 7 días de aviso
        'sistema',
        NOW(),
        NOW()
    );
    
    RETURN v_config_id;
END;
$$;

-- Función para generar factura de suscripción
CREATE OR REPLACE FUNCTION generar_factura_suscripcion(
    p_cooperativa_id VARCHAR(25),
    p_mes INTEGER,
    p_anio INTEGER
)
RETURNS TABLE (
    factura_id VARCHAR(25),
    total_factura DECIMAL(12,2),
    cantidad_pagos INTEGER,
    monto_total_pagos DECIMAL(15,2)
)
LANGUAGE plpgsql
AS $$
DECLARE
    v_config RECORD;
    v_factura_id VARCHAR(25);
    v_fecha_inicio DATE;
    v_fecha_fin DATE;
    v_cantidad_pagos INTEGER;
    v_monto_total_pagos DECIMAL(15,2);
    v_porcentaje_comision DECIMAL(5,4);
    v_subtotal_comision DECIMAL(12,2);
    v_monto_iva DECIMAL(12,2);
    v_total_factura DECIMAL(12,2);
    v_fecha_vencimiento DATE;
    v_periodo VARCHAR(7);
BEGIN
    -- Obtener configuración de suscripción
    SELECT * INTO v_config
    FROM configuraciones_suscripcion 
    WHERE cooperativa_id = p_cooperativa_id AND activa = true;
    
    IF NOT FOUND THEN
        RAISE EXCEPTION 'No se encontró configuración de suscripción para la cooperativa %', p_cooperativa_id;
    END IF;
    
    -- Calcular fechas del período
    v_fecha_inicio := DATE(p_anio || '-' || LPAD(p_mes::text, 2, '0') || '-01');
    v_fecha_fin := (v_fecha_inicio + INTERVAL '1 month' - INTERVAL '1 day')::DATE;
    
    -- Calcular estadísticas de pagos del mes
    SELECT 
        COUNT(*),
        COALESCE(SUM(monto), 0)
    INTO v_cantidad_pagos, v_monto_total_pagos
    FROM pagos p
    INNER JOIN facturas f ON p.factura_id = f.id
    INNER JOIN cuentas c ON f.cuenta_id = c.id
    WHERE c.cooperativa_id = p_cooperativa_id
      AND p.fecha_pago >= v_fecha_inicio
      AND p.fecha_pago <= v_fecha_fin;
    
    -- Si no hay pagos, no generar factura
    IF v_cantidad_pagos = 0 THEN
        RAISE EXCEPTION 'No hay pagos registrados para el período %/%', p_mes, p_anio;
    END IF;
    
    -- Calcular comisión
    v_porcentaje_comision := v_config.porcentaje_comision;
    v_subtotal_comision := v_monto_total_pagos * (v_porcentaje_comision / 100);
    
    -- Aplicar comisión mínima si corresponde
    IF v_config.comision_minima IS NOT NULL AND v_subtotal_comision < v_config.comision_minima THEN
        v_subtotal_comision := v_config.comision_minima;
    END IF;
    
    -- Aplicar comisión máxima si corresponde
    IF v_config.comision_maxima IS NOT NULL AND v_subtotal_comision > v_config.comision_maxima THEN
        v_subtotal_comision := v_config.comision_maxima;
    END IF;
    
    -- Calcular IVA
    IF v_config.incluye_iva THEN
        v_monto_iva := v_subtotal_comision * (v_config.porcentaje_iva / 100);
    ELSE
        v_monto_iva := 0;
    END IF;
    
    v_total_factura := v_subtotal_comision + v_monto_iva;
    
    -- Calcular fecha de vencimiento
    v_fecha_vencimiento := DATE(p_anio || '-' || LPAD(p_mes::text, 2, '0') || '-' || LPAD(v_config.dia_generacion_factura::text, 2, '0'));
    v_fecha_vencimiento := v_fecha_vencimiento + INTERVAL '1 day' * v_config.dias_vencimiento_factura;
    
    -- Generar período
    v_periodo := LPAD(p_mes::text, 2, '0') || '/' || p_anio::text;
    
    -- Generar ID de factura
    v_factura_id := gen_random_uuid()::text;
    
    -- Insertar factura de suscripción
    INSERT INTO suscripciones_facturas (
        id,
        configuracion_id,
        mes,
        anio,
        periodo,
        fecha_generacion,
        fecha_vencimiento,
        cantidad_pagos,
        monto_total_pagos,
        porcentaje_comision,
        subtotal_comision,
        monto_iva,
        total_factura,
        estado,
        generado_por_sistema,
        created_at,
        updated_at
    ) VALUES (
        v_factura_id,
        v_config.id,
        p_mes,
        p_anio,
        v_periodo,
        NOW(),
        v_fecha_vencimiento,
        v_cantidad_pagos,
        v_monto_total_pagos,
        v_porcentaje_comision,
        v_subtotal_comision,
        v_monto_iva,
        v_total_factura,
        'GENERADA',
        true,
        NOW(),
        NOW()
    );
    
    -- Retornar resultados
    RETURN QUERY SELECT 
        v_factura_id,
        v_total_factura,
        v_cantidad_pagos,
        v_monto_total_pagos;
END;
$$;

-- Función para obtener resumen de comisiones por período
CREATE OR REPLACE FUNCTION obtener_resumen_comisiones(
    p_mes INTEGER,
    p_anio INTEGER
)
RETURNS TABLE (
    total_cooperativas INTEGER,
    total_pagos_realizados BIGINT,
    monto_total_procesado DECIMAL(15,2),
    comision_total_generada DECIMAL(15,2),
    facturas_generadas BIGINT,
    facturas_aprobadas BIGINT,
    facturas_pagadas BIGINT
)
LANGUAGE plpgsql
AS $$
BEGIN
    RETURN QUERY
    WITH estadisticas AS (
        SELECT 
            COUNT(DISTINCT sf.configuracion_id) as cooperativas_con_factura,
            SUM(sf.cantidad_pagos) as total_pagos,
            SUM(sf.monto_total_pagos) as monto_total,
            SUM(sf.subtotal_comision + sf.monto_iva) as comision_total,
            COUNT(*) as facturas_gen,
            COUNT(*) FILTER (WHERE sf.estado IN ('APROBADA', 'PAGADA')) as facturas_apr,
            COUNT(*) FILTER (WHERE sf.estado = 'PAGADA') as facturas_pag
        FROM suscripciones_facturas sf
        WHERE sf.mes = p_mes AND sf.anio = p_anio
    )
    SELECT 
        COALESCE(e.cooperativas_con_factura::INTEGER, 0),
        COALESCE(e.total_pagos, 0),
        COALESCE(e.monto_total, 0.00),
        COALESCE(e.comision_total, 0.00),
        COALESCE(e.facturas_gen, 0),
        COALESCE(e.facturas_apr, 0),
        COALESCE(e.facturas_pag, 0)
    FROM estadisticas e;
END;
$$;

-- Función para obtener estadísticas de una cooperativa
CREATE OR REPLACE FUNCTION obtener_estadisticas_cooperativa(
    p_cooperativa_id VARCHAR(25),
    p_meses_atras INTEGER DEFAULT 12
)
RETURNS TABLE (
    mes INTEGER,
    anio INTEGER,
    cantidad_pagos INTEGER,
    monto_total_pagos DECIMAL(15,2),
    comision_generada DECIMAL(12,2),
    factura_pagada BOOLEAN
)
LANGUAGE plpgsql
AS $$
DECLARE
    v_fecha_inicio DATE;
BEGIN
    -- Calcular fecha de inicio (meses atrás)
    v_fecha_inicio := DATE_TRUNC('month', NOW() - INTERVAL '1 month' * p_meses_atras);
    
    RETURN QUERY
    WITH meses AS (
        SELECT 
            EXTRACT(MONTH FROM fecha)::INTEGER as mes,
            EXTRACT(YEAR FROM fecha)::INTEGER as anio
        FROM generate_series(
            v_fecha_inicio,
            DATE_TRUNC('month', NOW() - INTERVAL '1 month'),
            '1 month'::INTERVAL
        ) as fecha
    )
    SELECT 
        m.mes,
        m.anio,
        COALESCE(sf.cantidad_pagos, 0)::INTEGER,
        COALESCE(sf.monto_total_pagos, 0.00),
        COALESCE(sf.subtotal_comision + sf.monto_iva, 0.00),
        COALESCE(sf.estado = 'PAGADA', false)
    FROM meses m
    LEFT JOIN suscripciones_facturas sf ON sf.mes = m.mes 
        AND sf.anio = m.anio
        AND sf.configuracion_id IN (
            SELECT id FROM configuraciones_suscripcion 
            WHERE cooperativa_id = p_cooperativa_id
        )
    ORDER BY m.anio, m.mes;
END;
$$;

-- Crear índices para optimizar consultas
CREATE INDEX IF NOT EXISTS idx_suscripciones_facturas_cooperativa_periodo 
ON suscripciones_facturas USING btree (configuracion_id, mes, anio);

CREATE INDEX IF NOT EXISTS idx_suscripciones_facturas_estado_fecha 
ON suscripciones_facturas USING btree (estado, fecha_vencimiento);

CREATE INDEX IF NOT EXISTS idx_solicitudes_cambio_comision_estado 
ON solicitudes_cambio_comision USING btree (estado, fecha_solicitud);

CREATE INDEX IF NOT EXISTS idx_configuraciones_suscripcion_activa 
ON configuraciones_suscripcion USING btree (activa, cooperativa_id);

-- Comentarios en las tablas
COMMENT ON TABLE configuraciones_suscripcion IS 'Configuraciones de suscripción y comisiones por cooperativa';
COMMENT ON TABLE solicitudes_cambio_comision IS 'Solicitudes de cambio de comisión enviadas por las cooperativas';
COMMENT ON TABLE suscripciones_facturas IS 'Facturas mensuales generadas por el uso del sistema';
COMMENT ON TABLE configuraciones_datos_bancarios IS 'Datos bancarios para recibir pagos de suscripciones';
COMMENT ON TABLE historial_configuraciones_suscripcion IS 'Historial de cambios en las configuraciones de suscripción';

-- Comentarios en columnas importantes
COMMENT ON COLUMN configuraciones_suscripcion.porcentaje_comision IS 'Porcentaje de comisión sobre los pagos (ej: 2.5000 = 2.5%)';
COMMENT ON COLUMN suscripciones_facturas.monto_total_pagos IS 'Suma total de pagos procesados en el mes';
COMMENT ON COLUMN suscripciones_facturas.subtotal_comision IS 'Comisión calculada antes de impuestos';
COMMENT ON COLUMN suscripciones_facturas.total_factura IS 'Total final a pagar (comisión + IVA)';

COMMIT;