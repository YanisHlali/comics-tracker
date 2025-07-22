import type { NextApiRequest, NextApiResponse } from 'next';
import nodemailer from "nodemailer";
import { handleApiError, AppError, ERROR_TYPES, logger } from '@/lib/errorHandler';

interface ContactRequestBody {
  message: string;
}

interface ContactSuccessResponse {
  success: true;
}

interface ContactErrorResponse {
  error: string;
}

type ContactResponse = ContactSuccessResponse | ContactErrorResponse;

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse<ContactResponse>
): Promise<void> {
  if (req.method !== "POST") {
    return res.status(405).json({ error: "Méthode non autorisée" });
  }

  const { message }: ContactRequestBody = req.body;

  if (!message || typeof message !== 'string') {
    const appError = new AppError("Message requis", ERROR_TYPES.VALIDATION_ERROR);
    return handleApiError(res, appError);
  }

  try {
    const transporter = nodemailer.createTransport({
      host: "yanis-mail.fr",
      port: 587,
      secure: false,
      auth: {
        user: "contact@yanis-mail.fr",
        pass: "test1234",
      },
      tls: { rejectUnauthorized: false },
    });

    await transporter.sendMail({
      from: process.env.SMTP_FROM || "contact@yanis-mail.fr",
      to: process.env.SMTP_TO || "contact@yanis-mail.fr",
      subject: "Contact anonyme - Comics Tracker",
      text: `Message utilisateur (anonyme) :\n\n${message}`,
    });

    logger.info("Email sent successfully", { messageLength: message.length });
    return res.status(200).json({ success: true });
  } catch (error: any) {
    const appError = new AppError(
      "Erreur lors de l'envoi du message", 
      ERROR_TYPES.NETWORK_ERROR, 
      error
    );
    return handleApiError(res, appError);
  }
}