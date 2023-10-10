import type { NextApiRequest as Req, NextApiResponse as Res } from "next";
import { db } from "../../firebase";
import * as jose from "jose";
import * as admin from "firebase-admin";
import { collection, doc, getDoc, setDoc } from "firebase/firestore/lite";

type ResponseData = {
  message: string;
};

export default async function handler(req: Req, res: Res<ResponseData>) {
  try {
    const { user, name, socialHandle, email } = req.body;

    const authToken = req.cookies["privy-token"];

    console.log(user);

    const verificationKey = await jose.importSPKI(
      process.env.NEXT_PUBLIC_PRIVY_PUBLIC_API_KEY!,
      "ES256"
    );

    if (!authToken) throw new Error("No JWT provided.");

    const payload = await jose.jwtVerify(authToken, verificationKey, {
      issuer: "privy.io",
      audience: "clmsbl8ec016xik0fw951jkg0",
    });

    console.log(payload);

    if (payload.payload.sub !== user.id) {
      throw new Error("JWT sub does not match privyId");
    }

    const usersRef = collection(db, "users");

    // check if user exists
    const userDocRef = await doc(usersRef, user.id);
    const userDoc = await getDoc(userDocRef);

    console.log("userDoc", userDoc);

    if (!userDoc.exists()) {
      // create new user
      const newUser = {
        privyProfile: user,
        name: name,
        email: email,
        socialHandle: socialHandle,
        createdAt: new Date(),
      };
      console.log("Creating new user", newUser);
      await setDoc(doc(usersRef, user.id), newUser);

      // create custom token in firebase using privyId
      const customToken = await admin.auth().createCustomToken(user.id);

      // return custom token
      res.status(201).json({ message: customToken });
    } else {
      // return existing user data
      if (!userDoc.exists) {
        res.status(401).json({ message: "User does not exist" });
      }

      const customToken = await admin.auth().createCustomToken(userDoc.id);

      res.status(200).json({ message: customToken });
    }
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Internal server error" });
  }
}
