import React from 'react';
import { BrowserRouter as Router, Route, Routes } from 'react-router-dom';
import Login from './components/Login';
import Home from './components/Home';
import Register from './components/Register';
import Profile from './components/Profile';
import EditAlbum from './components/EditAlbum';
import UploadPhoto from './components/UploadPhoto';
import ViewPhoto from './components/ViewPhotos';
import EditProfile from './components/EditProfile';
import PhotoInfo from './components/PhotoInfo';
import ExtraerTexto from './components/ExtraerTexto';
///profile/:username/album/:albumId/photo/:photoId

function App() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<Home/>} />
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register/>} />
        <Route path="/profile" element={<Profile/>} />
        <Route path="/edit-album" element={<EditAlbum />} />  
        <Route path="/upload-photo" element={<UploadPhoto />} />
        <Route path="/view-photo" element={<ViewPhoto />} />     
        <Route path="/edit-profile" element={<EditProfile  />} />
        <Route path="/detalle-foto" element={<PhotoInfo />} />
        <Route path="/extraer-text" element={<ExtraerTexto />} />
      </Routes>
    </Router>
  );
}

export default App;