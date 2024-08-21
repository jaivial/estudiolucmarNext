import React from "react";
import { AiOutlineLoading } from "react-icons/ai";

const SmallLoadingScreen = () => {
    return (
        <div
            id="small-loading-screen"
            className="fixed inset-0 flex items-center justify-center bg-gray-800 bg-opacity-20 z-[9900]"
        >
            <div className="bg-white rounded-xl p-4 bg-opacity-100">
                <AiOutlineLoading className="text-blue-500 text-4xl animate-spin" />
            </div>
        </div>
    );
};

export default SmallLoadingScreen;