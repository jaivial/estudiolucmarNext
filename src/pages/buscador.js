import GeneralLayout from "../components/layouts/GeneralLayout.js";
import { useState } from "react";
import TablaAllData from "../components/Buscador/TablaAllData.js";
import { supabase } from "../lib/supabase/supabaseClient.js";


export const getServerSideProps = async () => {
    // Fetch data from Supabase
    const { data, error } = await supabase.rpc('fetch_parents');

    if (error) {
        console.error('Error fetching parents:', error);
        return {
            props: {
                parentsEdificioProps: { edificios: [], escaleras: [] }, // Return empty arrays in case of error
            },
        };
    }

    // Return the data as props
    return {
        props: {
            parentsEdificioProps: data || { edificios: [], escaleras: [] }, // Ensure data is an object
        },
    };
};



export default function Buscador({ parentsEdificioProps }) {
    const [loading, setLoading] = useState(true);
    const [data, setData] = useState([]);
    const [currentPage, setCurrentPage] = useState(1);
    const [totalPages, setTotalPages] = useState(1);
    const [itemsPerPage] = useState(10);
    const [searchTerm, setSearchTerm] = useState('');

    return (
        <GeneralLayout title="Buscador" description="Buscador">
            <TablaAllData parentsEdificioProps={parentsEdificioProps} />

        </GeneralLayout>
    );
}