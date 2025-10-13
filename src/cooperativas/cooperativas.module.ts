import { Module } from '@nestjs/common';
import { MulterModule } from '@nestjs/platform-express';
import { diskStorage } from 'multer';
import { extname } from 'path';

// Servicios
import { CooperativasService } from './cooperativas.service';
import { CooperativasProgressService } from './cooperativas-progress.service';
import { OnboardingService } from './services/onboarding.service';
import { ConfiguracionOnboardingService } from './services/configuracion-onboarding.service';

// Controladores
import { CooperativasController } from './controllers/cooperativas.controller';
import { OnboardingController } from './controllers/onboarding.controller';
import { ConfiguracionOnboardingController } from './controllers/configuracion-onboarding.controller';

@Module({
  imports: [
    // Configuración de multer para subida de archivos
    MulterModule.register({
      storage: diskStorage({
        destination: './uploads/onboarding',
        filename: (req, file, callback) => {
          const uniqueSuffix =
            Date.now() + '-' + Math.round(Math.random() * 1e9);
          const extension = extname(file.originalname);
          callback(null, `${file.fieldname}-${uniqueSuffix}${extension}`);
        },
      }),
      fileFilter: (req, file, callback) => {
        // Permitir solo ciertos tipos de archivos
        const allowedTypes = [
          'image/jpeg',
          'image/png',
          'image/tiff',
          'application/pdf',
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
  controllers: [
    CooperativasController,
    OnboardingController,
    ConfiguracionOnboardingController,
  ],
  providers: [
    CooperativasService,
    CooperativasProgressService,
    OnboardingService,
    ConfiguracionOnboardingService,
  ],
  exports: [
    CooperativasService,
    CooperativasProgressService,
    OnboardingService,
    ConfiguracionOnboardingService,
  ],
})
export class CooperativasModule {}
