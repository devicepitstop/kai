declare module 'recorder-js' {
  interface RecorderConfig {
    numberOfChannels?: number;
    // Add more if needed
  }

  export default class Recorder {
    constructor(audioContext: AudioContext, config?: RecorderConfig);
    start(): Promise<MediaStreamAudioSourceNode>;
    stop(): void;
    // Add more method signatures if you need to
  }
}
