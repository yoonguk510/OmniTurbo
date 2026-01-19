import { oc } from '@orpc/contract';
import { commonErrors } from '../common/errors.js';
import { authContract } from './auth.contract.js';
import { storageContract } from './storage.contract.js';

export const publicRouter = oc
  .errors(commonErrors)
  .router({
    auth: authContract,
    storage: storageContract,
  });
