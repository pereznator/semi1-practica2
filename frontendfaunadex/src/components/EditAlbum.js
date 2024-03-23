import React, { useState,useEffect } from 'react';
import { Navbar, Nav } from 'react-bootstrap';
import { NavLink } from 'react-router-dom';
import axios from 'axios';
import Swal from 'sweetalert2';
import 'bootstrap/dist/css/bootstrap.min.css';
import '../App.css';
import logo from '../logoFaunadex.png';

const EditAlbum = () => {
  const id_user = localStorage.getItem('id_user');
  const [albumName, setAlbumName] = useState('');
  const [selectedAlbum, setSelectedAlbum] = useState('');
  const [isEditing, setIsEditing] = useState(false);
  const [backendUrl, setBackendUrl] = useState('');
  const [albumList, setAlbumList] = useState([]); 

  useEffect(() => {
    fetch('/config.txt')
      .then(response => response.text())
      .then(data => {
        const lines = data.split('\n');
        const backendUrlLine = lines.find(line => line.startsWith('backendpy='));
        if (backendUrlLine) {
          const url = backendUrlLine.split('=')[1].trim();
          setBackendUrl(url);
          const getUserAlbum = async () => {
            try {
              const response = await axios.get(`${url}/albumes/${id_user}`);
                let lista_albumes = [];
                for (let i = 0; i < response.data.length; i++) {
                  let album = {
                    album_id: response.data[i].album_id,
                    nombre_album: response.data[i].nombre_album,
                  };
                  
                  if (response.data[i].nombre_album !== 'Fotos del perfil') {
                      lista_albumes.push(album);
                  }
                }
                setAlbumList(lista_albumes);
                
            } catch (error) {
              Swal.fire('Error', "No se pudo obtener informacion de los albumes existentes", 'error');
            }
          };
          getUserAlbum();
        }
      })
      .catch(error => console.error('Error al leer el archivo de configuración:', error));
  }, [id_user]); 

  const getUserData = async () => {
    try {
      const response = await axios.get(`${backendUrl}/albumes/${id_user}`);
      let lista_albumes = [];
      for (let i = 0; i < response.data.length; i++) {
        let album = {
          album_id: response.data[i].album_id,
          nombre_album: response.data[i].nombre_album,
        };
        if (response.data[i].nombre_album !== 'Fotos del perfil') {
            lista_albumes.push(album);
        }
      }
      setAlbumList(lista_albumes);
    } catch (error) {
      Swal.fire('Error',"No se pudo obtener informacion de los albumes existentes", 'error');
    }
  };

  const handleCreate = async() => {
    console.log('Se preciono Crear Álbum:');
    console.log('Nuevo Álbum:', albumName);
    try {
      const response = await axios.post(`${backendUrl}/crear-album/${id_user}`, { nombre_album: albumName });
      
      console.log(response.data);
      Swal.fire('Álbum creado', `El álbum ${albumName} se ha creado correctamente`, 'success');
      getUserData();
      
    } catch (error) {
      Swal.fire('Error', "No se pudo crear el nuevo album", 'error');
    }
    handleCancel()
  };

  const handleModify = async() => {
    console.log('Se preciono Modificar Álbum:');
    console.log('id_album:', selectedAlbum);
    console.log('Nuevo Nombre:', albumName);
    try {
      const response = await axios.put(`${backendUrl}/actualizar-album/${selectedAlbum}`,
      { nombre_album: albumName }
      );
        console.log(response.data);
        Swal.fire('Álbum modificado', `El álbum se ha modificado correctamente`, 'success');
        getUserData();
      
    } catch (error) {
      Swal.fire('Error', "No se pudo modificar el album", 'error');
    }
    handleCancel()
  };

  const handleDelete = async() => {
    console.log('Se preciono Eliminar Álbum:');
    console.log('Índice:', albumList.indexOf(selectedAlbum));
    console.log('Álbum a eliminar:', selectedAlbum);
    try {
      const response = await axios.delete(`${backendUrl}/eliminar-album/${selectedAlbum}`);
      console.log(response.data);
      Swal.fire('Álbum eliminado', `El álbum se ha eliminado correctamente`, 'success');
      getUserData();
       
    } catch (error) {
      Swal.fire('Error', "No se pudo eliminar el album", 'error');
    }
    handleCancel()
  };

  const handleCancel = () => {
    setSelectedAlbum('');
    setIsEditing(false);
    setAlbumName('');
  };

  return (
    <div>
      <Navbar bg="dark" variant="dark" expand="lg" className="nav-pading">
        <img src={logo} alt="Logo" width="50" height="50" />
        <Navbar.Toggle aria-controls="basic-navbar-nav" />
        <Navbar.Collapse id="basic-navbar-nav">
          <Nav className="ml-auto nav-margin">
            <Nav.Link as={NavLink} to="/profile" className="nav-pading">
              Mi Perfil
            </Nav.Link>
            <Nav.Link as={NavLink} to="/view-photo" className="nav-pading">
              Ver Fotos
            </Nav.Link>
            <Nav.Link as={NavLink} to="/upload-photo" className="nav-pading">
              Subir Fotos
            </Nav.Link>
            <Nav.Link as={NavLink} to="/edit-album" className="nav-pading">
              Editar Álbumes
            </Nav.Link>
            
            <Nav.Link as={NavLink} to="/extraer-text"  className='nav-pading'>
              Extraer Texto
            </Nav.Link>
          </Nav>
        </Navbar.Collapse>
      </Navbar>
      <div className="d-flex justify-content-center align-items-center" style={{ height: '100vh' }}>
        <div className="d-block" style={{ width: '800px', backgroundColor: 'rgba(255, 255, 255, 0.45)', padding: '30px', borderRadius: '20px' }}>
          <h2 className="text-center">Editor de Álbumes</h2>
          <div className="d-flex">
            <div className="d-flex flex-column" style={{ width: '50%' }}>
              <label>Nombre del Álbum</label>
              <input
                type="text"
                className="form-control mb-2"
                value={albumName}
                onChange={(e) => setAlbumName(e.target.value)}
              />
              <label>Seleccionar Álbum</label>
              <select
                className="form-control mb-2"
                value={selectedAlbum}
                onChange={(e) => {
                  setSelectedAlbum(e.target.value);
                  setIsEditing(true);
                  setAlbumName(e.target.options[e.target.selectedIndex].text);
                }}
              >
                <option value="">Seleccionar...</option>
                {albumList.map((album) => (
                  <option key={album.album_id} value={album.album_id}>
                  {album.nombre_album}
                </option>
                ))}
              </select>
            </div>
            <div style={{ width: '50%', marginLeft: '50px', display: 'flex', justifyContent: 'center' }}>
              <div className="mt-3 d-flex flex-column align-items-center">
                <div className="mb-2" style={{ width: '150px' }}>
                  <button className="btn btn-primary btn-block" onClick={handleCreate} style={{ width: '100%' }}>
                    Crear
                  </button>
                </div>
                <div className="mb-2" style={{ width: '150px' }}>
                  <button className="btn btn-warning btn-block" onClick={handleModify} disabled={!isEditing} style={{ width: '100%' }}>
                    Modificar
                  </button>
                </div>
                <div className="mb-2" style={{ width: '150px' }}>
                  <button className="btn btn-danger btn-block" onClick={handleDelete} disabled={!isEditing} style={{ width: '100%' }}>
                    Eliminar
                  </button>
                </div>
                <div style={{ width: '150px' }}>
                  <button className="btn btn-success btn-block" onClick={handleCancel} disabled={!isEditing} style={{ width: '100%' }}>
                    Cancelar
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default EditAlbum;
