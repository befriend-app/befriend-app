## Getting Started

### Prerequisites

Ensure you have the following installed on your machine:

- [Node.js](https://nodejs.org/)


### Installation

1. **Clone repository**

```
git clone https://github.com/befriend-app/befriend-app
cd befriend-app
```

2. **Install Cordova**

`npm install -g cordova`

3. **Install Packages**

`npm install`


4. **Add platforms**
```
cordova platform add ios
cordova platform add android
```

5. **iOS**

```
node scripts/install/ios.js
```

6. **Android**

    ##### Todo

### Plugins

```
cordova plugin add cordova-plugin-local-notification
```

## Building

### iOS and Android
`
node scripts/build/device.js
`

### Development

```
node scripts/build/device.js --dev

# custom dev host:port
node scripts/build/device.js --dev http://192.168.1.1:3001
```

### iOS only

`node scripts/build/device.js --ios`

### Android only

`node scripts/build/device.js --android`

## Serve Development

`node scripts/dev/serve.js`



