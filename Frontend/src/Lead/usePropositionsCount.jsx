import { useState, useEffect } from 'react';
import axios from 'axios';

export default function usePropositionsCount(lead) {
  const apiUrl = import.meta.env.VITE_API_BASE_URL;
  const [count, setCount] = useState(0);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const fetchCount = async () => {
      if (!lead?.id) return;
      const quartiers = Array.isArray(lead?.quartiers) ? lead.quartiers : [];
      if (quartiers.length === 0) {
        setCount(0);
        return;
      }
      setLoading(true);
      try {
        const token = localStorage.getItem('access_token');
        const params = new URLSearchParams();
            params.append('is_validated', 'true');
            if (quartiers[0]?.ville) params.append('ville', quartiers[0].ville);
            if (lead?.budget != null) params.append('budget_lead' , String(lead.budget));
            if (lead?.type_bien) params.append('type_bien', lead.type_bien);
            if (lead?.type_transaction) params.append('type_transaction', lead.type_transaction === "Achat" ? "Vente" : lead.type_transaction);
            params.append('statut_commercial','Disponible');
            if (lead?.surface != null) params.append('surface', String(lead.surface));
            if (lead?.etat_bien) params.append('etat_bien', lead.etat_bien);

            const hasToutQuartier = quartiers.some(q => q?.quartier && q.quartier.toLowerCase() === 'tout');
            if (!hasToutQuartier) {
              [...new Set(quartiers.map(q => q?.quartier).filter(Boolean))].forEach(quartier => {
                params.append('quartiers', quartier);
              });
            }
            [...new Set(quartiers.map(q => (q?.nbr_chambre != null ? String(q.nbr_chambre) : null)).filter(Boolean))]
              .forEach(chambre => {
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
