declare module '@babel/generator' {
  import type * as t from '@babel/types';
  import type { DecodedSourceMap, Mapping } from '@jridgewell/gen-mapping';

  export interface GeneratorOptions {
    /**
     * Optional string to add as a block comment at the start of the output file.
     */
    auxiliaryCommentBefore?: string;

    /**
     * Optional string to add as a block comment at the end of the output file.
     */
    auxiliaryCommentAfter?: string;

    /**
     * Function that takes a comment (as a string) and returns true if the comment should be included in the output.
     * By default, comments are included if `opts.comments` is `true` or if `opts.minifed` is `false` and the comment
     * contains `@preserve` or `@license`.
     */
    shouldPrintComment?(comment: string): boolean;

    /**
     * Attempt to use the same line numbers in the output code as in the source code (helps preserve stack traces).
     * Defaults to `false`.
     */
    retainLines?: boolean;

    /**
     * Retain parens around function expressions (could be used to change engine parsing behavior)
     * Defaults to `false`.
     */
    retainFunctionParens?: boolean;

    /**
     * Should comments be included in output? Defaults to `true`.
     */
    comments?: boolean;

    /**
     * Set to true to avoid adding whitespace for formatting. Defaults to the value of `opts.minified`.
     */
    compact?: boolean | 'auto';

    /**
     * Should the output be minified. Defaults to `false`.
     */
    minified?: boolean;

    /**
     * Set to true to reduce whitespace (but not as much as opts.compact). Defaults to `false`.
     */
    concise?: boolean;

    /**
     * Used in warning messages
     */
    filename?: string;

    /**
     * Enable generating source maps. Defaults to `false`.
     */
    sourceMaps?: boolean;

    /**
     * A root for all relative URLs in the source map.
     */
    sourceRoot?: string;

    /**
     * The filename for the source code (i.e. the code in the `code` argument).
     * This will only be used if `code` is a string.
     */
    sourceFileName?: string;

    /**
     * Set to true to run jsesc with "json": true to print "\u00A9" vs. "©";
     */
    jsonCompatibleStrings?: boolean;

    /**
     * Set to true to enable support for experimental decorators syntax before module exports.
     * Defaults to `false`.
     */
    decoratorsBeforeExport?: boolean;

    // /**
    //  * Options for outputting jsesc representation.
    //  */
    // jsescOption?: jsescOptions;

    /**
     * For use with the recordAndTuple token.
     */
    recordAndTupleSyntaxType?: 'hash' | 'bar';
    /**
     * For use with the Hack-style pipe operator.
     * Changes what token is used for pipe bodies’ topic references.
     */
    topicToken?: '^^' | '@@' | '^' | '%' | '#';
  }

  export interface GeneratorResult {
    code: string;
    map: {
      version: number;
      sources: string[];
      names: string[];
      sourceRoot?: string;
      sourcesContent?: string[];
      mappings: string;
      file: string;
    } | null;
    decodedMap: DecodedSourceMap | undefined;
    rawMappings: Mapping[] | undefined;
  }

  export default function generate(
    ast: t.Node,
    opts?: GeneratorOptions,
    code?: string | { [filename: string]: string }
  ): GeneratorResult;
}
