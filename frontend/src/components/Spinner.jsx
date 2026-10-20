import React from "react";

const Spinner = ({ size = 40, text = "Loading..." }) => {
  return (
    <div className="flex flex-col items-center justify-center py-8">
      <div
        className="animate-spin rounded-full border-4 border-gray-300 border-t-blue-500"
        style={{
          width: `${size}px`,
          height: `${size}px`,
        }}
      ></div>

      {text && (
        <p className="mt-3 text-sm text-gray-500">{text}</p>
      )}
    </div>
  );
};

export default Spinner;