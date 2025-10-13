// 🚀 FLUJO COMPLETO - EJEMPLO DE IMPLEMENTACIÓN
// ========================================================

// 1️⃣ PASO 1: Solicitar acceso
async function solicitarAccesoCooperativa() {
    const datosCooperativa = {
        cooperativa: {
            nombre: "Cooperativa San Martín",
            razonSocial: "Cooperativa San Martín Ltda.",
            cuit: "30-12345678-9",
            domicilio: "Av. Principal 123",
            localidad: "Buenos Aires",
            provincia: "Buenos Aires",
            codigoPostal: "1000"
        },
        solicitante: {
            email: "admin@sanmartin.coop",
            nombre: "Juan",
            apellido: "Pérez",
            documento: "12345678"
        }
    };

    try {
        // 🎯 SOLICITAR ACCESO
        const response = await fetch('/cooperativas/solicitar-acceso', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(datosCooperativa)
        });

        const resultado = await response.json();
        
        if (resultado.success) {
            const { sessionId, codigoReferencia, cooperativaId } = resultado.data;
            
            console.log('✅ Solicitud iniciada:', {
                sessionId,
                codigoReferencia,
                cooperativaId
            });

            // 🎭 PASO 2: Conectar al progreso inmediatamente
            conectarProgreso(sessionId);
            
            return { sessionId, codigoReferencia };
        }
    } catch (error) {
        console.error('❌ Error:', error);
        throw error;
    }
}

// 2️⃣ PASO 2: Conectar al progreso en tiempo real
function conectarProgreso(sessionId) {
    const eventSource = new EventSource(`/cooperativas/progress/${sessionId}`);
    
    eventSource.onmessage = function(event) {
        const progreso = JSON.parse(event.data);
        mostrarProgreso(progreso);
    };
    
    eventSource.onerror = function(error) {
        console.error('Error SSE:', error);
    };
    
    // Cerrar conexión cuando termine
    eventSource.addEventListener('complete', () => {
        eventSource.close();
    });
}

// 3️⃣ PASO 3: Mostrar progreso visual
function mostrarProgreso(progreso) {
    const { step, message, progress, status, data } = progreso;
    
    console.log(`📊 ${progress}% - ${step}: ${message}`);
    
    // Actualizar UI
    updateProgressBar(progress);
    addLogEntry(step, message, status);
    
    // Si completó (100%), continuar con siguientes pasos
    if (progress >= 100) {
        console.log('🎉 ¡Proceso completado!');
        onProcesoCompleto(data);
    }
}

// 4️⃣ PASO 4: Acciones post-completado
function onProcesoCompleto(data) {
    const { cooperativaId, codigoReferencia } = data;
    
    // Ahora puedes hacer otras acciones:
    // - Mostrar mensaje de éxito
    // - Redirigir a página de login
    // - Enviar email de confirmación
    // - Guardar datos en localStorage
    
    console.log('🏢 Cooperativa creada:', cooperativaId);
    console.log('📝 Código de referencia:', codigoReferencia);
    
    // Ejemplo: redirigir a login
    window.location.href = `/login?cooperativa=${cooperativaId}`;
}

// 📊 EVENTOS QUE RECIBIRÁS POR SSE:
// ========================================================
/*
1. VALIDATION (5-10%):
   { step: "VALIDATION", message: "Validando datos...", progress: 5, status: "info" }

2. CREATE_COOPERATIVA (15-25%):
   { step: "CREATE_COOPERATIVA", message: "Creando cooperativa...", progress: 20, status: "success" }

3. CREATE_SECTIONS (35-45%):
   { step: "CREATE_SECTIONS", message: "Creando secciones del sistema...", progress: 40, status: "info" }

4. CREATE_ROLES (50-60%):
   { step: "CREATE_ROLES", message: "Configurando roles y permisos...", progress: 55, status: "info" }

5. CREATE_ONBOARDING_CONFIG (65-70%):
   { step: "CREATE_ONBOARDING_CONFIG", message: "Configurando onboarding...", progress: 68, status: "success" }

6. CREATE_ONBOARDING (75-90%):
   { step: "CREATE_ONBOARDING", message: "Proceso de onboarding configurado", progress: 85, status: "success" }

7. COMPLETED (100%):
   { step: "COMPLETED", message: "Solicitud registrada exitosamente", progress: 100, status: "success", 
     data: { cooperativaId: "uuid", codigoReferencia: "COOP-20251011-ABC123" } }
*/

// 🎯 USO COMPLETO:
// ========================================================
async function flujoCompleto() {
    try {
        // 1. Solicitar acceso (esto automáticamente conecta al progreso)
        const { sessionId, codigoReferencia } = await solicitarAccesoCooperativa();
        
        // 2. El progreso se muestra automáticamente vía SSE
        console.log('⏳ Monitoreando progreso...', sessionId);
        
        // 3. Cuando termine (100%), se ejecuta onProcesoCompleto()
        console.log('🆔 Código para seguimiento:', codigoReferencia);
        
    } catch (error) {
        console.error('💥 Error en el flujo:', error);
    }
}

// 🔄 VERIFICAR ESTADO POSTERIOR (Opcional)
// ========================================================
async function verificarEstadoSolicitud(codigoReferencia) {
    const response = await fetch(`/cooperativas/solicitud-acceso/${codigoReferencia}`);
    const estado = await response.json();
    
    console.log('📋 Estado actual:', estado.data);
    /*
    Respuesta ejemplo:
    {
      solicitud: {
        codigoReferencia: "COOP-20251011-ABC123",
        estado: "COMPLETADO",
        fechaCreacion: "2025-10-11T...",
        fechaVencimiento: "2025-11-25T..."
      },
      cooperativa: {
        nombre: "Cooperativa San Martín",
        activa: false  // Se activa cuando admin la apruebe
      },
      mensaje: "¡Felicitaciones! Tu cooperativa ha sido aprobada..."
    }
    */
}

export { flujoCompleto, verificarEstadoSolicitud };