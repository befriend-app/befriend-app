befriend.ws = {
    client: null,
    connectionTry: 0,
    autoReconnectInterval: 5000,
    reconnectInProgress: false,
    authenticationFailed: false,
    reconnectTimeout: null,
    forceClose: function () {
        if (befriend.ws.client) {
            befriend.ws.authenticationFailed = true; // Prevent reconnection attempts
            befriend.ws.client.close(1000, 'Authentication failed');
            befriend.ws.client = null;
            befriend.ws.connectionTry = 0;
        }
    },
    reconnect: function () {
        // Don't reconnect if authentication failed
        if (befriend.ws.authenticationFailed || befriend.ws.reconnectInProgress) {
            return;
        }

        befriend.ws.reconnectInProgress = true;
        befriend.ws.connectionTry++;

        const reconnectDelay = befriend.ws.autoReconnectInterval * befriend.ws.connectionTry;

        befriend.ws.reconnectTimeout = setTimeout(() => {
            befriend.ws.reconnectInProgress = false;

            if (befriend.ws.client?.readyState === WebSocket.OPEN) {
                return;
            }

            console.log(
                `Reconnect attempt: ${befriend.ws.connectionTry}`,
            );
            befriend.ws.init();
        }, reconnectDelay);
    },

    init: function () {
        //tmp unused
        return;
        // Reset state if previously set
        befriend.ws.authenticationFailed = false;
        befriend.ws.connectionTry = 0;
        befriend.ws.reconnectInProgress = false;

        if (befriend.ws.reconnectTimeout) {
            clearTimeout(befriend.ws.reconnectTimeout);
        }

        // Close existing connection if any
        if (befriend.ws.client) {
            if (befriend.ws.isConnected()) {
                return;
            }

            befriend.ws.client = null;
        }

        const wsUrl = `${ws_domain}/?login_token=${befriend.user.login.token}&person_token=${befriend.user.person.token}`;

        try {
            befriend.ws.client = new WebSocket(wsUrl);
            befriend.ws.setupEventHandlers();
        } catch (error) {
            console.error('Failed to create WebSocket connection:', error);
            befriend.ws.reconnect();
        }
    },

    setupEventHandlers: function () {
        if (!befriend.ws.client) return;

        befriend.ws.client.onopen = () => {
            console.log('WebSocket connection established');
            befriend.ws.connectionTry = 0;
            befriend.ws.authenticationFailed = false;
        };

        befriend.ws.client.onmessage = (event) => {
            try {
                // Handle 401 authentication error
                const data = event.data;
                if (data === '401' || Number.parseInt(data) === 401) {
                    console.log('Authentication failed (401)');
                    befriend.ws.forceClose("Unauthenticated");
                    return;
                }

                // Parse and process normal messages
                const parsedData = JSON.parse(data);
                befriend.processWS(parsedData);
            } catch (error) {
                console.error('Error processing message:', error);
            }
        };

        befriend.ws.client.onerror = (error) => {
            console.error('WebSocket error:', error);
            if (!befriend.ws.authenticationFailed) {
                befriend.ws.reconnect();
            }
        };

        befriend.ws.client.onclose = (event) => {
            console.log(`WebSocket closed`);

            if (!befriend.ws.authenticationFailed) {
                befriend.ws.reconnect();
            }
        };
    },

    isConnected: function () {
        return befriend.ws.client?.readyState === WebSocket.OPEN;
    },
};
