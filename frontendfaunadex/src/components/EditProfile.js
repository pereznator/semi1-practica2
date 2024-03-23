import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Modal, Button } from 'react-bootstrap';
import { NavLink , useNavigate} from 'react-router-dom';
import axios from 'axios';
import Swal from 'sweetalert2';
import { Navbar, Nav, } from 'react-bootstrap';
import 'bootstrap/dist/css/bootstrap.min.css';
import '../App.css';
import logo from '../logoFaunadex.png';
import UserImg from '../UserImg.png';
//h
const EditProfile= () => {
  const id_user = localStorage.getItem('id_user');  
  const [backendUrl, setBackendUrl] = useState('');
  const [username, setUsername] = useState('');
  const [fullName, setFullName] = useState('');
  const [password, setPassword] = useState('');
  const [image, setImage] = useState(UserImg); 
  const [showModal, setShowModal] = useState(false);
  const [fileimg, setFileimg] = useState(null);
  const navigate = useNavigate();

  useEffect(() => {
    fetch('/config.txt')
      .then(response => response.text())
      .then(data => {
        const lines = data.split('\n');
        const backendUrlLine = lines.find(line => line.startsWith('backendpy='));
        if (backendUrlLine) {
          const url = backendUrlLine.split('=')[1].trim();
          setBackendUrl(url);
  
          const getUserData = async () => {
            try {
              const response = await axios.get(`${url}/usuario/${id_user}`);
              console.log('Datos del usuario:', response.data);
              setUsername(response.data.nombre_usuario);
              setFullName(response.data.nombre_completo);
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

  const handleSubmit = (event) => {
    event.preventDefault();
    setShowModal(true);
  };

  const handleConfirm = async() => {
    setShowModal(false);
    console.log('Se presionó register');
    console.log('Usuario: ', username);
    console.log('Nombre completo: ', fullName);
    console.log('Contraseña: ', password);
    try {
      const formData = new FormData();
      const data = {
        nombre_usuario: username,
        nombre_completo: fullName,
        password: password
      };
      
      if (fileimg!==''){
        formData.append('foto', fileimg);
      }
      formData.append('datos', JSON.stringify(data));

      const response = await axios.put(`${backendUrl}/actualizar-usuario/${id_user}`, formData);
     
      console.log('¡actualizacion exitosa!', response.data);
      navigate('/profile');
      
    } catch (error) {
      Swal.fire('Error', "No se pudo actualizar la informacion del usuario", 'error');
    }
  };

  const handleImageChange = (event) => {
    const selectedFile = event.target.files[0];
    setFileimg(selectedFile);
    setImage(URL.createObjectURL(selectedFile));
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
        <h2 className='text-center'>Editor de Perfil</h2>
        <div className="d-flex ">
          <div className="d-flex flex-column align-items-center " style={{ marginRight:'50px', width:'50%'}}>
            <img src={image} className="mb-2 rounded-circle" alt="Previsualización" style={{ width: '200px', height: '200px', alignSelf: 'center' }} />
            <input
              type="file"
              className="form-control mb-2"
              accept=".jpg, .jpeg, .png"
              onChange={handleImageChange}

            />
          </div>
          <div className="d-flex flex-column" style={{ width:'50%'}}>
            <form onSubmit={handleSubmit} className="w-100">
              <label>Nombre de usuario</label>
              <input
                type="text"
                className="form-control mb-2"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                required
              />
              <label>Nombre completo</label>
              <input
                type="text"
                className="form-control mb-2"
                value={fullName}
                onChange={(e) => setFullName(e.target.value)}
                required
              />
              <div className="mb-2 d-flex justify-content-center">
                <button type="submit" className="btn btn-primary">Editar</button>
                <Link to="/profile" className="btn btn-primary" style={{marginLeft:'10px'}}>Regresar</Link>
              </div>
            </form>
            </div>
        </div>
      </div>
    </div>
    <Modal show={showModal} onHide={() => setShowModal(false)} centered>
      <Modal.Header closeButton className='bg-dark text-white' >
        <Modal.Title style={{  fontSize: 'medium' }}>Ingrese contraseña para confirmar cambios</Modal.Title>
      </Modal.Header>
      <Modal.Body >
        <input
          type="password"
          className="form-control"
          placeholder="Contraseña"
          onChange={(e) => setPassword(e.target.value)}
        />
      </Modal.Body>
      <Modal.Footer >
        <Button variant="secondary" onClick={() => setShowModal(false)}>
          Cerrar
        </Button>
        <Button variant="primary" onClick={handleConfirm}>
          Confirmar
        </Button>
      </Modal.Footer>
    </Modal>
    </div>
  );
}

export default EditProfile;

