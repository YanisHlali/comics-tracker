import { NextApiRequest, NextApiResponse } from 'next';
import { handleApiError } from '@/lib/errorHandler';
import { serverDataFetcher } from '@/lib/serverDataFetcher';
import { Period } from '@/types';

interface PeriodsApiResponse {
  periods?: Period[];
  error?: string;
}

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse<PeriodsApiResponse>
) {
  if (req.method !== 'GET') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const periods = await serverDataFetcher.fetchPeriods();
    res.setHeader('Cache-Control', 'public, max-age=60, s-maxage=300, stale-while-revalidate=600');
    return res.status(200).json({ periods: periods || [] });
  } catch (error) {
    return handleApiError(res, error);
  }
}