import { time } from 'discord.js';
import { MS_PER_HOUR } from '../config/constants';

/** Formats a date as a full timestamp followed by a relative one. */
export const formatDate = (date: Date): string => {
  const seconds = Math.floor(date.getTime() / 1000);
  return time(seconds, 'F') + ' (' + time(seconds, 'R') + ')';
};

/** Formats a number of seconds as HH:MM:SS. */
export const formatDuration = (seconds: number): string => {
  const total = Math.floor(seconds);
  const hours = Math.floor(total / 3600);
  const minutes = Math.floor((total - hours * 3600) / 60);
  const secs = total - hours * 3600 - minutes * 60;
  return [hours, minutes, secs]
    .map((part) => String(part).padStart(2, '0'))
    .join(':');
};

export const hoursToMs = (hours: number): number => hours * MS_PER_HOUR;
