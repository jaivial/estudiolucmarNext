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
                <TablaAllData parentsEdificioProps={data} admin={admin} />
            )}
        </GeneralLayout>
    );
}
