import React, { useState, useEffect } from "react";
import { Container, Button } from 'react-bootstrap';
import { BrowserRouter as Router, Route, Routes } from 'react-router-dom';
import Home from './Home';
import AllNotes from './AllNotes';
import { auth, provider, signInWithPopup, signOut } from "./firebase";
import 'bootstrap/dist/css/bootstrap.min.css';

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
    <Router>
      <Container className="my-4 text-center">
        {user ? (
          <>
            <h1 className="mb-4">Welcome, {user.displayName}</h1>
            <Button variant="danger" onClick={handleLogout} className="rounded-pill px-4 py-2">Logout</Button>
            <Routes>
              <Route path="/" element={<Home />} />
              <Route path="/all-notes" element={<AllNotes />} />
            </Routes>
          </>
        ) : (
          <>
            <h1 className="mb-4">Notes Sharing Platform</h1>
            <Button variant="primary" onClick={handleLogin} className="rounded-pill px-4 py-2">Login with Google</Button>
          </>
        )}
      </Container>
    </Router>
  );
}

export default App;
