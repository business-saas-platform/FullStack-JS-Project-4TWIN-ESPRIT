export const toIso = (d?: Date | null): string | undefined => (d ? d.toISOString() : undefined);
