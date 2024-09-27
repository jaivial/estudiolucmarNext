import React, { useState } from 'react';
import dynamic from 'next/dynamic';
import { AiOutlineEdit } from 'react-icons/ai';

// Dynamically import EditModal with SSR disabled
const EditModal = dynamic(() => import('./EditModal'), { ssr: false });

const EditButton = () => {
    const [isModalOpen, setModalOpen] = useState(false);

    const openModal = () => setModalOpen(true);
    const closeModal = () => setModalOpen(false);

    return (
        <div>
            <button onClick={openModal} className="p-3 rounded-full border border-gray-300 hover:bg-gray-100">
                <AiOutlineEdit className="text-gray-500 text-2xl" />
            </button>
            <EditModal closeModal={closeModal} isModalOpen={isModalOpen} setIsModalOpen={setModalOpen} />
        </div>
    );
};

export default EditButton;
