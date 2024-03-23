import React, { useState, useEffect } from 'react';
import { NavLink, useNavigate} from 'react-router-dom';
import { Navbar, Nav } from 'react-bootstrap';

import axios from 'axios';
import Swal from 'sweetalert2';
import 'bootstrap/dist/css/bootstrap.min.css';
import '../App.css';
import logo from '../logoFaunadex.png';

const ExtraerTexto = () => {
  const [selectedFile, setSelectedFile] = useState(null);
  const [previewUrl, setPreviewUrl] = useState(null);
  const [backendUrl, setBackendUrl] = useState('');
  const [extractedText, setExtractedText] = useState('');
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

  const handleFileChange = (event) => {
    const file = event.target.files[0];
    setSelectedFile(file);
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setPreviewUrl(reader.result);
      };
      reader.readAsDataURL(file);
    }
  };


  const handleExtractText = async () => {
    console.log('Se presionó extraer texto');
    const formData = new FormData();
    formData.append('foto', selectedFile);
  
    try {
      const response = await axios.post(`${backendUrl}/extraer-texto`, formData);
      setExtractedText(response.data.texto);
      history('/profile');
    } catch (error) {
      Swal.fire('Error', "No se pudo extraer el texto", 'error');
    }
  };
  

  return (
    <div>
      <Navbar bg="dark" variant="dark" expand="lg" className='nav-pading'>
        <img src={logo} alt="Logo" width="50" height="50"  />
        <Navbar.Toggle aria-controls="basic-navbar-nav" />
        <Navbar.Collapse id="basic-navbar-nav">
          <Nav className="ml-auto nav-margin">
            <Nav.Link as={NavLink} to="/profile" className='nav-pading' >Mi Perfil</Nav.Link>
            <Nav.Link as={NavLink} to="/view-photo" className='nav-pading'>Ver Fotos</Nav.Link>
            <Nav.Link as={NavLink} to="/upload-photo"  className='nav-pading'>Subir Fotos</Nav.Link>
            <Nav.Link as={NavLink} to="/edit-album"  className='nav-pading'>Editar Álbumes</Nav.Link>
            <Nav.Link as={NavLink} to="/extraer-text"  className='nav-pading'>Extraer Texto</Nav.Link>
          </Nav>
        </Navbar.Collapse>
      </Navbar>
      <div className="container mt-5">
        <div className="row">
          <div className="col-md-6">
            <div className="card p-3" style={{ height: '500px'}}>
              <h4 className='text-center'>Seleccionar Imagen</h4>
              <input
                type="file"
                className='form-control mb-2'
                accept=".jpg, .jpeg, .png"
                onChange={handleFileChange}
              />
              {previewUrl && (
                <div style={{ height: '100%', overflow: 'hidden' }}>
                  <img
                    src={previewUrl}
                    alt="Preview"
                    className="img-fluid mt-3"
                    style={{ objectFit: 'cover', height: '100%', width: '100%' }}
                  />
                </div>
              )}
            </div>
          </div>
          <div className="col-md-6">
            <div className="card p-3 justify-content-center aling-items-center" style={{ height: '500px', backgroundColor: 'rgba(255, 255, 255, 0.45)', color:'white'}}>
              <h2 className='text-center mb-4'>Extraer Texto</h2>
              <button className="btn btn-primary mb-3" onClick={handleExtractText}>Extraer</button>
              <label>Texto Extraído:</label>
              <textarea
                id="extracted-text"
                className="form-control mb-3"
                readOnly
                style={{ height: '400px'}}
                value={extractedText}
              />
              
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default ExtraerTexto;
