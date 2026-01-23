import { publicRouter } from './public/index.js';
import { userRouter } from './user/index.js';
import { adminRouter } from './admin/index.js';

export const contract = {
  public: publicRouter,
  user: userRouter,
  admin: adminRouter,
};
