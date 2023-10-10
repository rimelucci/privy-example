// simple register page with form asking for first name, last name, email, and social handle

import { useEffect, useState } from "react";
import { useRouter } from "next/router";
import { usePrivy } from "@privy-io/react-auth";
import { getAuth, signInWithCustomToken } from "firebase/auth";
import Head from "next/head";

const RegisterPage = () => {
  const router = useRouter();
  const { ready, authenticated, user, logout, linkEmail } = usePrivy();

  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [name, setName] = useState(""); // [firstName, lastName
  const [socialHandle, setSocialHandle] = useState("");
  const [email, setEmail] = useState("");

  useEffect(() => {
    if (ready && !authenticated) {
      router.push("/");
    }

    if (ready && authenticated) {
      if (user!.email) {
        setEmail(user!.email.address || "");
      }
      if (user!.google) {
        setName(user!.google.name || "");
        setFirstName(user!.google.name!.split(" ")[0] || "");
        setLastName(user!.google.name!.split(" ").slice(1).join(" ") || "");
        setEmail(user!.google.email || "");
      }
      if (user!.twitter) {
        setName(user!.twitter.name || "");
        setSocialHandle(user!.twitter.username || "");
      }
      if (user!.discord) {
        setSocialHandle(user!.discord.username || "");
      }
    }
  }, [ready, authenticated, router]);

  useEffect(() => {
    setName(firstName + " " + lastName);
  }, [firstName, lastName]);

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    try {
      // call fetch to register user
      const response = await fetch("/api/login", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          name: name,
          socialHandle: socialHandle,
          email: email,
          user: user,
        }),
      });

      if (response.status === 200 || response.status === 201) {
        // save response (jwt cookie) to browser cookies
        const token = await response.json();
        console.log(token);

        const auth = getAuth();
        signInWithCustomToken(auth, token)
          .then((userCredential) => {
            // Signed in
            const user = userCredential.user;
            console.log(user);
            // ...
          })
          .catch((error) => {
            const errorCode = error.code;
            const errorMessage = error.message;
            // ...
          });

        // save data to browser cookies
        document.cookie = "firebaseJWT=" + data.jwt + "; path=/";
      }
    } catch (error) {
      console.error(error);
    }
  };

  return (
    <>
      <Head>
        <title>Privy Auth Demo</title>
      </Head>

      <main className="flex flex-col min-h-screen px-4 sm:px-20 py-6 sm:py-10 bg-privy-light-blue">
        {ready && authenticated && (
          <main>
            <div className="flex flex-row justify-between">
              <h1 className="text-2xl font-semibold">Privy Auth Demo</h1>
              <button
                onClick={logout}
                className="text-sm bg-violet-200 hover:text-violet-900 py-2 px-4 rounded-md text-violet-700"
              >
                Logout
              </button>
            </div>

            <div className="mt-8">
              <h2 className="text-xl font-semibold">Register</h2>
              <form onSubmit={handleSubmit}>
                <div className="mt-4">
                  <label
                    htmlFor="firstName"
                    className="block text-sm font-medium text-gray-700"
                  >
                    First Name
                  </label>
                  <div className="mt-1">
                    <input
                      id="firstName"
                      name="firstName"
                      type="text"
                      autoComplete="given-name"
                      value={firstName}
                      onChange={(event) => setFirstName(event.target.value)}
                      required
                      className="appearance-none block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm placeholder-gray-400 focus:outline-none focus:ring-privy-blue focus:border-privy-blue sm:text-sm"
                    />
                  </div>
                </div>

                <div className="mt-4">
                  <label
                    htmlFor="lastName"
                    className="block text-sm font-medium text-gray-700"
                  >
                    Last Name
                  </label>
                  <div className="mt-1">
                    <input
                      id="lastName"
                      name="lastName"
                      type="text"
                      autoComplete="family-name"
                      value={lastName}
                      onChange={(event) => setLastName(event.target.value)}
                      required
                      className="appearance-none block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm placeholder-gray-400 focus:outline-none focus:ring-privy-blue focus:border-privy-blue sm:text-sm"
                    />
                  </div>
                </div>

                <div className="mt-4">
                  <label
                    htmlFor="socialHandle"
                    className="block text-sm font-medium text-gray-700"
                  >
                    Social Handle
                  </label>
                  <div className="mt-1">
                    <input
                      id="socialHandle"
                      name="socialHandle"
                      type="text"
                      autoComplete="socialHandle"
                      value={socialHandle}
                      onChange={(event) => setSocialHandle(event.target.value)}
                      required
                      className="appearance-none block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm placeholder-gray-400 focus:outline-none focus:ring-privy-blue focus:border-privy-blue sm:text-sm"
                    />
                  </div>
                </div>

                <div className="mt-4">
                  <label
                    htmlFor="email"
                    className="block text-sm font-medium text-gray-700"
                  >
                    Email
                  </label>
                  <div className="mt-1">
                    <input
                      id="email"
                      name="email"
                      type="email"
                      autoComplete="email"
                      value={email}
                      onChange={(event) => setEmail(event.target.value)}
                      required
                      className="appearance-none block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm placeholder-gray-400 focus:outline-none focus:ring-privy-blue focus:border-privy-blue sm:text-sm"
                    />
                  </div>
                </div>

                <button
                  style={{
                    width: "100px",
                    height: "50px",
                    background: "#FFFFFF",
                    borderRadius: "10%",
                    float: "right",
                    marginTop: "20px",
                  }}
                  type="submit"
                >
                  Submit
                </button>
              </form>
            </div>
          </main>
        )}
      </main>
    </>
  );
};

export default RegisterPage;
