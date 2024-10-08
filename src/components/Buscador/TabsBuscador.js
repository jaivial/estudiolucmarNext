import { Nav } from 'rsuite';
import './tabsbuscador.css';

const BuscadorTabs = ({ paginaBuscador, setPaginaBuscador }) => {
    const handleSelect = (activeKey) => {
        setPaginaBuscador(activeKey); // Set the tab name when a tab is selected
    };

    return (
        <Nav
            appearance="pills" // Using RSuite's pills appearance
            activeKey={paginaBuscador} // Setting the active tab based on the current paginaBuscador
            onSelect={handleSelect} // Handle tab change
        >
            <Nav.Item eventKey="Todos" style={{ fontSize: '1.1rem', padding: '0.4rem 1.5rem' }}>
                Todos
            </Nav.Item>
            <Nav.Item eventKey="Noticias" style={{ fontSize: '1.1rem', padding: '0.4rem 1.5rem' }}>Noticias</Nav.Item>
            <Nav.Item eventKey="Encargos" style={{ fontSize: '1.1rem', padding: '0.4rem 1.5rem' }}>Encargos</Nav.Item>
        </Nav>
    );
};

export default BuscadorTabs;
