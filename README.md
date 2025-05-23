# Befriend App (Frontend)

The best human experience designed for meeting new and existing friends in person.

- [Vision](#vision)
- [Videos](#videos)
- [Features](#features)
  - [Core](#core)
  - [Connection & Matching](#connection--matching)
  - [Profile](#profile)
  - [Filters](#filters)
  - [Safety & Trust](#safety--trust)
  - [Networks](#networks)
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

### Real-time Activities

Invite one or more person(s) to meet for one of nearly 300 activity categories.

https://github.com/user-attachments/assets/1bf1a0dd-eeb8-4898-93ab-f85ff2733639

### Solo, Partner, and Family Mode

Designed for everybody: 

- Couples can meet one or more couples in real-time. 
- Families with kids can meet one or more families with similar-aged kids. 

https://github.com/user-attachments/assets/01ef0089-b464-4a3e-bfb1-a984487ba91c

---

## Features

### Core
- Real-time notifications
- Multi-network communication
- Nearly 300 activity types
    - Activity types mapped to places
- Flexible scheduling
    - Now, in 30 mins, in 2 hours
    - Schedule activities in advance
- 20+ Filters

### Connection & Matching
- Friend selection
    - New
    - Existing
    - 1 to 10 person(s) per activity
- Modes
    - Solo, Partner, and Kids
- Smart matching algorithm
    - Send/receive notifications based on person-to-person score derived from filters and me data
- 20+ filters with bi-directional consent
    - Binary filters (i.e. gender, age, distance)
    - Matching filters (i.e. TV shows, sports, music)
    - Real-time send/receive counts
    - Independent send/receive option

### Profile
- Add data about yourself across 15 categories to find better matches

### Filters

![availability](https://github.com/user-attachments/assets/2a9b7050-282a-4d16-81df-a5117db3dc74)
![activity-types](https://github.com/user-attachments/assets/0f7b2f8c-cc5c-4754-b8c8-475d98a6a169)
![modes](https://github.com/user-attachments/assets/b39c28b5-395a-4c9d-a0bb-149de7646fb4)
![networks](https://github.com/user-attachments/assets/2dcc28e8-7173-4c74-9700-f7c15d3c56ef)
![reviews](https://github.com/user-attachments/assets/59e90e70-581f-46f6-8c14-1c77fca1afe9)
![verifications](https://github.com/user-attachments/assets/67d0b259-4480-4285-9f90-ab1d39bb1a11)
![distance](https://github.com/user-attachments/assets/986bf10e-d485-40a0-b58b-04f853804b78)
![age](https://github.com/user-attachments/assets/213e1a0e-3950-47ac-8baf-aeed6a5720d6)
![genders](https://github.com/user-attachments/assets/a9da534d-6ed7-4150-aba6-a565ff8c11fb)
![movies](https://github.com/user-attachments/assets/4476574e-f0db-4739-905e-f36bea8113fa)
![tv-shows](https://github.com/user-attachments/assets/222f5418-c475-4946-8ec6-d89ab1b254e9)
![sports](https://github.com/user-attachments/assets/691afb25-058a-4f0e-b519-4e5612df77f8)
![music](https://github.com/user-attachments/assets/07b13d8c-6118-476d-ac70-749f97f9816b)
![instruments](https://github.com/user-attachments/assets/2ec019c6-9cb4-4485-8353-1bc7ce86c3eb)
![schools](https://github.com/user-attachments/assets/b777ce75-ab3b-431a-a0b2-a347b22b6e37)
![work](https://github.com/user-attachments/assets/c9e1c600-24b2-4883-9ab8-7048f172803d)
![life-stages](https://github.com/user-attachments/assets/d16db38c-db37-4b89-8fc2-5d048496ab0e)
![relationships](https://github.com/user-attachments/assets/67fdff26-d9c6-44f1-804f-1da96bd7f792)
![languages](https://github.com/user-attachments/assets/70d61f94-239e-42bb-ac3a-f3a6fd1ce580)
![politics](https://github.com/user-attachments/assets/8cb46cb5-b1a0-4669-92c3-9a4866862184)
![religions](https://github.com/user-attachments/assets/b6f41749-a92b-4681-ae13-a392f5498c62)
![drinking](https://github.com/user-attachments/assets/bfe6d544-42d8-4a23-87ca-d5fa5684c2c2)
![smoking](https://github.com/user-attachments/assets/e55445c3-130b-48f3-abad-f2ec69077ec1)


### Safety & Trust
- Bi-directional filters
- Verification system
    - In-person verification
    - LinkedIn verification
- Review system
    - Give/receive reviews after activities
    - Filter notifications based on review type and score
    - Review categories: Safety, Trust, Timeliness, Friendliness, Fun

### Networks
- Cross-network communication
- Network verification

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
