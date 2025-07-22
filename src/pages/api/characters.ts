import { NextApiRequest, NextApiResponse } from 'next';
import { handleApiError } from '@/lib/errorHandler';
import { serverDataFetcher } from '@/lib/serverDataFetcher';
import { Character } from '@/types';

interface ErrorResponse {
  error: string;
}

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse<Character[] | ErrorResponse>
): Promise<void> {
  if (req.method !== 'GET') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const characters = await serverDataFetcher.fetchCharacters();
    res.setHeader('Cache-Control', 'public, max-age=60, s-maxage=300, stale-while-revalidate=600');
    return res.status(200).json(characters || []);
  } catch (error) {
    return handleApiError(res, error);
  }
}