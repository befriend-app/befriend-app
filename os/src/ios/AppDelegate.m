#import "AppDelegate.h"
#import "MainViewController.h"

@implementation AppDelegate

- (BOOL)application:(UIApplication *)application didFinishLaunchingWithOptions:(NSDictionary<UIApplicationLaunchOptionsKey, id> *)launchOptions
{
    self.viewController = [[MainViewController alloc] init];

    // Check if app was launched from notification
    NSDictionary *remoteNotif = [launchOptions objectForKey:UIApplicationLaunchOptionsRemoteNotificationKey];
    if (remoteNotif) {
        NSLog(@"App launched from notification: %@", remoteNotif);
        // Store the notification data
        [[NSUserDefaults standardUserDefaults] setObject:remoteNotif forKey:@"launchNotification"];
        [[NSUserDefaults standardUserDefaults] synchronize];

        // Post notification for plugin
        [[NSNotificationCenter defaultCenter] postNotificationName:@"AppLaunchedFromNotification"
                                                          object:nil
                                                        userInfo:remoteNotif];
    }

    return [super application:application didFinishLaunchingWithOptions:launchOptions];
}

// Handle successful registration with APNs
- (void)application:(UIApplication *)application
didRegisterForRemoteNotificationsWithDeviceToken:(NSData *)deviceToken {
    NSLog(@"AppDelegate: Received device token from APNS");

    // Format token string
    NSString *token;
    if (@available(iOS 13.0, *)) {
        token = [self hexStringFromDeviceToken:deviceToken];
    } else {
        token = [[deviceToken description] stringByTrimmingCharactersInSet:
                [NSCharacterSet characterSetWithCharactersInString:@"<>"]];
        token = [token stringByReplacingOccurrencesOfString:@" " withString:@""];
    }

    NSLog(@"Formatted token: %@", token);

    // Notify plugin through both notification channels
    [[NSNotificationCenter defaultCenter] postNotificationName:@"AppDelegateDidRegisterForRemoteNotifications"
                                                      object:deviceToken];

    [[NSNotificationCenter defaultCenter] postNotificationName:@"CDVRemoteNotification"
                                                      object:deviceToken];
}

// Handle registration failure
- (void)application:(UIApplication *)application
didFailToRegisterForRemoteNotificationsWithError:(NSError *)error {
    NSLog(@"AppDelegate: Failed to register for remote notifications: %@", error);

    [[NSNotificationCenter defaultCenter] postNotificationName:@"CDVRemoteNotificationError"
                                                      object:error];
}

// Handle notification when app is in background
- (void)application:(UIApplication *)application
didReceiveRemoteNotification:(NSDictionary *)userInfo
fetchCompletionHandler:(void (^)(UIBackgroundFetchResult))completionHandler {
    NSLog(@"Received notification while app in background: %@", userInfo);

    [[NSNotificationCenter defaultCenter] postNotificationName:@"CDVRemoteNotificationReceived"
                                                      object:nil
                                                    userInfo:userInfo];

    completionHandler(UIBackgroundFetchResultNewData);
}

// Handle notification when app is in foreground (iOS 10+)
- (void)userNotificationCenter:(UNUserNotificationCenter *)center
       willPresentNotification:(UNNotification *)notification
         withCompletionHandler:(void (^)(UNNotificationPresentationOptions options))completionHandler {
    NSLog(@"Received notification in foreground: %@", notification.request.content.userInfo);

    [[NSNotificationCenter defaultCenter] postNotificationName:@"CDVRemoteNotificationReceived"
                                                      object:nil
                                                    userInfo:notification.request.content.userInfo];

    completionHandler(UNNotificationPresentationOptionSound |
                     UNNotificationPresentationOptionBadge |
                     UNNotificationPresentationOptionBanner);
}

// Handle notification click (iOS 10+)
- (void)userNotificationCenter:(UNUserNotificationCenter *)center
didReceiveNotificationResponse:(UNNotificationResponse *)response
         withCompletionHandler:(void (^)(void))completionHandler {
    NSLog(@"Notification clicked: %@", response.notification.request.content.userInfo);

    [[NSNotificationCenter defaultCenter] postNotificationName:@"NotificationClicked"
                                                      object:nil
                                                    userInfo:response.notification.request.content.userInfo];

    completionHandler();
}

// Helper method to format device token
- (NSString*)hexStringFromDeviceToken:(NSData*)deviceToken {
    const unsigned char* bytes = (const unsigned char*)[deviceToken bytes];
    NSMutableString *token = [NSMutableString string];
    for (NSUInteger i = 0; i < [deviceToken length]; i++) {
        [token appendFormat:@"%02x", bytes[i]];
    }
    return token;
}

@end