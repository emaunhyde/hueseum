import React, { useState } from 'react';
import { 
  Box, 
  Typography, 
  Stack, 
  ToggleButtonGroup,
  ToggleButton,
  Slider,
  Accordion,
  AccordionSummary,
  AccordionDetails,
  Button,
  CircularProgress,
  Tooltip
} from '@mui/material';
import { 
  ExpandMore as ExpandMoreIcon,
  Download as DownloadIcon,
  Brush as BrushIcon,
  Create as CreateIcon,
  Details as DetailsIcon
} from '@mui/icons-material';

export interface OutlineSettings {
  blurKernel: number;
  cannyLow: number;
  cannyHigh: number;
  dilateIterations: number;
}

export interface OutlineControlsProps {
  onDownload: (settings: OutlineSettings) => Promise<void>;
  imageData: string | null;
  disabled?: boolean;
}

// Preset configurations for different detail levels
const OUTLINE_PRESETS = {
  simple: {
    name: 'Simple',
    icon: <BrushIcon />,
    description: 'Clean, minimal lines for beginners',
    settings: {
      blurKernel: 7,
      cannyLow: 30,
      cannyHigh: 100,
      dilateIterations: 2
    }
  },
  detailed: {
    name: 'Detailed',
    icon: <CreateIcon />,
    description: 'Moderate detail for intermediate artists',
    settings: {
      blurKernel: 3,
      cannyLow: 50,
      cannyHigh: 150,
      dilateIterations: 1
    }
  },
  complex: {
    name: 'Complex',
    icon: <DetailsIcon />,
    description: 'High detail for advanced work',
    settings: {
      blurKernel: 1,
      cannyLow: 80,
      cannyHigh: 200,
      dilateIterations: 0
    }
  }
} as const;

export const OutlineControls: React.FC<OutlineControlsProps> = React.memo(({
  onDownload,
  imageData,
  disabled = false
}) => {
  const [selectedPreset, setSelectedPreset] = useState<keyof typeof OUTLINE_PRESETS>('detailed');
  const [customSettings, setCustomSettings] = useState<OutlineSettings>(OUTLINE_PRESETS.detailed.settings);
  const [useCustom, setUseCustom] = useState(false);
  const [isDownloading, setIsDownloading] = useState(false);

  const handlePresetChange = (_event: React.MouseEvent<HTMLElement>, newPreset: keyof typeof OUTLINE_PRESETS | null) => {
    if (newPreset !== null) {
      setSelectedPreset(newPreset);
      setCustomSettings(OUTLINE_PRESETS[newPreset].settings);
      setUseCustom(false);
    }
  };

  const handleCustomSettingChange = (setting: keyof OutlineSettings) => (
    _event: Event,
    newValue: number | number[]
  ) => {
    const value = Array.isArray(newValue) ? newValue[0] : newValue;
    setCustomSettings(prev => ({
      ...prev,
      [setting]: value
    }));
    setUseCustom(true);
  };

  const handleDownload = async () => {
    if (!imageData || isDownloading) return;

    setIsDownloading(true);
    try {
      const settings = useCustom ? customSettings : OUTLINE_PRESETS[selectedPreset].settings;
      await onDownload(settings);
    } finally {
      setIsDownloading(false);
    }
  };

  const currentSettings = useCustom ? customSettings : OUTLINE_PRESETS[selectedPreset].settings;
  const isDisabled = disabled || !imageData || isDownloading;

  return (
    <Box
      sx={{
        p: 3,
        backgroundColor: 'rgba(0, 0, 0, 0.02)',
        borderRadius: 2,
        border: '1px solid rgba(0, 0, 0, 0.1)',
        minWidth: 320,
      }}
    >
      <Typography variant="h6" sx={{ fontWeight: 600, mb: 2 }}>
        Outline Detail Level
      </Typography>
      
      <Stack spacing={3}>
        {/* Preset Selection */}
        <Box>
          <Typography variant="body2" sx={{ mb: 2, fontWeight: 500 }}>
            Choose Detail Level
          </Typography>
          <ToggleButtonGroup
            value={useCustom ? null : selectedPreset}
            exclusive
            onChange={handlePresetChange}
            size="small"
            sx={{ display: 'flex', flexDirection: 'column', gap: 1 }}
          >
            {Object.entries(OUTLINE_PRESETS).map(([key, preset]) => (
              <ToggleButton
                key={key}
                value={key}
                sx={{
                  display: 'flex',
                  justifyContent: 'flex-start',
                  alignItems: 'center',
                  gap: 2,
                  p: 1.5,
                  textAlign: 'left',
                  '&.Mui-selected': {
                    backgroundColor: 'primary.main',
                    color: 'primary.contrastText',
                  },
                }}
              >
                {preset.icon}
                <Box>
                  <Typography variant="body2" sx={{ fontWeight: 600 }}>
                    {preset.name}
                  </Typography>
                  <Typography variant="caption" sx={{ opacity: 0.8 }}>
                    {preset.description}
                  </Typography>
                </Box>
              </ToggleButton>
            ))}
          </ToggleButtonGroup>
        </Box>

        {/* Advanced Controls */}
        <Accordion>
          <AccordionSummary expandIcon={<ExpandMoreIcon />}>
            <Typography variant="body2" sx={{ fontWeight: 500 }}>
              Advanced Settings
            </Typography>
          </AccordionSummary>
          <AccordionDetails>
            <Stack spacing={2}>
              <Box>
                <Typography variant="caption" gutterBottom display="block">
                  Blur Amount: {currentSettings.blurKernel}
                </Typography>
                <Slider
                  value={currentSettings.blurKernel}
                  onChange={handleCustomSettingChange('blurKernel')}
                  min={1}
                  max={15}
                  step={2}
                  marks={[
                    { value: 1, label: 'Sharp' },
                    { value: 7, label: 'Medium' },
                    { value: 15, label: 'Soft' }
                  ]}
                />
              </Box>
              
              <Box>
                <Typography variant="caption" gutterBottom display="block">
                  Edge Sensitivity: {currentSettings.cannyLow}-{currentSettings.cannyHigh}
                </Typography>
                <Slider
                  value={[currentSettings.cannyLow, currentSettings.cannyHigh]}
                  onChange={(_event, newValue) => {
                    const [low, high] = Array.isArray(newValue) ? newValue : [50, 150];
                    setCustomSettings(prev => ({
                      ...prev,
                      cannyLow: low,
                      cannyHigh: high
                    }));
                    setUseCustom(true);
                  }}
                  min={10}
                  max={300}
                  marks={[
                    { value: 30, label: 'Less' },
                    { value: 150, label: 'More' }
                  ]}
                />
              </Box>
              
              <Box>
                <Typography variant="caption" gutterBottom display="block">
                  Line Thickness: {currentSettings.dilateIterations}
                </Typography>
                <Slider
                  value={currentSettings.dilateIterations}
                  onChange={handleCustomSettingChange('dilateIterations')}
                  min={0}
                  max={3}
                  step={1}
                  marks={[
                    { value: 0, label: 'Thin' },
                    { value: 1, label: 'Medium' },
                    { value: 3, label: 'Thick' }
                  ]}
                />
              </Box>
            </Stack>
          </AccordionDetails>
        </Accordion>

        {/* Download Button */}
        <Tooltip title={isDisabled ? 'Upload an image to generate outline' : 'Download coloring book outline'}>
          <span>
            <Button
              variant="contained"
              size="large"
              startIcon={isDownloading ? <CircularProgress size={16} /> : <DownloadIcon />}
              onClick={handleDownload}
              disabled={isDisabled}
              fullWidth
              sx={{
                py: 1.5,
                fontSize: '1rem',
                fontWeight: 600,
              }}
            >
              {isDownloading ? 'Generating Outline...' : 'Download Outline'}
            </Button>
          </span>
        </Tooltip>
      </Stack>
    </Box>
  );
});

OutlineControls.displayName = 'OutlineControls';