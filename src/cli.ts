import {Options} from "./types";

export function parseOptions(): Options {
  const command = process.argv[2];
  const flag = process.argv[3];
  return {
    command,
    dryRun: flag === "--dry-run",
    ignoreUnSynced: flag === "--ignore-un-synced",
  } as Options;
}
