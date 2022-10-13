export const pkgJson = "package.json";
export const ignorePath = ["node_modules", "**/**/node_modules"];

export enum Command {
  SYNC = "sync",
  REPORT = "report",
  LINT = "lint",
  HELP = "help",
  DRY_RUN = "dry-run",
}
