// background.js

console.log("background.js loaded.");

let peerjs = {}
let variables = {}

function handleConn(tab) {
    peerjs[tab].conn.on("data", async function (data) {
        browser.tabs.sendMessage(tab, {
            obj: data,
        })
    })
}


function handleMessage(request, sender, sendResponse) {
    console.log(request);

    if (request.message == "play") {
        variables[sender.tab.id]["playing"] = true;
        if (variables[sender.tab.id].init) {
            peerjs[sender.tab.id].conn.send({
                type: "play"
            })
        }
        return;
    }

    if (request.message == "pause") {
        variables[sender.tab.id]["playing"] = false;
        if (variables[sender.tab.id].init) {
            peerjs[sender.tab.id].conn.send({
                type: "pause"
            })
        }
        return;
    }

    if (request.message == "seek") {
        if (variables[sender.tab.id].init) {
            peerjs[sender.tab.id].conn.send({
                type: "seek",
                value: request.currentTime
            })
        }
        return;
    }

    if (request.message == "video found") {
        variables[sender.tab.id] = { "controls": true };
        return
    }

    if (request.message == "video not found") {
        variables[sender.tab.id] = { "controls": false };
        return
    }

    if (request.message == "variables") {
        console.log(variables[request.tab])
        sendResponse(variables[request.tab])
        return
    }

    if (request.message == "create_peer") {
        let peer_id = crypto.randomUUID();
        let peer = new Peer([peer_id]);
        let conn = null;

        variables[request.tab]["peer_id"] = peer_id;
        peerjs[request.tab] = {
            "peer": peer,
            "conn": conn,
        }

        peerjs[request.tab].peer.on("connection", (connection) => {
            peerjs[request.tab].conn = connection
            variables[request.tab].init = true
            handleConn(request.tab)
        })

        sendResponse({
            "created": true,
            "peer_id": peer_id
        })
        return;
    }

    if (request.message == "connect_peer") {
        peerjs[request.tab].conn = peerjs[request.tab].peer.connect(request.peer_id)
        peerjs[request.tab].conn.on("open", () => {
            variables[request.tab].init = true
            handleConn(request.tab)
        });
    }
}

browser.runtime.onMessage.addListener(handleMessage);