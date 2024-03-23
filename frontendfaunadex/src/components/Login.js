import React, { useState, useEffect, useRef } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import axios from 'axios';
import Swal from 'sweetalert2';
import 'bootstrap/dist/css/bootstrap.min.css';
import '../App.css';
import logo from '../logoFaunadex.png';

function Login() {
  const [nombre_usuario, setnombre_usuario] = useState('');
  const [password, setPassword] = useState('');
  const [backendUrl, setBackendUrl] = useState('');
  const [showModal, setShowModal] = useState(false);
  const history = useNavigate();
  const [stream, setStream] = useState(null);
  const videoRef = useRef(null);

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

  useEffect(() => {
    if (stream && videoRef.current) {
      videoRef.current.srcObject = stream;
    }
  }, [stream]);

  const startCamera = async () => {
    try {
      const mediaStream = await navigator.mediaDevices.getUserMedia({ video: true });
      setStream(mediaStream);
    } catch (error) {
      console.error('Error al acceder a la cámara:', error);
    }
  };

  const stopCamera = () => {
    if (stream) {
      stream.getTracks().forEach(track => track.stop());
      setStream(null);
    }
  };
  

  const handleSubmit = async (event) => {
    event.preventDefault();
    console.log('Se presionó login');
    console.log('Usuario: ', nombre_usuario, '   Contraseña: ', password);
    const data = {
      nombre_usuario: nombre_usuario,
      password: password
    };
    try {
      const response = await axios.post(`${backendUrl}/iniciar`, data);
      console.log('Usuario logueado: ', response.data.usuario_id);
      localStorage.setItem('id_user', response.data.usuario_id);
      setnombre_usuario('');
      setPassword('');
      history('/profile');

    } catch (error) {
      Swal.fire('Error', "No se pudo iniciar sesión, verifique sus datos", 'error');
    }
  };

  const handleCameraLogin = () => {
    setShowModal(true);
    startCamera();
  };

  const handleCloseModal = () => {
    setShowModal(false);
    stopCamera();
  };

  const captureImage = () => {
    return new Promise((resolve, reject) => {
      const videoElement = videoRef.current;
      const canvas = document.createElement('canvas');
      canvas.width = videoElement.videoWidth;
      canvas.height = videoElement.videoHeight;
      const ctx = canvas.getContext('2d');
      ctx.drawImage(videoElement, 0, 0, canvas.width, canvas.height);
  
      canvas.toBlob(blob => {
        resolve(blob);
      }, 'image/png'); 
    });
  };

  const handleTakePhoto = async () => {
    try {
      const data = new FormData();
      const imageBlob = await captureImage(); 
      data.append('nombre_usuario', nombre_usuario);
      data.append('password', password);
      data.append('photo', imageBlob, 'photo.png');
      const response = await axios.post(`${backendUrl}/logincamara`, data);
      console.log('Usuario logueado:', response.data.usuario_id);
      localStorage.setItem('id_user', response.data.usuario_id);
      setnombre_usuario('');
      setPassword('');
      setShowModal(false); 
      history('/profile');
    } catch (error) {
      console.error('Error al iniciar sesión por cámara:', error);
      setShowModal(false); 
      Swal.fire('Error', 'No se pudo iniciar sesión por cámara, inténtalo de nuevo', 'error');
    }
  };

  return (
    <div className="d-flex justify-content-center align-items-center" style={{ height: '100vh' }}>
      <div style={{ width: '400px', backgroundColor: 'rgba(255, 255, 255, 0.5)', padding: '30px', borderRadius: '20px' }}>
        <div className='d-flex justify-content-center align-items-center'>
          <img src={logo} alt="Logo" className="mb-4 " style={{ width: '100px', height: '100px' }} />
        </div>
        <h2 className='text-center'>Login</h2>
        <form onSubmit={handleSubmit} >
          <div >
            <label>Usuario</label>
            <input
              type="text"
              className="form-control mb-2"
              value={nombre_usuario}
              onChange={(e) => setnombre_usuario(e.target.value)}
              required
            />
            <label>Contraseña</label>
            <input
              type="password"
              className="form-control mb-3"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
            />
            <div className='d-flex justify-content-center align-items-center'>
              <button type="submit" className="btn btn-primary mb-2">Login</button>
              <button type="button" className="btn btn-primary mb-2" style={{ marginLeft: '10px' }} onClick={handleCameraLogin}>Login por camara</button>
              <Link to="/">
                <button type="button" className="btn btn-primary mb-2" style={{ marginLeft: '10px' }}>Regresar</button>
              </Link>

            </div>
          </div>
        </form>
        <p className='text-center'>No tienes cuenta? <Link to="/register">Regístrate</Link></p>

      </div>
      {showModal &&
        <div className="modal" tabIndex="-1" role="dialog" style={{ display: 'block', backgroundColor: 'rgba(0, 0, 0, 0.5)' }}>
          <div className="modal-dialog modal-dialog-centered" role="document">
            <div className="modal-content" style={{ backgroundColor: '#444' }}>
              <div className="modal-body justify-content-center align-items-center">
                <video ref={videoRef} autoPlay style={{ width: '400px', height: '400px' }} />
              </div>
              <div className="modal-footer">
                <button type="button" className="btn btn-secondary" onClick={handleCloseModal}>Cerrar</button>
                <button type="button" className="btn btn-primary" onClick={handleTakePhoto}>Tomar Foto E Iniciar</button>
              </div>
            </div>
          </div>
        </div>
      }
    </div>
  );
}

export default Login;
