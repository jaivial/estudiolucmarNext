import React, { useEffect, useState } from 'react';
import { AiOutlineHome, AiOutlineSearch, AiOutlineSetting, AiOutlineUser } from 'react-icons/ai';
import { Icon } from '@iconify/react';
import Image from 'next/image';
import Cookies from 'js-cookie';
import axios from 'axios';
import Toastify from 'toastify-js';
import { useRouter } from 'next/router';
import { FaSignOutAlt, FaChevronRight, FaChevronLeft } from 'react-icons/fa';

const Sidebar = ({ userData }) => {
    const router = useRouter();
    const [isExpanded, setIsExpanded] = useState(false);
    const [fullyExpanded, setFullyExpanded] = useState(false);
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

    useEffect(() => {
        if (isExpanded) {
            setTimeout(() => {
                setFullyExpanded(true);
            }, 200);
        } else {
            setFullyExpanded(false);
        }
    }, [isExpanded]);

    const menuItems = [
        { name: 'Home', path: '/home', icon: <AiOutlineHome /> },
        { name: 'Buscador', path: '/buscador', icon: <AiOutlineSearch /> },
        { name: 'Mi Zona', path: '/mizona', icon: <Icon icon="gis:poi-map" /> },
        { name: 'Mapa', path: '/mapa', icon: <Icon icon="solar:map-linear" /> },
        { name: 'Clientes', path: '/clientes', icon: <Icon icon="bi:people-fill" /> },
        { name: 'Ajustes', path: '/settings', icon: <AiOutlineSetting /> },
    ];

    return (
        <div
            className={`top-0 flex flex-col justify-between items-stretch left-0 bottom-0 h-screen transition-width duration-[600ms] ease-in-out ${isExpanded ? 'w-56' : 'w-20'} bg-slate-200 shadow-lg rounded-tr-2xl rounded-br-2xl z-[50000]`}
        >
            {/* Avatar Section */}
            <div className="flex flex-col py-4 justify-center items-center mx-auto flex-shrink-0">
                <div>
                    <Image
                        src="/assets/img/logolucmar.jpg"
                        alt="Lucmar Logo"
                        width={isExpanded ? 100 : 120}
                        height={isExpanded ? 100 : 120}
                        className={`rounded-full transition-all duration-[400ms] mx-auto ${isExpanded ? 'w-24 h-24 mb-3' : 'w-16 h-16'}`}
                    />
                    {isExpanded && (
                        <span className={`text-blue-950 font-semibold text-xl transition-opacity ${fullyExpanded ? 'opacity-100 flex duration-[3000ms] ease-in-out mx-4 text-center' : 'opacity-0 flex duration-[0ms] ease-in-out'}`}>
                            Estudio Lucmar
                        </span>
                    )}
                </div>
            </div>

            {/* Navigation Section */}
            <nav className={`flex-grow relative overflow-y-auto flex flex-col ${isExpanded ? 'h-auto' : 'h-auto'}`}>
                {menuItems.map((item) => (
                    <a
                        key={item.name}
                        href={item.path}
                        className={`flex items-center p-3 gap-3 rounded-lg transition-all duration-[300ms] ease-in-out group mt-3 ${isExpanded
                            ? 'justify-start mx-4'
                            : 'justify-center mx-2'
                            } ${window.location.pathname === item.path
                                ? 'bg-blue-400 text-white hover:no-underline'
                                : 'hover:bg-blue-800 hover:cursor-pointer hover:no-underline'
                            }`}
                    >
                        <span className={`text-blue-900 text-3xl ${isExpanded ? 'mr-2' : ''} group-hover:text-white`}>
                            {item.icon}
                        </span>
                        {isExpanded && (
                            <span
                                className={`transition-opacity duration-300 text-blue-900 ${fullyExpanded ? 'opacity-100' : 'opacity-0'} group-hover:text-white`}
                            >
                                {item.name}
                            </span>
                        )}
                    </a>
                ))}

                {/* Expand/Collapse Button */}
                <button
                    className="absolute bottom-5 left-1/2 transform -translate-x-1/2 bg-white text-black rounded-full p-2 shadow-md hover:bg-blue-400 hover:text-white transition-all"
                    onClick={() => setIsExpanded(!isExpanded)}
                >
                    {isExpanded ? <FaChevronLeft size="1.5em" /> : <FaChevronRight size="1.5em" />}
                </button>
            </nav>

            {/* User Information Section */}
            <div
                className={`bg-slate-800 text-white mt-auto rounded-br-2xl flex flex-col items-center justify-center transition-all duration-[500ms] ${isExpanded && window.innerHeight > 700 ? 'h-[36%] gap-5 pb-4' : 'justify-center h-[20%] pb-4 py-2'} overflow-hidden flex-shrink-0`}
            >
                <>
                    <Image
                        src={userData?.user?.profile_photo}
                        alt="User Profile"
                        width={100}
                        height={100}
                        className={`rounded-full transition-all duration-[800ms] mx-auto mt-2 ${isExpanded ? 'w-24 h-24 mb-3 mt-4' : 'w-14 h-14 mb-2'}`}
                    />
                    {userData?.user?.admin && (
                        <div className={`bg-blue-500 text-white ${isExpanded ? 'px-3 py-1 text-md' : 'px-2 py-1 text-xs'} rounded-lg mt-1 w-fit`}>
                            Admin
                        </div>
                    )}
                    {isExpanded && window.innerHeight > 700 && (
                        <>
                            <span className={`text-center ${fullyExpanded ? 'opacity-100' : 'opacity-0'} transition-opacity duration-[600ms]`}>
                                {userData?.user?.nombre} {userData?.user?.apellido}
                            </span>
                            <div className={`text-center ${fullyExpanded ? 'opacity-100' : 'opacity-0'} transition-opacity duration-[600ms] px-6`}>
                                {userData?.user?.email}
                            </div>
                        </>
                    )}
                    {!isExpanded && (
                        <>
                            <div
                                id="mobile-itemLogOut"
                                className="w-[50px] flex mx-auto justify-center py-2 mt-4 bg-white text-black rounded-3xl shadow-lg hover:cursor-pointer hover:bg-blue-400 hover:text-white transition-all duration-[500ms]"
                                onClick={handleLogout}
                            >
                                <FaSignOutAlt size="1.8em" />
                            </div> </>
                    )}
                    {isExpanded && (
                        <div className="text-center">
                            <label>Cerrar Sesión</label>
                            <div
                                id="mobile-itemLogOut"
                                className="w-[50px] flex mx-auto justify-center py-2 mt-2 bg-white text-black rounded-3xl shadow-lg hover:cursor-pointer hover:bg-blue-400 hover:text-white transition-all duration-[500ms]"
                                onClick={handleLogout}
                            >
                                <FaSignOutAlt size="1.8em" />
                            </div>
                        </div>
                    )}
                </>
            </div>



        </div>
    );


};

export default Sidebar;
