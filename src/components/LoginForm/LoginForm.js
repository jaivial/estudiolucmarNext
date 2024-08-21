import React, { use, useState, useEffect } from 'react';
import axios from 'axios';
import Toastify from 'toastify-js';
import 'toastify-js/src/toastify.css'; // Import Toastify CSS
import { useRouter } from 'next/router';
import Cookies from 'js-cookie';

const LoginForm = () => {
  const router = useRouter();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loginReloadKey, setLoginReloadKey] = useState(0);

  const login = async () => {
    try {
      const response = await axios.post('/api/login', {
        email,
        password
      });
      console.log('response', response.data);


      if (response.data.message === 'User not found') {
        showToast('Usuario no encontrado.', 'linear-gradient(to right, #ff416c, #ff4b2b)');
      }
      if (response.data.message === 'User active on another device') {
        showToast('Usuario activo en otro dispositivo.', 'linear-gradient(to right, #ff416c, #ff4b2b)');
      }
      if (response.data.message === 'User session set') {
        showToast('Sesión iniciada.', 'linear-gradient(to right, #00603c, #006f39, #007d31, #008b24, #069903)');
        // Get the sessionID from the response
        const sessionID = response.data.sessionID;
        const user_id = response.data.user_id;
        const admin = response.data.admin;

        // Set the cookie with an expiration time of 3 hours
        Cookies.set('sessionID', sessionID, { expires: 3 / 24, path: '/' }); // 3/24 = 3 hours
        Cookies.set('user_id', user_id, { expires: 3 / 24, path: '/' }); // 3/24 = 3 hours
        Cookies.set('admin', admin, { expires: 3 / 24, path: '/' }); // 3/24 = 3 hours
        router.push('/home');

      }
      if (response.data.message === 'Internal server error') {
        showToast('Error en el servidor. Inténtalo más tarde.', 'linear-gradient(to right, #ff416c, #ff4b2b)');
      }

    } catch (error) {
      console.error('Error during login:', error);
      showToast('Error en el servidor. Inténtalo más tarde.', 'linear-gradient(to right, #ff416c, #ff4b2b)');
    }
  };


  const handleLoginClick = (event) => {
    event.preventDefault();
    login();
  };

  const showToast = (message, backgroundColor) => {
    Toastify({
      text: message,
      duration: 2500,
      gravity: 'top',
      position: 'center',
      stopOnFocus: true,
      style: {
        borderRadius: '10px',
        backgroundImage: backgroundColor,
        textAlign: 'center',
      },
    }).showToast();
  };

  return (
    <div className="w-full flex-col items-center justify-center mt-4" id="login-form">
      <div className="w-full flex flex-col items-start justify-center gap-1 mt-6">
        <label htmlFor="email" className="font-sans text-lg text-slate-900">
          Email
        </label>
        <input
          className="w-full h-10 border-2 border-gray-400 rounded p-3 text-slate-900"
          type="email"
          name="email"
          id="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          required
        />
      </div>
      <div className="w-full flex flex-col items-start justify-center gap-1 mt-6">
        <label className="font-sans text-lg text-slate-900" htmlFor="password">
          Contraseña
        </label>
        <input
          className="w-full h-10 border-2 border-gray-400 rounded p-3 text-slate-900"
          type="password"
          name="password"
          id="password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          required
        />
      </div>
      <button className="w-full h-10 mt-8 bg-blue-400 hover:cursor-pointer hover:bg-blue-500" id="form-button" name="submit" onClick={handleLoginClick}>
        Iniciar sesión
      </button>
    </div>
  );
};

export default LoginForm;
