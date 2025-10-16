export const OnboardingNextSteps: Record<string, string[]> = {
  INICIADO: [
    'Accede al proceso de onboarding con tu código de referencia',
    'Completa tus datos personales',
    'Sube la documentación de la cooperativa',
  ],
  EN_PROGRESO: [
    'Sube todos los documentos requeridos',
    'Completa la verificación de identidad',
    'Acepta los términos y condiciones',
  ],
  PENDIENTE_VALIDACION: [
    'Espera la validación de documentos',
    'Responde a cualquier solicitud adicional por email',
  ],
  PENDIENTE_APROBACION: [
    'Tu solicitud está siendo revisada',
    'Recibirás un email con la decisión final',
  ],
  COMPLETADO: [
    'Ya puedes acceder al sistema',
    'Inicia sesión con las credenciales enviadas por email',
  ],
  RECHAZADO: [
    'Contacta al equipo de soporte para más información',
    'Revisa los motivos del rechazo en tu email',
  ],
};

export const OnboardingNextStepsDefault = [
  'Consulta el estado de tu solicitud regularmente enviando un correo a info@amcode.com.ar',
];

// -- onboarding messages

export const OnboardingStatusMessages: Record<string, string> = {
  INICIADO: 'Tu solicitud ha sido iniciada. Continúa con los siguientes pasos.',
  EN_PROGRESO:
    'Tu solicitud está en progreso. Continúa completando la documentación.',
  PENDIENTE_VALIDACION:
    'Documentación recibida. Estamos validando la información.',
  PENDIENTE_APROBACION: 'Tu solicitud está siendo revisada por nuestro equipo.',
  COMPLETADO:
    '¡Felicitaciones! Tu cooperativa ha sido aprobada y ya puedes acceder al sistema.',
  RECHAZADO:
    'Lamentablemente tu solicitud ha sido rechazada. Contacta al equipo de soporte.',
};

export const OnboardingStatusMessagesDefault =
  'Consulta el estado de tu solicitud regularmente';
