export type PkgJson = {
  scripts: Scripts;
  scriptsComments: Scripts;
  name: string;
};
export type PkgPath = string;
export type ScriptName = string;
export type ScriptComment = string;
export type Scripts = {
  [scriptName: ScriptName]: ScriptComment;
};
