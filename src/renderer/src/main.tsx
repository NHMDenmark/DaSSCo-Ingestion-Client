import ReactDOM from 'react-dom/client'
import App from './App'
import { KeycloakService } from './services/KeycloakService';
import "./index.css";

const renderApp = () => ReactDOM.createRoot(document.getElementById('root')!).render(<App/>)

KeycloakService.initKeycloak(renderApp);
