type PromptRow = {
  id: number;
  workspace: string;
  project_name: string;
  content: string;
  version: number;
  iteration: number;
  input_images: string[];
  output_images: string[];
  created_at: string;
  updated_at: string;
};

type ProjectRow = { id: number; name: string; created_at: string; updated_at: string };

export function serializeImages(value: unknown): string {
  return JSON.stringify(Array.isArray(value) ? value.filter((item): item is string => typeof item === "string") : []);
}

function parseImages(value: unknown) {
  try { const parsed=JSON.parse(typeof value==="string"?value:"[]"); return Array.isArray(parsed)?parsed.filter((item):item is string=>typeof item==="string"):[]; }
  catch { return []; }
}

export function parsePromptRow<T extends Record<string, unknown>>(row: T): Omit<T, "input_images"|"output_images"> & { input_images:string[]; output_images: string[] } {
  return { ...row, input_images:parseImages(row.input_images), output_images:parseImages(row.output_images) };
}

export type { PromptRow, ProjectRow };
