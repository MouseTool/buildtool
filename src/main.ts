import { reasync } from "../lib/tlm/src/process";

const test = 1 << 2;

for (const t of ["a"]) {
  continue;
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

declare namespace tfm {
  function banBolo(yes: boolean);
}

async function tupl(): Promise<LuaMultiReturn<[number, number]>> {
  print("???");
  return $multi(6, 4);
}

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
  .then((v) => print(v));

async function namae(): Promise<LuaMultiReturn<[number, number]>> {
  return $multi(1, 2);
}
async () => {
  print(await namae());
  const a = await reasync(async (sad: number, angry: boolean) => {
    return { oof: 6 };
  })(2, false);
};
