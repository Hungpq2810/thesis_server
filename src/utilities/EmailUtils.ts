import nodemailer from 'nodemailer';

export interface EmailDetails {
  subject: string;
  body: string;
}

class EmailUtils {
  private transporter: nodemailer.Transporter;

  constructor() {
    this.transporter = nodemailer.createTransport({
      service: 'Gmail',
      auth: {
        user: 'hungphiquoc@gmail.com', //
        pass: 'msd232 msj213 sdj22', //
      },
    });
  }

  sendEmail(receiverEmail: string, emailDetails: EmailDetails): void {
    const mailOptions: nodemailer.SendMailOptions = {
      from: 'hungphiquoc@gmail.com',
      to: receiverEmail,
      subject: emailDetails.subject,
      text: emailDetails.body,
    };

    this.transporter.sendMail(
      mailOptions,
      (error: any, info: any) => {
        if (error) {
          console.error('Error occurred while sending email:', error);
        } else {
          console.log('Email sent:', info.response);
        }
      },
    );
  }
}

export { EmailUtils };
