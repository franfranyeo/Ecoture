// nav bar

import React from 'react';
import { AppBar, Toolbar, Typography, Button } from '@mui/material';
import { Link } from 'react-router-dom';

export default function Navbar() {
    return (
        <AppBar position="static">
            <Toolbar>
                <Typography variant="h6" component="div" sx={{ flexGrow: 1 }}>
                    <Link to="/" style={{ color: 'white', textDecoration: 'none' }}>
                        MUI App
                    </Link>
                </Typography>
                <Button color="inherit" component={Link} to="/login">Login</Button>
            </Toolbar>
        </AppBar>
    );
}

