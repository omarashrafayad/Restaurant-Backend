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
  private transporter: Transporter;
  private logger = new Logger(MailService.name);

  constructor(private readonly configService: ConfigService<Environment>) {
    const smtp = this.configService.get<Environment['smtp']>('smtp');

    if (smtp && smtp.auth?.user && smtp.auth?.pass) {
      this.transporter = nodemailer.createTransport({
        host: smtp.host,
        port: smtp.port,
        secure: smtp.secure,
        auth: {
          user: smtp.auth.user,
          pass: smtp.auth.pass,
        },
      });
    } else {
      // In development or when credentials are not supplied, initialize transport with warning
      this.transporter = nodemailer.createTransport({
        host: smtp?.host || 'smtp.gmail.com',
        port: smtp?.port || 465,
        secure: smtp?.secure ?? true,
      });
      this.logger.warn('SMTP authentication credentials not fully configured; emails may fail to deliver.');
    }
  }

  async sendEmail(options: SendEmailOptions): Promise<void> {
    const smtp = this.configService.get<Environment['smtp']>('smtp');
    const sender = smtp?.auth?.user || 'eshop-noreply@example.com';

    const mailOptions = {
      from: `E-shop App <${sender}>`,
      to: options.email,
      subject: options.subject,
      text: options.message,
    };

    try {
      await this.transporter.sendMail(mailOptions);
      this.logger.log(`Email sent successfully to ${options.email}`);
    } catch (err: any) {
      this.logger.error(`Error sending email to ${options.email}:`, err.message);
      throw err;
    }
  }
}
