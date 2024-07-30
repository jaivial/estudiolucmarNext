import { metadata } from "../components/layouts/IndexLayout.js";
import GeneralLayout from "../components/layouts/GeneralLayout.js";
import Image from "next/image";
import logoLucmar from "../../public/assets/icons/icon-256.webp";
import "../app/globals.css";
import LoginForm from "../components/LoginForm/LoginForm.js";
import { useRouter } from 'next/navigation'
import { useEffect } from "react";
import 'toastify-js/src/toastify.css'; // Import Toastify CSS
import Toastify from 'toastify-js';
import { checkLogin } from "../lib/supabase/login/checkLogin.js";


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

    try {
        user = await checkLogin(req); // Pass the request object to checkActiveUser
        console.log('here'); // Debugging line
        if (!user || user.length === 0) {
            return {
                redirect: {
                    destination: '/',
                    permanent: false,
                },
            };
        }
    } catch (error) {
        console.error('Error during server-side data fetching:', error.message);
    }

    return {
        props: {
            user,
        },
    };
}



export default function Home({ user }) {

    useEffect(() => {
        const toastMessage = localStorage.getItem('toastMessage');
        if (toastMessage) {
            const { message, style } = JSON.parse(toastMessage);
            // Display the toast message
            showToast(message, style);
            // Remove the message from localStorage
            localStorage.removeItem('toastMessage');
        }
    }, []);

    return (
        <GeneralLayout title={metadata.title} description={metadata.description} user={user}>
            <div style={{ paddingTop: 'var(--safe-area-inset-top)' }}>
                <p>hola</p>
                <p>hola</p>
                <p>hola</p>
                <p>hola</p>
                <p>hola</p>
                <p>hola</p>
            </div>
        </GeneralLayout>
    );
}