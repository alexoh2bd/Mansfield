import { getDatabase, onValue, update, get, ref } from "firebase/database";

async function fetchLeague(league) {
  const response = await fetch(
    `https://api.the-odds-api.com//v4/sports/${league}/odds/?apiKey=${process.env.REACT_APP_ODDS_API_KEY}&regions=us&markets=h2h,spreads,totals&bookmakers=fanduel&dateFormat=unix`,
  );
  const games = await response.json();
  return games;
}

export default async function handler(req, res) {
  const { method } = req;
  const db = getDatabase();
  const gamesRef = ref(db, `/games`);

  //  Gets and updates this weeks scores the
  switch (method) {
    case "GET": {
      onValue(gamesRef, (snapshot) => {
        const data = snapshot.val();
        res.status(200).json(data);
      });

      break;
    }
    case "PUT": {
      const refTime = ref(db, `games/updated`);
      const updated = await get(refTime).then((snapshot) => snapshot.val());

      // set to update no more than every 45 minutes
      const millisToUpdate = 1000 * 60 * 45;
      const millisRemaining = Date.now() - updated;
      if (millisRemaining < millisToUpdate) {
        const minElapsed = Math.round(millisRemaining / 6000) / 10;
        const minRemaining =
          Math.round((millisToUpdate - millisRemaining) / 6000) / 10;
        res
          .status(200)
          .json(
            `${minElapsed} mins since last update, ${minRemaining} mins remaning.`,
          );
        break;
      }

      const leagues = [
        "americanfootball_nfl",
        "americanfootball_ncaaf",
        "basketball_nba",
        "basketball_ncaab",
        "icehockey_nhl",
      ];

      const allGames = await Promise.all(
        leagues.map((league) => fetchLeague(league)),
      );

      const updates = { updated: Date.now() };
      const ret = {};
      leagues.forEach((l) => {
        ret[l] = {};
      });
      allGames.forEach((games) => {
        games.forEach((game) => {
          const [league, id] = [game.sport_key, game.id];
          ret[league][id] = game;
          updates[`/${game.sport_key}/${game.id}`] = game;
        });
      });
      update(gamesRef, updates);
      res.status(200).json(ret);
      break;
    }

    default:
      res.setHeader("Allow", ["GET", "PUT"]);
      res.status(405).end(`Method ${method} Not Allowed`);
  }
}
