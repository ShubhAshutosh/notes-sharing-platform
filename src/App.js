import { useState, useEffect } from "react";
import './App.css';
import Home from './Home';
import { auth, provider, signInWithPopup, signOut } from "./firebase";

function App() {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const unsubscribe = auth.onAuthStateChanged((user) => {
      setUser(user);
      setLoading(false);
    });
    return () => unsubscribe();
  }, []);

  const handleLogin = () => {
    signInWithPopup(auth, provider)
      .then((result) => {
        setUser(result.user);
      })
      .catch((error) => console.error(error));
  };

  const handleLogout = () => {
    signOut(auth)
      .then(() => setUser(null))
      .catch((error) => console.error(error));
  };

  if (loading) return <div>Loading...</div>;

  return (
    <div className="App">
      {user ? (
        <>
          <h1>Welcome, {user.displayName}</h1>
          <button onClick={handleLogout}>Logout</button>
          <Home />
        </>
      ) : (
        <>
          <h1>Notes Sharing Platform</h1>
          <button onClick={handleLogin}>Login with Google</button>
        </>
      )}
    </div>
  );
}

export default App;

