#import "Notifications.h"

@interface Notifications () <UNUserNotificationCenterDelegate>
@end

@implementation Notifications

- (void)pluginInitialize {
    NSLog(@"Notifications: initialized");

    // Set notification center delegate
    UNUserNotificationCenter *center = [UNUserNotificationCenter currentNotificationCenter];
    center.delegate = self;

    // Add observer for when app becomes active
    [[NSNotificationCenter defaultCenter] addObserver:self
                                           selector:@selector(handleAppBecameActive:)
                                               name:UIApplicationDidBecomeActiveNotification
                                             object:nil];

    // Register for notifications
    [[NSNotificationCenter defaultCenter] addObserver:self
                                           selector:@selector(didRegisterForRemoteNotificationsWithDeviceToken:)
                                               name:@"CDVRemoteNotification"
                                             object:nil];

    [[NSNotificationCenter defaultCenter] addObserver:self
                                           selector:@selector(didFailToRegisterForRemoteNotifications:)
                                               name:@"CDVRemoteNotificationError"
                                             object:nil];

    [[NSNotificationCenter defaultCenter] addObserver:self
                                           selector:@selector(didReceiveRemoteNotification:)
                                               name:@"CDVRemoteNotificationReceived"
                                             object:nil];

    [[NSNotificationCenter defaultCenter] addObserver:self
                                           selector:@selector(notificationClicked:)
                                               name:@"NotificationClicked"
                                             object:nil];

    [[NSNotificationCenter defaultCenter] addObserver:self
                                           selector:@selector(appLaunchedFromNotification:)
                                               name:@"AppLaunchedFromNotification"
                                             object:nil];

    // Check for stored launch notification
    NSDictionary* notification = [[NSUserDefaults standardUserDefaults] objectForKey:@"launchNotification"];
    if (notification) {
        self.launchNotification = notification;
        [[NSUserDefaults standardUserDefaults] removeObjectForKey:@"launchNotification"];
        [[NSUserDefaults standardUserDefaults] synchronize];
    }

    // Clear badge number when app starts
    [self clearBadgeNumber];
}

// New method to clear badge number
- (void)clearBadgeNumber {
    dispatch_async(dispatch_get_main_queue(), ^{
        [[UIApplication sharedApplication] setApplicationIconBadgeNumber:0];
    });
}

// Handle app becoming active
- (void)handleAppBecameActive:(NSNotification *)notification {
    [self clearBadgeNumber];
}

// Add new method to set badge number
- (void)setBadgeNumber:(CDVInvokedUrlCommand*)command {
    NSNumber* number = [command.arguments objectAtIndex:0];

    dispatch_async(dispatch_get_main_queue(), ^{
        [[UIApplication sharedApplication] setApplicationIconBadgeNumber:[number integerValue]];

        CDVPluginResult* pluginResult = [CDVPluginResult resultWithStatus:CDVCommandStatus_OK];
        [self.commandDelegate sendPluginResult:pluginResult callbackId:command.callbackId];
    });
}

#pragma mark - UNUserNotificationCenterDelegate Methods

// Handle foreground notifications
- (void)userNotificationCenter:(UNUserNotificationCenter *)center
       willPresentNotification:(UNNotification *)notification
         withCompletionHandler:(void (^)(UNNotificationPresentationOptions options))completionHandler {

    // Create notification dictionary
    NSDictionary *userInfo = notification.request.content.userInfo;

    // Process the notification
    [self didReceiveRemoteNotification:[NSNotification notificationWithName:@"CDVRemoteNotificationReceived"
                                                                   object:nil
                                                                 userInfo:userInfo]];

    // Don't show system notification in foreground, just process the data
    completionHandler(UNNotificationPresentationOptionNone);
}

// Handle notification response when user taps notification
- (void)userNotificationCenter:(UNUserNotificationCenter *)center
didReceiveNotificationResponse:(UNNotificationResponse *)response
         withCompletionHandler:(void (^)(void))completionHandler {

    NSDictionary *userInfo = response.notification.request.content.userInfo;

    // Clear badge when notification is opened
    [self clearBadgeNumber];

    // Handle notification click
    [self notificationClicked:[NSNotification notificationWithName:@"NotificationClicked"
                                                          object:nil
                                                        userInfo:userInfo]];

    completionHandler();
}

- (void)getToken:(CDVInvokedUrlCommand*)command {
    NSString* token = [[NSUserDefaults standardUserDefaults] objectForKey:@"pushToken"];

    if (token) {
        CDVPluginResult* pluginResult = [CDVPluginResult resultWithStatus:CDVCommandStatus_OK
                                                        messageAsString:token];
        [self.commandDelegate sendPluginResult:pluginResult callbackId:command.callbackId];
    } else {
        self.tokenCallbackId = command.callbackId;
        [[UIApplication sharedApplication] registerForRemoteNotifications];
    }
}

- (void)registerForPushNotifications:(CDVInvokedUrlCommand*)command {
    self.tokenCallbackId = command.callbackId;

    UNUserNotificationCenter *center = [UNUserNotificationCenter currentNotificationCenter];
    center.delegate = self;

    [center requestAuthorizationWithOptions:(UNAuthorizationOptionSound |
                                           UNAuthorizationOptionAlert |
                                           UNAuthorizationOptionBadge)
                        completionHandler:^(BOOL granted, NSError * _Nullable error) {
        if (error) {
            CDVPluginResult* pluginResult = [CDVPluginResult resultWithStatus:CDVCommandStatus_ERROR
                                                            messageAsString:[error localizedDescription]];
            [self.commandDelegate sendPluginResult:pluginResult callbackId:command.callbackId];
            return;
        }

        if (granted) {
            dispatch_async(dispatch_get_main_queue(), ^{
                [[UIApplication sharedApplication] registerForRemoteNotifications];
            });
        } else {
            CDVPluginResult* pluginResult = [CDVPluginResult resultWithStatus:CDVCommandStatus_ERROR
                                                            messageAsString:@"Permission denied"];
            [self.commandDelegate sendPluginResult:pluginResult callbackId:command.callbackId];
        }
    }];
}

- (void)onNotificationReceived:(CDVInvokedUrlCommand*)command {
    self.notificationCallbackId = command.callbackId;

    CDVPluginResult* pluginResult = [CDVPluginResult resultWithStatus:CDVCommandStatus_NO_RESULT];
    [pluginResult setKeepCallbackAsBool:YES];
    [self.commandDelegate sendPluginResult:pluginResult callbackId:command.callbackId];
}

- (void)onLaunchNotification:(CDVInvokedUrlCommand*)command {
    self.launchNotificationCallbackId = command.callbackId;

    if (self.launchNotification) {
        CDVPluginResult* pluginResult = [CDVPluginResult resultWithStatus:CDVCommandStatus_OK
                                                    messageAsDictionary:self.launchNotification];
        [pluginResult setKeepCallbackAsBool:YES];
        [self.commandDelegate sendPluginResult:pluginResult callbackId:command.callbackId];
        self.launchNotification = nil;
    } else {
        CDVPluginResult* pluginResult = [CDVPluginResult resultWithStatus:CDVCommandStatus_NO_RESULT];
        [pluginResult setKeepCallbackAsBool:YES];
        [self.commandDelegate sendPluginResult:pluginResult callbackId:command.callbackId];
    }
}

#pragma mark - Notification Handlers

- (void)didRegisterForRemoteNotificationsWithDeviceToken:(NSNotification*)notification {
    NSData* deviceToken = notification.object;
    const unsigned char* bytes = (const unsigned char*)[deviceToken bytes];
    NSMutableString *token = [NSMutableString string];

    for (NSUInteger i = 0; i < [deviceToken length]; i++) {
        [token appendFormat:@"%02x", bytes[i]];
    }

    [[NSUserDefaults standardUserDefaults] setObject:token forKey:@"pushToken"];
    [[NSUserDefaults standardUserDefaults] synchronize];

    if (self.tokenCallbackId) {
        CDVPluginResult* pluginResult = [CDVPluginResult resultWithStatus:CDVCommandStatus_OK
                                                        messageAsString:token];
        [self.commandDelegate sendPluginResult:pluginResult callbackId:self.tokenCallbackId];
        self.tokenCallbackId = nil;
    }
}

- (void)didFailToRegisterForRemoteNotifications:(NSNotification*)notification {
    NSError* error = notification.object;

    if (self.tokenCallbackId) {
        CDVPluginResult* pluginResult = [CDVPluginResult resultWithStatus:CDVCommandStatus_ERROR
                                                        messageAsString:[error localizedDescription]];
        [self.commandDelegate sendPluginResult:pluginResult callbackId:self.tokenCallbackId];
        self.tokenCallbackId = nil;
    }
}

- (void)didReceiveRemoteNotification:(NSNotification*)notification {
    if (self.notificationCallbackId) {
        CDVPluginResult* pluginResult = [CDVPluginResult resultWithStatus:CDVCommandStatus_OK
                                                    messageAsDictionary:notification.userInfo];
        [pluginResult setKeepCallbackAsBool:YES];
        [self.commandDelegate sendPluginResult:pluginResult callbackId:self.notificationCallbackId];
    }
}

- (void)notificationClicked:(NSNotification*)notification {
    if (self.notificationCallbackId) {
        NSDictionary* data = @{
            @"type": @"click",
            @"notification": notification.userInfo
        };
        CDVPluginResult* pluginResult = [CDVPluginResult resultWithStatus:CDVCommandStatus_OK
                                                    messageAsDictionary:data];
        [pluginResult setKeepCallbackAsBool:YES];
        [self.commandDelegate sendPluginResult:pluginResult callbackId:self.notificationCallbackId];
    }
}

- (void)appLaunchedFromNotification:(NSNotification*)notification {
    self.launchNotification = notification.userInfo;
    if (self.launchNotificationCallbackId) {
        CDVPluginResult* pluginResult = [CDVPluginResult resultWithStatus:CDVCommandStatus_OK
                                                    messageAsDictionary:self.launchNotification];
        [pluginResult setKeepCallbackAsBool:YES];
        [self.commandDelegate sendPluginResult:pluginResult callbackId:self.launchNotificationCallbackId];
        self.launchNotification = nil;
    }
}

- (void)dealloc {
    [[NSNotificationCenter defaultCenter] removeObserver:self];
}

@end