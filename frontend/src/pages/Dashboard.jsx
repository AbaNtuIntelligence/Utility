import React, { useState, useEffect } from 'react';
import { useDropzone } from 'react-dropzone';
import axios from 'axios';
import {
  Container,
  Grid,
  Paper,
  Typography,
  Box,
  Button,
  Card,
  CardContent,
  CardActions,
  MenuItem,
  Select,
  FormControl,
  InputLabel,
  CircularProgress,
  Alert,
  List,
  ListItem,
  ListItemText,
  ListItemAvatar,
  Avatar,
  Divider,
  Chip,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
} from '@mui/material';
import {
  Upload as UploadIcon,
  Receipt as ReceiptIcon,
  Savings as SavingsIcon,
  Error as ErrorIcon,
  CheckCircle as CheckCircleIcon,
} from '@mui/icons-material';
import { format } from 'date-fns';

const Dashboard = () => {
  const [properties, setProperties] = useState([]);
  const [selectedProperty, setSelectedProperty] = useState('');
  const [statements, setStatements] = useState([]);
  const [uploading, setUploading] = useState(false);
  const [uploadResult, setUploadResult] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Load properties on mount
  useEffect(() => {
    loadProperties();
  }, []);

  // Load statements when property changes
  useEffect(() => {
    if (selectedProperty) {
      loadStatements(selectedProperty);
    }
  }, [selectedProperty]);

  const loadProperties = async () => {
    try {
      const response = await axios.get('/api/properties/');
      setProperties(response.data);
      if (response.data.length > 0) {
        setSelectedProperty(response.data[0].id);
      }
      setLoading(false);
    } catch (err) {
      setError('Failed to load properties');
      setLoading(false);
    }
  };

  const loadStatements = async (propertyId) => {
    try {
      const response = await axios.get(`/api/statements/?property=${propertyId}`);
      setStatements(response.data);
    } catch (err) {
      console.error('Failed to load statements', err);
    }
  };

  const onDrop = async (acceptedFiles) => {
    if (!selectedProperty) {
      setError('Please select a property first');
      return;
    }

    const file = acceptedFiles[0];
    const formData = new FormData();
    formData.append('pdf', file);
    formData.append('property_id', selectedProperty);

    setUploading(true);
    setUploadResult(null);
    setError(null);

    try {
      const response = await axios.post('/api/upload/', formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
      });
      setUploadResult(response.data);
      // Refresh statements list
      await loadStatements(selectedProperty);
    } catch (err) {
      setError(err.response?.data?.error || 'Upload failed');
    } finally {
      setUploading(false);
    }
  };

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: { 'application/pdf': ['.pdf'] },
    maxFiles: 1,
  });

  const getSavingsColor = (savings) => {
    if (savings === 0) return 'default';
    if (savings < 100) return 'warning';
    return 'success';
  };

  if (loading) {
    return (
      <Box display="flex" justifyContent="center" alignItems="center" minHeight="60vh">
        <CircularProgress />
      </Box>
    );
  }

  return (
    <Container maxWidth="lg" sx={{ mt: 4, mb: 4 }}>
      {/* Property Selector */}
      <Paper sx={{ p: 3, mb: 3 }}>
        <Typography variant="h6" gutterBottom>
          Select Property
        </Typography>
        <FormControl fullWidth>
          <InputLabel>Property</InputLabel>
          <Select
            value={selectedProperty}
            onChange={(e) => setSelectedProperty(e.target.value)}
            label="Property"
          >
            {properties.map((prop) => (
              <MenuItem key={prop.id} value={prop.id}>
                {prop.address} - {prop.municipal_account}
              </MenuItem>
            ))}
          </Select>
        </FormControl>
      </Paper>

      {/* Upload Area */}
      <Paper
        {...getRootProps()}
        sx={{
          p: 4,
          mb: 3,
          textAlign: 'center',
          cursor: 'pointer',
          bgcolor: isDragActive ? 'action.hover' : 'background.paper',
          border: '2px dashed',
          borderColor: isDragActive ? 'primary.main' : 'divider',
        }}
      >
        <input {...getInputProps()} />
        <UploadIcon sx={{ fontSize: 48, color: 'primary.main', mb: 2 }} />
        <Typography variant="h6" gutterBottom>
          {isDragActive ? 'Drop your municipal bill here' : 'Upload Municipal Bill'}
        </Typography>
        <Typography variant="body2" color="text.secondary">
          Drag & drop a PDF, or click to select
        </Typography>
      </Paper>

      {/* Upload Result */}
      {uploadResult && (
        <Alert
          severity={uploadResult.potential_savings > 0 ? 'success' : 'info'}
          sx={{ mb: 3 }}
          action={
            uploadResult.potential_savings > 0 && (
              <Button color="inherit" size="small">
                View Full Report (R99)
              </Button>
            )
          }
        >
          <Typography variant="body1">
            {uploadResult.preview}
          </Typography>
          {uploadResult.potential_savings > 0 && (
            <Typography variant="body2" sx={{ mt: 1 }}>
              Issues found: {uploadResult.issues.length}
            </Typography>
          )}
        </Alert>
      )}

      {error && (
        <Alert severity="error" sx={{ mb: 3 }} onClose={() => setError(null)}>
          {error}
        </Alert>
      )}

      {uploading && (
        <Box display="flex" justifyContent="center" sx={{ mb: 3 }}>
          <CircularProgress />
          <Typography sx={{ ml: 2 }}>Analyzing your bill...</Typography>
        </Box>
      )}

      {/* Statement History */}
      <Paper sx={{ p: 3 }}>
        <Typography variant="h6" gutterBottom>
          Statement History
        </Typography>
        
        {statements.length === 0 ? (
          <Typography color="text.secondary" align="center" sx={{ py: 4 }}>
            No statements uploaded yet. Upload your first bill above.
          </Typography>
        ) : (
          <TableContainer>
            <Table>
              <TableHead>
                <TableRow>
                  <TableCell>Date</TableCell>
                  <TableCell align="right">Total Due</TableCell>
                  <TableCell align="right">Potential Savings</TableCell>
                  <TableCell>Status</TableCell>
                  <TableCell align="right">Actions</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {statements.map((stmt) => (
                  <TableRow key={stmt.id}>
                    <TableCell>
                      {format(new Date(stmt.uploaded_at), 'dd MMM yyyy')}
                    </TableCell>
                    <TableCell align="right">
                      R{stmt.total_due?.toFixed(2) || '0.00'}
                    </TableCell>
                    <TableCell align="right">
                      {stmt.potential_savings > 0 ? (
                        <Chip
                          icon={<SavingsIcon />}
                          label={`R${stmt.potential_savings.toFixed(2)}`}
                          color="success"
                          size="small"
                        />
                      ) : (
                        'R0.00'
                      )}
                    </TableCell>
                    <TableCell>
                      {stmt.has_issues ? (
                        <Chip
                          icon={<ErrorIcon />}
                          label="Issues Found"
                          color="warning"
                          size="small"
                        />
                      ) : (
                        <Chip
                          icon={<CheckCircleIcon />}
                          label="Clean"
                          color="success"
                          size="small"
                        />
                      )}
                    </TableCell>
                    <TableCell align="right">
                      <Button size="small" variant="outlined">
                        View Report
                      </Button>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </TableContainer>
        )}
      </Paper>

      {/* Savings Summary Card */}
      {statements.length > 0 && (
        <Card sx={{ mt: 3, bgcolor: 'primary.light', color: 'white' }}>
          <CardContent>
            <Typography variant="h5" component="div">
              Total Potential Savings
            </Typography>
            <Typography variant="h3">
              R{statements.reduce((sum, s) => sum + (s.potential_savings || 0), 0).toFixed(2)}
            </Typography>
            <Typography variant="body2">
              Across {statements.length} statements
            </Typography>
          </CardContent>
          <CardActions>
            <Button size="small" color="inherit" sx={{ color: 'white' }}>
              Subscribe to Unlock All Reports
            </Button>
          </CardActions>
        </Card>
      )}
    </Container>
  );
};

export default Dashboard;