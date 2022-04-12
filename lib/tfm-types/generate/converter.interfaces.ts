import { LuaHelp } from "./parser/dist";

export type LuaHelpDocumentModes = "functions" | "enums"

export default interface Converter {
    type: LuaHelpDocumentModes;
    convert: (luaHelpAst: LuaHelp) => string[]
}
