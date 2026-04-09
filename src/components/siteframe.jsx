import React, { useState } from "react";
import "../App.css";

const siteframe = () => {
    const [isLoading, setIsLoading] = useState(true);
    const url = "https://jarayuayurved.com";

    // Inline style objects
    const containerStyle = { position: "relative" };
    const overlayStyle = {
        position: "absolute",
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        backgroundColor: "white",
        zIndex: 10,
    };
    const spinnerStyle = {
        border: "4px solid #f3f3f3",
        borderTop: "4px solid #3498db",
        borderRadius: "50%",
        width: "40px",
        height: "40px",
        animation: "spin 1s linear infinite",
    };

    return (
        <div style={containerStyle}>
            {isLoading && (
                <div style={overlayStyle}>
                    <div style={spinnerStyle} />
                </div>
            )}
            <div className="border rounded-md overflow-y-auto scrollbar-custom" style={{ height: "calc(100vh - 80px)" }}>
                <iframe
                    src={url}
                    title="Embedded Site"
                    className="w-full h-[100vh] border-0 scrollbar-custom"
                    allowFullScreen
                    onLoad={() => setIsLoading(false)}
                />
            </div>
            {/* Inline CSS for keyframes */}
            <style>{`
        @keyframes spin {
          0% { transform: rotate(0deg); }
          100% { transform: rotate(360deg); }
        }
      `}</style>
        </div>
    );
};

export default siteframe;
