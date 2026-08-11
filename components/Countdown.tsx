"use client";

import { useEffect, useState } from "react";

const WEDDING_DATE = new Date("2027-03-26T17:00:00-03:00");
const TIME_LABELS = {
  days: "Dias",
  hours: "Horas",
  minutes: "Minutos",
  seconds: "Segundos",
} as const;

type TimeRemaining = Record<keyof typeof TIME_LABELS, number>;

const EMPTY_TIME: TimeRemaining = {
  days: 0,
  hours: 0,
  minutes: 0,
  seconds: 0,
};

function getTimeRemaining(): TimeRemaining {
  const difference = Math.max(0, WEDDING_DATE.getTime() - Date.now());

  return {
    days: Math.floor(difference / 86_400_000),
    hours: Math.floor((difference / 3_600_000) % 24),
    minutes: Math.floor((difference / 60_000) % 60),
    seconds: Math.floor((difference / 1_000) % 60),
  };
}

export function Countdown() {
  const [time, setTime] = useState<TimeRemaining>(EMPTY_TIME);

  useEffect(() => {
    const updateCountdown = () => setTime(getTimeRemaining());

    updateCountdown();
    const timer = window.setInterval(updateCountdown, 1_000);

    return () => window.clearInterval(timer);
  }, []);

  return (
    <div className="countdown" aria-label="Contagem regressiva para o casamento">
      {Object.entries(time).map(([unit, value]) => (
        <div className="time-card" key={unit}>
          <strong>{String(value).padStart(2, "0")}</strong>
          <span>{TIME_LABELS[unit as keyof TimeRemaining]}</span>
        </div>
      ))}
    </div>
  );
}
