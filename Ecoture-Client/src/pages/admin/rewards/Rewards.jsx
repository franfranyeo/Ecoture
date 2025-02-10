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
import http from "http";
import UserContext from "contexts/UserContext";

// Constants
const REWARD_TYPES = [
  "All Rewards",
  "Discount",
  "Free Shipping",
  "Cashback",
  "Charity",
];
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

  // Fetch rewards on component mount
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

  // Apply filters whenever relevant state changes
  useEffect(() => {
    applyFilters();
  }, [filterRewardType, sortOrder, search, rewards]);

  // Handle reward deletion
  const handleDelete = (id) => {
    setRewardId(id);
    setOpen(true);
  };

  const handleClose = () => {
    setOpen(false);
    setRewardId(null);
  };

  const deleteReward = async () => {
    if (rewardId) {
      try {
        await http.delete(`/rewards/${rewardId}`);
        setRewards(rewards.filter((reward) => reward.rewardId !== rewardId));
        toast.success("Reward deleted successfully");
      } catch (error) {
        console.error("Error deleting reward:", error);
        toast.error("Failed to delete reward");
      } finally {
        setOpen(false);
        setRewardId(null);
      }
    }
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

  const handleFilterClose = () => {
    setAnchorElSort(null);
    setAnchorElRewardType(null);
  };

  const handleRewardTypeFilterClick = (event) => {
    setAnchorElRewardType(event.currentTarget);
  };

  const handleFilterChange = (value, type) => {
    if (type === "rewardType") {
      setFilterRewardType(value);
    } else if (type === "sort") {
      setSortOrder(value);
    }
    handleFilterClose();
  };

  // Apply filters and sorting
  const applyFilters = () => {
    let updatedRewards = [...rewards];

    // Filter by reward type
    if (filterRewardType) {
      updatedRewards = updatedRewards.filter(
        (reward) => reward.rewardType === filterRewardType
      );
    }

    // Filter by search term
    if (search) {
      updatedRewards = updatedRewards.filter(
        (reward) =>
          reward.rewardTitle.toLowerCase().includes(search.toLowerCase()) ||
          reward.rewardDescription.toLowerCase().includes(search.toLowerCase())
      );
    }

    // Sort rewards
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
        updatedRewards.sort((a, b) =>
          a.rewardTitle.localeCompare(b.rewardTitle)
        );
        break;
      case "default":
      default:
        updatedRewards.sort((a, b) => a.rewardId - b.rewardId);
        break;
    }

    setFilteredRewards(updatedRewards);
  };

  // Pagination logic
  const indexOfLastReward = currentPage * rewardsPerPage;
  const indexOfFirstReward = indexOfLastReward - rewardsPerPage;
  const currentRewards = filteredRewards.slice(
    indexOfFirstReward,
    indexOfLastReward
  );

  return (
    <>
      <Box sx={{ display: "flex", justifyContent: "space-between" }}>
        <Typography variant="h4">Rewards</Typography>

        {/* Add Reward Button */}
        <Button
          variant="contained"
          color="primary"
          component={Link}
          to="/admin/rewards/add"
          sx={{ mb: 2 }}
        >
          Add Reward
        </Button>
      </Box>
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
          {/* Filters */}
          <Box
            sx={{
              display: "flex",
              alignItems: "center",
              justifyContent: "space-between",
              width: "100%",
            }}
          >
            {/* Search Bar */}
            <Input
              value={search}
              onChange={onSearchChange}
              placeholder="Search rewards..."
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
                width: "300px",
                borderBottom: "1px solid gray",
              }}
            />
            {/* Reward Type Filter */}
            <Box sx={{ display: "flex", alignItems: "center" }}>
              <Box
                sx={{
                  display: "flex",
                  alignItems: "center",
                  mr: 2,
                }}
              >
                <Typography variant="body1" sx={{ mr: 1 }}>
                  Reward Type
                </Typography>
                <IconButton onClick={handleRewardTypeFilterClick}>
                  <FilterList />
                </IconButton>
                <Menu
                  anchorEl={anchorElRewardType}
                  open={Boolean(anchorElRewardType)}
                  onClose={() => setAnchorElRewardType(null)}
                >
                  {REWARD_TYPES.map((type) => (
                    <MenuItem
                      key={type}
                      onClick={() => {
                        setFilterRewardType(type === "All Rewards" ? "" : type);
                        setAnchorElRewardType(null);
                      }}
                    >
                      {type}
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
                {/* Sort Filter */}
                <Typography variant="body1" sx={{ mr: 1 }}>
                  Sort:
                </Typography>
                <IconButton onClick={(e) => setAnchorElSort(e.currentTarget)}>
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
        </Box>

        {/* Active Filters */}
        <Box sx={{ mb: 2 }}>
          {filterRewardType && (
            <Chip
              label={`Reward Type: ${filterRewardType}`}
              onDelete={() => setFilterRewardType("")}
              sx={{ mr: 1 }}
            />
          )}
          {sortOrder !== "default" && (
            <Chip
              label={`Sort: ${
                sortOrder.charAt(0).toUpperCase() + sortOrder.slice(1)
              }`}
              onDelete={() => setSortOrder("default")}
              sx={{ mr: 1 }}
            />
          )}
        </Box>

        {/* Loading State */}
        {loading ? (
          <Box sx={{ display: "flex", justifyContent: "center", mt: 5 }}>
            <CircularProgress />
          </Box>
        ) : filteredRewards.length === 0 ? (
          <Typography>No rewards found.</Typography>
        ) : (
          <>
            {/* Rewards Table */}
            <TableContainer component={Paper}>
              <Table>
                <TableHead>
                  <TableRow>
                    <TableCell>Reward ID</TableCell>
                    <TableCell>Title</TableCell>
                    <TableCell>Description</TableCell>
                    <TableCell>Type</TableCell>
                    <TableCell>Expiration Date</TableCell>
                    <TableCell>Actions</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {currentRewards.map((reward) => (
                    <TableRow key={reward.rewardId}>
                      <TableCell>{reward.rewardId}</TableCell>
                      <TableCell>{reward.rewardTitle}</TableCell>
                      <TableCell>{reward.rewardDescription}</TableCell>
                      <TableCell>{reward.rewardType}</TableCell>
                      <TableCell>
                        {reward.expirationDate.split("T")[0]}
                      </TableCell>
                      <TableCell>
                        <Tooltip title="View">
                          <IconButton
                            component={Link}
                            to={`/admin/rewards/${reward.rewardId}/view`}
                          >
                            <Visibility />
                          </IconButton>
                        </Tooltip>
                        <Tooltip title="Edit">
                          <IconButton
                            component={Link}
                            to={`/admin/rewards/${reward.rewardId}/edit`}
                          >
                            <Edit />
                          </IconButton>
                        </Tooltip>
                        <Tooltip title="Delete">
                          <IconButton
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

            {/* Pagination */}
            <Pagination
              count={Math.ceil(filteredRewards.length / rewardsPerPage)}
              page={currentPage}
              onChange={handlePageChange}
              sx={{ mt: 2, display: "flex", justifyContent: "center" }}
            />
          </>
        )}

        {/* Delete Confirmation Dialog */}
        <Dialog open={open} onClose={handleClose}>
          <DialogTitle>Confirm Delete</DialogTitle>
          <DialogContent>
            <DialogContentText>
              Are you sure you want to delete this reward? This action cannot be
              undone.
            </DialogContentText>
          </DialogContent>
          <DialogActions>
            <Button onClick={handleClose}>Cancel</Button>
            <Button onClick={deleteReward} color="error">
              Delete
            </Button>
          </DialogActions>
        </Dialog>
      </Box>
    </>
  );
};

export default Rewards;
