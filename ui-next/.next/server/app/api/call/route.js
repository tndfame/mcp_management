"use strict";
/*
 * ATTENTION: An "eval-source-map" devtool has been used.
 * This devtool is neither made for production nor for readable output files.
 * It uses "eval()" calls to create a separate source file with attached SourceMaps in the browser devtools.
 * If you are trying to read the output file, select a different devtool (https://webpack.js.org/configuration/devtool/)
 * or disable the default devtool with "devtool: false".
 * If you are looking for production-ready output files, see mode: "production" (https://webpack.js.org/configuration/mode/).
 */
(() => {
var exports = {};
exports.id = "app/api/call/route";
exports.ids = ["app/api/call/route"];
exports.modules = {

/***/ "next/dist/compiled/next-server/app-page.runtime.dev.js":
/*!*************************************************************************!*\
  !*** external "next/dist/compiled/next-server/app-page.runtime.dev.js" ***!
  \*************************************************************************/
/***/ ((module) => {

module.exports = require("next/dist/compiled/next-server/app-page.runtime.dev.js");

/***/ }),

/***/ "next/dist/compiled/next-server/app-route.runtime.dev.js":
/*!**************************************************************************!*\
  !*** external "next/dist/compiled/next-server/app-route.runtime.dev.js" ***!
  \**************************************************************************/
/***/ ((module) => {

module.exports = require("next/dist/compiled/next-server/app-route.runtime.dev.js");

/***/ }),

/***/ "child_process":
/*!********************************!*\
  !*** external "child_process" ***!
  \********************************/
/***/ ((module) => {

module.exports = require("child_process");

/***/ }),

/***/ "fs":
/*!*********************!*\
  !*** external "fs" ***!
  \*********************/
/***/ ((module) => {

module.exports = require("fs");

/***/ }),

/***/ "path":
/*!***********************!*\
  !*** external "path" ***!
  \***********************/
/***/ ((module) => {

module.exports = require("path");

/***/ }),

/***/ "node:process":
/*!*******************************!*\
  !*** external "node:process" ***!
  \*******************************/
/***/ ((module) => {

module.exports = require("node:process");

/***/ }),

/***/ "node:stream":
/*!******************************!*\
  !*** external "node:stream" ***!
  \******************************/
/***/ ((module) => {

module.exports = require("node:stream");

/***/ }),

/***/ "(rsc)/./node_modules/next/dist/build/webpack/loaders/next-app-loader.js?name=app%2Fapi%2Fcall%2Froute&page=%2Fapi%2Fcall%2Froute&appPaths=&pagePath=private-next-app-dir%2Fapi%2Fcall%2Froute.ts&appDir=D%3A%5Cfame%5Cnon-project%5Cline-bot-mcp-server%5Cui-next%5Capp&pageExtensions=tsx&pageExtensions=ts&pageExtensions=jsx&pageExtensions=js&rootDir=D%3A%5Cfame%5Cnon-project%5Cline-bot-mcp-server%5Cui-next&isDev=true&tsconfigPath=tsconfig.json&basePath=&assetPrefix=&nextConfigOutput=standalone&preferredRegion=&middlewareConfig=e30%3D!":
/*!********************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************!*\
  !*** ./node_modules/next/dist/build/webpack/loaders/next-app-loader.js?name=app%2Fapi%2Fcall%2Froute&page=%2Fapi%2Fcall%2Froute&appPaths=&pagePath=private-next-app-dir%2Fapi%2Fcall%2Froute.ts&appDir=D%3A%5Cfame%5Cnon-project%5Cline-bot-mcp-server%5Cui-next%5Capp&pageExtensions=tsx&pageExtensions=ts&pageExtensions=jsx&pageExtensions=js&rootDir=D%3A%5Cfame%5Cnon-project%5Cline-bot-mcp-server%5Cui-next&isDev=true&tsconfigPath=tsconfig.json&basePath=&assetPrefix=&nextConfigOutput=standalone&preferredRegion=&middlewareConfig=e30%3D! ***!
  \********************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************/
/***/ ((__unused_webpack_module, __webpack_exports__, __webpack_require__) => {

eval("__webpack_require__.r(__webpack_exports__);\n/* harmony export */ __webpack_require__.d(__webpack_exports__, {\n/* harmony export */   originalPathname: () => (/* binding */ originalPathname),\n/* harmony export */   patchFetch: () => (/* binding */ patchFetch),\n/* harmony export */   requestAsyncStorage: () => (/* binding */ requestAsyncStorage),\n/* harmony export */   routeModule: () => (/* binding */ routeModule),\n/* harmony export */   serverHooks: () => (/* binding */ serverHooks),\n/* harmony export */   staticGenerationAsyncStorage: () => (/* binding */ staticGenerationAsyncStorage)\n/* harmony export */ });\n/* harmony import */ var next_dist_server_future_route_modules_app_route_module_compiled__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! next/dist/server/future/route-modules/app-route/module.compiled */ \"(rsc)/./node_modules/next/dist/server/future/route-modules/app-route/module.compiled.js\");\n/* harmony import */ var next_dist_server_future_route_modules_app_route_module_compiled__WEBPACK_IMPORTED_MODULE_0___default = /*#__PURE__*/__webpack_require__.n(next_dist_server_future_route_modules_app_route_module_compiled__WEBPACK_IMPORTED_MODULE_0__);\n/* harmony import */ var next_dist_server_future_route_kind__WEBPACK_IMPORTED_MODULE_1__ = __webpack_require__(/*! next/dist/server/future/route-kind */ \"(rsc)/./node_modules/next/dist/server/future/route-kind.js\");\n/* harmony import */ var next_dist_server_lib_patch_fetch__WEBPACK_IMPORTED_MODULE_2__ = __webpack_require__(/*! next/dist/server/lib/patch-fetch */ \"(rsc)/./node_modules/next/dist/server/lib/patch-fetch.js\");\n/* harmony import */ var next_dist_server_lib_patch_fetch__WEBPACK_IMPORTED_MODULE_2___default = /*#__PURE__*/__webpack_require__.n(next_dist_server_lib_patch_fetch__WEBPACK_IMPORTED_MODULE_2__);\n/* harmony import */ var D_fame_non_project_line_bot_mcp_server_ui_next_app_api_call_route_ts__WEBPACK_IMPORTED_MODULE_3__ = __webpack_require__(/*! ./app/api/call/route.ts */ \"(rsc)/./app/api/call/route.ts\");\n\n\n\n\n// We inject the nextConfigOutput here so that we can use them in the route\n// module.\nconst nextConfigOutput = \"standalone\"\nconst routeModule = new next_dist_server_future_route_modules_app_route_module_compiled__WEBPACK_IMPORTED_MODULE_0__.AppRouteRouteModule({\n    definition: {\n        kind: next_dist_server_future_route_kind__WEBPACK_IMPORTED_MODULE_1__.RouteKind.APP_ROUTE,\n        page: \"/api/call/route\",\n        pathname: \"/api/call\",\n        filename: \"route\",\n        bundlePath: \"app/api/call/route\"\n    },\n    resolvedPagePath: \"D:\\\\fame\\\\non-project\\\\line-bot-mcp-server\\\\ui-next\\\\app\\\\api\\\\call\\\\route.ts\",\n    nextConfigOutput,\n    userland: D_fame_non_project_line_bot_mcp_server_ui_next_app_api_call_route_ts__WEBPACK_IMPORTED_MODULE_3__\n});\n// Pull out the exports that we need to expose from the module. This should\n// be eliminated when we've moved the other routes to the new format. These\n// are used to hook into the route.\nconst { requestAsyncStorage, staticGenerationAsyncStorage, serverHooks } = routeModule;\nconst originalPathname = \"/api/call/route\";\nfunction patchFetch() {\n    return (0,next_dist_server_lib_patch_fetch__WEBPACK_IMPORTED_MODULE_2__.patchFetch)({\n        serverHooks,\n        staticGenerationAsyncStorage\n    });\n}\n\n\n//# sourceMappingURL=app-route.js.map//# sourceURL=[module]\n//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiKHJzYykvLi9ub2RlX21vZHVsZXMvbmV4dC9kaXN0L2J1aWxkL3dlYnBhY2svbG9hZGVycy9uZXh0LWFwcC1sb2FkZXIuanM/bmFtZT1hcHAlMkZhcGklMkZjYWxsJTJGcm91dGUmcGFnZT0lMkZhcGklMkZjYWxsJTJGcm91dGUmYXBwUGF0aHM9JnBhZ2VQYXRoPXByaXZhdGUtbmV4dC1hcHAtZGlyJTJGYXBpJTJGY2FsbCUyRnJvdXRlLnRzJmFwcERpcj1EJTNBJTVDZmFtZSU1Q25vbi1wcm9qZWN0JTVDbGluZS1ib3QtbWNwLXNlcnZlciU1Q3VpLW5leHQlNUNhcHAmcGFnZUV4dGVuc2lvbnM9dHN4JnBhZ2VFeHRlbnNpb25zPXRzJnBhZ2VFeHRlbnNpb25zPWpzeCZwYWdlRXh0ZW5zaW9ucz1qcyZyb290RGlyPUQlM0ElNUNmYW1lJTVDbm9uLXByb2plY3QlNUNsaW5lLWJvdC1tY3Atc2VydmVyJTVDdWktbmV4dCZpc0Rldj10cnVlJnRzY29uZmlnUGF0aD10c2NvbmZpZy5qc29uJmJhc2VQYXRoPSZhc3NldFByZWZpeD0mbmV4dENvbmZpZ091dHB1dD1zdGFuZGFsb25lJnByZWZlcnJlZFJlZ2lvbj0mbWlkZGxld2FyZUNvbmZpZz1lMzAlM0QhIiwibWFwcGluZ3MiOiI7Ozs7Ozs7Ozs7Ozs7OztBQUFzRztBQUN2QztBQUNjO0FBQzZCO0FBQzFHO0FBQ0E7QUFDQTtBQUNBLHdCQUF3QixnSEFBbUI7QUFDM0M7QUFDQSxjQUFjLHlFQUFTO0FBQ3ZCO0FBQ0E7QUFDQTtBQUNBO0FBQ0EsS0FBSztBQUNMO0FBQ0E7QUFDQSxZQUFZO0FBQ1osQ0FBQztBQUNEO0FBQ0E7QUFDQTtBQUNBLFFBQVEsaUVBQWlFO0FBQ3pFO0FBQ0E7QUFDQSxXQUFXLDRFQUFXO0FBQ3RCO0FBQ0E7QUFDQSxLQUFLO0FBQ0w7QUFDdUg7O0FBRXZIIiwic291cmNlcyI6WyJ3ZWJwYWNrOi8vbGluZS1ib3QtbWNwLXVpLz85NzllIl0sInNvdXJjZXNDb250ZW50IjpbImltcG9ydCB7IEFwcFJvdXRlUm91dGVNb2R1bGUgfSBmcm9tIFwibmV4dC9kaXN0L3NlcnZlci9mdXR1cmUvcm91dGUtbW9kdWxlcy9hcHAtcm91dGUvbW9kdWxlLmNvbXBpbGVkXCI7XG5pbXBvcnQgeyBSb3V0ZUtpbmQgfSBmcm9tIFwibmV4dC9kaXN0L3NlcnZlci9mdXR1cmUvcm91dGUta2luZFwiO1xuaW1wb3J0IHsgcGF0Y2hGZXRjaCBhcyBfcGF0Y2hGZXRjaCB9IGZyb20gXCJuZXh0L2Rpc3Qvc2VydmVyL2xpYi9wYXRjaC1mZXRjaFwiO1xuaW1wb3J0ICogYXMgdXNlcmxhbmQgZnJvbSBcIkQ6XFxcXGZhbWVcXFxcbm9uLXByb2plY3RcXFxcbGluZS1ib3QtbWNwLXNlcnZlclxcXFx1aS1uZXh0XFxcXGFwcFxcXFxhcGlcXFxcY2FsbFxcXFxyb3V0ZS50c1wiO1xuLy8gV2UgaW5qZWN0IHRoZSBuZXh0Q29uZmlnT3V0cHV0IGhlcmUgc28gdGhhdCB3ZSBjYW4gdXNlIHRoZW0gaW4gdGhlIHJvdXRlXG4vLyBtb2R1bGUuXG5jb25zdCBuZXh0Q29uZmlnT3V0cHV0ID0gXCJzdGFuZGFsb25lXCJcbmNvbnN0IHJvdXRlTW9kdWxlID0gbmV3IEFwcFJvdXRlUm91dGVNb2R1bGUoe1xuICAgIGRlZmluaXRpb246IHtcbiAgICAgICAga2luZDogUm91dGVLaW5kLkFQUF9ST1VURSxcbiAgICAgICAgcGFnZTogXCIvYXBpL2NhbGwvcm91dGVcIixcbiAgICAgICAgcGF0aG5hbWU6IFwiL2FwaS9jYWxsXCIsXG4gICAgICAgIGZpbGVuYW1lOiBcInJvdXRlXCIsXG4gICAgICAgIGJ1bmRsZVBhdGg6IFwiYXBwL2FwaS9jYWxsL3JvdXRlXCJcbiAgICB9LFxuICAgIHJlc29sdmVkUGFnZVBhdGg6IFwiRDpcXFxcZmFtZVxcXFxub24tcHJvamVjdFxcXFxsaW5lLWJvdC1tY3Atc2VydmVyXFxcXHVpLW5leHRcXFxcYXBwXFxcXGFwaVxcXFxjYWxsXFxcXHJvdXRlLnRzXCIsXG4gICAgbmV4dENvbmZpZ091dHB1dCxcbiAgICB1c2VybGFuZFxufSk7XG4vLyBQdWxsIG91dCB0aGUgZXhwb3J0cyB0aGF0IHdlIG5lZWQgdG8gZXhwb3NlIGZyb20gdGhlIG1vZHVsZS4gVGhpcyBzaG91bGRcbi8vIGJlIGVsaW1pbmF0ZWQgd2hlbiB3ZSd2ZSBtb3ZlZCB0aGUgb3RoZXIgcm91dGVzIHRvIHRoZSBuZXcgZm9ybWF0LiBUaGVzZVxuLy8gYXJlIHVzZWQgdG8gaG9vayBpbnRvIHRoZSByb3V0ZS5cbmNvbnN0IHsgcmVxdWVzdEFzeW5jU3RvcmFnZSwgc3RhdGljR2VuZXJhdGlvbkFzeW5jU3RvcmFnZSwgc2VydmVySG9va3MgfSA9IHJvdXRlTW9kdWxlO1xuY29uc3Qgb3JpZ2luYWxQYXRobmFtZSA9IFwiL2FwaS9jYWxsL3JvdXRlXCI7XG5mdW5jdGlvbiBwYXRjaEZldGNoKCkge1xuICAgIHJldHVybiBfcGF0Y2hGZXRjaCh7XG4gICAgICAgIHNlcnZlckhvb2tzLFxuICAgICAgICBzdGF0aWNHZW5lcmF0aW9uQXN5bmNTdG9yYWdlXG4gICAgfSk7XG59XG5leHBvcnQgeyByb3V0ZU1vZHVsZSwgcmVxdWVzdEFzeW5jU3RvcmFnZSwgc3RhdGljR2VuZXJhdGlvbkFzeW5jU3RvcmFnZSwgc2VydmVySG9va3MsIG9yaWdpbmFsUGF0aG5hbWUsIHBhdGNoRmV0Y2gsICB9O1xuXG4vLyMgc291cmNlTWFwcGluZ1VSTD1hcHAtcm91dGUuanMubWFwIl0sIm5hbWVzIjpbXSwic291cmNlUm9vdCI6IiJ9\n//# sourceURL=webpack-internal:///(rsc)/./node_modules/next/dist/build/webpack/loaders/next-app-loader.js?name=app%2Fapi%2Fcall%2Froute&page=%2Fapi%2Fcall%2Froute&appPaths=&pagePath=private-next-app-dir%2Fapi%2Fcall%2Froute.ts&appDir=D%3A%5Cfame%5Cnon-project%5Cline-bot-mcp-server%5Cui-next%5Capp&pageExtensions=tsx&pageExtensions=ts&pageExtensions=jsx&pageExtensions=js&rootDir=D%3A%5Cfame%5Cnon-project%5Cline-bot-mcp-server%5Cui-next&isDev=true&tsconfigPath=tsconfig.json&basePath=&assetPrefix=&nextConfigOutput=standalone&preferredRegion=&middlewareConfig=e30%3D!\n");

/***/ }),

/***/ "(rsc)/./app/api/call/route.ts":
/*!*******************************!*\
  !*** ./app/api/call/route.ts ***!
  \*******************************/
/***/ ((__unused_webpack_module, __webpack_exports__, __webpack_require__) => {

eval("__webpack_require__.r(__webpack_exports__);\n/* harmony export */ __webpack_require__.d(__webpack_exports__, {\n/* harmony export */   POST: () => (/* binding */ POST),\n/* harmony export */   dynamic: () => (/* binding */ dynamic),\n/* harmony export */   runtime: () => (/* binding */ runtime)\n/* harmony export */ });\n/* harmony import */ var path__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! path */ \"path\");\n/* harmony import */ var path__WEBPACK_IMPORTED_MODULE_0___default = /*#__PURE__*/__webpack_require__.n(path__WEBPACK_IMPORTED_MODULE_0__);\n/* harmony import */ var _modelcontextprotocol_sdk_client_index_js__WEBPACK_IMPORTED_MODULE_1__ = __webpack_require__(/*! @modelcontextprotocol/sdk/client/index.js */ \"(rsc)/../node_modules/@modelcontextprotocol/sdk/dist/esm/client/index.js\");\n/* harmony import */ var _modelcontextprotocol_sdk_client_stdio_js__WEBPACK_IMPORTED_MODULE_2__ = __webpack_require__(/*! @modelcontextprotocol/sdk/client/stdio.js */ \"(rsc)/../node_modules/@modelcontextprotocol/sdk/dist/esm/client/stdio.js\");\nconst runtime = \"nodejs\";\nconst dynamic = \"force-dynamic\";\n\n\n\nasync function getClient() {\n    if (globalThis.__mcpClient) return globalThis.__mcpClient;\n    const projectRoot = path__WEBPACK_IMPORTED_MODULE_0___default().resolve(process.cwd(), \"..\");\n    const transport = new _modelcontextprotocol_sdk_client_stdio_js__WEBPACK_IMPORTED_MODULE_2__.StdioClientTransport({\n        command: \"node\",\n        args: [\n            \"dist/index.js\"\n        ],\n        cwd: projectRoot,\n        env: process.env\n    });\n    const client = new _modelcontextprotocol_sdk_client_index_js__WEBPACK_IMPORTED_MODULE_1__.Client({\n        name: \"line-bot-ui-next\",\n        version: \"0.1.0\"\n    });\n    await client.connect(transport);\n    globalThis.__mcpClient = client;\n    return client;\n}\nasync function POST(req) {\n    try {\n        const client = await getClient();\n        const { name, args } = await req.json();\n        const result = await client.callTool({\n            name,\n            arguments: args || {}\n        });\n        return new Response(JSON.stringify(result), {\n            headers: {\n                \"Content-Type\": \"application/json\"\n            }\n        });\n    } catch (e) {\n        return new Response(JSON.stringify({\n            error: e?.message || String(e)\n        }), {\n            status: 500,\n            headers: {\n                \"Content-Type\": \"application/json\"\n            }\n        });\n    }\n}\n//# sourceURL=[module]\n//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiKHJzYykvLi9hcHAvYXBpL2NhbGwvcm91dGUudHMiLCJtYXBwaW5ncyI6Ijs7Ozs7Ozs7OztBQUFPLE1BQU1BLFVBQVUsU0FBUztBQUN6QixNQUFNQyxVQUFVLGdCQUFnQjtBQUVmO0FBQzJDO0FBQ2M7QUFPakYsZUFBZUk7SUFDYixJQUFJQyxXQUFXQyxXQUFXLEVBQUUsT0FBT0QsV0FBV0MsV0FBVztJQUV6RCxNQUFNQyxjQUFjTixtREFBWSxDQUFDUSxRQUFRQyxHQUFHLElBQUk7SUFDaEQsTUFBTUMsWUFBWSxJQUFJUiwyRkFBb0JBLENBQUM7UUFDekNTLFNBQVM7UUFDVEMsTUFBTTtZQUFDO1NBQWdCO1FBQ3ZCSCxLQUFLSDtRQUNMTyxLQUFLTCxRQUFRSyxHQUFHO0lBQ2xCO0lBQ0EsTUFBTUMsU0FBUyxJQUFJYiw2RUFBTUEsQ0FBQztRQUFFYyxNQUFNO1FBQW9CQyxTQUFTO0lBQVE7SUFDdkUsTUFBTUYsT0FBT0csT0FBTyxDQUFDUDtJQUNyQk4sV0FBV0MsV0FBVyxHQUFHUztJQUN6QixPQUFPQTtBQUNUO0FBRU8sZUFBZUksS0FBS0MsR0FBWTtJQUNyQyxJQUFJO1FBQ0YsTUFBTUwsU0FBUyxNQUFNWDtRQUNyQixNQUFNLEVBQUVZLElBQUksRUFBRUgsSUFBSSxFQUFFLEdBQUksTUFBTU8sSUFBSUMsSUFBSTtRQUN0QyxNQUFNQyxTQUFTLE1BQU1QLE9BQU9RLFFBQVEsQ0FBQztZQUFFUDtZQUFNUSxXQUFXWCxRQUFRLENBQUM7UUFBRTtRQUNuRSxPQUFPLElBQUlZLFNBQVNDLEtBQUtDLFNBQVMsQ0FBQ0wsU0FBUztZQUMxQ00sU0FBUztnQkFBRSxnQkFBZ0I7WUFBbUI7UUFDaEQ7SUFDRixFQUFFLE9BQU9DLEdBQVE7UUFDZixPQUFPLElBQUlKLFNBQVNDLEtBQUtDLFNBQVMsQ0FBQztZQUFFRyxPQUFPRCxHQUFHRSxXQUFXQyxPQUFPSDtRQUFHLElBQUk7WUFDdEVJLFFBQVE7WUFDUkwsU0FBUztnQkFBRSxnQkFBZ0I7WUFBbUI7UUFDaEQ7SUFDRjtBQUNGIiwic291cmNlcyI6WyJ3ZWJwYWNrOi8vbGluZS1ib3QtbWNwLXVpLy4vYXBwL2FwaS9jYWxsL3JvdXRlLnRzPzFiNGEiXSwic291cmNlc0NvbnRlbnQiOlsiZXhwb3J0IGNvbnN0IHJ1bnRpbWUgPSBcIm5vZGVqc1wiO1xuZXhwb3J0IGNvbnN0IGR5bmFtaWMgPSBcImZvcmNlLWR5bmFtaWNcIjtcblxuaW1wb3J0IHBhdGggZnJvbSBcInBhdGhcIjtcbmltcG9ydCB7IENsaWVudCB9IGZyb20gXCJAbW9kZWxjb250ZXh0cHJvdG9jb2wvc2RrL2NsaWVudC9pbmRleC5qc1wiO1xuaW1wb3J0IHsgU3RkaW9DbGllbnRUcmFuc3BvcnQgfSBmcm9tIFwiQG1vZGVsY29udGV4dHByb3RvY29sL3Nkay9jbGllbnQvc3RkaW8uanNcIjtcblxuZGVjbGFyZSBnbG9iYWwge1xuICAvLyBlc2xpbnQtZGlzYWJsZS1uZXh0LWxpbmUgbm8tdmFyXG4gIHZhciBfX21jcENsaWVudDogQ2xpZW50IHwgdW5kZWZpbmVkO1xufVxuXG5hc3luYyBmdW5jdGlvbiBnZXRDbGllbnQoKTogUHJvbWlzZTxDbGllbnQ+IHtcbiAgaWYgKGdsb2JhbFRoaXMuX19tY3BDbGllbnQpIHJldHVybiBnbG9iYWxUaGlzLl9fbWNwQ2xpZW50O1xuXG4gIGNvbnN0IHByb2plY3RSb290ID0gcGF0aC5yZXNvbHZlKHByb2Nlc3MuY3dkKCksIFwiLi5cIik7XG4gIGNvbnN0IHRyYW5zcG9ydCA9IG5ldyBTdGRpb0NsaWVudFRyYW5zcG9ydCh7XG4gICAgY29tbWFuZDogXCJub2RlXCIsXG4gICAgYXJnczogW1wiZGlzdC9pbmRleC5qc1wiXSxcbiAgICBjd2Q6IHByb2plY3RSb290LFxuICAgIGVudjogcHJvY2Vzcy5lbnYgYXMgUmVjb3JkPHN0cmluZywgc3RyaW5nPixcbiAgfSk7XG4gIGNvbnN0IGNsaWVudCA9IG5ldyBDbGllbnQoeyBuYW1lOiBcImxpbmUtYm90LXVpLW5leHRcIiwgdmVyc2lvbjogXCIwLjEuMFwiIH0pO1xuICBhd2FpdCBjbGllbnQuY29ubmVjdCh0cmFuc3BvcnQpO1xuICBnbG9iYWxUaGlzLl9fbWNwQ2xpZW50ID0gY2xpZW50O1xuICByZXR1cm4gY2xpZW50O1xufVxuXG5leHBvcnQgYXN5bmMgZnVuY3Rpb24gUE9TVChyZXE6IFJlcXVlc3QpIHtcbiAgdHJ5IHtcbiAgICBjb25zdCBjbGllbnQgPSBhd2FpdCBnZXRDbGllbnQoKTtcbiAgICBjb25zdCB7IG5hbWUsIGFyZ3MgfSA9IChhd2FpdCByZXEuanNvbigpKSBhcyB7IG5hbWU6IHN0cmluZzsgYXJncz86IGFueSB9O1xuICAgIGNvbnN0IHJlc3VsdCA9IGF3YWl0IGNsaWVudC5jYWxsVG9vbCh7IG5hbWUsIGFyZ3VtZW50czogYXJncyB8fCB7fSB9KTtcbiAgICByZXR1cm4gbmV3IFJlc3BvbnNlKEpTT04uc3RyaW5naWZ5KHJlc3VsdCksIHtcbiAgICAgIGhlYWRlcnM6IHsgXCJDb250ZW50LVR5cGVcIjogXCJhcHBsaWNhdGlvbi9qc29uXCIgfSxcbiAgICB9KTtcbiAgfSBjYXRjaCAoZTogYW55KSB7XG4gICAgcmV0dXJuIG5ldyBSZXNwb25zZShKU09OLnN0cmluZ2lmeSh7IGVycm9yOiBlPy5tZXNzYWdlIHx8IFN0cmluZyhlKSB9KSwge1xuICAgICAgc3RhdHVzOiA1MDAsXG4gICAgICBoZWFkZXJzOiB7IFwiQ29udGVudC1UeXBlXCI6IFwiYXBwbGljYXRpb24vanNvblwiIH0sXG4gICAgfSk7XG4gIH1cbn1cblxuIl0sIm5hbWVzIjpbInJ1bnRpbWUiLCJkeW5hbWljIiwicGF0aCIsIkNsaWVudCIsIlN0ZGlvQ2xpZW50VHJhbnNwb3J0IiwiZ2V0Q2xpZW50IiwiZ2xvYmFsVGhpcyIsIl9fbWNwQ2xpZW50IiwicHJvamVjdFJvb3QiLCJyZXNvbHZlIiwicHJvY2VzcyIsImN3ZCIsInRyYW5zcG9ydCIsImNvbW1hbmQiLCJhcmdzIiwiZW52IiwiY2xpZW50IiwibmFtZSIsInZlcnNpb24iLCJjb25uZWN0IiwiUE9TVCIsInJlcSIsImpzb24iLCJyZXN1bHQiLCJjYWxsVG9vbCIsImFyZ3VtZW50cyIsIlJlc3BvbnNlIiwiSlNPTiIsInN0cmluZ2lmeSIsImhlYWRlcnMiLCJlIiwiZXJyb3IiLCJtZXNzYWdlIiwiU3RyaW5nIiwic3RhdHVzIl0sInNvdXJjZVJvb3QiOiIifQ==\n//# sourceURL=webpack-internal:///(rsc)/./app/api/call/route.ts\n");

/***/ })

};
;

// load runtime
var __webpack_require__ = require("../../../webpack-runtime.js");
__webpack_require__.C(exports);
var __webpack_exec__ = (moduleId) => (__webpack_require__(__webpack_require__.s = moduleId))
var __webpack_exports__ = __webpack_require__.X(0, ["vendor-chunks/ajv","vendor-chunks/zod","vendor-chunks/next","vendor-chunks/@modelcontextprotocol","vendor-chunks/uri-js","vendor-chunks/cross-spawn","vendor-chunks/which","vendor-chunks/isexe","vendor-chunks/json-schema-traverse","vendor-chunks/fast-json-stable-stringify","vendor-chunks/fast-deep-equal","vendor-chunks/path-key","vendor-chunks/shebang-command","vendor-chunks/shebang-regex"], () => (__webpack_exec__("(rsc)/./node_modules/next/dist/build/webpack/loaders/next-app-loader.js?name=app%2Fapi%2Fcall%2Froute&page=%2Fapi%2Fcall%2Froute&appPaths=&pagePath=private-next-app-dir%2Fapi%2Fcall%2Froute.ts&appDir=D%3A%5Cfame%5Cnon-project%5Cline-bot-mcp-server%5Cui-next%5Capp&pageExtensions=tsx&pageExtensions=ts&pageExtensions=jsx&pageExtensions=js&rootDir=D%3A%5Cfame%5Cnon-project%5Cline-bot-mcp-server%5Cui-next&isDev=true&tsconfigPath=tsconfig.json&basePath=&assetPrefix=&nextConfigOutput=standalone&preferredRegion=&middlewareConfig=e30%3D!")));
module.exports = __webpack_exports__;

})();