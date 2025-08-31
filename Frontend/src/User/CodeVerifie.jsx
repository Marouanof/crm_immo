import React, { useState } from 'react';
import {
  Button,
  FormControl,
  IconButton,
  InputAdornment,
  InputLabel,
  Link,
  Stack,
  TextField,
  Typography,
} from '@mui/material';
import axios from 'axios';
import { Icon } from '@iconify/react';
import loginBanner from '../../src/assets/authentication-banners/login.png';
import logo from '../assets/logo/elegant-logo.png';
// import ParticlesBackground from '../composents/ParticlesBackground';
import ParticlesBackground from '../composents/ParticlesBackground';
import { Box } from '@mui/material';
import { useNavigate } from 'react-router-dom';
import "../assets/styles/login.css";

const CodeVerifie = () => {
    const apiUrl = import.meta.env.VITE_API_BASE_URL;
    const [code, setCode] = useState('');
    const [newPassword, setNewPassword] = useState('');
    const [showPassword, setShowPassword] = useState(false);

    const handleClickShowPassword = () => setShowPassword(!showPassword);

    const navigate = useNavigate();

    const handleSubmit = async (e) => {
        e.preventDefault();
        const email = localStorage.getItem('email'); // ou récupère l'email selon ta logique
        await axios.post(`${apiUrl}/utilisateur/verifieCode/`, {
            email,
            code,
            new_password: newPassword
        }).then((res) =>{
            alert("mot de passe est modifier avec succès");
            navigate('../login');
        })
        .catch((err) => {
            alert('Erreur lors de traitement');
            console.err("Erreur lors de traitement",err.res?.data || err.message);
        })
        ;
        // Ajoute ici la logique de succès ou d'erreur
    };

    return (
        // <form onSubmit={handleSubmit} className="container mt-5 p-4 border rounded shadow bg-light">
        //     <h2>Vérification du code</h2>
        //     <div>
        //         <label>Code reçu par email</label>
        //         <input type="text" value={code} onChange={e => setCode(e.target.value)} required />
        //     </div>
        //     <div>
        //         <label>Nouveau mot de passe</label>
        //         <input type="password" value={newPassword} onChange={e => setNewPassword(e.target.value)} required />
        //     </div>
        //     <button className="btn btn-success">Valider</button>
        // </form>
        // <div style={{ position: 'relative', height: '100vh', overflow: 'hidden' }}>
    <Box position="relative" height="100vh" overflow="hidden">
        <ParticlesBackground />
    

  
        {/* <div style={{ position: 'relative', zIndex: 1, height: '100%' }}> */}
        <Stack
            position="relative"
            zIndex={1}
            height="100%"
            justifyContent="center"
            alignItems="center"
        >
            <form onSubmit={handleSubmit}>
                <Stack
                    bgcolor="background.paper"
                    
                    boxShadow={(theme) => theme.shadows[3]}
                    height={560}
                    width={{ md: 420, xs: '90%' }}
                    borderRadius={2}
                    m="auto"
                    mt={5}
                    p={3}
                    className="stack-global"
                >
                    <Stack width={{ md: 0.5 }} m={2.5} gap={6}>
                    <Box display="flex" justifyContent="center" width={{ md: 340}}>
                        <Link href="#" width="fit-content" style={{ alignItems: "center"}}>
                        <img src={logo} alt="logo" width={100} />
                    </Link>
                    </Box>
                    
                    <Stack alignItems="center" gap={2.5} width={330} mx="auto" className="stack-login">
                        <Typography variant="h3" sx={{ color: '#333333' }}>Modifier mot de passe</Typography>

                        <FormControl variant="standard" fullWidth>
                        <InputLabel shrink htmlFor="code" >
                            Code
                        </InputLabel>
                        <TextField
                            name="code"
                            onChange={e => setCode(e.target.value)}
                            variant="filled"
                            placeholder="Entrez le code reçu par email"
                            id="code"
                            
                            InputProps={{
                                endAdornment: (
                                    <InputAdornment position="end">
                                    <Icon icon="ic:baseline-email" />
                                    </InputAdornment>
                                ),
                            }}
                        />
                        </FormControl>

                        <FormControl variant="standard" fullWidth>
                        <InputLabel shrink htmlFor="password">
                            Nouveau mot de passe
                        </InputLabel>
                        <TextField
                            name="password"
                            // value={formData.password}
                            onChange={e => setNewPassword(e.target.value)}
                            variant="filled"
                            placeholder="********"
                            type={showPassword ? 'text' : 'password'}
                            id="password"
                            InputProps={{
                                endAdornment: (
                                    <InputAdornment position="end">
                                    <IconButton onClick={handleClickShowPassword} edge="end">
                                        <Icon icon={showPassword ? 'ic:baseline-key-off' : 'ic:baseline-key'} style={{ color: '#333', backgroundColor: 'none'}}/>
                                    </IconButton>
                                    </InputAdornment>
                                ),
                            }}
                        />
                        </FormControl>

                      

                        <Button variant="contained" fullWidth type="submit">
                            Valider
                        </Button>
                    </Stack>
                    </Stack>
                </Stack>
            </form>
        </Stack>
    </Box>
    );
};

export default CodeVerifie;