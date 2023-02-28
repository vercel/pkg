import type { log } from './log';

export interface FileRecord {
  file: string;
  body?: Buffer | string;
  // This could be improved a bit. making this stricter opens up a lot of
  // changes that need to be made throughout the code though
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  [key: number]: any;
}

export type FileRecords = Record<string, FileRecord>;

type License = string | { type: string };

export interface Patches {
  [filename: string]: Array<
    | { command: 'replace'; from: string; to: string }
    | { command: 'append' | 'erase' | 'prepend'; source: string }
  >;
}

export interface ConfigDictionary {
  [key: string]: {
    dependencies?: Record<string, string>;
    pkg?: {
      dependencies?: Record<string, string>;
    };
  };
}

export interface PkgOptions {
  assets?: string[];
  deployFiles?: string[][];
  dictionary: ConfigDictionary;
  files?: string[];
  log?(logger: typeof log, context: Record<string, string>): void;
  patches?: Patches;
  scripts?: string[];
}

export interface PackageJson {
  name?: string;
  private?: boolean;
  // TODO remove invalid metadata - https://docs.npmjs.com/cli/v8/configuring-npm/package-json#license
  licenses?: License;
  license?: License;
  main?: string;
  dependencies?: Record<string, string>;
  files?: string[];
  pkg?: PkgOptions;
}

export const platform = {
  macos: 'darwin',
  win: 'win32',
  linux: 'linux',
};

export interface NodeTarget {
  nodeRange: string;
  arch: string;
  platform: keyof typeof platform;
  forceBuild?: boolean;
}

export interface Target extends NodeTarget {
  binaryPath: string;
  output: string;
  fabricator: Target;
}

export type SymLinks = Record<string, string>;
