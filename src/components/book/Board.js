// This component displays upcoming games

import { useEffect, useState } from "react";
import PropTypes from "prop-types";
import styles from "@/styles/Book.module.css";
import Game from "./Game";
import BetShape from "../shapes/BetShape";
import LeagueShape from "../shapes/LeagueShape";

export default function Board({ cart, setCart, currentLeague }) {
  // this is the implementation for the Odds api, it is working I just disabled it to make sure
  // that we don't reach the limit of our api
  const [games, setGames] = useState([]);
  useEffect(() => {
    (async () => {
      // update firebase possibly
      await fetch("/api/odds", {
        method: "PUT",
        headers: {
          Accept: "application/json",
          "Content-Type": "application/json",
        },
      });

      // pull data
      const response = await fetch(`api/odds/${currentLeague.key}`);
      if (response.ok) {
        const gameOdds = Object.values(await response.json());
        setGames(gameOdds);
      }
    })();
  }, [currentLeague]);

  const sortedGames = [...games];
  sortedGames.sort(
    (a, b) => new Date(a.commence_time) - new Date(b.commence_time),
  );

  const gamesArr = [...sortedGames].map((g) => (
    <li key={g.id}>
      <Game game={g} cart={cart} setCart={setCart} />
    </li>
  ));

  return (
    <div className={styles.gameList}>
      <h4>Upcoming Games</h4>
      <ul>{gamesArr}</ul>
    </div>
  );
}

Board.propTypes = {
  cart: PropTypes.arrayOf(BetShape).isRequired,
  setCart: PropTypes.func.isRequired,
  currentLeague: PropTypes.objectOf(LeagueShape).isRequired,
};
