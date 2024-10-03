import dynamic from 'next/dynamic';
const MapComponent = dynamic(() => import('../components/Mapa/MapCompnent'), { ssr: false });
import LayoutMenu from '../components/layouts/GeneralLayout';
import { useEffect } from 'react';



export async function getServerSideProps(context) {
    const cookies = context.req.cookies; // Corrected to access cookies from the request
    const admin = cookies.admin || null;

    return {
        props: { admin }
    };
}


export default function MapPage({ admin }) {
    return (
        <LayoutMenu title="Mapa">
            <MapComponent admin={admin} />
        </LayoutMenu>
    );
}
