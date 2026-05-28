import nodemailer, { Transporter } from 'nodemailer';

const APP_URL = process.env.APP_URL || 'http://localhost:3000';
const FROM = process.env.SMTP_FROM || 'WorshipFlow <noreply@worshipflow.com>';

async function createTransporter(): Promise<Transporter> {
  if (process.env.SMTP_USER && process.env.SMTP_PASS) {
    return nodemailer.createTransport({
      host: process.env.SMTP_HOST || 'smtp.gmail.com',
      port: parseInt(process.env.SMTP_PORT || '587'),
      secure: process.env.SMTP_SECURE === 'true',
      auth: { user: process.env.SMTP_USER, pass: process.env.SMTP_PASS },
    });
  }

  // Development fallback: Ethereal (fake SMTP, emails viewable at ethereal.email)
  const testAccount = await nodemailer.createTestAccount();
  console.info(`📧 Ethereal test account: ${testAccount.user}`);
  return nodemailer.createTransport({
    host: 'smtp.ethereal.email',
    port: 587,
    auth: { user: testAccount.user, pass: testAccount.pass },
  });
}

let transporterPromise: Promise<Transporter> | null = null;

function getTransporter(): Promise<Transporter> {
  if (!transporterPromise) {
    transporterPromise = createTransporter();
  }
  return transporterPromise;
}

async function send(to: string, subject: string, html: string): Promise<boolean> {
  try {
    const transporter = await getTransporter();
    const info = await transporter.sendMail({ from: FROM, to, subject, html });
    const previewUrl = nodemailer.getTestMessageUrl(info);
    if (previewUrl) {
      console.info(`📧 Preview email: ${previewUrl}`);
    }
    return true;
  } catch (error) {
    console.error('❌ Error sending email:', error);
    return false;
  }
}

export class EmailService {
  static async sendVerificationEmail(
    email: string,
    firstName: string,
    verificationLink: string,
  ): Promise<boolean> {
    return send(
      email,
      '🎵 Confirma tu email en WorshipFlow',
      `<div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <h2 style="color: #1A3C6E;">Bienvenido a WorshipFlow, ${firstName}!</h2>
        <p>Gracias por registrarte. Para completar tu cuenta, por favor confirma tu email:</p>
        <p style="text-align: center; margin: 30px 0;">
          <a href="${verificationLink}"
             style="background-color: #1A3C6E; color: white; padding: 12px 30px; text-decoration: none; border-radius: 5px; display: inline-block;">
            Confirmar Email
          </a>
        </p>
        <p>O copia este enlace en tu navegador:</p>
        <p style="word-break: break-all; color: #666;">${verificationLink}</p>
        <p style="color: #888; font-size: 12px;">Este enlace expira en 24 horas.</p>
        <hr style="border: none; border-top: 1px solid #eee; margin: 30px 0;">
        <p style="color: #888; font-size: 12px;">Si no creaste esta cuenta, puedes ignorar este email.</p>
      </div>`,
    );
  }

  static async sendPasswordResetEmail(
    email: string,
    firstName: string,
    resetLink: string,
  ): Promise<boolean> {
    return send(
      email,
      '🔐 Restablece tu contraseña en WorshipFlow',
      `<div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <h2 style="color: #1A3C6E;">Recuperación de Contraseña</h2>
        <p>Hola ${firstName},</p>
        <p>Recibimos una solicitud para restablecer tu contraseña. Haz click en el botón abajo:</p>
        <p style="text-align: center; margin: 30px 0;">
          <a href="${resetLink}"
             style="background-color: #D32F2F; color: white; padding: 12px 30px; text-decoration: none; border-radius: 5px; display: inline-block;">
            Restablecer Contraseña
          </a>
        </p>
        <p>O copia este enlace:</p>
        <p style="word-break: break-all; color: #666;">${resetLink}</p>
        <p style="color: #888; font-size: 12px;">Este enlace expira en 1 hora.</p>
        <hr style="border: none; border-top: 1px solid #eee; margin: 30px 0;">
        <p style="color: #888; font-size: 12px;">Si no solicitaste cambiar tu contraseña, ignora este email.</p>
      </div>`,
    );
  }

  static async sendWelcomeEmail(email: string, firstName: string): Promise<boolean> {
    return send(
      email,
      '🎵 ¡Bienvenido a WorshipFlow!',
      `<div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <h2 style="color: #1A3C6E;">¡Hola ${firstName}!</h2>
        <p>Tu email ha sido confirmado y tu cuenta está lista para usar.</p>
        <p>Con WorshipFlow puedes:</p>
        <ul>
          <li>📝 Gestionar tu repertorio de canciones con acordes</li>
          <li>🎵 Crear setlists para servicios</li>
          <li>📅 Programar ensayos y servicios</li>
          <li>👥 Coordinar tu equipo de músicos</li>
        </ul>
        <p style="text-align: center; margin: 30px 0;">
          <a href="${APP_URL}"
             style="background-color: #1A3C6E; color: white; padding: 12px 30px; text-decoration: none; border-radius: 5px; display: inline-block;">
            Ir a WorshipFlow
          </a>
        </p>
      </div>`,
    );
  }
}
