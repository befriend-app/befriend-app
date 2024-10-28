#import <Cordova/CDV.h>
#import <UserNotifications/UserNotifications.h>

@interface Notifications : CDVPlugin <UNUserNotificationCenterDelegate>

@property (nonatomic, strong) NSString* tokenCallbackId;
@property (nonatomic, strong) NSString* notificationCallbackId;
@property (nonatomic, strong) NSString* launchNotificationCallbackId;
@property (nonatomic, strong) NSDictionary* launchNotification;

- (void)getToken:(CDVInvokedUrlCommand*)command;
- (void)registerForPushNotifications:(CDVInvokedUrlCommand*)command;
- (void)onNotificationReceived:(CDVInvokedUrlCommand*)command;
- (void)onLaunchNotification:(CDVInvokedUrlCommand*)command;

@end