#import "StatusBar.h"
#import <Cordova/CDVViewController.h>

#define StatusBarViewTag 1234567890
#define StatusBarBorderViewTag 1234567891

@interface StatusBar ()
@end

@implementation StatusBar

- (void)pluginInitialize
{
    self.lastSetAlpha = 1.0; // Start with fully opaque
}

- (void)transformStatusBar:(CDVInvokedUrlCommand*)command
{
    NSNumber* yOffsetParam = [command.arguments objectAtIndex:0];
    CGFloat yOffset = [yOffsetParam floatValue];

    NSNumber* durationParam = [command.arguments objectAtIndex:1];
    CGFloat duration = durationParam ? [durationParam floatValue] : 0.3;

    dispatch_async(dispatch_get_main_queue(), ^{
        UIWindow *window = UIApplication.sharedApplication.windows.firstObject;
        if (!window) {
            NSLog(@"Error: Could not find main window");
            return;
        }

        UIView *statusBarView = [self findOrCreateStatusBarViewInWindow:window];

        [UIView animateWithDuration:duration animations:^{
            statusBarView.transform = CGAffineTransformMakeTranslation(0, -yOffset);
        } completion:^(BOOL finished) {
            NSLog(@"Status bar transform completed. Y offset: %f", yOffset);
        }];

        CDVPluginResult* pluginResult = [CDVPluginResult resultWithStatus:CDVCommandStatus_OK];
        [self.commandDelegate sendPluginResult:pluginResult callbackId:command.callbackId];
    });
}

- (UIView *)findOrCreateStatusBarViewInWindow:(UIWindow *)window
{
    UIView *statusBarView = [window viewWithTag:StatusBarViewTag];
    if (!statusBarView) {
        CGRect statusBarFrame = window.windowScene.statusBarManager.statusBarFrame;
        CGRect customFrame = CGRectMake(statusBarFrame.origin.x,
                                      statusBarFrame.origin.y - 50,
                                      statusBarFrame.size.width,
                                      statusBarFrame.size.height + 50);
        statusBarView = [[UIView alloc] initWithFrame:customFrame];
        statusBarView.tag = StatusBarViewTag;
        statusBarView.backgroundColor = [UIColor colorWithWhite:1.0 alpha:self.lastSetAlpha];

        UIView *borderView = [[UIView alloc] initWithFrame:CGRectMake(0, customFrame.size.height - 1, customFrame.size.width, 1)];
        borderView.backgroundColor = [UIColor clearColor];
        borderView.tag = StatusBarBorderViewTag;
        [statusBarView addSubview:borderView];

        [window addSubview:statusBarView];
        [window bringSubviewToFront:statusBarView];
    }
    return statusBarView;
}

- (void)setStatusBarBorder:(CDVInvokedUrlCommand*)command
{
    NSNumber* thicknessNumber = [command.arguments objectAtIndex:0];
    NSString* colorString = [command.arguments objectAtIndex:1];

    CGFloat thickness = [thicknessNumber floatValue];
    UIColor *color = [self colorFromHexString:colorString];

    dispatch_async(dispatch_get_main_queue(), ^{
        UIWindow *window = UIApplication.sharedApplication.windows.firstObject;
        if (!window) {
            NSLog(@"Error: Could not find main window");
            return;
        }

        UIView *statusBarView = [self findOrCreateStatusBarViewInWindow:window];
        UIView *borderView = [statusBarView viewWithTag:StatusBarBorderViewTag];

        if (borderView) {
            borderView.backgroundColor = color;
            CGRect frame = borderView.frame;
            frame.origin.y = statusBarView.frame.size.height - thickness;
            frame.size.height = thickness;
            borderView.frame = frame;
        }

        CDVPluginResult* pluginResult = [CDVPluginResult resultWithStatus:CDVCommandStatus_OK];
        [self.commandDelegate sendPluginResult:pluginResult callbackId:command.callbackId];
    });
}

- (void)setBackgroundTransparency:(CDVInvokedUrlCommand*)command
{
    NSNumber* alphaParam = [command.arguments objectAtIndex:0];
    CGFloat targetAlpha = 0.5;

    if (alphaParam != nil && [alphaParam isKindOfClass:[NSNumber class]]) {
        targetAlpha = [alphaParam floatValue];
        targetAlpha = fmin(fmax(targetAlpha, 0.0), 1.0);
    }

    NSNumber* durationParam = [command.arguments objectAtIndex:1];
    CGFloat duration = durationParam ? [durationParam floatValue] : 0.3;

    dispatch_async(dispatch_get_main_queue(), ^{
        UIWindow *window = UIApplication.sharedApplication.windows.firstObject;
        if (!window) {
            NSLog(@"Error: Could not find main window");
            return;
        }

        UIView *statusBarView = [self findOrCreateStatusBarViewInWindow:window];

        [UIView animateWithDuration:duration animations:^{
            statusBarView.backgroundColor = [UIColor colorWithWhite:1.0 alpha:targetAlpha];
        }];

        self.lastSetAlpha = targetAlpha;
        CDVPluginResult* pluginResult = [CDVPluginResult resultWithStatus:CDVCommandStatus_OK];
        [self.commandDelegate sendPluginResult:pluginResult callbackId:command.callbackId];
    });
}

- (UIColor *)colorFromHexString:(NSString *)hexString {
    unsigned rgbValue = 0;
    NSScanner *scanner = [NSScanner scannerWithString:hexString];
    [scanner setScanLocation:1]; // bypass '#' character
    [scanner scanHexInt:&rgbValue];
    return [UIColor colorWithRed:((rgbValue & 0xFF0000) >> 16)/255.0 green:((rgbValue & 0xFF00) >> 8)/255.0 blue:(rgbValue & 0xFF)/255.0 alpha:1.0];
}

- (void)getStatusBarHeight:(CDVInvokedUrlCommand*)command
{
    CGFloat statusBarHeight = [UIApplication sharedApplication].statusBarFrame.size.height;
    CDVPluginResult* pluginResult = [CDVPluginResult resultWithStatus:CDVCommandStatus_OK messageAsDouble:statusBarHeight];
    [self.commandDelegate sendPluginResult:pluginResult callbackId:command.callbackId];
}

@end