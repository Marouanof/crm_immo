import AddBien from './Bien/addBien'
import ListeBiens from './Bien/listeBiens'
import EditBien from './Bien/editBien'
import Home from './Home/home'

import BienNonValides from './Bien/BienNonValides'
import { useState, useEffect } from 'react'
import reactLogo from './assets/react.svg'
import viteLogo from '/vite.svg'

import './App.css'
import { BrowserRouter as Router, Route, Routes } from 'react-router-dom';
import Register from './User/Register';
import AfficherUtilisateurs from './User/users';
import UserForm from './User/UpdateUser';
import Login from './User/login';
import Navbar from './Partie/navbar'
import PrivateRoute from './Partie/PrivateRoute'
import AddLead from './Lead/addLead'
import LeadList from './Lead/LeadList'
import LeadNouveau from './Lead/NewLead'
import LeadPerdu from './Lead/LeadPerdu'
import BiensProposes from './Lead/BiensProposes'
import CodeVerifie from './User/CodeVerifie'
import PasswordOublie from './User/PasswordOublie'
import Sidebar from './Partie/Sidebar'
import LeadsARappeler from './Lead/LeadsARappeler';
import RDVPlanifie from './Lead/RDVPlanifie'
import Opportunité from './Lead/Opportunité'
import Gagne from './Lead/Gagne'
import NonRelance from './Lead/NonRelance'
import Affecté from './Lead/Affecté'
// import { Router } from 'express'
import LeadsCommercial from './Commercial/leads';
import Dashboard from './Home/Dashboard'
import ProtectedRoute from './Partie/ProtectedRouter'
import { useDispatch } from 'react-redux';
import { loginSuccess } from './Redux/authSlice'
import LeadInfo from './Lead/LeadInfo'
import NotificationsPage from './Notifications/NotificationsPage'
import SidebarCommercial from './Commercial/SidebarCommercial'
import Error404 from './Partie/Error404'

function App() {
  const dispatch = useDispatch();
  useEffect(() => {
    const token = localStorage.getItem('access_token');
    const role = localStorage.getItem('role');
    const user = localStorage.getItem('id_commercial'); // optionnel

    if (token && role) {
      dispatch(loginSuccess({ token, user, role }));
    }
  }, [dispatch]);
  return (
    <>
       <Router>
        
        <Routes>
          
          <Route path='/register' element={ <PrivateRoute> <ProtectedRoute allowedRoles={['admin']}> <Register /> </ProtectedRoute></PrivateRoute>} />
          <Route path="/ajouter-bien" element={ <PrivateRoute>  <AddBien />  </PrivateRoute> } />
          {/* <Route path="/biens" element={ <PrivateRoute>  <ListeBiens/> </PrivateRoute> }/> */}
          <Route path="/modifier-bien/:id" element={ <PrivateRoute>  <EditBien /> </PrivateRoute> } />
          <Route path="/biens-non-valides" element={<BienNonValides />} />
          {/* <Route path="/users" element={ <PrivateRoute>  <AfficherUtilisateurs /> </PrivateRoute> }></Route> */}
          <Route path="/modifier" element={ <PrivateRoute>  <UserForm /> </PrivateRoute> }></Route>
          {/* <Route path="/" element={<Home/>}></Route> */}
          <Route path="/login" element={<Login />} ></Route>

          <Route path="/addLead" element={<PrivateRoute>   <AddLead /> </PrivateRoute>  } />
          {/* <Route path="/leads" element={<PrivateRoute>   <LeadList /> </PrivateRoute> } /> */}
          <Route path="/lead_nouveau" element={<PrivateRoute>   <LeadNouveau /> </PrivateRoute> } />
          
          <Route path="/lead_perdu" element={<PrivateRoute>   <LeadPerdu /> </PrivateRoute> } />
          <Route path="/biens-proposes" element={<BiensProposes />} />
          <Route path="/password_oublie" element={<PasswordOublie />} />
          <Route path="/code_verifie" element={<CodeVerifie />} />
          <Route path="/invalide_page" element={<Error404 />} />

          
          {/* Les routes de sidebar */}
          <Route element={<Sidebar />}>
            <Route path="/" element={<PrivateRoute><ProtectedRoute allowedRoles={['admin', "commercial", "assistant"]}> <Dashboard /> </ProtectedRoute> </PrivateRoute>} />
            <Route path="/biens" element={ <PrivateRoute> <ProtectedRoute allowedRoles={['admin', 'commercial', 'assistant']}> <ListeBiens/></ProtectedRoute>  </PrivateRoute> }/>

            <Route path="/users" element={ <PrivateRoute> <ProtectedRoute allowedRoles={['admin']}>  <AfficherUtilisateurs /> </ProtectedRoute></PrivateRoute> }/>
            <Route path="/leads" element={<PrivateRoute> <ProtectedRoute allowedRoles={['admin', "commercial","assistant"]}>  <LeadList /></ProtectedRoute> </PrivateRoute> } />
            <Route path="/notifications" element={<PrivateRoute> <ProtectedRoute allowedRoles={['admin', "commercial", "assistant"]}> <NotificationsPage /></ProtectedRoute></PrivateRoute>} />
            <Route path="/leadInfo/:id" element={<PrivateRoute>   <LeadInfo /> </PrivateRoute> } />
          </Route>

          {/* Les routes de sidebar pour le commercial */}
          {/* <Route element={<SidebarCommercial />}>
            <Route path="commercial/" element={<PrivateRoute><ProtectedRoute allowedRoles={['commercial']}> <Dashboard /> </ProtectedRoute> </PrivateRoute>} />
            <Route path="commercial/biens" element={ <PrivateRoute> <ProtectedRoute allowedRoles={['admin', 'commercial']}> <ListeBiens/></ProtectedRoute>  </PrivateRoute> }/> */}
            {/* <Route path="/users" element={ <PrivateRoute> <ProtectedRoute allowedRoles={['admin']}>  <AfficherUtilisateurs /> </ProtectedRoute></PrivateRoute> }/> */}
            {/* <Route path="commercial/leads" element={<PrivateRoute> <ProtectedRoute allowedRoles={['commercial']}>  <LeadList /></ProtectedRoute> </PrivateRoute> } />
            <Route path="commercial/notifications" element={<PrivateRoute> <ProtectedRoute allowedRoles={['commercial']}> <NotificationsPage /></ProtectedRoute></PrivateRoute>} />
          </Route> */}

          <Route path="commercial/lead" element={<PrivateRoute> <ProtectedRoute allowedRoles={['commercial']}>     <LeadsCommercial /> </ProtectedRoute> </PrivateRoute> }/>
          <Route path="/leads_a_rappeler" element={<LeadsARappeler />} />
          <Route path="/leads_non_relancé" element={<NonRelance />} />
          <Route path="/lead_rdv" element={<RDVPlanifie />} />
          <Route path="/lead_opportunité" element={<Opportunité/>}/>
          <Route path="/lead_gagné" element={<Gagne/>}/>
          <Route path="/lead_affecté" element={<Affecté/>}/>
        </Routes>
      </Router>

     
    </>
  )
}

export default App
