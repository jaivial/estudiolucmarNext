import React from 'react';
import { FaPersonShelter } from 'react-icons/fa6';
import { LiaKeySolid } from 'react-icons/lia'; // Import LiaKeySolid icon
import { PiEmptyBold } from 'react-icons/pi'; // Import PiEmptyBold icon
import { TbTargetArrow } from 'react-icons/tb'; // Import TbTargetArrow icon
import { FaUserTie } from 'react-icons/fa';
import { PiMapPinSimpleAreaBold } from 'react-icons/pi';

const DetailsInfoThree = ({ data }) => {
    const { tipo, uso, superficie, ano_construccion, habitaciones, garaje, ascensor, baños, trastero, jardin, terraza, aireAcondicionado, categoria, potencialAdquisicion, noticiastate, encargoState, responsable, zona } = data.inmueble;

    // Function to render a list item if the value is valid
    const renderListItem = (value) => {
        if (value !== null && value !== '' && value !== false && value !== 0) {
            return <li className="py-1">{value}</li>;
        }
        return null;
    };

    // Function to render category with appropriate icon
    const renderCategoria = (categoria) => {
        switch (categoria) {
            case 'Inquilino':
                return (
                    <li className="py-1 flex items-center">
                        <FaPersonShelter className="mr-2 text-3xl" /> Inquilino
                    </li>
                );
            case 'Propietario':
                return (
                    <li className="py-1 flex items-center">
                        <LiaKeySolid className="mr-2 text-3xl" /> Propietario
                    </li>
                );
            case 'Vacío':
                return (
                    <li className="py-1 flex items-center">
                        <PiEmptyBold className="mr-2 text-3xl" /> Vacío
                    </li>
                );
            default:
                return null;
        }
    };

    // Function to render potential acquisition with appropriate icon
    const renderPotencialAdquisicion = (value) => {
        if (value === 1) {
            return (
                <li className="py-1 flex items-center">
                    <TbTargetArrow className="mr-2 text-3xl" /> Potencial Adquisición
                </li>
            );
        }
        return null;
    };

    // Function to render noticiastate with appropriate icon
    const renderNoticiaState = (value) => {
        if (value === 1) {
            return (
                <li className="py-1 flex items-center">
                    <svg xmlns="http://www.w3.org/2000/svg" width="2.1em" height="2.1em" viewBox="0 0 24 24">
                        <path
                            fill="currentColor"
                            d="M10 7h4V5.615q0-.269-.173-.442T13.385 5h-2.77q-.269 0-.442.173T10 5.615zm8 15q-1.671 0-2.835-1.164Q14 19.67 14 18t1.165-2.835T18 14t2.836 1.165T22 18t-1.164 2.836T18 22M4.615 20q-.69 0-1.153-.462T3 18.384V8.616q0-.691.463-1.153T4.615 7H9V5.615q0-.69.463-1.153T10.616 4h2.769q.69 0 1.153.462T15 5.615V7h4.385q.69 0 1.152.463T21 8.616v4.198q-.683-.414-1.448-.614T18 12q-2.496 0-4.248 1.752T12 18q0 .506.086 1.009t.262.991zM18 20.423q.2 0 .33-.13t.132-.331t-.131-.331T18 19.5t-.33.13t-.132.332t.131.33t.331.131m-.385-1.846h.77v-3h-.77z"
                        />
                    </svg>
                    <span className="ml-2">Noticia</span>
                </li>
            );
        }
        return null;
    };
    const renderEncargoState = (value) => {
        if (value === 1) {
            return (
                <li className="py-1 flex items-center">
                    <svg xmlns="http://www.w3.org/2000/svg" width="2em" height="2em" viewBox="0 0 20 20">
                        <path
                            fill="currentColor"
                            d="M2 3a1 1 0 0 1 2 0h13a1 1 0 1 1 0 2H4v12.5a.5.5 0 0 1-.5.5h-1a.5.5 0 0 1-.5-.5zm3 3.5a.5.5 0 0 1 .5-.5h11a.5.5 0 0 1 .5.5v7a2.5 2.5 0 0 1-2.5 2.5h-7A2.5 2.5 0 0 1 5 13.5zm3 7a.5.5 0 0 0 .5.5h1a.5.5 0 0 0 .5-.5v-1a.5.5 0 0 1 .5-.5h1a.5.5 0 0 1 .5.5v1a.5.5 0 0 0 .5.5h1a.5.5 0 0 0 .5-.5v-2.55a1 1 0 0 0-.336-.748L11.332 8.13a.5.5 0 0 0-.664 0L8.336 10.2a1 1 0 0 0-.336.75z"
                        />
                    </svg>
                    <span className="ml-2">Encargo</span>
                </li>
            );
        }
        return null;
    };
    const renderAsesorState = (Value) => {
        if (Value) {
            return (
                <li className="py-1 flex items-center">
                    <FaUserTie className="text-gray-900 text-3xl" />

                    <span className="ml-2">{Value}</span>
                </li>
            );
        } else {
            return (
                <li className="py-1 flex items-center">
                    <FaUserTie className="text-gray-900 text-3xl" />

                    <span className="ml-2">Asesor no asignado</span>
                </li>
            );
        }
        return null;
    };
    const renderZoneState = (Value) => {
        if (Value) {
            return (
                <li className="py-1 flex items-center">
                    <PiMapPinSimpleAreaBold className="text-gray-900 text-3xl" />
                    <span className="ml-2">{Value}</span>
                </li>
            );
        } else {
            return (
                <li className="py-1 flex items-center">
                    <PiMapPinSimpleAreaBold className="text-gray-900 text-3xl" />
                    <span className="ml-2">Zona no asignada</span>
                </li>
            );
        }
        return null;
    };

    return (
        <div className="p-4">
            <div className="flex flex-col gap-4">
                {/* Left Column: Basic Characteristics */}
                <div className="bg-white p-4 px-6 border border-gray-300 rounded-md">
                    <div>
                        <h2 className="font-bold text-xl pb-2">Características básicas</h2>
                        <ul className="list-none pl-2">
                            {renderListItem(tipo)}
                            {renderListItem(uso)}
                            {renderListItem(superficie ? `${superficie} m²` : null)}
                            {renderListItem(ano_construccion ? `Construido en ${ano_construccion}` : null)}
                            {renderListItem(habitaciones ? `${habitaciones} habitaciones` : null)}
                            {renderListItem(garaje ? `${garaje} garaje(s)` : null)}
                            {renderListItem(ascensor ? 'Con ascensor' : null)}
                            {renderListItem(baños ? `${baños} baños` : null)}
                            {renderListItem(trastero === 1 ? 'Trastero' : null)}
                            {renderListItem(jardin === 1 ? 'Jardín' : null)}
                            {renderListItem(terraza === 1 ? 'Con terraza y balcón' : null)}
                        </ul>
                    </div>
                    {aireAcondicionado === 1 && (
                        <div>
                            <h2 className="font-bold text-xl pb-2 mt-6">Equipamiento</h2>
                            <ul className="list-none pl-2">{renderListItem(aireAcondicionado === 1 ? 'Aire acondicionado' : null)}</ul>
                        </div>
                    )}
                </div>

                {/* Right Column: Equipment and Commercial Information */}
                <div className="bg-white p-4 px-6 border border-gray-300 rounded-md">
                    <div className="flex flex-col gap-4">
                        {/* Top Column: Equipment */}

                        {/* Bottom Column: Commercial Information */}
                        <div>
                            <h2 className="font-bold text-xl pb-2">Información Comercial</h2>
                            <ul className="list-none pl-2 py-1">
                                {renderCategoria(categoria)}
                                {renderPotencialAdquisicion(potencialAdquisicion)}
                                {renderNoticiaState(noticiastate)}
                                {renderEncargoState(encargoState)}
                                {renderAsesorState(responsable)}
                                {renderZoneState(zona)}
                            </ul>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default DetailsInfoThree;
