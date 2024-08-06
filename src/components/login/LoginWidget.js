import { signIn } from "next-auth/react";

export default function LoginWidget() {
  return (
    <div>
      <button
        data-testid="loginButton"
        type="button"
        onClick={() =>
          signIn("google", {
            callbackUrl: `${window.location.origin}/`,
          })
        }
      >
        Login
      </button>
    </div>
  );
}
