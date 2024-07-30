import React from "react";
import { AiOutlineLoading } from "react-icons/ai";

const LoadingScreen = () => {
  return (
    <div
      id="loading-screen"
      className="fixed inset-0 flex items-center justify-center bg-white z-[800]"
    >
      <AiOutlineLoading className="text-blue-500 text-8xl animate-spin" />
    </div>
  );
};

export default LoadingScreen;
