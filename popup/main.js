console.log("main.js loaded.");

function reportError(error) {
    console.error(`Error: ${error.message}`);
}

async function create_peer() {
    browser.tabs.query({ active: true, currentWindow: true }).then((tabs) => {
        browser.runtime.sendMessage({
            message: "create_peer",
            tab: tabs[0].id
        }).then((response) => {
            if (response.created) {
                document.getElementById("create_session_button").classList.add("visually-hidden");
                document.getElementById("peer_id").value = response.peer_id;
                document.getElementById("peer_display").classList.remove("visually-hidden");
                document.getElementById("friend_display").classList.remove("visually-hidden");
            }
        })
    })
}

async function connect_peer(id) {
    browser.tabs.query({ active: true, currentWindow: true }).then((tabs) => {
        browser.runtime.sendMessage({
            message: "connect_peer",
            peer_id: id,
            tab: tabs[0].id
        })
    })
}

async function close_peer() {
    browser.tabs.query({ active: true, currentWindow: true }).then((tabs) => {
        browser.runtime.sendMessage({
            message: "close_peer",
            tab: tabs[0].id
        })
    })
}

function listenForClicks() {
    document.addEventListener("click", async function (event) {
        if (event.target.id == "create_session_button") {
            create_peer();
            return;
        }

        if (event.target.id == "connect_button") {
            let friend_id = document.getElementById("friend_id").value;
            if (!friend_id.length) {
                return;
            }
            connect_peer(friend_id);
            return;
        }

        if (event.target.id == "close_button") {
            close_peer();
        }
    })
}

function init() {
    browser.tabs.query({ active: true, currentWindow: true }).then((tabs) => {
        browser.runtime.sendMessage({
            message: "variables",
            tab: tabs[0].id
        }).then((variables) => {
            if (variables.controls) {
                document.getElementById("controls").classList.remove("visually-hidden");
            } else {
                document.getElementById("video_error").classList.remove("visually-hidden")
            }

            if (variables.playing) {
                document.getElementById("play_button").classList.replace("bi-play-fill", "bi-pause-fill");
            }

            if (variables.peer_id) {
                document.getElementById("create_session_button").classList.add("visually-hidden");
                document.getElementById("peer_id").value = variables.peer_id;
                document.getElementById("peer_display").classList.remove("visually-hidden");
                document.getElementById("friend_display").classList.remove("visually-hidden");
            }

            if (variables.init) {
                document.getElementById("friend_display").classList.add("visually-hidden");
                document.getElementById("peer_controls").classList.remove("visually-hidden");
            }
        }).catch((err) => {
            console.log("Error:", err);
            document.getElementById("page_forbidden").classList.remove("visually-hidden");

        })
    })
}

browser.tabs.executeScript({ file: "/content_scripts/content.js" })
    .then(init)
    .then(listenForClicks)
    .catch(reportError);