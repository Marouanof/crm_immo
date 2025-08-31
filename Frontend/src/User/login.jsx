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
import { useNavigate } from 'react-router-dom';
import { jwtDecode } from 'jwt-decode';
import axios from 'axios';
import { Icon } from '@iconify/react';
import loginBanner from '../../src/assets/authentication-banners/login.png';
import logo from '../assets/logo/elegant-logo.png';
// import ParticlesBackground from '../composents/ParticlesBackground';
import ParticlesBackground from '../composents/ParticlesBackground';
import { Box } from '@mui/material';
import { useDispatch } from 'react-redux';
import { loginSuccess } from '../Redux/authSlice';
import "../assets/styles/login.css";

const Login = () => {
  const apiUrl = import.meta.env.VITE_API_BASE_URL;
  const [formData, setFormData] = useState({
    email: '',
    password: ''
  });

  const [showPassword, setShowPassword] = useState(false);
  const navigate = useNavigate();

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };
  const dispatch = useDispatch();

  const handleClickShowPassword = () => setShowPassword(!showPassword);

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const response = await axios.post(`${apiUrl}/utilisateur/login/`, formData);
      

      const accessToken = response.data.access;
      if (!accessToken) {
        alert('Token non reçu');
        return;
      }

      localStorage.setItem("access_token", accessToken);
      localStorage.setItem("auth_time", Date.now());

      const decode = jwtDecode(accessToken);
      const role = decode.role;
      const id_commercial = decode.utilisateur_id;

      localStorage.setItem('role', role);

      dispatch(loginSuccess({
        token: accessToken,
        user: decode.utilisateur_id,
        role: role,
      }))

      if (role === "admin") {
        localStorage.setItem("id_user", id_commercial);
        navigate('../');
      } else if (role === "commercial") {
        localStorage.setItem("id_user", id_commercial);
        navigate('../');
      } else {
        localStorage.setItem("id_user", id_commercial);
        navigate('../');
      }
    } catch (error) {
      console.log(error?.response?.data);
      alert('Email ou mot de passe incorrect');
    }
  };

  return (
   
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
                    // direction="row"
                    bgcolor="background.paper"
                    // justifyContent="center"
                    // alignItems="center"
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
                        <Typography variant="h3" sx={{ color: '#333333' }}>Login</Typography>

                        <FormControl variant="standard" fullWidth>
                        <InputLabel shrink htmlFor="email" >
                            Email
                        </InputLabel>
                        <TextField
                            // borderRadius={16}
                            name="email"
                            value={formData.email}
                            onChange={handleChange}
                            variant="filled"
                            placeholder="Entrez votre email"
                            id="email"
                            // sx={{
                            //     '& .MuiFilledInput-root': {
                            //     borderRadius: '36px',
                            //     border: '2px',
                            //     },
                            // }}
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
                            Password
                        </InputLabel>
                        <TextField
                            name="password"
                            value={formData.password}
                            onChange={handleChange}
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

                        <Typography variant="body1" alignSelf="flex-end">
                        <Link onClick={() => navigate('../password_oublie')} underline="hover" sx={{ cursor: 'pointer' }}>
                            Mot de passe oublié ?
                        </Link>
                        </Typography>

                        <Button variant="contained" fullWidth type="submit">
                        Se connecter
                        </Button>
                    </Stack>
                    </Stack>

                    {/* <img
                    alt="Login banner"
                    src={loginBanner}
                    style={{
                        width: '50%',
                        display: 'block',
                        objectFit: 'cover',
                        borderRadius: '0 8px 8px 0'
                    }}
                    className="login-banner"
                    /> */}
                </Stack>
            </form>
        {/* </div> */}
        </Stack>
    </Box>
  
  );
};

export default Login;
