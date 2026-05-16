import { onAuthStateChanged, signOut } from "firebase/auth";
import { useEffect, useState } from "react";
import Dashboard from "./Dashboard.jsx";
import Landing from "./Landing.jsx";
import { auth, signInWithGoogle } from "./firebase.js";

export default function App() {
  const [user, setUser] = useState(null);
  const [checkingAuth, setCheckingAuth] = useState(true);
  const [authError, setAuthError] = useState("");

  useEffect(() => {
    if (!auth) {
      setCheckingAuth(false);
      return undefined;
    }
    const unsubscribe = onAuthStateChanged(auth, (currentUser) => {
      setUser(currentUser);
      setCheckingAuth(false);
    });
    return unsubscribe;
  }, []);

  async function handleLogin() {
    setAuthError("");
    try {
      await signInWithGoogle();
    } catch (error) {
      setAuthError(error.message || "Could not sign in with Google.");
    }
  }

  async function handleSignOut() {
    if (!auth) {
      setUser(null);
      return;
    }
    try {
      await signOut(auth);
    } catch (error) {
      setAuthError(error.message || "Could not sign out.");
    }
  }

  if (checkingAuth) {
    return (
      <main className="grid min-h-screen place-items-center bg-bg px-6 text-body">
        <div className="rounded-cm border border-border bg-surface p-6 text-center">
          <p className="text-sm text-muted">Loading Corrupted Minds...</p>
        </div>
      </main>
    );
  }

  return user ? (
    <Dashboard user={user} onSignOut={handleSignOut} authError={authError} />
  ) : (
    <Landing onLogin={handleLogin} authError={authError} />
  );
}
