declare module 'multistream' {
  import { Stream } from 'stream';

  interface FactoryStreamCallback {
    (err: Error | null, stream: null): any;
    (err: null, stream: NodeJS.ReadableStream): any;
  }

  type LazyStream = () => Stream;
  type FactoryStream = (cb: FactoryStreamCallback) => void;
  type Streams = Array<LazyStream | NodeJS.ReadableStream> | FactoryStream;

  export default class multistream extends Stream {
    constructor(streams: Streams);
  }
}
