import {PlayStateData} from '../shared/protocol/messages';
import {CueFile} from '../shared/file/file';
import {PreparedFile, prepareFile, getActiveEvents} from '../shared/file/file-usage';

import {Color, Colors} from '../data/colors';

export class SynesthesiaDisplay {

  private readonly leds: Color[] = [];

  private readonly effectiveStartTimeMillis: number;
  private readonly preparedFile: PreparedFile;

  public constructor(numberOfLeds: number, state: PlayStateData) {
    for (let i = 0; i < numberOfLeds; i++) {
      this.leds.push(Colors.Black);
    }
    this.effectiveStartTimeMillis = state.effectiveStartTimeMillis;
    this.preparedFile = prepareFile(state.file);
  }

  public getDisplay(): Color[] {

    // Zero-Out leds
    for (let i = 0; i < this.leds.length; i++) {
      this.leds[i] = Colors.Black;
    }
    const positionMillis = new Date().getTime() - this.effectiveStartTimeMillis;

    // Get the active events for each layer
    for (const layer of this.preparedFile.layers) {
      const activeEvents = getActiveEvents(layer.events, positionMillis);
      if (activeEvents.length > 0) {
        this.leds[0] = Colors.White;
      }
    }

    return this.leds;
  }

}