# Befriend App (Frontend)

The best human experience designed for meeting new and existing friends in person.

- [Vision](#vision)
- [Videos](#videos)
- [Features](#features)
- [Install](#installation)
- [Development Setup](#development-setup)
    - [Prerequisites](#prerequisites)
    - [Setting up the project](#setting-up-the-project)
    - [Running the app](#running-the-app)
- [Roadmap](#roadmap)

## Vision

For over 2 decades, billions of humans have continued to grow farther apart as technology companies have created a superficial world that optimizes for time spent in-app, number of ads served, and subscription revenue.

Befriend is re-imagining how life on Earth can be, where loneliness and social isolation are no longer programmed into our way of being through a lack of choice in how we choose to spend our time: in-person or online.

Incorporated as a non-profit in December 2024, Befriend is developing an open-source global network of in-person networks to solve this multi-decade problem together.

This project's aim is to increase the consciousness of happiness on Earth while contributing to increased quality of life, better health, and more meaningful lives filled with friendship and laughter every day of every year.

## Videos

## Real-time Activities

https://github.com/user-attachments/assets/1bf1a0dd-eeb8-4898-93ab-f85ff2733639

## Partner and Family Mode

https://github.com/user-attachments/assets/c0b99db2-396b-49e4-b824-122ab373497e


---


### Prerequisites

Ensure you have the following installed on your machine:

-   [Node.js](https://nodejs.org/)
-   [Xcode](https://apps.apple.com/us/app/xcode/id497799835?mt=12)
-   [Android Studio](https://developer.android.com/studio)

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

## Building

### iOS and Android

`node scripts/build/device.js`

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
