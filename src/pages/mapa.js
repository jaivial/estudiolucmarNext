import dynamic from 'next/dynamic';
const MapComponent = dynamic(() => import('../components/Mapa/MapCompnent'), { ssr: false });
import LayoutMenu from '../components/layouts/GeneralLayout';
import { useEffect } from 'react';


export default function MapPage() {
    return (
        <LayoutMenu title="Mapa">
            <div>
                <MapComponent />
            </div>
        </LayoutMenu>
    );
}
