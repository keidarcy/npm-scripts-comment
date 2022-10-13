import {NpmScriptComments} from "./nsc";
import {parseArgs} from "./cli";

NpmScriptComments.create(parseArgs()).run();
