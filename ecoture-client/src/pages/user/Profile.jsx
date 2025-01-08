import React, { useState } from 'react';
import { Avatar, Grid, Paper, Typography, IconButton, Divider, Box, ListItem, ListItemText, List } from '@mui/material';
import EditIcon from '@mui/icons-material/Edit';

const Profile = () => {
  const [selected, setSelected] = useState('Dashboard');

  const menuItems = ['Profile', 'Membership', 'Security', 'Notifications'];
  const handleNavigation = (text) => {
    setSelected(text);
    console.log(`Navigating to /${text.toLowerCase()}`);
  };

  return (
    <Box sx={{ backgroundColor: '#f4f4f4', padding: 5 }}>
      <Typography variant="h4" gutterBottom>
        Account
      </Typography>
      <Box sx={{ flex: 1, display: 'flex', gap: 5 }}>
        <Paper
          elevation={2}
          sx={{
            width: '300px',
            padding: 3,
            borderRadius: 2,
          }}
        >
          <Box display="flex" flexDirection="column" alignItems="center" mb={4}>
            <Avatar sx={{ width: 100, height: 100, mb: 2 }} />
            <Typography variant="h6">Username</Typography>
            <Typography variant="body2" color="textSecondary">
              user@example.com
            </Typography>
          </Box>
          <Divider />
          <Box mt={4}>
            <List>
              {menuItems.map((text, index) => (
                <ListItem
                  key={index}
                  button
                  onClick={() => handleNavigation(text)}
                  sx={{
                    borderRadius: 1,
                    mb: 1,
                    backgroundColor: selected === text ? 'primary.light' : 'transparent',
                    '&:hover': {
                      backgroundColor: 'primary.light',
                      cursor: 'pointer'
                    },
                  }}
                >
                  <ListItemText
                    primary={text}
                    primaryTypographyProps={{
                      fontWeight: selected === text ? 'bold' : 'normal',
                    }}
                  />
                </ListItem>
              ))}
            </List>
          </Box>
        </Paper>
        <Box sx={{ flex: 1 }}>
          <Paper elevation={2} sx={{ padding: 4 }}>
            <Box display="flex" justifyContent="space-between" alignItems="center">
              <Typography variant="h5">Profile</Typography>
              <IconButton>
                <EditIcon />
              </IconButton>
            </Box>
            <Box display={"flex"} flexDirection={"row"} gap={3} mb={4} mt={2}>
              <Avatar sx={{ width: 80, height: 80 }} />
              <Box>
                <Typography variant="h6">Username</Typography>
                <Typography variant="body2" color="textSecondary">
                  email@gmail.com
                </Typography>
              </Box>
            </Box>

            <Divider sx={{ my: 2 }} />

            {/* Personal Information Section */}
            <Typography variant="h6" gutterBottom>
              Personal Information
            </Typography>
            <Grid container spacing={2}>
              <Grid item xs={6}>
                <Typography variant="body1">Name: John Doe</Typography>
              </Grid>
              <Grid item xs={6}>
                <Typography variant="body1">Email: john@example.com</Typography>
              </Grid>
              <Grid item xs={6}>
                <Typography variant="body1">Phone: +1234567890</Typography>
              </Grid>
              <Grid item xs={6}>
                <Typography variant="body1">Date of Birth: 01/01/1990</Typography>
              </Grid>
            </Grid>

            <Divider sx={{ my: 2 }} />

            {/* Delivery Address Section */}
            <Typography variant="h6" gutterBottom>
              Delivery Address
            </Typography>
            <Typography variant="body1">123 Main Street, City, Country</Typography>
            <Typography variant="body1">Postal Code: 123456</Typography>
          </Paper>
        </Box>
      </Box>
    </Box>
  );
};

export default Profile;
