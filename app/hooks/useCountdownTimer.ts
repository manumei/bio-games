import { useEffect, useState } from "react";

export function useCountdownTimer(durationSeconds: number | null, active: boolean) {
    const [timeLeft, setTimeLeft] = useState<number | null>(null);
    const [expired, setExpired] = useState(false);

    useEffect(() => {
        if (durationSeconds === null || !active) return;

        const targetTime = Date.now() + durationSeconds * 1000;
        const interval = setInterval(() => {
        const diff = Math.round((targetTime - Date.now()) / 1000);
        if (diff <= 0) {
            clearInterval(interval);
            setTimeLeft(0);
            setExpired(true);
        } else {
            setTimeLeft(diff);
        }
        }, 500);

        return () => clearInterval(interval);
    }, [durationSeconds, active]);

    return { timeLeft, expired };
    }
