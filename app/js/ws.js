befriend.ws = {
    client: null,
    connectionTry: 0,
    autoReconnectInterval: 5000,
    reconnect_ip: false,
    forceClose: function() {
        if(befriend.ws.client) {
            befriend.ws.client.instance.close(true);
        }
    },
    init: function () {
        function reconnect() {
            // console.log("Reconnect ws");

            if(befriend.ws.reconnect_ip) {
                return;
            }

            befriend.ws.reconnect_ip = true;

            befriend.ws.connectionTry++;

            let reconnect_ms = befriend.ws.autoReconnectInterval * befriend.ws.connectionTry;

            // console.log(`WebSocketClient: retry in ${reconnect_ms}ms`);

            setTimeout(function(){
                befriend.ws.reconnect_ip = false;

                if(befriend.ws.client && befriend.ws.client.readyState === WebSocket.OPEN) {
                    return;
                }

                // console.log("WebSocketClient: reconnecting...");

                befriend.ws.init();
            }, reconnect_ms);
        }

        //on reconnect
        if(befriend.ws.client) {
            if(befriend.ws.client.readyState === WebSocket.OPEN) {
                return;
            }

            befriend.ws.client = null;
        }

        console.log("Connecting WS");

        let ws_url = `${ws_domain}/?login_token=${befriend.user.login.token}&person_token=${befriend.user.person.token}`;

        try {
            befriend.ws.client = new WebSocket(ws_url);
        } catch(e) {
            return;
        }

        befriend.ws.client.onopen = function () {
            console.log('connection open');
            befriend.ws.connectionTry = 0;
        }

        befriend.ws.client.onmessage = function(data, flags){
            console.log("on message");

            if(Number.parseInt(data) === 401 || Number.parseInt(data.data) === 401) {
                befriend.ws.forceClose();
            } else {
                try {
                    let parsed = JSON.parse(data.data);

                    befriend.processWS(parsed);
                } catch (e) {
                    console.error(e);
                }
            }
        }

        befriend.ws.client.onerror = function (e) {
            reconnect();
        }

        befriend.ws.client.onclose = function (e, b) {
            reconnect(e);
        }
    }
};