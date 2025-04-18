import React from 'react';
import ReactDOM from 'react-dom';
import './index.css';
import WebSocketComponent from './components/WebSocketComponent';
import App from './components/App';
import { Toaster } from 'react-hot-toast';

ReactDOM.render(
    <React.StrictMode>
        <Toaster position='bottom-right'/>
        <App />
    </React.StrictMode>,
    document.getElementById('root')
);
