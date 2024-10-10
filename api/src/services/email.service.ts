import { Injectable } from '@nestjs/common';
import nodemailer, { Transporter } from 'nodemailer';

@Injectable()
export class EmailService {
  private transporter?: Transporter;

  constructor() {
    this.loadSettings();
  }

  loadSettings() {
    this.transporter = nodemailer.createTransport({
      host: process.env.EMAIL_HOST ?? '',
      port: process.env.EMAIL_PORT,
      secure: process.env.EMAIL_SECURE,
      auth: {
        user: process.env.EMAIL_AUTH_USER,
        pass: process.env.EMAIL_AUTH_PASS,
      },
    } as any);
  }

  sendEmail(subject: string, text: string, html: string, to: string) {
    if (!this.transporter) {
      return 'Mailer Transporter Does Not Exist';
    } else {
      // continue
    }

    this.transporter.sendMail({
      from: '"BoardGame.lol" <boardgame-lol@polklabs.com>',
      to,
      subject,
      html,
      text,
    });
  }

  formatEmailHtml(header: string, content: string, footer = 'Powered by Polklabs'): string {
    return `
<html>
  <head>
      <style>
          body {
              font-family: Arial, sans-serif;
              background-color: #f0f0f0;
          }
          .container {
              max-width: 600px;
              margin: 0 auto;
              background-color: #ffffff;
              padding: 20px;
          }
          .header {
              text-align: center;
              color: #333333;
              font-size: 24px;
              font-weight: bold;
          }
          .content {
              color: #666666;
              font-size: 16px;
              line-height: 1.5;
          }
          .footer {
              text-align: center;
              color: #999999;
              font-size: 14px;
          }
          .bold {
            font-size: 24px;
            font-weight: bold;
          }
      </style>
  </head>
  <body>
      <div class="container">
          <div class="header">
              ${header}
          </div>
          <div class="content">
              ${content}
          </div>
          <div class="footer">
              ${footer}
          </div>
      </div>
  </body>
</html>`;
  }
}
