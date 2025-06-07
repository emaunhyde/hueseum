'use client';

import { Suspense, ReactNode } from 'react';
import { Box, CircularProgress, Typography, Fade } from '@mui/material';

interface SuspenseWrapperProps {
  children: ReactNode;
  fallback?: ReactNode;
  loadingText?: string;
}

const DefaultLoader = ({ loadingText }: { loadingText?: string }) => (
  <Fade in timeout={300}>
    <Box
      sx={{
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        gap: 2,
        p: 4,
        minHeight: 200,
      }}
    >
      <CircularProgress size={40} thickness={4} />
      {loadingText && (
        <Typography variant="body2" color="text.secondary">
          {loadingText}
        </Typography>
      )}
    </Box>
  </Fade>
);

export const SuspenseWrapper = ({
  children,
  fallback,
  loadingText = 'Loading...',
}: SuspenseWrapperProps) => {
  return (
    <Suspense fallback={fallback || <DefaultLoader loadingText={loadingText} />}>
      {children}
    </Suspense>
  );
};