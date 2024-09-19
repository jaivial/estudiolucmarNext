import GeneralLayout from "../components/layouts/GeneralLayout";
import { useState, useEffect } from "react";
import TablaAllData from "../components/Buscador/TablaAllData";
import SmallLoadingScreen from '../components/LoadingScreen/SmallLoadingScreen'; // Corrected component import name
import Cookies from 'js-cookie'; // Import js-cookie
import axios from 'axios'; // Import axios

export default function Buscador() {
    const [loading, setLoading] = useState(true);
    const [data, setData] = useState({
        edificios: [],
        escaleras: []
    });
    const [admin, setAdmin] = useState(null); // State for admin cookie value
    const [searchTerm, setSearchTerm] = useState('');
    const [screenWidth, setScreenWidth] = useState(window.innerWidth);
    useEffect(() => {
        // Function to update state to current window inner width
        const handleResize = () => setScreenWidth(window.innerWidth);

        // Set up event listener for window resize to update screenWidth state
        window.addEventListener('resize', handleResize);

        // Clean up event listener when component unmounts to prevent memory leaks
        return () => window.removeEventListener('resize', handleResize);
    }, []); // Empty dependency array means this effect runs once on mount and cleanup on unmount

    useEffect(() => {
        const fetchData = async () => {
            try {
                // Fetch the admin cookie
                const adminCookie = Cookies.get('admin');
                setAdmin(adminCookie);

                // Fetch the rest of the data using axios
                const response = await axios.get('/api/fetchInmueblesData');
                setData(response.data);
            } catch (error) {
                console.error('Error fetching data:', error);
            } finally {
                setLoading(false); // Ensure loading is set to false regardless of success or failure
            }
        };

        fetchData();
    }, []);

    return (
        <GeneralLayout title="Buscador" description="Buscador">
            {loading ? (
                <SmallLoadingScreen />
            ) : (
                <TablaAllData parentsEdificioProps={data} admin={admin} screenWidth={screenWidth} />
            )}
        </GeneralLayout>
    );
}
