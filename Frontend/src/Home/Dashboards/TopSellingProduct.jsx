import { useMemo, useState } from 'react';
import {
  Avatar,
  Divider,
  InputAdornment,
  LinearProgress,
  Link,
  Stack,
  TextField,
  Tooltip,
  Typography,
  debounce,
} from '@mui/material';
import { DataGrid, useGridApiRef } from '@mui/x-data-grid';
import IconifyIcon from 'components/base/IconifyIcon';
import { rows } from 'data/products';
import CustomPagination from './CustomPagination';
import { currencyFormat } from 'helpers/format-functions';

const columns = [
  {
    field: 'id',
    headerName: 'ID',
  },
  {
    field: 'product',
    headerName: 'Product',
    flex: 1,
    minWidth: 182.9625,
    valueGetter: (params) => {
      return params.title + ' ' + params.subtitle;
    },
    renderCell: (params) => {
      return (
        <Stack direction="row" spacing={1.5} alignItems="center" component={Link} href="#!">
          <Tooltip title={params.row.product.title} placement="top" arrow>
            <Avatar src={params.row.product.avatar} sx={{ objectFit: 'cover' }} />
          </Tooltip>
          <Stack direction="column" spacing={0.5} justifyContent="space-between">
            <Typography variant="body1" color="text.primary">
              {params.row.product.title}
            </Typography>
            <Typography variant="body2" color="text.secondary">
              {params.row.product.subtitle}
            </Typography>
          </Stack>
        </Stack>
      );
    },
    sortComparator: (v1, v2) => v1.localeCompare(v2),
  },
  {
    field: 'orders',
    headerName: 'Orders',
    flex: 0.75,
    minWidth: 137.221875,
  },
  {
    field: 'price',
    headerName: 'Price',
    flex: 0.75,
    minWidth: 137.221875,
    valueGetter: (params) => currencyFormat(params),
  },
  {
    field: 'adsSpent',
    headerName: 'Ads Spent',
    flex: 0.75,
    minWidth: 137.221875,
    valueGetter: (params) => currencyFormat(params, { minimumFractionDigits: 3 }),
  },
  {
    field: 'refunds',
    headerName: 'Refunds',
    flex: 0.75,
    minWidth: 137.221875,
    renderCell: ({ row: { refunds } }) => {
      return refunds > 0 ? `> ${refunds}` : `< ${-refunds}`;
    },
    filterable: false,
  },
];

const TopSellingProduct = () => {
  const apiRef = useGridApiRef();
  const [search, setSearch] = useState('');

  const visibleColumns = useMemo(() => {
    return columns
      .filter((column) => column.field !== 'id')
      .map((column) => {
        if (column.field === 'refunds') {
          return {
            ...column,
            getApplyQuickFilterFn: undefined,
            filterable: false,
          };
        }
        return column;
      });
  }, []);

  const handleGridSearch = useMemo(() => {
    return debounce((searchValue) => {
      apiRef.current.setQuickFilterValues(
        searchValue.split(' ').filter((word) => word !== '')
      );
    }, 250);
  }, [apiRef]);

  const handleChange = (event) => {
    const searchValue = event.currentTarget.value;
    setSearch(searchValue);
    handleGridSearch(searchValue);
  };

  return (
    <Stack
      bgcolor="background.paper"
      borderRadius={5}
      width={1}
      boxShadow={(theme) => theme.shadows[4]}
      height={1}
    >
      <Stack
        direction={{ sm: 'row' }}
        justifyContent="space-between"
        alignItems="center"
        padding={3.75}
        gap={3.75}
      >
        <Typography variant="h5" color="text.primary">
          Top Selling Product
        </Typography>
        <TextField
          variant="filled"
          placeholder="Search..."
          id="search-input"
          name="table-search-input"
          onChange={handleChange}
          value={search}
          InputProps={{
            endAdornment: (
              <InputAdornment position="end" sx={{ width: 24, height: 24 }}>
                <IconifyIcon icon="mdi:search" width={1} height={1} />
              </InputAdornment>
            ),
          }}
        />
      </Stack>
      <Divider />
      <Stack height={1}>
        <DataGrid
          apiRef={apiRef}
          columns={visibleColumns}
          rows={rows}
          getRowHeight={() => 70}
          hideFooterSelectedRowCount
          disableColumnResize
          disableColumnSelector
          disableRowSelectionOnClick
          rowSelection={false}
          initialState={{
            pagination: { paginationModel: { pageSize: 5, page: 0 } },
            columns: {
              columnVisibilityModel: {
                id: false,
              },
            },
          }}
          pageSizeOptions={[5]}
          onResize={() => {
            apiRef.current.autosizeColumns({
              includeOutliers: true,
              expand: true,
            });
          }}
          slots={{
            loadingOverlay: LinearProgress,
            pagination: CustomPagination,
            noRowsOverlay: () => <section>No rows available</section>,
          }}
          sx={{
            height: 1,
            width: 1,
          }}
        />
      </Stack>
    </Stack>
  );
};

export default TopSellingProduct;
