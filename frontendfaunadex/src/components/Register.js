import React, { useState, useEffect } from 'react';
import { Link, useNavigate} from 'react-router-dom';
import axios from 'axios';
import Swal from 'sweetalert2'
import { Alert } from 'react-bootstrap';
import 'bootstrap/dist/css/bootstrap.min.css';
import '../App.css';
import UserImg from '../UserImg.png';


const Register = () => {
  const [nombre_usuario, setnombre_usuario] = useState('');
  const [nombre_completo, setnombre_completo] = useState('');
  const [password, setPassword] = useState('');
  const [fileimg, setFileimg] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [image, setImage] = useState(UserImg); 
  const [passwordMismatch, setPasswordMismatch] = useState(false); 
  const [backendUrl, setBackendUrl] = useState('');
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

  const handleSubmit = async (event) => {
    event.preventDefault();
    if (password !== confirmPassword) {
      setPasswordMismatch(true);
      return;
    } else {
      setPasswordMismatch(false);
    }
    if (image === UserImg) {
      return;
    }
    console.log('Se presionó register');
    console.log('Usuario: ', nombre_usuario);
    console.log('Nombre completo: ', nombre_completo);
    console.log('Contraseña: ', password);


    try {
      const formData = new FormData();
      const data = {
        nombre_usuario: nombre_usuario,
        nombre_completo: nombre_completo,
        password: password
      };
      formData.append('foto', fileimg);
      formData.append('datos', JSON.stringify(data));

      const response = await axios.post(`${backendUrl}/registrar`, formData);
      
        setnombre_usuario('');
        setnombre_completo('');
        setPassword('');
        setConfirmPassword('');
        setImage(UserImg);
        setPasswordMismatch(false);
        console.log('¡Registro exitoso!', response.data);
        history('/login');
      
    } catch (error) {
      Swal.fire('Error', 'ocurrio un error al registrar usurio', 'error');
    }
  };

  const handleImageChange = (event) => {
    const selectedFile = event.target.files[0];
    setFileimg(selectedFile);
    setImage(URL.createObjectURL(selectedFile));
  };

  return (
    <div className="d-flex justify-content-center align-items-center" style={{ height: '100vh' }}>
      <div className="d-block" style={{ width: '800px', backgroundColor: 'rgba(255, 255, 255, 0.45)', padding: '30px', borderRadius: '20px' }}>
        <h2 className='text-center'>Registro</h2>
        <div className="d-flex ">
          <div className="d-flex flex-column align-items-center " style={{ marginRight:'50px', width:'50%'}}>
            <img src={image} className="mb-2 rounded-circle" alt="Previsualización" style={{ width: '200px', height: '200px', alignSelf: 'center' }} />
            <input
              type="file"
              name = "foto"
              className="form-control mb-2"
              accept=".jpg, .jpeg, .png"
              onChange={handleImageChange}
            />
            {image === UserImg && <Alert variant="danger">Por favor, selecciona una imagen</Alert>}
          </div>
          <div className="d-flex flex-column" style={{ width:'50%'}}>
            <form onSubmit={handleSubmit} className="w-100">
              <label>Nombre de usuario</label>
              <input
                type="text"
                className="form-control mb-2"
                value={nombre_usuario}
                onChange={(e) => setnombre_usuario(e.target.value)}
                required
              />
              <label>Nombre completo</label>
              <input
                type="text"
                className="form-control mb-2"
                value={nombre_completo}
                onChange={(e) => setnombre_completo(e.target.value)}
                required
              />
              <label>Contraseña</label>
              <input
                type="password"
                className="form-control mb-2"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
              />
              <label>Confirmación de contraseña</label>
              <input
                type="password"
                className="form-control mb-3"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
              />
              {passwordMismatch && <Alert variant="danger">Las contraseñas no coinciden</Alert>}
              <div className="mb-2 d-flex justify-content-center">
                
                <button type="submit" className="btn btn-primary">Registrarse</button>
                <Link to="/" className="btn btn-primary" style={{marginLeft:'10px'}}>Regresar</Link>
              </div>
            </form>
            <p className="mt-2 text-center">¿Ya tienes cuenta? <Link to="/login">Inicia sesión</Link></p>
          </div>
        </div>
      </div>
    </div>
  );
}

export default Register;