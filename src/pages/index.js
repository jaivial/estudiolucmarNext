import { metadata } from "../components/layouts/IndexLayout.js";
import Layout from "../components/layouts/IndexLayout.js";
import Image from "next/image";
import logoLucmar from "../../public/assets/icons/icon-256.webp";
import "../app/globals.css";
import LoginForm from "../components/LoginForm/LoginForm.js";
import { checkLogin } from "../lib/supabase/login/checkLogin.js";
import { redirect, useRouter } from 'next/navigation'
import { useEffect, useState } from "react";
import 'toastify-js/src/toastify.css'; // Import Toastify CSS
import Toastify from 'toastify-js';
import Cookies from 'js-cookie';
import LoadingScreen from "../components/LoadingScreen/LoadingScreen.js";

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


export async function getServerSideProps(context) {
  const { req } = context;
  let user = null;
  let shouldRedirect = false;
  try {
    user = await checkLogin(req); // Pass the request object to checkActiveUser
    console.log('user', user); // Debugging line
    if (user && user.length > 0) {
      shouldRedirect = true;
    }
  } catch (error) {
    console.error('Error during server-side data fetching:', error.message);
  }

  return {
    props: {
      user,
      shouldRedirect,
    },
  };
}

export default function Index({ user, shouldRedirect }) {
  const router = useRouter();
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const toastMessage = localStorage.getItem('toastMessage');
    if (toastMessage) {
      const { message, style } = JSON.parse(toastMessage);
      // Display the toast message
      showToast(message, style);
      // Remove the message from localStorage
      localStorage.removeItem('toastMessage');
    }
    setLoading(false);
  }, []);

  useEffect(() => {
    if (shouldRedirect) {
      localStorage.setItem('toastMessage', JSON.stringify({
        message: 'Sesión iniciada',
        style: 'linear-gradient(to right bottom, #00603c, #006f39, #007d31, #008b24, #069903)'
      }));
      router.push('/home'); // Navigate to the home page
    }
  }, [shouldRedirect]);

  return (
    <Layout title={metadata.title} description={metadata.description}>
      {loading && <LoadingScreen />}
      <div style={{ paddingTop: 'var(--safe-area-inset-top)' }}>
        <main>
          <section className="h-screen overflow-y-hidden w-full bg-slate-50 flex flex-row justify-center items-start pt-20">
            <div className="flex flex-col items-center justify-start h-full w-96 px-8">
              <div className="w-full px-5 flex flex-row items-center justify-evenly gap-0 mb-10">
                <div className="h-auto w-[70px]">
                  <Image className="w-full rounded-xl" src={logoLucmar} alt="Logo Lucmar" />
                </div>
                <div className="flex flex-col items-start justify-center w-fit h-full">
                  <span className="font-bold font-sans text-xl tracking-wide text-slate-800">Lucmar Cloud</span>
                  <span className="font-sans font-extralight text-base text-slate-800">Panel de administración</span>
                </div>
              </div>

              <div className="w-full">
                <h1 className="font-sans font-bold text-4xl tracking-wide text-slate-800 text-center">Iniciar sesión</h1>
                <LoginForm />
                <div className="login__footer text-neutral-700"></div>
              </div>
              <div className="login__background h-screen"></div>
            </div>
          </section>
        </main>
      </div>
    </Layout>
  );
}
