import React, { useContext, useEffect, useState } from 'react';
import { Link, useLocation } from 'react-router-dom';

import {
  ChevronLeft,
  ChevronRight,
  ExpandLess,
  ExpandMore,
} from '@mui/icons-material';
import {
  Box,
  Button,
  Collapse,
  Divider,
  List,
  ListItem,
  ListItemText,
  Tooltip,
} from '@mui/material';

// Icons for the sidebar options
import dashboardIcon from 'assets/icons/dashboard.svg';
import rewardsIcon from 'assets/icons/rewards.svg';
import usersIcon from 'assets/icons/users.svg';
import UserContext from 'contexts/UserContext';

// Sidebar menu options
const sideMenuOptions = [
  {
    name: 'Dashboard',
    icon: dashboardIcon,
    path: '/admin/dashboard',
  },
  {
    name: 'Users',
    icon: usersIcon,
    path: '/admin/users',
  },
  {
    name: 'Rewards',
    icon: rewardsIcon,
    path: '/admin/rewards',
  },
  {
    name: 'Products',
    icon: usersIcon,
    path: '/admin/products',
  },
  {
    name: 'Enquiries',
    icon: usersIcon,
    path: '/admin/enquiries',
  },
  // Ahmed refund HERE IS WHERE I WANT TO ADD THE REFUND APPROVAL
  {
    name: "Refund Approval",
    icon: usersIcon,
    path: "/admin/refund-approval",
  },
  {
    name: 'Live Chat',
    icon: usersIcon,
    path: '/admin/livechat',
  },
];

function Sidebar() {
  const { user } = useContext(UserContext);
  const location = useLocation();
  const [isMinimized, setIsMinimized] = useState(() => {
    const storedState = localStorage.getItem('snMinimized');
    return storedState ? JSON.parse(storedState) : false;
  });

  useEffect(() => {
    localStorage.setItem('snMinimized', JSON.stringify(isMinimized));
  }, [isMinimized]);

  const [open, setOpen] = useState({});

  const handleClick = (name) => {
    setOpen((prevOpen) => ({
      ...prevOpen,
      [name]: !prevOpen[name],
    }));
  };

  const isActive = (path) => location.pathname == path;

  const isParentActive = (subOptions) =>
    subOptions && subOptions.some((subOption) => isActive(subOption.path));

  return (
    <Box
      sx={{
        px: 1.5,
        borderRight: '1px solid lightgrey',
        width: isMinimized ? 60 : '35%',
        maxWidth: isMinimized ? 60 : 290,
        transition: 'all 0.3s ease',
      }}
    >
      <List>
        <ListItem
          sx={{
            display: 'flex',
            gap: '30px',
            my: 1,
            alignItems: 'center',
          }}
        >
          <Box
            component="a"
            onClick={() => setIsMinimized(!isMinimized)}
            sx={{ ':hover': { cursor: 'pointer' } }}
          >
            {isMinimized ? <ChevronRight /> : <ChevronLeft />}
          </Box>
          <ListItemText
            primary={`Welcome, ${user.fullName}`}
            sx={{
              whiteSpace: 'nowrap',
              opacity: isMinimized ? 0 : 1,
              visibility: isMinimized ? 'hidden' : 'visible',
              transition: 'opacity 0.1s ease-in-out, visibility 0s linear 0.1s',
            }}
          />
        </ListItem>
        <Divider />
        {sideMenuOptions.map((option) => (
          <React.Fragment key={option.name}>
            <ListItem
              onClick={() => option.subOptions && handleClick(option.name)}
              sx={{
                my: 1,
                borderRadius: 1,
                backgroundColor: isActive(option.path)
                  ? 'primary.main'
                  : 'transparent',
                // || isParentActive(option.subOptions)
                '&:hover': {
                  backgroundColor: 'primary.light',
                  cursor: 'pointer',
                  '& .MuiTypography-root, a, img': {
                    color: 'white',
                    filter: 'brightness(0) invert(1)',
                  },
                },
              }}
            >
              {!option.subOptions ? (
                <Link
                  to={option.path}
                  style={{
                    textDecoration: 'none',
                    display: 'flex',
                    gap: '30px',
                    color: isActive(option.path) ? 'white' : 'black',
                    width: '100%',
                    alignItems: 'center',
                    whiteSpace: 'nowrap',
                  }}
                >
                  <Box
                    sx={{
                      display: 'flex',
                      gap: '30px',
                      width: '100%',
                      alignItems: 'center',
                      whiteSpace: 'nowrap',
                    }}
                  >
                    <Tooltip title={option.name}>
                      <Box
                        component="img"
                        src={option.icon}
                        alt={option.name}
                        width={26}
                        height={26}
                        sx={{
                          filter: isActive(option.path)
                            ? 'brightness(0) invert(1)'
                            : 'none',
                          transition: 'filter 0.3s ease',
                        }}
                      />
                    </Tooltip>
                    <ListItemText
                      primary={option.name}
                      sx={{
                        opacity: isMinimized ? 0 : 1,
                        visibility: isMinimized ? 'hidden' : 'visible',
                        transition:
                          'opacity 0.1s ease-in-out, visibility 0s linear 0.1s',
                        '& .MuiTypography-root': {
                          color: isActive(option.path) ? 'white' : 'inherit',
                        },
                      }}
                    />
                  </Box>
                </Link>
              ) : (
                <Box
                  sx={{
                    display: 'flex',
                    gap: '30px',
                    width: '100%',
                    alignItems: 'center',
                    whiteSpace: 'nowrap',
                    cursor: 'pointer',
                  }}
                >
                  <Tooltip title={option.name}>
                    <Box
                      component="img"
                      src={option.icon}
                      alt={option.name}
                      width={26}
                      height={26}
                      sx={{
                        filter: isParentActive(option.subOptions)
                          ? 'brightness(0) invert(1)'
                          : 'none',
                        transition: 'filter 0.3s ease',
                      }}
                    />
                  </Tooltip>
                  <ListItemText
                    primary={option.name}
                    sx={{
                      opacity: isMinimized ? 0 : 1,
                      visibility: isMinimized ? 'hidden' : 'visible',
                      transition:
                        'opacity 0.1s ease-in-out, visibility 0s linear 0.1s',
                      '& .MuiTypography-root': {
                        color: isParentActive(option.subOptions)
                          ? 'white'
                          : 'inherit',
                      },
                    }}
                  />
                  {option.subOptions && !isMinimized && (
                    <Box
                      sx={{
                        color: isParentActive(option.subOptions)
                          ? 'white'
                          : 'inherit',
                      }}
                    >
                      {open[option.name] ? <ExpandLess /> : <ExpandMore />}
                    </Box>
                  )}
                </Box>
              )}
            </ListItem>
            {option.subOptions && (
              <Collapse in={open[option.name]} timeout="auto" unmountOnExit>
                <List component="div" disablePadding>
                  {option.subOptions
                    .filter(
                      (subOption) =>
                        !subOption.adminOnly || (user && user.role === 'Admin')
                    )
                    .map((subOption) => (
                      <ListItem
                        key={subOption.name}
                        sx={{
                          pl: 4,
                          my: 1,
                          borderRadius: 1,
                          backgroundColor: isActive(subOption.path)
                            ? 'primary.main'
                            : 'transparent',
                          '&:hover': {
                            backgroundColor: 'primary.light',
                            cursor: 'pointer',
                            '& .MuiTypography-root, a': {
                              color: 'white',
                            },
                          },
                        }}
                      >
                        <Link
                          to={subOption.path}
                          style={{
                            textDecoration: 'none',
                            display: 'flex',
                            gap: '30px',
                            color: isActive(subOption.path) ? 'white' : 'black',
                            width: '100%',
                            alignItems: 'center',
                            whiteSpace: 'nowrap',
                          }}
                        >
                          <ListItemText
                            primary={subOption.name}
                            sx={{
                              opacity: isMinimized ? 0 : 1,
                              visibility: isMinimized ? 'hidden' : 'visible',
                              transition:
                                'opacity 0.1s ease-in-out, visibility 0s linear 0.1s',
                              '& .MuiTypography-root': {
                                color: isActive(subOption.path)
                                  ? 'white'
                                  : 'inherit',
                              },
                            }}
                          />
                        </Link>
                      </ListItem>
                    ))}
                </List>
              </Collapse>
            )}
          </React.Fragment>
        ))}
      </List>
    </Box>
  );
}

export default Sidebar;
