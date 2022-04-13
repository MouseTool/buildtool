import type {
  PhaseTypes,
  ProcessQueueOptions,
  TickStats,
  TickTypes,
} from "../process";
import launchTime from "./launchTime";
import { GeneralProcessQueue, IProcessQueue } from "./queueOps";

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
let rationLevelCritical = 90;

// ! Tick stats !
let currentTickType: TickTypes;
let currentPhase: PhaseTypes;
let currentQueuedAt: number;

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
const timeSinceLaunchOffset = -100;

/**
 * Calculates the ration pressure level, denoting how aggressive runtime savings should be.
 */
function calculateRationPressure(timeSinceLaunch: number) {
  const timeLeftToReset = (cycleDuration - timeSinceLaunch) % cycleDuration;

  // Calculate the pressure...
  return (
    // 1. Raw ratio of runtime usage over limit weighs 80%
    (cycleRuntimeUse / runtimeLimit) * 80 +
    // 2. `timeLeftToReset` weighs 20%, a lower `timeLeftToReset` causes a lower pressure
    (timeLeftToReset / 4000) * 20
  );
}

/**
 * Checks current runtime usage and does bookkeeping on the runtime cycle status.
 *
 *
 */
function runtimeCheck() {
  const currentTime = osTime();
  const timeSinceLaunch = currentTime - launchTime + timeSinceLaunchOffset;
  const currentCycleId = mathFloor(timeSinceLaunch / cycleDuration);


  //print("before runt use", cycleRuntimeUse)
  if (currentCycleId > cycleId) {
    cycleRuntimeUse = 0;
    cycleId = currentCycleId
    isPaused = false;
    print("!!!!!! Resumed !!!!!!!")
  }

  const pressure = calculateRationPressure(timeSinceLaunch);
  if (pressure > rationLevelCritical) {
    isPaused = true;
    print("!!!!!! Paused !!!!!!!")
  }

  print("pressure", pressure)

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
export function queue(type: QueuableTypes, callback: Function, ...args: any) {
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

let currentTickCoroutine: LuaThread;

export function fireTick(tickType: TickTypes) {
  if (isPaused) {
    runtimeCheck();
    // resume coroutine
    if (!isPaused) {
      coroutine.resume(currentTickCoroutine);
    }
    return;
  }

  currentTickCoroutine = coroutine.create(() => {
    runtimeCheck();
    if (isPaused) {
      coroutine.yield();
    }

    const seq = tickQueueSeq[tickType];
    if (!seq) {
      error(`Invalid tick type ${tickType}!`);
    }

    currentTickType = tickType;

    let tmp = os.time();
    let d = false
    for (const qType of seq) {
      currentPhase = qType;

      const iter = queueOps[qType].drain();
      while (true) {
        const startTime = osTime()
        const result = iter.next();
        if (result.done) {
          break;
        }
        cycleRuntimeUse += osTime() - startTime

        const pressure = runtimeCheck();
        if (isPaused) {
          coroutine.yield();
        } else if (qType == "deferrables" && pressure > rationLevelMedium) {
          print("defer again")
          break;
        }
      }
      //print(`cb take time: ${os.time() - tmp}`);

      // Drain the post-phase queue after each seq
      const postIter = queueOps["postPhase"].drain();
      while (true) {
        const startTime = osTime()
        const result = postIter.next();
        if (result.done) {
          break;
        }
        cycleRuntimeUse += osTime() - startTime

        runtimeCheck();
        if (isPaused) {
          coroutine.yield();
        }
      }
      print(d?2:1,"drain take ms: ",  osTime() - tmp)
      d=true
      //print(`postcb take time: ${os.time() - tmp}`);
    }
  });

  let tmp = os.time();
  coroutine.resume(currentTickCoroutine);
  print("fire total take ms: ",  osTime() - tmp)
}

/**
 * Calculates the runtime usage within the current 4-seconds cycle.
 */
export function runtimeUsage() {
  return os.time();
}

/**
 * Provides information on the state of the current event loop.
 */
export function tickStats() {
  return {
    currentPhase,
    currentQueuedAt,
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
