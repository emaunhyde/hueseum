import React from 'react';
import { 
  Box, 
  Typography, 
  Paper, 
  Stack, 
  Chip, 
  Skeleton, 
  Alert,
  Divider 
} from '@mui/material';
import { MunsellSlice } from './MunsellSlice';
import { useMunsellMatch } from '@/hooks/useMunsellMatch';

export interface MunsellDisplayProps {
  hex: string | null;
  title?: string;
}

// Split swatch component showing original vs Munsell match
const SplitColorSwatch: React.FC<{
  originalColor: string;
  munsellColor: string;
  size?: number;
}> = ({ originalColor, munsellColor, size = 64 }) => {
  return (
    <Box
      sx={{
        position: 'relative',
        width: size,
        height: size,
        borderRadius: 1,
        overflow: 'hidden',
        border: '2px solid',
        borderColor: 'grey.300',
        boxShadow: 2,
      }}
    >
      {/* Original color - top-left triangle */}
      <Box
        sx={{
          position: 'absolute',
          top: 0,
          left: 0,
          width: '100%',
          height: '100%',
          backgroundColor: originalColor,
          clipPath: 'polygon(0 0, 100% 0, 0 100%)',
        }}
      />
      
      {/* Munsell match - bottom-right triangle */}
      <Box
        sx={{
          position: 'absolute',
          top: 0,
          left: 0,
          width: '100%',
          height: '100%',
          backgroundColor: munsellColor,
          clipPath: 'polygon(100% 0, 100% 100%, 0 100%)',
        }}
      />
      
      {/* Diagonal separator line */}
      <Box
        sx={{
          position: 'absolute',
          top: 0,
          left: 0,
          width: '100%',
          height: '100%',
          '&::after': {
            content: '""',
            position: 'absolute',
            top: 0,
            left: 0,
            width: '141.42%', // sqrt(2) * 100% to cover diagonal
            height: '1px',
            backgroundColor: 'rgba(0, 0, 0, 0.2)',
            transformOrigin: '0 0',
            transform: 'rotate(45deg)',
          },
        }}
      />
    </Box>
  );
};

export const MunsellDisplay: React.FC<MunsellDisplayProps> = ({
  hex,
  title = "Munsell Match",
}) => {
  const { munsellData, isLoading, error } = useMunsellMatch(hex);

  if (isLoading) {
    return (
      <Paper elevation={2} sx={{ p: 3 }}>
        <Typography variant="h6" sx={{ mb: 2, fontWeight: 600 }}>
          {title}
        </Typography>
        <Stack spacing={2}>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
            <Skeleton variant="circular" width={48} height={48} />
            <Stack spacing={1}>
              <Skeleton variant="text" width={120} height={24} />
              <Skeleton variant="text" width={80} height={20} />
            </Stack>
          </Box>
          <Divider />
          <Box sx={{ display: 'grid', gridTemplateColumns: 'repeat(8, 1fr)', gap: 1 }}>
            {Array.from({ length: 32 }).map((_, i) => (
              <Skeleton key={i} variant="rectangular" width={32} height={32} />
            ))}
          </Box>
        </Stack>
      </Paper>
    );
  }

  if (error) {
    return (
      <Paper elevation={2} sx={{ p: 3 }}>
        <Typography variant="h6" sx={{ mb: 2, fontWeight: 600 }}>
          {title}
        </Typography>
        <Alert severity="error" sx={{ mb: 2 }}>
          {error}
        </Alert>
        <Typography variant="body2" color="text.secondary">
          Make sure the Munsell database is initialized and the server is running.
        </Typography>
      </Paper>
    );
  }

  if (!hex || !munsellData) {
    return (
      <Paper elevation={2} sx={{ p: 3, opacity: 0.6 }}>
        <Typography variant="h6" sx={{ mb: 2, fontWeight: 600 }}>
          {title}
        </Typography>
        <Typography variant="body2" color="text.secondary">
          Select a color to see its Munsell match
        </Typography>
      </Paper>
    );
  }

  const { match, slice } = munsellData;

  return (
    <Paper 
      elevation={2} 
      sx={{ 
        p: 3,
        transition: 'all 0.2s ease-in-out',
        '&:hover': {
          elevation: 4,
        },
      }}
    >
      <Typography variant="h6" sx={{ mb: 3, fontWeight: 600 }}>
        {title}
      </Typography>

      {/* Match Information */}
      <Stack spacing={2} sx={{ mb: 3 }}>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
          {/* Split Color Swatch */}
          <Box sx={{ textAlign: 'center' }}>
            <SplitColorSwatch 
              originalColor={hex}
              munsellColor={match.hex}
              size={64}
            />
            <Stack direction="row" spacing={1} sx={{ mt: 1, justifyContent: 'center' }}>
              <Typography variant="caption" color="text.secondary" sx={{ fontSize: '0.65rem' }}>
                Original
              </Typography>
              <Typography variant="caption" color="text.secondary" sx={{ fontSize: '0.65rem' }}>
                •
              </Typography>
              <Typography variant="caption" color="text.secondary" sx={{ fontSize: '0.65rem' }}>
                Match
              </Typography>
            </Stack>
          </Box>

          {/* Match Details */}
          <Stack spacing={1} sx={{ ml: 2 }}>
            <Chip
              label={match.munsell_notation}
              size="small"
              variant="outlined"
              sx={{
                fontFamily: 'monospace',
                fontWeight: 600,
                color: 'primary.main',
                borderColor: 'primary.main',
                backgroundColor: 'primary.50',
              }}
            />
            <Typography variant="caption" color="text.secondary">
              ΔE: {match.deltaE.toFixed(2)}
            </Typography>
            <Box>
              {match.deltaE <= 1 && (
                <Chip
                  label="Excellent Match"
                  size="small"
                  color="success"
                  variant="filled"
                />
              )}
              {match.deltaE > 1 && match.deltaE <= 3 && (
                <Chip
                  label="Good Match"
                  size="small"
                  color="primary"
                  variant="filled"
                />
              )}
              {match.deltaE > 3 && match.deltaE <= 6 && (
                <Chip
                  label="Fair Match"
                  size="small"
                  color="warning"
                  variant="filled"
                />
              )}
              {match.deltaE > 6 && (
                <Chip
                  label="Poor Match"
                  size="small"
                  color="error"
                  variant="filled"
                />
              )}
            </Box>
          </Stack>
        </Box>
      </Stack>

      <Divider sx={{ my: 2 }} />

      {/* Hue Slice Grid */}
      <MunsellSlice
        slice={slice}
        selected={{
          value: match.value,
          chroma: match.chroma,
        }}
        hue={match.hue}
        onChipClick={(value, chroma, chipHex) => {
          console.log(`Clicked chip: ${match.hue} ${value}/${chroma} (${chipHex})`);
          // Could trigger navigation or detailed view
        }}
      />

      {/* Additional Information */}
      <Box sx={{ mt: 2, pt: 2, borderTop: '1px solid', borderColor: 'grey.200' }}>
        <Typography variant="caption" color="text.secondary" sx={{ display: 'block', mb: 0.5 }}>
          The split swatch shows your original color (top-left) vs the nearest Munsell chip (bottom-right)
        </Typography>
        <Typography variant="caption" color="text.secondary">
          Delta E measures perceptual color difference • Lower values = better match
        </Typography>
      </Box>
    </Paper>
  );
}; 