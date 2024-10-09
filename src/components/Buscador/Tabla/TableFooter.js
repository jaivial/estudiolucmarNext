import React from 'react';

const TableFooter = ({ currentPage, totalPages, handlePrevious, handleNext, loadingPage }) => {
    return (
        <div className="flex mt-4 pb-4 w-full xl:w-[60%] flex-row items-center justify-center">
            <div className="flex flex-row justify-center items-center gap-3">
                <button type="button" onClick={handlePrevious} disabled={currentPage === 1 || loadingPage} className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded w-[100px]">
                    Anterior
                </button>
                <div className="text-gray-700 font-semibold">
                    Página {currentPage} de {totalPages}
                </div>
                <button type="button" onClick={handleNext} disabled={currentPage === totalPages || loadingPage} className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded w-[100px]">
                    Siguiente
                </button>
            </div>
        </div>
    );
};

export default TableFooter;