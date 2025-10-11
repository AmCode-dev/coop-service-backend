#!/bin/bash

echo "🔍 Verificando la configuración del módulo de Prisma..."

# Verificar que las dependencias están instaladas
echo "📦 Verificando dependencias..."
npm list prisma @prisma/client

# Validar el schema
echo "🔍 Validando schema de Prisma..."
npx prisma validate

# Generar cliente si no existe
echo "⚙️ Generando cliente de Prisma..."
npx prisma generate

# Compilar la aplicación
echo "🏗️ Compilando aplicación..."
npm run build

echo "✅ ¡Configuración completada exitosamente!"
echo ""
echo "🚀 Para iniciar la aplicación:"
echo "   npm run start:dev"
echo ""
echo "🏥 Endpoints de health check disponibles:"
echo "   GET http://localhost:3000/health"
echo "   GET http://localhost:3000/health/database"
echo "   GET http://localhost:3000/health/stats"
echo ""
echo "📚 Lee PRISMA_MODULE.md para más información"