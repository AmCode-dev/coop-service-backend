/*
  Warnings:

  - Added the required column `updatedAt` to the `historial_precios_categorias` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "historial_precios_categorias" ADD COLUMN     "activo" BOOLEAN NOT NULL DEFAULT true,
ADD COLUMN     "creadoPorId" TEXT,
ADD COLUMN     "observaciones" TEXT,
ADD COLUMN     "updatedAt" TIMESTAMP(3) NOT NULL;

-- CreateIndex
CREATE INDEX "historial_precios_categorias_vigenciaDesde_idx" ON "historial_precios_categorias"("vigenciaDesde");

-- CreateIndex
CREATE INDEX "historial_precios_categorias_activo_idx" ON "historial_precios_categorias"("activo");

-- AddForeignKey
ALTER TABLE "historial_precios_categorias" ADD CONSTRAINT "historial_precios_categorias_creadoPorId_fkey" FOREIGN KEY ("creadoPorId") REFERENCES "usuarios"("id") ON DELETE SET NULL ON UPDATE CASCADE;
