/******/ (function(modules) { // webpackBootstrap
/******/ 	// The module cache
/******/ 	var installedModules = {};
/******/
/******/ 	// The require function
/******/ 	function __webpack_require__(moduleId) {
/******/
/******/ 		// Check if module is in cache
/******/ 		if(installedModules[moduleId]) {
/******/ 			return installedModules[moduleId].exports;
/******/ 		}
/******/ 		// Create a new module (and put it into the cache)
/******/ 		var module = installedModules[moduleId] = {
/******/ 			i: moduleId,
/******/ 			l: false,
/******/ 			exports: {}
/******/ 		};
/******/
/******/ 		// Execute the module function
/******/ 		modules[moduleId].call(module.exports, module, module.exports, __webpack_require__);
/******/
/******/ 		// Flag the module as loaded
/******/ 		module.l = true;
/******/
/******/ 		// Return the exports of the module
/******/ 		return module.exports;
/******/ 	}
/******/
/******/
/******/ 	// expose the modules object (__webpack_modules__)
/******/ 	__webpack_require__.m = modules;
/******/
/******/ 	// expose the module cache
/******/ 	__webpack_require__.c = installedModules;
/******/
/******/ 	// define getter function for harmony exports
/******/ 	__webpack_require__.d = function(exports, name, getter) {
/******/ 		if(!__webpack_require__.o(exports, name)) {
/******/ 			Object.defineProperty(exports, name, { enumerable: true, get: getter });
/******/ 		}
/******/ 	};
/******/
/******/ 	// define __esModule on exports
/******/ 	__webpack_require__.r = function(exports) {
/******/ 		if(typeof Symbol !== 'undefined' && Symbol.toStringTag) {
/******/ 			Object.defineProperty(exports, Symbol.toStringTag, { value: 'Module' });
/******/ 		}
/******/ 		Object.defineProperty(exports, '__esModule', { value: true });
/******/ 	};
/******/
/******/ 	// create a fake namespace object
/******/ 	// mode & 1: value is a module id, require it
/******/ 	// mode & 2: merge all properties of value into the ns
/******/ 	// mode & 4: return value when already ns object
/******/ 	// mode & 8|1: behave like require
/******/ 	__webpack_require__.t = function(value, mode) {
/******/ 		if(mode & 1) value = __webpack_require__(value);
/******/ 		if(mode & 8) return value;
/******/ 		if((mode & 4) && typeof value === 'object' && value && value.__esModule) return value;
/******/ 		var ns = Object.create(null);
/******/ 		__webpack_require__.r(ns);
/******/ 		Object.defineProperty(ns, 'default', { enumerable: true, value: value });
/******/ 		if(mode & 2 && typeof value != 'string') for(var key in value) __webpack_require__.d(ns, key, function(key) { return value[key]; }.bind(null, key));
/******/ 		return ns;
/******/ 	};
/******/
/******/ 	// getDefaultExport function for compatibility with non-harmony modules
/******/ 	__webpack_require__.n = function(module) {
/******/ 		var getter = module && module.__esModule ?
/******/ 			function getDefault() { return module['default']; } :
/******/ 			function getModuleExports() { return module; };
/******/ 		__webpack_require__.d(getter, 'a', getter);
/******/ 		return getter;
/******/ 	};
/******/
/******/ 	// Object.prototype.hasOwnProperty.call
/******/ 	__webpack_require__.o = function(object, property) { return Object.prototype.hasOwnProperty.call(object, property); };
/******/
/******/ 	// __webpack_public_path__
/******/ 	__webpack_require__.p = "";
/******/
/******/
/******/ 	// Load entry module and return exports
/******/ 	return __webpack_require__(__webpack_require__.s = "./server.ts");
/******/ })
/************************************************************************/
/******/ ({

/***/ "./server.ts":
/*!*******************!*\
  !*** ./server.ts ***!
  \*******************/
/*! no static exports found */
/***/ (function(module, exports, __webpack_require__) {

"use strict";

Object.defineProperty(exports, "__esModule", { value: true });
const express = __webpack_require__(/*! express */ "express");
const http = __webpack_require__(/*! http */ "http");
const sio = __webpack_require__(/*! socket.io */ "socket.io");
var port = process.env.PORT || 3000;
var pingMS = 100;
// Basic express webserver
var app = express();
app.use("/public", express.static("public"));
app.get('/', function (req, res) {
    res.sendFile(process.cwd() + "/public/index.html");
});
var server = http.createServer(app);
server.listen(port);
// socket io configuration for multiplayer
var io = sio(server);
var rooms = {};
io.on('connection', function (socket) {
    socket.customData = {
        roomName: "",
        playerName: "",
        position: { x: 0, y: 0, z: 0 },
        rotationQuaternion: { x: 0, y: 0, z: 0, w: 0 },
        wheelsRotationSpeedRatio: 0,
        steeringAnimationFrame: 0,
        bodyMaterialIndex: 0,
        driverMaterialIndex: 0
    };
    console.log('a user connected');
    socket.on("joinRoom", (e) => {
        if (!rooms[e.roomName]) {
            rooms[e.roomName] = {
                users: [],
                raceId: 1
            };
        }
        socket.customData.roomName = e.roomName;
        socket.customData.playerName = e.playerName;
        socket.customData.bodyMaterialIndex = e.bodyMaterialIndex;
        socket.customData.driverMaterialIndex = e.driverMaterialIndex;
        const room = rooms[socket.customData.roomName];
        room.users.push(socket);
        socket.emit("joinRoomComplete", { id: socket.id, pingMS: pingMS, raceId: room.raceId });
    });
    socket.on("updateKartPose", (pose) => {
        socket.customData.position.x = pose.p.x;
        socket.customData.position.y = pose.p.y;
        socket.customData.position.z = pose.p.z;
        socket.customData.rotationQuaternion.x = pose.r.x;
        socket.customData.rotationQuaternion.y = pose.r.y;
        socket.customData.rotationQuaternion.z = pose.r.z;
        socket.customData.rotationQuaternion.w = pose.r.w;
        socket.customData.wheelsRotationSpeedRatio = pose.w;
        socket.customData.steeringAnimationFrame = pose.s;
        socket.customData.bodyMaterialIndex = pose.b;
        socket.customData.driverMaterialIndex = pose.d;
    });
    socket.on("disconnect", () => {
        if (!rooms[socket.customData.roomName]) {
            return;
        }
        var index = rooms[socket.customData.roomName].users.indexOf(socket);
        if (index == -1) {
            return;
        }
        rooms[socket.customData.roomName].users.splice(index, 1);
        rooms[socket.customData.roomName].users.forEach((s) => {
            s.emit("userDisconnected", socket.id);
        });
    });
    socket.on("raceComplete", (e) => {
        const room = rooms[socket.customData.roomName];
        if (!room) {
            return;
        }
        console.log(e.raceId, room.raceId);
        if (e.raceId == room.raceId) {
            room.raceId++;
            room.users.forEach((s) => {
                s.emit("raceComplete", { raceId: room.raceId, winnerName: e.name });
            });
        }
        console.log("race reset");
    });
});
// Ping loop
setInterval(() => {
    for (var key in rooms) {
        var ret = rooms[key].users.map((s) => {
            return {
                id: s.id,
                name: s.customData.playerName,
                p: s.customData.position,
                r: s.customData.rotationQuaternion,
                w: s.customData.wheelsRotationSpeedRatio,
                s: s.customData.steeringAnimationFrame,
                b: s.customData.bodyMaterialIndex,
                d: s.customData.driverMaterialIndex,
            };
        });
        rooms[key].users.forEach((s) => {
            s.emit("serverUpdate", ret);
        });
    }
}, pingMS);


/***/ }),

/***/ "express":
/*!**************************!*\
  !*** external "express" ***!
  \**************************/
/*! no static exports found */
/***/ (function(module, exports) {

module.exports = require("express");

/***/ }),

/***/ "http":
/*!***********************!*\
  !*** external "http" ***!
  \***********************/
/*! no static exports found */
/***/ (function(module, exports) {

module.exports = require("http");

/***/ }),

/***/ "socket.io":
/*!****************************!*\
  !*** external "socket.io" ***!
  \****************************/
/*! no static exports found */
/***/ (function(module, exports) {

module.exports = require("socket.io");

/***/ })

/******/ });
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIndlYnBhY2s6Ly8vd2VicGFjay9ib290c3RyYXAiLCJ3ZWJwYWNrOi8vLy4vc2VydmVyLnRzIiwid2VicGFjazovLy9leHRlcm5hbCBcImV4cHJlc3NcIiIsIndlYnBhY2s6Ly8vZXh0ZXJuYWwgXCJodHRwXCIiLCJ3ZWJwYWNrOi8vL2V4dGVybmFsIFwic29ja2V0LmlvXCIiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6IjtBQUFBO0FBQ0E7O0FBRUE7QUFDQTs7QUFFQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUFFQTtBQUNBOztBQUVBO0FBQ0E7O0FBRUE7QUFDQTtBQUNBOzs7QUFHQTtBQUNBOztBQUVBO0FBQ0E7O0FBRUE7QUFDQTtBQUNBO0FBQ0Esa0RBQTBDLGdDQUFnQztBQUMxRTtBQUNBOztBQUVBO0FBQ0E7QUFDQTtBQUNBLGdFQUF3RCxrQkFBa0I7QUFDMUU7QUFDQSx5REFBaUQsY0FBYztBQUMvRDs7QUFFQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0EsaURBQXlDLGlDQUFpQztBQUMxRSx3SEFBZ0gsbUJBQW1CLEVBQUU7QUFDckk7QUFDQTs7QUFFQTtBQUNBO0FBQ0E7QUFDQSxtQ0FBMkIsMEJBQTBCLEVBQUU7QUFDdkQseUNBQWlDLGVBQWU7QUFDaEQ7QUFDQTtBQUNBOztBQUVBO0FBQ0EsOERBQXNELCtEQUErRDs7QUFFckg7QUFDQTs7O0FBR0E7QUFDQTs7Ozs7Ozs7Ozs7Ozs7O0FDbEZBLDhEQUFrQztBQUNsQyxxREFBNEI7QUFDNUIsOERBQWlDO0FBZWpDLElBQUksSUFBSSxHQUFHLE9BQU8sQ0FBQyxHQUFHLENBQUMsSUFBSSxJQUFJLElBQUksQ0FBQztBQUNwQyxJQUFJLE1BQU0sR0FBRyxHQUFHLENBQUM7QUFFakIsMEJBQTBCO0FBQzFCLElBQUksR0FBRyxHQUFHLE9BQU8sRUFBRTtBQUNuQixHQUFHLENBQUMsR0FBRyxDQUFDLFNB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TztnQkFDSCxFQUFFLEVBQUUsQ0FBQyxDQUFDLEVBQUU7Z0JBQ1IsSUFBSSxFQUFFLENBQUMsQ0FBQyxVQUFVLENBQUMsVUFBVTtnQkFDN0IsQ0FBQyxFQUFFLENBQUMsQ0FBQyxVQUFVLENBQUMsUUFBUTtnQkFDeEIsQ0FBQyxFQUFFLENBQUMsQ0FBQyxVQUFVLENBQUMsa0JBQWtCO2dCQUNsQyxDQUFDLEVBQUUsQ0FBQyxDQUFDLFVBQVUsQ0FBQyx3QkFBd0I7Z0JBQ3hDLENBQUMsRUFBRSxDQUFDLENBQUMsVUFBVSxDQUFDLHNCQUFzQjtnQkFDdEMsQ0FBQyxFQUFFLENBQUMsQ0FBQyxVQUFVLENBQUMsaUJBQWlCO2dCQUNqQyxDQUFDLEVBQUUsQ0FBQyxDQUFDLFVBQVUsQ0FBQyxtQkFBbUI7YUFDdEM7UUFDTCxDQUFDLENBQUM7UUFDRixLQUFLLENBQUMsR0FBRyxDQUFDLENBQUMsS0FBSyxDQUFDLE9BQU8sQ0FBQyxDQUFDLENBQVUsRUFBRSxFQUFFO1lBQ3BDLENBQUMsQ0FBQyxJQUFJLENBQUMsY0FBYyxFQUFFLEdBQUcsQ0FBQyxDQUFDO1FBQ2hDLENBQUMsQ0FBQztLQUNMO0FBQ0wsQ0FBQyxFQUFFLE1BQU0sQ0FBQzs7Ozs7Ozs7Ozs7O0FDNUhWLG9DOzs7Ozs7Ozs7OztBQ0FBLGlDOzs7Ozs7Ozs7OztBQ0FBLHNDIiwiZmlsZSI6InNlcnZlci5qcyIsInNvdXJjZXNDb250ZW50IjpbIiBcdC8vIFRoZSBtb2R1bGUgY2FjaGVcbiBcdHZhciBpbnN0YWxsZWRNb2R1bGVzID0ge307XG5cbiBcdC8vIFRoZSByZXF1aXJlIGZ1bmN0aW9uXG4gXHRmdW5jdGlvbiBfX3dlYnBhY2tfcmVxdWlyZV9fKG1vZHVsZUlkKSB7XG5cbiBcdFx0Ly8gQ2hlY2sgaWYgbW9kdWxlIGlzIGluIGNhY2hlXG4gXHRcdGlmKGluc3RhbGxlZE1vZHVsZXNbbW9kdWxlSWRdKSB7XG4gXHRcdFx0cmV0dXJuIGluc3RhbGxlZE1vZHVsZXNbbW9kdWxlSWRdLmV4cG9ydHM7XG4gXHRcdH1cbiBcdFx0Ly8gQ3JlYXRlIGEgbmV3IG1vZHVsZSAoYW5kIHB1dCBpdCBpbnRvIHRoZSBjYWNoZSlcbiBcdFx0dmFyIG1vZHVsZSA9IGluc3RhbGxlZE1vZHVsZXNbbW9kdWxlSWRdID0ge1xuIFx0XHRcdGk6IG1vZHVsZUlkLFxuIFx0XHRcdGw6IGZhbHNlLFxuIFx0XHRcdGV4cG9ydHM6IHt9XG4gXHRcdH07XG5cbiBcdFx0Ly8gRXhlY3V0ZSB0aGUgbW9kdWxlIGZ1bmN0aW9uXG4gXHRcdG1vZHVsZXNbbW9kdWxlSWRdLmNhbGwobW9kdWxlLmV4cG9ydHMsIG1vZHVsZSwgbW9kdWxlLmV4cG9ydHMsIF9fd2VicGFja19yZXF1aXJlX18pO1xuXG4gXHRcdC8vIEZsYWcgdGhlIG1vZHVsZSBhcyBsb2FkZWRcbiBcdFx0bW9kdWxlLmwgPSB0cnVlO1xuXG4gXHRcdC8vIFJldHVybiB0aGUgZXhwb3J0cyBvZiB0aGUgbW9kdWxlXG4gXHRcdHJldHVybiBtb2R1bGUuZXhwb3J0cztcbiBcdH1cblxuXG4gXHQvLyBleHBvc2UgdGhlIG1vZHVsZXMgb2JqZWN0IChfX3dlYnBhY2tfbW9kdWxlc19fKVxuIFx0X193ZWJwYWNrX3JlcXVpcmVfXy5tID0gbW9kdWxlcztcblxuIFx0Ly8gZXhwb3NlIHRoZSBtb2R1bGUgY2FjaGVcbiBcdF9fd2VicGFja19yZXF1aXJlX18uYyA9IGluc3RhbGxlZE1vZHVsZXM7XG5cbiBcdC8vIGRlZmluZSBnZXR0ZXIgZnVuY3Rpb24gZm9yIGhhcm1vbnkgZXhwb3J0c1xuIFx0X193ZWJwYWNrX3JlcXVpcmVfXy5kID0gZnVuY3Rpb24oZXhwb3J0cywgbmFtZSwgZ2V0dGVyKSB7XG4gXHRcdGlmKCFfX3dlYnBhY2tfcmVxdWlyZV9fLm8oZXhwb3J0cywgbmFtZSkpIHtcbiBcdFx0XHRPYmplY3QuZGVmaW5lUHJvcGVydHkoZXhwb3J0cywgbmFtZSwgeyBlbnVtZXJhYmxlOiB0cnVlLCBnZXQ6IGdldHRlciB9KTtcbiBcdFx0fVxuIFx0fTtcblxuIFx0Ly8gZGVmaW5lIF9fZXNNb2R1bGUgb24gZXhwb3J0c1xuIFx0X193ZWJwYWNrX3JlcXVpcmVfXy5yID0gZnVuY3Rpb24oZXhwb3J0cykge1xuIFx0XHRpZih0eXBlb2YgU3ltYm9sICE9PSAndW5kZWZpbmVkJyAmJiBTeW1ib2wudG9TdHJpbmdUYWcpIHtcbiBcdFx0XHRPYmplY3QuZGVmaW5lUHJvcGVydHkoZXhwb3J0cywgU3ltYm9sLnRvU3RyaW5nVGFnLCB7IHZhbHVlOiAnTW9kdWxlJyB9KTtcbiBcdFx0fVxuIFx0XHRPYmplY3QuZGVmaW5lUHJvcGVydHkoZXhwb3J0cywgJ19fZXNNb2R1bGUnLCB7IHZhbHVlOiB0cnVlIH0pO1xuIFx0fTtcblxuIFx0Ly8gY3JlYXRlIGEgZmFrZSBuYW1lc3BhY2Ugb2JqZWN0XG4gXHQvLyBtb2RlICYgMTogdmFsdWUgaXMgYSBtb2R1bGUgaWQsIHJlcXVpcmUgaXRcbiBcdC8vIG1vZGUgJiAyOiBtZXJnZSBhbGwgcHJvcGVydGllcyBvZiB2YWx1ZSBpbnRvIHRoZSBuc1xuIFx0Ly8gbW9kZSAmIDQ6IHJldHVybiB2YWx1ZSB3aGVuIGFscmVhZHkgbnMgb2JqZWN0XG4gXHQvLyBtb2RlICYgOHwxOiBiZWhhdmUgbGlrZSByZXF1aXJlXG4gXHRfX3dlYnBhY2tfcmVxdWlyZV9fLnQgPSBmdW5jdGlvbih2YWx1ZSwgbW9kZSkge1xuIFx0XHRpZihtb2RlICYgMSkgdmFsdWUgPSBfX3dlYnBhY2tfcmVxdWlyZV9fKHZhbHVlKTtcbiBcdFx0aWYobW9kZSAmIDgpIHJldHVybiB2YWx1ZTtcbiBcdFx0aWYoKG1vZGUgJiA0KSAmJiB0eXBlb2YgdmFsdWUgPT09ICdvYmplY3QnICYmIHZhbHVlICYmIHZhbHVlLl9fZXNNb2R1bGUpIHJldHVybiB2YWx1ZTtcbiBcdFx0dmFyIG5zID0gT2JqZWN0LmNyZWF0ZShudWxsKTtcbiBcdFx0X193ZWJwYWNrX3JlcXVpcmVfXy5yKG5zKTtcbiBcdFx0T2JqZWN0LmRlZmluZVByb3BlcnR5KG5zLCAnZGVmYXVsdCcsIHsgZW51bWVyYWJsZTogdHJ1ZSwgdmFsdWU6IHZhbHVlIH0pO1xuIFx0XHRpZihtb2RlICYgMiAmJiB0eXBlb2YgdmFsdWUgIT0gJ3N0cmluZycpIGZvcih2YXIga2V5IGluIHZhbHVlKSBfX3dlYnBhY2tfcmVxdWlyZV9fLmQobnMsIGtleSwgZnVuY3Rpb24oa2V5KSB7IHJldHVybiB2YWx1ZVtrZXldOyB9LmJpbmQobnVsbCwga2V5KSk7XG4gXHRcdHJldHVybiBucztcbiBcdH07XG5cbiBcdC8vIGdldERlZmF1bHRFeHBvcnQgZnVuY3Rpb24gZm9yIGNvbXBhdGliaWxpdHkgd2l0aCBub24taGFybW9ueSBtb2R1bGVzXG4gXHRfX3dlYnBhY2tfcmVxdWlyZV9fLm4gPSBmdW5jdGlvbihtb2R1bGUpIHtcbiBcdFx0dmFyIGdldHRlciA9IG1vZHVsZSAmJiBtb2R1bGUuX19lc01vZHVsZSA/XG4gXHRcdFx0ZnVuY3Rpb24gZ2V0RGVmYXVsdCgpIHsgcmV0dXJuIG1vZHVsZVsnZGVmYXVsdCddOyB9IDpcbiBcdFx0XHRmdW5jdGlvbiBnZXRNb2R1bGVFeHBvcnRzKCkgeyByZXR1cm4gbW9kdWxlOyB9O1xuIFx0XHRfX3dlYnBhY2tfcmVxdWlyZV9fLmQoZ2V0dGVyLCAnYScsIGdldHRlcik7XG4gXHRcdHJldHVybiBnZXR0ZXI7XG4gXHR9O1xuXG4gXHQvLyBPYmplY3QucHJvdG90eXBlLmhhc093blByb3BlcnR5LmNhbGxcbiBcdF9fd2VicGFja19yZXF1aXJlX18ubyA9IGZ1bmN0aW9uKG9iamVjdCwgcHJvcGVydHkpIHsgcmV0dXJuIE9iamVjdC5wcm90b3R5cGUuaGFzT3duUHJvcGVydHkuY2FsbChvYmplY3QsIHByb3BlcnR5KTsgfTtcblxuIFx0Ly8gX193ZWJwYWNrX3B1YmxpY19wYXRoX19cbiBcdF9fd2VicGFja19yZXF1aXJlX18ucCA9IFwiXCI7XG5cblxuIFx0Ly8gTG9hZCBlbnRyeSBtb2R1bGUgYW5kIHJldHVybiBleHBvcnRzXG4gXHRyZXR1cm4gX193ZWJwYWNrX3JlcXVpcmVfXyhfX3dlYnBhY2tfcmVxdWlyZV9fLnMgPSBcIi4vc2VydmVyLnRzXCIpO1xuIiwiaW1wb3J0ICogYXMgZXhwcmVzcyBmcm9tIFwiZXhwcmVzc1wiXHJcbmltcG9ydCAqIGFzIGh0dHAgZnJvbSBcImh0dHBcIlxyXG5pbXBvcnQgKiBhcyBzaW8gZnJvbSBcInNvY2tldC5pb1wiO1xyXG5cclxuaW50ZXJmYWNlIElTb2NrZXQgZXh0ZW5kcyBzaW8uU29ja2V0IHtcclxuICAgIGN1c3RvbURhdGE6IHtcclxuICAgICAgICByb29tTmFtZTogc3RyaW5nO1xyXG4gICAgICAgIHBsYXllck5hbWU6IHN0cmluZztcclxuICAgICAgICBwb3NpdGlvbjogeyB4OiBudW1iZXIsIHk6IG51bWJlciwgejogbnVtYmVyIH07XHJcbiAgICAgICAgcm90YXRpb25RdWF0ZXJuaW9uOiB7IHg6IG51bWJlciwgeTogbnVtYmVyLCB6OiBudW1iZXIsIHc6IG51bWJlciB9O1xyXG4gICAgICAgIHdoZWVsc1JvdGF0aW9uU3BlZWRSYXRpbzogbnVtYmVyO1xyXG4gICAgICAgIHN0ZWVyaW5nQW5pbWF0aW9uRnJhbWU6IG51bWJlcjtcclxuICAgICAgICBib2R5TWF0ZXJpYWxJbmRleDogbnVtYmVyO1xyXG4gICAgICAgIGRyaXZlck1hdGVyaWFsSW5kZXg6IG51bWJlcjtcclxuICAgIH1cclxufVxyXG5cclxudmFyIHBvcnQgPSBwcm9jZXNzLmVudi5QT1JUIHx8IDMwMDA7XHJcbnZhciBwaW5nTVMgPSAxMDA7XHJcblxyXG4vLyBCYXNpYyBleHByZXNzIHdlYnNlcnZlclxyXG52YXIgYXBwID0gZXhwcmVzcygpXHJcbmFwcC51c2UoXCIvcHVibGljXCIsIGV4cHJlc3Muc3RhdGljKFwicHVibGljXCIpKVxyXG5hcHAuZ2V0KCcvJywgZnVuY3Rpb24gKHJlcSwgcmVzKSB7XHJcbiAgICByZXMuc2VuZEZpbGUocHJvY2Vzcy5jd2QoKSArIFwiL3B1YmxpYy9pbmRleC5odG1sXCIpXHJcbn0pXHJcbnZhciBzZXJ2ZXIgPSBodHRwLmNyZWF0ZVNlcnZlcihhcHApXHJcbnNlcnZlci5saXN0ZW4ocG9ydClcclxuXHJcbi8vIHNvY2tldCBpbyBjb25maWd1cmF0aW9uIGZvciBtdWx0aXBsYXllclxyXG52YXIgaW8gPSBzaW8oc2VydmVyKVxyXG52YXIgcm9vbXM6IHsgW25hbWU6IHN0cmluZ106IHsgdXNlcnM6IEFycmF5PGFueT4sIHJhY2VJZDogbnVtYmVyIH0gfSA9IHt9XHJcbmlvLm9uKCdjb25uZWN0aW9uJywgZnVuY3Rpb24gKHNvY2tldDogSVNvY2tldCkge1xyXG4gICAgc29ja2V0LmN1c3RvbURhdGEgPSB7XHJcbiAgICAgICAgcm9vbU5hbWU6IFwiXCIsXHJcbiAgICAgICAgcGxheWVyTmFtZTogXCJcIixcclxuICAgICAgICBwb3NpdGlvbjogeyB4OiAwLCB5OiAwLCB6OiAwIH0sXHJcbiAgICAgICAgcm90YXRpb25RdWF0ZXJuaW9uOiB7IHg6IDAsIHk6IDAsIHo6IDAsIHc6IDAgfSxcclxuICAgICAgICB3aGVlbHNSb3RhdGlvblNwZWVkUmF0aW86IDAsXHJcbiAgICAgICAgc3RlZXJpbmdBbmltYXRpb25GcmFtZTogMCxcclxuICAgICAgICBib2R5TWF0ZXJpYWxJbmRleDogMCxcclxuICAgICAgICBkcml2ZXJNYXRlcmlhbEluZGV4OiAwXHJcbiAgICB9O1xyXG4gICAgY29uc29sZS5sb2coJ2EgdXNlciBjb25uZWN0ZWQnKTtcclxuICAgIHNvY2tldC5vbihcImpvaW5Sb29tXCIsIChlKSA9PiB7XHJcbiAgICAgICAgaWYgKCFyb29tc1tlLnJvb21OYW1lXSkge1xyXG4gICAgICAgICAgICByb29tc1tlLnJvb21OYW1lXSA9IHtcclxuICAgICAgICAgICAgICAgIHVzZXJzOiBbXSxcclxuICAgICAgICAgICAgICAgIHJhY2VJZDogMVxyXG4gICAgICAgICAgICB9XHJcbiAgICAgICAgfVxyXG4gICAgICAgIHNvY2tldC5jdXN0b21EYXRhLnJvb21OYW1lID0gZS5yb29tTmFtZTtcclxuICAgICAgICBzb2NrZXQuY3VzdG9tRGF0YS5wbGF5ZXJOYW1lID0gZS5wbGF5ZXJOYW1lO1xyXG4gICAgICAgIHNvY2tldC5jdXN0b21EYXRhLmJvZHlNYXRlcmlhbEluZGV4ID0gZS5ib2R5TWF0ZXJpYWxJbmRleDtcclxuICAgICAgICBzb2NrZXQuY3VzdG9tRGF0YS5kcml2ZXJNYXRlcmlhbEluZGV4ID0gZS5kcml2ZXJNYXRlcmlhbEluZGV4O1xyXG4gICAgICAgIGNvbnN0IHJvb20gPSByb29tc1tzb2NrZXQuY3VzdG9tRGF0YS5yb29tTmFtZV07XHJcbiAgICAgICAgcm9vbS51c2Vycy5wdXNoKHNvY2tldCk7XHJcbiAgICAgICAgc29ja2V0LmVtaXQoXCJqb2luUm9vbUNvbXBsZXRlXCIsIHsgaWQ6IHNvY2tldC5pZCwgcGluZ01TOiBwaW5nTVMsIHJhY2VJZDogcm9vbS5yYWNlSWQgfSk7XHJcbiAgICB9KVxyXG4gICAgc29ja2V0Lm9uKFwidXBkYXRlS2FydFBvc2VcIiwgKHBvc2UpID0+IHtcclxuICAgICAgICBzb2NrZXQuY3VzdG9tRGF0YS5wb3NpdGlvbi54ID0gcG9zZS5wLng7XHJcbiAgICAgICAgc29ja2V0LmN1c3RvbURhdGEucG9zaXRpb24ueSA9IHBvc2UucC55O1xyXG4gICAgICAgIHNvY2tldC5jdXN0b21EYXRhLnBvc2l0aW9uLnogPSBwb3NlLnAuejtcclxuXHJcbiAgICAgICAgc29ja2V0LmN1c3RvbURhdGEucm90YXRpb25RdWF0ZXJuaW9uLnggPSBwb3NlLnIueDtcclxuICAgICAgICBzb2NrZXQuY3VzdG9tRGF0YS5yb3RhdGlvblF1YXRlcm5pb24ueSA9IHBvc2Uuci55O1xyXG4gICAgICAgIHNvY2tldC5jdXN0b21EYXRhLnJvdGF0aW9uUXVhdGVybmlvbi56ID0gcG9zZS5yLno7XHJcbiAgICAgICAgc29ja2V0LmN1c3RvbURhdGEucm90YXRpb25RdWF0ZXJuaW9uLncgPSBwb3NlLnIudztcclxuXHJcbiAgICAgICAgc29ja2V0LmN1c3RvbURhdGEud2hlZWxzUm90YXRpb25TcGVlZFJhdGlvID0gcG9zZS53O1xyXG4gICAgICAgIHNvY2tldC5jdXN0b21EYXRhLnN0ZWVyaW5nQW5pbWF0aW9uRnJhbWUgPSBwb3NlLnM7XHJcblxyXG4gICAgICAgIHNvY2tldC5jdXN0b21EYXRhLmJvZHlNYXRlcmlhbEluZGV4ID0gcG9zZS5iO1xyXG4gICAgICAgIHNvY2tldC5jdXN0b21EYXRhLmRyaXZlck1hdGVyaWFsSW5kZXggPSBwb3NlLmQ7XHJcbiAgICB9KVxyXG4gICAgc29ja2V0Lm9uKFwiZGlzY29ubmVjdFwiLCAoKSA9PiB7XHJcbiAgICAgICAgaWYgKCFyb29tc1tzb2NrZXQuY3VzdG9tRGF0YS5yb29tTmFtZV0pIHtcclxuICAgICAgICAgICAgcmV0dXJuO1xyXG4gICAgICAgIH1cclxuICAgICAgICB2YXIgaW5kZXggPSByb29tc1tzb2NrZXQuY3VzdG9tRGF0YS5yb29tTmFtZV0udXNlcnMuaW5kZXhPZihzb2NrZXQpXHJcbiAgICAgICAgaWYgKGluZGV4ID09IC0xKSB7XHJcbiAgICAgICAgICAgIHJldHVybjtcclxuICAgICAgICB9XHJcbiAgICAgICAgcm9vbXNbc29ja2V0LmN1c3RvbURhdGEucm9vbU5hbWVdLnVzZXJzLnNwbGljZShpbmRleCwgMSlcclxuICAgICAgICByb29tc1tzb2NrZXQuY3VzdG9tRGF0YS5yb29tTmFtZV0udXNlcnMuZm9yRWFjaCgoczogSVNvY2tldCkgPT4ge1xyXG4gICAgICAgICAgICBzLmVtaXQoXCJ1c2VyRGlzY29ubmVjdGVkXCIsIHNvY2tldC5pZClcclxuICAgICAgICB9KVxyXG4gICAgfSlcclxuICAgIHNvY2tldC5vbihcInJhY2VDb21wbGV0ZVwiLCAoZSkgPT4ge1xyXG4gICAgICAgIGNvbnN0IHJvb20gPSByb29tc1tzb2NrZXQuY3VzdG9tRGF0YS5yb29tTmFtZV07XHJcbiAgICAgICAgaWYgKCFyb29tKSB7XHJcbiAgICAgICAgICAgIHJldHVybjtcclxuICAgICAgICB9XHJcbiAgICAgICAgY29uc29sZS5sb2coZS5yYWNlSWQsIHJvb20ucmFjZUlkKTtcclxuICAgICAgICBpZiAoZS5yYWNlSWQgPT0gcm9vbS5yYWNlSWQpIHtcclxuICAgICAgICAgICAgcm9vbS5yYWNlSWQrKztcclxuICAgICAgICAgICAgcm9vbS51c2Vycy5mb3JFYWNoKChzOiBJU29ja2V0KSA9PiB7XHJcbiAgICAgICAgICAgICAgICBzLmVtaXQoXCJyYWNlQ29tcGxldGVcIiwgeyByYWNlSWQ6IHJvb20ucmFjZUlkLCB3aW5uZXJOYW1lOiBlLm5hbWUgfSlcclxuICAgICAgICAgICAgfSlcclxuXHJcbiAgICAgICAgfVxyXG4gICAgICAgIGNvbnNvbGUubG9nKFwicmFjZSByZXNldFwiKVxyXG4gICAgfSlcclxufSk7XHJcblxyXG4vLyBQaW5nIGxvb3Bcclxuc2V0SW50ZXJ2YWwoKCkgPT4ge1xyXG4gICAgZm9yICh2YXIga2V5IGluIHJvb21zKSB7XHJcbiAgICAgICAgdmFyIHJldCA9IHJvb21zW2tleV0udXNlcnMubWFwKChzOiBJU29ja2V0KSA9PiB7XHJcbiAgICAgICAgICAgIHJldHVybiB7XHJcbiAgICAgICAgICAgICAgICBpZDogcy5pZCxcclxuICAgICAgICAgICAgICAgIG5hbWU6IHMuY3VzdG9tRGF0YS5wbGF5ZXJOYW1lLFxyXG4gICAgICAgICAgICAgICAgcDogcy5jdXN0b21EYXRhLnBvc2l0aW9uLFxyXG4gICAgICAgICAgICAgICAgcjogcy5jdXN0b21EYXRhLnJvdGF0aW9uUXVhdGVybmlvbixcclxuICAgICAgICAgICAgICAgIHc6IHMuY3VzdG9tRGF0YS53aGVlbHNSb3RhdGlvblNwZWVkUmF0aW8sXHJcbiAgICAgICAgICAgICAgICBzOiBzLmN1c3RvbURhdGEuc3RlZXJpbmdBbmltYXRpb25GcmFtZSxcclxuICAgICAgICAgICAgICAgIGI6IHMuY3VzdG9tRGF0YS5ib2R5TWF0ZXJpYWxJbmRleCxcclxuICAgICAgICAgICAgICAgIGQ6IHMuY3VzdG9tRGF0YS5kcml2ZXJNYXRlcmlhbEluZGV4LFxyXG4gICAgICAgICAgICB9XHJcbiAgICAgICAgfSlcclxuICAgICAgICByb29tc1trZXldLnVzZXJzLmZvckVhY2goKHM6IElTb2NrZXQpID0+IHtcclxuICAgICAgICAgICAgcy5lbWl0KFwic2VydmVyVXBkYXRlXCIsIHJldCk7XHJcbiAgICAgICAgfSlcclxuICAgIH1cclxufSwgcGluZ01TKSIsIm1vZHVsZS5leHBvcnRzID0gcmVxdWlyZShcImV4cHJlc3NcIik7IiwibW9kdWxlLmV4cG9ydHMgPSByZXF1aXJlKFwiaHR0cFwiKTsiLCJtb2R1bGUuZXhwb3J0cyA9IHJlcXVpcmUoXCJzb2NrZXQuaW9cIik7Il0sInNvdXJjZVJvb3QiOiIifQ==