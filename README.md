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


3. **Add platforms**
```
cordova platform add ios
cordova platform add android
```

4. **iOS**

```
node scripts/install/ios.js
```

5. **Android**

    ##### Todo

### Plugins

```
cordova plugin add cordova-plugin-local-notification
```

## Building

### iOS and Android
`
node scripts/build/build.js
`

### Development

```
node scripts/build/build.js --dev

# custom dev host:port
node scripts/build/build.js --dev http://192.168.1.1:3001
```

### iOS only

`node scripts/build/build.js --ios`

### Android only

`node scripts/build/build.js --android`

## Serve Development

`node scripts/dev/dev.js`



