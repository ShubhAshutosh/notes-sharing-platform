import React, { useEffect, useState } from 'react';
import { getFirestore, collection, getDocs } from 'firebase/firestore';
import { Container, Row, Col, ListGroup, Dropdown, Button, Form } from 'react-bootstrap';
import { Link } from 'react-router-dom';
import Rating from './Rating'; // Import Rating component

function AllNotes() {
  const [notes, setNotes] = useState([]); // Store all fetched notes
  const [filteredNotes, setFilteredNotes] = useState([]); // Store filtered notes
  const [sortBy, setSortBy] = useState('name');
  const [category, setCategory] = useState('All');
  const [searchQuery, setSearchQuery] = useState(''); // State for search query
  const db = getFirestore();

  const fetchNotes = async () => {
    try {
      const notesCollection = collection(db, 'notes');
      const noteSnapshot = await getDocs(notesCollection);
      const notesList = noteSnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
      console.log("Fetched notes:", notesList);
      setNotes(notesList);
      setFilteredNotes(notesList); // Set all notes initially
    } catch (error) {
      console.error("Error fetching notes:", error);
    }
  };

  useEffect(() => {
    fetchNotes();
  }, []);

  useEffect(() => {
    let updatedNotes = [...notes];

    // Apply category filter
    if (category !== 'All') {
      updatedNotes = updatedNotes.filter(note => note.category === category);
    }

    // Apply sorting
    if (sortBy === 'name') {
      updatedNotes.sort((a, b) => a.name.localeCompare(b.name));
    } else if (sortBy === 'date') {
      updatedNotes.sort((a, b) => new Date(b.date) - new Date(a.date));
    }

    // Apply search filter
    if (searchQuery) {
      updatedNotes = updatedNotes.filter(note => note.name.toLowerCase().includes(searchQuery.toLowerCase()));
    }

    setFilteredNotes(updatedNotes);
  }, [sortBy, category, notes, searchQuery]);

  return (
    <Container className="my-4 p-4" style={{ background: 'linear-gradient(to right, #ff7e5f, #feb47b)', borderRadius: '10px' }}>
      <Row>
        <Col md={8} className="mx-auto">
          <h2 className="mb-4 text-white">All Notes</h2>

          <Form className="mb-4">
            <Row>
              <Col md={4}>
                <Dropdown className="mb-2">
                  <Dropdown.Toggle variant="light" id="dropdown-basic">
                    Sort By: {sortBy === 'name' ? 'Name' : 'Date'}
                  </Dropdown.Toggle>
                  <Dropdown.Menu>
                    <Dropdown.Item onClick={() => setSortBy('name')}>Name</Dropdown.Item>
                    <Dropdown.Item onClick={() => setSortBy('date')}>Date</Dropdown.Item>
                  </Dropdown.Menu>
                </Dropdown>
              </Col>
              <Col md={4}>
                <Dropdown className="mb-2">
                  <Dropdown.Toggle variant="light" id="dropdown-basic">
                    Category: {category}
                  </Dropdown.Toggle>
                  <Dropdown.Menu>
                    <Dropdown.Item onClick={() => setCategory('All')}>All</Dropdown.Item>
                    <Dropdown.Item onClick={() => setCategory('Category1')}>Category1</Dropdown.Item>
                    <Dropdown.Item onClick={() => setCategory('Category2')}>Category2</Dropdown.Item>
                  </Dropdown.Menu>
                </Dropdown>
              </Col>
              <Col md={4}>
                <Form.Control
                  type="text"
                  placeholder="Search notes"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="mb-2"
                />
              </Col>
            </Row>
            <Link to="/">
              <Button variant="outline-light" className="rounded-pill px-4 py-2">Back to Home</Button>
            </Link>
          </Form>

          <ListGroup className="mt-4">
            {filteredNotes.length === 0 ? (
              <p className="text-white">No notes available.</p>
            ) : (
              filteredNotes.map((note) => (
                <ListGroup.Item key={note.id} className="mb-2 rounded">
                  <h5>{note.name}</h5>
                  <p>{note.description}</p>
                  <p>Uploaded by: {note.uploadedBy || 'Unknown'}</p>
                  <a href={note.url} target="_blank" rel="noopener noreferrer" className="text-primary">View Note</a>
                  <Rating noteId={note.id} />
                </ListGroup.Item>
              ))
            )}
          </ListGroup>
        </Col>
      </Row>
    </Container>
  );
}

export default AllNotes;
