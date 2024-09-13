import React, { useCallback, useEffect, useState } from 'react';
import { getFirestore, collection, getDocs, addDoc } from 'firebase/firestore';
import { storage } from './firebase'; // Import storage
import { ref, uploadBytesResumable, getDownloadURL } from 'firebase/storage'; // Import uploadBytesResumable
import './Home.css';

function Home() {
  const [notes, setNotes] = useState([]);
  const [search, setSearch] = useState('');
  const [file, setFile] = useState(null);
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [uploadProgress, setUploadProgress] = useState(0);
  const [uploadMessage, setUploadMessage] = useState('');
  const [uploadError, setUploadError] = useState('');
  const db = getFirestore();

  // Memoize fetchNotes function
  const fetchNotes = useCallback(async () => {
    try {
      const notesCollection = collection(db, 'notes');
      const noteSnapshot = await getDocs(notesCollection);
      const notesList = noteSnapshot.docs.map(doc => doc.data());
      console.log("Fetched notes:", notesList); // Debug: Check fetched notes
      setNotes(notesList);
    } catch (error) {
      console.error("Error fetching notes:", error);
    }
  }, [db]); // Include db as a dependency if it changes

  useEffect(() => {
    fetchNotes();
  }, [fetchNotes]); // Include fetchNotes in the dependency array

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
            uploader: 'Anonymous', // Replace with actual uploader info
          });
          setFile(null);
          setName('');
          setDescription('');
          setUploadProgress(0);
          setUploadMessage('Note uploaded successfully!');
          setUploadError('');
          fetchNotes(); // Refresh notes list
        } catch (error) {
          console.error("Error saving note:", error);
          setUploadError('Upload failed.');
          setUploadMessage('');
        }
      }
    );
  };

  const filteredNotes = notes.filter(note =>
    note.name.toLowerCase().includes(search.toLowerCase()) ||
    note.description.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="home-container">
      <h2>Available Notes</h2>
      <input
        type="text"
        placeholder="Search notes..."
        value={search}
        onChange={(e) => setSearch(e.target.value)}
      />
      <div>
        <h3>Upload a Note</h3>
        <input
          type="text"
          placeholder="Note Name"
          value={name}
          onChange={(e) => setName(e.target.value)}
        />
        <input
          type="text"
          placeholder="Note Description"
          value={description}
          onChange={(e) => setDescription(e.target.value)}
        />
        <input
          type="file"
          onChange={handleFileChange}
        />
        <button onClick={handleUpload}>Upload</button>
        {uploadProgress > 0 && (
          <div className="progress-bar">
            <div className="progress" style={{ width: `${uploadProgress}%` }}>
              {Math.round(uploadProgress)}%
            </div>
          </div>
        )}
        {uploadMessage && <p className="upload-message">{uploadMessage}</p>}
        {uploadError && <p className="upload-error">{uploadError}</p>}
      </div>
      <ul>
        {filteredNotes.map((note, index) => (
          <li key={index}>
            <a href={note.url} target="_blank" rel="noopener noreferrer">
              {note.name}
            </a>
            <p>{note.description}</p>
            <small>Uploaded by: {note.uploader}</small>
          </li>
        ))}
      </ul>
    </div>
  );
}

export default Home;
