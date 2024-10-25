import GeneralLayout from "../components/layouts/GeneralLayout.js";
import { useState, useEffect } from "react";
import TablaAllData from "../components/Buscador/TablaAllData.js";
import SmallLoadingScreen from '../components/LoadingScreen/SmallLoadingScreen.js'; // Corrected component import name
import { checkLogin } from "../lib/mongodb/login/checkLogin.js";
import { useRouter } from 'next/router';

export async function getServerSideProps(context) {
    const { req, resolvedUrl } = context; // Extract resolvedUrl for the current path
    let user = null;

    try {
        user = await checkLogin(req);
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

    const cookies = context.req.cookies;
    const admin = cookies.admin || null;
    const user_id = cookies.user_id;

    let userData = null;
    if (user_id) {
        try {
            const response = await fetch(`http://localhost:3000/api/fetchuserinformation`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ user_id })
            });

            if (response.status === 200) {
                userData = await response.json();
            } else {
                console.error('Error fetching user data:', response.statusText);
            }
        } catch (error) {
            console.error('Error fetching user data:', error);
        }
    }

    // Fetch data on the server side
    let data = {
        edificios: [],
        escaleras: []
    };
    try {
        const response = await fetch('http://localhost:3000/api/fetchInmueblesData');
        if (!response.ok) {
            throw new Error('Network response was not ok');
        }
        data = await response.json();
    } catch (error) {
        console.error('Error fetching data:', error);
    }

    return {
        props: { admin, data, userData, currentPath: resolvedUrl } // Add currentPath to props
    };
}


export default function Buscador({ admin, data, userData, currentPath }) {
    const [loading, setLoading] = useState(false);
    const router = useRouter();
    const [screenWidth, setScreenWidth] = useState(0);
    const zoneName = userData?.zone_name;


    useEffect(() => { // Empty dependency array means this effect runs once on mount and cleanup on unmount
        console.log('userData', currentPath);
    }, []);



    useEffect(() => {
        if (typeof window !== 'undefined') {
            // Function to update state to current window inner width
            const handleResize = () => setScreenWidth(window.innerWidth);

            // Set initial screen width
            setScreenWidth(window.innerWidth);

            // Set up event listener for window resize to update screenWidth state
            window.addEventListener('resize', handleResize);

            // Clean up event listener when component unmounts to prevent memory leaks
            return () => window.removeEventListener('resize', handleResize);
        }
    }, []); // Empty dependency array means this effect runs once on mount and cleanup on unmount


    useEffect(() => {
        if (data) {
            setLoading(false);
        }
    }, [data]);




    return (
        <GeneralLayout title="Buscador" description="Buscador" userData={userData}>
            <div className="h-full">

                <TablaAllData currentPath={currentPath} zoneName={zoneName} parentsEdificioProps={data} admin={admin} screenWidth={screenWidth} loadingLoader={loading} />

            </div>
        </GeneralLayout>
    );
}
