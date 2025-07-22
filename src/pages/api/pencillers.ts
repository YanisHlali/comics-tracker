import type { NextApiRequest, NextApiResponse } from 'next';
import { handleApiError } from '@/lib/errorHandler';
import { serverDataFetcher } from '@/lib/serverDataFetcher';
import type { Penciller } from '@/types';

interface ErrorResponse {
  error: string;
}

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse<Penciller[] | ErrorResponse>
): Promise<void> {
  if (req.method !== 'GET') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const pencillers = await serverDataFetcher.fetchPencillers();
    res.setHeader('Cache-Control', 'public, max-age=60, s-maxage=300, stale-while-revalidate=600');
    return res.status(200).json(pencillers || []);
  } catch (error) {
    return handleApiError(res, error);
  }
}