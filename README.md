## Getting Started

### Prerequisites

Ensure you have the following installed on your machine:

- [Node.js](https://nodejs.org/)
- [Xcode](https://apps.apple.com/us/app/xcode/id497799835?mt=12)
- [Android Studio](https://developer.android.com/studio)


### Installation

1. **Clone repository**

```
    git clone https://github.com/befriend-app/befriend-app
    cd befriend-app
```

2. **Install packages**

```
    npm install -g cordova
    npm install cordova-icon -g
    npm install
```

3. **Add platforms**
```
    cordova platform add ios@7
    cordova platform add android@12
```

4. **iOS**

```
    node scripts/install/ios.js
```

5. **Android**

```
    node scripts/install/android.js
```

### Plugins

```
    cordova plugin add https://github.com/katzer/cordova-plugin-local-notifications
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

## Dev Server

`node scripts/dev/serve.js`


## Formatting and Linting

### Formatting

`npm run format`

- Read more about the configuration file [here](https://prettier.io/docs/en/configuration.html)
- Read more about the options that can be used [here](https://prettier.io/docs/en/options)

### Linting

`npm run lint`

Read more about configuration [here](https://eslint.org/docs/latest/use/configure/)