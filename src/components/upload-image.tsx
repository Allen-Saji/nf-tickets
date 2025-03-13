"use client";

import React, { useState } from "react";
import { IKUpload, ImageKitProvider } from "imagekitio-next";
import { toast } from "sonner";
import { Loader2, Upload } from "lucide-react";

interface UploadImageProps {
  onUploadSuccess: (response: ImageUploadResponse) => void;
  onUploadStart?: () => void;
  onUploadError?: (error: ImageUploadError) => void;
  isDisabled?: boolean;
  maxSize?: number; // in MB
  folder?: string;
  fileName?: string;
  tags?: string[];
  className?: string;
  customLabel?: string;
  id?: string; // New prop for unique ID
}

export interface ImageUploadResponse {
  url: string;
  fileId: string;
  name: string;
  filePath: string;
  fileType: string;
  height: number;
  width: number;
  size: number;
  thumbnailUrl?: string;
  [key: string]: any; // For any additional fields ImageKit might return
}

export interface ImageUploadError {
  message: string;
  code?: string;
  [key: string]: any; // For any additional error info
}

export interface AuthResponse {
  signature: string;
  expire: number;
  token: string;
}

export const UploadImage: React.FC<UploadImageProps> = ({
  onUploadSuccess,
  onUploadStart,
  onUploadError,
  isDisabled = false,
  maxSize = 5, // Default 5MB
  folder = "/uploads",
  fileName = "file",
  tags = [],
  className = "",
  customLabel,
  id = "imageUpload", // Default ID with option to override
}) => {
  const [isUploading, setIsUploading] = useState(false);

  const urlEndpoint = process.env.NEXT_PUBLIC_IMAGEKIT_URL;
  const imagekitPublicKey = process.env.NEXT_PUBLIC_IMAGEKIT_PUBLIC_KEY;
  const NEXT_PUBLIC_SITE_URL = process.env.NEXT_PUBLIC_SITE_URL;

  const authenticator = async (): Promise<AuthResponse> => {
    try {
      const response = await fetch(`${NEXT_PUBLIC_SITE_URL}/api/upload-auth`);

      if (!response.ok) {
        const errorText = await response.text();
        throw new Error(
          `Request failed with status ${response.status}: ${errorText}`
        );
      }

      const data = await response.json();
      const { signature, expire, token } = data;
      return { signature, expire, token };
    } catch (error) {
      throw new Error(`Authentication request failed: ${error}`);
    }
  };

  const handleUploadStart = () => {
    setIsUploading(true);
    if (onUploadStart) {
      onUploadStart();
    }
  };

  const handleUploadSuccess = (response: ImageUploadResponse) => {
    setIsUploading(false);
    if (response.url) {
      onUploadSuccess(response);
      toast.success("Image uploaded successfully");
    }
  };

  const handleUploadError = (err: ImageUploadError) => {
    setIsUploading(false);

    if (onUploadError) {
      onUploadError(err);
    } else {
      toast.error("Upload Error", {
        description: err.message || "Failed to upload image",
        duration: 5000,
      });
    }
  };

  const validateFile = (file: File): boolean => {
    // Check for file size (maxSize in MB)
    if (file.size > maxSize * 1024 * 1024) {
      toast.error("File too large", {
        description: `File must be less than ${maxSize}MB`,
      });
      return false;
    }
    return true;
  };

  return (
    <div className={className}>
      <div className="hidden">
        <ImageKitProvider
          urlEndpoint={urlEndpoint}
          publicKey={imagekitPublicKey}
          authenticator={authenticator}
        >
          <IKUpload
            fileName={fileName}
            onSuccess={handleUploadSuccess as any}
            onError={handleUploadError as any}
            onChange={() => handleUploadStart()}
            folder={folder}
            useUniqueFileName={true}
            tags={tags}
            customCoordinates={"10,10,10,10"}
            isPrivateFile={false}
            responseFields={["tags", "customCoordinates"]}
            validateFile={validateFile}
            style={{ display: "none" }}
            id={id} // Use unique ID here
            disabled={isUploading || isDisabled}
          />
        </ImageKitProvider>
      </div>

      <label
        htmlFor={id} // Match label to the unique ID
        className={`flex flex-col items-center gap-2 ${
          isDisabled ? "cursor-not-allowed opacity-70" : "cursor-pointer"
        }`}
      >
        {isUploading ? (
          <Loader2 className="w-5 h-5 text-gray-400 animate-spin" />
        ) : (
          <Upload className="w-5 h-5 text-gray-400" />
        )}
        <span className="text-sm text-gray-400">
          {isUploading ? "Uploading..." : customLabel || "Upload image"}
        </span>
      </label>
    </div>
  );
};
