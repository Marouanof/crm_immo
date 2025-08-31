import React from 'react'
import ReactDOM from 'react-dom/client'
import App from './App'
import 'bootstrap/dist/css/bootstrap.min.css' // CSS de Bootstrap
import 'bootstrap/dist/js/bootstrap.bundle.min.js';
import { ThemeProvider, CssBaseline } from '@mui/material';
import theme from './theme/theme';
import { Provider } from "react-redux";
import { store } from './Redux/store';

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <ThemeProvider theme={theme}>
      <CssBaseline />
      <Provider store={store}>
        <App />
      </Provider>
    </ThemeProvider>
  </React.StrictMode>
)
