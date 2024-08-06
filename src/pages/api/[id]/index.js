import { createRouter } from "next-connect";
import { getDatabase, get, ref, set } from "firebase/database";

const router = createRouter();
const db = getDatabase();

router
  .get(async (req, res) => {
    const reference = ref(db, `users/${req.query.id}`);
    await get(reference).then((snapshot) => {
      if (snapshot.exists()) {
        res.status(200).json(snapshot.val());
      } else {
        res.status(404).json({ message: "User does not exist" });
      }
    });
  })
  .post(async (req, res) => {
    /**
     * First checks if user exist, create an account if it doesn't
     */
    const reference = ref(db, `users/${req.query.id}`);

    const snapshot = await get(reference);
    if (snapshot.exists()) {
      res.status(200).json(snapshot.val());
      return;
    }

    const userInfo = {
      username: req.body.username,
      email: req.body.email,
      accountBalance: 0,
    };
    await set(reference, userInfo);
    res.status(200).json(userInfo);
  });

export default router.handler();
