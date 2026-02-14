"use client";

import { useState, useEffect } from "react";
import { createClient } from "@/lib/supabase/client";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent } from "@/components/ui/dialog";
import { Receipt, X } from "lucide-react";

interface ReceiptPreviewProps {
  receiptPath: string;
}

export function ReceiptPreview({ receiptPath }: ReceiptPreviewProps) {
  const [imageUrl, setImageUrl] = useState<string | null>(null);
  const [fullscreenOpen, setFullscreenOpen] = useState(false);
  const supabase = createClient();

  useEffect(() => {
    const getUrl = async () => {
      const { data } = await supabase.storage
        .from("receipts")
        .createSignedUrl(receiptPath, 3600);

      if (data?.signedUrl) {
        setImageUrl(data.signedUrl);
      }
    };
    getUrl();
  }, [receiptPath, supabase]);

  if (!imageUrl) {
    return (
      <Button variant="ghost" size="sm" className="h-7 w-7 p-0" disabled>
        <Receipt className="h-3.5 w-3.5" />
      </Button>
    );
  }

  return (
    <>
      <Button
        variant="ghost"
        size="sm"
        className="h-7 w-7 p-0"
        onClick={() => setFullscreenOpen(true)}
      >
        <Receipt className="h-3.5 w-3.5" />
      </Button>

      <Dialog open={fullscreenOpen} onOpenChange={setFullscreenOpen}>
        <DialogContent className="max-w-2xl p-2">
          <img
            src={imageUrl}
            alt="レシート"
            className="w-full rounded-md object-contain"
          />
        </DialogContent>
      </Dialog>
    </>
  );
}
