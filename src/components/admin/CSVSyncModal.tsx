'use client';

import React, { useState, useCallback } from 'react';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  Typography,
  Box,
  Alert,
  Stepper,
  Step,
  StepLabel,
  Paper,
  Checkbox,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Chip,
  LinearProgress,
  Accordion,
  AccordionSummary,
  AccordionDetails,
  FormControlLabel,
  Tabs,
  Tab,
  Divider,
} from '@mui/material';
import {
  CloudUpload as UploadIcon,
  CheckCircle as CheckIcon,
  Error as ErrorIcon,
  Warning as WarningIcon,
  ExpandMore as ExpandMoreIcon,
  Sync as SyncIcon,
  Info as InfoIcon,
  Transform as TransformIcon,
} from '@mui/icons-material';
import { CSVProcessor } from '@/lib/CSVProcessor';
import SpecificationRenderer from './SpecificationRenderer';

interface SyncOperation {
  id: string;
  type: 'INSERT' | 'UPDATE' | 'DELETE' | 'SKIP';
  table: string;
  data: Record<string, any>;
  reason: string;
  conflicts?: string[];
  selected: boolean;
}

interface CSVSyncModalProps {
  open: boolean;
  onClose: () => void;
  onSync: (operations: SyncOperation[]) => Promise<void>;
  tableName: string;
  title: string;
}

export default function CSVSyncModal({
  open,
  onClose,
  onSync,
  tableName,
  title,
}: CSVSyncModalProps) {
  const [currentStep, setCurrentStep] = useState(0);
  const [csvFile, setCsvFile] = useState<File | null>(null);
  const [operations, setOperations] = useState<SyncOperation[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [dragActive, setDragActive] = useState(false);
  const [progress, setProgress] = useState(0);
  const [processingResult, setProcessingResult] = useState<any>(null);
  const [selectedTab, setSelectedTab] = useState(0);

  const steps = ['Upload CSV', 'Review Changes', 'Apply Changes'];

  const handleReset = () => {
    setCurrentStep(0);
    setCsvFile(null);
    setOperations([]);
    setLoading(false);
    setError(null);
    setProgress(0);
    setProcessingResult(null);
    setSelectedTab(0);
  };

  const handleClose = () => {
    handleReset();
    onClose();
  };

  // Handle file upload
  const handleFileUpload = (file: File) => {
    if (!file || !file.name.endsWith('.csv')) {
      setError('Please select a valid CSV file');
      return;
    }

    setCsvFile(file);
    setError(null);
  };

  // Handle drag and drop
  const handleDrag = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === 'dragenter' || e.type === 'dragover') {
      setDragActive(true);
    } else if (e.type === 'dragleave') {
      setDragActive(false);
    }
  }, []);

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);
    
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      handleFileUpload(e.dataTransfer.files[0]);
    }
  }, []);

  // Parse CSV and analyze changes using CSVProcessor
  const handleAnalyzeCSV = async () => {
    if (!csvFile) return;

    setLoading(true);
    setError(null);
    setProgress(10);

    try {
      setProgress(30);

      // Use CSVProcessor to parse and analyze the file
      const result = await CSVProcessor.parseCSVFile(csvFile);
      setProcessingResult(result);

      setProgress(60);

      if (!result.success) {
        // Show errors but still allow proceeding if there are some valid rows
        const errorMessages = result.errors
          .filter(e => e.severity === 'error')
          .map(e => `Row ${e.rowIndex}: ${e.error}`)
          .join(', ');
        
        if (result.data.length === 0) {
          throw new Error(`CSV processing failed: ${errorMessages}`);
        } else {
          setError(`Some issues found: ${errorMessages}`);
        }
      }

      // Generate sync operations from the parsed data
      const syncOperations = CSVProcessor.generateSyncOperations(result.data);
      
      // Convert to our SyncOperation format
      const operations: SyncOperation[] = syncOperations.map(op => ({
        id: op.id,
        type: op.type as 'INSERT' | 'UPDATE' | 'DELETE' | 'SKIP',
        table: tableName,
        data: op.data,
        reason: op.reason,
        conflicts: op.conflicts,
        selected: op.selected,
      }));

      setOperations(operations);
      setProgress(100);
      setCurrentStep(1);
      
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to parse CSV file');
    } finally {
      setLoading(false);
      setTimeout(() => setProgress(0), 1000);
    }
  };

  // Handle operation selection
  const handleOperationToggle = (operationId: string) => {
    setOperations(prev => 
      prev.map(op => 
        op.id === operationId 
          ? { ...op, selected: !op.selected }
          : op
      )
    );
  };

  // Select/deselect all operations of a type
  const handleSelectAllByType = (type: SyncOperation['type'], selected: boolean) => {
    setOperations(prev => 
      prev.map(op => 
        op.type === type 
          ? { ...op, selected }
          : op
      )
    );
  };

  // Apply selected changes
  const handleApplyChanges = async () => {
    const selectedOperations = operations.filter(op => op.selected);
    
    if (selectedOperations.length === 0) {
      setError('Please select at least one operation to apply');
      return;
    }

    setLoading(true);
    setCurrentStep(2);
    
    try {
      await onSync(selectedOperations);
      // Success - close modal after a brief delay
      setTimeout(() => {
        handleClose();
      }, 2000);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to apply changes');
      setLoading(false);
    }
  };

  // Get operation summary
  const getOperationSummary = () => {
    const summary = operations.reduce((acc, op) => {
      if (op.selected) {
        acc[op.type] = (acc[op.type] || 0) + 1;
      }
      return acc;
    }, {} as Record<string, number>);

    return summary;
  };

  const getOperationColor = (type: SyncOperation['type']) => {
    switch (type) {
      case 'INSERT': return 'success';
      case 'UPDATE': return 'warning';
      case 'DELETE': return 'error';
      case 'SKIP': return 'default';
      default: return 'default';
    }
  };

  const getOperationIcon = (type: SyncOperation['type']) => {
    switch (type) {
      case 'INSERT': return <CheckIcon />;
      case 'UPDATE': return <WarningIcon />;
      case 'DELETE': return <ErrorIcon />;
      case 'SKIP': return null;
      default: return null;
    }
  };

  return (
    <Dialog
      open={open}
      onClose={handleClose}
      maxWidth="lg"
      fullWidth
      PaperProps={{
        sx: {
          borderRadius: '12px',
          minHeight: '70vh',
        },
      }}
    >
      <DialogTitle sx={{ pb: 1 }}>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
          <SyncIcon sx={{ color: 'primary.main', fontSize: 28 }} />
          <Box>
            <Typography variant="h6" component="div">
              {title} - CSV Sync
            </Typography>
            <Typography variant="body2" color="text.secondary">
              Smart synchronization with change preview
            </Typography>
          </Box>
        </Box>
      </DialogTitle>

      <DialogContent>
        {/* Progress */}
        {loading && progress > 0 && (
          <Box sx={{ mb: 3 }}>
            <LinearProgress variant="determinate" value={progress} />
            <Typography variant="body2" color="text.secondary" sx={{ mt: 1 }}>
              {progress < 30 ? 'Reading file...' :
               progress < 60 ? 'Parsing CSV...' :
               progress < 100 ? 'Analyzing changes...' : 'Complete!'}
            </Typography>
          </Box>
        )}

        {/* Stepper */}
        <Stepper activeStep={currentStep} sx={{ mb: 4 }}>
          {steps.map((label) => (
            <Step key={label}>
              <StepLabel>{label}</StepLabel>
            </Step>
          ))}
        </Stepper>

        {/* Error Display */}
        {error && (
          <Alert severity="error" sx={{ mb: 3 }}>
            {error}
          </Alert>
        )}

        {/* Step 0: File Upload */}
        {currentStep === 0 && (
          <Box>
            <Typography variant="h6" gutterBottom>
              Upload CSV File
            </Typography>
            <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
              Upload a CSV file to synchronize with your {tableName} data. Use flat CSV format with spec_ prefixes for specifications (e.g., spec_scan_width, spec_dpi).
            </Typography>
            
            {/* Template Info */}
            <Alert severity="info" sx={{ mb: 3 }}>
              <Typography variant="body2">
                <strong>Tip:</strong> Use CSV templates with spec_ prefixes like: spec_scan_width, spec_dpi, spec_line_rate. 
                The system will automatically convert these to JSONB specifications format.
              </Typography>
            </Alert>

            {/* File Drop Zone */}
            <Paper
              sx={{
                p: 4,
                textAlign: 'center',
                border: '2px dashed',
                borderColor: dragActive ? 'primary.main' : 'grey.300',
                backgroundColor: dragActive ? 'action.hover' : 'background.paper',
                cursor: 'pointer',
                transition: 'all 0.2s ease-in-out',
                '&:hover': {
                  borderColor: 'primary.main',
                  backgroundColor: 'action.hover',
                },
              }}
              onDragEnter={handleDrag}
              onDragLeave={handleDrag}
              onDragOver={handleDrag}
              onDrop={handleDrop}
              onClick={() => document.getElementById('csv-file-input')?.click()}
            >
              <input
                id="csv-file-input"
                type="file"
                accept=".csv"
                style={{ display: 'none' }}
                onChange={(e) => e.target.files?.[0] && handleFileUpload(e.target.files[0])}
              />
              
              <UploadIcon sx={{ fontSize: 48, color: 'primary.main', mb: 2 }} />
              <Typography variant="h6" gutterBottom>
                {csvFile ? csvFile.name : 'Drop your CSV file here'}
              </Typography>
              <Typography variant="body2" color="text.secondary">
                {csvFile 
                  ? `File size: ${(csvFile.size / 1024).toFixed(1)} KB`
                  : 'or click to browse files'
                }
              </Typography>
              
              {csvFile && (
                <Chip
                  label="File loaded"
                  color="success"
                  icon={<CheckIcon />}
                  sx={{ mt: 2 }}
                />
              )}
            </Paper>
          </Box>
        )}

        {/* Step 1: Review Changes */}
        {currentStep === 1 && (
          <Box>
            <Typography variant="h6" gutterBottom>
              Review Changes
            </Typography>
            <Typography variant="body2" color="text.secondary" sx={{ mb: 3 }}>
              Review the changes that will be applied. The system has converted your flat CSV format to structured database format.
            </Typography>

            {/* Processing Summary */}
            {processingResult && (
              <Alert 
                severity={processingResult.success ? "success" : "warning"} 
                icon={<InfoIcon />}
                sx={{ mb: 3 }}
              >
                <Typography variant="body2">
                  <strong>Processing Summary:</strong> {CSVProcessor.getProcessingStats(processingResult).summary}
                  {processingResult.summary.detectedCategory && (
                    <Chip 
                      label={`Detected: ${processingResult.summary.detectedCategory}`}
                      size="small" 
                      color="primary" 
                      sx={{ ml: 1 }}
                    />
                  )}
                </Typography>
                <Typography variant="body2" sx={{ mt: 1 }}>
                  Processed {processingResult.summary.totalRows} rows with {processingResult.summary.specificationFields.length} specification fields
                </Typography>
              </Alert>
            )}

            {/* Operations Summary */}
            <Alert severity="info" sx={{ mb: 3 }}>
              <Typography variant="body2">
                <strong>Operations:</strong> {Object.entries(getOperationSummary()).map(([type, count]) => 
                  `${count} ${type.toLowerCase()}`
                ).join(', ') || 'No operations selected'}
              </Typography>
            </Alert>

            {/* Tabbed View */}
            <Paper sx={{ mb: 3 }}>
              <Tabs 
                value={selectedTab} 
                onChange={(_, newValue) => setSelectedTab(newValue)}
                indicatorColor="primary"
              >
                <Tab label="Operations" icon={<SyncIcon />} />
                <Tab label="CSV Preview" icon={<TransformIcon />} />
                {processingResult?.summary.specificationFields.length > 0 && (
                  <Tab label="Specifications" icon={<InfoIcon />} />
                )}
              </Tabs>
              
              <Divider />

              {/* Tab Panel 0: Operations */}
              {selectedTab === 0 && (
                <Box sx={{ p: 2 }}>
                  {/* Operations by Type */}
                  {['INSERT', 'UPDATE', 'DELETE', 'SKIP'].map(type => {
                    const typeOperations = operations.filter(op => op.type === type);
                    if (typeOperations.length === 0) return null;

                    return (
                      <Accordion key={type} defaultExpanded={type !== 'SKIP'}>
                        <AccordionSummary expandIcon={<ExpandMoreIcon />}>
                          <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, width: '100%' }}>
                            <Chip
                              label={`${type} (${typeOperations.length})`}
                              color={getOperationColor(type as SyncOperation['type'])}
                              icon={getOperationIcon(type as SyncOperation['type'])}
                              size="small"
                            />
                            <FormControlLabel
                              control={
                                <Checkbox
                                  checked={typeOperations.every(op => op.selected)}
                                  indeterminate={typeOperations.some(op => op.selected) && !typeOperations.every(op => op.selected)}
                                  onChange={(e) => handleSelectAllByType(type as SyncOperation['type'], e.target.checked)}
                                />
                              }
                              label="Select All"
                              onClick={(e) => e.stopPropagation()}
                            />
                          </Box>
                        </AccordionSummary>
                        <AccordionDetails>
                          <TableContainer>
                            <Table size="small">
                              <TableHead>
                                <TableRow>
                                  <TableCell padding="checkbox">Select</TableCell>
                                  <TableCell>Data Preview</TableCell>
                                  <TableCell>Reason</TableCell>
                                  <TableCell>Conflicts</TableCell>
                                </TableRow>
                              </TableHead>
                              <TableBody>
                                {typeOperations.map((operation) => (
                                  <TableRow key={operation.id}>
                                    <TableCell padding="checkbox">
                                      <Checkbox
                                        checked={operation.selected}
                                        onChange={() => handleOperationToggle(operation.id)}
                                      />
                                    </TableCell>
                                    <TableCell>
                                      <Typography variant="body2" sx={{ fontFamily: 'monospace', fontSize: '11px' }}>
                                        {operation.data.part_number && `${operation.data.part_number} | `}
                                        {operation.data.specifications && Object.keys(operation.data.specifications).length > 0 
                                          ? `Specs: ${Object.keys(operation.data.specifications).join(', ')}`
                                          : JSON.stringify(operation.data).substring(0, 60) + '...'
                                        }
                                      </Typography>
                                    </TableCell>
                                    <TableCell>
                                      <Typography variant="body2">
                                        {operation.reason}
                                      </Typography>
                                    </TableCell>
                                    <TableCell>
                                      {operation.conflicts?.map((conflict, index) => (
                                        <Chip
                                          key={index}
                                          label={conflict}
                                          size="small"
                                          color="error"
                                          variant="outlined"
                                          sx={{ mr: 0.5 }}
                                        />
                                      ))}
                                    </TableCell>
                                  </TableRow>
                                ))}
                              </TableBody>
                            </Table>
                          </TableContainer>
                        </AccordionDetails>
                      </Accordion>
                    );
                  })}
                </Box>
              )}

              {/* Tab Panel 1: CSV Conversion Preview */}
              {selectedTab === 1 && processingResult && (
                <Box sx={{ p: 2 }}>
                  <Typography variant="subtitle2" gutterBottom>
                    CSV to Database Conversion Preview
                  </Typography>
                  <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
                    This shows how your flat CSV columns are converted to structured database format with JSONB specifications.
                  </Typography>
                  
                  {processingResult.data.slice(0, 3).map((row: any, index: number) => (
                    <Accordion key={index} sx={{ mb: 1 }}>
                      <AccordionSummary expandIcon={<ExpandMoreIcon />}>
                        <Typography variant="body2">
                          Row {row.rowIndex}: {row.basicFields.part_number || `Product ${index + 1}`}
                          {Object.keys(row.specifications).length > 0 && (
                            <Chip 
                              label={`${Object.keys(row.specifications).length} specs`}
                              size="small"
                              sx={{ ml: 1 }}
                            />
                          )}
                        </Typography>
                      </AccordionSummary>
                      <AccordionDetails>
                        <Box sx={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 2 }}>
                          {/* Original CSV Format */}
                          <Box>
                            <Typography variant="subtitle3" sx={{ fontWeight: 600, mb: 1, display: 'block' }}>
                              Original CSV Format:
                            </Typography>
                            <Paper variant="outlined" sx={{ p: 1, bgcolor: 'grey.50' }}>
                              <Typography variant="body2" sx={{ fontFamily: 'monospace', fontSize: '11px' }}>
                                {Object.entries(row.originalRow)
                                  .filter(([key, value]) => value !== '' && value !== null)
                                  .map(([key, value]) => `${key}: "${value}"`)
                                  .join('\n')
                                }
                              </Typography>
                            </Paper>
                          </Box>

                          {/* Structured Database Format */}
                          <Box>
                            <Typography variant="subtitle3" sx={{ fontWeight: 600, mb: 1, display: 'block' }}>
                              Database Format:
                            </Typography>
                            <Paper variant="outlined" sx={{ p: 1, bgcolor: 'primary.50' }}>
                              <Typography variant="body2" sx={{ fontFamily: 'monospace', fontSize: '11px' }}>
                                {/* Basic Fields */}
                                {Object.entries(row.basicFields)
                                  .filter(([key, value]) => value !== null && value !== '')
                                  .map(([key, value]) => `${key}: ${JSON.stringify(value)}`)
                                  .join('\n')
                                }
                                {Object.keys(row.specifications).length > 0 && (
                                  <>
                                    {'\n'}specifications: {JSON.stringify(row.specifications, null, 2)}
                                  </>
                                )}
                              </Typography>
                            </Paper>
                          </Box>
                        </Box>
                      </AccordionDetails>
                    </Accordion>
                  ))}
                  
                  {processingResult.data.length > 3 && (
                    <Typography variant="body2" color="text.secondary" align="center" sx={{ mt: 2 }}>
                      ... and {processingResult.data.length - 3} more rows
                    </Typography>
                  )}
                </Box>
              )}

              {/* Tab Panel 2: Specifications Preview */}
              {selectedTab === 2 && processingResult?.summary.specificationFields.length > 0 && (
                <Box sx={{ p: 2 }}>
                  <Typography variant="subtitle2" gutterBottom>
                    Detected Specifications
                  </Typography>
                  
                  {/* Sample specifications from first row */}
                  {processingResult.data.length > 0 && Object.keys(processingResult.data[0].specifications).length > 0 && (
                    <Box sx={{ mb: 2 }}>
                      <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
                        Preview of how specifications will appear in the product details:
                      </Typography>
                      <SpecificationRenderer
                        specifications={processingResult.data[0].specifications}
                        categoryName={processingResult.summary.detectedCategory}
                        variant="table"
                        maxItems={10}
                      />
                    </Box>
                  )}

                  {/* Specification Fields Summary */}
                  <Typography variant="body2" color="text.secondary" sx={{ mt: 2 }}>
                    <strong>Detected specification fields:</strong> {processingResult.summary.specificationFields.join(', ')}
                  </Typography>
                </Box>
              )}
            </Paper>
          </Box>
        )}

        {/* Step 2: Apply Changes */}
        {currentStep === 2 && (
          <Box sx={{ textAlign: 'center', py: 4 }}>
            {loading ? (
              <>
                <SyncIcon sx={{ fontSize: 64, color: 'primary.main', mb: 2 }} />
                <Typography variant="h6" gutterBottom>
                  Applying Changes...
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  Please wait while we synchronize your data.
                </Typography>
                <LinearProgress sx={{ mt: 3, maxWidth: 400, mx: 'auto' }} />
              </>
            ) : (
              <>
                <CheckIcon sx={{ fontSize: 64, color: 'success.main', mb: 2 }} />
                <Typography variant="h6" gutterBottom>
                  Synchronization Complete!
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  All selected changes have been applied successfully.
                </Typography>
              </>
            )}
          </Box>
        )}
      </DialogContent>

      <DialogActions sx={{ px: 3, pb: 3 }}>
        <Button onClick={handleClose} disabled={loading}>
          {currentStep === 2 && !loading ? 'Close' : 'Cancel'}
        </Button>
        
        {currentStep === 0 && (
          <Button
            onClick={handleAnalyzeCSV}
            variant="contained"
            disabled={!csvFile || loading}
            startIcon={loading ? undefined : <SyncIcon />}
          >
            {loading ? 'Analyzing...' : 'Analyze CSV'}
          </Button>
        )}
        
        {currentStep === 1 && (
          <Button
            onClick={handleApplyChanges}
            variant="contained"
            disabled={operations.filter(op => op.selected).length === 0}
            startIcon={<CheckIcon />}
          >
            Apply Changes ({operations.filter(op => op.selected).length})
          </Button>
        )}
      </DialogActions>
    </Dialog>
  );
}