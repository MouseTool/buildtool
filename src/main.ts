
const test = 1 << 2

for (const t of ["a"]) {
    continue
}

const ob = new Map<string, number>()

ob.set("One", 1)
ob.set("Two", 2)
ob.set("Three", 3)
ob.set("Two", 22)

//function print(...a) {return console.log(...a)}
for (const [k,v] of ob) {
    print(k, v)
}
print(`test ${ob.get("Two")}`)

declare namespace tfm {
    function banBolo(yes:boolean) ;
}



async function tupl():Promise<LuaMultiReturn<[number, number]>> {
    return $multi(6, 4);
}

function te() {
    return new Promise((res) => {
        res("!")
        print("...")
    })
}
te().then((v) => print(v))
