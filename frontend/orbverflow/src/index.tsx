import React from 'react';
import './index.css';
import { MantineProvider } from '@mantine/core';
import '@mantine/core/styles.css';
import { render } from 'react-dom';
import { AppRouter } from './AppRouter';
render(
  <MantineProvider>
    <AppRouter />
  </MantineProvider>,
  document.getElementById('root')
);