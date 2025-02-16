import React, { useMemo, useState } from 'react';

import { Clear, FilterList, Search, Sort } from '@mui/icons-material';
import KeyboardArrowLeftIcon from '@mui/icons-material/KeyboardArrowLeft';
import KeyboardArrowRightIcon from '@mui/icons-material/KeyboardArrowRight';
import {
  Box,
  Chip,
  IconButton,
  Input,
  InputAdornment,
  Menu,
  MenuItem,
  Paper,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  TableSortLabel,
  Typography,
} from '@mui/material';
import {
  flexRender,
  getCoreRowModel,
  getPaginationRowModel,
  getSortedRowModel,
  useReactTable,
} from '@tanstack/react-table';

const DataTable = ({
  data,
  columns,
  searchKeys,
  filterOptions,
  sortOptions,
}) => {
  const [filter, setFilter] = useState('');
  const [sorting, setSorting] = useState([]);
  const [anchorElSort, setAnchorElSort] = useState(null);
  const [anchorElFilter, setAnchorElFilter] = useState(null);
  const [filterType, setFilterType] = useState('');
  const [sortOrder, setSortOrder] = useState('default');

  // Filtered data based on search and filter input
  const filteredData = useMemo(() => {
    let filtered = data;

    if (filter) {
      filtered = filtered.filter((row) =>
        searchKeys.some((key) =>
          row[key]?.toString().toLowerCase().includes(filter.toLowerCase())
        )
      );
    }

    if (filterType) {
      filtered = filtered.filter(
        (row) => row[filterOptions.key] === filterType
      );
    }

    // Sort logic
    switch (sortOrder) {
      case 'newest':
        filtered.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
        break;
      case 'oldest':
        filtered.sort((a, b) => new Date(a.createdAt) - new Date(b.createdAt));
        break;
      case 'alphabetical':
        filtered.sort((a, b) =>
          a[searchKeys[0]].localeCompare(b[searchKeys[0]])
        );
        break;
      default:
        break;
    }

    return filtered;
  }, [data, filter, searchKeys, filterType, filterOptions, sortOrder]);

  const table = useReactTable({
    data: filteredData,
    columns,
    state: { sorting },
    onSortingChange: setSorting,
    getCoreRowModel: getCoreRowModel(),
    getPaginationRowModel: getPaginationRowModel(),
    getSortedRowModel: getSortedRowModel(),
  });

  const handleFilterChange = (value) => {
    setFilterType(value === 'All' ? '' : value);
    setAnchorElFilter(null);
  };

  const handleSortChange = (value) => {
    setSortOrder(value);
    setAnchorElSort(null);
  };

  return (
    <>
      <Box
        sx={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          mb: 2,
        }}
      >
        <Input
          value={filter}
          onChange={(e) => setFilter(e.target.value)}
          placeholder="Search..."
          startAdornment={
            <InputAdornment position="start">
              <Search />
            </InputAdornment>
          }
          endAdornment={
            filter && (
              <InputAdornment position="end">
                <IconButton onClick={() => setFilter('')}>
                  <Clear />
                </IconButton>
              </InputAdornment>
            )
          }
          sx={{ mr: 2, width: '300px' }}
        />
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
          <Typography variant="body1">Reward Type:</Typography>
          <IconButton onClick={(e) => setAnchorElFilter(e.currentTarget)}>
            <FilterList />
          </IconButton>
          <Menu
            anchorEl={anchorElFilter}
            open={Boolean(anchorElFilter)}
            onClose={() => setAnchorElFilter(null)}
          >
            {filterOptions.values.map((option) => (
              <MenuItem key={option} onClick={() => handleFilterChange(option)}>
                {option}
              </MenuItem>
            ))}
          </Menu>
          <Typography variant="body1">Sort:</Typography>
          <IconButton onClick={(e) => setAnchorElSort(e.currentTarget)}>
            <Sort />
          </IconButton>
          <Menu
            anchorEl={anchorElSort}
            open={Boolean(anchorElSort)}
            onClose={() => setAnchorElSort(null)}
          >
            {sortOptions.map((option) => (
              <MenuItem
                key={option}
                onClick={() => handleSortChange(option.toLowerCase())}
              >
                {option}
              </MenuItem>
            ))}
          </Menu>
        </Box>
      </Box>

      <Box sx={{ mb: 2 }}>
        {filterType && (
          <Chip
            label={`Filter: ${filterType}`}
            onDelete={() => setFilterType('')}
            sx={{ ml: 1 }}
          />
        )}
        {sortOrder !== 'default' && (
          <Chip
            label={`Sort: ${
              sortOrder.charAt(0).toUpperCase() + sortOrder.slice(1)
            }`}
            onDelete={() => setSortOrder('default')}
            sx={{ ml: 1 }}
          />
        )}
      </Box>

      <TableContainer component={Paper}>
        <Table>
          <TableHead>
            {table.getHeaderGroups().map((headerGroup) => (
              <TableRow key={headerGroup.id}>
                {headerGroup.headers.map((header) => (
                  <TableCell key={header.id}>
                    <TableSortLabel
                      active={header.column.getIsSorted()}
                      direction={
                        header.column.getIsSorted() === 'asc' ? 'asc' : 'desc'
                      }
                      onClick={header.column.getToggleSortingHandler()}
                    >
                      <Typography variant="subtitle1">
                        {flexRender(
                          header.column.columnDef.header,
                          header.getContext()
                        )}
                      </Typography>
                    </TableSortLabel>
                  </TableCell>
                ))}
              </TableRow>
            ))}
          </TableHead>
          <TableBody>
            {filteredData.length === 0 ? (
              <TableRow>
                <TableCell colSpan={columns.length}>
                  <Typography align="center">No records found</Typography>
                </TableCell>
              </TableRow>
            ) : (
              table.getRowModel().rows.map((row) => (
                <TableRow key={row.id}>
                  {row.getVisibleCells().map((cell) => (
                    <TableCell key={cell.id}>
                      <Typography>
                        {flexRender(
                          cell.column.columnDef.cell,
                          cell.getContext()
                        )}
                      </Typography>
                    </TableCell>
                  ))}
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </TableContainer>

      {/* Pagination Controls */}
      <Box
        style={{
          display: 'flex',
          justifyContent: 'center',
          marginTop: '10px',
          alignItems: 'center',
          gap: '10px',
        }}
      >
        <IconButton
          onClick={() => table.previousPage()}
          disabled={!table.getCanPreviousPage()}
        >
          <KeyboardArrowLeftIcon />
        </IconButton>
        <Typography variant="body1">
          Page {table.getState().pagination.pageIndex + 1} of{' '}
          {table.getPageCount()}
        </Typography>
        <IconButton
          onClick={() => table.nextPage()}
          disabled={!table.getCanNextPage()}
        >
          <KeyboardArrowRightIcon />
        </IconButton>
      </Box>
    </>
  );
};

export default DataTable;
