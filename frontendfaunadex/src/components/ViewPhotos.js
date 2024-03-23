import React, { useState, useEffect } from 'react';
import { Navbar, Nav, Carousel } from 'react-bootstrap';
import { NavLink, useNavigate } from 'react-router-dom';
import axios from 'axios';
import Swal from 'sweetalert2'; 
import 'bootstrap/dist/css/bootstrap.min.css';
import '../App.css';
import logo from '../logoFaunadex.png';
// { nombre_album: '1', fotos: [{foto_id: 1, foto_url: '/animales/panda.jpeg', nombre_foto: '1', descripcion: '1'}] }

const ViewPhotos = () => {
  const id_user = localStorage.getItem('id_user');
  const [albums, setAlbumList] = useState([]);
  const history = useNavigate();

  useEffect(() => {
    fetch('/config.txt')
      .then(response => response.text())
      .then(data => {
        const lines = data.split('\n');
        const backendUrlLine = lines.find(line => line.startsWith('backendpy='));
        if (backendUrlLine) {
          const url = backendUrlLine.split('=')[1].trim();
          const getUserAlbum = async () => {
            try {
              const response = await axios.get(`${url}/albumes/${id_user}`);
              
              let listaAlbumes = []
              let albums = response.data;
              for (let i = 0; i < albums.length; i++) {
                if (albums[i].nombre_album === 'Fotos del perfil') {
                  listaAlbumes.unshift(albums[i]);
                } else {
                  listaAlbumes.push(albums[i]);
                }
              }
              setAlbumList(listaAlbumes);
              
            } catch (error) {
              Swal.fire('Error',"No se pudieron obtener los albumes y fotos", 'error');
            }
          };
          getUserAlbum();
        }
      })
      .catch(error => console.error('Error al leer el archivo de configuración:', error));
  }, [id_user]); 

  const handlePhotoClick = (photoId,linkfoto,nombre,descripcion) => {
    localStorage.setItem('foto_id', photoId);
    localStorage.setItem('foto_url', linkfoto);
    localStorage.setItem('nombre_foto', nombre);
    localStorage.setItem('descripcion', descripcion);
    history('/detalle-foto');

  };

  return (
    <div>
      <Navbar bg="dark" variant="dark" expand="lg" className='nav-pading'>
        <img src={logo} alt="Logo" width="50" height="50" />
        <Navbar.Toggle aria-controls="basic-navbar-nav" />
        <Navbar.Collapse id="basic-navbar-nav">
          <Nav className="ml-auto nav-margin">
            <Nav.Link as={NavLink} to="/profile" className='nav-pading'>Mi Perfil</Nav.Link>
            <Nav.Link as={NavLink} to="/view-photo" className='nav-pading'>Ver Fotos</Nav.Link>
            <Nav.Link as={NavLink} to="/upload-photo" className='nav-pading'>Subir Fotos</Nav.Link>
            <Nav.Link as={NavLink} to="/edit-album" className='nav-pading'>Editar Álbumes</Nav.Link>
            <Nav.Link as={NavLink} to="/extraer-text"  className='nav-pading'>Extraer Texto</Nav.Link>
          </Nav>
        </Navbar.Collapse>
      </Navbar>
      <h2>Álbumes</h2>
      <div className="album-container">
        {albums.map((album, index) => (
          <div key={index} className="album" style={{ backgroundColor: 'rgba(255, 255, 255, 0.45)', width: '80%', margin: '50px auto', padding: '15px', borderRadius: '30px' }}>
            <h3>{album.nombre_album}</h3>
            <Carousel>
              {album.fotos.map((photo, photoIndex) => (
                <Carousel.Item>
                    <div 
                      onClick={() => handlePhotoClick(photo.foto_id, photo.foto_url,photo.nombre_foto,photo.descripcion)} 
                      style={{ display: 'inline-block', width: '100%', height: 'auto' }}
                    >
                        <img 
                          src={photo.foto_url} 
                          className="d-block mx-auto" 
                          alt={`Foto ${photoIndex + 1}`} 
                          style={{ width: '400px', height: '400px', objectFit: 'contain' }}
                        />
                    </div>
                </Carousel.Item>
              ))}
            </Carousel>
          </div>
        ))}
      </div>
    </div>
  );
}

export default ViewPhotos;