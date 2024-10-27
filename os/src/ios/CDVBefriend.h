#import <Cordova/CDVPlugin.h>
#import <Cordova/CDVInvokedUrlCommand.h>

@interface CDVBefriend : CDVPlugin {
    @protected
    UIView* _statusBarBackgroundView;
    UIColor* _statusBarBackgroundColor;
}

@property (nonatomic, assign) CGFloat lastSetAlpha;
@property (nonatomic, strong) UIWindow *borderWindow;

- (void)transformStatusBar:(CDVInvokedUrlCommand*)command;
- (void)setStatusBarBorder:(CDVInvokedUrlCommand*)command;
- (void)setBackgroundTransparency:(CDVInvokedUrlCommand*)command;
- (void)getStatusBarHeight:(CDVInvokedUrlCommand*)command;

@end