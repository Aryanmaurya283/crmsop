import React, { useState, useEffect } from 'react';
import {
  Box,
  TextField,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Chip,
  OutlinedInput,
  Button,
  Grid,
  Slider,
  Typography,
  Autocomplete,
} from '@mui/material';
import {
  Clear as ClearIcon,
  Search as SearchIcon,
} from '@mui/icons-material';

import { LeadService, type LeadFilters as LeadFiltersType } from '../../services/leads';
import { useUsers } from '../../hooks/useUsers';

interface LeadFiltersProps {
  onFiltersChange: (filters: LeadFiltersType) => void;
  initialFilters?: LeadFiltersType;
}

const LEAD_STATUSES = [
  { value: 'new', label: 'New' },
  { value: 'contacted', label: 'Contacted' },
  { value: 'qualified', label: 'Qualified' },
  { value: 'unqualified', label: 'Unqualified' },
  { value: 'converted', label: 'Converted' },
  { value: 'lost', label: 'Lost' },
];

const LEAD_TEMPERATURES = [
  { value: 'cold', label: 'Cold' },
  { value: 'warm', label: 'Warm' },
  { value: 'hot', label: 'Hot' },
];

export const LeadFilters: React.FC<LeadFiltersProps> = ({
  onFiltersChange,
  initialFilters = {},
}) => {
  const [filters, setFilters] = useState<LeadFiltersType>(initialFilters);
  const [sources, setSources] = useState<Array<{ id: string; name: string }>>([]);
  const [campaigns, setCampaigns] = useState<Array<{ id: string; name: string }>>([]);
  const { users } = useUsers();

  // Load sources and campaigns
  useEffect(() => {
    const loadOptions = async () => {
      try {
        const [sourcesData, campaignsData] = await Promise.all([
          LeadService.getLeadSources(),
          LeadService.getLeadCampaigns(),
        ]);
        
        setSources(sourcesData.map(s => ({ id: s.name, name: s.name })));
        setCampaigns(campaignsData.map(c => ({ id: c.id, name: c.name })));
      } catch (error) {
        console.error('Failed to load filter options:', error);
      }
    };

    loadOptions();
  }, []);

  const handleFilterChange = (key: keyof LeadFiltersType, value: any) => {
    const newFilters = { ...filters, [key]: value };
    setFilters(newFilters);
    onFiltersChange(newFilters);
  };

  const handleClearFilters = () => {
    const clearedFilters: LeadFiltersType = {};
    setFilters(clearedFilters);
    onFiltersChange(clearedFilters);
  };

  const hasActiveFilters = Object.keys(filters).some(key => {
    const value = filters[key as keyof LeadFiltersType];
    return value !== undefined && value !== null && 
           (Array.isArray(value) ? value.length > 0 : value !== '');
  });

  return (
    <Box>
        <Box display="flex" justifyContent="space-between" alignItems="center" mb={2}>
          <Typography variant="h6">Filters</Typography>
          {hasActiveFilters && (
            <Button
              startIcon={<ClearIcon />}
              onClick={handleClearFilters}
              size="small"
            >
              Clear All
            </Button>
          )}
        </Box>

        <Grid container spacing={2}>
          {/* Search */}
          <Grid size={{ xs: 12, md: 6 }}>
            <TextField
              fullWidth
              label="Search"
              placeholder="Search by name, email, or company..."
              value={filters.search || ''}
              onChange={(e) => handleFilterChange('search', e.target.value)}
              InputProps={{
                startAdornment: <SearchIcon sx={{ mr: 1, color: 'text.secondary' }} />,
              }}
            />
          </Grid>

          {/* Status */}
          <Grid size={{ xs: 12, md: 6 }}>
            <FormControl fullWidth>
              <InputLabel>Status</InputLabel>
              <Select
                multiple
                value={filters.status || []}
                onChange={(e) => handleFilterChange('status', e.target.value)}
                input={<OutlinedInput label="Status" />}
                renderValue={(selected) => (
                  <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 0.5 }}>
                    {(selected as string[]).map((value) => {
                      const status = LEAD_STATUSES.find(s => s.value === value);
                      return (
                        <Chip key={value} label={status?.label || value} size="small" />
                      );
                    })}
                  </Box>
                )}
              >
                {LEAD_STATUSES.map((status) => (
                  <MenuItem key={status.value} value={status.value}>
                    {status.label}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>
          </Grid>

          {/* Temperature */}
          <Grid size={{ xs: 12, md: 6 }}>
            <FormControl fullWidth>
              <InputLabel>Temperature</InputLabel>
              <Select
                multiple
                value={filters.temperature || []}
                onChange={(e) => handleFilterChange('temperature', e.target.value)}
                input={<OutlinedInput label="Temperature" />}
                renderValue={(selected) => (
                  <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 0.5 }}>
                    {(selected as string[]).map((value) => {
                      const temp = LEAD_TEMPERATURES.find(t => t.value === value);
                      return (
                        <Chip key={value} label={temp?.label || value} size="small" />
                      );
                    })}
                  </Box>
                )}
              >
                {LEAD_TEMPERATURES.map((temp) => (
                  <MenuItem key={temp.value} value={temp.value}>
                    {temp.label}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>
          </Grid>

          {/* Source */}
          <Grid size={{ xs: 12, md: 6 }}>
            <Autocomplete
              multiple
              options={sources}
              getOptionLabel={(option) => option.name}
              value={sources.filter(s => filters.source?.includes(s.id)) || []}
              onChange={(_, newValue) => 
                handleFilterChange('source', newValue.map(v => v.id))
              }
              renderInput={(params) => (
                <TextField {...params} label="Source" />
              )}
              renderTags={(value, getTagProps) =>
                value.map((option, index) => (
                  <Chip
                    key={option.id}
                    label={option.name}
                    size="small"
                    {...getTagProps({ index })}
                  />
                ))
              }
            />
          </Grid>

          {/* Owner */}
          <Grid size={{ xs: 12, md: 6 }}>
            <Autocomplete
              multiple
              options={users}
              getOptionLabel={(option) => `${option.first_name} ${option.last_name}`}
              value={users.filter(u => filters.owner_id?.includes(u.id)) || []}
              onChange={(_, newValue) => 
                handleFilterChange('owner_id', newValue.map(v => v.id))
              }
              renderInput={(params) => (
                <TextField {...params} label="Owner" />
              )}
              renderTags={(value, getTagProps) =>
                value.map((option, index) => (
                  <Chip
                    key={option.id}
                    label={`${option.first_name} ${option.last_name}`}
                    size="small"
                    {...getTagProps({ index })}
                  />
                ))
              }
            />
          </Grid>

          {/* Campaign */}
          <Grid size={{ xs: 12, md: 6 }}>
            <Autocomplete
              multiple
              options={campaigns}
              getOptionLabel={(option) => option.name}
              value={campaigns.filter(c => filters.campaign_id?.includes(c.id)) || []}
              onChange={(_, newValue) => 
                handleFilterChange('campaign_id', newValue.map(v => v.id))
              }
              renderInput={(params) => (
                <TextField {...params} label="Campaign" />
              )}
              renderTags={(value, getTagProps) =>
                value.map((option, index) => (
                  <Chip
                    key={option.id}
                    label={option.name}
                    size="small"
                    {...getTagProps({ index })}
                  />
                ))
              }
            />
          </Grid>

          {/* Score Range */}
          <Grid size={{ xs: 12, md: 6 }}>
            <Box sx={{ px: 2 }}>
              <Typography gutterBottom>
                Score Range: {filters.score_min || 0} - {filters.score_max || 100}
              </Typography>
              <Slider
                value={[filters.score_min || 0, filters.score_max || 100]}
                onChange={(_, newValue) => {
                  const [min, max] = newValue as number[];
                  handleFilterChange('score_min', min);
                  handleFilterChange('score_max', max);
                }}
                valueLabelDisplay="auto"
                min={0}
                max={100}
                marks={[
                  { value: 0, label: '0' },
                  { value: 25, label: '25' },
                  { value: 50, label: '50' },
                  { value: 75, label: '75' },
                  { value: 100, label: '100' },
                ]}
              />
            </Box>
          </Grid>

          {/* Date Range */}
          <Grid size={{ xs: 12, md: 6 }}>
            <TextField
              fullWidth
              label="Created After"
              type="date"
              value={filters.created_after ? filters.created_after.split('T')[0] : ''}
              onChange={(e) => 
                handleFilterChange('created_after', e.target.value ? new Date(e.target.value).toISOString() : undefined)
              }
              InputLabelProps={{ shrink: true }}
            />
          </Grid>

          <Grid size={{ xs: 12, md: 6 }}>
            <TextField
              fullWidth
              label="Created Before"
              type="date"
              value={filters.created_before ? filters.created_before.split('T')[0] : ''}
              onChange={(e) => 
                handleFilterChange('created_before', e.target.value ? new Date(e.target.value).toISOString() : undefined)
              }
              InputLabelProps={{ shrink: true }}
            />
          </Grid>
        </Grid>
      </Box>
  );
};