import { useState, useRef, useCallback } from "react";
import { Upload, X, File, Image, FileText, Video, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { cn } from "@/lib/utils";
import { uploadFile, validateFile, type UploadOptions } from "@/lib/supabase-storage";

interface FileUploaderProps {
  onUploadComplete: (url: string) => void;
  onUploadError?: (error: string) => void;
  accept?: string;
  maxSizeMB?: number;
  folder?: string;
  bucket?: string;
  buttonText?: string;
  className?: string;
}

export function FileUploader({
  onUploadComplete,
  onUploadError,
  accept = "image/*,application/pdf",
  maxSizeMB = 10,
  folder = "general",
  bucket = "class-images",
  buttonText = "Subir archivo",
  className,
}: FileUploaderProps) {
  const [isUploading, setIsUploading] = useState(false);
  const [progress, setProgress] = useState(0);
  const [error, setError] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFile = useCallback(async (file: File) => {
    setIsUploading(true);
    setError(null);
    setProgress(0);

    // Validate
    const validation = validateFile(file, { maxSizeMB, bucket, folder });
    if (!validation.valid) {
      setError(validation.error || "Archivo inválido");
      onUploadError?.(validation.error || "Archivo inválido");
      setIsUploading(false);
      return;
    }

    // Simulate progress
    const progressInterval = setInterval(() => {
      setProgress((prev) => Math.min(prev + 10, 90));
    }, 100);

    try {
      const { url, error: uploadError } = await uploadFile(file, file.name, {
        bucket,
        folder,
        maxSizeMB,
      });

      clearInterval(progressInterval);
      setProgress(100);

      if (uploadError) throw new Error(uploadError);

      onUploadComplete(url);
    } catch (err: any) {
      setError(err.message);
      onUploadError?.(err.message);
    } finally {
      clearInterval(progressInterval);
      setIsUploading(false);
      setTimeout(() => setProgress(0), 1000);
    }
  }, [bucket, folder, maxSizeMB, onUploadComplete, onUploadError]);

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    const file = e.dataTransfer.files[0];
    if (file) handleFile(file);
  }, [handleFile]);

  const handleDragOver = useCallback((e: React.DragEvent) => {
    e.preventDefault();
  }, []);

  const handleFileSelect = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) handleFile(file);
    if (fileInputRef.current) fileInputRef.current.value = "";
  }, [handleFile]);

  const getFileIcon = () => {
    if (accept.includes("pdf")) return <FileText className="h-5 w-5" />;
    if (accept.includes("video")) return <Video className="h-5 w-5" />;
    if (accept.includes("image")) return <Image className="h-5 w-5" />;
    return <File className="h-5 w-5" />;
  };

  return (
    <div className={cn("space-y-3", className)}>
      <div
        onDrop={handleDrop}
        onDragOver={handleDragOver}
        className={cn(
          "border-2 border-dashed rounded-lg p-6 text-center transition-colors cursor-pointer",
          isUploading ? "border-primary/50 bg-primary/5" : "border-muted-foreground/25 hover:border-primary/50",
          error ? "border-destructive/50 bg-destructive/5" : ""
        )}
        onClick={() => !isUploading && fileInputRef.current?.click()}
      >
        <input
          ref={fileInputRef}
          type="file"
          accept={accept}
          onChange={handleFileSelect}
          className="hidden"
          disabled={isUploading}
        />
        
        {isUploading ? (
          <div className="space-y-3">
            <Loader2 className="h-8 w-8 animate-spin mx-auto text-primary" />
            <p className="text-sm text-muted-foreground">Subiendo archivo...</p>
            <Progress value={progress} className="h-2" />
          </div>
        ) : (
          <>
            <div className="mx-auto w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center mb-3">
              <Upload className="h-6 w-6 text-primary" />
            </div>
            <p className="text-sm text-muted-foreground">
              {buttonText}
            </p>
            <p className="text-xs text-muted-foreground mt-1">
              o arrastra y suelta un archivo
            </p>
            <p className="text-xs text-muted-foreground mt-2">
              Máx. {maxSizeMB}MB · {accept.split(",").map(a => a.replace("*", "").toUpperCase()).join(", ")}
            </p>
          </>
        )}
      </div>

      {error && (
        <div className="flex items-center gap-2 text-sm text-destructive bg-destructive/10 p-2 rounded">
          <X className="h-4 w-4" />
          {error}
        </div>
      )}
    </div>
  );
}

export function ImageUploader(props: Omit<FileUploaderProps, "accept">) {
  return <FileUploader {...props} accept="image/*" buttonText="Subir imagen" />;
}

export function PdfUploader(props: Omit<FileUploaderProps, "accept">) {
  return <FileUploader {...props} accept="application/pdf" buttonText="Subir PDF" maxSizeMB={20} />;
}

export function VideoUploader(props: Omit<FileUploaderProps, "accept">) {
  return <FileUploader {...props} accept="video/*" buttonText="Subir video" maxSizeMB={50} />;
}
