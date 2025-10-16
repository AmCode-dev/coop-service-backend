import { Injectable } from '@nestjs/common';
import * as nodemailer from 'nodemailer';
import * as fs from 'fs';
import path from 'path';
import * as mustache from 'mustache';
@Injectable()
export class MailerService {
  public static async sendEmail(
    to: string,
    subject: string,
    template_name: string,
    additionalConfig: {
      internalNotificationSubject: string;
      internalNotificationText: string;
    } | null = null,
  ) {
    const transporter = nodemailer.createTransport({
      host: 'smtp.gmail.com',
      port: 465,
      secure: true,
      auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASS,
      },
    });

    try {
      await transporter.sendMail({
        from: `"Contacto Web" <${process.env.EMAIL_USER}>`,
        to: 'info@amcode.com.ar',
        subject: `${additionalConfig?.internalNotificationSubject ?? '[COMUNICADO]'} - Notificación Interna`,
        text:
          additionalConfig?.internalNotificationText ??
          `Revisa el sistema de alta de cuenta en https://amcode.com.ar/cooperativas que al parecer hay una nuevo onboarding`,
      });

      const emailHtmlPath = path.join(
        process.cwd(),
        'mail-templates',
        template_name,
      );
      const emailData = fs.readFileSync(emailHtmlPath).toString();

      const formatedEmail = mustache.render(emailData, {});

      await transporter.sendMail({
        from: `"AmCode - Notificaciones" <${process.env.EMAIL_USER}>`,
        to,
        subject: subject,
        html: formatedEmail,
        attachments: [],
      });

      return { message: 'Correos enviados con éxito', status: 200 };
    } catch (error) {
      console.error(error);
      return {
        message: 'Error al enviar el correo',
        status: 500,
      };
    }
  }
}
