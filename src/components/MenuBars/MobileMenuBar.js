import React, { useEffect, useState } from 'react';
import { useRouter } from 'next/router';
import Link from 'next/link';
import { FaHome, FaSearch, FaMapMarkedAlt, FaTasks, FaNewspaper, FaCog, FaEllipsisV, FaSignOutAlt } from 'react-icons/fa';
import { Icon } from '@iconify/react';
import Cookies from 'js-cookie';
import axios from 'axios';
import Toastify from 'toastify-js';

const MobileMenuBar = () => {
    const router = useRouter();
    const [isDesplegarMoreMenu, setIsDesplegarMoreMenu] = useState(false);
    const [currentPage, setCurrentPage] = useState('');

    const showToast = (message, backgroundColor) => {
        Toastify({
            text: message,
            duration: 2500,
            gravity: 'top',
            position: 'center',
            stopOnFocus: true,
            style: {
                borderRadius: '10px',
                backgroundImage: backgroundColor,
                textAlign: 'center',
            },
        }).showToast();
    };

    useEffect(() => {
        const currentURL = window.location.href;
        if (currentURL.includes('buscador')) {
            setCurrentPage('Buscador');
        } else if (currentURL.includes('home')) {
            setCurrentPage('Home');
        } else if (currentURL.includes('settings')) {
            setCurrentPage('Settings');
        } else if (currentURL.includes('encargos')) {
            setCurrentPage('Encargos');
        } else if (currentURL.includes('noticias')) {
            setCurrentPage('Noticias');
        } else if (currentURL.includes('mapa')) {
            setCurrentPage('Mapa');
        } else if (currentURL.includes('mizona')) {
            setCurrentPage('Mizona');
        }
    }, []);

    const handleLogout = async () => {
        const userId = Cookies.get('user_id');
        const sessionId = Cookies.get('sessionID');
        if (!userId || !sessionId) {
            console.error('Logout failed: Missing user_id or sessionID');
            return;
        }

        try {
            const response = await axios.post('/api/logout', { user_id: userId, session_id: sessionId });
            if (response.data.status === 'success') {
                Cookies.remove('user_id');
                Cookies.remove('admin');
                Cookies.remove('sessionID');
                showToast('Sesión cerrada', 'linear-gradient(to right bottom, #c62828, #b92125, #ac1a22, #a0131f, #930b1c)');
                router.push('/');
            } else {
                console.error('Logout failed:', response.data.message);
            }
        } catch (error) {
            console.error('Logout error:', error);
        }
    };

    const toggleDesplegarMoreMenu = () => {
        setIsDesplegarMoreMenu(!isDesplegarMoreMenu);
    };

    const isActive = (page) =>
        currentPage === page
            ? 'h-[55px] bg-blue-400 p-2 text-white'
            : 'h-[45px] bg-white p-2 text-black';

    return (
        <div id="completesidenavbar" className="relative z-[9999] bg-slate-50">
            <nav className="h-10 w-full flex flex-row justify-between border-t border-slate-300 shadow-2xl fixed bottom-0 left-0 z-[9999] overflow-visible bg-slate-50">
                <ul className="w-full h-full flex flex-row justify-around items-end transition-all pb-3.5 overflow-y-visible shadow-xl">
                    <Link href="/home" className={`${isActive('Home')} px-3.5 rounded-3xl shadow-lg flex items-center justify-center`}>
                        <FaHome size="1.8em" />
                    </Link>
                    <Link href="/mizona" className={`${isActive('Mizona')} px-4 rounded-3xl shadow-lg flex items-center justify-center`}>
                        <Icon icon="mdi:map-marker-radius" className='text-3xl' />
                    </Link>
                    <Link href="/mapa" className={`${isActive('Mapa')} px-4 rounded-3xl shadow-lg flex items-center justify-center`}>
                        <Icon icon="gis:poi-map" className='text-3xl' />
                    </Link>
                    <div
                        id="mobile-itemMoreMenuIcon"
                        className={`relative ${isDesplegarMoreMenu ? 'bg-blue-400 text-white h-auto px-1 pb-2.5' : 'h-[45px] bg-white px-1'} rounded-3xl shadow-lg flex flex-col-reverse items-center justify-center gap-1 hover:cursor-pointer hover:bg-blue-400 hover:text-white`}
                        onClick={toggleDesplegarMoreMenu}
                    >
                        <FaEllipsisV size="1.9em" />

                        {/* Accordion Menu */}
                        <div
                            id="moreMobileMenu"
                            className={`transition-all duration-300 ease-in-out overflow-hidden w-full flex flex-col items-center justify-center ${isDesplegarMoreMenu ? 'max-h-[800px] pt-2 pb-8' : 'max-h-0'
                                }`}
                        >
                            <ul className="w-full flex flex-col justify-around items-center gap-8">
                                <Link href="/encargos" className={`${isActive('Encargos')} w-full flex justify-center px-3.5 py-2 rounded-3xl shadow-lg`}>
                                    <Icon icon="fluent:real-estate-24-filled" className='text-3xl' />
                                </Link>
                                <Link href="/noticias" className={`${isActive('Noticias')} w-full flex justify-center px-3.5 py-2 rounded-3xl shadow-lg`}>
                                    <Icon icon="material-symbols:work-alert" className='text-3xl' />
                                </Link>
                                <Link href="/settings" className={`${isActive('Settings')} w-full flex justify-center px-3.5 py-2 rounded-3xl shadow-lg`}>
                                    <FaCog size="1.8em" />
                                </Link>
                                <Link href="/clientes" className={`${isActive('Clientes')} w-full flex justify-center px-3.5 py-2 rounded-3xl shadow-lg`}>
                                    <Icon icon="bi:people-fill" className='text-3xl' />
                                </Link>
                                {/* New link to /mizona */}
                                <Link href="/buscador" className={`${isActive('Buscador')} w-full flex justify-center px-3.5 py-2 rounded-3xl shadow-lg`}>
                                    {/* Example icon */}
                                    <FaSearch size="1.8em" />
                                </Link>
                                <div
                                    id="mobile-itemLogOut"
                                    className="w-full flex justify-center py-2 bg-white text-black rounded-3xl shadow-lg hover:cursor-pointer hover:bg-blue-400 hover:text-white"
                                    onClick={handleLogout}
                                >
                                    <FaSignOutAlt size="1.8em" />
                                </div>
                            </ul>
                        </div>
                    </div>
                </ul>
            </nav>
        </div>
    );
};

export default MobileMenuBar;
