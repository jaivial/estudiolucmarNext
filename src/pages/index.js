import { metadata } from "../components/layouts/IndexLayout.js";
import Layout from "../components/layouts/IndexLayout.js";
import { fetchUser } from "../lib/supabase/login/loginFunctions.js";
import Toastify from 'toastify-js';
import Image from "next/image";
import logoLucmar from "../../public/assets/img/logolucmar.jpg";
import "../app/globals.css";
import LoginForm from "../components/LoginForm/LoginForm.js";


export default function Home() {

  const handleLogin = async (email, password) => {
    const user = await fetchUser(email, password);
    console.log('user', user); // Debugging line
    if (user) {
      console.log('user', user); // Debugging line
      // window.location.href = '/home';
    } else {
      console.log('user', user); // Debugging line
      // window.location.href = '/login';
    }
  };



  return (
    <Layout title={metadata.title} description={metadata.description}>
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
