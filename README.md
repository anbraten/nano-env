# Nano web IDE

Develop the web in the web. This project provides a runtime to run Node.js projects completely in the browser by mocking internals like `process`. In addition it includes a shell written in javascript to run commands like `ls` or `cd` and a playground to test those features.

## 🚀 Features

- **Webcontainer compatible api**
  - conforms to the [webcontainer api](https://webcontainers.io/api)

- **Virtual File system**
  - based on [zenfs](https://github.com/zen-fs/core)

- **Process management**
  - fork / clone processes
  - pid management
  - `/proc` file system
  - get process exit code
  - node.js compatible [process object](https://nodejs.org/api/process.html)

- **Shell Environment**
  - a shell written in javascript
  - supports: `ls`, `cat`, `echo`, `touch`, `rm`, `cd`, `cp`, `mv`, `pwd`, `env`, `exit`, `true`, `false`, `history`, `clear`, `xdg-open`, `wget`, `unzip`
  - auto-completion for commands, aliases & paths
  - execute commands in `PATH`

- **Networking**
  - service worker to intercept requests

- **Playground**
  - file explorer
  - file editor
  - terminals to run commands

## 📦 Project Structure

```bash
.
├── packages
│   ├── core # webcontainer runtime
│   │   └── src
│   │       └── shell # shell environment
│   │           └── commands # shell commands
│   └── playground
│       ├── public # public files
│       └── src
│           ├── assets # static assets
│           ├── components # vue components
│           └── compositions # vue compositions
└── testing
    └── busybox # emscripten compiled busybox
```

## 🛠️ Development

```bash
# install dependencies
bun install

# start dev server
bun dev

# visit http://localhost:5173
```

## TODO

- [ ] networking
  - [x] add service worker to intercept requests
  - [ ] clean way to initialize service worker first time (load files somehow)
  - [ ] polyfill `node:net` and `node:http` modules
  - [ ] tcp/ip stack using sth like ([IwIP](https://savannah.nongnu.org/projects/lwip/))
  - [ ] support http requests
  - [ ] support websockets
- [ ] process management
  - [ ] spawn isolated processes using mocked process object (workers?)
- [x] jsh
  - [ ] allow to run script files from fs
  - [ ] fix input buffer when moving cursor in terminal
  - [ ] support `&&` and `||` operators
  - [ ] support `>>` and `>`
  - [ ] support `|`
  - [ ] add shebang support
- [x] jsh commands
  - [ ] rm -r
  - [ ] mkdir -p
  - [ ] cp -r
  - [ ] which
  - [ ] export
  - [ ] sleep
  - [ ] alias
  - [ ] curl
- [ ] external commands
  - [ ] wasm (using wasmer)
  - [ ] node
  - [ ] python (using wasmer)
  - [ ] pnpm
  - [ ] npm
  - [ ] yarn
- [ ] playground
  - [ ] allow to persist fs (download or api)

## 🤝 Acknowledgments

- [zenfs](https://github.com/zen-fs/core)
- [memfs](https://github.com/streamich/memfs)
- [webcontainers](https://webcontainers.io)
- [busybox](https://busybox.net)
- [emscripten](https://emscripten.org)
- [wasmer](https://wasmer.io)
- [xterm.js](https://xtermjs.org)

## 📝 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## Similar projects

- [OpenWebContainer](https://github.com/thecodacus/OpenWebContainer) (Thanks for the README template)
