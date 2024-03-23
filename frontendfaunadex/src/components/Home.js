import React from 'react';
import { Link } from 'react-router-dom';
import 'bootstrap/dist/css/bootstrap.min.css';
import '../App.css';
import logo from '../logoFaunadex.png'; 

const Home = () => {
  return (
    <div className="d-flex flex-column align-items-center justify-content-center" style={{ height: '100vh' }}>
      <img src={logo} alt="Logo" className="mb-4" style={{width: '250px', height: '250px'}} /> 
      <h2 className="text-center">¡Bienvenido a Faunadex!</h2>
      <p className="text-center mb-4">Esta es la página principal de Faunadex. ¡Inicia sesión para ver tus álbumes!</p>
      <Link to="/login" className="btn btn-primary">Ir al login</Link>
    </div>
  );
}

export default Home;