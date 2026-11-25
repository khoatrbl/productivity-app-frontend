// Must match the backend's @Size and @Pattern on the pet name
export const PET_NAME_MIN = 3;
export const PET_NAME_MAX = 15;

export const PET_NAME_RULES: {
  label: string;
  test: (name: string) => boolean;
}[] = [
  {
    label: `${PET_NAME_MIN}–${PET_NAME_MAX} characters`,
    test: (name) =>
      name.trim().length >= PET_NAME_MIN && name.trim().length <= PET_NAME_MAX,
  },
  {
    label: "No line breaks",
    test: (name) => !/[\r\n]/.test(name),
  },
];

/** Cleans what the user typed: line breaks become spaces, outer spaces removed. */
export function normalizePetName(raw: string): string {
  return raw.replace(/[\r\n]+/g, " ").trim();
}

/** Returns a friendly error, or null when the name is valid. */
export function validatePetName(raw: string): string | null {
  const name = normalizePetName(raw);
  if (!name) return "Your capy needs a name!";
  if (name.length < PET_NAME_MIN)
    return `A little longer — at least ${PET_NAME_MIN} characters.`;
  if (name.length > PET_NAME_MAX)
    return `A little shorter — at most ${PET_NAME_MAX} characters.`;
  return null;
}
