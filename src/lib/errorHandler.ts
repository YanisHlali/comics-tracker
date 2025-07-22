import { NextApiResponse } from 'next';

export const ERROR_TYPES = {
  FILE_NOT_FOUND: 'FILE_NOT_FOUND',
  PARSE_ERROR: 'PARSE_ERROR',
  NETWORK_ERROR: 'NETWORK_ERROR',
  UNKNOWN_ERROR: 'UNKNOWN_ERROR',
  VALIDATION_ERROR: 'VALIDATION_ERROR'
} as const;

export type ErrorType = typeof ERROR_TYPES[keyof typeof ERROR_TYPES];

export class AppError extends Error {
  public readonly type: ErrorType;
  public readonly originalError: Error | null;
  public readonly timestamp: string;

  constructor(
    message: string, 
    type: ErrorType = ERROR_TYPES.UNKNOWN_ERROR, 
    originalError: Error | null = null
  ) {
    super(message);
    this.name = 'AppError';
    this.type = type;
    this.originalError = originalError;
    this.timestamp = new Date().toISOString();
  }
}

export const getErrorType = (error: any): ErrorType => {
  if (!error) return ERROR_TYPES.UNKNOWN_ERROR;
  
  if (error.code === 'ENOENT') return ERROR_TYPES.FILE_NOT_FOUND;
  if (error instanceof SyntaxError) return ERROR_TYPES.PARSE_ERROR;
  if (error.name === 'TypeError' && error.message?.includes('fetch')) return ERROR_TYPES.NETWORK_ERROR;
  
  return ERROR_TYPES.UNKNOWN_ERROR;
};

interface LogContext {
  [key: string]: any;
}

interface ErrorInfo {
  message: string;
  error: string | undefined;
  stack?: string;
  type: ErrorType;
  context: LogContext;
  timestamp: string;
}

export const logger = {
  error: (message: string, error?: any, context: LogContext = {}): void => {
    const errorInfo: ErrorInfo = {
      message,
      error: error?.message || error,
      stack: error?.stack,
      type: error?.type || getErrorType(error),
      context,
      timestamp: new Date().toISOString()
    };
    
    if (process.env.NODE_ENV !== 'production') {
      console.error('[ERROR]', errorInfo);
    }
  },
  
  warn: (message: string, context: LogContext = {}): void => {
    if (process.env.NODE_ENV !== 'production') {
      console.warn('[WARN]', { 
        message, 
        context, 
        timestamp: new Date().toISOString() 
      });
    }
  },
  
  info: (message: string, context: LogContext = {}): void => {
    if (process.env.NODE_ENV !== 'production') {
      console.info('[INFO]', { 
        message, 
        context, 
        timestamp: new Date().toISOString() 
      });
    }
  }
};

export const withErrorHandling = <T extends any[], R>(
  fn: (...args: T) => Promise<R>,
  defaultReturn: R | null = null,
  errorContext: LogContext = {}
) => {
  return async (...args: T): Promise<R | null> => {
    try {
      const result = await fn(...args);
      return result;
    } catch (error: any) {
      const appError = new AppError(
        `Error in ${fn.name || 'anonymous function'}`,
        getErrorType(error),
        error
      );
      
      logger.error(appError.message, appError, { 
        ...errorContext, 
        functionName: fn.name,
        args: args.length > 0 ? '[arguments provided]' : '[]'
      });
      
      return defaultReturn;
    }
  };
};

export const withDataFetching = <T extends any[], R>(
  fetchFn: (...args: T) => Promise<R>,
  defaultData: R = [] as unknown as R,
  errorMessage: string = 'Failed to fetch data'
) => {
  return withErrorHandling(fetchFn, defaultData, { 
    type: 'data_fetching', 
    errorMessage 
  });
};

interface ApiErrorResponse {
  error: string;
  type: ErrorType;
  timestamp: string;
}

export const handleApiError = (
  res: NextApiResponse<ApiErrorResponse>,
  error: any,
  statusCode: number = 500
): void => {
  const appError = error instanceof AppError ? error : new AppError(
    'API Error',
    getErrorType(error),
    error
  );
  
  logger.error('API Error', appError, { statusCode });
  
  res.status(statusCode).json({
    error: appError.message,
    type: appError.type,
    timestamp: appError.timestamp
  });
};