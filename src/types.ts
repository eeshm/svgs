export type PresetKey = "fade" | "slide" | "draw" | "scale" | "stagger" | "rotate";

export type ScopeMode = "all" | "selected";

export type AllowedTag =
  | "svg"
  | "g"
  | "path"
  | "rect"
  | "circle"
  | "ellipse"
  | "line"
  | "polygon"
  | "polyline";

export interface SvgNode {
  id: string;
  tag: AllowedTag;
  attrs: Record<string, string>;
  children: SvgNode[];
}

export interface LayerItem {
  id: string;
  tag: Exclude<AllowedTag, "svg">;
  label: string;
}

export interface AnimationControlsState {
  duration: number;
  delay: number;
  stiffness: number;
  damping: number;
  mass: number;
}

export interface UploadPayload {
  text: string;
  fileName: string;
}
