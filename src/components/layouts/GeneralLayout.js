import React, { useEffect, useState } from "react";
import Head from "next/head";
import LoadingScreen from "../LoadingScreen/LoadingScreen.js";
import MobileMenuBar from "../MenuBars/MobileMenuBar.js";
import SideMenu from "../MenuBars/SideMenu.js"; // Import SideMenu
import "../../app/globals.css";

export const metadata = {
    title: "Lucmar Cloud",
    description:
        "Lucmar Cloud es el CRM de las inmobilirias que quieren hacer sus negocios más eficientes, comprar y vender inmuebles, y gestionar sus clientes.",
};

const Layout = ({ children, title, description, user, userData }) => {
    const [loading, setLoading] = useState(true);
    const [windowWidth, setWindowWidth] = useState(0);

    useEffect(() => {
        const timeout = setTimeout(() => {
            setLoading(false);
        }, 800); // Adjust the loading time if needed

        // Cleanup the timeout if the component unmounts
        return () => clearTimeout(timeout);
    }, []);


    useEffect(() => {
        // Set the window width when the component mounts
        setWindowWidth(window.innerWidth);

        // Function to handle window resize
        const handleResize = () => {
            setWindowWidth(window.innerWidth);
        };

        // Add event listener to update window width on resize
        window.addEventListener('resize', handleResize);

        // Cleanup event listener on component unmount
        return () => {
            window.removeEventListener('resize', handleResize);
        };
    }, []);


    useEffect(() => {
        console.log('windowWidth', windowWidth);
    }, [windowWidth]);

    return (
        <>
            {loading && <LoadingScreen />}
            <Head>
                <meta charSet="UTF-8" />
                <meta name="description" content={description} />
                <meta
                    name="viewport"
                    content="width=device-width, initial-scale=1, maximum-scale=1, viewport-fit=cover"
                />
                <link rel="icon" href="/favicon.svg" />
                <title>{title}</title>
            </Head>

            {/* Conditional Rendering of Menu */}
            <div className="flex h-full">
                {windowWidth < 990 ? <MobileMenuBar /> : <SideMenu userData={userData} />}
                <div className="w-full h-dvh overflow-x-hidden">{children}</div>
            </div>
        </>
    );
};

export default Layout;
