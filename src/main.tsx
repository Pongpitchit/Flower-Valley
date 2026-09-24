import {createRoot} from 'react-dom/client';
import App from './App';
import './styles.css';
createRoot(document.getElementById('root')!).render(<App/>);
if(import.meta.env.DEV && new URLSearchParams(location.search).has('qa')) void import('./qa');
