import React, { forwardRef } from 'react';

interface CanvasImageProps extends React.CanvasHTMLAttributes<HTMLCanvasElement> {
  interactive?: boolean;
}

export const CanvasImage = forwardRef<HTMLCanvasElement, CanvasImageProps>(
  ({ interactive = false, style, className, onClick, ...canvasProps }, ref) => {
    return (
      <canvas
        ref={ref}
        onClick={onClick}
        className={className}
        style={{
          cursor: interactive || onClick ? 'crosshair' : 'default',
          ...style
        }}
        {...canvasProps}
      />
    );
  }
);

CanvasImage.displayName = 'CanvasImage';