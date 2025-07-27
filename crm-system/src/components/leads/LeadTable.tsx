import React, { useState } from 'react';
import {
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  TablePagination,
  TableSortLabel,
  Paper,
  Chip,
  IconButton,
  Menu,
  MenuItem,
  ListItemIcon,
  ListItemText,
  Typography,
  Box,
  Avatar,
  Tooltip,
} from '@mui/material';
import {
  MoreVert as MoreVertIcon,
  Edit as EditIcon,
  Delete as DeleteIcon,
  Visibility as ViewIcon,
  Phone as PhoneIcon,
  Email as EmailIcon,
  Business as BusinessIcon,
  Person as PersonIcon,
} from '@mui/icons-material';
import { Lead, LeadStatus, LeadTemperature } from '../../types/leads';

interface LeadTableProps {
  leads: Lead[];
  loading: boolean;
  total: number;
  page: number;
  pageSize: number;
  onPageChange: (page: number) => void;
  onPageSizeChange: (pageSize: number) => void;
  onSort: (field: keyof Lead, direction: 'asc' | 'desc') => void;
  onEdit?: (lead: Lead) => void;
  onDelete?: (lead: Lead) => void;
  onView?: (lead: Lead) => void;
}

type SortField = keyof Lead;
type SortDirection = 'asc' | 'desc';

const getStatusColor = (status: LeadStatus) => {
  switch (status) {
    case 'new':
      return 'default';
    case 'contacted':
      return 'info';
    case 'qualified':
      return 'warning';
    case 'unqualified':
      return 'error';
    case 'converted':
      return 'success';
    case 'lost':
      return 'error';
    default:
      return 'default';
  }
};

const getTemperatureColor = (temperature: LeadTemperature) => {
  switch (temperature) {
    case 'cold':
      return 'info';
    case 'warm':
      return 'warning';
    case 'hot':
      return 'error';
    default:
      return 'default';
  }
};

const formatCurrency = (amount: number) => {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
  }).format(amount);
};

const formatDate = (date: string) => {
  return new Date(date).toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
  });
};

export const LeadTable: React.FC<LeadTableProps> = ({
  leads,
  loading,
  total,
  page,
  pageSize,
  onPageChange,
  onPageSizeChange,
  onSort,
  onEdit,
  onDelete,
  onView,
}) => {
  const [sortField, setSortField] = useState<SortField>('created_at');
  const [sortDirection, setSortDirection] = useState<SortDirection>('desc');
  const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);
  const [selectedLead, setSelectedLead] = useState<Lead | null>(null);

  const handleSort = (field: SortField) => {
    const isAsc = sortField === field && sortDirection === 'asc';
    const newDirection = isAsc ? 'desc' : 'asc';
    setSortField(field);
    setSortDirection(newDirection);
    onSort(field, newDirection);
  };

  const handleMenuOpen = (event: React.MouseEvent<HTMLElement>, lead: Lead) => {
    setAnchorEl(event.currentTarget);
    setSelectedLead(lead);
  };

  const handleMenuClose = () => {
    setAnchorEl(null);
    setSelectedLead(null);
  };

  const handleAction = (action: 'view' | 'edit' | 'delete') => {
    if (!selectedLead) return;

    switch (action) {
      case 'view':
        onView?.(selectedLead);
        break;
      case 'edit':
        onEdit?.(selectedLead);
        break;
      case 'delete':
        onDelete?.(selectedLead);
        break;
    }
    handleMenuClose();
  };

  const columns = [
    { field: 'name' as SortField, label: 'Name', sortable: true },
    { field: 'email' as SortField, label: 'Email', sortable: true },
    { field: 'company' as SortField, label: 'Company', sortable: true },
    { field: 'status' as SortField, label: 'Status', sortable: true },
    { field: 'temperature' as SortField, label: 'Temperature', sortable: true },
    { field: 'estimated_value' as SortField, label: 'Value', sortable: true },
    { field: 'source' as SortField, label: 'Source', sortable: true },
    { field: 'assigned_to' as SortField, label: 'Assigned To', sortable: true },
    { field: 'created_at' as SortField, label: 'Created', sortable: true },
    { field: 'actions' as SortField, label: 'Actions', sortable: false },
  ];

  return (
    <Paper>
      <TableContainer>
        <Table>
          <TableHead>
            <TableRow>
              {columns.map((column) => (
                <TableCell key={column.field}>
                  {column.sortable ? (
                    <TableSortLabel
                      active={sortField === column.field}
                      direction={sortField === column.field ? sortDirection : 'asc'}
                      onClick={() => handleSort(column.field)}
                    >
                      {column.label}
                    </TableSortLabel>
                  ) : (
                    column.label
                  )}
                </TableCell>
              ))}
            </TableRow>
          </TableHead>
          <TableBody>
            {leads.map((lead) => (
              <TableRow key={lead.id} hover>
                <TableCell>
                  <Box display="flex" alignItems="center" gap={1}>
                    <Avatar sx={{ width: 32, height: 32, bgcolor: 'primary.main' }}>
                      <PersonIcon />
                    </Avatar>
                    <Box>
                      <Typography variant="body2" fontWeight="medium">
                        {lead.name}
                      </Typography>
                      {lead.phone && (
                        <Box display="flex" alignItems="center" gap={0.5}>
                          <PhoneIcon sx={{ fontSize: 12 }} />
                          <Typography variant="caption" color="text.secondary">
                            {lead.phone}
                          </Typography>
                        </Box>
                      )}
                    </Box>
                  </Box>
                </TableCell>
                
                <TableCell>
                  <Box display="flex" alignItems="center" gap={0.5}>
                    <EmailIcon sx={{ fontSize: 16 }} />
                    <Typography variant="body2">
                      {lead.email}
                    </Typography>
                  </Box>
                </TableCell>
                
                <TableCell>
                  {lead.company && (
                    <Box display="flex" alignItems="center" gap={0.5}>
                      <BusinessIcon sx={{ fontSize: 16 }} />
                      <Typography variant="body2">
                        {lead.company}
                      </Typography>
                    </Box>
                  )}
                </TableCell>
                
                <TableCell>
                  <Chip
                    label={lead.status}
                    color={getStatusColor(lead.status)}
                    size="small"
                    variant="outlined"
                  />
                </TableCell>
                
                <TableCell>
                  <Chip
                    label={lead.temperature}
                    color={getTemperatureColor(lead.temperature)}
                    size="small"
                  />
                </TableCell>
                
                <TableCell>
                  {lead.estimated_value ? (
                    <Typography variant="body2" fontWeight="medium">
                      {formatCurrency(lead.estimated_value)}
                    </Typography>
                  ) : (
                    <Typography variant="body2" color="text.secondary">
                      Not set
                    </Typography>
                  )}
                </TableCell>
                
                <TableCell>
                  <Typography variant="body2">
                    {lead.source || 'Unknown'}
                  </Typography>
                </TableCell>
                
                <TableCell>
                  {lead.assigned_to ? (
                    <Box display="flex" alignItems="center" gap={1}>
                      <Avatar sx={{ width: 24, height: 24, fontSize: 12 }}>
                        {lead.assigned_to.name?.charAt(0) || 'U'}
                      </Avatar>
                      <Typography variant="body2">
                        {lead.assigned_to.name}
                      </Typography>
                    </Box>
                  ) : (
                    <Typography variant="body2" color="text.secondary">
                      Unassigned
                    </Typography>
                  )}
                </TableCell>
                
                <TableCell>
                  <Typography variant="body2">
                    {formatDate(lead.created_at)}
                  </Typography>
                </TableCell>
                
                <TableCell>
                  <Tooltip title="Actions">
                    <IconButton
                      size="small"
                      onClick={(e) => handleMenuOpen(e, lead)}
                    >
                      <MoreVertIcon />
                    </IconButton>
                  </Tooltip>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </TableContainer>
      
      <TablePagination
        component="div"
        count={total}
        page={page}
        onPageChange={(_, newPage) => onPageChange(newPage)}
        rowsPerPage={pageSize}
        onRowsPerPageChange={(e) => onPageSizeChange(parseInt(e.target.value, 10))}
        rowsPerPageOptions={[10, 25, 50, 100]}
      />
      
      <Menu
        anchorEl={anchorEl}
        open={Boolean(anchorEl)}
        onClose={handleMenuClose}
        anchorOrigin={{
          vertical: 'bottom',
          horizontal: 'right',
        }}
        transformOrigin={{
          vertical: 'top',
          horizontal: 'right',
        }}
      >
        <MenuItem onClick={() => handleAction('view')}>
          <ListItemIcon>
            <ViewIcon fontSize="small" />
          </ListItemIcon>
          <ListItemText>View Details</ListItemText>
        </MenuItem>
        <MenuItem onClick={() => handleAction('edit')}>
          <ListItemIcon>
            <EditIcon fontSize="small" />
          </ListItemIcon>
          <ListItemText>Edit Lead</ListItemText>
        </MenuItem>
        <MenuItem onClick={() => handleAction('delete')}>
          <ListItemIcon>
            <DeleteIcon fontSize="small" />
          </ListItemIcon>
          <ListItemText>Delete Lead</ListItemText>
        </MenuItem>
      </Menu>
    </Paper>
  );
};
