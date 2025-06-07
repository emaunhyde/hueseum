'use client';

import { useState } from 'react';
import { Box, Typography, Container, Stack, Fade } from '@mui/material';
import { FileUpload } from '@/features/file-upload';
import { ImageDisplay } from '@/features/image-analysis';
import { ErrorBoundary } from '@/components/ui/ErrorBoundary';
import { SuspenseWrapper } from '@/components/ui/SuspenseWrapper';

export default function Home() {
  const [selectedImage, setSelectedImage] = useState<string | null>(null);

  const handleFileSelect = (file: File) => {
    if (file.type.startsWith('image/')) {
      const reader = new FileReader();
      reader.onload = (e) => {
        setSelectedImage(e.target?.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  if (selectedImage) {
    return (
      <Box sx={{ p: 2 }}>
        <ImageDisplay imageSrc={selectedImage} />
      </Box>
    );
  }

  return (
    <Box 
      sx={{ 
        minHeight: '100vh',
        background: (theme) => 
          `linear-gradient(135deg, ${theme.palette.grey[50]} 0%, ${theme.palette.grey[100]} 100%)`,
        display: 'flex', 
        alignItems: 'center', 
        justifyContent: 'center',
        py: 4,
      }}
    >
      <Container maxWidth="md">
        <Fade in timeout={800}>
          <Stack spacing={6} alignItems="center" textAlign="center">
            <Stack spacing={2}>
              <Typography 
                variant="h2" 
                component="h1"
                sx={{ 
                  fontWeight: 800,
                  background: (theme) => 
                    `linear-gradient(45deg, ${theme.palette.primary.main}, ${theme.palette.secondary.main})`,
                  backgroundClip: 'text',
                  WebkitBackgroundClip: 'text',
                  color: 'transparent',
                  fontSize: { xs: '2.5rem', md: '3.5rem' },
                }}
              >
                Hueseum
              </Typography>
              <Typography 
                variant="h5" 
                sx={{ 
                  color: 'text.secondary',
                  fontWeight: 400,
                  maxWidth: 600,
                  mx: 'auto'
                }}
              >
                Upload an image to analyze its colors and explore the palette
              </Typography>
            </Stack>
            
            <ErrorBoundary>
              <FileUpload 
                onFileSelect={handleFileSelect}
                buttonTitle="Upload Image"
                accept="image/*"
              />
            </ErrorBoundary>
          </Stack>
        </Fade>
      </Container>
    </Box>
  );
}
