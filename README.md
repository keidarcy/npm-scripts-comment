# (WIP)npm scripts comment

### Installation

```
npm install npm-scripts-comment

yarn add npm-scripts-comment

pnpm add npm-scripts-comment
```

### Features

- Provide comments key for npm scripts.
- Works well with pre-commit git hook.
- Support monorepo.

In a big `package.json` file, we often have a huge list of `scripts` field. It means everybody likes NPM scripts, it's simple easy, we use it everywhere in local development, in CI test flow, in production build. But the problem is while times goes by, _why it's there?_, _where do we use this script?_ always come to mind.

There is no standard place to document them!
Document somewhere in a random file could always possible, but it's not standard or consistency.

### `npm scripts comment` comes to help!

### Get started


```
npx npm-scripts-comment
```

`npm scripts comment` will scan all `package.json` and add `scriptComments` like below.

```json
{
  "scripts": {
    "build": "tsc"
  },
  "scriptsComments": {
    "build": "Build whole project"
  }
}
```

Recommend add `sync` to git pre-commit hook.

### See report

```
npx nsc report
```

generate all scripts and script comments from current root directory.


### Usage

```
Usage: nsc [option]
Options:
  sync          Sync scripts with scriptsComments field.
  help          Show this help message.
  report        Show report of scripts and scriptsComments.
  lint          Check if scripts is synced with scriptsComments field.
```



## License

MIT, keidarcy
