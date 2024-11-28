import React, { createContext, useState, useContext } from "react";

const CommunicationContext = createContext();

export const useCommunication = () => useContext(CommunicationContext);

export const CommunicationProvider = ({ children }) => {
    const [communicationData, setCommunicationData] = useState([]);
    const [isCommunicationActive, setIsCommunicationActive] = useState(false);

    const startCommunication = (data) => {
        setIsCommunicationActive(true);
        setCommunicationData(data);
    };

    const stopCommunication = () => {
        setIsCommunicationActive(false);
        setCommunicationData([]);
    };

    return (
        <CommunicationContext.Provider
            value={{ communicationData, isCommunicationActive, startCommunication, stopCommunication }}
        >
            {children}
        </CommunicationContext.Provider>
    );
};
