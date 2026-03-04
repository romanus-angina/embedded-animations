import {makeScene2D, Rect, Txt, Line, View2D} from '@motion-canvas/2d';
import {createRef, createRefArray, loop, Vector2, waitFor, spawn, linear, all, Reference, SimpleSignal} from '@motion-canvas/core';

const BG = '#0f0f0f';
const WHITE = '#e8e8e8';
const DIM = '#444444';

const CPU_STROKE = '#2c5f2d';
const CPU_FILL = '#1a3a1b';

const FIFO_STROKE = '#1c7293';
const FIFO_FILL = '#0a2e3d';

const SHIFT_STROKE = '#b85042';
const SHIFT_FILL = '#4a2018';

const TX_COLOR = '#e07040';
const TX_FILL = '#3a1a0a';

const RX_COLOR = '#ba61f9';
const RX_FILL = '#2f0a3a';

const DATA_COLOR = '#f9e795';

const SLOT_W = 80;
const SLOT_H = 60;
const GAP = 6;

const TX_X = 300;
const TX_Y = -250;

const PERIPHERAL_X = 550;

const WAVE_Y = 350;
const STEP = 30;
const AMP = 25;
const CYCLES = 40;

// Component creation functions
function createCPU(view: View2D) {
  const cpu = createRef<Rect>();
  view.add(
    <Rect
      ref={cpu}
      x={-400}
      y={0}
      width={140}
      height={100}
      radius={10}
      stroke={CPU_STROKE}
      lineWidth={3}
      fill={CPU_FILL}
    >
      <Txt
        text="CPU"
        fontSize={32}
        fill={WHITE}
      />
    </Rect>
  );
  return cpu;
}

function createFIFO(view: View2D) {
  const fifoContainer = createRef<Rect>();
  const fifoSlots = createRefArray<Rect>();

  view.add(
    <Rect
      ref={fifoContainer}
      x={0}
      y={0}
      padding={12}
      radius={10}
      stroke={FIFO_STROKE}
      lineWidth={2}
      fill={'#060e14'}
      layout
      direction={'column'}
      gap={GAP}
    >
      {[0, 1, 2, 3].map(i => (
        <Rect
          ref={fifoSlots}
          width={SLOT_W}
          height={SLOT_H}
          radius={6}
          stroke={FIFO_STROKE}
          lineWidth={2}
          fill={FIFO_FILL}
        >
          <Txt
            text={`${i}`}
            fontSize={32}
            fill={DIM}
          />
        </Rect>
      ))}
    </Rect>
  );

  view.add(
    <Txt
      text="FIFO"
      x={0}
      y={-175}
      fontSize={32}
      fill={WHITE}
    />
  );

  return {fifoContainer, fifoSlots};
}

function createShiftRegister(view: View2D) {
  const shiftContainer = createRef<Rect>();
  const shiftSlot = createRef<Rect>();
  
  view.add(
    <Rect
      ref={shiftContainer}
      x={TX_X}
      y={0}
      padding={12}
      radius={10}
      stroke={SHIFT_STROKE}
      lineWidth={2}
      fill={'#1a0a06'}
      layout
      direction={'column'}
    >
      <Rect
        ref={shiftSlot}
        width={SLOT_W}
        height={SLOT_H}
        radius={6}
        stroke={SHIFT_STROKE}
        lineWidth={2}
        fill={SHIFT_FILL}
      >
        <Txt
          text=""
          fontSize={32}
          fill={DIM}
        />
      </Rect>
    </Rect>
  );

  view.add(
    <Txt
      text="Shift Reg"
      x={TX_X}
      y={-80}
      fontSize={32}
      fill={WHITE}
    />
  );

  return {shiftContainer, shiftSlot};
}

function createTXRX(view: View2D) {
  const tx = createRef<Rect>();
  const rx = createRef<Rect>();

  view.add(
    <Rect
      ref={tx}
      x={TX_X}
      y={TX_Y}
      width={100}
      height={60}
      radius={6}
      stroke={TX_COLOR}
      lineWidth={2}
      fill={TX_FILL}
    >
      <Txt
        text="TX"
        fontSize={32}
        fill={WHITE}
      />
    </Rect>
  );

  view.add(
    <Rect
      ref={rx}
      x={TX_X}
      y={-TX_Y}
      width={100}
      height={60}
      radius={6}
      stroke={RX_COLOR}
      lineWidth={2}
      fill={RX_FILL}
    >
      <Txt
        text="RX"
        fontSize={32}
        fill={WHITE}
      />
    </Rect>
  );

  return {tx, rx};
}

function createPeripheral(view: View2D) {
  const peripheral = createRef<Rect>();
  view.add(
    <Rect
      ref={peripheral}
      x={PERIPHERAL_X}
      y={0}
      width={160}
      height={100}
      radius={10}
      stroke={'#4a7c9e'}
      lineWidth={3}
      fill={'#1a2e3a'}
    >
      <Txt
        text="Peripheral"
        fontSize={32}
        fill={WHITE}
      />
    </Rect>
  );
  return peripheral;
}

function createISRLines(view: View2D, cpu: Reference<Rect>, rx: Reference<Rect>) {
  const rxIsrLine = createRef<Line>();
  const rxIsrLabel = createRef<Txt>();

  view.add(
    <>
      <Line
        ref={rxIsrLine}
        points={[
          new Vector2(rx().x() - 50, rx().y()),
          new Vector2(rx().x() - 50, 250),
          new Vector2(-400, 250),
          new Vector2(-400, cpu().y() + 60),
        ]}
        stroke={RX_COLOR}
        lineWidth={2}
        lineDash={[8, 4]}
        endArrow
        arrowSize={10}
        end={0}
      />
      <Txt
        ref={rxIsrLabel}
        text="RX ISR"
        x={0}
        y={265}
        fontSize={24}
        fill={RX_COLOR}
        opacity={0}
      />
    </>
  );

  const isrLine = createRef<Line>();
  const isrLabel = createRef<Txt>();

  view.add(
    <>
      <Line
        ref={isrLine}
        points={[
          new Vector2(TX_X-50, TX_Y),
          new Vector2(-400, TX_Y),
          new Vector2(-400, -60),
        ]}
        stroke={TX_COLOR}
        lineWidth={2}
        lineDash={[8, 4]}
        endArrow
        arrowSize={10}
        end={0}
      />
      <Txt
        ref={isrLabel}
        text="TX ISR"
        x={0}
        y={TX_Y-50}
        fontSize={32}
        fill={TX_COLOR}
        opacity={0}
      />
    </>
  );

  return {isrLine, isrLabel, rxIsrLine, rxIsrLabel};
}

function createSCLK(view: View2D) {
  const sclk = createRef<Line>();
  const sclkLabel = createRef<Txt>();

  const points: Vector2[] = [];
  for (let i = 0; i < CYCLES * 2; i++) {
    const x = i * STEP;
    const high = i % 2 === 0;
    points.push(new Vector2(x, high ? AMP : -AMP));
    points.push(new Vector2(x + STEP, high ? AMP : -AMP));
  }

  view.add(
    <>
      <Txt
        ref={sclkLabel}
        text="SCLK"
        x={0}
        y={WAVE_Y+100}
        fontSize={32}
        fill={DATA_COLOR}
      />
      <Line
        ref={sclk}
        points={points}
        x={0}
        y={WAVE_Y}
        stroke={DATA_COLOR}
        lineWidth={2}
      />
      <Line
        points={[
          new Vector2(0, WAVE_Y - AMP - 15),
          new Vector2(0, WAVE_Y + AMP + 15),
        ]}
        stroke={DATA_COLOR}
        lineWidth={3}
      />
    </>
  );

  return {sclk, sclkLabel};
}

function createSCLKMarkers(view: View2D) {
  const sclkMarker = createRef<Line>();
  const rxSclkMarker = createRef<Line>();

  view.add(
    <Line
      ref={sclkMarker}
      points={[
        new Vector2(0, WAVE_Y - AMP - 15),
        new Vector2(0, WAVE_Y + AMP + 15),
      ]}
      x={0}
      stroke={TX_COLOR}
      lineWidth={3}
      opacity={0}
    />
  );

  view.add(
    <Line
      ref={rxSclkMarker}
      points={[
        new Vector2(0, WAVE_Y - AMP - 15),
        new Vector2(0, WAVE_Y + AMP + 15),
      ]}
      x={0}
      stroke={RX_COLOR}
      lineWidth={3}
      opacity={0}
    />
  );

  return {sclkMarker, rxSclkMarker};
}

// Animation sequences
function* bootstrapAnimation(
  view: View2D,
  tx: Reference<Rect>,
  cpu: Reference<Rect>,
  sclk: Reference<Line>,
  sclkMarker: Reference<Line>,
  isrLine: Reference<Line>,
  isrLabel: Reference<Txt>,
  activeMarkers: Reference<Line>[]
) {
  yield* waitFor(0.5);
  yield* tx().stroke('#ff9060', 0.3);
  yield* spawnPersistentMarker(view, sclk, 'tx', activeMarkers);
  yield* isrLine().end(1, 0.6);
  yield* isrLabel().opacity(1, 0.3);
  yield* cpu().stroke(TX_COLOR, 0.2);
  yield* cpu().stroke(CPU_STROKE, 0.3);
  yield* waitFor(0.5);
  yield* all(
    isrLine().end(0, 0.4),
    isrLabel().opacity(0, 0.4),
  );
}

function* spawnPersistentMarker(
  view: View2D,
  sclk: Reference<Line>,
  markerType: 'tx' | 'rx',
  activeMarkers: Reference<Line>[]
) {
  const marker = createRef<Line>();
  const markerColor = markerType === 'tx' ? TX_COLOR : RX_COLOR;
  
  view.add(
    <Line
      ref={marker}
      points={[
        new Vector2(0, WAVE_Y - AMP - 15),
        new Vector2(0, WAVE_Y + AMP + 15),
      ]}
      x={0}
      stroke={markerColor}
      lineWidth={3}
      opacity={0}
    />
  );
  
  // Add to active markers list
  activeMarkers.push(marker);
  
  // Position marker at the central SCLK marker and make it visible
  marker().x(0);
  yield* marker().opacity(1, 0.2);
  
  return marker;
}

function startSCLKScroll(
  sclk: Reference<Line>,
  sclkMarker: Reference<Line>,
  rxSclkMarker: Reference<Line>,
  activeMarkers: Reference<Line>[],
  clock: {paused: boolean}
) {
  spawn(function* () {
    while (true) {
      if (clock.paused) {
        yield* waitFor(0.05);
      } else {
        const delta = STEP * 2;
        const animations = [
          sclk().x(sclk().x() - delta, 0.5, linear),
          sclkMarker().x(sclkMarker().x() - delta, 0.5, linear),
          rxSclkMarker().x(rxSclkMarker().x() - delta, 0.5, linear),
        ];
        
        // Move all active persistent markers independently
        for (const marker of activeMarkers) {
          animations.push(marker().x(marker().x() - delta, 0.5, linear));
        }
        
        yield* all(...animations);
      }
    }
  });
}

function* populateFIFO(view: View2D, cpu: Reference<Rect>, fifoSlots: Rect[]) {
  const dataLabels: string[] = ['D0', 'D1', 'D2', 'D3'];
  const packets = createRefArray<Rect>();
  const dataLines = createRefArray<Line>();

  for (let i = 0; i < 4; i++) {
    view.add(
      <Line
        ref={dataLines}
        points={[
          new Vector2(cpu().x()+70, cpu().y()),
          new Vector2(fifoSlots[i].x(), fifoSlots[i].y()),
        ]}
        stroke={DATA_COLOR}
        lineWidth={2}
        lineDash={[6, 4]}
        end={0}
      />
    );
  }

  for (let i = 0; i < 4; i++) {
    view.add(
      <Rect
        ref={packets}
        x={cpu().x()}
        y={cpu().y()}
        width={60}
        height={40}
        radius={8}
        fill={DATA_COLOR}
        opacity={0}
      >
        <Txt
          text={dataLabels[i]}
          fontSize={14}
          fontWeight={700}
          fill={'#1a1a1a'}
        />
      </Rect>
    );

    yield* packets[i].opacity(1, 0.15);
    yield* all(
      packets[i].x(fifoSlots[i].x(), 0.4),
      packets[i].y(fifoSlots[i].y(), 0.4),
      dataLines[i].end(1, 0.4),
    );
    yield* dataLines[i].end(0, 0.15);
    yield* fifoSlots[i].fill('#1a3a2a', 0.15);
    yield* waitFor(0.3);
  }

  return packets;
}

function* transferNextByteAndRXISR(
  view: View2D,
  clock: {paused: boolean},
  packets: Rect[],
  fifoSlots: Rect[],
  shiftSlot: Reference<Rect>,
  rx: Reference<Rect>,
  cpu: Reference<Rect>,
  sclk: Reference<Line>,
  rxSclkMarker: Reference<Line>,
  rxIsrLine: Reference<Line>,
  rxIsrLabel: Reference<Txt>,
  activeMarkers: Reference<Line>[]
) {
  clock.paused = true;
  yield* waitFor(0.3);

  yield* all(
    packets[0].x(TX_X, 0.6),
    packets[0].y(shiftSlot().y(), 0.6),
    packets[1].x(fifoSlots[0].x(), 0.6),
    packets[1].y(fifoSlots[0].y(), 0.6),
    packets[2].x(fifoSlots[1].x(), 0.6),
    packets[2].y(fifoSlots[1].y(), 0.6),
    packets[3].x(fifoSlots[2].x(), 0.6),
    packets[3].y(fifoSlots[2].y(), 0.6),
    fifoSlots[3].fill(FIFO_FILL, 0.2),
  );

  yield* spawnPersistentMarker(view, sclk, 'rx', activeMarkers);
  yield* rx().stroke('#ce80ff', 0.3);
  yield* rxIsrLine().end(1, 0.6);
  yield* rxIsrLabel().opacity(1, 0.3);

  yield* cpu().stroke('#7b4a9e', 0.2);
  yield* cpu().stroke(CPU_STROKE, 0.3);

  yield* waitFor(1);

  yield* all(
    rxIsrLine().end(0, 0.4),
    rxIsrLabel().opacity(0, 0.4),
  );

  clock.paused = false;
  yield* waitFor(0.1); // Give the animation loop time to resume
}

function* transmitFromShiftRegister(
  view: View2D,
  clock: {paused: boolean},
  shiftPacket: Rect,
  peripheral: Reference<Rect>,
  tx: Reference<Rect>,
  cpu: Reference<Rect>,
  fifoSlots: Rect[],
  sclk: Reference<Line>,
  sclkMarker: Reference<Line>,
  isrLine: Reference<Line>,
  isrLabel: Reference<Txt>,
  newDataLabel: string,
  activeMarkers: Reference<Line>[]
) {
  clock.paused = true;
  yield* waitFor(0.3);

  // Move packet from shift register to Peripheral
  yield* all(
    shiftPacket.x(peripheral().x(), 0.6),
    shiftPacket.y(peripheral().y(), 0.6),
  );

  // Packet disappears into peripheral
  yield* shiftPacket.opacity(0, 0.3);

  // Flash TX and trigger TX ISR
  yield* tx().stroke('#ff9060', 0.3);
  yield* spawnPersistentMarker(view, sclk, 'tx', activeMarkers);
  yield* isrLine().end(1, 0.6);
  yield* isrLabel().opacity(1, 0.3);

  // CPU receives ISR
  yield* cpu().stroke(TX_COLOR, 0.2);
  yield* cpu().stroke(CPU_STROKE, 0.3);

  // Unpause clock before sending new packet
  clock.paused = false;
  yield* waitFor(0.1); // Give the animation loop time to resume

  // During TX ISR, CPU sends new data packet
  const newPacket = createRef<Rect>();
  view.add(
    <Rect
      ref={newPacket}
      x={cpu().x()}
      y={cpu().y()}
      width={60}
      height={40}
      radius={8}
      fill={DATA_COLOR}
      opacity={0}
    >
      <Txt
        text={newDataLabel}
        fontSize={14}
        fontWeight={700}
        fill={'#1a1a1a'}
      />
    </Rect>
  );

  yield* newPacket().opacity(1, 0.15);

  yield* all(
    newPacket().x(fifoSlots[3].x(), 0.4),
    newPacket().y(fifoSlots[3].y(), 0.4),
  );

  yield* fifoSlots[3].fill('#1a3a2a', 0.15);
  yield* waitFor(1);

  // Clean up
  yield* all(
    isrLine().end(0, 0.4),
    isrLabel().opacity(0, 0.4),
  );
  
  return newPacket();
}

export default makeScene2D(function* (view) {
  view.fill(BG);

  // Add title
  view.add(
    <Txt
      text="SPI Interrupt-Driven TX/RX"
      x={0}
      y={-400}
      fontSize={48}
      fontWeight={700}
      fill={WHITE}
    />
  );

  // Create all components
  const cpu = createCPU(view);
  const {fifoContainer, fifoSlots} = createFIFO(view);
  const {shiftContainer, shiftSlot} = createShiftRegister(view);
  const {tx, rx} = createTXRX(view);
  const peripheral = createPeripheral(view);
  const {isrLine, isrLabel, rxIsrLine, rxIsrLabel} = createISRLines(view, cpu, rx);
  const {sclk, sclkLabel} = createSCLK(view);
  const {sclkMarker, rxSclkMarker} = createSCLKMarkers(view);

  // Track all persistent markers
  const activeMarkers: Reference<Line>[] = [];

  // Run animation sequences
  yield* bootstrapAnimation(view, tx, cpu, sclk, sclkMarker, isrLine, isrLabel, activeMarkers);

  const clock = {paused: false};
  startSCLKScroll(sclk, sclkMarker, rxSclkMarker, activeMarkers, clock);

  const packets = yield* populateFIFO(view, cpu, fifoSlots);

  yield* transferNextByteAndRXISR(
    view,
    clock,
    packets,
    fifoSlots,
    shiftSlot,
    rx,
    cpu,
    sclk,
    rxSclkMarker,
    rxIsrLine,
    rxIsrLabel,
    activeMarkers
  );

  yield* waitFor(0.5);

  const newPacket1 = yield* transmitFromShiftRegister(
    view,
    clock,
    packets[0],
    peripheral,
    tx,
    cpu,
    fifoSlots,
    sclk,
    sclkMarker,
    isrLine,
    isrLabel,
    'D5',
    activeMarkers
  );
  
  // remove transmitted packet and add new one
  packets.shift();
  packets.push(newPacket1);

  yield* waitFor(1.5);

  yield* transferNextByteAndRXISR(
    view,
    clock,
    packets,
    fifoSlots,
    shiftSlot,
    rx,
    cpu,
    sclk,
    rxSclkMarker,
    rxIsrLine,
    rxIsrLabel,
    activeMarkers
  );

  yield* waitFor(1.5);

  const newPacket2 = yield* transmitFromShiftRegister(
    view,
    clock,
    packets[0],
    peripheral,
    tx,
    cpu,
    fifoSlots,
    sclk,
    sclkMarker,
    isrLine,
    isrLabel,
    'D6',
    activeMarkers
  );
  
  // remove transmitted packet and add new one
  packets.shift();
  packets.push(newPacket2);


  yield* waitFor(1);
});
