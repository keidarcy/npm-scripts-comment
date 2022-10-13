import fs from "node:fs";
import pc from "picocolors";
import fg from "fast-glob";
import type {PkgPath, Scripts, PkgJson} from "./types";
import {Command} from "./constant";

export class NpmScriptCommands {
  private pkgJsonFile = "package.json";
  private ignorePath = ["node_modules", "**/**/node_modules"];
  private log = console.log;
  private pkgJsonMap = new Map<PkgPath, PkgJson>();
  private pkgJsonPaths: PkgPath[] = [];
  private scriptsMap = new Map<PkgPath, Scripts>();
  private scriptsCommandsMap = new Map<PkgPath, Scripts>();
  private errors: Error[] = [];

  constructor(private readonly command: Command) {
    this.getAll();
  }

  public run() {
    switch (this.command) {
      case Command.SYNC:
        this.sync();
        break;
      case Command.REPORT:
        this.report();
        break;
      case Command.LINT:
        this.lint();
        break;
      case Command.DRY_RUN:
        this.dryRun();
        break;
      default:
        this.help();
    }
  }

  private help() {
    const helpMessage = `
Usage: nsc [command]
Command:
  sync          Sync scripts with scriptsCommands field.
  help          Show this help message.
  report        Show report of scripts and scriptsCommands.
  lint          Check if scripts is synced with scriptsCommands field.
`;
    console.log(helpMessage);
  }

  private sync() {
    this.addCommands();
    this.write();
  }

  private report() {
    for (const [pkgPath, json] of this.pkgJsonMap) {
      const data: {
        [x: string]: {"Script Name": string; "Script Command": string; "Script Commands": string};
      } = {};
      this.log(pc.blue(`NPM scripts and description for ${pc.underline(pc.bold(json.name))}.`));
      const scripts = this.scriptsMap.get(pkgPath);
      const scriptsCommands = this.scriptsCommandsMap.get(pkgPath);
      let index = 0;
      for (const name in scripts) {
        if (!Object.prototype.hasOwnProperty.call(scripts, name)) continue;
        data[index] = {
          "Script Name": name,
          "Script Command": scripts[name],
          "Script Commands": scriptsCommands?.[name] || "Empty command",
        };
        index++;
      }
      console.table(data);
    }
  }

  private findAllPath() {
    const ignorePattern = this.ignorePath.map((path) => `!${path}`);
    this.pkgJsonPaths = fg.sync([this.pkgJsonFile, `**/**/${this.pkgJsonFile}`, ...ignorePattern]);
  }

  private getAll() {
    this.findAllPath();
    for (const pkgJsonPath of this.pkgJsonPaths) {
      const json = this.parse(pkgJsonPath);
      this.scriptsMap.set(pkgJsonPath, json.scripts);
      this.scriptsCommandsMap.set(pkgJsonPath, json.scriptsCommands || {});
      this.pkgJsonMap.set(pkgJsonPath, json);
    }
  }

  private parse(pkgJsonPath: PkgPath): PkgJson {
    try {
      return JSON.parse(fs.readFileSync(pkgJsonPath, "utf-8")) as PkgJson;
    } catch (error) {
      this.log(pc.red(`JSON parse error in ${pkgJsonPath}`));
      throw error;
    }
  }

  private addCommands() {
    for (let [pkgJsonPath, json] of this.pkgJsonMap) {
      const scripts = this.scriptsMap.get(pkgJsonPath);
      const scriptsCommands = this.scriptsCommandsMap.get(pkgJsonPath);

      if (!json.scriptsCommands) {
        this.log(pc.blue(`🚀 Generate \`scriptsCommands\` key for ${pc.underline(pc.bold(pkgJsonPath))} first time.`));
        json = {...json, scriptsCommands: {}};
      }
      for (const scriptName in scripts) {
        if (!Object.prototype.hasOwnProperty.call(scripts, scriptName)) continue;
        json.scriptsCommands[scriptName] = scriptsCommands?.[scriptName] || "";
      }
      this.pkgJsonMap.set(pkgJsonPath, json);
    }
  }

  private write() {
    for (const [pkgJsonPath, json] of this.pkgJsonMap) {
      fs.writeFileSync(pkgJsonPath, JSON.stringify(json, null, 2));
    }
    this.log(
      pc.green(
        `\n✨ Successfully synced ${pc.green(
          pc.underline(pc.bold(this.pkgJsonPaths.map((p) => `\`${p}\``).join(" "))),
        )} scriptsCommands with scripts field.`,
      ),
    );
  }

  private dryRun() {
    for (const [pkgJsonPath, json] of this.pkgJsonMap) {
      this.log(JSON.stringify(json, null, 2));
      this.log(pc.green(`${pc.underline(pc.bold(pkgJsonPath))} will be ⬆️\n`));
    }
    this.log(pc.red("\nThis is a dry run. No changes were made."));
    process.exit(0);
  }

  private lint() {
    for (const [pkgJsonPath, scriptCommands] of this.scriptsCommandsMap) {
      const scripts = this.scriptsMap.get(pkgJsonPath);
      for (const scriptName in scriptCommands) {
        if (!Object.prototype.hasOwnProperty.call(scriptCommands, scriptName)) continue;
        if (!scripts?.[scriptName]) {
          const errorMessage = pc.red(
            `[${this.pkgJsonMap.get(pkgJsonPath)?.name}] has unsynced scriptsCommands: \`${scriptName}\``,
          );
          this.errors.push(new Error(errorMessage));
        }
      }
    }
    if (!this.errors.length) {
      console.log(pc.green("✨ All scriptsCommands are synced with scripts field."));
      process.exit(0);
    }
    this.handleErrors();
  }

  private handleErrors() {
    for (const error of this.errors) {
      this.log(error.message);
    }
    process.exit(1);
  }

  public static create(command: Command): NpmScriptCommands {
    return new NpmScriptCommands(command);
  }
}
