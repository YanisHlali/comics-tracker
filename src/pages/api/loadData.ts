import fs from 'fs';
import path from 'path';
import { promisify } from 'util';
import type { NextApiRequest, NextApiResponse } from 'next';
import { handleApiError, AppError, ERROR_TYPES, logger } from '@/lib/errorHandler';

const readFile = promisify(fs.readFile);
const access = promisify(fs.access);

interface ErrorResponse {
  error: string;
}

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse<any[] | ErrorResponse>
): Promise<void> {
  if (req.method !== 'GET') {
    return res.status(405).json({ error: 'Méthode non autorisée' });
  }

  const { periodName, fileType } = req.query;
  
  if (!periodName || !fileType || typeof periodName !== 'string' || typeof fileType !== 'string') {
    return res.status(400).json({ error: 'Les paramètres periodName et fileType sont requis et doivent être des chaînes' });
  }

  if (!/^[a-zA-Z0-9_-]+$/.test(periodName)) {
    return res.status(400).json({ error: 'Le nom de la période contient des caractères non autorisés' });
  }

  const allowedFileTypes = ['issues', 'events', 'series', 'french_editions'];
  if (!allowedFileTypes.includes(fileType)) {
    return res.status(400).json({ error: 'Type de fichier non autorisé' });
  }

  try {
    const filePath = path.resolve(process.cwd(), `./data/${periodName}/${fileType}.json`);
    
    try {
      await access(filePath, fs.constants.R_OK);
      const fileContent = await readFile(filePath, 'utf8');
      const data = JSON.parse(fileContent);

      res.setHeader('Cache-Control', 'public, max-age=60, s-maxage=300, stale-while-revalidate=600');
      return res.status(200).json(data);
    } catch (error: any) {
      if (error.code === 'ENOENT') {
        logger.info(`File not found: ${fileType}.json for period ${periodName}`, { periodName, fileType });
        res.setHeader('Cache-Control', 'public, max-age=60, s-maxage=300, stale-while-revalidate=600');
        return res.status(200).json([]);
      }
      throw new AppError(`Failed to read file: ${filePath}`, ERROR_TYPES.FILE_NOT_FOUND, error);
    }
  } catch (error) {
    return handleApiError(res, error);
  }
}