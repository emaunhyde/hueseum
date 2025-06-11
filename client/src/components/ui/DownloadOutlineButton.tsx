import React, { useState } from 'react';
import { 
  Button, 
  Tooltip, 
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  IconButton
} from '@mui/material';
import { Download as DownloadIcon, Close as CloseIcon } from '@mui/icons-material';
import { generateAdvancedOutline } from '@/lib/api/outline';
import { OutlineControls, OutlineSettings } from './OutlineControls';

export interface DownloadOutlineButtonProps {
  imageData: string | null;
  disabled?: boolean;
  variant?: 'text' | 'outlined' | 'contained';
  size?: 'small' | 'medium' | 'large';
}

export const DownloadOutlineButton: React.FC<DownloadOutlineButtonProps> = React.memo(({
  imageData,
  disabled = false,
  variant = 'outlined',
  size = 'medium',
}) => {
  const [isModalOpen, setIsModalOpen] = useState(false);

  const handleOpenModal = () => {
    if (!imageData || disabled) return;
    setIsModalOpen(true);
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
  };

  const handleDownload = async (settings: OutlineSettings) => {
    if (!imageData) return;

    try {
      // Generate outline with custom settings
      const blob = await generateAdvancedOutline({
        imageData,
        blurKernel: settings.blurKernel,
        cannyLow: settings.cannyLow,
        cannyHigh: settings.cannyHigh,
        dilateIterations: settings.dilateIterations,
      });
      
      // Create download
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = 'coloring-book-outline.svg';
      link.style.display = 'none';
      
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      
      // Clean up
      window.URL.revokeObjectURL(url);
      
      // Close modal after successful download
      setIsModalOpen(false);
      
    } catch (error) {
      console.error('Failed to generate outline:', error);
      // TODO: Add toast notification for error
    }
  };

  const isDisabled = disabled || !imageData;

  return (
    <>
      <Tooltip title={isDisabled ? 'Upload an image to generate outline' : 'Download coloring book outline'}>
        <span>
          <Button
            variant={variant}
            size={size}
            startIcon={<DownloadIcon />}
            onClick={handleOpenModal}
            disabled={isDisabled}
            sx={{
              minWidth: 160,
              '&:disabled': {
                opacity: 0.6,
              },
            }}
          >
            Download Outline
          </Button>
        </span>
      </Tooltip>

      <Dialog
        open={isModalOpen}
        onClose={handleCloseModal}
        maxWidth="sm"
        fullWidth
        PaperProps={{
          sx: {
            borderRadius: 2,
          }
        }}
      >
        <DialogTitle sx={{ 
          display: 'flex', 
          justifyContent: 'space-between', 
          alignItems: 'center',
          pb: 1
        }}>
          Outline Settings
          <IconButton
            onClick={handleCloseModal}
            size="small"
            sx={{ color: 'text.secondary' }}
          >
            <CloseIcon />
          </IconButton>
        </DialogTitle>
        
        <DialogContent sx={{ px: 3, py: 2 }}>
          <OutlineControls
            onDownload={handleDownload}
            imageData={imageData}
            disabled={false}
          />
        </DialogContent>
        
        <DialogActions sx={{ px: 3, pb: 3 }}>
          <Button onClick={handleCloseModal} color="inherit">
            Cancel
          </Button>
        </DialogActions>
      </Dialog>
    </>
  );
});

DownloadOutlineButton.displayName = 'DownloadOutlineButton';