import GeneralLayout from "../components/layouts/GeneralLayout.js";
import { useState } from "react";
import TablaAllData from "../components/Buscador/TablaAllData.js";
import clientPromise from '../lib/mongodb.js'; // Import clientPromise

export const getServerSideProps = async () => {
    try {
        const client = await clientPromise;
        const db = client.db('inmoprocrm'); // Use the correct database name

        // Fetch inmuebles where tipoagrupacion = 2
        const edificios = await db.collection('inmuebles').aggregate([
            {
                $match: { tipoagrupacion: 2 },
            },
            {
                $project: {
                    _id: 0,
                    id: 1,
                    direccion: 1,
                },
            },
        ]).toArray();

        // Fetch id and direccion from nestedescaleras where tipoagrupacion = 3
        const escaleras = await db.collection('inmuebles').aggregate([
            {
                $unwind: "$nestedescaleras",
            },
            {
                $match: { "nestedescaleras.tipoagrupacion": 3 },
            },
            {
                $project: {
                    _id: 0,
                    id: "$nestedescaleras.id",
                    direccion: "$nestedescaleras.direccion",
                },
            },
        ]).toArray();

        // Return the data as props
        return {
            props: {
                parentsEdificioProps: {
                    edificios: edificios,
                    escaleras: escaleras,
                }, // Create an object with the desired properties
            },
        };
    } catch (error) {
        console.error('Error fetching parents:', error);
        return {
            props: {
                parentsEdificioProps: { edificios: [], escaleras: [] }, // Return empty arrays in case of error
            },
        };
    }
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
