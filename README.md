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

<div style="display: flex; overflow-x: auto; gap: 10px; padding: 10px 0;">
  <img src="https://befriend.s3.amazonaws.com/preview/filters/availability.png" alt="Description 1" style="height: 200px; flex-shrink: 0;">
<img src="https://befriend.s3.amazonaws.com/preview/filters/availability.png" alt="Description 1" style="height: 200px; flex-shrink: 0;">
<img src="https://befriend.s3.amazonaws.com/preview/filters/availability.png" alt="Description 1" style="height: 200px; flex-shrink: 0;">
<img src="https://befriend.s3.amazonaws.com/preview/filters/availability.png" alt="Description 1" style="height: 200px; flex-shrink: 0;">
<img src="https://befriend.s3.amazonaws.com/preview/filters/availability.png" alt="Description 1" style="height: 200px; flex-shrink: 0;">
<img src="https://befriend.s3.amazonaws.com/preview/filters/availability.png" alt="Description 1" style="height: 200px; flex-shrink: 0;">
<img src="https://befriend.s3.amazonaws.com/preview/filters/availability.png" alt="Description 1" style="height: 200px; flex-shrink: 0;">
</div>

<table>
  <tr>
    <td>
      <img src="https://befriend.s3.amazonaws.com/preview/filters/availability.png" width="300">
    </td>
    <td>
      <img src="https://befriend.s3.amazonaws.com/preview/filters/availability.png" width="300">
    </td>
    <td>
      <img src="https://befriend.s3.amazonaws.com/preview/filters/availability.png" width="300">
    </td>
    <td>
      <img src="https://befriend.s3.amazonaws.com/preview/filters/availability.png" width="300">
    </td>
    <td>
      <img src="https://befriend.s3.amazonaws.com/preview/filters/availability.png" width="300">
    </td>
    <td>
      <img src="https://befriend.s3.amazonaws.com/preview/filters/availability.png" width="300">
    </td>
 <td>
      <img src="https://befriend.s3.amazonaws.com/preview/filters/availability.png" width="300">
    </td>
    <td>
      <img src="https://befriend.s3.amazonaws.com/preview/filters/availability.png" width="300">
    </td>
    <td>
      <img src="https://befriend.s3.amazonaws.com/preview/filters/availability.png" width="300">
    </td>
  </tr>
</table>

<div style="display: flex; overflow-x: auto; gap: 10px; padding: 10px 0;">
     <img src="https://befriend.s3.amazonaws.com/preview/filters/availability.png" style="height: 400px; flex-shrink: 0;">
    <img src="https://befriend.s3.amazonaws.com/preview/filters/activity-types.png" style="height: 400px; flex-shrink: 0;">
    <img src="https://befriend.s3.amazonaws.com/preview/filters/modes.png" style="height: 400px; flex-shrink: 0;">
    <img src="https://befriend.s3.amazonaws.com/preview/filters/networks.png" style="height: 400px; flex-shrink: 0;">
    <img src="https://befriend.s3.amazonaws.com/preview/filters/reviews.png" style="height: 400px; flex-shrink: 0;">
    <img src="https://befriend.s3.amazonaws.com/preview/filters/distance.png" style="height: 400px; flex-shrink: 0;">
    <img src="https://befriend.s3.amazonaws.com/preview/filters/age.png" style="height: 400px; flex-shrink: 0;">
</div>

<div class="test" style="flex-wrap: nowrap; display: flex; overflow-x: scroll">
    <img src="https://befriend.s3.amazonaws.com/preview/filters/availability.png" width="150">
    <img src="https://befriend.s3.amazonaws.com/preview/filters/activity-types.png" width="150">
    <img src="https://befriend.s3.amazonaws.com/preview/filters/modes.png" width="150">
    <img src="https://befriend.s3.amazonaws.com/preview/filters/networks.png" width="150">
    <img src="https://befriend.s3.amazonaws.com/preview/filters/reviews.png" width="150">
    <img src="https://befriend.s3.amazonaws.com/preview/filters/distance.png" width="150">
    <img src="https://befriend.s3.amazonaws.com/preview/filters/age.png" width="150">
    <img src="https://befriend.s3.amazonaws.com/preview/filters/genders.png" width="150">
    <img src="https://befriend.s3.amazonaws.com/preview/filters/movies.png" width="150">
    <img src="https://befriend.s3.amazonaws.com/preview/filters/tv-shows.png" width="150">
    <img src="https://befriend.s3.amazonaws.com/preview/filters/sports.png" width="150">
    <img src="https://befriend.s3.amazonaws.com/preview/filters/music.png" width="150">
    <img src="https://befriend.s3.amazonaws.com/preview/filters/instruments.png" width="150">
    <img src="https://befriend.s3.amazonaws.com/preview/filters/schools.png" width="150">
    <img src="https://befriend.s3.amazonaws.com/preview/filters/work.png" width="150">
    <img src="https://befriend.s3.amazonaws.com/preview/filters/life-stages.png" width="150">
    <img src="https://befriend.s3.amazonaws.com/preview/filters/relationships.png" width="150">
    <img src="https://befriend.s3.amazonaws.com/preview/filters/languages.png" width="150">
    <img src="https://befriend.s3.amazonaws.com/preview/filters/politics.png" width="150">
    <img src="https://befriend.s3.amazonaws.com/preview/filters/religions.png" width="150">
    <img src="https://befriend.s3.amazonaws.com/preview/filters/drinking.png" width="150">
    <img src="https://befriend.s3.amazonaws.com/preview/filters/smoking.png" width="150">
</div>




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
