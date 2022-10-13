import {Command} from "./constant";

export type PkgJson = {
  scripts: Scripts;
  scriptsCommands: Scripts;
  name: string;
};
export type PkgPath = string;
export type ScriptName = string;
export type ScriptCommand = string;
export type Scripts = {
  [scriptName: ScriptName]: ScriptCommand;
};
