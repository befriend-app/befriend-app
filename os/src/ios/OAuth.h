#import <Cordova/CDVPlugin.h>
#import <AuthenticationServices/AuthenticationServices.h>
#import <SafariServices/SafariServices.h>

@interface OAuth : CDVPlugin <ASWebAuthenticationPresentationContextProviding, SFSafariViewControllerDelegate> {
    NSString *_pendingCallbackId;
}

- (void)googleSignIn:(CDVInvokedUrlCommand*)command;

@property (nonatomic, strong) NSString *clientId;
@property (nonatomic, strong) NSString *redirectUri;
@property (nonatomic, strong) ASWebAuthenticationSession *authSession;

@end