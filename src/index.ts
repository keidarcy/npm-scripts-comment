import {NpmScriptCommands} from "./nsc";
import {parseArgs} from "./cli";

NpmScriptCommands.create(parseArgs()).run();
