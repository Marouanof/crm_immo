import { useState, useEffect } from 'react';
import axios from 'axios';

export default function usePropositionsCount(lead) {
  const apiUrl = import.meta.env.VITE_API_BASE_URL;
  const [count, setCount] = useState(0);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const fetchCount = async () => {
      if (!lead?.id) return;
      setLoading(true);
      try {
        const token = localStorage.getItem('access_token');
        const params = new URLSearchParams();
            params.append('is_validated', 'true');
            params.append('ville',lead.quartiers[0].ville);
            params.append('budget_lead' , lead.budget);
            params.append('type_bien',lead.type_bien);
            params.append('type_transaction', lead.type_transaction === "Achat" ? "Vente":lead.type_transaction);
            params.append('statut_commercial','Disponible');
            params.append('surface', lead.surface);
            params.append('etat_bien',lead.etat_bien);
            [...new Set(lead.quartiers.map(q => q.quartier))].forEach(quartier => {
            params.append('quartiers', quartier);
            });
            [...new Set(lead.quartiers.map(q => q.nbr_chambre.toString()))].forEach(chambre => {
            params.append('chambres', chambre);
            });

        const res = await axios.get(`${apiUrl}/bien/api/biens/`, {
          params,
          headers: {
            Authorization: `Bearer ${token}`
          }
        });

        const items = Array.isArray(res.data) ? res.data : [];
        setCount(items.length);
      } catch (error) {
        console.error('Error fetching available propositions count:', error);
        setCount(0);
      } finally {
        setLoading(false);
      }
    };

    fetchCount();
  }, [lead]);

  return { count, loading };
}
