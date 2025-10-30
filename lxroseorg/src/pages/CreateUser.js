import React, { useState } from 'react';
import { db, storage } from '../firebase';
import { doc, setDoc } from 'firebase/firestore';

const CreateUser = () => {
  const [username, setUsername] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [docId, setDocId] = useState("");
  const [image, setImage] = useState(null);
  const [imageUrl, setImageUrl] = useState("");
  const [errors, setErrors] = useState({});

  const validateForm = () => {
    const newErrors = {};
    if (!docId.trim()) newErrors.docId = "Document ID is required";
    if (!username.trim()) newErrors.username = "Username is required";
    if (!email.trim()) {
      newErrors.email = "Email is required";
    } else if (!/\S+@\S+\.\S+/.test(email)) {
      newErrors.email = "Email is invalid";
    }
    if (!password.trim()) {
      newErrors.password = "Password is required";
    } else if (password.length < 6) {
      newErrors.password = "Password must be at least 6 characters";
    }
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleImageChange = (e) => {
    const file = e.target.files[0];
    setImage(file);
  };

  const handleUpload = async () => {
    const uploadTask = storage.ref(`images/${image.name}`).put(image);

    return new Promise((resolve, reject) => {
      uploadTask.on(
        'state_changed',
        snapshot => {},
        error => {
          console.log(error);
          reject(error);
        },
        async () => {
          const url = await storage.ref('images').child(image.name).getDownloadURL();
          setImageUrl(url);
          resolve(url);
        }
      );
    });
  };

  const createUser = async () => {
    if (!validateForm()) return;

    try {
      if (image) {
        const uploadedImageUrl = await handleUpload();
        await setDoc(doc(db, 'users', docId), {
          username,
          email,
          password,
          imageUrl: uploadedImageUrl,
          mailbox: [],
          sentMessages: []
        });
      } else {
        await setDoc(doc(db, 'users', docId), {
          username,
          email,
          password,
          mailbox: [],
          sentMessages: []
        });
      }
      
      alert('User created successfully');
      setUsername("");
      setEmail("");
      setPassword("");
      setDocId("");
      setImage(null);
      setImageUrl("");
      setErrors({});
    } catch (error) {
      console.error("Error creating user: ", error);
      setErrors({ general: "Failed to create user. Please try again." });
    }
  };

  return (
    <div className="create-user-form">
      <h2>Create New User</h2>
      <form>
        <input
          type="file"
          onChange={handleImageChange}
        />
        {errors.docId && <div className="error">{errors.docId}</div>}
        <input
          type="text"
          placeholder="Document ID"
          value={docId}
          onChange={(e) => setDocId(e.target.value)}
        />
        {errors.username && <div className="error">{errors.username}</div>}
        <input
          type="text"
          placeholder="Username"
          value={username}
          onChange={(e) => setUsername(e.target.value)}
        />
        {errors.email && <div className="error">{errors.email}</div>}
        <input
          type="email"
          placeholder="Email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
        />
        {errors.password && <div className="error">{errors.password}</div>}
        <input
          type="password"
          placeholder="Password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
        />
        {errors.general && <div className="error">{errors.general}</div>}
        <button type="button" onClick={createUser}>Create User</button>
      </form>
    </div>
  );
};

export default CreateUser;