export interface FileUploadProps {
  onFileSelect: (file: File) => void;
  buttonTitle?: string;
  accept?: string;
}