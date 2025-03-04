import { useContext, useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import http from 'utils/http';

import {
  Clear,
  Delete,
  Edit,
  FilterList,
  Search,
  Sort,
  Visibility,
} from '@mui/icons-material';
import {
  Box,
  Button,
  Chip,
  CircularProgress,
  Dialog,
  DialogActions,
  DialogContent,
  DialogContentText,
  DialogTitle,
  IconButton,
  Input,
  InputAdornment,
  Menu,
  MenuItem,
  Pagination,
  Paper,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Tooltip,
  Typography,
} from '@mui/material';

import UserContext from 'contexts/UserContext';

// Constants
const ROLES = ['All Roles', 'Admin', 'Staff', 'Customer'];
const MEMBERSHIPS = ['All Memberships', 'Gold', 'Silver', 'Bronze'];
const SORT_OPTIONS = ['Default', 'Newest', 'Oldest', 'Alphabetical'];

const Users = () => {
  const [users, setUsers] = useState([]);
  const [filteredUsers, setFilteredUsers] = useState([]);
  const [userId, setUserId] = useState(null);
  const [filterRole, setFilterRole] = useState('');
  const [filterMembership, setFilterMembership] = useState('');
  const [sortOrder, setSortOrder] = useState('default');
  const [open, setOpen] = useState(false);
  const [anchorElRole, setAnchorElRole] = useState(null);
  const [anchorElSort, setAnchorElSort] = useState(null);
  const [anchorElMembership, setAnchorElMembership] = useState(null);
  const [search, setSearch] = useState('');
  const [loading, setLoading] = useState(true);
  const [currentPage, setCurrentPage] = useState(1);
  const { user: loggedInUser } = useContext(UserContext);
  const usersPerPage = 10;

  useEffect(() => {
    const fetchUsers = async () => {
      try {
        const response = await http.get('/user');
        setUsers(response.data);
        setFilteredUsers(response.data);
      } catch (error) {
        console.error('Error fetching users:', error);
        toast.error('Failed to fetch users');
      } finally {
        setLoading(false);
      }
    };
    fetchUsers();
  }, []);

  useEffect(() => {
    applyFilters();
  }, [filterRole, filterMembership, sortOrder, search, users]);

  const handleDelete = (id) => {
    setUserId(id);
    setOpen(true);
  };

  const handleClose = () => {
    setOpen(false);
    setUserId(null);
  };

  const deleteUser = async () => {
    if (userId) {
      try {
        await http.delete(`/user/${userId}`);
        setUsers(users.filter((user) => user.userId !== userId));
        toast.success('User deleted successfully');
      } catch (error) {
        console.error('Error deleting user:', error);
        toast.error('Failed to delete user');
      } finally {
        setOpen(false);
        setUserId(null);
      }
    }
  };

  const applyFilters = () => {
    let updatedUsers = [...users];

    if (filterRole) {
      updatedUsers = updatedUsers.filter((user) => user.role === filterRole);
    }

    if (filterMembership) {
      updatedUsers = updatedUsers.filter(
        (user) => user.membershipTier === filterMembership
      );
    }

    if (search) {
      updatedUsers = updatedUsers.filter(
        (user) =>
          user.firstName.toLowerCase().includes(search.toLowerCase()) ||
          user.lastName.toLowerCase().includes(search.toLowerCase()) ||
          user.email.toLowerCase().includes(search.toLowerCase())
      );
    }

    switch (sortOrder) {
      case 'newest':
        updatedUsers.sort(
          (a, b) => new Date(b.createdAt) - new Date(a.createdAt)
        );
        break;
      case 'oldest':
        updatedUsers.sort(
          (a, b) => new Date(a.createdAt) - new Date(b.createdAt)
        );
        break;
      case 'alphabetical':
        updatedUsers.sort((a, b) => a.firstName.localeCompare(b.firstName));
        break;
      case 'default':
      default:
        updatedUsers.sort((a, b) => a.id - b.id);
        break;
    }

    setFilteredUsers(updatedUsers);
  };

  const handleRoleFilterClick = (event) => {
    setAnchorElRole(event.currentTarget);
  };

  const handleMembershipFilterClick = (event) => {
    setAnchorElMembership(event.currentTarget);
  };

  const handleSortFilterClick = (event) => {
    setAnchorElSort(event.currentTarget);
  };

  const handleFilterClose = () => {
    setAnchorElRole(null);
    setAnchorElSort(null);
    setAnchorElMembership(null);
  };

  const handleFilterChange = (value, type) => {
    if (type === 'role') {
      setFilterRole(value);
    } else if (type === 'membership') {
      setFilterMembership(value);
    } else if (type === 'sort') {
      setSortOrder(value);
    }
    handleFilterClose();
  };

  const onSearchChange = (e) => {
    setSearch(e.target.value);
  };

  const onClickClear = () => {
    setSearch('');
    applyFilters();
  };

  const handlePageChange = (event, value) => {
    setCurrentPage(value);
  };

  const getMembershipStyle = (membershipType) => {
    switch (membershipType) {
      case 'Gold':
        return { backgroundColor: '#FFC107', color: '#000' };
      case 'Silver':
        return { backgroundColor: '#C0C0C0', color: '#000' };
      case 'Bronze':
        return { backgroundColor: '#CD7F32', color: '#000' };
      default:
        return { backgroundColor: '#E0E0E0', color: '#000' };
    }
  };

  const getRoleStyle = (role) => {
    switch (role) {
      case 'Admin':
        return { backgroundColor: '#D32F2F', color: '#fff' };
      case 'Staff':
        return { backgroundColor: '#388E3C', color: '#fff' };
      case 'Customer':
        return { backgroundColor: '#FFEB3B', color: '#000' };
      default:
        return {};
    }
  };

  const indexOfLastUser = currentPage * usersPerPage;
  const indexOfFirstUser = indexOfLastUser - usersPerPage;
  const currentUsers = filteredUsers.slice(indexOfFirstUser, indexOfLastUser);

  return (
    <>
      <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
        <Typography variant="h4">Users</Typography>

        {loggedInUser.role === 'Admin' && (
          <Button
            variant="contained"
            color="primary"
            component={Link}
            to="/admin/users/add"
            sx={{ mb: 2 }}
          >
            Add User
          </Button>
        )}
      </Box>
      <Box
        sx={{
          minHeight: '100vh',
          py: 3,
          borderRadius: '8px',
        }}
      >
        <Box
          sx={{
            display: 'flex',
            alignItems: 'center',
            flexDirection: { xs: 'column', md: 'row' },
            justifyContent: 'space-between',
            mb: 2,
          }}
        >
          <Box sx={{ display: 'flex', alignItems: 'center' }}>
            {/* Search Bar */}
            <Input
              value={search}
              onChange={onSearchChange}
              placeholder="Search users..."
              startAdornment={
                <InputAdornment position="start">
                  <Search />
                </InputAdornment>
              }
              endAdornment={
                search && (
                  <InputAdornment position="end">
                    <IconButton onClick={onClickClear}>
                      <Clear />
                    </IconButton>
                  </InputAdornment>
                )
              }
              sx={{
                mr: 2,
                width: '300px',
                borderBottom: '1px solid gray',
              }}
            />
          </Box>

          <Box sx={{ display: 'flex', alignItems: 'center' }}>
            <Box
              sx={{
                display: 'flex',
                alignItems: 'center',
                mr: 2,
              }}
            >
              <Typography variant="body1" sx={{ mr: 1 }}>
                Role:
              </Typography>
              <IconButton onClick={handleRoleFilterClick}>
                <FilterList />
              </IconButton>
              <Menu
                anchorEl={anchorElRole}
                open={Boolean(anchorElRole)}
                onClose={handleFilterClose}
              >
                {ROLES.map((role) => (
                  <MenuItem
                    key={role}
                    onClick={() =>
                      handleFilterChange(
                        role === 'All Roles' ? '' : role,
                        'role'
                      )
                    }
                  >
                    {role}
                  </MenuItem>
                ))}
              </Menu>
            </Box>

            <Box
              sx={{
                display: 'flex',
                alignItems: 'center',
                ml: 2,
              }}
            >
              <Typography variant="body1" sx={{ mr: 1 }}>
                Membership:
              </Typography>
              <IconButton onClick={handleMembershipFilterClick}>
                <FilterList />
              </IconButton>
              <Menu
                anchorEl={anchorElMembership}
                open={Boolean(anchorElMembership)}
                onClose={handleFilterClose}
              >
                {MEMBERSHIPS.map((membership) => (
                  <MenuItem
                    key={membership}
                    onClick={() =>
                      handleFilterChange(
                        membership === 'All Memberships' ? '' : membership,
                        'membership'
                      )
                    }
                  >
                    {membership}
                  </MenuItem>
                ))}
              </Menu>
            </Box>

            <Box
              sx={{
                display: 'flex',
                alignItems: 'center',
                ml: 2,
              }}
            >
              <Typography variant="body1" sx={{ mr: 1 }}>
                Sort:
              </Typography>
              <IconButton onClick={handleSortFilterClick}>
                <Sort />
              </IconButton>
              <Menu
                anchorEl={anchorElSort}
                open={Boolean(anchorElSort)}
                onClose={handleFilterClose}
              >
                {SORT_OPTIONS.map((option) => (
                  <MenuItem
                    key={option}
                    onClick={() =>
                      handleFilterChange(option.toLowerCase(), 'sort')
                    }
                  >
                    {option}
                  </MenuItem>
                ))}
              </Menu>
            </Box>
          </Box>
        </Box>

        <Box sx={{ display: 'flex', flexWrap: 'wrap', mb: 2 }}>
          {filterRole && (
            <Chip
              label={`Role: ${filterRole}`}
              onDelete={() => setFilterRole('')}
              sx={{ mb: 1, mr: 1 }}
            />
          )}
          {filterMembership && (
            <Chip
              label={`Membership: ${filterMembership}`}
              onDelete={() => setFilterMembership('')}
              sx={{ mb: 1, mr: 1 }}
            />
          )}
          {sortOrder !== 'default' && (
            <Chip
              label={`Sort: ${sortOrder}`}
              onDelete={() => setSortOrder('default')}
              sx={{ mb: 1, mr: 1 }}
            />
          )}
        </Box>

        {loading ? (
          <Box
            sx={{
              display: 'flex',
              justifyContent: 'center',
              mt: 4,
            }}
          >
            <CircularProgress />
          </Box>
        ) : filteredUsers.length === 0 ? (
          <Typography variant="body1" sx={{ textAlign: 'center', mt: 4 }}>
            No users found.
          </Typography>
        ) : (
          <>
            <TableContainer component={Paper}>
              <Table>
                <TableHead>
                  <TableRow>
                    <TableCell>
                      <strong>User ID</strong>
                    </TableCell>
                    <TableCell>
                      <strong>Full Name</strong>
                    </TableCell>
                    <TableCell>
                      <strong>Email</strong>
                    </TableCell>
                    <TableCell>
                      <strong>Mobile Number</strong>
                    </TableCell>
                    <TableCell>
                      <strong>Role</strong>
                    </TableCell>
                    <TableCell>
                      <strong>Membership</strong>
                    </TableCell>
                    <TableCell>
                      <strong>Actions</strong>
                    </TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {currentUsers.map((user) => (
                    <TableRow key={user.userId}>
                      <TableCell>{user.userId}</TableCell>
                      <TableCell>{user.fullName}</TableCell>
                      <TableCell>{user.email}</TableCell>
                      <TableCell>{user.mobileNo || 'N/A'}</TableCell>
                      <TableCell>
                        <Box
                          sx={{
                            ...getRoleStyle(user.role),
                            padding: '4px 12px',
                            borderRadius: '5px',
                            textAlign: 'center',
                          }}
                        >
                          {user.role}
                        </Box>
                      </TableCell>
                      <TableCell>
                        <Box
                          sx={{
                            ...getMembershipStyle(
                              user.membershipTier ? user.membershipTier : ''
                            ),
                            padding: '4px 12px',
                            borderRadius: '5px',
                            textAlign: 'center',
                          }}
                        >
                          {user.membershipTier && user.membershipTier != 'None'
                            ? user.membershipTier
                            : 'N/A'}
                        </Box>
                      </TableCell>
                      <TableCell
                        sx={{
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                        }}
                      >
                        <Link to={`/admin/users/${user.userId}/view`}>
                          <Tooltip title="View Details">
                            <IconButton
                              color="secondary"
                              sx={{
                                padding: '4px',
                              }}
                            >
                              <Visibility />
                            </IconButton>
                          </Tooltip>
                        </Link>
                        {
                          // Render the edit button for all users except when the user is an admin and the logged-in user is staff
                          !(
                            (user.role === 'Admin' &&
                              loggedInUser.role === 'Staff') ||
                            (user.role === 'Staff' &&
                              loggedInUser.role === 'Staff')
                          ) && (
                            <Link to={`/admin/users/${user.userId}/edit`}>
                              <Tooltip title="Edit User">
                                <IconButton
                                  color="secondary"
                                  sx={{
                                    padding: '4px',
                                  }}
                                >
                                  <Edit />
                                </IconButton>
                              </Tooltip>
                            </Link>
                          )
                        }
                        {!(
                          (user.role === 'Admin' &&
                            loggedInUser.role === 'Staff') ||
                          (user.role === 'Staff' &&
                            loggedInUser.role === 'Staff')
                        ) && (
                          <Tooltip title="Delete User">
                            <IconButton
                              color="error"
                              sx={{
                                padding: '4px',
                              }}
                              onClick={() => handleDelete(user.userId)}
                            >
                              <Delete />
                            </IconButton>
                          </Tooltip>
                        )}
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </TableContainer>

            <Box
              sx={{
                display: 'flex',
                justifyContent: 'center',
                mt: 3,
              }}
            >
              <Pagination
                count={Math.ceil(filteredUsers.length / usersPerPage)}
                page={currentPage}
                onChange={handlePageChange}
                color="primary"
              />
            </Box>
          </>
        )}

        <Dialog
          open={open}
          onClose={handleClose}
          aria-labelledby="alert-dialog-title"
          aria-describedby="alert-dialog-description"
        >
          <DialogTitle
            id="alert-dialog-title"
            sx={{ color: '#e2160f', fontWeight: 'bold' }}
          >
            {'Confirm Delete'}
          </DialogTitle>
          <DialogContent>
            <DialogContentText id="alert-dialog-description" sx={{ mb: 2 }}>
              Are you sure you want to delete this user? This action cannot be
              undone.
            </DialogContentText>
          </DialogContent>
          <DialogActions>
            <Button onClick={handleClose} color="primary" variant="outlined">
              Cancel
            </Button>
            <Button
              onClick={deleteUser}
              color="error"
              autoFocus
              variant="contained"
            >
              Delete
            </Button>
          </DialogActions>
        </Dialog>
      </Box>
    </>
  );
};

export default Users;
