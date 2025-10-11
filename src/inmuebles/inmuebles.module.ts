import { Module } from '@nestjs/common';
import { MulterModule } from '@nestjs/platform-express';
import { diskStorage } from 'multer';
import { extname } from 'path';

// Servicios
import { InmueblesService } from './services/inmuebles-simple.service';
import { LegajosService } from './services/legajos.service';
import { ConfiguracionSistemaService } from './services/configuracion-sistema.service';

// Controladores
import { InmueblesController } from './controllers/inmuebles.controller';

@Module({
  imports: [
    // Configuración de multer para subida de documentos de legajos
    MulterModule.register({
      storage: diskStorage({
        destination: './uploads/legajos',
        filename: (req, file, callback) => {
          const uniqueSuffix =
            Date.now() + '-' + Math.round(Math.random() * 1e9);
          const extension = extname(file.originalname);
          callback(null, `${file.fieldname}-${uniqueSuffix}${extension}`);
        },
      }),
      fileFilter: (req, file, callback) => {
        // Permitir archivos de documentos comunes
        const allowedTypes = [
          'image/jpeg',
          'image/png',
          'image/tiff',
          'application/pdf',
          'application/msword',
          'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
        ];

        if (allowedTypes.includes(file.mimetype)) {
          callback(null, true);
        } else {
          callback(new Error('Tipo de archivo no permitido'), false);
        }
      },
      limits: {
        fileSize: 50 * 1024 * 1024, // 50MB
      },
    }),
  ],
  controllers: [InmueblesController],
  providers: [InmueblesService, LegajosService, ConfiguracionSistemaService],
  exports: [InmueblesService, LegajosService, ConfiguracionSistemaService],
})
export class InmueblesModule {}