import PropTypes from "prop-types";
import styles from "@/styles/Book.module.css";

export default function Leagues({ leaguesCollection, setCurrentLeague }) {
  const leaguesList = [...leaguesCollection].map((league) => (
    <button
      key={league.key}
      type="button"
      onClick={() => setCurrentLeague(league)}
      data-testid="league"
    >
      {league.title}
    </button>
  ));

  return (
    <div>
      <h4>Leagues</h4>
      <div className={styles.leagues}>{leaguesList}</div>
    </div>
  );
}

Leagues.propTypes = {
  leaguesCollection: PropTypes.arrayOf(
    PropTypes.shape({
      active: PropTypes.bool.isRequired,
      description: PropTypes.string.isRequired,
      group: PropTypes.string.isRequired,
      has_outrights: PropTypes.bool.isRequired,
      key: PropTypes.string.isRequired,
      title: PropTypes.string.isRequired,
    }),
  ).isRequired,
  setCurrentLeague: PropTypes.func.isRequired,
};
