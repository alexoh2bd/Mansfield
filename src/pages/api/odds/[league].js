import { createRouter } from "next-connect";
import { getDatabase, get, ref } from "firebase/database";
import { authenticated } from "../../../lib/middleware";

const router = createRouter();
const db = getDatabase();

router.get(authenticated, async (req, res) => {
  const reference = ref(db, `games/${req.query.league}`);

  await get(reference).then((snapshot) => {
    const currentTimestamp = Date.now() / 1000;

    if (snapshot.exists()) {
      const allGames = snapshot.val();
      const futureGames = {};
      Object.entries(allGames).forEach(([id, game]) => {
        if (game.bookmakers && game.commence_time > currentTimestamp)
          futureGames[id] = game;
      });
      res.status(200).json(futureGames);
    } else {
      res.status(404).json("League does not exist.");
    }
  });
});

export default router.handler();
