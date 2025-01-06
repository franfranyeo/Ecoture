import {
    Container,
    AppBar,
    Toolbar,
    Typography,
    ThemeProvider
} from '@mui/material';
import { BrowserRouter as Router, Routes, Route, Link } from 'react-router-dom';
import theme from './themes/MyTheme';
import './App.css';
import Login from './pages/user/Login';
import Home from './pages/Home';
import Register from './pages/user/Register';
import TermsOfUse from './pages/user/TermsOfUse';
import PrivacyPolicy from './pages/user/PrivacyPolicy';
import { GoogleOAuthProvider } from '@react-oauth/google';

function App() {
    const routes = [];

    return (
        <GoogleOAuthProvider clientId="<your_client_id>">
            <Router>
                <ThemeProvider theme={theme}>
                    <Routes>
                        <Route path="/" element={<Home />} />
                        <Route path="/login" element={<Login />} />
                        <Route path="/register" element={<Register />} />
                        <Route path="/terms-of-use" element={<TermsOfUse />} />
                        <Route
                            path="/privacy-policy"
                            element={<PrivacyPolicy />}
                        />
                    </Routes>
                </ThemeProvider>
            </Router>
        </GoogleOAuthProvider>
    );
}

export default App;
