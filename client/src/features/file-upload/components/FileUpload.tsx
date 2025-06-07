"use client";

import { Button, useTheme } from "@mui/material";
import { styled } from "@mui/material/styles";
import { AddPhotoAlternate } from "@mui/icons-material";
import { useRef, useState } from "react";
import type { FileUploadProps } from "../types";

const VisuallyHiddenInput = styled("input")({
  clip: "rect(0 0 0 0)",
  clipPath: "inset(50%)",
  height: 1,
  overflow: "hidden",
  position: "absolute",
  bottom: 0,
  left: 0,
  whiteSpace: "nowrap",
  width: 1,
});

export const FileUpload = ({
  onFileSelect,
  buttonTitle = "Choose File",
  accept = "*/*",
}: FileUploadProps) => {
  const theme = useTheme();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [isHovered, setIsHovered] = useState(false);

  const handleFileSelect = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      onFileSelect(file);
    }
  };


  return (
    <Button
      component="label"
      variant="contained"
      startIcon={<AddPhotoAlternate />}
      size="large"
      color="primary"
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      sx={{
        textTransform: "none",
        borderRadius: 3,
        px: 4,
        py: 1.5,
        fontSize: '1.1rem',
        fontWeight: 600,
        boxShadow: theme.shadows[4],
        transform: isHovered ? 'translateY(-2px)' : 'translateY(0)',
        transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
        '&:hover': {
          boxShadow: theme.shadows[8],
        },
      }}
    >
      {buttonTitle}
      <VisuallyHiddenInput
        ref={fileInputRef}
        type="file"
        accept={accept}
        onChange={handleFileSelect}
      />
    </Button>
  );
};