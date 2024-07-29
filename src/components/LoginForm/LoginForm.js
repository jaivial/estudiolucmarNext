import React, { useState } from 'react';
import Toastify from 'toastify-js';
import { supabase } from '../../lib/supabase/supabaseClient.js';
import 'toastify-js/src/toastify.css'; // Import Toastify CSS



const LoginForm = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [notificationVisible, setNotificationVisible] = useState(false);

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

  const login = async () => {
    try {
        const { data, error } = await supabase
        .from('users')
        .select('*')
        .eq('email', email)
        .eq('password', password);

        
      if (data.length === 0) {
        showToast('El usuario no existe', 'linear-gradient(to right bottom, #c62828, #b92125, #ac1a22, #a0131f, #930b1c)');
    } else if (data.length > 0) {
        showToast('Usuario Existente', 'linear-gradient(to right bottom, #00603c, #006f39, #007d31, #008b24, #069903)');
      }

        console.log('data', data); // Debugging line
      
      if (error) {
        throw new Error(error.message);
      }
    } catch (error) {
      console.error('Error:', error);
    }
  };

  const handleLoginClick = (event) => {
    login();
    console.log('handleLoginClick'); // Debugging line
  };

  const handleNotificationClose = () => {
    setNotificationVisible(false);
  };

  return (
    <div className="w-full flex-col items-center justify-center mt-4" id="login-form">
      <div id="notification" className={`relative ${notificationVisible ? 'flex' : 'hidden'}`}>
        <div className="flex flex-row items-center justify-center gap-2 p-1 pl-6 bg-red-500 text-white rounded-lg w-full">
          <svg xmlns="http://www.w3.org/2000/svg" width="1.8em" height="1.8em" viewBox="0 0 24 24" className="text-xl">
            <path
              fill="currentColor"
              d="M20 12a8 8 0 0 0-8-8a8 8 0 0 0-8 8a8 8 0 0 0 8 8a8 8 0 0 0 8-8m2 0a10 10 0 0 1-10 10A10 10 0 0 1 2 12A10 10 0 0 1 12 2a10 10 0 0 1 10 10m-6.5-4c.8 0 1.5.7 1.5 1.5s-.7 1.5-1.5 1.5s-1.5-.7-1.5-1.5s.7-1.5 1.5-1.5M10 9.5c0 .8-.7 1.5-1.5 1.5S7 10.3 7 9.5S7.7 8 8.5 8s1.5.7 1.5 1.5m2 4.5c1.75 0 3.29.72 4.19 1.81l-1.42 1.42C14.32 16.5 13.25 16 12 16s-2.32.5-2.77 1.23l-1.42-1.42C8.71 14.72 10.25 14 12 14"
            ></path>
          </svg>
          <p className="w-full font-sans text-xs py-3">
            Usuario y/o contraseña incorrectos. <br />
            Inténtalo de nuevo.
          </p>
          <svg id="cerrarNotification" xmlns="http://www.w3.org/2000/svg" className="icon cross absolute top-2 right-1 hover:cursor-pointer" width="1.5em" height="1.5em" viewBox="0 0 20 20" onClick={handleNotificationClose}>
            <path
              fill="currentColor"
              d="M14.348 14.849a1.2 1.2 0 0 1-1.697 0L10 11.819l-2.651 3.029a1.2 1.2 0 1 1-1.697-1.697l2.758-3.15l-2.759-3.152a1.2 1.2 0 1 1 1.697-1.697L10 8.183l2.651-3.031a1.2 1.2 0 1 1 1.697 1.697l-2.758 3.152l2.758 3.15a1.2 1.2 0 0 1 0 1.698"
            ></path>
          </svg>
        </div>
      </div>
      <div className="w-full flex flex-col items-start justify-center gap-1 mt-6">
        <label htmlFor="email" className="font-sans text-lg text-slate-900">
          Email
        </label>
        <input className="w-full h-10 border-2 border-gray-400 rounded p-3 text-slate-900" type="email" name="email" id="email" value={email} onChange={(e) => setEmail(e.target.value)} required />
      </div>
      <div className="w-full flex flex-col items-start justify-center gap-1 mt-6">
        <label className="font-sans text-lg text-slate-900" htmlFor="password">
          Contraseña
        </label>
        <input className="w-full h-10 border-2 border-gray-400 rounded p-3 text-slate-900" type="password" name="password" id="password" value={password} onChange={(e) => setPassword(e.target.value)} required />
      </div>
      <button className="w-full h-10 mt-8 bg-blue-400 hover:cursor-pointer hover:bg-blue-500" id="form-button" name="submit" onClick={handleLoginClick}>
        Iniciar sesión
      </button>
    </div>
  );
};

export default LoginForm;
