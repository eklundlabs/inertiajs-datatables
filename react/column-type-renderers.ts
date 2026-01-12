import TextColumn from './components/columns/text-column';

export const ColumnTypeRenderers = {
    TextColumn,
} as const;

export type ColumnType = keyof typeof ColumnTypeRenderers;
