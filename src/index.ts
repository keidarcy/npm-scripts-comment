import {NpmScriptComments} from "./nsc";
import {parseOptions} from "./cli";

NpmScriptComments.create(parseOptions()).run();
