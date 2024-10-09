import React from 'react';
import Select from 'react-select';
import Skeleton from 'react-loading-skeleton';
import 'react-loading-skeleton/dist/skeleton.css';

const TableBody = ({ data, loadingPage, screenWidth, handleToggle, expandedItems, showExtraButtons, showUngroupButtons, showDeleteInmuebleButtons, selectedItems, selectedItemsUngroup, handleCheckboxChange, handleCheckboxChangeUngroup, handleItemClick }) => {
    return (
        <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg :grid-cols-3 xl:grid-cols-4 2xl:grid-cols-5">
            {loadingPage ? (
                <div className="skeleton flex flex-col gap-6 w-full pt-1 pb-4">
                    {Array.from({ length: 20 }).map((_, index) => (
                        <Skeleton
                            key={index}
                            count={1}
                            height={56}
                            className="shadow-lg"
                            style={{ borderRadius: '6px' }}
                        />
                    ))}
                </div>
            ) : (
                Array.isArray(data) && data.length > 0 ? (
                    data.map((item) =>
                        item.tipoagrupacion === 1 ? (
                            <div
                                key={item.id}
                                className={`relative px-2 py-4 border border-zinc-400 gap-1 rounded-md h-[4.5rem] flex items-center flex-row w-full ${item.tipoagrupacion === '1' ? 'bg-slate-100' : item.dataUpdateTime === 'red' ? 'bg-red-100' : item.dataUpdateTime === 'yellow' ? 'bg-yellow-200' : item.dataUpdateTime === 'gray' ? 'bg-white hover:bg-gray-200 ' : 'bg-white hover:bg-slate-300 hover:cursor-pointer'}`}
                                onClick={() => handleItemClick(item.id)}
                            >
                                <div className="flex flex-row justify-between w-full">
                                    {showExtraButtons && <input type="checkbox" checked={selectedItems.has(item.id)} onChange={() => handleCheckboxChange(item.id)} className="mr-4 w-[25px]" />}
                                    {showDeleteInmuebleButtons && <input type="checkbox" checked={selectedItems.has(item.id)} onChange={() => handleCheckboxChange(item.id)} className="mr-4 w-[25px]" />}
                                    <div className="flex flex-row justify-start items-center gap-1 w-[100%] py-2 ">
                                        <p className={`w-[95%] ${screenWidth > 450 ? 'w-[72.5%]' : ''} sm:w-[55%] md:w-[45%] lg:w-[40%] xl:w-[37.5%] 2xl:w-[35%] text-center truncate`} style={{ marginTop: '0px' }}>
                                            {item.direccion}
                                        </p>
                                        {screenWidth > 1024 && (
                                            <p className={`w-[10%] xl:w-[10%] text-center truncate mt-0`}>
                                                {item.localizado === false ? (
                                                    <></>
                                                ) : (
                                                    <div className='flex flex-row justify-center items-center'>
                                                        <p className='text-center text-green-900 bg-green-100 border border-green-900 rounded-md w-min px-2 mx-auto my-auto text-xs'>Sí</p>
                                                    </div>
                                                )}
                                            </p>
                                        )}
                                        {screenWidth > 768 && (
                                            <p className={`w-[10%] lg:w-[10%] 2xl:w-[7.5%] text-center truncate mt-0`}>
                                                {item.superficie} m²
                                            </p>
                                        )}
                                        {screenWidth > 1280 && (
                                            <p className={`w-[7.5%] text-center truncate mt-0`}>
                                                {item.ano_construccion}
                                            </p>
                                        )}
                                        {screenWidth > 640 && (
                                            <p className={`w-[20%] lg:w-[17.5%] xl:w-[17.5%] 2xl:w-[15%] text-center truncate mt-0`}>
                                                {item.zona}
                                            </p>
                                        )}
                                        {screenWidth > 1024 && (
                                            <p className={`w-[7.5%] text-center truncate mt-0`}>
                                                {item.DPV === false ? (
                                                    <></>
                                                ) : (
                                                    <div className='flex flex-row justify-center items-center'>
                                                        <p className='text-center text-green-900 bg-green-100 border border-green-900 rounded-md w-min px-2 mx-auto my-auto text-xs'>Sí</p>
                                                    </div>
                                                )}
                                            </p>
                                        )}
                                        {screenWidth > 1536 && (
                                            <p className={`w-[10%] text-center truncate mt-0`}>
                                                {item.categoria}
                                            </p>
                                        )}
                                        {screenWidth > 450 && (
                                            <div className="flex flex-col gap-2 py-6 w-[22.5%] sm:w-[20%] lg:w-[20%] xl:w-[17.5%] 2xl:w-[15%] h-fit justify-center items-center">
                                                {item.noticiastate === true && (
                                                    // <svg xmlns="http://www.w3.org/2000/svg" width="2.1em" height="2.1em" viewBox="0 0 24 24">
                                                    //     <path
                                                    //         fill="currentColor"
                                                    //         d="M10 7h4V5.615q0-.269-.173-.442T13.385 5h-2.77q-.269 0-.442.173T10 5.615zm8 15q-1.671 0-2.835-1.164Q14 19.67 14 18t1.165-2.835T18 14t2.836 1.165T22 18t-1.164 2.836T18 22M4.615 20q-.69 0-1.153-.462T3 18.384V8.616q0-.691.463-1.153T4.615 7H9V5.615q0-.69.463-1.153T10.616 4h2.769q.69 0 1.153.462T15 5.615V7h4.385q.69 0 1.152.463T21 8.616v4.198q-.683-.414-1.448-.614T18 12q-2.496 0-4.248 1.752T12 18q0 .506.086 1.009t.262.991zM18 20.423q.2 0 .33-.13t.132-.331t-.131-.331T18 19.5t-.33.13t-.132.332t.131.33t.331.131m-.385-1.846h.77v-3h-.77z"
                                                    //     />
                                                    // </svg>
                                                    <p className='bg-blue-100 text-center text-blue-900 rounded-md border border-blue-900 w-min px-2 mx-auto my-auto text-sm'>Noticia</p>
                                                )}
                                                {item.encargostate === true && (
                                                    // <svg xmlns="http://www.w3.org/2000/svg" width="2em" height="2em" viewBox="0 0 20 20">
                                                    //     <path
                                                    //         fill="currentColor"
                                                    //         d="M2 3a1 1 0 0 1 2 0h13a1 1 0 1 1 0 2H4v12.5a.5.5 0 0 1-.5.5h-1a.5.5 0 0 1-.5-.5zm3 3.5a.5.5 0 0 1 .5-.5h11a.5.5 0 0 1 .5.5v7a2.5 2.5 0 0 1-2.5 2.5h-7A2.5 2.5 0 0 1 5 13.5zm3 7a.5.5 0 0 0 .5.5h1a.5.5 0 0 0 .5-.5v-1a.5.5 0 0 1 .5-.5h1a.5.5 0 0 1 .5.5v1a.5.5 0 0 0 .5.5h1a.5.5 0 0 0 .5-.5v-2.55a1 1 0 0 0-.336-.748L11.332 8.13a.5.5 0 0 0-.664 0L8.336 10.2a1 1 0 0 0-.336.75z"
                                                    //     />
                                                    // </svg>
                                                    <p className='bg-orange-100 text-center text-orange-900 rounded-md border border-orange-900 w-min px-2 mx-auto my-auto text-sm'>Encargo</p>

                                                )}
                                            </div>
                                        )}


                                        <div onClick={() => handleItemClick(item.id)} className="cursor-pointer w-[5%] mx-0 text-center flex flex-row justify-center items-center">
                                            <svg xmlns="http://www.w3.org/2000/svg" width="2.1em" height="2.1em" viewBox="0 0 16 16" className="text-cyan-800 bg-white rounded-full hover:w-[2.5em] hover:h-[2.5em] hover:shadow-lg hover:text-cyan-600">
                                                <path fill="currentColor" d="M8 0a8 8 0 1 1 0 16A8 8 0 0 1 8 0m1.062 4.312a1 1 0 1 0-2 0v2.75h-2.75a1 1 0 0 0 0 2h2.75v2.75a1 1 0 1 0 2 0v-2.75h2.75a1 1 0 1 0 0-2h-2.75Z" />
                                            </svg>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        ) : (
                            item.tipoagrupacion === 2 && (
                                <div
                                    key={item.EdificioID}
                                    className={`relative border border-gray-400 px-2 py-4 mb-4 rounded-xl shadow-xl flex items-center flex-row w-full bg-gray-100`}
                                >
                                    <div className="w-full flex flex-col justify-center items-center">
                                        <div className="flex flex-row justify-start items-center gap-2 w-full  cursor-pointer" onClick={() => handleToggle(item.EdificioID)}>
                                            {showDeleteInmuebleButtons && <input type="checkbox" checked={selectedItems.has(item.id)} onChange={() => handleCheckboxChange(item.id)} className="mr-4 w-[25px] h-[25px]" />}
                                            <div className="flex flex-row justify-start items-center w-[80%] py-2">
                                                <span className="flex flex-row justify-start items-center w-[75%] pl-1">
                                                    <svg xmlns="http://www.w3.org/2000/svg" width="3em" height="3em" viewBox="0 0 24 24">
                                                        <g fill="none">
                                                            <path d="M24 0v24H0V0zM12.593 23.258l-.011.002l-.071.035l-.02.004l-.014-.004l-.071-.035q-.016-.005-.024.005l-.004.01l-.017.428l.005.02l.01.013l.104.074l.015.004l.012-.004l.104-.074l.012-.016l.004-.017l-.017-.427q-.004-.016-.017-.018m.265-.113l-.013.002l-.185.093l-.01.01l-.003.011l.018.43l.005.012l.008.007l.201.093q.019.005.029-.008l.004-.014l-.034-.614q-.005-.019-.02-.022m-.715.002a.02.02 0 0 0-.027.006l-.006.014l-.034.614q.001.018.017.024l.015-.002l.201-.093l.01-.008l.004-.011l.017-.43l-.003-.012l-.01-.01z" />
                                                            <path fill="currentColor" d="M3 19h1V6.36a1.5 1.5 0 0 1 1.026-1.423l8-2.666A1.5 1.5 0 0 1 15 3.694V19h1V9.99a.5.5 0 0 1 .598-.49l2.196.44A1.5 1.5 0 0 1 20 11.41V19h1a1 1 0 1 1 0 2H3a1 1 0 1 1 0-2" />
                                                        </g>
                                                    </svg>
                                                    <p className="w-[60%] text-center">{item.direccion}</p>
                                                </span>
                                                <p className="text-start w-[40%]">{item.zona === 'NULL' ? 'N/A' : item.zona}</p>
                                            </div>
                                            <div className="cursor-pointer flex flex-row justify-center w-[30%]">
                                                {!expandedItems[item.EdificioID] && (
                                                    <svg xmlns="http://www.w3.org/2000/svg" width="2.5em" height="2.5em" viewBox="0 0 24 24">
                                                        <path fill="currentColor" fillRule="evenodd" d="M7 9a1 1 0 0 0-.707 1.707l5 5a1 1 0 0 0 1.414 0l5-5A1 1 0 0 0 17 9z" clipRule="evenodd" />
                                                    </svg>
                                                )}
                                                {expandedItems[item.EdificioID] && (
                                                    <svg xmlns="http://www.w3.org/2000/svg" width="2.5em" height="2.5em" viewBox="0 0 24 24">
                                                        <path fill="currentColor" d="M18.2 13.3L12 7l-6.2 6.3c-.2.2-.3.5-.3.7s.1.5.3.7c.2.2.4.3.7.3h11c.3 0 .5-.1.7-.3c.2-.2.3-.5.3-.7s-.1-.5-.3-.7" />
                                                    </svg>
                                                )}
                                            </div>
                                        </div>
                                        {expandedItems[item.EdificioID] && edifciosChildren(item)}
                                    </div>
                                </div>
                            )
                        )
                    )
                ) : (
                    <div className="flex mt-4 pb-4 w-full flex-row items-center justify-center">
                        <p>No hay resultados</p>
                    </div>
                )
            )}
        </div>
    );
};

export default TableBody;