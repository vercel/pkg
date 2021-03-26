export interface FileRecord {
  file: string;
  body?: Buffer;
  [key: number]: any;
}

export type FileRecords = Record<string, FileRecord>;
