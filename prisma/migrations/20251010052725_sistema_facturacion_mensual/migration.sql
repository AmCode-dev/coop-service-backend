/*
  Warnings:

  - Added the required column `updatedAt` to the `historial_conceptos` table without a default value. This is not possible if the table is not empty.

*/
-- CreateEnum
CREATE TYPE "EstadoPeriodo" AS ENUM ('ABIERTO', 'CERRADO', 'FACTURADO');

-- AlterTable
ALTER TABLE "historial_conceptos" ADD COLUMN     "activo" BOOLEAN NOT NULL DEFAULT true,
ADD COLUMN     "creadoPorId" TEXT,
ADD COLUMN     "motivo" TEXT,
ADD COLUMN     "updatedAt" TIMESTAMP(3) NOT NULL;

-- CreateTable
CREATE TABLE "periodos_facturables" (
    "id" TEXT NOT NULL,
    "mes" INTEGER NOT NULL,
    "anio" INTEGER NOT NULL,
    "periodo" TEXT NOT NULL,
    "fechaInicio" TIMESTAMP(3) NOT NULL,
    "fechaFin" TIMESTAMP(3) NOT NULL,
    "estado" "EstadoPeriodo" NOT NULL DEFAULT 'ABIERTO',
    "observaciones" TEXT,
    "fechaCierre" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "creadoPorId" TEXT,
    "cerradoPorId" TEXT,
    "cooperativaId" TEXT NOT NULL,

    CONSTRAINT "periodos_facturables_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "conceptos_facturables_aplicados" (
    "id" TEXT NOT NULL,
    "cantidad" DECIMAL(12,4) NOT NULL,
    "valorUnitario" DECIMAL(12,4) NOT NULL,
    "subtotal" DECIMAL(12,2) NOT NULL,
    "aplicaIVA" BOOLEAN NOT NULL DEFAULT false,
    "porcentajeIVA" DECIMAL(5,2),
    "montoIVA" DECIMAL(12,2) NOT NULL DEFAULT 0,
    "total" DECIMAL(12,2) NOT NULL,
    "observaciones" TEXT,
    "facturado" BOOLEAN NOT NULL DEFAULT false,
    "fechaAplicacion" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "creadoPorId" TEXT,
    "periodoId" TEXT NOT NULL,
    "conceptoId" TEXT NOT NULL,
    "cuentaId" TEXT NOT NULL,
    "cuentaServicioId" TEXT,

    CONSTRAINT "conceptos_facturables_aplicados_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "periodos_facturables_cooperativaId_idx" ON "periodos_facturables"("cooperativaId");

-- CreateIndex
CREATE INDEX "periodos_facturables_estado_idx" ON "periodos_facturables"("estado");

-- CreateIndex
CREATE INDEX "periodos_facturables_mes_anio_idx" ON "periodos_facturables"("mes", "anio");

-- CreateIndex
CREATE UNIQUE INDEX "periodos_facturables_cooperativaId_mes_anio_key" ON "periodos_facturables"("cooperativaId", "mes", "anio");

-- CreateIndex
CREATE INDEX "conceptos_facturables_aplicados_periodoId_idx" ON "conceptos_facturables_aplicados"("periodoId");

-- CreateIndex
CREATE INDEX "conceptos_facturables_aplicados_conceptoId_idx" ON "conceptos_facturables_aplicados"("conceptoId");

-- CreateIndex
CREATE INDEX "conceptos_facturables_aplicados_cuentaId_idx" ON "conceptos_facturables_aplicados"("cuentaId");

-- CreateIndex
CREATE INDEX "conceptos_facturables_aplicados_facturado_idx" ON "conceptos_facturables_aplicados"("facturado");

-- CreateIndex
CREATE UNIQUE INDEX "conceptos_facturables_aplicados_periodoId_conceptoId_cuenta_key" ON "conceptos_facturables_aplicados"("periodoId", "conceptoId", "cuentaId");

-- CreateIndex
CREATE INDEX "historial_conceptos_activo_idx" ON "historial_conceptos"("activo");

-- AddForeignKey
ALTER TABLE "historial_conceptos" ADD CONSTRAINT "historial_conceptos_creadoPorId_fkey" FOREIGN KEY ("creadoPorId") REFERENCES "usuarios"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "periodos_facturables" ADD CONSTRAINT "periodos_facturables_creadoPorId_fkey" FOREIGN KEY ("creadoPorId") REFERENCES "usuarios"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "periodos_facturables" ADD CONSTRAINT "periodos_facturables_cerradoPorId_fkey" FOREIGN KEY ("cerradoPorId") REFERENCES "usuarios"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "periodos_facturables" ADD CONSTRAINT "periodos_facturables_cooperativaId_fkey" FOREIGN KEY ("cooperativaId") REFERENCES "cooperativas"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "conceptos_facturables_aplicados" ADD CONSTRAINT "conceptos_facturables_aplicados_creadoPorId_fkey" FOREIGN KEY ("creadoPorId") REFERENCES "usuarios"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "conceptos_facturables_aplicados" ADD CONSTRAINT "conceptos_facturables_aplicados_periodoId_fkey" FOREIGN KEY ("periodoId") REFERENCES "periodos_facturables"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "conceptos_facturables_aplicados" ADD CONSTRAINT "conceptos_facturables_aplicados_conceptoId_fkey" FOREIGN KEY ("conceptoId") REFERENCES "conceptos_facturables"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "conceptos_facturables_aplicados" ADD CONSTRAINT "conceptos_facturables_aplicados_cuentaId_fkey" FOREIGN KEY ("cuentaId") REFERENCES "cuentas"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "conceptos_facturables_aplicados" ADD CONSTRAINT "conceptos_facturables_aplicados_cuentaServicioId_fkey" FOREIGN KEY ("cuentaServicioId") REFERENCES "cuentas_servicios"("id") ON DELETE SET NULL ON UPDATE CASCADE;
