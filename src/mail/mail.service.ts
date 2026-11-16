import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import nodemailer, { Transporter } from 'nodemailer';
import { Environment } from '../common/configuration/environment.interface.js';

export interface SendEmailOptions {
  email: string;
  subject: string;
  message: string;
}

@Injectable()
export class MailService {
  private readonly logger = new Logger(MailService.name);
  private readonly transporter?: Transporter;
  private readonly from: string;

  constructor(configService: ConfigService<Environment, true>) {
    const smtp = configService.get('smtp', { infer: true });
    this.from = `${smtp.fromName} <${smtp.auth?.user ?? 'no-reply@takefive.app'}>`;

    if (smtp.auth?.user && smtp.auth?.pass) {
      this.transporter = nodemailer.createTransport({
        host: smtp.host,
        port: smtp.port,
        secure: smtp.secure,
        auth: { user: smtp.auth.user, pass: smtp.auth.pass },
      });
    } else {
      this.logger.warn('SMTP credentials are not configured (EMAIL_USER / EMAIL_PASSWORD); emails are disabled.');
    }
  }

  get isEnabled(): boolean {
    return !!this.transporter;
  }

  /** Throws when delivery fails so callers can decide how to react. */
  async sendEmail(options: SendEmailOptions): Promise<void> {
    if (!this.transporter) {
      throw new Error('Email delivery is not configured');
    }
    await this.transporter.sendMail({
      from: this.from,
      to: options.email,
      subject: options.subject,
      text: options.message,
    });
    this.logger.log(`Email sent to ${options.email}`);
  }
}
