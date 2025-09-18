// backend/routes/noteRoutes.ts
import { Router } from "express";
import {
  getNotes,
  createNote,
  updateNote,
  deleteNote,
} from "../controllers/noteController";
import {
  authMiddleware,
  AuthenticatedRequest,
} from "../middleware/authMiddleware";

const router = Router();

// 認証必須ルートにミドルウェアを追加
router.use(authMiddleware);

router.get("/", getNotes); // ログインユーザーの全ノート取得
router.post("/", createNote); // ノート作成
router.put("/:id", updateNote); // ノート更新
router.delete("/:id", deleteNote); // ノート削除

export default router;
