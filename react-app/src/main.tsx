import { createRoot } from 'react-dom/client';
import { BrowserRouter } from 'react-router-dom';
import '../../shared/styles.css';
import App from './App';
import { StoreProvider } from './store';

createRoot(document.getElementById('root')!).render(
  <BrowserRouter>
    <StoreProvider>
      <App />
    </StoreProvider>
  </BrowserRouter>,
);
