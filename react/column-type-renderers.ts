import TextColumn from "./components/columns/text-column";
import BadgeColumn from "./components/columns/badge-column";

export const ColumnTypeRenderers = {
  TextColumn,
  BadgeColumn,
} as const;

export type ColumnType = keyof typeof ColumnTypeRenderers;
