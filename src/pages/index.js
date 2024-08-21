import Layout from "../components/layouts/IndexLayout.js";
import Image from "next/image";
import logoLucmar from "../../public/assets/icons/icon-256.webp";
import "../app/globals.css";
import LoginForm from "../components/LoginForm/LoginForm.js";
import { useEffect, useState } from "react";
import 'toastify-js/src/toastify.css'; // Import Toastify CSS
import Toastify from 'toastify-js';
import Cookies from 'js-cookie';
import LoadingScreen from "../components/LoadingScreen/LoadingScreen.js";
import { useRouter } from 'next/router';
import { checkLogin } from "../lib/mongodb/login/checkLogin.js";

export default function Index() {
  const [loading, setLoading] = useState(true);
  const router = useRouter();

  useEffect(() => {
    const timeout = setTimeout(() => {
      setLoading(false);
    }, 300);

    return () => clearTimeout(timeout);
  }, []);

  return (
    <Layout title="Lucmar Cloud" description="Panel de administración">
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

export async function getServerSideProps(context) {
  const { req, res } = context;

  // Assuming checkLogin returns a boolean indicating login status
  const isLoggedIn = await checkLogin(req, res);

  if (isLoggedIn) {
    // Redirect to /home if the user is logged in
    return {
      redirect: {
        destination: '/home',
        permanent: false,
      },
    };
  }

  // If not logged in, do nothing and return the default props
  return {
    props: {}, // No props required for this page
  };
}
