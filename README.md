# NPM Scripts Command

### Installation

```
npm install npm-scripts-command

yarn add npm-scripts-command

pnpm add npm-scripts-command
```

### Features

- Provide command for npm scripts.
- Works well community solution.
- Support monorepo.

In a big `package.json` file, we often have a huge list of `scripts` field. It means everybody likes NPM scripts, it's simple easy, we use it everywhere in local development, in CI test flow, in production build. But the problem is while times goes by, _why it's there?_, _where do we use this script?_ always come to mind.

There is no standard place to document them!
Document somewhere in a random file could always possible, but it's not standard or consistency.

### *`NPM Scripts Command` comes to help!*

### Get started

```
npx nsc sync
```

`NPM Scripts Command` will scan all `package.json` and add `scriptCommands` like below.

```json
{
  "scripts": {
    "build": "tsc"
  },
  "scriptsCommands": {
    "build": "Build whole project"
  }
}
```
Recommend add `sync` to git pre-commit hook.

### Work with linter

```
npx nsc sync
```

If `scripts` has more keys more then `scriptsCommands` add script key to `scriptsCommands`.
If `scriptsCommands` has more keys than `scripts`, throw errors to require fix deleted script.
If you don't to stop commit add with `--ignore-` flag.

### See report

```
npx nsc report
```

generate all scripts and script commands from current root directory.


### Usage

```
Usage: nsc [command]
Command:
  sync          Sync scripts with scriptsCommands field.
  help          Show this help message.
  report        Show report of scripts and scriptsCommands.
  lint          Check if scripts is synced with scriptsCommands field.
```



## License

MIT, keidarcy
