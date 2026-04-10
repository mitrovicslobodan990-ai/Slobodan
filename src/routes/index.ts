import { Router, type IRouter } from "express";
import healthRouter from "./health";
import gifsRouter from "./gifs";

const router: IRouter = Router();

router.use(healthRouter);
router.use("/gifs", gifsRouter);

export default router;
