'use client';

import { useState } from 'react';
import {
  Box,
  Typography,
  Card,
  CardContent,
  Button,
  Dialog,
  DialogTitle,
  DialogContent,
  Grid
} from '@mui/material';
import {
  CloudUpload as UploadIcon,
  Storage as StorageIcon
} from '@mui/icons-material';
import StorageDataGrid from '@/components/admin/StorageDataGrid';
import StorageUploadZone from '@/components/admin/StorageUploadZone';

export default function StoragePage() {
  const [uploadDialog, setUploadDialog] = useState(false);
  const [currentBucket, setCurrentBucket] = useState('downloads');
  const [currentFolder, setCurrentFolder] = useState('');
  const [refreshTrigger, setRefreshTrigger] = useState(0);

  const handleUploadComplete = () => {
    // Trigger refresh of the data grid
    setRefreshTrigger(prev => prev + 1);
    setUploadDialog(false);
  };

  const handleBucketChange = (bucket: string) => {
    setCurrentBucket(bucket);
    setCurrentFolder('');
  };

  const handleFolderChange = (folder: string) => {
    setCurrentFolder(folder);
  };

  return (
    <Box>
      {/* Header */}
      <Box sx={{ mb: 4 }}>
        <Typography variant="h4" component="h1" sx={{ fontWeight: 600, mb: 1 }}>
          Storage Management
        </Typography>
        <Typography variant="body1" color="text.secondary">
          Manage files across Supabase Storage buckets with centralized upload and organization.
        </Typography>
      </Box>

      {/* Quick Actions */}
      <Grid container spacing={3} sx={{ mb: 4 }}>
        <Grid size={{ xs: 12, md: 6, lg: 4 }}>
          <Card>
            <CardContent>
              <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                <UploadIcon color="primary" sx={{ mr: 1 }} />
                <Typography variant="h6">
                  Quick Upload
                </Typography>
              </Box>
              <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
                Upload multiple files to the current location with drag & drop support.
              </Typography>
              <Button
                variant="contained"
                startIcon={<UploadIcon />}
                onClick={() => setUploadDialog(true)}
                fullWidth
              >
                Upload Files
              </Button>
            </CardContent>
          </Card>
        </Grid>

        <Grid size={{ xs: 12, md: 6, lg: 4 }}>
          <Card>
            <CardContent>
              <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                <StorageIcon color="primary" sx={{ mr: 1 }} />
                <Typography variant="h6">
                  Current Location
                </Typography>
              </Box>
              <Typography variant="body2" color="text.secondary" sx={{ mb: 1 }}>
                <strong>Bucket:</strong> {currentBucket}
              </Typography>
              <Typography variant="body2" color="text.secondary">
                <strong>Folder:</strong> {currentFolder || '/'}
              </Typography>
            </CardContent>
          </Card>
        </Grid>
      </Grid>

      {/* Main Storage Grid */}
      <Card>
        <CardContent sx={{ p: 3 }}>
          <StorageDataGrid
            key={refreshTrigger} // Force refresh when needed
            onBucketChange={handleBucketChange}
            onFolderChange={handleFolderChange}
            currentBucket={currentBucket}
            currentFolder={currentFolder}
          />
        </CardContent>
      </Card>

      {/* Upload Dialog */}
      <Dialog
        open={uploadDialog}
        onClose={() => setUploadDialog(false)}
        maxWidth="md"
        fullWidth
        PaperProps={{
          sx: { minHeight: 400 }
        }}
      >
        <DialogTitle sx={{ pb: 2 }}>
          <Box sx={{ display: 'flex', alignItems: 'center' }}>
            <UploadIcon sx={{ mr: 1 }} />
            Upload Files to {currentBucket}/{currentFolder || 'root'}
          </Box>
        </DialogTitle>
        <DialogContent>
          <StorageUploadZone
            bucket={currentBucket}
            folder={currentFolder}
            onUploadComplete={handleUploadComplete}
            maxFiles={20}
            maxSize={50}
            accept={['*/*']}
          />
        </DialogContent>
      </Dialog>
    </Box>
  );
}