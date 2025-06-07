'use client';

import { Box, Paper, Skeleton, Fade } from '@mui/material';
import { CanvasImage } from '@/components/ui/CanvasImage';
import { useImageDisplay } from '../hooks/useImageDisplay';
import type { ImageDisplayProps } from '../types';
import { IMAGE_ANALYSIS_CONSTANTS } from '../types';

export const ImageDisplay = ({ imageSrc }: ImageDisplayProps) => {
  const {
    leftCanvasRef,
    rightCanvasRef,
    handleLeftImageClick,
    handleLeftPointerEnter,
    handleLeftPointerLeave,
    handleRightImageClick,
    imageLoaded,
  } = useImageDisplay(imageSrc);


  return (
    <Box 
      sx={{ 
        display: 'flex',
        height: IMAGE_ANALYSIS_CONSTANTS.CONTAINER_HEIGHT,
        '@media (max-width: 768px)': {
          flexDirection: 'column',
          height: 'auto',
        },
      }}
    >
      {/* Left Image Canvas - Original with max height */}
      <Paper 
        elevation={2}
        square
        sx={{ 
          display: 'flex', 
          alignItems: 'flex-start',
          overflow: 'hidden',
          transition: 'box-shadow 0.3s ease',
          '&:hover': {
            boxShadow: (theme) => theme.shadows[4],
          },
        }}
      >
        {!imageLoaded ? (
          <Skeleton
            variant="rectangular"
            width={200}
            height={IMAGE_ANALYSIS_CONSTANTS.CONTAINER_HEIGHT}
            animation="wave"
          />
        ) : (
          <Fade in={imageLoaded} timeout={500}>
            <CanvasImage
              ref={leftCanvasRef}
              onPointerDown={handleLeftImageClick}
              onPointerEnter={handleLeftPointerEnter}
              onPointerLeave={handleLeftPointerLeave}
              interactive
              style={{ maxHeight: IMAGE_ANALYSIS_CONSTANTS.CONTAINER_HEIGHT }}
            />
          </Fade>
        )}
      </Paper>

      {/* Right Image Canvas - Zoom container */}
      <Paper
        elevation={2}
        square
        sx={{ 
          flex: 1, 
          display: 'flex', 
          alignItems: 'flex-start',
          overflow: 'hidden',
          minHeight: IMAGE_ANALYSIS_CONSTANTS.CONTAINER_HEIGHT,
        }}
      >
        {!imageLoaded ? (
          <Skeleton
            variant="rectangular"
            width="100%"
            height={IMAGE_ANALYSIS_CONSTANTS.CONTAINER_HEIGHT}
            animation="wave"
          />
        ) : (
          <Fade in={imageLoaded} timeout={500}>
            <CanvasImage
              ref={rightCanvasRef}
              onPointerDown={handleRightImageClick}
              interactive
              style={{
                height: IMAGE_ANALYSIS_CONSTANTS.CONTAINER_HEIGHT,
                width: '100%',
              }}
            />
          </Fade>
        )}
      </Paper>
    </Box>
  );
};