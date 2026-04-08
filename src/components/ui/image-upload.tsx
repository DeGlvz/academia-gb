import { useState } from "react";
import { Button } from "@/components/ui/button";
import { X, Image as ImageIcon } from "lucide-react";
import { FileUploader } from "./file-uploader";

interface ImageUploadProps {
  bucket?: string;
  path?: string;
  onUpload: (url: string) => void;
  existingUrl?: string;
}

export const ImageUpload = ({ 
  bucket = "class-images", 
  path = "clases", 
  onUpload, 
  existingUrl 
}: ImageUploadProps) => {
  const [preview, setPreview] = useState(existingUrl || "");

  const handleUploadComplete = (url: string) => {
    setPreview(url);
    onUpload(url);
  };

  const handleRemoveImage = () => {
    setPreview("");
    onUpload("");
  };

  return (
    <div className="space-y-3">
      {preview ? (
        <div className="relative w-full h-40 rounded-lg overflow-hidden border">
          <img src={preview} alt="Preview" className="w-full h-full object-cover" />
          <Button
            type="button"
            variant="destructive"
            size="sm"
            className="absolute top-2 right-2 h-7 w-7 p-0"
            onClick={handleRemoveImage}
          >
            <X className="h-4 w-4" />
          </Button>
        </div>
      ) : (
        <FileUploader
          accept="image/*"
          folder={path}
          bucket={bucket}
          maxSizeMB={5}
          buttonText="Subir imagen"
          onUploadComplete={handleUploadComplete}
          onUploadError={(error) => console.error(error)}
        />
      )}
    </div>
  );
};

// Nuevo componente: PDF Uploader (para material descargable)
export const PdfUpload = ({ 
  onUpload, 
  existingUrl,
  label = "Subir PDF"
}: { 
  onUpload: (url: string) => void; 
  existingUrl?: string;
  label?: string;
}) => {
  const [fileUrl, setFileUrl] = useState(existingUrl || "");

  const handleUploadComplete = (url: string) => {
    setFileUrl(url);
    onUpload(url);
  };

  const handleRemoveFile = () => {
    setFileUrl("");
    onUpload("");
  };

  return (
    <div className="space-y-3">
      {fileUrl ? (
        <div className="flex items-center justify-between p-3 border rounded-lg bg-muted/30">
          <a 
            href={fileUrl} 
            target="_blank" 
            rel="noopener noreferrer"
            className="text-sm text-primary hover:underline flex items-center gap-2"
          >
            <ImageIcon className="h-4 w-4" />
            Ver archivo
          </a>
          <Button
            type="button"
            variant="ghost"
            size="sm"
            onClick={handleRemoveFile}
            className="h-7 w-7 p-0 text-destructive"
          >
            <X className="h-4 w-4" />
          </Button>
        </div>
      ) : (
        <FileUploader
          accept="application/pdf"
          folder="pdfs"
          bucket="class-images"
          maxSizeMB={20}
          buttonText={label}
          onUploadComplete={handleUploadComplete}
          onUploadError={(error) => console.error(error)}
        />
      )}
    </div>
  );
};

// Nuevo componente: Video Uploader (para lecciones en video)
export const VideoUpload = ({ 
  onUpload, 
  existingUrl,
  label = "Subir video"
}: { 
  onUpload: (url: string) => void; 
  existingUrl?: string;
  label?: string;
}) => {
  const [fileUrl, setFileUrl] = useState(existingUrl || "");

  const handleUploadComplete = (url: string) => {
    setFileUrl(url);
    onUpload(url);
  };

  const handleRemoveFile = () => {
    setFileUrl("");
    onUpload("");
  };

  return (
    <div className="space-y-3">
      {fileUrl ? (
        <div className="flex items-center justify-between p-3 border rounded-lg bg-muted/30">
          <video 
            src={fileUrl} 
            controls 
            className="h-20 rounded"
          />
          <Button
            type="button"
            variant="ghost"
            size="sm"
            onClick={handleRemoveFile}
            className="h-7 w-7 p-0 text-destructive"
          >
            <X className="h-4 w-4" />
          </Button>
        </div>
      ) : (
        <FileUploader
          accept="video/*"
          folder="videos"
          bucket="class-images"
          maxSizeMB={50}
          buttonText={label}
          onUploadComplete={handleUploadComplete}
          onUploadError={(error) => console.error(error)}
        />
      )}
    </div>
  );
};
