(function () {
    if (window.hasRun) {
        return;
    }
    window.hasRun = true;

    var video = false;
    var play_ignore = false;
    var pause_ignore = false;
    var seeked_ignore = false;

    function play_listener() {
        if (play_ignore) {
            play_ignore = false
            return
        }
        browser.runtime.sendMessage({
            message: "play"
        })
    }

    function pause_listener() {
        if (pause_ignore) {
            pause_ignore = false
            return
        }
        browser.runtime.sendMessage({
            message: "pause"
        })
    }

    function seeked_listener() {
        if (seeked_ignore) {
            seeked_ignore = false
            return
        }
        console.log("Sending seek event:", video.currentTime);
        browser.runtime.sendMessage({
            message: "seek",
            currentTime: video.currentTime
        })
    }

    function get_videos() {
        let videos = document.querySelectorAll("video");
        if (!videos.length) {
            browser.runtime.sendMessage({
                message: "video not found"
            })
            return
        }

        video = videos[0];
        browser.runtime.sendMessage({
            message: "video found"
        })

        video.addEventListener("play", play_listener)
        video.addEventListener("pause", pause_listener)
        video.addEventListener("seeked", seeked_listener)
    }

    // onMounted

    get_videos()

    browser.runtime.onMessage.addListener(async function (message) {
        console.log("Message in content.js!", message);

        if (message.command === "play") {
            play_ignore = true;
            video.play()
        }

        if (message.command === "pause") {
            pause_ignore = true;
            video.pause()
        }

        if (message.command === "seek") {
            seeked_ignore = true;
            video.currentTime = message.currentTime;
        }
    });

})();