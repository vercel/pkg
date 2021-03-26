export interface FileRecord {
  file: string;
  body?: Buffer | string;
  [key: number]: any;
}

export type FileRecords = Record<string, FileRecord>;

type License =
  | string
  | {
      type: string;
    };

export type Patches = Record<
  string,
  string & { do: 'erase' | 'prepend' | 'append' }[]
>;

export type ConfigDictionary = Record<
  string,
  {
    pkg?: {
      dependencies?: Record<string, string>;
    };
    dependencies?: Record<string, string>;
  }
>;

export interface PkgOptions {
  scripts?: string[];
  log?: (
    logger: (message: string) => void,
    context: Record<string, string>
  ) => void;
  assets?: string[];
  deployFiles?: string[];
  patches?: Patches;
  dictionary: ConfigDictionary;
}

export interface PackageJson {
  name?: string;
  private?: boolean;
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
