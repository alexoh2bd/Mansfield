import { useRouter } from "next/router";
import { useSession } from "next-auth/react";
import LoginForm from "../components/login/LoginForm";
import styles from "../styles/login.module.css";

export default function LogIn() {
  const { data: session } = useSession();
  const router = useRouter();

  if (session) {
    router.push("/");
    return <div className={styles.login} />;
  }

  return (
    <div className={styles.login}>
      <h1>Mansfield Sports Book</h1>
      <LoginForm />
    </div>
  );
}
