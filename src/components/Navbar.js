import PropTypes from "prop-types";
import { useRouter } from "next/router";
import { useEffect } from "react";
import { useSession, signOut } from "next-auth/react";
import styles from "../styles/navigation.module.css";

export default function Navbar({ balance, setBalance }) {
  const { data: session } = useSession();

  useEffect(() => {
    (async () => {
      if (session && !(balance !== undefined)) {
        const response = await fetch(`api/${session.user.id}/`, {
          method: "POST",
          body: JSON.stringify({
            username: session.user.name,
            email: session.user.email,
          }),
          headers: {
            Accept: "application/json",
            "Content-Type": "application/json",
          },
        });
        if (response.status === 200) {
          const data = await response.json();
          setBalance(data.accountBalance);
        }
      }
    })();
  }, [session]);

  const router = useRouter();

  const logOut = () => {
    signOut({
      callbackUrl: `${window.location.origin}/login`,
    });
  };

  const handleNavClick = (string) => {
    if (string === "openbets") {
      router.push("/user/openbets");
    } else if (string === "logout") {
      logOut();
    } else if (string === "bethistory") {
      router.push("/user/bethistory");
    } else {
      router.push("/");
    }
  };

  return (
    session && (
      <div className={styles.navbar}>
        <a onClick={() => handleNavClick("home")} data-testid="mansfield">
          Mansfield
        </a>
        <div className={styles.dropdown}>
          <button
            type="button"
            className={styles.dropdownButton}
            data-testid="dropdownButton"
          >
            {session.user.name} ▼
          </button>
          <div className={styles.dropdownContent}>
            <a onClick={() => handleNavClick("bethistory")}>Bet History</a>
            <a onClick={() => handleNavClick("openbets")}>Pending Bets</a>
            <a onClick={() => handleNavClick("logout")}>Logout</a>
          </div>
        </div>
        {balance > 0 ? (
          <div className={styles.balance} data-testid="positiveBalance">
            ${balance}
          </div>
        ) : (
          <div className={styles.balanceNeg} data-testid="negativeBalance">
            ${balance}
          </div>
        )}
      </div>
    )
  );
}

Navbar.defaultProps = {
  balance: undefined,
};

Navbar.propTypes = {
  balance: PropTypes.number,
  setBalance: PropTypes.func.isRequired,
};
