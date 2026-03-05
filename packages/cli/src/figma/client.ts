export interface FigmaFile {
  name: string;
  document: FigmaNode;
}

export interface FigmaNode {
  id: string;
  name: string;
  type: string;
  children?: FigmaNode[];
  componentPropertyDefinitions?: Record<string, FigmaComponentProperty>;
  componentProperties?: Record<string, FigmaComponentPropertyValue>;
  boundVariables?: Record<string, FigmaBoundVariable | FigmaBoundVariable[]>;
  characters?: string;
  fills?: FigmaPaint[];
  strokes?: FigmaPaint[];
  effects?: FigmaEffect[];
  absoluteBoundingBox?: { x: number; y: number; width: number; height: number };
  paddingLeft?: number;
  paddingRight?: number;
  paddingTop?: number;
  paddingBottom?: number;
  itemSpacing?: number;
  layoutMode?: "HORIZONTAL" | "VERTICAL" | "NONE";
}

export interface FigmaComponentProperty {
  type: "BOOLEAN" | "TEXT" | "INSTANCE_SWAP" | "VARIANT";
  defaultValue: string | boolean;
  variantOptions?: string[];
  preferredValues?: Array<{ type: string; key: string }>;
}

export interface FigmaComponentPropertyValue {
  type: string;
  value: string | boolean;
}

export interface FigmaBoundVariable {
  type: string;
  id: string;
}

export interface FigmaPaint {
  type: string;
  color?: { r: number; g: number; b: number; a: number };
  boundVariables?: Record<string, FigmaBoundVariable>;
}

export interface FigmaEffect {
  type: string;
  boundVariables?: Record<string, FigmaBoundVariable>;
}

export interface FigmaVariableCollection {
  id: string;
  name: string;
  variableIds: string[];
}

export interface FigmaVariable {
  id: string;
  name: string;
  resolvedType: "BOOLEAN" | "FLOAT" | "STRING" | "COLOR";
  valuesByMode: Record<string, unknown>;
}

export interface FigmaVariablesResponse {
  meta: {
    variableCollections: Record<string, FigmaVariableCollection>;
    variables: Record<string, FigmaVariable>;
  };
}

export interface FigmaClient {
  getFile(fileKey: string, nodeId?: string): Promise<FigmaFile>;
  getVariables(fileKey: string): Promise<FigmaVariablesResponse>;
}

export function createFigmaClient(token: string): FigmaClient {
  const baseUrl = "https://api.figma.com/v1";

  async function request<T>(url: string): Promise<T> {
    const response = await fetch(url, {
      headers: { "X-Figma-Token": token },
    });

    if (!response.ok) {
      const text = await response.text();
      throw new Error(`Figma API error (${response.status}): ${text}`);
    }

    return response.json() as Promise<T>;
  }

  return {
    async getFile(fileKey: string, nodeId?: string): Promise<FigmaFile> {
      let url = `${baseUrl}/files/${fileKey}`;
      if (nodeId) {
        url += `?ids=${nodeId}`;
      }
      return request<FigmaFile>(url);
    },

    async getVariables(fileKey: string): Promise<FigmaVariablesResponse> {
      return request<FigmaVariablesResponse>(`${baseUrl}/files/${fileKey}/variables/local`);
    },
  };
}

/**
 * Parse a Figma URL into fileKey and optional nodeId.
 *
 * Supported formats:
 * - figma.com/design/:fileKey/:fileName?node-id=:nodeId
 * - figma.com/design/:fileKey/branch/:branchKey/:fileName
 * - figma.com/file/:fileKey/...
 */
export function parseFigmaUrl(url: string): { fileKey: string; nodeId?: string } | null {
  try {
    const parsed = new URL(url);
    if (!parsed.hostname.includes("figma.com")) return null;

    const pathParts = parsed.pathname.split("/").filter(Boolean);

    // /design/:fileKey/branch/:branchKey/:fileName or /design/:fileKey/:fileName
    // /file/:fileKey/...
    const typeIndex = pathParts.findIndex((p) => p === "design" || p === "file");
    if (typeIndex === -1 || !pathParts[typeIndex + 1]) return null;

    let fileKey = pathParts[typeIndex + 1];

    // If branch URL, use branchKey
    if (pathParts[typeIndex + 2] === "branch" && pathParts[typeIndex + 3]) {
      fileKey = pathParts[typeIndex + 3]!;
    }

    // Parse node-id from query params (format: "1-234" → "1:234")
    const nodeIdParam = parsed.searchParams.get("node-id");
    const nodeId = nodeIdParam?.replace(/-/g, ":") ?? undefined;

    return { fileKey, nodeId };
  } catch {
    return null;
  }
}
