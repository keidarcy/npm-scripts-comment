import fs from "node:fs";
import pc from "picocolors";
import fg from "fast-glob";
import type {PkgPath, Scripts, PkgJson, Options} from "./types";
import {Command} from "./constant";

export class NpmScriptComments {
  private pkgJsonFile = "package.json";
  private ignorePath = ["node_modules", "**/**/node_modules"];
  private log = console.log;
  private pkgJsonMap = new Map<PkgPath, PkgJson>();
  private pkgJsonPaths: PkgPath[] = [];
  private scriptsMap = new Map<PkgPath, Scripts>();
  private scriptsCommentMap = new Map<PkgPath, Scripts>();
  private errors: Error[] = [];

  constructor(private readonly options: Options) {
    this.getAll();
  }

  public run() {
    switch (this.options.command) {
      case Command.Sync:
        this.sync();
        break;
      case Command.Report:
        this.report();
        break;
    }
  }

  private sync() {
    this.addComment();
    this.handleUnSynced();
    this.handlerDryRun();
    this.write();
  }

  private report() {
    for (const [pkgPath, json] of this.pkgJsonMap) {
      const data: {
        [x: string]: {"Script Name": string; "Script Command": string; "Script Comment": string};
      } = {};
      this.log(pc.blue(`NPM scripts and description for ${pc.underline(pc.bold(json.name))}.`));
      const scripts = this.scriptsMap.get(pkgPath);
      const scriptsComment = this.scriptsCommentMap.get(pkgPath);
      let index = 0;
      for (const name in scripts) {
        if (!Object.prototype.hasOwnProperty.call(scripts, name)) continue;
        data[index] = {
          "Script Name": name,
          "Script Command": scripts[name],
          "Script Comment": scriptsComment?.[name] || "Empty comment",
        };
        index++;
      }
      console.table(data);
      this.log("\n");
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
      this.scriptsCommentMap.set(pkgJsonPath, json.scriptsComment || {});
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

  private addComment() {
    for (let [pkgJsonPath, json] of this.pkgJsonMap) {
      const scripts = this.scriptsMap.get(pkgJsonPath);
      const scriptsComment = this.scriptsCommentMap.get(pkgJsonPath);

      if (!json.scriptsComment) {
        this.log(pc.blue(`🚀 Generate \`scriptsComment\` key for ${pc.underline(pc.bold(pkgJsonPath))} first time.`));
        json = {...json, scriptsComment: {}};
      }
      for (const scriptName in scripts) {
        if (!Object.prototype.hasOwnProperty.call(scripts, scriptName)) continue;
        json.scriptsComment[scriptName] = scriptsComment?.[scriptName] || "";
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
        )} scriptsComment with scripts field.`,
      ),
    );
  }

  private handlerDryRun() {
    if (!this.options.dryRun) return;
    for (const [pkgJsonPath, json] of this.pkgJsonMap) {
      this.log(JSON.stringify(json, null, 2));
      this.log(pc.green(`${pc.underline(pc.bold(pkgJsonPath))} will be ⬆️\n`));
    }
    this.log(pc.red("\nThis is a dry run. No changes were made."));
    process.exit(0);
  }

  private handleUnSynced() {
    if (this.options.ignoreUnSynced) return;
    for (const [pkgJsonPath, scriptComment] of this.scriptsCommentMap) {
      const scripts = this.scriptsMap.get(pkgJsonPath);
      for (const scriptName in scriptComment) {
        if (!Object.prototype.hasOwnProperty.call(scriptComment, scriptName)) continue;
        if (!scripts?.[scriptName]) {
          const errorMessage = pc.red(
            `[${this.pkgJsonMap.get(pkgJsonPath)?.name}] has unsynced scriptsComment: \`${scriptName}\``,
          );
          this.errors.push(new Error(errorMessage));
        }
      }
    }
    this.handleErrors();
  }

  private handleErrors() {
    if (!this.errors.length) return;
    for (const error of this.errors) {
      this.log(error.message);
    }
    process.exit(1);
  }

  public static create(options: Options): NpmScriptComments {
    return new NpmScriptComments(options);
  }
}
