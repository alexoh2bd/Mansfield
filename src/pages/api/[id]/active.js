import { getServerSession } from "next-auth";
import {
  getDatabase,
  ref,
  onValue,
  set,
  get,
  push,
  remove,
} from "firebase/database";
import { authOptions } from "../auth/[...nextauth]";

import data from "../../../../data/selectedsports.json";
import resolveBet from "../../../db/resolveBet";

// GET, POST, PUT and DELETE the active bets

export default async function handler(req, res) {
  const session = await getServerSession(req, res, authOptions);
  if (!session) {
    res.status(401).json({ message: "You must be logged in." });
    return;
  }

  const { method, query } = req;
  if (session.user.id !== query.id) {
    res
      .status(401)
      .json({ message: "You cannot access information of other users." });
    return;
  }

  const db = getDatabase();
  const activeRef = ref(db, `active/${query.id}`);

  switch (method) {
    // returns active bets
    case "GET": {
      onValue(activeRef, (snapshot) => {
        const d = snapshot.val();
        res.status(200).json(d);
      });
      break;
    }

    // push a new history entry into database
    case "POST": {
      const pushref = push(activeRef);
      set(pushref, req.body);

      res.status(200).json({ complete: true });
      break;
    }
    // deletes an active bet
    case "DELETE": {
      if (!query.betID) {
        res.status(404).json({ "no betID provided": true });
      } else {
        onValue(ref(db, `active/${query.id}`), (snapshot) => {
          const bets = snapshot.val();
          const urlID = bets.find((bet) => bet.BetID === query.betID);
          remove(ref(db, `active/${query.id}/${urlID}`));
          res.status(200).json({ "successful DELETE": query.betID });
        });
      }
      break;
    }

    // updating bets when game is completed
    case "PUT": {
      const leaguesList = [...data];
      const leaguesRef = leaguesList.map((league) =>
        ref(db, `scores/${league.key}`),
      );
      
      const userRef = ref(db, `users/${query.id}`);

      // Get Active Bets
      const snapshot1 = await get(activeRef);
      if (!snapshot1.exists()) {
        res.status(200).json({ Feedback: "No Active bets found" });
        break;
      }
      const bets = snapshot1.val();

      // get bet data
      const keys = Object.keys(bets);
      const values = Object.values(bets);

      // Gets user data
      const snapshot2 = await get(userRef);
      const user = snapshot2.val();

      // // loop through leagues and get games for each sports league
      for (let i = 0; i < leaguesRef.length; i += 1) {
        get(leaguesRef[i]).then((snap) => {
          const games = snap.val();

          // // loop through games in firebase db and check if game's ID matches the bet's gameID
          for (let j = 0; j < keys.length; j += 1) {
            const tempGame = Object.values(games).find(
              (game) => game.id === values[j].GameID,
            );
            if (tempGame) {
              resolveBet(values[j], query, tempGame, keys[j], db, user);
            }
          }
        });
      }

      res.status(200).json({ succes: true });
      break;
    }

    default:
      res.setHeader("Allow", ["GET", "POST", "DELETE", "PUT"]);
      res.status(405).end(`Method ${method} Not Allowed`);
  }
}
