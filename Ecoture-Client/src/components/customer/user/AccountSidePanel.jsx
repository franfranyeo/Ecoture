/* eslint-disable react/prop-types */
import {
  Avatar,
  Box,
  Divider,
  List,
  ListItem,
  ListItemText,
  Paper,
  Typography,
} from "@mui/material";
import { useEffect } from "react";
import { useNavigate } from "react-router-dom";

const AccountSidePanel = ({ user, selected, setSelected }) => {
  const navigate = useNavigate();

  const menuItems = ["Profile", "Membership", "Security", "Notifications"];
  const handleNavigation = (text) => {
    navigate(`/account/${text.toLowerCase()}`);
  };

  useEffect(() => {
    const currentPath = window.location.pathname;
    const lastPart = currentPath.split("/").pop();
    setSelected(lastPart.charAt(0).toUpperCase() + lastPart.slice(1));
  });

  return (
    <Paper
      elevation={2}
      sx={{
        width: "300px",
        padding: 3,
        borderRadius: 2,
        height: "fit-content",
        position: "sticky",
        top: "20px",
      }}
    >
      <Box display="flex" flexDirection="column" alignItems="center" mb={4}>
        {user.pfpURL ? (
          <img
            src={user.pfpURL}
            alt="User Avatar"
            style={{
              width: 100,
              height: 100,
              borderRadius: "50%",
            }}
          />
        ) : (
          <Avatar sx={{ width: 80, height: 80 }} />
        )}
        <Typography variant="h6" sx={{ mt: 2 }}>
          {user.fullName}
        </Typography>
        <Typography variant="body2" color="textSecondary">
          {user.email}
        </Typography>
      </Box>
      <Divider />
      <Box mt={4}>
        <List>
          {menuItems.map((text, index) => (
            <ListItem
              key={index}
              onClick={() => handleNavigation(text)}
              sx={{
                borderRadius: 1,
                mb: 1,
                backgroundColor:
                  selected === text ? "primary.main" : "transparent",
                "&:hover": {
                  backgroundColor: "primary.light",
                  cursor: "pointer",
                  "& .MuiTypography-root": {
                    color: "white",
                  },
                },
              }}
            >
              <ListItemText
                primary={text}
                sx={{
                  color: selected === text ? "white" : "black",
                  "&:hover": {
                    color: "white",
                  },
                }}
              />
            </ListItem>
          ))}
        </List>
      </Box>
    </Paper>
  );
};

export default AccountSidePanel;
