import { supabase } from "@/integrations/supabase/client";

export type FileType = "image" | "pdf" | "video";

export interface UploadOptions {
  bucket?: string;
  folder?: string;
  maxSizeMB?: number;
  allowedTypes?: FileType[];
}

const DEFAULT_OPTIONS: UploadOptions = {
  bucket: "class-images",
  folder: "general",
  maxSizeMB: 10,
  allowedTypes: ["image", "pdf"],
};

const MIME_TYPES = {
  image: ["image/jpeg", "image/png", "image/webp", "image/gif"],
  pdf: ["application/pdf"],
  video: ["video/mp4", "video/webm", "video/quicktime"],
};

const FILE_EXTENSIONS = {
  image: [".jpg", ".jpeg", ".png", ".webp", ".gif"],
  pdf: [".pdf"],
  video: [".mp4", ".webm", ".mov"],
};

export function getFileType(file: File): FileType | null {
  const mime = file.type;
  if (MIME_TYPES.image.includes(mime)) return "image";
  if (MIME_TYPES.pdf.includes(mime)) return "pdf";
  if (MIME_TYPES.video.includes(mime)) return "video";
  return null;
}

export function validateFile(file: File, options: UploadOptions = {}): { valid: boolean; error?: string } {
  const opts = { ...DEFAULT_OPTIONS, ...options };
  
  // Check file size
  const maxBytes = opts.maxSizeMB! * 1024 * 1024;
  if (file.size > maxBytes) {
    return { valid: false, error: `El archivo no debe superar los ${opts.maxSizeMB}MB` };
  }
  
  // Check file type
  const fileType = getFileType(file);
  if (!fileType || !opts.allowedTypes?.includes(fileType)) {
    return { valid: false, error: `Tipo de archivo no permitido. Formatos: ${opts.allowedTypes?.join(", ")}` };
  }
  
  return { valid: true };
}

export async function uploadFile(
  file: File,
  fileName: string,
  options: UploadOptions = {}
): Promise<{ url: string; error?: string }> {
  const opts = { ...DEFAULT_OPTIONS, ...options };
  
  // Validate file
  const validation = validateFile(file, opts);
  if (!validation.valid) {
    return { url: "", error: validation.error };
  }
  
  // Generate unique file path
  const timestamp = Date.now();
  const safeFileName = fileName.toLowerCase().replace(/[^a-z0-9.-]/g, "-");
  const filePath = `${opts.folder}/${timestamp}-${safeFileName}`;
  
  // Upload to Supabase
  const { data, error } = await supabase.storage
    .from(opts.bucket!)
    .upload(filePath, file, {
      cacheControl: "3600",
      upsert: false,
    });
  
  if (error) {
    console.error("Upload error:", error);
    return { url: "", error: error.message };
  }
  
  // Get public URL
  const { data: urlData } = supabase.storage
    .from(opts.bucket!)
    .getPublicUrl(filePath);
  
  return { url: urlData.publicUrl };
}

export async function deleteFile(fileUrl: string, bucket: string = "class-images"): Promise<{ success: boolean; error?: string }> {
  try {
    // Extract file path from URL
    const urlParts = fileUrl.split("/");
    const filePath = urlParts.slice(urlParts.indexOf(bucket) + 1).join("/");
    
    const { error } = await supabase.storage
      .from(bucket)
      .remove([filePath]);
    
    if (error) throw error;
    return { success: true };
  } catch (error: any) {
    console.error("Delete error:", error);
    return { success: false, error: error.message };
  }
}
