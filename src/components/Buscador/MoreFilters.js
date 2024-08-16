import React, { use, useState, useEffect } from 'react';
import Select from 'react-select';

const MoreFilters = ({ filters, setFilters, resetFiltersKey }) => {
    // Define options for the number of habitaciones and baños
    const numberOptions = Array.from({ length: 21 }, (_, i) => ({ value: i, label: `${i}` }));

    const tipoOptions = [
        { value: 1, label: 'Inmueble' },
        { value: 2, label: 'Edificio' },
        // Add more options as needed
    ];

    // Handler for checkboxes
    const handleCheckboxChange = (e) => {
        const { name, checked } = e.target;
        setFilters((prevFilters) => ({
            ...prevFilters,
            [name]: checked,
        }));
    };

    // Handler for select dropdowns
    const handleSelectChange = (selectedOption, field) => {
        setFilters((prevFilters) => ({
            ...prevFilters,
            [field]: selectedOption ? selectedOption.value : null,
        }));

    };

    useEffect(() => {
        console.log('filters', filters);
    }, [filters]);

    // Effect to reset filters when resetFiltersKey changes
    useEffect(() => {
        setFilters((prevFilters) => ({
            ...prevFilters,
            habitaciones: 'undefined',
            banos: 'undefined',
            tipo: 'undefined'
        }));
    }, [resetFiltersKey, setFilters]);


    return (
        <div className="p-4 pr-2 w-full bg-gray-100 border border-gray-300 rounded-lg shadow-md z-[9999]">
            <h3 className="font-sans text-gray-700 text-lg mb-4 text-center">Más filtros</h3>

            {/* Checkboxes for features */}
            <div className='flex flex-row gap-2'>
                <div className="grid grid-cols-1 gap-4 mb-4 w-1/2 z-[9999]">
                    {['garaje', 'ascensor', 'trastero', 'jardin', 'terraza', 'aireacondicionado'].map((feature) => {
                        // Mapping of feature keys to more readable labels
                        const featureLabels = {
                            garaje: 'Garaje',
                            ascensor: 'Ascensor',
                            trastero: 'Trastero',
                            jardin: 'Jardín',
                            terraza: 'Terraza',
                            aireacondicionado: 'Aire acondicionado'
                        };

                        return (
                            <label key={feature} className="flex items-center">
                                <input
                                    type="checkbox"
                                    name={feature}
                                    checked={filters[feature] || false}
                                    onChange={handleCheckboxChange}
                                    className="mr-2"
                                />
                                {featureLabels[feature]}
                            </label>
                        );
                    })}
                </div>

                {/* Select for Habitaciones */}
                <div className='flex flex-col justify-start gap-4 w-1/2 z-[9999]'>
                    <div className="mb-4">
                        <Select
                            options={numberOptions}
                            value={filters.habitaciones ? numberOptions.find(option => option.value === filters.habitaciones) : null}
                            onChange={(selectedOption) => handleSelectChange(selectedOption, 'habitaciones')}
                            className="w-full"
                            placeholder="Habitaciones"
                            isClearable
                        />
                    </div>

                    {/* Select for Baños */}
                    <div className="mb-4">
                        <Select
                            options={numberOptions}
                            value={filters.banos ? numberOptions.find(option => option.value === filters.banos) : null}
                            onChange={(selectedOption) => handleSelectChange(selectedOption, 'banos')}
                            className="w-full"
                            placeholder="Baños"
                            isClearable
                        />
                    </div>
                    <div className="mb-4">
                        <Select
                            options={tipoOptions}
                            value={filters.tipo ? tipoOptions.find(option => option.value === filters.tipo) : null}
                            onChange={(selectedOption) => handleSelectChange(selectedOption, 'tipo')}
                            className="w-full"
                            placeholder="Tipo de Inmueble"
                            isClearable
                        />
                    </div>
                </div>
                {/* Select for Tipo */}

            </div>
        </div>
    );
};

export default MoreFilters;
