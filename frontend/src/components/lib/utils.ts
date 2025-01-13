export function formatTimeSlot(slot: number): string {
  const startTime = 9 + Math.floor(slot - 1);
  return `${startTime}:00 - ${startTime + 1}:00`;
}
