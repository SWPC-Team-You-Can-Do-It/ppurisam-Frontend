// src/contexts/ImageContext.jsx

import React, { createContext, useState } from 'react';

export const ImageContext = createContext();

export const ImageProvider = ({ children }) => {
    const [imageData, setImageData] = useState({
        fileName: '',
        base64Data: '',
        size: 0,
    });

    return (
        <ImageContext.Provider value={{ imageData, setImageData }}>
            {children}
        </ImageContext.Provider>
    );
};
