export const commonErrors = {
  UNAUTHORIZED: {
    status: 401,
    message: 'Unauthorized access',
    description: 'User is not authenticated or lacks necessary permissions.',
  },
  FORBIDDEN: {
    status: 403,
    message: 'Forbidden',
  },
  NOT_FOUND: {
    status: 404,
    message: 'Resource not found',
  },
} as const;
