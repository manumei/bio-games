"use client";

import { useEffect, useRef, useState } from "react";
import Button from "@/components/ui/Button";
import { shareText } from "@/lib/share";

export interface ShareButtonProps {
  getText: () => string;
  label?: string;
}

export default function ShareButton({
  getText,
  label = "Share result 📋",
}: ShareButtonProps) {
  const [feedback, setFeedback] = useState<string | null>(null);
  const timeoutRef = useRef<number | null>(null);

  useEffect(() => {
    return () => {
      if (timeoutRef.current !== null) {
        window.clearTimeout(timeoutRef.current);
      }
    };
  }, []);

  const handleClick = async () => {
    const result = await shareText(getText());
    if (timeoutRef.current !== null) {
      window.clearTimeout(timeoutRef.current);
    }

    if (result === "shared") {
      setFeedback("Shared! 🎉");
    } else if (result === "copied") {
      setFeedback("Copied! 📋");
    } else {
      setFeedback("Copy failed");
    }

    timeoutRef.current = window.setTimeout(() => {
      setFeedback(null);
      timeoutRef.current = null;
    }, 2000);
  };

  return (
    <Button variant="primary" onClick={handleClick}>
      {feedback ?? label}
    </Button>
  );
}

