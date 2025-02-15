import { useMemo, useState } from 'react';

import KeyboardArrowLeftIcon from '@mui/icons-material/KeyboardArrowLeft';
import KeyboardArrowRightIcon from '@mui/icons-material/KeyboardArrowRight';
import {
  Box,
  IconButton,
  Paper,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  TableSortLabel,
  TextField,
  Typography,
} from '@mui/material';
import {
  flexRender,
  getCoreRowModel,
  getPaginationRowModel,
  getSortedRowModel,
  useReactTable,
} from '@tanstack/react-table';

const DataTable = ({ data, columns }) => {
  const [filter, setFilter] = useState('');
  const [sorting, setSorting] = useState([]);

  // Filtered data based on global search input
  const filteredData = useMemo(() => {
    return data.filter((row) =>
      Object.values(row).some((value) =>
        value?.toString().toLowerCase().includes(filter.toLowerCase())
      )
    );
  }, [data, filter]);

  const table = useReactTable({
    data: filteredData,
    columns,
    state: { sorting },
    onSortingChange: setSorting,
    getCoreRowModel: getCoreRowModel(),
    getPaginationRowModel: getPaginationRowModel(),
    getSortedRowModel: getSortedRowModel(),
  });

  return (
    <Paper style={{ padding: '20px', margin: '20px 0' }}>
      <TextField
        label="Search"
        variant="outlined"
        fullWidth
        margin="normal"
        value={filter}
        onChange={(e) => setFilter(e.target.value)}
      />

      <TableContainer>
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
          variant="contained"
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
          variant="contained"
          onClick={() => table.nextPage()}
          disabled={!table.getCanNextPage()}
        >
          <KeyboardArrowRightIcon />
        </IconButton>
      </Box>
    </Paper>
  );
};

export default DataTable;
