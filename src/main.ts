import {EventEmitter} from "../lib/eventful/src/"
const evt = new EventEmitter()


function one() {
  print(1)
  evt.off("a", one)
}

function two() {
    print(2)
}

evt.on("a", one)
evt.on("a", one)
evt.on("a", two)

evt.emit("a")
print("+++++")
// 2nd itme
evt.emit("a")