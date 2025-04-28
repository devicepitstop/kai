declare module 'recorder-js' {
  export default class Recorder {
    constructor(audioContext: AudioContext);
    init(stream: MediaStream): Promise<void>;
    start(): void;
    stop(): Promise<{ blob: Blob; buffer: ArrayBuffer }>;
  }
}
