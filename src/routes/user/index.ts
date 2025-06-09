import { Router } from "express";
import getuserRoute from "./getUser";

const router = Router();

router.use(getuserRoute);

export default router;
