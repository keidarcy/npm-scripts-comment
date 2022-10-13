import fs from "node:fs";
import {Console} from "node:console";
import {spawnSync} from "node:child_process";

type FnWithLogger = (logger: Console) => void;

/**
 * @deprecated
 */
export function pager(fn: FnWithLogger) {
  const tmpPath = "/tmp/nsc-report.log";
  const output = fs.createWriteStream(tmpPath);
  const logger = new Console({stdout: output});
  fn(logger);
  setTimeout(() => output.emit("close"));
  output.on("close", () => {
    spawnSync(`less -R ${tmpPath}`, {shell: true, stdio: "inherit"});
    fs.unlinkSync(tmpPath);
  });
}
