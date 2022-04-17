import { promises as fsp } from "fs";
import Converter, { LuaHelpDocumentModes } from "./converter.interfaces";
import { luaEnumsConverter, tstlEnumsConverter } from "./luahelp-enum";
import { tstlEventsConverter } from "./luahelp-events";
import {
  luaFunctionsConverter,
  tstlFunctionsConverter,
} from "./luahelp-functions";
import { parse } from "./parser";

async function writeLuaMeta(mode: LuaHelpDocumentModes, lines: string[]) {
  await fsp.writeFile(
    `lua-types/luaLib/library/tfm.${mode}.lua`,
    "--- @meta\n" +
      "-- !! This file is generated by an NPM script. !!\n\n" +
      lines.join("\n")
  );
}

async function writeTstlMeta(mode: LuaHelpDocumentModes, lines: string[]) {
  await fsp.writeFile(
    `tstl-types/types/tfm.${mode}.d.ts`,
    "// !! This file is generated by an NPM script. !!\n\n" + lines.join("\n")
  );
}

(async () => {
  console.log("Parsing LuaHelp...");

  const ast = parse((await fsp.readFile("./luahelp.txt")).toString());

  // prettier-ignore
  const luaConverters = [
    luaEnumsConverter,
    luaFunctionsConverter
  ] as Converter[];

  for (const { type, convert } of luaConverters) {
    console.log("[Lua] Generating... " + type);
    await writeLuaMeta(type as LuaHelpDocumentModes, convert(ast));
  }

  // prettier-ignore
  const tstlConverters = [
    tstlEventsConverter,
    tstlEnumsConverter,
    tstlFunctionsConverter
  ] as Converter[];

  for (const { type, convert } of tstlConverters) {
    console.log("[TSTL] Generating... " + type);
    await writeTstlMeta(type as LuaHelpDocumentModes, convert(ast));
  }

  console.log("Wrote output to files.");
})();