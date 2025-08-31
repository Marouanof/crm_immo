import { React, useState } from 'react';
import { Form, Row, Col, Button , Card} from 'react-bootstrap';
import { FiFilter, FiCalendar } from 'react-icons/fi';

const Filters = ({ onFilterChange, loading }) => {
  const [filters, setFilters] = useState({
    date_debut: '',
    date_fin: '',
    mois: ''
  });

  const [activeFilter, setActiveFilter] = useState('none'); // 'none', 'date', 'month'

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFilters(prev => ({ ...prev, [name]: value }));
  };

  const applyFilters = () => {
    // Validation basique
    if (activeFilter === 'date' && filters.date_debut && filters.date_fin) {
      if (new Date(filters.date_debut) > new Date(filters.date_fin)) {
        alert('La date de début ne peut pas être après la date de fin');
        return;
      }
    }
    
    onFilterChange(filters);
  };

  const clearFilters = () => {
    setFilters({ date_debut: '', date_fin: '', mois: '' });
    setActiveFilter('none');
    onFilterChange({});
  };

  return (
    <Card className="mb-4">
      <Card.Header>
        <FiFilter className="me-2" />
        Filtres
      </Card.Header>
      <Card.Body>
        <Row className="align-items-end">
          <Col md={3}>
            <Form.Group>
              <Form.Label>Type de filtre</Form.Label>
              <Form.Select 
                value={activeFilter} 
                onChange={(e) => setActiveFilter(e.target.value)}
                disabled={loading}
              >
                <option value="none">Aucun filtre</option>
                <option value="date">Période spécifique</option>
                <option value="month">Par mois</option>
              </Form.Select>
            </Form.Group>
          </Col>

          {activeFilter === 'date' && (
            <>
              <Col md={3}>
                <Form.Group>
                  <Form.Label>Date de début</Form.Label>
                  <Form.Control
                    type="date"
                    name="date_debut"
                    value={filters.date_debut}
                    onChange={handleInputChange}
                    disabled={loading}
                    max={filters.date_fin || undefined}
                  />
                </Form.Group>
              </Col>
              <Col md={3}>
                <Form.Group>
                  <Form.Label>Date de fin</Form.Label>
                  <Form.Control
                    type="date"
                    name="date_fin"
                    value={filters.date_fin}
                    onChange={handleInputChange}
                    disabled={loading}
                    min={filters.date_debut || undefined}
                  />
                </Form.Group>
              </Col>
            </>
          )}

          {activeFilter === 'month' && (
            <Col md={3}>
              <Form.Group>
                <Form.Label>Mois</Form.Label>
                <Form.Control
                  type="month"
                  name="mois"
                  value={filters.mois}
                  onChange={handleInputChange}
                  disabled={loading}
                />
              </Form.Group>
            </Col>
          )}

          <Col md={3}>
            <Button 
              variant="primary" 
              onClick={applyFilters}
              disabled={loading || activeFilter === 'none'}
              className="me-2"
            >
              Appliquer
            </Button>
            <Button 
              variant="outline-secondary" 
              onClick={clearFilters}
              disabled={loading}
            >
              Effacer
            </Button>
          </Col>
        </Row>
      </Card.Body>
    </Card>
  );
};

export default Filters;