import React, { useEffect, useState } from "react";
import Head from "next/head";
import LoadingScreen from "../LoadingScreen/LoadingScreen.js";
import "../../app/globals.css";
import MobileMenuBar from "../MenuBars/MobileMenuBar.js";

export const metadata = {
    title: "Lucmar Cloud",
    description: "Lucmar Cloud es el CRM de las inmobilirias que quieren hacer sus negocios más eficientes, comprar y vender inmuebles, y gestionar sus clientes.",
};


const Layout = ({ children, title, description }) => {
    const [loading, setLoading] = useState(true);

    const handleShowLoadingScreen = () => {
        setLoading(true);
    };

    const handleHideLoadingScreen = () => {
        console.log("Hiding loading screen");
        setLoading(false);
    };

    useEffect(() => {
        handleHideLoadingScreen();
    }, []); // Empty dependency array means this useEffect runs once when the component mounts

    return (
        <>
            {loading && <LoadingScreen />}
            <Head>
                <meta charSet="UTF-8" />
                <meta name="description" content={description} />
                <meta name="viewport" content="width=device-width, initial-scale=1, maximum-scale=1, viewport-fit=cover" />
                <link rel="icon" href="/favicon.svg" />
                <title>{title}</title>
            </Head>

            <div className="w-full overflow-x-hidden">{children}</div>
            <MobileMenuBar />
        </>
    );
};

export default Layout;
