import {Command} from "./constant";
import pc from "picocolors";

export function parseArgs(): Command {
  const command = process.argv[2] as Command;

  const others = process.argv.slice(3);
  if (others.length) {
    console.log(pc.red(`do not support ${others.join(" ")}`));
    process.exit(1);
  }

  if (!Object.values(Command).includes(command)) {
    if (command) console.log(pc.red(`Unknown arguments: ${command}`));
    return Command.DRY_RUN;
  }
  return command;
}
