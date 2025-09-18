import { Router } from 'express';
import { registerUserInMongoDB } from '../controllers/userController';

const router = Router();

// サインアップルート
router.post('/signup', registerUserInMongoDB);

export default router;
