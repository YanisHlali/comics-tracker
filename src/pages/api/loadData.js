import fs from 'fs';
import path from 'path';
import { promisify } from 'util';

const readFile = promisify(fs.readFile);
const access = promisify(fs.access);

const cache = new Map();
const CACHE_DURATION = 5 * 60 * 1000;
const MAX_CACHE_SIZE = 1000;

function getCachedData(key) {
  const cached = cache.get(key);
  if (cached && Date.now() - cached.timestamp < CACHE_DURATION) {
    return cached.data;
  }
  return null;
}

function setCachedData(key, data) {
  if (cache.size >= MAX_CACHE_SIZE) {
    const oldestKey = Array.from(cache.entries())
      .sort(([, a], [, b]) => a.timestamp - b.timestamp)[0][0];
    cache.delete(oldestKey);
  }
  cache.set(key, { data, timestamp: Date.now() });
}

function validateQueryParams(periodName, fileType) {
  if (!periodName || !fileType)
    throw new Error('Les paramètres periodName et fileType sont requis');
  if (typeof periodName !== 'string' || typeof fileType !== 'string')
    throw new Error('Les paramètres periodName et fileType doivent être des chaînes de caractères');
  if (!/^[a-zA-Z0-9_-]+$/.test(periodName))
    throw new Error('Le nom de la période contient des caractères non autorisés');
  const allowedFileTypes = ['issues', 'events', 'series', 'french_editions'];
  if (!allowedFileTypes.includes(fileType))
    throw new Error('Type de fichier non autorisé');
}

function getFilePath(periodName, fileType) {
  return path.resolve(process.cwd(), `./data/${periodName}/${fileType}.json`);
}

export default async function handler(req, res) {
  if (req.method !== 'GET') {
    return res.status(405).json({ error: 'Méthode non autorisée' });
  }

  const { periodName, fileType } = req.query;
  try {
    validateQueryParams(periodName, fileType);
    const cacheKey = `${periodName}_${fileType}`;
    const cachedData = getCachedData(cacheKey);
    if (cachedData) {
      return res.status(200).json(cachedData);
    }
    const filePath = getFilePath(periodName, fileType);
    try {
      await access(filePath, fs.constants.R_OK);
      const data = JSON.parse(await readFile(filePath, 'utf8'));
      setCachedData(cacheKey, data);
      return res.status(200).json(data);
    } catch (error) {
      if (error.code === 'ENOENT') {
        console.log(`Le fichier ${fileType}.json n'existe pas pour la période ${periodName}`);
        setCachedData(cacheKey, []);
        return res.status(200).json([]);
      }
      throw error;
    }
  } catch (error) {
    console.error('Erreur lors du chargement du fichier:', error);
    return res.status(500).json({
      error: 'Erreur lors du chargement des données',
      details: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
}
