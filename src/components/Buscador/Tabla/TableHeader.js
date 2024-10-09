import React from 'react';

const TableHeader = ({ handleSearch, handleClearSearch, searchTerm, setSearchTerm, screenWidth }) => {
    return (
        <div className="tablesettingscontainer flex flex-row gap-4 pt-2 pb-2 w-full justify-center items-center md:flex-col lg:flex-row xl:flex-row 2xl:flex-row">
            <form onSubmit={handleSearch} className="mb-4 flex flex-row gap-2 mt-0 w-full justify-center items-center bg-slate-200 rounded-2xl p-4 shadow-2xl">
                <div className="relative w-[80%]">
                    <input
                        type="text"
                        value={searchTerm}
                        onChange={(e) => {
                            setSearchTerm(e.target.value);
                            setShowMoreInfo(false);
                        }}
                        placeholder="Buscar una dirección..."
                        className="border border-gray-300 px-3 py-2 w-[100%] rounded-3xl"
                    />
                    <div className="flex gap-2 justify-center items-center flex-row">
                        <button type="submit" className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-3 px-3 rounded-3xl flex-row justify-center items-center text-center z-[30] absolute top-0 right-0">
                            <svg xmlns="http://www.w3.org/2000/svg" width="1em" height="1em" viewBox="0 0 1664 1664" className>
                                <path
                                    fill="currentColor"
                                    d="M1152 704q0-185-131.5-316.5T704 256T387.5 387.5T256 704t131.5 316.5T704 1152t316.5-131.5T1152 704m512 832q0 52-38 90t-90 38q-54 0-90-38l-343-342q-179 124-399 124q-143 0-273.5-55.5t-225-150t-150-225T0 704t55.5-273.5t150-225t225-150T704 0t273.5 55.5t225 150t150 225T1408 704q0 220-124 399l343 343q37 37 37 90"
                                />
                            </svg>
                        </button>
                    </div>
                </div>
                <button type="button" onClick={handleClearSearch} className="bg-red-500 hover:bg-red-700 text-white font-bold py-1.5 px-1.5 rounded-3xl flex-row justify-center items-center text-center">
                    <svg xmlns="http://www.w3.org/2000/svg" width="1.8em" height="1.8em" viewBox="0 0 24 24">
                        <path
                            fill="currentColor"
                            d="M12 20c-4.41 0-8-3.59-8-8s3.59-8 8-8s8 3.59 8 8s-3.59 8-8 8m0-18C6.47 2 2 6.47 2 12s4.47 10 10 10s10-4.47 10-10S17.53 2 12 2m2.59 6L12 10.59L9.41 8L8 9.41L10.59 12L8 14.59L9.41 16L12 13.41L14.59 16L16 14.59L13.41 12L16 9.41z"
                        />
                    </svg>
                </button>
            </form>
        </div>
    );
};

export default TableHeader;