import { fireTick } from "../lib/tlm/src/internal/processQueues";
import { launchTime, reasync } from "../lib/tlm/src/process";

const test = 1 << 2;

for (const t of ["a"]) {
  //continue; // not suported by luaJ 2.0
}

const ob = new Map<string, number>();

ob.set("One", 1);
ob.set("Two", 2);
ob.set("Three", 3);
ob.set("Two", 22);

//function print(...a) {return console.log(...a)}
for (const [k, v] of ob) {
  print(k, v);
}
print(`test ${ob.get("Two")}`);

function estimateTimeToNextCycle(currentTime: number) {
  const timeSinceLaunch = currentTime - launchTime;
  return (4000 - timeSinceLaunch) % 4000;
}

let i = 0;
eventLoop = (t) => {
  let st = os.time();
  let me = ++i;
  print(`evtLoop ${me} duration since launch?`, (st - launchTime) / 1000);
  print(`evtLoop ${me} cycleId?`, math.floor((st - launchTime) / 4000));
  print(`evtLoop ${me} time to reset?`, estimateTimeToNextCycle(st) / 1000);

  reasync(namae)().then((v) => {
    print(me, "ret", ...v);
  });

  //print(`evtLoop ${me} mid ms:`, os.time() - st)
  //fireTick("loop");
  fireTick("event");

  //fuck runtim
  for (let i = 0; i < 15000; i++) {
    const j = i + 1;
  }
  print(`evtLoop ${me} total ms:`, os.time() - st);
  if (os.time() - st > 10) {
    //error("muchs runtime " + (os.time() - st))
  }
};

//eventLoop(2);
//globalThis.eventLoop(4);

function te() {
  return new Promise((res) => {
    res("!");
    print("...");
  });
}
te()
  .then((v) => print(v))
  .then((v) => print(`2222 ${v}`));

new Promise((res) => {
  res("!");
})
  .then((v) => {
    print(v);
    return 4;
  })
  .then((v) => print("am i 4?", v));

async function namae(): Promise<[number, number]> {
  //throw new Error("34tf4f34")
  //print(debug.traceback("aaaa"))
  return [1, 2];
}

(async () => {
  print("honk");
  reasync(async (sad: number, angry: boolean) => {
    return { oof: 2 };
  })(2, false).then((v) => {
    print("am i 2 ?", v.oof);
  });

  print(...(await namae()));
  const a = await reasync(async (sad: number, angry: boolean) => {
    return { oof: 6 };
  })(2, false);
  print("am i 6 ?", a.oof);
})();

if (tfm == null) {
  // Start the Event Loop for non-TFM environments

  os.time = os.clock;
  const wait = (n: number) => {
    // By geniuses @ https://stackoverflow.com/q/17987618
    const [waiter] = io.popen("ping -n " + n + " localhost > NUL");
    waiter.close();
  };

  while (true) {
    wait(2);
    eventLoop(2);
  }
}
