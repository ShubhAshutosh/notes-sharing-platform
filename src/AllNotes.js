import React, { useCallback, useEffect, useState } from 'react';
import { getFirestore, collection, getDocs } from 'firebase/firestore';
import { Container, Row, Col, ListGroup } from 'react-bootstrap';

function AllNotes() {
  const [notes, setNotes] = useState([]);
  const db = getFirestore();

  const fetchNotes = useCallback(async () => {
    try {
      const notesCollection = collection(db, 'notes');
      const noteSnapshot = await getDocs(notesCollection);
      const notesList = noteSnapshot.docs.map(doc => doc.data());
      console.log("Fetched all notes:", notesList);
      setNotes(notesList);
    } catch (error) {
      console.error("Error fetching notes:", error);
    }
  }, [db]);

  useEffect(() => {
    fetchNotes();
  }, [fetchNotes]);

  return (
    <Container className="my-4">
      <Row>
        <Col md={8} className="mx-auto">
          <h2 className="mb-4">All Notes</h2>
          <ListGroup>
            {notes.map((note, index) => (
              <ListGroup.Item key={index}>
                <a href={note.url} target="_blank" rel="noopener noreferrer" className="font-weight-bold">{note.name}</a>
                <p>{note.description}</p>
                <small className="text-muted">Uploaded by: {note.uploader}</small>
              </ListGroup.Item>
            ))}
          </ListGroup>
        </Col>
      </Row>
    </Container>
  );
}

export default AllNotes;
