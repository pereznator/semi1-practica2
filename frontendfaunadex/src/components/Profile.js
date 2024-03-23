import React, { useState, useEffect } from 'react';
import { NavLink,  useNavigate} from 'react-router-dom';
import { Navbar, Nav } from 'react-bootstrap';
import axios from 'axios';
import Swal from 'sweetalert2';
import '../App.css';
import logo from '../logoFaunadex.png';
import UserImg from '../UserImg.png';

function Profile() {
  const id_user = localStorage.getItem('id_user');
  const [username, setUsername] = useState('');
  const [fullName, setFullName] = useState('');
  const [image, setImage] = useState(UserImg);
  const [analisisfoto, setAnalisisfoto] = useState('');
  const history = useNavigate();

  useEffect(() => {
    fetch('/config.txt')
      .then(response => response.text())
      .then(data => {
        const lines = data.split('\n');
        const backendUrlLine = lines.find(line => line.startsWith('backendpy='));
        if (backendUrlLine) {
          const url = backendUrlLine.split('=')[1].trim();
          const getUserData = async () => {
            try {
              const response = await axios.get(`${url}/usuario/${id_user}`);
              console.log('Datos del usuario:', response.data);
              setUsername(response.data.nombre_usuario);
              setFullName(response.data.nombre_completo);
              setAnalisisfoto(response.data.analisis_foto);
              setImage(response.data.foto_url);
            } catch (error) {
              Swal.fire('Error', "No se pudo obtener la informacion del usuario", 'error');
            }
          };
          getUserData();
        }
      })
      .catch(error => console.error('Error al leer el archivo de configuración:', error));
  }, [id_user]); 
  
  const handleLogout = () => {
    localStorage.removeItem('id_user');
    history('/login');
  };

  const handleEditP = () => {
    history('/edit-profile');
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
      <div className="d-flex justify-content-center align-items-center" style={{ height: '100vh' }}>
      <div className="d-block" style={{ width: '800px', backgroundColor: 'rgba(255, 255, 255, 0.45)', padding: '30px', borderRadius: '20px' }}>
        <h2 className='text-center'>Datos Personales</h2>
        <div className="d-flex ">
          <div className="d-flex flex-column align-items-center " style={{ marginRight:'50px', width:'50%'}}>
            <img src={image} className="mb-2 rounded-circle" alt="foto de perfil" style={{ width: '200px', height: '200px', alignSelf: 'center' }} />
            <p className="text-center" style={{ maxWidth: '200px', wordWrap: 'break-word' }}>{analisisfoto}</p>
          </div>
          <div className="d-flex flex-column" style={{ width:'50%'}}>
      
              <label>Nombre de usuario</label>
              <input
                type="text"
                className="form-control mb-2"
                value={username}
                readOnly
              />
              <label>Nombre completo</label>
              <input
                type="text"
                className="form-control mb-2"
                value= {fullName}
                readOnly
              />
              
              <div className="mb-2 d-flex justify-content-center">
                <button onClick={handleEditP} className="btn btn-primary" style={{marginLeft:'10px'}}>Editar Perfil</button>
                <button onClick={handleLogout} className="btn btn-primary" style={{marginLeft:'10px'}}>Cerrar Sesión</button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
    
  );
}

export default Profile;
