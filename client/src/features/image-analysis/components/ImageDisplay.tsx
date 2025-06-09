'use client';

import React from 'react';
import { Box, Paper, Skeleton, Fade, Tooltip } from '@mui/material';
import { CanvasImage } from '@/components/ui/CanvasImage';
import { useImageDisplay } from '../hooks/useImageDisplay';
import type { ImageDisplayProps } from '../types';
import { IMAGE_ANALYSIS_CONSTANTS } from '../types';

export const ImageDisplay = React.memo(({ imageSrc, onPixelColorChange }: ImageDisplayProps) => {
  const {
    leftCanvasRef,
    rightCanvasRef,
    handleLeftImageClick,
    handleLeftPointerEnter,
    handleLeftPointerLeave,
    handleRightImageClick,
    handleRightMouseMove,
    handleRightPointerEnter,
    handleRightPointerLeave,
    imageLoaded,
    pixelColor,
    isLoadingPixelColor,
    hoverColor,
    pixelGrid,
    isHoveringRight,
  } = useImageDisplay(imageSrc);

  // Notify parent component when pixel color changes
  React.useEffect(() => {
    if (onPixelColorChange) {
      onPixelColorChange(pixelColor, isLoadingPixelColor);
    }
  }, [pixelColor, isLoadingPixelColor, onPixelColorChange]);


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
            <Tooltip
              open={isHoveringRight && !!hoverColor}
              title={
                hoverColor && pixelGrid ? (
                    <Box
                      sx={{
                        position: 'relative',
                        display: 'grid',
                        gridTemplateColumns: 'repeat(7, 6px)',
                        gridTemplateRows: 'repeat(7, 6px)',
                        gap: '1px',
                        backgroundColor: '#D7D7D7',
                        borderRadius: 1,
                        flexShrink: 0,
                     
                      }}
                    >
                      {pixelGrid.flat().map((color, index) => (
                        <Box
                          key={index}
                          sx={{
                            width: 6,
                            height: 6,
                            backgroundColor: color,
                          }}
                        />
                      ))}
                      
                      {/* Center overlay showing sampled color */}
                      <Box
                        sx={{
                          position: 'absolute',
                          top: '50%',
                          left: '50%',
                          transform: 'translate(-50%, -50%)',
                          width: 12,
                          height: 12,
                          backgroundColor: hoverColor.hex,
                          border: '2px solid white',
                          boxShadow: '0 0 0 1px rgba(0, 0, 0, 0.3)',
                        }}
                      />
                    </Box>
                ) : ''
              }
              placement="top"
              arrow
              followCursor
              PopperProps={{
                sx: {
                  '& .MuiTooltip-tooltip': {
                    backgroundColor: 'white',
                    color: '#333',
                    boxShadow: '0 8px 32px rgba(0, 0, 0, 0.12), 0 2px 8px rgba(0, 0, 0, 0.08)',
                    border: '1px solid rgba(0, 0, 0, 0.1)',
                    borderRadius: 2,
                    fontSize: '13px',
                  },
                  '& .MuiTooltip-arrow': {
                    color: 'white',
                    '&::before': {
                      border: '1px solid rgba(0, 0, 0, 0.1)',
                    },
                  },
                },
              }}
            >
              <CanvasImage
                ref={rightCanvasRef}
                onPointerDown={handleRightImageClick}
                onMouseMove={handleRightMouseMove}
                onMouseEnter={handleRightPointerEnter}
                onMouseLeave={handleRightPointerLeave}
                interactive
                style={{
                  height: IMAGE_ANALYSIS_CONSTANTS.CONTAINER_HEIGHT,
                  width: '100%',
                  cursor: 'crosshair',
                }}
              />
            </Tooltip>
          </Fade>
        )}
      </Paper>
    </Box>
  );
});

ImageDisplay.displayName = 'ImageDisplay';