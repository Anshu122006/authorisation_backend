import { Router } from "express";
import signinRoute from "./signin";
import signupRoute from "./signup";
import signoutRoute from "./signout";
import tokenRoute from "./tokens";

const router = Router();

router.use(signinRoute);
router.use(signupRoute);
router.use(signoutRoute);
router.use(tokenRoute);

export default router;
