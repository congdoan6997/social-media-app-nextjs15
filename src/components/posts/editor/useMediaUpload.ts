"use client";

import { useToast } from "@/components/ui/use-toast";
import { useUploadThing } from "@/lib/uploadthing";
import { useState } from "react";

export interface Attachment {
  file: File;
  mediaId?: string;
  isUploading: boolean;
}

export default function useMediaUpload() {
  const { toast } = useToast();

  const [attachments, setAttachments] = useState<Attachment[]>([]);

  const [uploadProgress, setUploadProgress] = useState<number>();

  const { startUpload, isUploading } = useUploadThing("attachment", {
    onBeforeUploadBegin(files) {
      const renamedFiles = files.map((file) => {
        const extension = file.name.split(".").pop();
        return new File(
          [file],
          `attachment_${crypto.randomUUID()}.${extension}`,
          { type: file.type },
        );
      });

      setAttachments((prev) => [
        ...prev,
        ...renamedFiles.map((file) => ({ file, isUploading: true })),
      ]);

      return renamedFiles;
    },

    onUploadProgress: setUploadProgress,
    onClientUploadComplete(res) {
      setAttachments((prev) => {
        return prev.map((attachment) => {
          const uploadResult = res.find((r) => r.name === attachment.file.name);
          if (!uploadResult) return attachment;

          return {
            ...attachment,
            mediaId: uploadResult.serverData.mediaId,
            isUploading: false,
          };
        });
      });
    },
    onUploadError(e) {
      setAttachments((prev) => prev.filter((a) => !a.isUploading));

      toast({
        variant: "destructive",
        description: e.message,
      });
    },
  });

  function handleStartUpload(files: File[]) {
    if (isUploading) {
      toast({
        variant: "destructive",
        description: "Please wait for the current upload to finish.",
      });

      return;
    }

    if (attachments.length + files.length > 5) {
      toast({
        variant: "destructive",
        description: "Cannot upload more than 5 attachments per post.",
      });

      return;
    }

    startUpload(files);
  }
  function removeAttachment(fileName: string) {
    setAttachments((prev) => prev.filter((a) => a.file.name !== fileName));
  }

  function reset() {
    setAttachments([]);
    setUploadProgress(undefined);
  }

  return {
    attachments,
    startUpload: handleStartUpload,
    isUploading,
    removeAttachment,
    reset,
    uploadProgress,
  };
}
