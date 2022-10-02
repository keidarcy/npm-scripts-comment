import {Command} from "./constant";

export type PkgJson = {
  scripts: Scripts;
  scriptsComment: Scripts;
  name: string;
};
export type PkgPath = string;
export type ScriptName = string;
export type ScriptCommand = string;
export type Scripts = {
  [scriptName: ScriptName]: ScriptCommand;
};
export type Options = {
  dryRun: boolean;
  ignoreUnSynced: boolean;
  command: Command;
};
