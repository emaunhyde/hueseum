import React, { useEffect, useState } from 'react';
import { Box, Typography, Paper, Chip, Tooltip } from '@mui/material';
import { WheelPosition, ColorRelationship } from '@/lib/api/color-scheme';
import { getColorWheelData, ColorWheelHue } from '@/lib/munsell';

interface ColorPosition {
  hex: string;
  rgb: number[];
  percentage: number;
  hue: number;
  munsell_notation?: string;
  munsell_hue?: string;
  munsell_value?: number;
  munsell_chroma?: number;
  munsell_hex?: string;
  deltaE?: number;
  saturation: number;
  lightness: number;
  x: number;
  y: number;
}

interface Relationship {
  type: string;
  from: number;
  to: number;
  strength: number;
  munsell_from?: string;
  munsell_to?: string;
  distance?: number;
}

interface ColorScheme {
  type: string;
  description: string;
}

export interface ColorWheelProps {
  positions: ColorPosition[];
  relationships: Relationship[];
  scheme: ColorScheme;
  size?: number;
}

export const ColorWheel: React.FC<ColorWheelProps> = ({
  positions,
  relationships,
  scheme,
  size = 300,
}) => {
  const radius = size / 2;
  const center = radius;
  const wheelRadius = radius * 0.8;

  // State for storing hue data from backend
  const [hueData, setHueData] = useState<ColorWheelHue[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Fetch color wheel data from backend
  useEffect(() => {
    const fetchColorWheelData = async () => {
      setIsLoading(true);
      setError(null);
      
      try {
        const response = await getColorWheelData();
        setHueData(response.hues);
        console.log(`Loaded ${response.total_hues} hues for color wheel`);
      } catch (err) {
        console.error('Failed to fetch color wheel data:', err);
        setError(err instanceof Error ? err.message : 'Failed to load color wheel data');
      } finally {
        setIsLoading(false);
      }
    };

    fetchColorWheelData();
  }, []);

  // Convert Munsell hue notation to angle using backend data
  const munsellHueToAngle = (munsellHue: string): number => {
    if (!munsellHue || hueData.length === 0) return 0;
    
    // Find exact match in backend data
    const exactMatch = hueData.find(h => h.hue === munsellHue);
    if (exactMatch) return exactMatch.angle;
    
    // If no exact match, find closest hue in same family
    const hueFamily = munsellHue.replace(/[0-9.]/g, '');
    const familyHues = hueData.filter(h => h.family === hueFamily);
    
    if (familyHues.length > 0) {
      // Return angle of first hue in family as approximation
      return familyHues[0].angle;
    }
    
    return 0; // Fallback
  };

  // Generate distinct pie-slice segments for each hue
  const generateHueSegments = (): React.ReactElement[] => {
    if (isLoading || hueData.length === 0) return [];
    
    const segments: React.ReactElement[] = [];
    const segmentAngle = 360 / hueData.length; // Dynamic angle based on actual hue count
    
    hueData.forEach(({ hue, family, angle, color }, index) => {
      const startAngle = angle - segmentAngle / 2;
      const endAngle = angle + segmentAngle / 2;
      
      // Convert to radians and adjust for SVG coordinate system (start from top)
      const startRad = (startAngle - 90) * (Math.PI / 180);
      const endRad = (endAngle - 90) * (Math.PI / 180);
      
      // Calculate path points for pie slice
      const innerRadius = 30; // Inner radius for neutral area
      const outerRadius = wheelRadius;
      
      const x1 = center + innerRadius * Math.cos(startRad);
      const y1 = center + innerRadius * Math.sin(startRad);
      const x2 = center + outerRadius * Math.cos(startRad);
      const y2 = center + outerRadius * Math.sin(startRad);
      const x3 = center + outerRadius * Math.cos(endRad);
      const y3 = center + outerRadius * Math.sin(endRad);
      const x4 = center + innerRadius * Math.cos(endRad);
      const y4 = center + innerRadius * Math.sin(endRad);
      
      // Determine if arc is large (> 180 degrees)
      const largeArcFlag = Math.abs(endAngle - startAngle) > 180 ? 1 : 0;
      
      // Create SVG path for pie slice
      const pathData = [
        `M ${x1} ${y1}`, // Move to inner start point
        `L ${x2} ${y2}`, // Line to outer start point
        `A ${outerRadius} ${outerRadius} 0 ${largeArcFlag} 1 ${x3} ${y3}`, // Arc to outer end point
        `L ${x4} ${y4}`, // Line to inner end point
        `A ${innerRadius} ${innerRadius} 0 ${largeArcFlag} 0 ${x1} ${y1}`, // Arc back to inner start point
        'Z' // Close path
      ].join(' ');
      
      segments.push(
        <path
          key={hue}
          d={pathData}
          fill={color}
          stroke="white"
          strokeWidth={1}
          opacity={0.8}
        />
      );
    });
    
    return segments;
  };

  // Generate hue labels
  const generateHueLabels = (): React.ReactElement[] => {
    if (isLoading || hueData.length === 0) return [];
    
    return hueData.map(({ hue, family, angle, color }) => {
      const labelRadius = wheelRadius + 20;
      const angleRad = (angle - 90) * (Math.PI / 180);
      const x = center + labelRadius * Math.cos(angleRad);
      const y = center + labelRadius * Math.sin(angleRad);
      
      // Determine if this is a main hue (5R, 5YR, etc.) for larger labels
      const hueNumber = parseFloat(hue.replace(/[A-Z]/g, '')) || 5;
      const isMainHue = hueNumber === 5;
      const labelSize = isMainHue ? 14 : 10;
      const fontSize = isMainHue ? '9' : '7';
      const strokeWidth = isMainHue ? 2 : 1;
      
      return (
        <g key={hue}>
          {/* Hue label */}
          <circle
            cx={x}
            cy={y}
            r={labelSize}
            fill={color}
            stroke="white"
            strokeWidth={strokeWidth}
            opacity={isMainHue ? 1 : 0.8}
          />
          <text
            x={x}
            y={y}
            textAnchor="middle"
            dominantBaseline="middle"
            fontSize={fontSize}
            fill="white"
            fontWeight="600"
          >
            {hue}
          </text>
        </g>
      );
    });
  };

  // Generate color dots positioned by Munsell hue
  const generateColorDots = (): React.ReactElement[] => {
    // Sort positions by percentage (descending) so highest percentages render first (on bottom)
    const sortedPositions = [...positions].sort((a, b) => b.percentage - a.percentage);
    
    // Use consistent dot size for cleaner appearance
    const dotSize = 8;
    
    return sortedPositions.map((pos, index) => {
      // Use Munsell hue for positioning if available, otherwise fall back to HSL
      let angle: number;
      let distance: number;
      
      if (pos.munsell_hue && pos.munsell_chroma) {
        // Position based on Munsell notation
        angle = munsellHueToAngle(pos.munsell_hue);
        // Map chroma to distance from center (0 = center, high chroma = edge)
        const maxChroma = 20; // Approximate max chroma for positioning
        const chromaFactor = Math.min(pos.munsell_chroma / maxChroma, 1);
        distance = 30 + chromaFactor * (wheelRadius - 60); // 30px minimum from center
      } else {
        // Fallback to HSL positioning
        angle = pos.hue;
        distance = wheelRadius - 40;
      }
      
      const angleRad = (angle - 90) * (Math.PI / 180);
      const x = center + distance * Math.cos(angleRad);
      const y = center + distance * Math.sin(angleRad);
      
      const tooltipContent = (
        <Box>
          <Typography variant="body2" sx={{ fontWeight: 'bold' }}>
            {pos.hex.toUpperCase()}
          </Typography>
          <Typography variant="body2">
            {pos.percentage.toFixed(1)}% of image
          </Typography>
          {pos.munsell_notation ? (
            <>
              <Typography variant="body2" sx={{ fontWeight: 'bold', mt: 1 }}>
                Munsell: {pos.munsell_notation}
              </Typography>
              {pos.munsell_hex && (
                <Typography variant="body2">
                  Match: {pos.munsell_hex.toUpperCase()}
                </Typography>
              )}
              {pos.deltaE !== undefined && (
                <Typography variant="body2">
                  ΔE: {pos.deltaE.toFixed(2)} {pos.deltaE < 2 ? '(excellent)' : pos.deltaE < 5 ? '(good)' : '(fair)'}
                </Typography>
              )}
            </>
          ) : (
            <Typography variant="body2">
              HSL: {pos.hue.toFixed(0)}°, {(pos.saturation * 100).toFixed(0)}%, {(pos.lightness * 100).toFixed(0)}%
            </Typography>
          )}
        </Box>
      );
      
      return (
        <Tooltip key={`${pos.hex}-${pos.percentage}`} title={tooltipContent} arrow placement="top">
          <circle
            cx={x}
            cy={y}
            r={dotSize}
            fill="white"
            stroke={pos.hex}
            strokeWidth={3}
          />
        </Tooltip>
      );
    });
  };

  const getSchemeColor = (type: string) => {
    switch (type) {
      case 'monochromatic': return '#9C27B0';
      case 'complementary': return '#F44336';
      case 'analogous': return '#4CAF50';
      case 'triadic': return '#FF9800';
      case 'split-complementary': return '#2196F3';
      case 'tetradic': return '#E91E63';
      case 'complex': return '#607D8B';
      default: return '#757575';
    }
  };

  if (error) {
    return (
      <Paper elevation={2} sx={{ p: 3 }}>
        <Box sx={{ textAlign: 'center' }}>
          <Typography variant="h6" color="error" sx={{ mb: 2 }}>
            Error Loading Color Wheel
          </Typography>
          <Typography variant="body2" color="text.secondary">
            {error}
          </Typography>
        </Box>
      </Paper>
    );
  }

  return (
    <Paper elevation={2} sx={{ p: 3 }}>
      <Box sx={{ mb: 2, textAlign: 'center' }}>
        <Typography variant="h6" sx={{ fontWeight: 600, mb: 1 }}>
          Munsell Color Harmony Analysis
        </Typography>
        <Chip
          label={`${scheme.type.charAt(0).toUpperCase() + scheme.type.slice(1)}: ${scheme.description}`}
          sx={{
            backgroundColor: getSchemeColor(scheme.type),
            color: 'white',
            fontWeight: 600,
            mb: 1,
          }}
        />
      </Box>

      <Box sx={{ display: 'flex', justifyContent: 'center', position: 'relative' }}>
        {isLoading && (
          <Box
            sx={{
              position: 'absolute',
              top: '50%',
              left: '50%',
              transform: 'translate(-50%, -50%)',
              zIndex: 10,
              backgroundColor: 'rgba(255, 255, 255, 0.9)',
              borderRadius: 1,
              p: 2,
            }}
          >
            <Typography variant="body2" color="text.secondary">
              Loading Munsell colors...
            </Typography>
          </Box>
        )}
        <svg width={size} height={size} style={{ opacity: isLoading ? 0.5 : 1 }}>
          {/* Distinct hue segments */}
          <g>
            {generateHueSegments()}
          </g>

          {/* Hue segment labels */}
          <g>
            {generateHueLabels()}
          </g>

          {/* Color position dots */}
          <g>
            {generateColorDots()}
          </g>

          {/* Center neutral area */}
          <circle
            cx={center}
            cy={center}
            r={25}
            fill="#f5f5f5"
            stroke="#ccc"
            strokeWidth={1}
          />
          
          {/* Center label */}
          <text
            x={center}
            y={center - 5}
            textAnchor="middle"
            dominantBaseline="middle"
            fontSize="10"
            fill="#666"
            fontWeight="600"
          >
            N
          </text>
          <text
            x={center}
            y={center + 8}
            textAnchor="middle"
            dominantBaseline="middle"
            fontSize="8"
            fill="#666"
          >
            {positions.length} colors
          </text>
        </svg>
      </Box>

      {/* Legend */}
      <Box sx={{ mt: 2, pt: 2, borderTop: '1px solid', borderColor: 'grey.200' }}>
        <Typography variant="caption" color="text.secondary" sx={{ display: 'block', mb: 1 }}>
          <strong>Munsell Color Wheel:</strong> White dots show your image colors positioned by their Munsell hue and chroma
        </Typography>
        <Typography variant="caption" color="text.secondary" sx={{ display: 'block', mb: 1 }}>
          • <strong>Position:</strong> Angle = Munsell hue, Distance from center = Chroma (saturation)
        </Typography>
        <Typography variant="caption" color="text.secondary">
          • <strong>Segments:</strong> {hueData.length} Munsell hues loaded from database with highest chroma colors
        </Typography>
      </Box>
    </Paper>
  );
}; 