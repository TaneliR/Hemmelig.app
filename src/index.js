import React from 'react';
import ReactDOM from 'react-dom';
import { MantineProvider } from '@mantine/core';
import App from './client/app';
import './client/index.css';

ReactDOM.render(
    <MantineProvider theme={{ colorScheme: 'light' }}>
        <App />
    </MantineProvider>,
    document.getElementById('root')
);
