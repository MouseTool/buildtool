import { LuaHelp } from "./parser/dist";

export type LuaHelpDocumentModes = "events" | "functions" | "enums"

export default interface Converter {
    type: LuaHelpDocumentModes;
    convert: (luaHelpAst: LuaHelp) => string[]
}
