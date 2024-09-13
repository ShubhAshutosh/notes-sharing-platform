import { useState } from 'react';
import { ref, uploadBytesResumable, getDownloadURL } from "firebase/storage"; // Firebase storage functions
import { storage, db } from './firebase'; // Import storage and Firestore from your Firebase config
import { collection, addDoc } from "firebase/firestore"; // Firestore to save file metadata

function Upload() {
  const [file, setFile] = useState(null);
  const [fileDescription, setFileDescription] = useState("");
  const [progress, setProgress] = useState(0);

  // Handle file selection
  const handleFileChange = (e) => {
    setFile(e.target.files[0]);
  };

  // Handle file upload
  const handleUpload = () => {
    if (file) {
      const storageRef = ref(storage, `notes/${file.name}`); // File path in storage
      const uploadTask = uploadBytesResumable(storageRef, file);

      uploadTask.on(
        'state_changed',
        (snapshot) => {
          // Calculate and set progress
          const progressPercent = (snapshot.bytesTransferred / snapshot.totalBytes) * 100;
          setProgress(progressPercent);
        },
        (error) => {
          console.error("Error uploading file:", error);
        },
        () => {
          // Get file download URL and store metadata in Firestore
          getDownloadURL(uploadTask.snapshot.ref).then((downloadURL) => {
            addDoc(collection(db, 'notes'), {
              url: downloadURL,
              name: file.name,
              description: fileDescription,
              createdAt: new Date(),
            }).then(() => {
              alert('File uploaded successfully!');
            });
          });
        }
      );
    }
  };

  return (
    <div>
      <h2>Upload Notes</h2>
      <input type="file" onChange={handleFileChange} />
      <input
        type="text"
        placeholder="File description"
        value={fileDescription}
        onChange={(e) => setFileDescription(e.target.value)}
      />
      <button onClick={handleUpload}>Upload</button>
      {progress > 0 && <p>Upload Progress: {progress}%</p>}
    </div>
  );
}

export default Upload;
