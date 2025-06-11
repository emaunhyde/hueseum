'use client';

import { useState, useEffect, useCallback, useMemo } from 'react';
import { Box, Typography, Container, Stack, Fade, Alert, CircularProgress, Tabs, Tab } from '@mui/material';
import { FileUpload } from '@/features/file-upload';
import { ImageDisplay } from '@/features/image-analysis';
import { ErrorBoundary } from '@/components/ui/ErrorBoundary';
import { ColorPalette, ColorChart, PixelColorDisplay, ValueStudyControls, ValuePalette, DownloadOutlineButton } from '@/components/ui';
import { extractPalette, PaletteResponse } from '@/lib/api/palette';
import { convertImageToValueStudy, rgbToLuminance } from '@/lib/utils/luminance';
import { AllaPrimaColor } from '@/lib/utils/alla-prima';
import type { PixelColorData } from '@/components/ui/PixelColorDisplay';
import { getColorNames, ColorNameResult } from '@/lib/utils/color-naming';

export default function Home() {
  const [selectedImage, setSelectedImage] = useState<string | null>(null);
  const [palette, setPalette] = useState<PaletteResponse | null>(null);
  const [isLoadingPalette, setIsLoadingPalette] = useState(false);
  const [paletteError, setPaletteError] = useState<string | null>(null);
  const [paletteColorNames, setPaletteColorNames] = useState<ColorNameResult[]>([]);
  const [pixelColor, setPixelColor] = useState<PixelColorData | null>(null);
  const [isLoadingPixelColor, setIsLoadingPixelColor] = useState(false);
  
  // Value Study state
  const [activeTab, setActiveTab] = useState(0);
  const [valueStudySteps, setValueStudySteps] = useState(10);
  const [enableEdgeDetection, setEnableEdgeDetection] = useState(false);
  const [selectedAllaPrima, setSelectedAllaPrima] = useState<AllaPrimaColor | null>(null);
  const [valueStudyImage, setValueStudyImage] = useState<string | null>(null);
  const [isLoadingValueStudy, setIsLoadingValueStudy] = useState(false);
  const [selectedLuminance, setSelectedLuminance] = useState<number | null>(null);
  
  // Reset value study when image changes
  useEffect(() => {
    setValueStudyImage(null);
    setValueStudySteps(10);
    setEnableEdgeDetection(false);
    setSelectedAllaPrima(null);
    setPaletteColorNames([]);
  }, [selectedImage]);

  const handleFileSelect = async (file: File) => {
    if (file.type.startsWith('image/')) {
      const reader = new FileReader();
      reader.onload = async (e) => {
        const imageData = e.target?.result as string;
        setSelectedImage(imageData);
        
        // Extract palette automatically
        setIsLoadingPalette(true);
        setPaletteError(null);
        
        try {
          const paletteResult = await extractPalette({ 
            imageData,
            size: 20 
          });
          setPalette(paletteResult);
          
          // Fetch color names for the palette colors in a single batch call
          const hexColors = paletteResult.palette.map(color => color.hex);
          const colorNames = await getColorNames(hexColors);
          setPaletteColorNames(colorNames);
        } catch (error) {
          setPaletteError(error instanceof Error ? error.message : 'Failed to extract palette');
        } finally {
          setIsLoadingPalette(false);
        }
      };
      reader.readAsDataURL(file);
    }
  };

  const handlePixelColorChange = useCallback((newPixelColor: PixelColorData | null, loading: boolean) => {
    setPixelColor(newPixelColor);
    setIsLoadingPixelColor(loading);
    
    // Calculate luminance for value study tab
    if (newPixelColor && newPixelColor.rgb) {
      const [r, g, b] = newPixelColor.rgb;
      const luminance = rgbToLuminance(r, g, b);
      setSelectedLuminance(luminance);
    } else {
      setSelectedLuminance(null);
    }
  }, []);

  const generateValueStudy = useCallback(async () => {
    if (!selectedImage) return;
    
    setIsLoadingValueStudy(true);
    try {
      const valueImage = await convertImageToValueStudy(selectedImage, valueStudySteps, enableEdgeDetection, selectedAllaPrima || undefined);
      setValueStudyImage(valueImage);
    } catch (error) {
      console.error('Failed to generate value study:', error);
    } finally {
      setIsLoadingValueStudy(false);
    }
  }, [selectedImage, valueStudySteps, enableEdgeDetection, selectedAllaPrima]);

  // Only change image source when we actually need to show different content
  // This prevents unnecessary pixel color resets during tab switches
  const currentImageSrc = useMemo(() => {
    // For value study tab, show the value study image if available
    if (activeTab === 1 && valueStudyImage) {
      return valueStudyImage;
    }
    // Otherwise always show the original image
    return selectedImage;
  }, [activeTab, selectedImage, valueStudyImage]);

  const handleTabChange = useCallback((_event: React.SyntheticEvent, newValue: number) => {
    setActiveTab(newValue);
    
    // If switching to value study tab and we don't have a value study image, generate it immediately
    if (newValue === 1 && selectedImage && !valueStudyImage && !isLoadingValueStudy) {
      generateValueStudy();
    }
  }, [selectedImage, valueStudyImage, isLoadingValueStudy, generateValueStudy]);

  const handleValueStudyStepsChange = useCallback((steps: number) => {
    setValueStudySteps(steps);
    // Clear current image to trigger regeneration
    setValueStudyImage(null);
  }, []);

  const handleEdgeDetectionChange = useCallback((enabled: boolean) => {
    setEnableEdgeDetection(enabled);
    // Clear current image to trigger regeneration
    setValueStudyImage(null);
  }, []);

  const handleAllaPrimaChange = useCallback((color: AllaPrimaColor | null) => {
    setSelectedAllaPrima(color);
    // Clear current image to trigger regeneration
    setValueStudyImage(null);
  }, []);

  // Generate value study when needed
  useEffect(() => {
    if (activeTab === 1 && selectedImage && !valueStudyImage && !isLoadingValueStudy) {
      generateValueStudy();
    }
  }, [activeTab, selectedImage, valueStudyImage, isLoadingValueStudy, generateValueStudy]);

  if (selectedImage) {

    return (
      <Box sx={{ width: '100vw', py: 4 }}>
        <Stack spacing={4}>
          {/* Tabs */}
          <Container maxWidth="lg">
            <Tabs 
              value={activeTab} 
              onChange={handleTabChange}
              sx={{ borderBottom: 1, borderColor: 'divider' }}
            >
              <Tab label="Color Analysis" />
              <Tab label="Value Study" />
            </Tabs>
          </Container>

          {/* Image Display */}
          <Box sx={{ width: '100%' }}>
            <ImageDisplay 
              key={selectedImage} 
              imageSrc={currentImageSrc} 
              onPixelColorChange={activeTab === 0 ? handlePixelColorChange : undefined}
            />
          </Box>
          
          {/* Tab Content */}
          <Container maxWidth="lg">
            {activeTab === 0 && (
              <Stack spacing={4}>
                {/* Pixel Color Display and Download Button */}
                <Box sx={{ display: 'flex', justifyContent: 'center', gap: 3, flexWrap: 'wrap', alignItems: 'flex-start' }}>
                  {/* Only render PixelColorDisplay on Color Analysis tab to prevent unnecessary API calls */}
                  <PixelColorDisplay
                    key="color-analysis-pixel-display"
                    pixelColor={pixelColor}
                    isLoading={isLoadingPixelColor}
                    title="Sampled Color"
                  />
                  <Box sx={{ pt: 1 }}>
                    <DownloadOutlineButton
                      imageData={selectedImage}
                      variant="contained"
                    />
                  </Box>
                </Box>

                {/* Palette Analysis */}
                <Box>
                  {isLoadingPalette && (
                    <Stack direction="row" spacing={2} alignItems="center" justifyContent="center">
                      <CircularProgress size={24} />
                      <Typography variant="body2" color="text.secondary">
                        Extracting color palette...
                      </Typography>
                    </Stack>
                  )}
                  
                  {paletteError && (
                    <Alert severity="error" sx={{ mb: 2 }}>
                      {paletteError}
                    </Alert>
                  )}
                  
                  {palette && !isLoadingPalette && (
                    <Fade in timeout={600}>
                      <Stack spacing={3}>
                        {/* Color Prevalence Chart */}
                        <ColorChart 
                          colors={palette.palette}
                          height={80}
                          showPercentages={true}
                        />
                        
                        {/* Individual Color Swatches */}
                        <ColorPalette 
                          colors={palette.palette.map(color => color.hex)}
                          colorNames={paletteColorNames}
                          swatchSize="sm"
                          layout="row"
                          showColorValues={true}
                        />
                      </Stack>
                    </Fade>
                  )}
                </Box>
              </Stack>
            )}

            {activeTab === 1 && (
              <Stack spacing={4}>
                {/* Value Study Controls and Value Palette */}
                <Box sx={{ display: 'flex', justifyContent: 'center', gap: 3, flexWrap: 'wrap' }}>
                  <ValueStudyControls
                    steps={valueStudySteps}
                    onStepsChange={handleValueStudyStepsChange}
                    enableEdgeDetection={enableEdgeDetection}
                    onEdgeDetectionChange={handleEdgeDetectionChange}
                    selectedAllaPrima={selectedAllaPrima}
                    onAllaPrimaChange={handleAllaPrimaChange}
                  />
                  <ValuePalette
                    steps={valueStudySteps}
                    selectedValue={selectedLuminance}
                    allaPrimaColor={selectedAllaPrima}
                    title="Value Steps"
                  />
                </Box>

                {isLoadingValueStudy && (
                  <Stack direction="row" spacing={2} alignItems="center" justifyContent="center">
                    <CircularProgress size={24} />
                    <Typography variant="body2" color="text.secondary">
                      Generating value study...
                    </Typography>
                  </Stack>
                )}
              </Stack>
            )}
          </Container>
        </Stack>
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
