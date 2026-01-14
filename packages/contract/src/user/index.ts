import { oc } from '@orpc/contract';
import { commonErrors } from '../common/errors.js';
import { profileContract } from './profile.contract.js';
export { UserResponseSchema } from './profile.contract.js';

export const userRouter = oc
  .errors(commonErrors)
  .router({
    profile: profileContract,
  });
