import { getServerSession } from "next-auth/next";
import { authOptions } from "../pages/api/auth/[...nextauth]";

// disable lint because we may add an error handler
// eslint-disable-next-line import/prefer-default-export
export async function authenticated(request, response, next) {
  const session = await getServerSession(request, response, authOptions);
  if (session) {
    await next(); // Authenticated, proceed to the next handler
  } else {
    response
      .status(401)
      .json({ message: "You must be signed in to access this endpoint." });
  }
}
