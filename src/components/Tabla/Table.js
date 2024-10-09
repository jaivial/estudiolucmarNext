import React from 'react';
import TableHeader from './TableHeader.js';
import TableBody from './TableBody.js';
import TableFooter from './TableFooter.js';
import MoreInfo from '../';
import BuscadorTabs from './TabsBuscador.js';
import Analytics from './Analytics.js';
import FilterMenu from './FilterMenu.js';
import AddNewInmueble from './AddNewInmueble.js';

const Table = ({ parentsEdificioProps, admin, screenWidth, loadingLoader }) => {
    // ...

    return (
        <div className="bg-slate-400 h-full w-full overflow-x-hidden">
            <div className="container mx-auto p-4 pb-24 md:p-6 lg:p-8 xl:p-10 2xl:p-12">
                <TableHeader
                    handleSearch={handleSearch}
                    handleClearSearch={handleClearSearch}
                    searchTerm={searchTerm}
                    setSearchTerm={setSearchTerm}
                    screenWidth={screenWidth}
                />
                <BuscadorTabs
                    paginaBuscador={paginaBuscador}
                    setPaginaBuscador={setPaginaBuscador}
                />
                <TableBody
                    data={data}
                    loadingPage={loadingPage}
                    screenWidth={screenWidth}
                    handleToggle={handleToggle}
                    expandedItems={expandedItems}
                    showExtraButtons={showExtraButtons}
                    showUngroupButtons={showUngroupButtons}
                    showDeleteInmuebleButtons={showDeleteInmuebleButtons}
                    selectedItems={selectedItems}
                    selectedItemsUngroup={selectedItemsUngroup}
                    handleCheckboxChange={handleCheckboxChange}
                    handleCheckboxChangeUngroup={handleCheckboxChangeUngroup}
                    handleItemClick={handleItemClick}
                />
                <TableFooter
                    currentPage={currentPage}
                    totalPages={totalPages}
                    handlePrevious={handlePrevious}
                    handleNext={handleNext}
                    loadingPage={loadingPage}
                />
                {showMoreInfo && (
                    <MoreInfo
                        id={selectedId}
                        onClose={handleClose}
                        showModal={showMoreInfo}
                        setShowModal={setShowMoreInfo}
                        fetchData={fetchData}
                        currentPage={currentPage}
                        searchTerm={searchTerm}
                        admin={admin}
                        screenWidth={screenWidth}
                    />
                )}
                {showAnalytics && screenWidth >= 1280 && (
                    <Analytics analyticsData={analyticsData} />
                )}
                {showFilters && (
                    <FilterMenu
                        setFilters={setFilters}
                        currentPage={currentPage}
                        data={data}
                        setData={setData}
                        filters={filters}
                        setCurrentPage={setCurrentPage}
                        setTotalPages={setTotalPages}
                        setLoading={setLoading}
                        resetFiltersKey={resetFiltersKey}
                        screenWidth={screenWidth}
                        paginaBuscador={paginaBuscador}
                    />
                )}
                {showEditTable && (
                    <div className={`flex flex-row gap-4 pt-2 pb-2 w-full ${admin === 'true' ? 'justify-center' : 'justify-center'} iconscontainertrue`}>
                        {/* ... */}
                    </div>
                )}
                {showExtraButtons && (
                    <div className="flex gap-4 mt-4 pb-4 w-full justify-center">
                        {/* ... */}
                    </div>
                )}
                {showUngroupButtons && (
                    <div className="flex gap-4 mt-4 pb-4 w-full justify-center">
                        {/* ... */}
                    </div>
                )}
                {showDeleteInmuebleButtons && admin && (
                    <div className="flex gap-4 mt-4 pb-4 w-full justify-center">
                        {/* ... */}
                    </div>
                )}
                {showAddInmuebleButtons && (
                    <div className="flex gap-4 mt-4 pb-4 w-full justify-center">
                        {/* ... */}
                    </div>
                )}
                {showPopup && (
                    <div className="popup-container fixed inset-0 flex items-center justify-center bg-gray-800 bg-opacity-75 z-50">
                        {/* ... */}
                    </div>
                )}
                {showPopupUngroup && (
                    <div className="popup-container fixed inset-0 flex items-center justify-center bg-gray-800 bg-opacity-75 z-50">
                        {/* ... */}
                    </div>
                )}
                {showAskForDeleteOrphan && (
                    <div className="popup-container fixed inset-0 flex items-center justify-center bg-gray-800 bg-opacity-75 z-50">
                        {/* ... */}
                    </div>
                )}
                {showPopupDeleteInmueble && (
                    <div className="popup-container fixed inset-0 flex items-center justify-center bg-gray-800 bg-opacity-75 z-50">
                        {/* ... */}
                    </div>
                )}
                {showAddNewInmueble && (
                    <AddNew Inmueble
                        showAddNewInmueble={showAddNewInmueble}
                        setShowAddNewInmueble={setShowAddNewInmueble}
                        fetchData={fetchData}
                        currentPage={currentPage}
                        searchTerm={searchTerm}
                        handleIconAddInmueble={handleIconAddInmueble}
                    />
                )}
            </div>
        </div>
    );
};

export default Table;