# Befriend App (Frontend)

The best human experience designed for meeting new and existing friends in person.

- [Vision](#vision)
- [Videos](#videos)
- [Features](#features)
  - [Core](#core)
  - [Connection & Matching](#connection--matching)
  - [20+ Filters](#20-filters)
  - [Profile](#profile)
  - [Safety & Trust](#safety--trust)
  - [Networks](#networks)
- [Installation](#installation)
    - [Prerequisites](#prerequisites)
    - [Setup](#setup)
    - [Dev Server](#dev-server)
    - [Building](#building) 
- [Filters](#filters)
- [Support Us](#support-us)

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
- Intelligent bi-directional filters

### Connection & Matching
- Friend selection
    - New
    - Existing
    - 1 to 10 person(s) per activity
- Modes
    - Solo, Partner, and Kids
- Smart matching algorithm
    - Send/receive notifications based on person-to-person matching scores derived from filters and me data

### 20+ filters
- Bi-directional (i.e. female user with female gender filter will only receive/send notifications from/to female users)
- Binary filters (i.e. gender, age, distance)
- Interests filters (i.e. TV shows, sports, music, movies)
- Real-time send/receive counts
- Independent send/receive option

### Profile
- Add data about yourself across 15 categories to find better matches

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
- Meet users on 3rd-party networks
  - i.e. Nextdoor, Meetup, and Hinge users could meet each other in person
- Cross-network notifications
- Network verification

## Installation
### Prerequisites

Ensure you have the following installed on your machine:

-   [Node.js](https://nodejs.org/)
-   [Xcode](https://apps.apple.com/us/app/xcode/id497799835?mt=12)
-   [Android Studio](https://developer.android.com/studio)

### Setup

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

### Dev Server

Run this script to run the app locally. This script also watches for file changes and updates the compiled JS/CSS on change.

`node scripts/dev/serve.js`

### Building

#### iOS and Android

`node scripts/build/device.js`

#### Development

```
node scripts/build/device.js --dev

# custom dev host:port
node scripts/build/device.js --dev http://192.168.1.1:3001

# custom api host:port
node scripts/build/device.js --api http://192.168.1.1:4000

# custom ws host:port
node scripts/build/device.js --ws ws://192.168.1.1:8080
```

#### iOS only

`node scripts/build/device.js --ios`

#### Android only

`node scripts/build/device.js --android`


### Filters

| Availability | Activity Types | Modes | Networks |
|:---:|:---:|:---:|:---:|
| ![Availability](https://befriend.s3.amazonaws.com/preview/filters/availability.png) | ![Activity Types](https://befriend.s3.amazonaws.com/preview/filters/activity-types.png) | ![Modes](https://befriend.s3.amazonaws.com/preview/filters/modes.png) | ![Networks](https://befriend.s3.amazonaws.com/preview/filters/networks.png) |

| Reviews | Distance | Age | Genders |
|:---:|:---:|:---:|:---:|
| ![Reviews](https://befriend.s3.amazonaws.com/preview/filters/reviews.png) | ![Distance](https://befriend.s3.amazonaws.com/preview/filters/distance.png) | ![Age](https://befriend.s3.amazonaws.com/preview/filters/age.png) | ![Genders](https://befriend.s3.amazonaws.com/preview/filters/genders.png) |

| Movies | TV Shows | Sports | Music |
|:---:|:---:|:---:|:---:|
| ![Movies](https://befriend.s3.amazonaws.com/preview/filters/movies.png) | ![TV Shows](https://befriend.s3.amazonaws.com/preview/filters/tv-shows.png) | ![Sports](https://befriend.s3.amazonaws.com/preview/filters/sports.png) | ![Music](https://befriend.s3.amazonaws.com/preview/filters/music.png) |

| Instruments | Schools | Work | Life Stages |
|:---:|:---:|:---:|:---:|
| ![Instruments](https://befriend.s3.amazonaws.com/preview/filters/instruments.png) | ![Schools](https://befriend.s3.amazonaws.com/preview/filters/schools.png) | ![Work](https://befriend.s3.amazonaws.com/preview/filters/work.png) | ![Life Stages](https://befriend.s3.amazonaws.com/preview/filters/life-stages.png) |

| Relationships | Languages | Politics | Religions |
|:---:|:---:|:---:|:---:|
| ![Relationships](https://befriend.s3.amazonaws.com/preview/filters/relationships.png) | ![Languages](https://befriend.s3.amazonaws.com/preview/filters/languages.png) | ![Politics](https://befriend.s3.amazonaws.com/preview/filters/politics.png) | ![Religions](https://befriend.s3.amazonaws.com/preview/filters/religions.png) |

| Drinking | Smoking | 
|:---:|:---:|
| ![Drinking](https://befriend.s3.amazonaws.com/preview/filters/drinking.png) | ![Smoking](https://befriend.s3.amazonaws.com/preview/filters/smoking.png) |

## Support Us

### Users
1. **Sign Up** - Go to [befriend.app](https://befriend.app)
2. **Spread the Word** - Ask friends, family, and social media followers to sign up

### Developers
3. **Run Own Network** - Join the Befriend network and bring real-time in-person friends to your area or community with your own brand name and logo
4. **Contribute Code** - Clone our repositories, submit pull requests, implement new features, and fix bugs
5. **Report Issues** - Help us improve by reporting bugs and suggesting features

### Sponsors
6. **Become a Sponsor** - Email us at [sponsor@befriend.app](mailto:sponsor@befriend.app)

### Purchase a custom t-shirt
7. Create an amazing custom t-shirt at [genaiwear.com](https://genaiwear.com)
