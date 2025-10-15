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
exports.id = "app/api/tools/route";
exports.ids = ["app/api/tools/route"];
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

/***/ "(rsc)/./node_modules/next/dist/build/webpack/loaders/next-app-loader.js?name=app%2Fapi%2Ftools%2Froute&page=%2Fapi%2Ftools%2Froute&appPaths=&pagePath=private-next-app-dir%2Fapi%2Ftools%2Froute.ts&appDir=D%3A%5Cfame%5Cnon-project%5Cline-bot-mcp-server%5Cui-next%5Capp&pageExtensions=tsx&pageExtensions=ts&pageExtensions=jsx&pageExtensions=js&rootDir=D%3A%5Cfame%5Cnon-project%5Cline-bot-mcp-server%5Cui-next&isDev=true&tsconfigPath=tsconfig.json&basePath=&assetPrefix=&nextConfigOutput=standalone&preferredRegion=&middlewareConfig=e30%3D!":
/*!***********************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************!*\
  !*** ./node_modules/next/dist/build/webpack/loaders/next-app-loader.js?name=app%2Fapi%2Ftools%2Froute&page=%2Fapi%2Ftools%2Froute&appPaths=&pagePath=private-next-app-dir%2Fapi%2Ftools%2Froute.ts&appDir=D%3A%5Cfame%5Cnon-project%5Cline-bot-mcp-server%5Cui-next%5Capp&pageExtensions=tsx&pageExtensions=ts&pageExtensions=jsx&pageExtensions=js&rootDir=D%3A%5Cfame%5Cnon-project%5Cline-bot-mcp-server%5Cui-next&isDev=true&tsconfigPath=tsconfig.json&basePath=&assetPrefix=&nextConfigOutput=standalone&preferredRegion=&middlewareConfig=e30%3D! ***!
  \***********************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************/
/***/ ((__unused_webpack_module, __webpack_exports__, __webpack_require__) => {

eval("__webpack_require__.r(__webpack_exports__);\n/* harmony export */ __webpack_require__.d(__webpack_exports__, {\n/* harmony export */   originalPathname: () => (/* binding */ originalPathname),\n/* harmony export */   patchFetch: () => (/* binding */ patchFetch),\n/* harmony export */   requestAsyncStorage: () => (/* binding */ requestAsyncStorage),\n/* harmony export */   routeModule: () => (/* binding */ routeModule),\n/* harmony export */   serverHooks: () => (/* binding */ serverHooks),\n/* harmony export */   staticGenerationAsyncStorage: () => (/* binding */ staticGenerationAsyncStorage)\n/* harmony export */ });\n/* harmony import */ var next_dist_server_future_route_modules_app_route_module_compiled__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! next/dist/server/future/route-modules/app-route/module.compiled */ \"(rsc)/./node_modules/next/dist/server/future/route-modules/app-route/module.compiled.js\");\n/* harmony import */ var next_dist_server_future_route_modules_app_route_module_compiled__WEBPACK_IMPORTED_MODULE_0___default = /*#__PURE__*/__webpack_require__.n(next_dist_server_future_route_modules_app_route_module_compiled__WEBPACK_IMPORTED_MODULE_0__);\n/* harmony import */ var next_dist_server_future_route_kind__WEBPACK_IMPORTED_MODULE_1__ = __webpack_require__(/*! next/dist/server/future/route-kind */ \"(rsc)/./node_modules/next/dist/server/future/route-kind.js\");\n/* harmony import */ var next_dist_server_lib_patch_fetch__WEBPACK_IMPORTED_MODULE_2__ = __webpack_require__(/*! next/dist/server/lib/patch-fetch */ \"(rsc)/./node_modules/next/dist/server/lib/patch-fetch.js\");\n/* harmony import */ var next_dist_server_lib_patch_fetch__WEBPACK_IMPORTED_MODULE_2___default = /*#__PURE__*/__webpack_require__.n(next_dist_server_lib_patch_fetch__WEBPACK_IMPORTED_MODULE_2__);\n/* harmony import */ var D_fame_non_project_line_bot_mcp_server_ui_next_app_api_tools_route_ts__WEBPACK_IMPORTED_MODULE_3__ = __webpack_require__(/*! ./app/api/tools/route.ts */ \"(rsc)/./app/api/tools/route.ts\");\n\n\n\n\n// We inject the nextConfigOutput here so that we can use them in the route\n// module.\nconst nextConfigOutput = \"standalone\"\nconst routeModule = new next_dist_server_future_route_modules_app_route_module_compiled__WEBPACK_IMPORTED_MODULE_0__.AppRouteRouteModule({\n    definition: {\n        kind: next_dist_server_future_route_kind__WEBPACK_IMPORTED_MODULE_1__.RouteKind.APP_ROUTE,\n        page: \"/api/tools/route\",\n        pathname: \"/api/tools\",\n        filename: \"route\",\n        bundlePath: \"app/api/tools/route\"\n    },\n    resolvedPagePath: \"D:\\\\fame\\\\non-project\\\\line-bot-mcp-server\\\\ui-next\\\\app\\\\api\\\\tools\\\\route.ts\",\n    nextConfigOutput,\n    userland: D_fame_non_project_line_bot_mcp_server_ui_next_app_api_tools_route_ts__WEBPACK_IMPORTED_MODULE_3__\n});\n// Pull out the exports that we need to expose from the module. This should\n// be eliminated when we've moved the other routes to the new format. These\n// are used to hook into the route.\nconst { requestAsyncStorage, staticGenerationAsyncStorage, serverHooks } = routeModule;\nconst originalPathname = \"/api/tools/route\";\nfunction patchFetch() {\n    return (0,next_dist_server_lib_patch_fetch__WEBPACK_IMPORTED_MODULE_2__.patchFetch)({\n        serverHooks,\n        staticGenerationAsyncStorage\n    });\n}\n\n\n//# sourceMappingURL=app-route.js.map//# sourceURL=[module]\n//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiKHJzYykvLi9ub2RlX21vZHVsZXMvbmV4dC9kaXN0L2J1aWxkL3dlYnBhY2svbG9hZGVycy9uZXh0LWFwcC1sb2FkZXIuanM/bmFtZT1hcHAlMkZhcGklMkZ0b29scyUyRnJvdXRlJnBhZ2U9JTJGYXBpJTJGdG9vbHMlMkZyb3V0ZSZhcHBQYXRocz0mcGFnZVBhdGg9cHJpdmF0ZS1uZXh0LWFwcC1kaXIlMkZhcGklMkZ0b29scyUyRnJvdXRlLnRzJmFwcERpcj1EJTNBJTVDZmFtZSU1Q25vbi1wcm9qZWN0JTVDbGluZS1ib3QtbWNwLXNlcnZlciU1Q3VpLW5leHQlNUNhcHAmcGFnZUV4dGVuc2lvbnM9dHN4JnBhZ2VFeHRlbnNpb25zPXRzJnBhZ2VFeHRlbnNpb25zPWpzeCZwYWdlRXh0ZW5zaW9ucz1qcyZyb290RGlyPUQlM0ElNUNmYW1lJTVDbm9uLXByb2plY3QlNUNsaW5lLWJvdC1tY3Atc2VydmVyJTVDdWktbmV4dCZpc0Rldj10cnVlJnRzY29uZmlnUGF0aD10c2NvbmZpZy5qc29uJmJhc2VQYXRoPSZhc3NldFByZWZpeD0mbmV4dENvbmZpZ091dHB1dD1zdGFuZGFsb25lJnByZWZlcnJlZFJlZ2lvbj0mbWlkZGxld2FyZUNvbmZpZz1lMzAlM0QhIiwibWFwcGluZ3MiOiI7Ozs7Ozs7Ozs7Ozs7OztBQUFzRztBQUN2QztBQUNjO0FBQzhCO0FBQzNHO0FBQ0E7QUFDQTtBQUNBLHdCQUF3QixnSEFBbUI7QUFDM0M7QUFDQSxjQUFjLHlFQUFTO0FBQ3ZCO0FBQ0E7QUFDQTtBQUNBO0FBQ0EsS0FBSztBQUNMO0FBQ0E7QUFDQSxZQUFZO0FBQ1osQ0FBQztBQUNEO0FBQ0E7QUFDQTtBQUNBLFFBQVEsaUVBQWlFO0FBQ3pFO0FBQ0E7QUFDQSxXQUFXLDRFQUFXO0FBQ3RCO0FBQ0E7QUFDQSxLQUFLO0FBQ0w7QUFDdUg7O0FBRXZIIiwic291cmNlcyI6WyJ3ZWJwYWNrOi8vbGluZS1ib3QtbWNwLXVpLz9kOTdiIl0sInNvdXJjZXNDb250ZW50IjpbImltcG9ydCB7IEFwcFJvdXRlUm91dGVNb2R1bGUgfSBmcm9tIFwibmV4dC9kaXN0L3NlcnZlci9mdXR1cmUvcm91dGUtbW9kdWxlcy9hcHAtcm91dGUvbW9kdWxlLmNvbXBpbGVkXCI7XG5pbXBvcnQgeyBSb3V0ZUtpbmQgfSBmcm9tIFwibmV4dC9kaXN0L3NlcnZlci9mdXR1cmUvcm91dGUta2luZFwiO1xuaW1wb3J0IHsgcGF0Y2hGZXRjaCBhcyBfcGF0Y2hGZXRjaCB9IGZyb20gXCJuZXh0L2Rpc3Qvc2VydmVyL2xpYi9wYXRjaC1mZXRjaFwiO1xuaW1wb3J0ICogYXMgdXNlcmxhbmQgZnJvbSBcIkQ6XFxcXGZhbWVcXFxcbm9uLXByb2plY3RcXFxcbGluZS1ib3QtbWNwLXNlcnZlclxcXFx1aS1uZXh0XFxcXGFwcFxcXFxhcGlcXFxcdG9vbHNcXFxccm91dGUudHNcIjtcbi8vIFdlIGluamVjdCB0aGUgbmV4dENvbmZpZ091dHB1dCBoZXJlIHNvIHRoYXQgd2UgY2FuIHVzZSB0aGVtIGluIHRoZSByb3V0ZVxuLy8gbW9kdWxlLlxuY29uc3QgbmV4dENvbmZpZ091dHB1dCA9IFwic3RhbmRhbG9uZVwiXG5jb25zdCByb3V0ZU1vZHVsZSA9IG5ldyBBcHBSb3V0ZVJvdXRlTW9kdWxlKHtcbiAgICBkZWZpbml0aW9uOiB7XG4gICAgICAgIGtpbmQ6IFJvdXRlS2luZC5BUFBfUk9VVEUsXG4gICAgICAgIHBhZ2U6IFwiL2FwaS90b29scy9yb3V0ZVwiLFxuICAgICAgICBwYXRobmFtZTogXCIvYXBpL3Rvb2xzXCIsXG4gICAgICAgIGZpbGVuYW1lOiBcInJvdXRlXCIsXG4gICAgICAgIGJ1bmRsZVBhdGg6IFwiYXBwL2FwaS90b29scy9yb3V0ZVwiXG4gICAgfSxcbiAgICByZXNvbHZlZFBhZ2VQYXRoOiBcIkQ6XFxcXGZhbWVcXFxcbm9uLXByb2plY3RcXFxcbGluZS1ib3QtbWNwLXNlcnZlclxcXFx1aS1uZXh0XFxcXGFwcFxcXFxhcGlcXFxcdG9vbHNcXFxccm91dGUudHNcIixcbiAgICBuZXh0Q29uZmlnT3V0cHV0LFxuICAgIHVzZXJsYW5kXG59KTtcbi8vIFB1bGwgb3V0IHRoZSBleHBvcnRzIHRoYXQgd2UgbmVlZCB0byBleHBvc2UgZnJvbSB0aGUgbW9kdWxlLiBUaGlzIHNob3VsZFxuLy8gYmUgZWxpbWluYXRlZCB3aGVuIHdlJ3ZlIG1vdmVkIHRoZSBvdGhlciByb3V0ZXMgdG8gdGhlIG5ldyBmb3JtYXQuIFRoZXNlXG4vLyBhcmUgdXNlZCB0byBob29rIGludG8gdGhlIHJvdXRlLlxuY29uc3QgeyByZXF1ZXN0QXN5bmNTdG9yYWdlLCBzdGF0aWNHZW5lcmF0aW9uQXN5bmNTdG9yYWdlLCBzZXJ2ZXJIb29rcyB9ID0gcm91dGVNb2R1bGU7XG5jb25zdCBvcmlnaW5hbFBhdGhuYW1lID0gXCIvYXBpL3Rvb2xzL3JvdXRlXCI7XG5mdW5jdGlvbiBwYXRjaEZldGNoKCkge1xuICAgIHJldHVybiBfcGF0Y2hGZXRjaCh7XG4gICAgICAgIHNlcnZlckhvb2tzLFxuICAgICAgICBzdGF0aWNHZW5lcmF0aW9uQXN5bmNTdG9yYWdlXG4gICAgfSk7XG59XG5leHBvcnQgeyByb3V0ZU1vZHVsZSwgcmVxdWVzdEFzeW5jU3RvcmFnZSwgc3RhdGljR2VuZXJhdGlvbkFzeW5jU3RvcmFnZSwgc2VydmVySG9va3MsIG9yaWdpbmFsUGF0aG5hbWUsIHBhdGNoRmV0Y2gsICB9O1xuXG4vLyMgc291cmNlTWFwcGluZ1VSTD1hcHAtcm91dGUuanMubWFwIl0sIm5hbWVzIjpbXSwic291cmNlUm9vdCI6IiJ9\n//# sourceURL=webpack-internal:///(rsc)/./node_modules/next/dist/build/webpack/loaders/next-app-loader.js?name=app%2Fapi%2Ftools%2Froute&page=%2Fapi%2Ftools%2Froute&appPaths=&pagePath=private-next-app-dir%2Fapi%2Ftools%2Froute.ts&appDir=D%3A%5Cfame%5Cnon-project%5Cline-bot-mcp-server%5Cui-next%5Capp&pageExtensions=tsx&pageExtensions=ts&pageExtensions=jsx&pageExtensions=js&rootDir=D%3A%5Cfame%5Cnon-project%5Cline-bot-mcp-server%5Cui-next&isDev=true&tsconfigPath=tsconfig.json&basePath=&assetPrefix=&nextConfigOutput=standalone&preferredRegion=&middlewareConfig=e30%3D!\n");

/***/ }),

/***/ "(rsc)/./app/api/tools/route.ts":
/*!********************************!*\
  !*** ./app/api/tools/route.ts ***!
  \********************************/
/***/ ((__unused_webpack_module, __webpack_exports__, __webpack_require__) => {

eval("__webpack_require__.r(__webpack_exports__);\n/* harmony export */ __webpack_require__.d(__webpack_exports__, {\n/* harmony export */   GET: () => (/* binding */ GET),\n/* harmony export */   dynamic: () => (/* binding */ dynamic),\n/* harmony export */   runtime: () => (/* binding */ runtime)\n/* harmony export */ });\n/* harmony import */ var path__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! path */ \"path\");\n/* harmony import */ var path__WEBPACK_IMPORTED_MODULE_0___default = /*#__PURE__*/__webpack_require__.n(path__WEBPACK_IMPORTED_MODULE_0__);\n/* harmony import */ var _modelcontextprotocol_sdk_client_index_js__WEBPACK_IMPORTED_MODULE_1__ = __webpack_require__(/*! @modelcontextprotocol/sdk/client/index.js */ \"(rsc)/../node_modules/@modelcontextprotocol/sdk/dist/esm/client/index.js\");\n/* harmony import */ var _modelcontextprotocol_sdk_client_stdio_js__WEBPACK_IMPORTED_MODULE_2__ = __webpack_require__(/*! @modelcontextprotocol/sdk/client/stdio.js */ \"(rsc)/../node_modules/@modelcontextprotocol/sdk/dist/esm/client/stdio.js\");\nconst runtime = \"nodejs\";\nconst dynamic = \"force-dynamic\";\n\n\n\nasync function getClient() {\n    if (globalThis.__mcpClient) return globalThis.__mcpClient;\n    const projectRoot = path__WEBPACK_IMPORTED_MODULE_0___default().resolve(process.cwd(), \"..\");\n    const transport = new _modelcontextprotocol_sdk_client_stdio_js__WEBPACK_IMPORTED_MODULE_2__.StdioClientTransport({\n        command: \"node\",\n        args: [\n            \"dist/index.js\"\n        ],\n        cwd: projectRoot,\n        env: process.env\n    });\n    const client = new _modelcontextprotocol_sdk_client_index_js__WEBPACK_IMPORTED_MODULE_1__.Client({\n        name: \"line-bot-ui-next\",\n        version: \"0.1.0\"\n    });\n    await client.connect(transport);\n    globalThis.__mcpClient = client;\n    return client;\n}\nasync function GET() {\n    try {\n        const client = await getClient();\n        const tools = await client.listTools();\n        return new Response(JSON.stringify(tools), {\n            headers: {\n                \"Content-Type\": \"application/json\"\n            }\n        });\n    } catch (e) {\n        return new Response(JSON.stringify({\n            error: e?.message || String(e)\n        }), {\n            status: 500,\n            headers: {\n                \"Content-Type\": \"application/json\"\n            }\n        });\n    }\n}\n//# sourceURL=[module]\n//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiKHJzYykvLi9hcHAvYXBpL3Rvb2xzL3JvdXRlLnRzIiwibWFwcGluZ3MiOiI7Ozs7Ozs7Ozs7QUFBTyxNQUFNQSxVQUFVLFNBQVM7QUFDekIsTUFBTUMsVUFBVSxnQkFBZ0I7QUFFZjtBQUMyQztBQUNjO0FBT2pGLGVBQWVJO0lBQ2IsSUFBSUMsV0FBV0MsV0FBVyxFQUFFLE9BQU9ELFdBQVdDLFdBQVc7SUFFekQsTUFBTUMsY0FBY04sbURBQVksQ0FBQ1EsUUFBUUMsR0FBRyxJQUFJO0lBQ2hELE1BQU1DLFlBQVksSUFBSVIsMkZBQW9CQSxDQUFDO1FBQ3pDUyxTQUFTO1FBQ1RDLE1BQU07WUFBQztTQUFnQjtRQUN2QkgsS0FBS0g7UUFDTE8sS0FBS0wsUUFBUUssR0FBRztJQUNsQjtJQUNBLE1BQU1DLFNBQVMsSUFBSWIsNkVBQU1BLENBQUM7UUFBRWMsTUFBTTtRQUFvQkMsU0FBUztJQUFRO0lBQ3ZFLE1BQU1GLE9BQU9HLE9BQU8sQ0FBQ1A7SUFDckJOLFdBQVdDLFdBQVcsR0FBR1M7SUFDekIsT0FBT0E7QUFDVDtBQUVPLGVBQWVJO0lBQ3BCLElBQUk7UUFDRixNQUFNSixTQUFTLE1BQU1YO1FBQ3JCLE1BQU1nQixRQUFRLE1BQU1MLE9BQU9NLFNBQVM7UUFDcEMsT0FBTyxJQUFJQyxTQUFTQyxLQUFLQyxTQUFTLENBQUNKLFFBQVE7WUFDekNLLFNBQVM7Z0JBQUUsZ0JBQWdCO1lBQW1CO1FBQ2hEO0lBQ0YsRUFBRSxPQUFPQyxHQUFRO1FBQ2YsT0FBTyxJQUFJSixTQUFTQyxLQUFLQyxTQUFTLENBQUM7WUFBRUcsT0FBT0QsR0FBR0UsV0FBV0MsT0FBT0g7UUFBRyxJQUFJO1lBQ3RFSSxRQUFRO1lBQ1JMLFNBQVM7Z0JBQUUsZ0JBQWdCO1lBQW1CO1FBQ2hEO0lBQ0Y7QUFDRiIsInNvdXJjZXMiOlsid2VicGFjazovL2xpbmUtYm90LW1jcC11aS8uL2FwcC9hcGkvdG9vbHMvcm91dGUudHM/YmQ5NCJdLCJzb3VyY2VzQ29udGVudCI6WyJleHBvcnQgY29uc3QgcnVudGltZSA9IFwibm9kZWpzXCI7XG5leHBvcnQgY29uc3QgZHluYW1pYyA9IFwiZm9yY2UtZHluYW1pY1wiO1xuXG5pbXBvcnQgcGF0aCBmcm9tIFwicGF0aFwiO1xuaW1wb3J0IHsgQ2xpZW50IH0gZnJvbSBcIkBtb2RlbGNvbnRleHRwcm90b2NvbC9zZGsvY2xpZW50L2luZGV4LmpzXCI7XG5pbXBvcnQgeyBTdGRpb0NsaWVudFRyYW5zcG9ydCB9IGZyb20gXCJAbW9kZWxjb250ZXh0cHJvdG9jb2wvc2RrL2NsaWVudC9zdGRpby5qc1wiO1xuXG5kZWNsYXJlIGdsb2JhbCB7XG4gIC8vIGVzbGludC1kaXNhYmxlLW5leHQtbGluZSBuby12YXJcbiAgdmFyIF9fbWNwQ2xpZW50OiBDbGllbnQgfCB1bmRlZmluZWQ7XG59XG5cbmFzeW5jIGZ1bmN0aW9uIGdldENsaWVudCgpOiBQcm9taXNlPENsaWVudD4ge1xuICBpZiAoZ2xvYmFsVGhpcy5fX21jcENsaWVudCkgcmV0dXJuIGdsb2JhbFRoaXMuX19tY3BDbGllbnQ7XG5cbiAgY29uc3QgcHJvamVjdFJvb3QgPSBwYXRoLnJlc29sdmUocHJvY2Vzcy5jd2QoKSwgXCIuLlwiKTtcbiAgY29uc3QgdHJhbnNwb3J0ID0gbmV3IFN0ZGlvQ2xpZW50VHJhbnNwb3J0KHtcbiAgICBjb21tYW5kOiBcIm5vZGVcIixcbiAgICBhcmdzOiBbXCJkaXN0L2luZGV4LmpzXCJdLFxuICAgIGN3ZDogcHJvamVjdFJvb3QsXG4gICAgZW52OiBwcm9jZXNzLmVudiBhcyBSZWNvcmQ8c3RyaW5nLCBzdHJpbmc+LFxuICB9KTtcbiAgY29uc3QgY2xpZW50ID0gbmV3IENsaWVudCh7IG5hbWU6IFwibGluZS1ib3QtdWktbmV4dFwiLCB2ZXJzaW9uOiBcIjAuMS4wXCIgfSk7XG4gIGF3YWl0IGNsaWVudC5jb25uZWN0KHRyYW5zcG9ydCk7XG4gIGdsb2JhbFRoaXMuX19tY3BDbGllbnQgPSBjbGllbnQ7XG4gIHJldHVybiBjbGllbnQ7XG59XG5cbmV4cG9ydCBhc3luYyBmdW5jdGlvbiBHRVQoKSB7XG4gIHRyeSB7XG4gICAgY29uc3QgY2xpZW50ID0gYXdhaXQgZ2V0Q2xpZW50KCk7XG4gICAgY29uc3QgdG9vbHMgPSBhd2FpdCBjbGllbnQubGlzdFRvb2xzKCk7XG4gICAgcmV0dXJuIG5ldyBSZXNwb25zZShKU09OLnN0cmluZ2lmeSh0b29scyksIHtcbiAgICAgIGhlYWRlcnM6IHsgXCJDb250ZW50LVR5cGVcIjogXCJhcHBsaWNhdGlvbi9qc29uXCIgfSxcbiAgICB9KTtcbiAgfSBjYXRjaCAoZTogYW55KSB7XG4gICAgcmV0dXJuIG5ldyBSZXNwb25zZShKU09OLnN0cmluZ2lmeSh7IGVycm9yOiBlPy5tZXNzYWdlIHx8IFN0cmluZyhlKSB9KSwge1xuICAgICAgc3RhdHVzOiA1MDAsXG4gICAgICBoZWFkZXJzOiB7IFwiQ29udGVudC1UeXBlXCI6IFwiYXBwbGljYXRpb24vanNvblwiIH0sXG4gICAgfSk7XG4gIH1cbn1cblxuIl0sIm5hbWVzIjpbInJ1bnRpbWUiLCJkeW5hbWljIiwicGF0aCIsIkNsaWVudCIsIlN0ZGlvQ2xpZW50VHJhbnNwb3J0IiwiZ2V0Q2xpZW50IiwiZ2xvYmFsVGhpcyIsIl9fbWNwQ2xpZW50IiwicHJvamVjdFJvb3QiLCJyZXNvbHZlIiwicHJvY2VzcyIsImN3ZCIsInRyYW5zcG9ydCIsImNvbW1hbmQiLCJhcmdzIiwiZW52IiwiY2xpZW50IiwibmFtZSIsInZlcnNpb24iLCJjb25uZWN0IiwiR0VUIiwidG9vbHMiLCJsaXN0VG9vbHMiLCJSZXNwb25zZSIsIkpTT04iLCJzdHJpbmdpZnkiLCJoZWFkZXJzIiwiZSIsImVycm9yIiwibWVzc2FnZSIsIlN0cmluZyIsInN0YXR1cyJdLCJzb3VyY2VSb290IjoiIn0=\n//# sourceURL=webpack-internal:///(rsc)/./app/api/tools/route.ts\n");

/***/ })

};
;

// load runtime
var __webpack_require__ = require("../../../webpack-runtime.js");
__webpack_require__.C(exports);
var __webpack_exec__ = (moduleId) => (__webpack_require__(__webpack_require__.s = moduleId))
var __webpack_exports__ = __webpack_require__.X(0, ["vendor-chunks/next","vendor-chunks/ajv","vendor-chunks/zod","vendor-chunks/@modelcontextprotocol","vendor-chunks/uri-js","vendor-chunks/cross-spawn","vendor-chunks/which","vendor-chunks/isexe","vendor-chunks/json-schema-traverse","vendor-chunks/fast-json-stable-stringify","vendor-chunks/fast-deep-equal","vendor-chunks/path-key","vendor-chunks/shebang-command","vendor-chunks/shebang-regex"], () => (__webpack_exec__("(rsc)/./node_modules/next/dist/build/webpack/loaders/next-app-loader.js?name=app%2Fapi%2Ftools%2Froute&page=%2Fapi%2Ftools%2Froute&appPaths=&pagePath=private-next-app-dir%2Fapi%2Ftools%2Froute.ts&appDir=D%3A%5Cfame%5Cnon-project%5Cline-bot-mcp-server%5Cui-next%5Capp&pageExtensions=tsx&pageExtensions=ts&pageExtensions=jsx&pageExtensions=js&rootDir=D%3A%5Cfame%5Cnon-project%5Cline-bot-mcp-server%5Cui-next&isDev=true&tsconfigPath=tsconfig.json&basePath=&assetPrefix=&nextConfigOutput=standalone&preferredRegion=&middlewareConfig=e30%3D!")));
module.exports = __webpack_exports__;

})();