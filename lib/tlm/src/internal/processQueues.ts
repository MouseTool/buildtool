/** @noSelfInFile */

import type {
  PhaseTypes,
  ProcessQueueOptions,
  RuntimeCycleStats,
  TickStats,
  TickTypes,
} from "../process";
import launchTime from "./launchTime";
import {
  CallbackFunction,
  GeneralProcessQueue,
  getCurrentQueuedAt,
  IProcessQueue,
} from "./queueOps";

const osTime = os.time;
const mathFloor = math.floor;

export const options: ProcessQueueOptions = {
  cycleDuration: 4000,
  runtimeLimit: 60,
  rationLevelMedium: 60,
  rationLevelCritical: 90,
};

// ! Queue options !
let cycleDuration = 4000;
let runtimeLimit = 60;
let rationLevelMedium = 60;
let rationLevelCritical = 80;

// ! Tick stats !
let currentTickType: TickTypes;
let currentPhase: PhaseTypes;
// `currentQueuedAt` is in queueOps.

// ! Runtime cycle !
// Calculated from `floor((currentTime - launchTime) / cycleDuration)`
// This is an estimate, incrementing roughly every 4 seconds since the launch time.
let cycleId = 0;
let cycleRuntimeUse = 0;
let isPaused = false;

/**
 * We offset the `timeSinceLaunch` during cycle calculations to give some kind of buffer to avoid
 * early resets.
 */
const timeSinceLaunchOffset = -150;

/**
 * Calculates the ration pressure level, denoting how aggressive runtime savings should be.
 */
function calculateRationPressure(
  timeSinceLaunch: number = osTime() - launchTime + timeSinceLaunchOffset
) {
  const timeLeftToReset = (cycleDuration - timeSinceLaunch) % cycleDuration;

  const runtimeUseRatio = cycleRuntimeUse / runtimeLimit;
  // Calculate the pressure...
  return (
    // 1. Raw ratio (%) of runtime usage over limit,
    //    - ratio >= 0                 : weighs 80%
    //    - ratio >= rationLevelMedium : weighs 95%
    (runtimeUseRatio * 100 > rationLevelMedium
      ? runtimeUseRatio * 95
      : runtimeUseRatio * 80) +
    // 2. `timeLeftToReset` weighs 20%, a lower `timeLeftToReset` causes a lower pressure
    (timeLeftToReset / 4000) * 20
  );
}

/**
 * Checks current runtime usage and does bookkeeping on the runtime cycle status.
 *
 * @returns The calculated pressure.
 */
function runtimeCheck() {
  const currentTime = osTime();
  const timeSinceLaunch = currentTime - launchTime + timeSinceLaunchOffset;
  const currentCycleId = mathFloor(timeSinceLaunch / cycleDuration);

  //print("before runt use", cycleRuntimeUse)
  if (currentCycleId > cycleId) {
    cycleRuntimeUse = 0;
    cycleId = currentCycleId;
    if (isPaused) {
      isPaused = false;
      print("!!!!!! Resumed !!!!!!!");
    } else {
      print("!!!!!! Reset !!!!!!!");
    }
  }

  const pressure = calculateRationPressure(timeSinceLaunch);
  if (pressure > rationLevelCritical) {
    if (!isPaused) {
      isPaused = true;
      print("!!!!!! Paused !!!!!!!");
    }
  }

  print("pressure", pressure, cycleRuntimeUse);

  return pressure;
}

type QueuableTypes = PhaseTypes | "postPhase";

const queueOps: Record<QueuableTypes, IProcessQueue> = {
  timers: new GeneralProcessQueue(),
  deferrables: new GeneralProcessQueue(),
  events: new GeneralProcessQueue(),
  close: new GeneralProcessQueue(),
  postPhase: new GeneralProcessQueue(),
};

/**
 * Queues `callback` to the specified phase's queue `type`. Do not call this unless you know what
 * you're doing!
 */
export function queue(
  type: QueuableTypes,
  callback: CallbackFunction,
  ...args: any[]
) {
  const queueOp = queueOps[type];
  if (queueOp) {
    queueOp.enqueue(callback, ...args);
  } else {
    error(`Invalid queue type ${type}!`);
  }
}

const tickQueueSeq: Record<TickTypes, PhaseTypes[]> = {
  loop: ["deferrables", "close"],
  event: ["events", "close"],
  timer: ["timers", "close"],
};

let currentPhaseStack: PhaseTypes[] = [];
/**
 * Performs or resumes work for a phase.
 * @returns Whether or not the phase was completed
 */
function resumePhase(): boolean {
  const qType = currentPhaseStack[currentPhaseStack.length - 1];
  if (!qType) {
    print(qType, "why qType is nill", debug.traceback());
    return true;
  }
  currentPhase = qType;

  runtimeCheck();
  if (isPaused) {
    return false;
  }

  const mainQueue = queueOps[qType];
  while (true) {
    const startTime = osTime();
    if (!mainQueue.dequeue()) {
      break;
    }
    cycleRuntimeUse += osTime() - startTime;

    const pressure = runtimeCheck();
    if (isPaused) {
      return false;
    } else if (qType == "deferrables" && pressure > rationLevelMedium) {
      print("defer again");
      break;
    }
  }
  //print(`cb take time: ${os.time() - tmp}`);

  // Drain the post-phase queue after each seq
  const postQueue = queueOps["postPhase"];
  while (true) {
    const startTime = osTime();
    if (!postQueue.dequeue()) {
      break;
    }
    cycleRuntimeUse += osTime() - startTime;

    runtimeCheck();
    if (isPaused) {
      return false;
    }
  }

  currentPhaseStack[currentPhaseStack.length - 1] = null;
  return true;
}

export function fireTick(tickType: TickTypes) {
  if (isPaused) {
    runtimeCheck();
    // Resume event loop
    if (!isPaused) {
      resumePhase();
    }
    return;
  }

  const seq = tickQueueSeq[tickType];
  if (!seq) {
    error(`Invalid tick type ${tickType}!`);
  }

  currentTickType = tickType;
  currentPhaseStack = Array.from(seq).reverse();

  let tmp = os.time();
  resumePhase();
  print("fire total take ms: ", osTime() - tmp);
}

/**
 * Calculates the runtime usage (in ms) within the current 4-seconds cycle.
 */
export function runtimeCycleStats() {
  return {
    calculateRationPressure,
    cycleId,
    cycleRuntimeUse,
  } as RuntimeCycleStats;
}

/**
 * Provides information on the state of the current event loop.
 */
export function tickStats() {
  return {
    currentPhase,
    currentQueuedAt: getCurrentQueuedAt(),
    currentTickType,
  } as TickStats;
}

/**
 * Sets or retrieves the current process queue options.
 */
export function processQueueOpts(): ProcessQueueOptions;
export function processQueueOpts(options: Partial<ProcessQueueOptions>): void;
export function processQueueOpts(options?: Partial<ProcessQueueOptions>) {
  if (!options) {
    // Getter
    return {
      cycleDuration,
      rationLevelCritical,
      rationLevelMedium,
      runtimeLimit,
    } as ProcessQueueOptions;
  }

  cycleDuration = options.cycleDuration ?? cycleDuration;
  rationLevelCritical = options.rationLevelCritical ?? rationLevelCritical;
  rationLevelMedium = options.rationLevelMedium ?? rationLevelMedium;
  runtimeLimit = options.runtimeLimit ?? runtimeLimit;
}

// TODO: update doc, probably just drain deferrable during "event" tick
/**
 * A deferrable queues a callback differently depending on the ration pressure.
 *
 * - `rationPressure >= LOW`   : post-phase queue
 * - `rationPressure >= MEDIUM`: deferrables queue
 *
 * A deferrable function should therefore be written in anticipation that it will not execute
 * immediately, or soon.
 */
export function defer(
  fn: CallbackFunction
) {
  return (...args: any[]) => {
    queue("deferrables", fn, ...args);
  };
}
