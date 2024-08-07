import GeneralLayout from "../components/layouts/GeneralLayout.js";
import { useState } from "react";
import TablaAllData from "../components/Buscador/TablaAllData.js";




export default function Buscador() {
    const [loading, setLoading] = useState(true);
    const [data, setData] = useState([]);
    const [currentPage, setCurrentPage] = useState(1);
    const [totalPages, setTotalPages] = useState(1);
    const [itemsPerPage] = useState(10);
    const [searchTerm, setSearchTerm] = useState('');

    return (
        <GeneralLayout title="Buscador" description="Buscador">
            <TablaAllData />

        </GeneralLayout>
    );
}