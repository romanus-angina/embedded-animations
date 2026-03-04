import {makeProject} from '@motion-canvas/core';

import spiFifo from './scenes/spiFifo?scene';

export default makeProject({
  scenes: [spiFifo],
  fps: 60,
});
