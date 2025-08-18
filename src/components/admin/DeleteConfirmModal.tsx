'use client';

import React, { useState, useEffect } from 'react';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  TextField,
  Typography,
  Box,
  Alert,
  List,
  ListItem,
  ListItemText,
  Divider,
  Chip,
} from '@mui/material';
import {
  Warning as WarningIcon,
  Delete as DeleteIcon,
  Info as InfoIcon,
} from '@mui/icons-material';

interface ReferenceInfo {
  table: string;
  count: number;
  description: string;
}

interface DeleteConfirmModalProps {
  open: boolean;
  onClose: () => void;
  onConfirm: () => void;
  title: string;
  itemName: string;
  itemType: 'category' | 'maker' | 'product' | 'series';
  references?: ReferenceInfo[];
  loading?: boolean;
}

export default function DeleteConfirmModal({
  open,
  onClose,
  onConfirm,
  title,
  itemName,
  itemType,
  references = [],
  loading = false,
}: DeleteConfirmModalProps) {
  const [confirmText, setConfirmText] = useState('');
  const [step, setStep] = useState<1 | 2>(1);

  useEffect(() => {
    if (open) {
      setConfirmText('');
      setStep(references.length > 0 ? 1 : 2);
    }
  }, [open, references.length]);

  const getRiskLevel = () => {
    const totalReferences = references.reduce((sum, ref) => sum + ref.count, 0);
    if (totalReferences === 0) return 'low';
    if (totalReferences < 10) return 'medium';
    return 'high';
  };

  const getRiskColor = () => {
    const risk = getRiskLevel();
    return risk === 'high' ? 'error' : risk === 'medium' ? 'warning' : 'info';
  };

  const getRiskMessage = () => {
    const risk = getRiskLevel();
    const totalReferences = references.reduce((sum, ref) => sum + ref.count, 0);
    
    if (risk === 'high') {
      return `⚠️ HIGH RISK: This ${itemType} is referenced by ${totalReferences} other records. Deletion may cause data integrity issues.`;
    } else if (risk === 'medium') {
      return `⚠️ MEDIUM RISK: This ${itemType} is referenced by ${totalReferences} other records.`;
    } else {
      return `✅ LOW RISK: This ${itemType} has no references and is safe to delete.`;
    }
  };

  const handleNext = () => {
    setStep(2);
  };

  const handleConfirm = () => {
    if (confirmText === 'DELETE') {
      onConfirm();
    }
  };

  const isConfirmValid = confirmText === 'DELETE';

  return (
    <Dialog
      open={open}
      onClose={onClose}
      maxWidth="md"
      fullWidth
      PaperProps={{
        sx: {
          borderRadius: '12px',
        },
      }}
    >
      <DialogTitle sx={{ pb: 1 }}>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
          <WarningIcon sx={{ color: getRiskColor() === 'error' ? 'error.main' : 'warning.main', fontSize: 28 }} />
          <Box>
            <Typography variant="h6" component="div">
              {title}
            </Typography>
            <Typography variant="body2" color="text.secondary">
              {step === 1 ? 'Review impact' : 'Confirm deletion'}
            </Typography>
          </Box>
        </Box>
      </DialogTitle>

      <DialogContent>
        {step === 1 && references.length > 0 ? (
          // Step 1: Show references and impact
          <Box>
            <Alert 
              severity={getRiskColor()} 
              sx={{ mb: 3 }}
              icon={<InfoIcon />}
            >
              {getRiskMessage()}
            </Alert>

            <Typography variant="h6" gutterBottom sx={{ mt: 2, mb: 2 }}>
              Impact Analysis
            </Typography>

            <Box sx={{ mb: 2 }}>
              <Typography variant="body2" color="text.secondary" gutterBottom>
                Deleting <strong>"{itemName}"</strong> will affect the following:
              </Typography>
            </Box>

            <List sx={{ bgcolor: 'background.paper', borderRadius: 1, border: '1px solid', borderColor: 'divider' }}>
              {references.map((ref, index) => (
                <React.Fragment key={ref.table}>
                  <ListItem>
                    <ListItemText
                      primary={
                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                          <Typography variant="body1" sx={{ fontWeight: 500 }}>
                            {ref.description}
                          </Typography>
                          <Chip 
                            label={`${ref.count} records`}
                            size="small"
                            color={ref.count > 5 ? 'error' : ref.count > 0 ? 'warning' : 'default'}
                          />
                        </Box>
                      }
                      secondary={`Table: ${ref.table}`}
                    />
                  </ListItem>
                  {index < references.length - 1 && <Divider />}
                </React.Fragment>
              ))}
            </List>

            <Alert severity="warning" sx={{ mt: 2 }}>
              <Typography variant="body2">
                <strong>Warning:</strong> This action cannot be undone. All related data will be permanently removed.
              </Typography>
            </Alert>
          </Box>
        ) : (
          // Step 2: Confirm deletion
          <Box>
            <Alert severity="error" sx={{ mb: 3 }}>
              <Typography variant="body1" sx={{ fontWeight: 500 }}>
                You are about to permanently delete:
              </Typography>
              <Typography variant="h6" sx={{ mt: 1, color: 'error.main' }}>
                "{itemName}"
              </Typography>
            </Alert>

            {references.length > 0 && (
              <Alert severity="warning" sx={{ mb: 3 }}>
                <Typography variant="body2">
                  This will also affect {references.reduce((sum, ref) => sum + ref.count, 0)} related records.
                </Typography>
              </Alert>
            )}

            <Typography variant="body1" gutterBottom sx={{ mb: 2 }}>
              To confirm this action, please type <strong>DELETE</strong> in the field below:
            </Typography>

            <TextField
              autoFocus
              fullWidth
              value={confirmText}
              onChange={(e) => setConfirmText(e.target.value.toUpperCase())}
              placeholder="Type DELETE to confirm"
              variant="outlined"
              error={confirmText.length > 0 && !isConfirmValid}
              helperText={confirmText.length > 0 && !isConfirmValid ? 'Please type DELETE exactly' : ''}
              sx={{
                '& .MuiOutlinedInput-root': {
                  '&.Mui-error': {
                    '& fieldset': {
                      borderColor: 'error.main',
                    },
                  },
                },
              }}
            />

            <Typography variant="body2" color="text.secondary" sx={{ mt: 2 }}>
              This action is permanent and cannot be undone.
            </Typography>
          </Box>
        )}
      </DialogContent>

      <DialogActions sx={{ px: 3, pb: 3 }}>
        <Button 
          onClick={onClose}
          disabled={loading}
        >
          Cancel
        </Button>
        
        {step === 1 && references.length > 0 ? (
          <Button
            onClick={handleNext}
            variant="outlined"
            color="warning"
            disabled={loading}
          >
            Continue
          </Button>
        ) : (
          <Button
            onClick={handleConfirm}
            variant="contained"
            color="error"
            disabled={!isConfirmValid || loading}
            startIcon={loading ? undefined : <DeleteIcon />}
            sx={{
              bgcolor: 'error.main',
              '&:hover': {
                bgcolor: 'error.dark',
              },
            }}
          >
            {loading ? 'Deleting...' : 'Delete Permanently'}
          </Button>
        )}
      </DialogActions>
    </Dialog>
  );
}