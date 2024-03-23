import React, { useState, useEffect } from 'react';
import { NavLink, useNavigate} from 'react-router-dom';
import { Navbar, Nav } from 'react-bootstrap';

import axios from 'axios';
import Swal from 'sweetalert2';
import 'bootstrap/dist/css/bootstrap.min.css';
import '../App.css';
import logo from '../logoFaunadex.png';

const PhotoInfo = () => {
  const [selectedItem, setSelectedItem] = useState("1"); 
  const [translation, setTranslation] = useState(""); 
  const [backendUrl, setBackendUrl] = useState('');

  const fotoUrl = localStorage.getItem('foto_url');
  const fotoNombre = localStorage.getItem('nombre_foto');
  const fotoDescripcion = localStorage.getItem('descripcion');

  const history = useNavigate();

  useEffect(() => {
    fetch('/config.txt')
      .then(response => response.text())
      .then(data => {
        const lines = data.split('\n');
        const backendUrlLine = lines.find(line => line.startsWith('backendpy='));
        if (backendUrlLine) {
          const url = backendUrlLine.split('=')[1].trim();
          setBackendUrl(url);
        }
      })
      .catch(error => console.error('Error al leer el archivo de configuración:', error));
  }, []); 

  const handleTranslate = async () => {
    console.log('Se presionó traducir');
    const data = {
      idioma: selectedItem,
      texto: fotoDescripcion
    };
    try {
      const response = await axios.post(`${backendUrl}/traducirtexto`, data);
      setTranslation(response.data.traduccion);
      history('/profile');

    } catch (error) {
      Swal.fire('Error', "No se pudo iniciar sesión, verifique sus datos", 'error');
    }
  };

  const handleRetornar = () => {
    localStorage.removeItem('foto_id');
    localStorage.removeItem('foto_url');
    localStorage.removeItem('nombre_foto');
    localStorage.removeItem('descripcion');
    history('/view-photo');
  }

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
      <div className="container mt-5">
        <div className="row">
          <div className="col-md-6" >
            <div className="card p-3" style={{ height: '500px', backgroundColor: 'rgba(255, 255, 255, 0.45)', color: 'white' }}>
              <h2 className="text-left mb-4">{fotoNombre}</h2>
              <img src={fotoUrl} alt="Descripción de la foto" className="img-fluid mx-auto d-block mt-3" style={{ maxHeight: '100%', maxWidth: '100%', objectFit: 'cover' }} />
              <button className="btn btn-primary mt-3" onClick={handleRetornar}>Regresar</button>
            </div>
          </div>
          <div className="col-md-6">
            <div className="card p-3 justify-content-center align-items-center" style={{ height: '500px', backgroundColor: 'rgba(255, 255, 255, 0.45)', color: 'white' }}>
              
              <div className="mb-3">
              <h4 className="text-left">Descripción</h4>
                <textarea className="form-control" style={{ width: '400px', resize: 'none' }} rows="5" value={fotoDescripcion} readOnly></textarea>
              </div>
                <label htmlFor="selectItem" className="form-label">Seleccionar:</label>

              <div className="d-flex justify-content-end mb-3 mt-3">
                <select id="selectItem" className="form-select" value={selectedItem} onChange={(e) => setSelectedItem(e.target.value)}>
                    <option value="1">Item 1</option>
                    <option value="2">Item 2</option>
                    <option value="3">Item 3</option>
                </select>
                <button className="btn btn-primary me-3" onClick={handleTranslate}>Traducir</button>
              </div>
              <div className="mb-3">
                <h4 className="text-left">Traducción</h4>
                <textarea className="form-control" style={{ width: '400px', resize: 'none' }} rows="5" value={translation} readOnly></textarea>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default PhotoInfo;