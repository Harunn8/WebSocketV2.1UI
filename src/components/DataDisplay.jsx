import React from 'react';

const DataDisplay = ({ data }) => {
    return (
        <div>
            <h3>Gelen SNMP Verileri</h3>
            <div style={{ maxHeight: '60vh', overflowY: 'scroll', border: '1px solid #ddd', padding: '10px' }}>
                {data.map((message, index) => (
                    <div key={index}>{message}</div>
                ))}
            </div>
        </div>
    );
};

export default DataDisplay;
