# How to contribute to LINE Bot MCP Server

First of all, thank you so much for taking your time to contribute! LINE Bot MCP
Server is not very different from any other open source projects. It will
be fantastic if you help us by doing any of the following:

- File an issue in [the issue tracker](https://github.com/line/line-bot-mcp-server/issues)
  to report bugs and propose new features and improvements.
- Ask a question using [the issue tracker](https://github.com/line/line-bot-mcp-server/issues).
- Contribute your work by sending [a pull request](https://github.com/line/line-bot-mcp-server/pulls).

## Development

You can freely fork the project, clone the forked repository, and start editing.

### Install dependencies

Run `npm install` to install all dependencies for development.

### Understand the project structure

The project structure is as follows:

- src: The main code.
- tools: The tools that can be used in the MCP server.
- common: The common code like utilities and types.

### Add a new Tool

To add a new Tool, you can create a new file under `src/tools/` and
implement the Tool in that file. The Tool should extend `AbstractTool`
and should be registered in `src/index.ts`.
Please remember to add the description of the tool to both README.md and README.ja.md.

### Run all CI tasks in your local

-`npm run format`: Format source code with [Prettier](https://github.com/prettier/prettier)
-`npm run format:check`: Silently run `format` and report formatting errors
-`npm run build`: Build TypeScript code into JavaScript. The built files will
  be placed in `dist/`.

We lint and build on CI, but it is always nice to check them before
uploading a pull request.

## Contributor license agreement

When you are sending a pull request and it's a non-trivial change beyond fixing typos, please make sure to sign
[the ICLA (individual contributor license agreement)](https://cla-assistant.io/line/line-bot-mcp-server). Please
[contact us](mailto:dl_oss_dev@linecorp.com) if you need the CCLA (corporate contributor license agreement).
