// GET and POST bet history given the userId

import { getServerSession } from "next-auth";
import { getDatabase, ref, onValue, set, push } from "firebase/database";
import { authOptions } from "../auth/[...nextauth]";

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
  const historyRef = ref(db, `history/${query.id}`);

  switch (method) {
    case "GET": {
      onValue(historyRef, (snapshot) => {
        const data = snapshot.val();
        res.status(200).json(data);
      });
      break;
    }

    // push a new history entry into database
    case "POST": {
      const pushref = push(historyRef);
      set(pushref, req.body);

      res.status(200).json({ complete: true });
      break;
    }
    default:
      res.setHeader("Allow", ["GET", "POST"]);
      res.status(405).end(`Method ${method} Not Allowed`);
  }
}
