// ==UserScript==
// @name         Global toggle mic
// @namespace    http://tampermonkey.net/
// @version      0.1
// @description  try to take over the world!
// @author       ViniDalvino
// @match        https://meet.google.com/*
// @grant        none
// @updateURL    https://raw.githubusercontent.com/ViniDalvino/global-google-meet-toggle-mic-and-cam/main/client.js
// ==/UserScript==


(function () {
    console.log("-".repeat(90))
    console.log("Loaded the google meet global hotkey")
    console.log("-".repeat(90))

    let focused = true;

    window.onfocus = function () {
        focused = true;
    };
    window.onblur = function () {
        focused = false;
    };

    let ws = new WebSocket("ws://localhost:8080/", "echo-protocol")
    // set a interval to check if the websocket is connected
    try {

        setInterval(function () {
            if (ws.readyState != WebSocket.CONNECTING)
                ws.send("ping")
        }, 5000)
    }
    catch (e) {
        console.error(`The websocket server is not connected. Launch the websocket server and reload the page to supress this error.`)
    }
    // set a interval to update the status on the document title
    setInterval(function () {
        let micStatus;
        let cameraStatus
        // check the status
        if (document.querySelector('div[role=\"button\"][data-tooltip*=\"CTRL + D\"]').dataset.isMuted == "true")
            micStatus = "🔴"
        else
            micStatus = "🟢";
        if (document.querySelector('div[role=\"button\"][data-tooltip*=\"CTRL + E\"]').dataset.isMuted == "true")
            cameraStatus = "🔴";
        else
            cameraStatus = "🟢";
        // set the title
        let new_title = `🎥: ${cameraStatus} | 🎙: ${micStatus} `
        document.title = new_title;
    }, 500)
    //
    window.toggle_cam = function () {
        window._googleMeetMuteEl = document.querySelector('div[role=\"button\"][data-tooltip*=\"CTRL + E\"]').click()
    }

    window.toggle_mic = function () {
        window._googleMeetMuteEl = document.querySelector('div[role=\"button\"][data-tooltip*=\"CTRL + D\"]').click()
    }

    ws.onmessage = function (event) {
        if (!focused) {
            switch (event.data) {
                case "TOGGLE_MIC":
                    window.toggle_mic()
                    break;
                case "TOGGLE_CAM":
                    window.toggle_cam()
                    break;
                default:
                    break;
            }
        }
    }
})()