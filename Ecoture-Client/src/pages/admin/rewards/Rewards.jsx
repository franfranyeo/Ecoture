import React, { useContext, useEffect, useState } from "react";
import {
  Box,
  Typography,
  TableContainer,
  Table,
  TableHead,
  TableRow,
  TableCell,
  TableBody,
  Paper,
  IconButton,
  Tooltip,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogContentText,
  DialogActions,
  Button,
  Menu,
  MenuItem,
  Input,
  Chip,
  InputAdornment,
  CircularProgress,
  Pagination,
} from "@mui/material";
import {
  Sort,
  FilterList,
  Visibility,
  Edit,
  Delete,
  Search,
  Clear,
} from "@mui/icons-material";
import { Link } from "react-router-dom";
import { toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import http from "utils/http";
import UserContext from "contexts/UserContext";

// Constants
const ROLES = ["All Roles", "Admin", "Staff", "Customer"];
const REWARD_TYPES = ["All Vouchers", "Type 1", "Type 2", "Type"];
const SORT_OPTIONS = ["Default", "Newest", "Oldest", "Alphabetical"];

const Rewards = () => {
  const [rewards, setRewards] = useState([]);
  const [filteredRewards, setFilteredRewards] = useState([]);
  const [rewardId, setRewardId] = useState(null);
  const [filterRewardType, setFilterRewardType] = useState("");
  const [sortOrder, setSortOrder] = useState("default");
  const [open, setOpen] = useState(false);
  const [anchorElSort, setAnchorElSort] = useState(null);
  const [anchorElRewardType, setAnchorElRewardType] = useState(null);
  const [search, setSearch] = useState("");
  const [loading, setLoading] = useState(true);
  const [currentPage, setCurrentPage] = useState(1);
  const { user: loggedInUser } = useContext(UserContext);
  const rewardsPerPage = 10;

  useEffect(() => {
    const fetchRewards = async () => {
      try {
        const response = await http.get("/rewards");
        const cleanedReward = response.data;
        setRewards(cleanedReward);
        setFilteredRewards(cleanedReward);
      } catch (error) {
        console.error("Error fetching rewards:", error);
        toast.error("Failed to fetch rewards");
      } finally {
        setLoading(false);
      }
    };
    fetchRewards();
  }, []);

  useEffect(() => {
    applyFilters();
  }, [filterRewardType, sortOrder, search, rewards]);

  const handleDelete = (id) => {
    setRewardId(id);
    setOpen(true);
  };

  const handleClose = () => {
    setOpen(false);
    setRewardId(null);
  };

  const deleteUser = async () => {
    console.log("Deleting user:", rewardId);
    if (rewardId) {
      try {
        await http.delete(`/rewards/${rewardId}`);
        setRewards(rewards.filter((user) => user.rewardId !== rewardId));
        toast.success("User deleted successfully");
      } catch (error) {
        console.error("Error deleting user:", error);
        toast.error("Failed to delete user");
      } finally {
        setOpen(false);
        setRewardId(null);
      }
    }
  };

  const applyFilters = () => {
    let updatedRewards = [...rewards];

    if (filterRewardType) {
      updatedRewards = updatedRewards.filter(
        (reward) => reward.rewardType === filterRewardType
      );
    }

    if (search) {
      updatedRewards = updatedRewards.filter(
        (reward) =>
          reward.title.toLowerCase().includes(search.toLowerCase()) ||
          reward.description.toLowerCase().includes(search.toLowerCase())
      );
    }

    switch (sortOrder) {
      case "newest":
        updatedRewards.sort(
          (a, b) => new Date(b.createdAt) - new Date(a.createdAt)
        );
        break;
      case "oldest":
        updatedRewards.sort(
          (a, b) => new Date(a.createdAt) - new Date(b.createdAt)
        );
        break;
      case "alphabetical":
        updatedRewards.sort((a, b) => a.firstName.localeCompare(b.firstName));
        break;
      case "default":
      default:
        updatedRewards.sort((a, b) => a.id - b.id);
        break;
    }

    setFilteredRewards(updatedRewards);
  };

  const handleMembershipFilterClick = (event) => {
    setAnchorElRewardType(event.currentTarget);
  };

  const handleSortFilterClick = (event) => {
    setAnchorElSort(event.currentTarget);
  };

  const handleFilterClose = () => {
    setAnchorElSort(null);
    setAnchorElRewardType(null);
  };

  const handleFilterChange = (value, type) => {
    if (type === "membership") {
      setFilterRewardType(value);
    } else if (type === "sort") {
      setSortOrder(value);
    }
    handleFilterClose();
  };

  const onSearchChange = (e) => {
    setSearch(e.target.value);
  };

  const onClickClear = () => {
    setSearch("");
    applyFilters();
  };

  const handlePageChange = (event, value) => {
    setCurrentPage(value);
  };

  const getMembershipStyle = (membershipType) => {
    switch (membershipType) {
      case "Gold":
        return { backgroundColor: "#FFC107", color: "#000" };
      case "Silver":
        return { backgroundColor: "#C0C0C0", color: "#000" };
      case "Bronze":
        return { backgroundColor: "#CD7F32", color: "#000" };
      default:
        return { backgroundColor: "#E0E0E0", color: "#000" };
    }
  };

  const indexOfLastReward = currentPage * rewardsPerPage;
  const indexOfFirstReward = indexOfLastReward - rewardsPerPage;
  const currentRewards = filteredRewards.slice(
    indexOfFirstReward,
    indexOfLastReward
  );

  return (
    <>
      <Typography variant="h4">Rewards</Typography>
      <Box
        sx={{
          minHeight: "100vh",
          py: 3,
          borderRadius: "8px",
        }}
      >
        <Box
          sx={{
            display: "flex",
            alignItems: "center",
            flexDirection: { xs: "column", md: "row" },
            justifyContent: "space-between",
            mb: 2,
          }}
        >
          <Box sx={{ display: "flex", alignItems: "center" }}>
            <Input
              value={search}
              placeholder="Search..."
              onChange={onSearchChange}
              sx={{
                mr: 2,
                width: "300px",
                borderBottom: "1px solid gray",
              }}
              startAdornment={
                <InputAdornment position="start">
                  <Search />
                </InputAdornment>
              }
            />
            <Tooltip title="Clear">
              <IconButton color="primary" onClick={onClickClear}>
                <Clear />
              </IconButton>
            </Tooltip>
          </Box>

          <Box sx={{ display: "flex", alignItems: "center" }}>
            <Box
              sx={{
                display: "flex",
                alignItems: "center",
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
                anchorEl={anchorElRewardType}
                open={Boolean(anchorElRewardType)}
                onClose={handleFilterClose}
              >
                {REWARD_TYPES.map((reward) => (
                  <MenuItem
                    key={reward}
                    onClick={() =>
                      handleFilterChange(
                        reward === "All Reward Types" ? "" : reward,
                        "reward"
                      )
                    }
                  >
                    {reward}
                  </MenuItem>
                ))}
              </Menu>
            </Box>

            <Box
              sx={{
                display: "flex",
                alignItems: "center",
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
                      handleFilterChange(option.toLowerCase(), "sort")
                    }
                  >
                    {option}
                  </MenuItem>
                ))}
              </Menu>
            </Box>
          </Box>
        </Box>

        <Box sx={{ display: "flex", flexWrap: "wrap", mb: 2 }}>
          {filterRewardType && (
            <Chip
              label={`Membership: ${filterRewardType}`}
              onDelete={() => setFilterRewardType("")}
              sx={{ mb: 1, mr: 1 }}
            />
          )}
          {sortOrder !== "default" && (
            <Chip
              label={`Sort: ${sortOrder}`}
              onDelete={() => setSortOrder("default")}
              sx={{ mb: 1, mr: 1 }}
            />
          )}
        </Box>

        {loading ? (
          <Box
            sx={{
              display: "flex",
              justifyContent: "center",
              mt: 4,
            }}
          >
            <CircularProgress />
          </Box>
        ) : filteredRewards.length === 0 ? (
          <Typography variant="body1" sx={{ textAlign: "center", mt: 4 }}>
            No rewards found.
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
                  {currentRewards.map((reward) => (
                    <TableRow key={reward.userId}>
                      <TableCell>{reward.userId}</TableCell>
                      <TableCell>{reward.fullName}</TableCell>
                      <TableCell>{reward.email}</TableCell>
                      <TableCell>{reward.mobileNumber || "N/A"}</TableCell>
                      <TableCell>
                        <Box
                          sx={{
                            ...getMembershipStyle(reward.rewardType),
                            padding: "4px 12px",
                            borderRadius: "5px",
                            textAlign: "center",
                          }}
                        >
                          {reward.membershipType || "N/A"}
                        </Box>
                      </TableCell>
                      <TableCell
                        sx={{
                          display: "flex",
                          alignItems: "center",
                          justifyContent: "center",
                        }}
                      >
                        <Link to={`/admin/rewards/${reward.userId}/view`}>
                          <Tooltip title="View Details">
                            <IconButton
                              color="secondary"
                              sx={{
                                padding: "4px",
                              }}
                            >
                              <Visibility />
                            </IconButton>
                          </Tooltip>
                        </Link>
                        {
                          // Render the edit button for all rewards except when the user is an admin and the logged-in user is staff
                          !(loggedInUser.role === "Staff") && (
                            <Link to={`/admin/rewards/${reward.rewardId}/edit`}>
                              <Tooltip title="Edit Reward">
                                <IconButton
                                  color="secondary"
                                  sx={{
                                    padding: "4px",
                                  }}
                                >
                                  <Edit />
                                </IconButton>
                              </Tooltip>
                            </Link>
                          )
                        }
                        <Tooltip title="Delete Reward">
                          <IconButton
                            color="error"
                            sx={{
                              padding: "4px",
                              visibility:
                                reward.role === "Admin" ? "hidden" : "visible",
                            }}
                            onClick={() => handleDelete(reward.rewardId)}
                          >
                            <Delete />
                          </IconButton>
                        </Tooltip>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </TableContainer>

            <Box
              sx={{
                display: "flex",
                justifyContent: "center",
                mt: 3,
              }}
            >
              <Pagination
                count={Math.ceil(filteredRewards.length / rewardsPerPage)}
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
            sx={{ color: "#e2160f", fontWeight: "bold" }}
          >
            {"Confirm Delete"}
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

export default Rewards;
