import {React, useState, useEffect} from 'react';
import { Bar, Doughnut, Line } from 'react-chartjs-2';
import axios from 'axios';
import Filters from './Filters.jsx';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend,
  ArcElement,
  PointElement,
  LineElement
} from 'chart.js';
import { Card, Row, Col, Table, Button} from 'react-bootstrap';
import { 
  FiUsers, FiHome, FiTrendingUp, FiPieChart, 
  FiBarChart2, FiTarget, FiDollarSign, FiStar, FiCalendar 
} from 'react-icons/fi';
import '../assets/styles/dashboard.css';
import Calendrier from './Calendrier';
import NAvbarDashboard from './NAvbarDashboard';
import NavbarLead from "../Lead/NavbarLead";

ChartJS.register(CategoryScale, LinearScale, BarElement, Title, Tooltip, Legend, ArcElement, PointElement, LineElement);

const Dashboard = () => {
  const apiUrl = import.meta.env.VITE_API_BASE_URL;
  const [stats, setStats] = useState(null);
  const [bienStats, setBienStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [userRole, setUserRole] = useState('');
  const [userId, setUserId] = useState(null);
  const [userName, setUserName] = useState('');
  const role = localStorage.getItem("role");
  const [filters, setFilters] = useState({});

  const fetchUserData = (filters = {}) => {
      try {
        // Récupérer les données utilisateur depuis localStorage
        const userData = JSON.parse(localStorage.getItem('user'));
        if (userData) {
          setUserId(userData.id);
          setUserRole(userData.role);
          setUserName(`${userData.prenom} ${userData.nom}`);
        }
      } catch (error) {
        console.error('Erreur lors de la récupération des données utilisateur:', error);
      }
    };

  // Remplacez la fonction fetchData actuelle par celle-ci :
const fetchData = async (filtersParams = {}) => {
  try {
    setLoading(true);
    
    // Récupérer les données utilisateur depuis localStorage
    const userData = JSON.parse(localStorage.getItem('user'));
    if (userData) {
      setUserId(userData.id);
      setUserRole(userData.role);
      setUserName(`${userData.prenom} ${userData.nom}`);
    }

    const token = localStorage.getItem('access_token');
    const config = token ? { 
      headers: { Authorization: `Bearer ${token}` },
      params: filtersParams  // Utilisez filtersParams ici
    } : { params: filtersParams };  // Et ici

    const [leadStats, bienData] = await Promise.all([
      axios.get(`${apiUrl}/lead/dashboard_stats/`, config),
      axios.get(`${apiUrl}/bien/api/biens/stats/`, config)
    ]);
    
    setStats(leadStats.data);
    setBienStats(bienData.data);
    
    if (leadStats.data.user_role) {
      setUserRole(leadStats.data.user_role);
    }
    
  } catch (err) {
    console.error("Erreur:", err);
    setError(err.message);
  } finally {
    setLoading(false);
  }
};

  useEffect(() => {
    fetchData({});
  }, []);

  const handleFilterChange = (newFilters) => {
    setFilters(newFilters);
    fetchData(newFilters);
  };

  const isAdmin = () => userRole === 'admin';
  const isCommercial = () => userRole === 'commercial';

  if (loading) return (
    <div className="dashboard-container">
      <div className="loading-spinner">
        <div className="spinner-border text-primary" role="status">
          <span className="visually-hidden">Loading...</span>
        </div>
      </div>
    </div>
  );
  
  if (error) return (
    <div className="dashboard-container">
      <div className="error-message">
        <FiTarget size={24} />
        <h4>Erreur de chargement</h4>
        <p>{error}</p>
      </div>
    </div>
  );
  
  if (!stats) return (
    <div className="dashboard-container">
      <div className="no-data">
        <FiPieChart size={32} />
        <h4>Aucune donnée disponible</h4>
        <p>Les données statistiques n'ont pas pu être chargées.</p>
      </div>
    </div>
  );

  // Données pour les graphiques
  const leadsStatutData = {
    labels: stats.leads_by_statut?.map(item => item.statut) || [],
    datasets: [{
      label: 'Leads par Statut',
      data: stats.leads_by_statut?.map(item => item.count) || [],
      backgroundColor: ['#00ffff', '#005effff', '#fbff08ff', '#9333ea', '#7a7a7aff', '#ffa200ff', '#f84646ff','#419c3dff'],
      borderWidth: 0,
      borderRadius: 6
    }]
  };

  const leadsSourceData = {
    labels: stats.leads_par_source?.map(item => item.source || 'Non spécifiée') || [],
    datasets: [{
      data: stats.leads_par_source?.map(item => item.count) || [],
      backgroundColor: ['#2563eb', '#16a34a', '#eab308', '#dc2626', '#9333ea', '#0891b2'],
      borderWidth: 0,
      hoverOffset: 12
    }]
  };

  const biensCommercialData = {
    labels: bienStats?.biens_par_commercial?.map(item => 
      `${item.id_utilisateur__prenom?.charAt(0) || ''}. ${item.id_utilisateur__nom || 'Non affecté'}`
    ) || [],
    datasets: [{
      label: 'Biens par Commercial',
      data: bienStats?.biens_par_commercial?.map(item => item.total_biens) || [],
      backgroundColor: '#9333ea',
      borderColor: '#9333ea',
      borderWidth: 0,
      borderRadius: 6
    }]
  };

  const chartOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        position: 'top',
        labels: {
          usePointStyle: true,
          padding: 20
        }
      }
    },
    scales: {
      y: {
        beginAtZero: true,
        grid: {
          drawBorder: false
        }
      },
      x: {
        grid: {
          display: false
        }
      }
    }
  };

  const doughnutOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        position: 'bottom',
        labels: {
          usePointStyle: true,
          padding: 20
        }
      }
    },
    cutout: '60%'
  };



  return (
    <>
      <NavbarLead titre="Dashboard"/>
      <div className="mt-3"></div>
      <Calendrier />
      {(role === "admin" || role === "commercial") && (
      <div className="dashboard-container">
        {/* En-tête personnalisé selon le rôle */}
        <Filters onFilterChange={handleFilterChange} loading={loading} />
         {/* Indicateur de filtre actif */}
        {filters && (filters.date_debut || filters.mois) && (
          <div className="alert alert-info mb-4">
            <FiCalendar className="me-2" />
            Filtre appliqué : 
            {filters.date_debut && ` Du ${filters.date_debut} au ${filters.date_fin}`}
            {filters.mois && ` Mois de ${filters.mois}`}
            <Button 
              variant="link" 
              size="sm" 
              onClick={() => handleFilterChange({})}
              className="p-0 ms-2"
            >
              × Supprimer le filtre
            </Button>
          </div>
        )}
        {/* Cartes statistiques principales */}
        <Row className="stats-grid">
          <Col xl={3} lg={3} md={6} className="mb-4">
            <div className="stat-card primary">
              <div className="stat-icon">
                <FiUsers />
              </div>
              <div className="stat-content">
                <div className="stat-number">{stats.total_leads}</div>
                <div className="stat-label">Total Leads</div>
                {isCommercial() && <small>Mes leads</small>}
              </div>
            </div>
          </Col>
          
          <Col xl={3} lg={3} md={6} className="mb-4">
            <div className="stat-card warning">
              <div className="stat-icon">
                <FiHome />
              </div>
              <div className="stat-content">
                <div className="stat-number">{bienStats?.total_biens || 0}</div>
                <div className="stat-label">Total Biens</div>
                {isCommercial() && <small>Mes biens</small>}
              </div>
            </div>
          </Col>
          
          <Col xl={3} lg={3} md={6} className="mb-4">
            <div className="stat-card success">
              <div className="stat-icon">
                <FiTarget />
              </div>
              <div className="stat-content">
                <div className="stat-number">{stats.total_gagnes || 0}</div>
                <div className="stat-label">Conversions</div>
                {isCommercial() && <small>Mes conversions</small>}
              </div>
            </div>
          </Col>

          <Col xl={3} lg={3} md={6} className="mb-4">
            <div className="stat-card success">
              <div className="stat-icon">
                <FiTrendingUp />
              </div>
              <div className="stat-content">
                <div className="stat-number">
                  {(stats.taux_conversion_total || 0).toFixed(1)}%
                </div>
                <div className="stat-label">Taux Conversion</div>
                {isCommercial() && <small>Mon taux</small>}
              </div>
            </div>
          </Col>
        </Row>
        
        {/* Grille principale */}
        <Row>
          {/* Graphiques communs à tous */}
          <Col xl={6} lg={12} className="mb-4">
            <Card className="dashboard-card">
              <Card.Header>
                <FiPieChart className="card-icon" />
                {isAdmin() ? 'Répartition des Leads par Statut' : 'Mes Leads par Statut'}
              </Card.Header>
              <Card.Body>
                <div className="chart-container">
                  {stats.leads_by_statut?.length > 0 ? (
                    <Doughnut data={leadsStatutData} options={doughnutOptions} />
                  ) : (
                    <div className="no-data">Aucune donnée disponible</div>
                  )}
                </div>
              </Card.Body>
            </Card>
          </Col>

          <Col xl={6} lg={12} className="mb-4">
            <Card className="dashboard-card">
              <Card.Header>
                <FiDollarSign className="card-icon" />
                Sources des Leads
              </Card.Header>
              <Card.Body>
                <div className="chart-container">
                  {stats.leads_par_source?.length > 0 ? (
                    <Doughnut data={leadsSourceData} options={doughnutOptions} />
                  ) : (
                    <div className="no-data">Aucune donnée disponible</div>
                  )}
                </div>
              </Card.Body>
            </Card>
          </Col>

          {/* Contenu spécifique à l'admin */}
          {isAdmin() && (
            <>
              <Col xl={6} lg={12} className="mb-4">
                <Card className="dashboard-card">
                  <Card.Header>
                    <FiBarChart2 className="card-icon" />
                    Leads par Commercial
                  </Card.Header>
                  <Card.Body>
                    <div className="chart-container">
                      {stats.leads_par_commercial?.length > 0 ? (
                        <Bar data={{
                          labels: stats.leads_par_commercial.map(item => 
                            `${item.id_utilisateur__prenom?.charAt(0) || ''}. ${item.id_utilisateur__nom || 'Non affecté'}`
                          ),
                          datasets: [{
                            label: 'Leads par Commercial',
                            data: stats.leads_par_commercial.map(item => item.count),
                            backgroundColor: '#2563eb',
                            borderColor: '#2563eb',
                            borderWidth: 0,
                            borderRadius: 6
                          }]
                        }} options={chartOptions} />
                      ) : (
                        <div className="no-data">Aucune donnée disponible</div>
                      )}
                    </div>
                  </Card.Body>
                </Card>
              </Col>

              <Col xl={6} lg={12} className="mb-4">
                <Card className="dashboard-card">
                  <Card.Header>
                    <FiTrendingUp className="card-icon" />
                    Taux de Conversion par Commercial
                  </Card.Header>
                  <Card.Body>
                    <div className="chart-container">
                      {stats.conversion_par_commercial?.length > 0 ? (
                        <Line data={{
                          labels: stats.conversion_par_commercial.map(item => 
                            `${item.commercial_prenom?.charAt(0) || ''}. ${item.commercial_nom || ''}`
                          ),
                          datasets: [{
                            label: 'Taux de Conversion (%)',
                            data: stats.conversion_par_commercial.map(item => item.taux_conversion),
                            backgroundColor: '#16a34a',
                            borderColor: '#16a34a',
                            borderWidth: 2,
                            fill: false,
                            tension: 0.4
                          }]
                        }} options={chartOptions} />
                      ) : (
                        <div className="no-data">Aucune donnée disponible</div>
                      )}
                    </div>
                  </Card.Body>
                </Card>
              </Col>

              {bienStats && isAdmin() && (
                <Col xl={6} lg={12} className="mb-4">
                  <Card className="dashboard-card">
                    <Card.Header>
                      <FiHome className="card-icon" />
                      Biens par Commercial
                    </Card.Header>
                    <Card.Body>
                      <div className="chart-container">
                        {bienStats.biens_par_commercial?.length > 0 ? (
                          <Bar data={biensCommercialData} options={chartOptions} />
                        ) : (
                          <div className="no-data">Aucune donnée disponible</div>
                        )}
                      </div>
                    </Card.Body>
                  </Card>
                </Col>
              )}

              <Col xl={6} lg={12} className="mb-4">
                <Card className="dashboard-card">
                  <Card.Header>
                    <FiStar className="card-icon" />
                    Classement des Commerciaux
                  </Card.Header>
                  <Card.Body>
                    <div className="performance-table-container">
                      {stats.conversion_par_commercial?.length > 0 ? (
                        <Table className="performance-table" hover>
                          <thead>
                            <tr>
                              <th>Commercial</th>
                              <th>Leads</th>
                              <th>Conversions</th>
                              <th>Taux</th>
                            </tr>
                          </thead>
                          <tbody>
                            {stats.conversion_par_commercial.map((item, index) => (
                              <tr key={index}>
                                <td className="commercial-name">
                                  <strong>{`${item.commercial_prenom || ''} ${item.commercial_nom || ''}`}</strong>
                                </td>
                                <td>{item.total_leads}</td>
                                <td>{item.leads_gagnes}</td>
                                <td>
                                  <span className={item.taux_conversion >= 30 ? "conversion-high" : 
                                                  item.taux_conversion >= 15 ? "conversion-medium" : "conversion-low"}>
                                    {item.taux_conversion}%
                                  </span>
                                </td>
                              </tr>
                            ))}
                          </tbody>
                        </Table>
                      ) : (
                        <div className="no-data">Aucune donnée disponible</div>
                      )}
                    </div>
                  </Card.Body>
                </Card>
              </Col>
            </>
          )}

          {/* Contenu spécifique au commercial */}
          {isCommercial() && (
            <Col xl={6} lg={12} className="mb-4">
              <Card className="dashboard-card">
                <Card.Header>
                  <FiTrendingUp className="card-icon" />
                  Mes Performances Détaillées
                </Card.Header>
                <Card.Body>
                  <div className="commercial-stats">
                    <Row>
                      <Col md={6}>
                        <div className="stat-item">
                          <span className="stat-label">Leads totaux:</span>
                          <span className="stat-value">{stats.total_leads}</span>
                        </div>
                      </Col>
                      <Col md={6}>
                        <div className="stat-item">
                          <span className="stat-label">Conversions:</span>
                          <span className="stat-value">{stats.total_gagnes || 0}</span>
                        </div>
                      </Col>
                      <Col md={6}>
                        <div className="stat-item">
                          <span className="stat-label">Taux de conversion:</span>
                          <span className="stat-value">{(stats.taux_conversion_total || 0).toFixed(1)}%</span>
                        </div>
                      </Col>
                      <Col md={6}>
                        <div className="stat-item">
                          <span className="stat-label">Biens gérés:</span>
                          <span className="stat-value">{bienStats?.total_biens || 0}</span>
                        </div>
                      </Col>
                    </Row>
                    <div className="performance-summary">
                      <h6>Résumé de performance</h6>
                      <p>Votre taux de conversion est de <strong>{(stats.taux_conversion_total || 0).toFixed(1)}%</strong></p>
                    </div>
                  </div>
                </Card.Body>
              </Card>
            </Col>
          )}
        </Row>
      </div>
      )}
    </>
  );
};

export default Dashboard;