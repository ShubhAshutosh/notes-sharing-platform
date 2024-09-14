import React, { useCallback, useEffect, useState } from 'react';
import { getFirestore, collection, getDocs, addDoc } from 'firebase/firestore';
import { storage } from './firebase';
import { ref, uploadBytesResumable, getDownloadURL } from 'firebase/storage';
import { Container, Row, Col, Form, Button, ListGroup, Alert, ProgressBar } from 'react-bootstrap';
import { Link } from 'react-router-dom';
import { useSpring, animated } from 'react-spring'; // Import react-spring for animations

function Home() {
  const [notes, setNotes] = useState([]);
  const [search, setSearch] = useState('');
  const [file, setFile] = useState(null);
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [uploadProgress, setUploadProgress] = useState(0);
  const [uploadMessage, setUploadMessage] = useState('');
  const [uploadError, setUploadError] = useState('');
  const [filteredNotes, setFilteredNotes] = useState([]);
  const [searchTriggered, setSearchTriggered] = useState(false); // State to trigger animation

  const db = getFirestore();

  const fetchNotes = useCallback(async () => {
    try {
      const notesCollection = collection(db, 'notes');
      const noteSnapshot = await getDocs(notesCollection);
      const notesList = noteSnapshot.docs.map(doc => doc.data());
      console.log("Fetched notes:", notesList);
      setNotes(notesList);
      setFilteredNotes(notesList);
    } catch (error) {
      console.error("Error fetching notes:", error);
    }
  }, [db]);

  useEffect(() => {
    fetchNotes();
  }, [fetchNotes]);

  const handleFileChange = (e) => {
    setFile(e.target.files[0]);
  };

  const handleUpload = async () => {
    if (!file) return;

    const fileRef = ref(storage, `notes/${file.name}`);
    const uploadTask = uploadBytesResumable(fileRef, file);

    uploadTask.on('state_changed',
      (snapshot) => {
        const progress = (snapshot.bytesTransferred / snapshot.totalBytes) * 100;
        setUploadProgress(progress);
      },
      (error) => {
        console.error("Error uploading file:", error);
        setUploadError('Upload failed.');
        setUploadMessage('');
      },
      async () => {
        try {
          const fileURL = await getDownloadURL(uploadTask.snapshot.ref);
          await addDoc(collection(db, 'notes'), {
            name,
            description,
            url: fileURL,
            uploader: 'Anonymous',
          });
          setFile(null);
          setName('');
          setDescription('');
          setUploadProgress(0);
          setUploadMessage('Note uploaded successfully!');
          setUploadError('');
          fetchNotes();
        } catch (error) {
          console.error("Error saving note:", error);
          setUploadError('Upload failed.');
          setUploadMessage('');
        }
      }
    );
  };

  const handleSearch = () => {
    const filtered = notes.filter(note =>
      note.name.toLowerCase().includes(search.toLowerCase()) ||
      note.description.toLowerCase().includes(search.toLowerCase())
    );
    setFilteredNotes(filtered);
    setSearchTriggered(true); // Trigger animation
  };

  const handleKeyPress = (e) => {
    if (e.key === 'Enter') {
      e.preventDefault(); // Prevent form submission or page reload
      handleSearch(); // Trigger search on Enter key press
    }
  };

  // Animation for search results
  const searchAnimation = useSpring({
    transform: searchTriggered ? 'translateY(0px)' : 'translateY(20px)',
    opacity: searchTriggered ? 1 : 0,
    config: { tension: 250, friction: 20 },
  });

  return (
    <Container className="my-4 p-4" style={{ background: 'linear-gradient(to right, #ff7e5f, #feb47b)', borderRadius: '10px' }}>
      <Row>
        <Col md={6} className="mx-auto">
          <h2 className="mb-4 text-white">Available Notes</h2>
          
          <Form className="mb-4">
            <Form.Group controlId="searchQuery">
              <Form.Control
                type="text"
                placeholder="Search notes..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                onKeyPress={handleKeyPress} // Call handleKeyPress on key press
                className="search-bar rounded-pill py-2 px-3 border-0"
                style={{ backgroundColor: '#ffffffb3', color: '#333' }}
              />
            </Form.Group>
            <Button variant="outline-light" onClick={handleSearch} className="mt-2 rounded-pill px-4 py-2">Search</Button>
            <Link to="/all-notes">
              <Button variant="outline-light" className="mt-2 rounded-pill px-4 py-2">Show All Notes</Button>
            </Link>
          </Form>
          
          <div className="mb-4">
            <h3 className="text-white">Upload a Note</h3>
            <Form>
              <Form.Group controlId="noteName">
                <Form.Control
                  type="text"
                  placeholder="Note Name"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="rounded-pill py-2 px-3 mb-2 border-0"
                  style={{ backgroundColor: '#ffffffb3', color: '#333' }}
                />
              </Form.Group>
              <Form.Group controlId="noteDescription" className="mt-2">
                <Form.Control
                  type="text"
                  placeholder="Note Description"
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  className="rounded-pill py-2 px-3 mb-2 border-0"
                  style={{ backgroundColor: '#ffffffb3', color: '#333' }}
                />
              </Form.Group>
              <Form.Group controlId="fileUpload" className="mt-2">
                <Form.Control
                  type="file"
                  onChange={handleFileChange}
                  className="rounded-pill border-0"
                />
              </Form.Group>
              <Button variant="light" onClick={handleUpload} className="mt-2 rounded-pill px-4 py-2">Upload</Button>
            </Form>
            {uploadProgress > 0 && (
              <ProgressBar now={uploadProgress} label={`${Math.round(uploadProgress)}%`} className="mt-2" />
            )}
            {uploadMessage && <Alert variant="success" className="mt-2">{uploadMessage}</Alert>}
            {uploadError && <Alert variant="danger" className="mt-2">{uploadError}</Alert>}
          </div>
          
          {/* Display a limited number of notes on the front page with animation */}
          <animated.div style={searchAnimation}>
            <ListGroup>
              {filteredNotes.slice(0, 5).map((note, index) => (
                <ListGroup.Item key={index} className="border-0 bg-light mb-2 rounded">
                  <a href={note.url} target="_blank" rel="noopener noreferrer" className="font-weight-bold">{note.name}</a>
                  <p>{note.description}</p>
                  <small className="text-muted">Uploaded by: {note.uploader}</small>
                </ListGroup.Item>
              ))}
            </ListGroup>
          </animated.div>
        </Col>
      </Row>
    </Container>
  );
}

export default Home;
