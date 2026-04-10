import { useRef, useState, useCallback } from "react";
import { supabase } from "@/integrations/supabase/client";

export const useAudioRecorder = () => {
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const chunksRef = useRef<Blob[]>([]);
  const [isRecording, setIsRecording] = useState(false);

  const startRecording = useCallback(async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      const recorder = new MediaRecorder(stream, { mimeType: "audio/webm" });
      chunksRef.current = [];

      recorder.ondataavailable = (e) => {
        if (e.data.size > 0) chunksRef.current.push(e.data);
      };

      recorder.start(1000); // collect in 1s chunks
      mediaRecorderRef.current = recorder;
      setIsRecording(true);
    } catch (err) {
      console.error("Microphone access denied or unavailable:", err);
    }
  }, []);

  const stopRecording = useCallback(async (userId: string, logId: string): Promise<string | null> => {
    return new Promise((resolve) => {
      const recorder = mediaRecorderRef.current;
      if (!recorder || recorder.state === "inactive") {
        setIsRecording(false);
        resolve(null);
        return;
      }

      recorder.onstop = async () => {
        // Stop all tracks to release the mic
        recorder.stream.getTracks().forEach((t) => t.stop());
        setIsRecording(false);

        const blob = new Blob(chunksRef.current, { type: "audio/webm" });
        if (blob.size === 0) {
          resolve(null);
          return;
        }

        const filePath = `${userId}/${logId}_${Date.now()}.webm`;
        const { error } = await supabase.storage
          .from("evidence")
          .upload(filePath, blob, { contentType: "audio/webm", upsert: false });

        if (error) {
          console.error("Evidence upload failed:", error);
          resolve(null);
          return;
        }

        // Save the path back to the distress log
        await supabase
          .from("distress_logs")
          .update({ recording_url: filePath })
          .eq("id", logId);

        resolve(filePath);
      };

      recorder.stop();
    });
  }, []);

  return { isRecording, startRecording, stopRecording };
};
