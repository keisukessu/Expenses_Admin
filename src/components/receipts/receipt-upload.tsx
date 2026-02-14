"use client";

import { useState, useRef } from "react";
import { ACCEPTED_IMAGE_TYPES, MAX_FILE_SIZE } from "@/lib/constants";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Upload, X, ImageIcon } from "lucide-react";
import { toast } from "sonner";

interface ReceiptUploadProps {
  existingPath: string | null;
  onFileSelect: (file: File | null) => void;
}

export function ReceiptUpload({ existingPath, onFileSelect }: ReceiptUploadProps) {
  const [preview, setPreview] = useState<string | null>(null);
  const [fileName, setFileName] = useState<string | null>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!ACCEPTED_IMAGE_TYPES.includes(file.type)) {
      toast.error("JPEG、PNG、WebP、HEIC画像のみアップロードできます");
      return;
    }

    if (file.size > MAX_FILE_SIZE) {
      toast.error("ファイルサイズは5MB以下にしてください");
      return;
    }

    setFileName(file.name);
    onFileSelect(file);

    const reader = new FileReader();
    reader.onloadend = () => {
      setPreview(reader.result as string);
    };
    reader.readAsDataURL(file);
  };

  const handleRemove = () => {
    setPreview(null);
    setFileName(null);
    onFileSelect(null);
    if (inputRef.current) {
      inputRef.current.value = "";
    }
  };

  return (
    <div className="space-y-2">
      <Label>レシート画像</Label>
      {preview ? (
        <div className="relative">
          <img
            src={preview}
            alt="レシートプレビュー"
            className="h-32 w-full rounded-md border object-cover"
          />
          <Button
            type="button"
            variant="destructive"
            size="icon"
            className="absolute right-1 top-1 h-6 w-6"
            onClick={handleRemove}
          >
            <X className="h-3 w-3" />
          </Button>
          <p className="mt-1 text-xs text-muted-foreground truncate">
            {fileName}
          </p>
        </div>
      ) : (
        <div>
          {existingPath && (
            <div className="mb-2 flex items-center gap-2 rounded-md border p-2 text-sm text-muted-foreground">
              <ImageIcon className="h-4 w-4" />
              <span className="truncate">アップロード済み</span>
            </div>
          )}
          <Button
            type="button"
            variant="outline"
            className="w-full"
            onClick={() => inputRef.current?.click()}
          >
            <Upload className="h-4 w-4" />
            画像を選択
          </Button>
          <input
            ref={inputRef}
            type="file"
            accept={ACCEPTED_IMAGE_TYPES.join(",")}
            className="hidden"
            onChange={handleFileChange}
          />
          <p className="mt-1 text-xs text-muted-foreground">
            JPEG, PNG, WebP, HEIC（5MB以下）
          </p>
        </div>
      )}
    </div>
  );
}
