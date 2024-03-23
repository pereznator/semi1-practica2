import React, { useState, useEffect } from 'react';
import { NavLink, useNavigate} from 'react-router-dom';
import { Navbar, Nav } from 'react-bootstrap';

import axios from 'axios';
import Swal from 'sweetalert2';
import 'bootstrap/dist/css/bootstrap.min.css';
import '../App.css';
import logo from '../logoFaunadex.png';

const UploadPhoto = () => {
  const [selectedFile, setSelectedFile] = useState(null);
  const [previewUrl, setPreviewUrl] = useState(null);
  const [imageName, setImageName] = useState('');
  const [backendUrl, setBackendUrl] = useState('');
  const [descripcion, setDescripcion] = useState('');
  const id_user = localStorage.getItem('id_user');
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
  }, [id_user]); 

  

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

  const handleNameChange = (event) => {
    setImageName(event.target.value);
  };


  const handleUpload = async() => {
    console.log('Se preciono Cargar Imagen:');
    console.log('Imagen:', selectedFile);
    console.log('Nombre imagen:', imageName);
    try {
      const formData = new FormData();
      
      if (selectedFile!==''){
        formData.append('foto', selectedFile);
      }
      formData.append('nombre', imageName);
      formData.append('descripcion', descripcion);

      const response = await axios.post(`${backendUrl}/cargarfoto`, formData);
      console.log(response.data);
      Swal.fire('¡Imagen cargada!', `La imagen ${imageName} se ha cargado correctamente`, 'success');
      setSelectedFile(null);
      setPreviewUrl(null);
      setImageName('');
      setDescripcion('');
      history('/upload-photo');
    } catch (error) {
      Swal.fire('Error', "No se pudo subir la imagen", 'error');
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
              <h4 className='text-center'>Subir Foto</h4>
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
              <h2 className='text-center mb-4'>Datos de la Imagen</h2>
              <label>Nombre de la Imagen:</label>
              <input
                type="text"
                id="image-name"
                placeholder="Nombre de la Imagen"
                value={imageName}
                onChange={handleNameChange}
                className="form-control mb-3"
              />
              <label>Descripción:</label> 
              <textarea
                id="image-description"
                placeholder="Descripción de la Imagen"
                className="form-control"
                style={{ height: '100px'}}
                value={descripcion}
                onChange={(event) => setDescripcion(event.target.value)}
              />
             
              
              <div className="mt-5">
                <button className="btn btn-primary me-3" onClick={handleUpload}>Cargar Imagen</button>
                
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default UploadPhoto;

