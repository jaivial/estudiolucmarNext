import React, { useEffect, useState } from 'react';
import { logout } from '../../lib/supabase/login/logout.js';
import { useRouter } from 'next/router';
import Link from 'next/link';

const MobileMenuBar = () => {
    const router = useRouter();
    const [isDesplegarMoreMenu, setIsDesplegarMoreMenu] = useState(true);
    const [currentPage, setCurrentPage] = useState('');

    useEffect(() => {
        const checkCurrentPage = () => {
            const currentURL = window.location.href;
            if (currentURL.includes('buscador')) {
                localStorage.setItem('currentPage', 'Buscador');
            } else if (currentURL.includes('home')) {
                localStorage.setItem('currentPage', 'Home');
            } else if (currentURL.includes('settings')) {
                localStorage.setItem('currentPage', 'Settings');
            } else if (currentURL.includes('encargos')) {
                localStorage.setItem('currentPage', 'Encargos');
            } else if (currentURL.includes('noticias')) {
                localStorage.setItem('currentPage', 'Noticias');
            } else if (currentURL.includes('mapa')) {
                localStorage.setItem('currentPage', 'Mapa');
            }
            setCurrentPage(localStorage.getItem('currentPage'));
        };

        checkCurrentPage();
    }, []);

    useEffect(() => {
        const restoreColores = (currentPage) => {
            const navLinks = document.querySelectorAll('a');
            navLinks.forEach((link) => {
                if (link.id.includes(currentPage)) {
                    link.classList.remove('h-[45px]', 'bg-white', 'p-2', 'text-black');
                    link.classList.add('h-[55px]', 'bg-blue-400', 'p-2.5', 'text-white');
                } else {
                    link.classList.remove('h-[55px]', 'bg-blue-400', 'p-2.5', 'text-white');
                    link.classList.add('h-[45px]', 'bg-white', 'p-2', 'text-black');
                }
            });
        };

        restoreColores(currentPage);
    }, [currentPage]);

    useEffect(() => {
        const handleClickOutside = (event) => {
            const moreMobileMenu = document.getElementById('moreMobileMenu');
            if (moreMobileMenu && !moreMobileMenu.contains(event.target)) {
                hideMoreMenu();
                setIsDesplegarMoreMenu(true);
            }
        };

        document.addEventListener('click', handleClickOutside);

        return () => {
            document.removeEventListener('click', handleClickOutside);
        };
    }, []);

    const toggleDesplegarMoreMenu = () => {
        if (isDesplegarMoreMenu) {
            showMoreMenu();
        } else {
            hideMoreMenu();
        }
        setIsDesplegarMoreMenu(!isDesplegarMoreMenu);
    };

    const showMoreMenu = () => {
        document.getElementById('mobile-itemMoreMenuIcon').classList.remove('bg-white');
        document.getElementById('mobile-itemMoreMenuIcon').classList.add('bg-blue-400', 'text-white');
        document.getElementById('moreMobileMenu').classList.add('shadow-lg', 'bg-blue-400', 'bg-opacity-30');

        document.getElementById('mobile-itemSettings').classList.remove('hidden');
        document.getElementById('mobile-itemEncargos').classList.remove('hidden');
        document.getElementById('mobile-itemNoticias').classList.remove('hidden');
        document.getElementById('mobile-itemLogOut').classList.remove('hidden');
    };

    const hideMoreMenu = () => {
        document.getElementById('mobile-itemMoreMenuIcon').classList.remove('bg-blue-400', 'text-white');
        document.getElementById('mobile-itemMoreMenuIcon').classList.add('bg-white');
        document.getElementById('moreMobileMenu').classList.remove('shadow-lg', 'bg-blue-400', 'bg-opacity-30');

        document.getElementById('mobile-itemSettings').classList.add('hidden');
        document.getElementById('mobile-itemEncargos').classList.add('hidden');
        document.getElementById('mobile-itemNoticias').classList.add('hidden');
        document.getElementById('mobile-itemLogOut').classList.add('hidden');
    };

    const handleLogout = async () => {
        try {
            const { success, message } = await logout();
            if (success) {
                router.push('/');
                localStorage.setItem('toastMessage', JSON.stringify({
                    message: 'Sesión cerrada',
                    style: 'linear-gradient(to right bottom, #c62828, #b92125, #ac1a22, #a0131f, #930b1c)'
                }));
            }
        } catch (error) {
            console.error('Logout error:', error);
        }
    };

    return (
        <div id="completesidenavbar" className="relative z-[9999]">
            <nav className="h-10 w-full flex flex-row justify-between border-t border-slate-300 shadow-2xl fixed bottom-0 left-0 z-[9999] overflow-visible bg-slate-50">
                <ul className="w-full h-full flex flex-row justify-around items-end transition-all pb-3.5 overflow-y-visible shadow-xl">
                    <Link href="/home" id="mobile-itemHome" className="h-[55px] bg-blue-400 p-2.5 px-3.5 rounded-3xl shadow-lg text-white flex items-center justify-center hover:cursor-pointer hover:bg-blue-400 hover:text-white">
                        <svg xmlns="http://www.w3.org/2000/svg" width="1.8em" height="1.8em" viewBox="0 0 1024 1024">
                            <path fill="currentColor" d="M946.5 505L534.6 93.4a31.93 31.93 0 0 0-45.2 0L77.5 505c-12 12-18.8 28.3-18.8 45.3c0 35.3 28.7 64 64 64h43.4V908c0 17.7 14.3 32 32 32H448V716h112v224h265.9c17.7 0 32-14.3 32-32V614.3h43.4c17 0 33.3-6.7 45.3-18.8c24.9-25 24.9-65.5-.1-90.5"></path>
                        </svg>
                    </Link>
                    <Link href="/buscador" id="mobile-itemBuscador" className="h-[45px] bg-white p-2 px-3.5 rounded-3xl shadow-lg flex items-center justify-center hover:cursor-pointer hover:bg-blue-400 hover:text-white">
                        <svg xmlns="http://www.w3.org/2000/svg" width="1.8em" height="1.8em" viewBox="0 0 14 14">
                            <path fill="currentColor" fillRule="evenodd" d="M2 6a4 4 0 1 1 8 0a4 4 0 0 1-8 0m4-6a6 6 0 1 0 3.476 10.89l2.817 2.817a1 1 0 0 0 1.414-1.414l-2.816-2.816A6 6 0 0 0 6 0" caprule="evenodd"></path>
                        </svg>
                    </Link>
                    <Link href="/mapa" id="mobile-itemMapa" className="h-[45px] bg-white p-2 px-3.5 rounded-3xl shadow-lg flex items-center justify-center hover:cursor-pointer hover:bg-blue-400 hover:text-white">
                        <svg xmlns="http://www.w3.org/2000/svg" width="1.9em" height="1.9em" viewBox="0 0 100 100">
                            <path fill="currentColor" d="m70.387 70l-3.854 7.247l18.87-3.085c-3.808-1.91-8.963-3.275-15.016-4.162m-48.61 1.58C13.037 73.885 7.5 77.662 7.5 83.272a8.4 8.4 0 0 0 .774 3.497l30.285-4.95zM91.79 80l-42.15 6.87l11.116 12.646C79.01 97.881 92.5 92.05 92.5 83.272c0-1.17-.252-2.257-.71-3.271m-49.272 8.055l-28.48 4.655C21.566 97.374 34.853 100 50 100c.918 0 1.815-.026 2.719-.045z"></path>
                            <path fill="currentColor" d="M50.002 0c-16.3 0-29.674 13.333-29.674 29.596c0 6.252 1.987 12.076 5.342 16.865l19.234 33.25l.082.107c.759.991 1.5 1.773 2.37 2.348c.87.576 1.95.92 3.01.814c2.118-.212 3.415-1.708 4.646-3.376l.066-.086l21.234-36.141l.012-.023c.498-.9.866-1.816 1.178-2.708a29.246 29.246 0 0 0 2.17-11.05C79.672 13.333 66.302 0 50.002 0m0 17.045c7.071 0 12.59 5.509 12.59 12.55c0 7.043-5.519 12.55-12.59 12.55c-7.072 0-12.594-5.508-12.594-12.55c0-7.04 5.523-12.55 12.594-12.55" caprule="evenodd"></path>
                        </svg>
                    </Link>
                    <div id="moreMobileMenu" className="h-auto pt-3.5 -mx-3.5 rounded-3xl flex flex-col items-center justify-center">
                        <ul className="w-auto h-full flex flex-col justify-between gap-6 px-3.5">
                            <div id="mobile-itemEncargos" className="h-[45px] bg-white p-2 px-3.5 rounded-3xl shadow-lg hidden items-center justify-center hover:cursor-pointer hover:bg-blue-400 hover:text-white">
                                <svg xmlns="http://www.w3.org/2000/svg" width="1.8em" height="1.8em" viewBox="0 0 20 20">
                                    <path fill="currentColor" d="M2 3a1 1 0 0 1 2 0h13a1 1 0 1 1 0 2H4v12.5a.5.5 0 0 1-.5.5h-1a.5.5 0 0 1-.5-.5zm3 3.5a.5.5 0 0 1 .5-.5h11a.5.5 0 0 1 .5.5v7a2.5 2.5 0 0 1-2.5 2.5h-7A2.5 2.5 0 0 1 5 13.5zm3 7a.5.5 0 0 0 .5.5h1a.5.5 0 0 0 .5-.5v-1a.5.5 0 0 1 .5-.5h1a.5.5 0 0 1 .5.5v1a.5.5 0 0 0 .5.5h1a.5.5 0 0 0 .5-.5v-2.55a1 1 0 0 0-.336-.748L11.332 8.13a.5.5 0 0 0-.664 0L8.336 10.2a1 1 0 0 0-.336.75z" caprule="evenodd"></path>
                                </svg>
                            </div>
                            <div id="mobile-itemNoticias" className="hidden h-[45px] bg-white p-2 px-3.5 rounded-3xl shadow-lg items-center justify-center hover:cursor-pointer hover:bg-blue-400 hover:text-white">
                                <svg xmlns="http://www.w3.org/2000/svg" width="1.8em" height="1.8em" viewBox="0 0 24 24">
                                    <path fill="currentColor" d="M10 6h4V4h-4zm8 17q-2.075 0-3.537-1.463T13 18t1.463-3.537T18 13t3.538 1.463T23 18t-1.463 3.538T18 23M4 21q-.825 0-1.412-.587T2 19V8q0-.825.588-1.412T4 6h4V4q0-.825.588-1.412T10 2h4q.825 0 1.413.588T16 4v2h4q.825 0 1.413.588T22 8v2.9q0 .45-.387.675t-.813.025q-.65-.3-1.362-.45T18 11q-2.9 0-4.95 2.05T11 18q0 .45.063.913t.187.912q.125.425-.137.8t-.688.375zm14 0q.2 0 .35-.15t.15-.35t-.15-.35T18 20t-.35.15t-.15.35t.15.35t.35.15m0-2q.2 0 .35-.15t.15-.35v-3q0-.2-.15-.35T18 15t-.35.15t-.15.35v3q0 .2.15.35T18 19" caprule="evenodd"></path>
                                </svg>
                            </div>
                            <Link href="/settings" id="mobile-itemSettings" className="h-[45px] bg-white p-2 px-3.5 rounded-3xl shadow-lg hidden items-center justify-center hover:cursor-pointer hover:bg-blue-400 hover:text-white">
                                <svg xmlns="http://www.w3.org/2000/svg" width="1.8em" height="1.8em" viewBox="0 0 512 512">
                                    <path fill="currentColor" d="M256 176a80 80 0 1 0 80 80a80.24 80.24 0 0 0-80-80m172.72 80a165.5 165.5 0 0 1-1.64 22.34l48.69 38.12a11.59 11.59 0 0 1 2.63 14.78l-46.06 79.52a11.64 11.64 0 0 1-14.14 4.93l-57.25-23a176.6 176.6 0 0 1-38.82 22.67l-8.56 60.78a11.93 11.93 0 0 1-11.51 9.86h-92.12a12 12 0 0 1-11.51-9.53l-8.56-60.78A169.3 169.3 0 0 1 151.05 393L93.8 416a11.64 11.64 0 0 1-14.14-4.92L33.6 331.57a11.59 11.59 0 0 1 2.63-14.78l48.69-38.12A175 175 0 0 1 83.28 256a165.5 165.5 0 0 1 1.64-22.34l-48.69-38.12a11.59 11.59 0 0 1-2.63-14.78l46.06-79.52a11.64 11.64 0 0 1 14.14-4.93l57.25 23a176.6 176.6 0 0 1 38.82-22.67l8.56-60.78A11.93 11.93 0 0 1 209.94 26h92.12a12 12 0 0 1 11.51 9.53l8.56 60.78A169.3 169.3 0 0 1 361 119l57.2-23a11.64 11.64 0 0 1 14.14 4.92l46.06 79.52a11.59 11.59 0 0 1-2.63 14.78l-48.69 38.12a175 175 0 0 1 1.64 22.66" caprule="evenodd"></path>
                                </svg>
                            </Link>
                            <div id="mobile-itemLogOut" className="h-[45px] bg-white p-2 px-3.5 rounded-3xl shadow-lg hidden items-center justify-center hover:cursor-pointer hover:bg-blue-400 hover:text-white" onClick={handleLogout}>
                                <svg xmlns="http://www.w3.org/2000/svg" width="1.8em" height="1.8em" viewBox="0 0 24 24">
                                    <path fill="none" stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 3h4a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2h-4m-5-4l5-5l-5-5m5 5H3" caprule="evenodd"></path>
                                </svg>
                            </div>
                            <div id="mobile-itemMoreMenuIcon" className="h-[45px] bg-white p-2 px-3.5 rounded-3xl shadow-lg flex items-center justify-center hover:cursor-pointer hover:bg-blue-400 hover:text-white" onClick={toggleDesplegarMoreMenu}>
                                <svg xmlns="http://www.w3.org/2000/svg" width="1.8em" height="1.8em" viewBox="0 0 24 24">
                                    <path fill="none" stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M2 18c0-1.54 0-2.31.347-2.876c.194-.317.46-.583.777-.777C3.689 14 4.46 14 6 14s2.31 0 2.876.347c.317.194.583.46.777.777C10 15.689 10 16.46 10 18s0 2.31-.347 2.877c-.194.316-.46.582-.777.776C8.311 22 7.54 22 6 22s-2.31 0-2.876-.347a2.35 2.35 0 0 1-.777-.776C2 20.31 2 19.54 2 18m12 0c0-1.54 0-2.31.347-2.876c.194-.317.46-.583.777-.777C15.689 14 16.46 14 18 14s2.31 0 2.877.347c.316.194.582.46.776.777C22 15.689 22 16.46 22 18s0 2.31-.347 2.877a2.36 2.36 0 0 1-.776.776C20.31 22 19.54 22 18 22s-2.31 0-2.876-.347a2.35 2.35 0 0 1-.777-.776C14 20.31 14 19.54 14 18M2 6c0-1.54 0-2.31.347-2.876c.194-.317.46-.583.777-.777C3.689 2 4.46 2 6 2s2.31 0 2.876.347c.317.194.583.46.777.777C10 3.689 10 4.46 10 6s0 2.31-.347 2.876c-.194.317-.46.583-.777.777C8.311 10 7.54 10 6 10s-2.31 0-2.876-.347a2.35 2.35 0 0 1-.777-.777C2 8.311 2 7.54 2 6m12 0c0-1.54 0-2.31.347-2.876c.194-.317.46-.583.777-.777C15.689 2 16.46 2 18 2s2.31 0 2.877.347c.316.194.582.46.776.777C22 3.689 22 4.46 22 6s0 2.31-.347 2.876c-.194.317-.46.583-.776.777C20.31 10 19.54 10 18 10s-2.31 0-2.876-.347a2.35 2.35 0 0 1-.777-.777C14 8.311 14 7.54 14 6" caprule="evenodd"></path>
                                </svg>
                            </div>
                        </ul>
                    </div>
                </ul>
            </nav>
        </div>
    );
};

export default MobileMenuBar;
