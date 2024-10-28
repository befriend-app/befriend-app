#import <Cordova/CDVViewController.h>
#import <Cordova/CDVAppDelegate.h>
#import <UserNotifications/UserNotifications.h>

@class MainViewController;

@interface AppDelegate : CDVAppDelegate <UNUserNotificationCenterDelegate>

@property (nonatomic, strong) UIWindow* window;
@property (nonatomic, strong) MainViewController* viewController;
@property (nonatomic, assign) BOOL startPushNotification;

@end