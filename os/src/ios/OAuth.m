#import "Oauth.h"
#import <Cordova/CDVPluginResult.h>

@implementation OAuth

- (void)pluginInitialize {
    [super pluginInitialize];
    // No need to initialize currentUser anymore
}

- (void)googleSignIn:(CDVInvokedUrlCommand*)command {
    NSDictionary* options = [command.arguments objectAtIndex:0];
    
    // Extract client ID and reversed client ID from options
    NSString* clientId = [options objectForKey:@"clientId"];
    NSString* reversedClientId = [options objectForKey:@"reversedClientId"];
    
    if (!clientId || clientId.length == 0) {
        CDVPluginResult* result = [CDVPluginResult resultWithStatus:CDVCommandStatus_ERROR
                                                    messageAsString:@"clientId is required"];
        [self.commandDelegate sendPluginResult:result callbackId:command.callbackId];
        return;
    }
    
    // Set the client ID for this session
    self.clientId = clientId;
    
    // Set up redirect URI
    NSString* redirectUri;
    if (reversedClientId && reversedClientId.length > 0) {
        redirectUri = [NSString stringWithFormat:@"%@:/oauth2callback", reversedClientId];
    } else {
        // Fallback: generate from bundle ID
        NSString *bundleId = [[NSBundle mainBundle] bundleIdentifier];
        NSArray *parts = [bundleId componentsSeparatedByString:@"."];
        NSArray *reversedParts = [[parts reverseObjectEnumerator] allObjects];
        redirectUri = [NSString stringWithFormat:@"%@:/oauth2callback", [reversedParts componentsJoinedByString:@"."]];
    }
    self.redirectUri = redirectUri;

    // Build OAuth authorization URL
    NSString *scope = @"openid profile email";
    NSString *state = [self generateState];

    NSString *authURLString = [NSString stringWithFormat:
        @"https://accounts.google.com/o/oauth2/v2/auth?"
        @"client_id=%@&"
        @"redirect_uri=%@&"
        @"response_type=code&"
        @"scope=%@&"
        @"state=%@&"
        @"access_type=offline&"
        @"include_granted_scopes=true",
        [self urlEncode:self.clientId],
        [self urlEncode:self.redirectUri],
        [self urlEncode:scope],
        state
    ];

    NSURL *authURL = [NSURL URLWithString:authURLString];

    // Use proper callback URL scheme
    if (@available(iOS 12.0, *)) {
        self.authSession = [[ASWebAuthenticationSession alloc]
            initWithURL:authURL
            callbackURLScheme:[self.redirectUri componentsSeparatedByString:@":"][0]
            completionHandler:^(NSURL * _Nullable callbackURL, NSError * _Nullable error) {
                [self googleHandleAuthCallback:callbackURL error:error command:command];
            }];

        if (@available(iOS 13.0, *)) {
            self.authSession.presentationContextProvider = self;
        }

        [self.authSession start];
    } else {
        // Fallback to SFSafariViewController for iOS 11 and below
        SFSafariViewController *safariVC = [[SFSafariViewController alloc] initWithURL:authURL];
        safariVC.delegate = self;
        [self.viewController presentViewController:safariVC animated:YES completion:nil];

        // Store callback ID as instance variable for SFSafariViewController fallback
        _pendingCallbackId = command.callbackId;
    }
}

- (void)googleHandleAuthCallback:(NSURL *)callbackURL error:(NSError *)error command:(CDVInvokedUrlCommand*)command {
    if (error) {
        CDVPluginResult* result = [CDVPluginResult resultWithStatus:CDVCommandStatus_ERROR
                                                    messageAsString:error.localizedDescription];
        [self.commandDelegate sendPluginResult:result callbackId:command.callbackId];
        return;
    }

    if (!callbackURL) {
        CDVPluginResult* result = [CDVPluginResult resultWithStatus:CDVCommandStatus_ERROR
                                                    messageAsString:@"Authorization cancelled"];
        [self.commandDelegate sendPluginResult:result callbackId:command.callbackId];
        return;
    }

    // Parse authorization code from callback URL
    NSString *query = callbackURL.query;
    NSString *authCode = [self extractParameterFromQuery:query parameterName:@"code"];

    if (!authCode) {
        NSString *errorParam = [self extractParameterFromQuery:query parameterName:@"error"];
        NSString *errorMessage = errorParam ? [NSString stringWithFormat:@"Authorization failed: %@", errorParam] : @"No authorization code received";

        CDVPluginResult* result = [CDVPluginResult resultWithStatus:CDVCommandStatus_ERROR
                                                    messageAsString:errorMessage];
        [self.commandDelegate sendPluginResult:result callbackId:command.callbackId];
        return;
    }

    // Exchange authorization code for tokens
    [self googleExchangeCodeForTokens:authCode command:command];
}

- (void)googleExchangeCodeForTokens:(NSString *)authCode command:(CDVInvokedUrlCommand*)command {
    NSString *tokenURL = @"https://oauth2.googleapis.com/token";

    NSString *postData = [NSString stringWithFormat:
        @"client_id=%@&"
        @"code=%@&"
        @"grant_type=authorization_code&"
        @"redirect_uri=%@",
        [self urlEncode:self.clientId],
        [self urlEncode:authCode],
        [self urlEncode:self.redirectUri]
    ];

    NSMutableURLRequest *request = [NSMutableURLRequest requestWithURL:[NSURL URLWithString:tokenURL]];
    [request setHTTPMethod:@"POST"];
    [request setValue:@"application/x-www-form-urlencoded" forHTTPHeaderField:@"Content-Type"];
    [request setHTTPBody:[postData dataUsingEncoding:NSUTF8StringEncoding]];

    NSURLSessionTask *task = [[NSURLSession sharedSession] dataTaskWithRequest:request
        completionHandler:^(NSData *data, NSURLResponse *response, NSError *error) {
            dispatch_async(dispatch_get_main_queue(), ^{
                [self googleHandleTokenResponse:data error:error command:command];
            });
        }];

    [task resume];
}

- (void)googleHandleTokenResponse:(NSData *)data error:(NSError *)error command:(CDVInvokedUrlCommand*)command {
    if (error) {
        CDVPluginResult* result = [CDVPluginResult resultWithStatus:CDVCommandStatus_ERROR
                                                    messageAsString:error.localizedDescription];
        [self.commandDelegate sendPluginResult:result callbackId:command.callbackId];
        return;
    }

    NSError *jsonError;
    NSDictionary *tokenData = [NSJSONSerialization JSONObjectWithData:data options:0 error:&jsonError];

    if (jsonError || !tokenData) {
        CDVPluginResult* result = [CDVPluginResult resultWithStatus:CDVCommandStatus_ERROR
                                                    messageAsString:@"Failed to parse token response"];
        [self.commandDelegate sendPluginResult:result callbackId:command.callbackId];
        return;
    }

    NSString *accessToken = tokenData[@"access_token"];
    NSString *idToken = tokenData[@"id_token"];
    NSString *refreshToken = tokenData[@"refresh_token"];

    if (!accessToken) {
        NSString *errorDescription = tokenData[@"error_description"] ?: @"Failed to get access token";
        CDVPluginResult* result = [CDVPluginResult resultWithStatus:CDVCommandStatus_ERROR
                                                    messageAsString:errorDescription];
        [self.commandDelegate sendPluginResult:result callbackId:command.callbackId];
        return;
    }

    // Get user info with the access token
    [self googleGetUserInfo:accessToken idToken:idToken refreshToken:refreshToken command:command];
}

- (void)googleGetUserInfo:(NSString *)accessToken idToken:(NSString *)idToken refreshToken:(NSString *)refreshToken command:(CDVInvokedUrlCommand*)command {
    NSString *userInfoURL = [NSString stringWithFormat:@"https://www.googleapis.com/oauth2/v2/userinfo?access_token=%@", accessToken];

    NSMutableURLRequest *request = [NSMutableURLRequest requestWithURL:[NSURL URLWithString:userInfoURL]];
    [request setHTTPMethod:@"GET"];

    NSURLSessionTask *task = [[NSURLSession sharedSession] dataTaskWithRequest:request
        completionHandler:^(NSData *data, NSURLResponse *response, NSError *error) {
            dispatch_async(dispatch_get_main_queue(), ^{
                [self googleHandleUserInfoResponse:data error:error accessToken:accessToken idToken:idToken refreshToken:refreshToken command:command];
            });
        }];

    [task resume];
}

- (void)googleHandleUserInfoResponse:(NSData *)data error:(NSError *)error accessToken:(NSString *)accessToken idToken:(NSString *)idToken refreshToken:(NSString *)refreshToken command:(CDVInvokedUrlCommand*)command {
    if (error) {
        CDVPluginResult* result = [CDVPluginResult resultWithStatus:CDVCommandStatus_ERROR
                                                    messageAsString:error.localizedDescription];
        [self.commandDelegate sendPluginResult:result callbackId:command.callbackId];
        return;
    }

    NSError *jsonError;
    NSDictionary *userInfo = [NSJSONSerialization JSONObjectWithData:data options:0 error:&jsonError];

    if (jsonError || !userInfo) {
        CDVPluginResult* result = [CDVPluginResult resultWithStatus:CDVCommandStatus_ERROR
                                                    messageAsString:@"Failed to parse user info"];
        [self.commandDelegate sendPluginResult:result callbackId:command.callbackId];
        return;
    }

    // Build response with user info and tokens
    NSMutableDictionary *response = [[NSMutableDictionary alloc] init];
    
    if (userInfo[@"id"]) [response setObject:userInfo[@"id"] forKey:@"id"];
    if (userInfo[@"email"]) [response setObject:userInfo[@"email"] forKey:@"email"];
    if (userInfo[@"name"]) [response setObject:userInfo[@"name"] forKey:@"displayName"];
    if (userInfo[@"given_name"]) [response setObject:userInfo[@"given_name"] forKey:@"givenName"];
    if (userInfo[@"family_name"]) [response setObject:userInfo[@"family_name"] forKey:@"familyName"];
    if (userInfo[@"picture"]) [response setObject:userInfo[@"picture"] forKey:@"imageUrl"];
    
    // Include tokens in response
    if (accessToken) [response setObject:accessToken forKey:@"accessToken"];
    if (idToken) [response setObject:idToken forKey:@"idToken"];
    if (refreshToken) [response setObject:refreshToken forKey:@"refreshToken"];

    // Return user data and tokens
    CDVPluginResult* result = [CDVPluginResult resultWithStatus:CDVCommandStatus_OK
                                                messageAsDictionary:[response copy]];
    [self.commandDelegate sendPluginResult:result callbackId:command.callbackId];
}

- (void)signInWithApple:(CDVInvokedUrlCommand*)command API_AVAILABLE(ios(13.0)) {
    // Check if Apple Sign In is available
    if (@available(iOS 13.0, *)) {
        ASAuthorizationAppleIDProvider *appleIDProvider = [[ASAuthorizationAppleIDProvider alloc] init];
        ASAuthorizationAppleIDRequest *request = [appleIDProvider createRequest];

        // Configure the request
        request.requestedScopes = @[ASAuthorizationScopeFullName, ASAuthorizationScopeEmail];

        // Create and configure the authorization controller
        ASAuthorizationController *authorizationController = [[ASAuthorizationController alloc] initWithAuthorizationRequests:@[request]];

        // Store the callback ID for later use
        _pendingCallbackId = command.callbackId;

        authorizationController.delegate = self;
        authorizationController.presentationContextProvider = self;
        [authorizationController performRequests];
    } else {
        CDVPluginResult* result = [CDVPluginResult resultWithStatus:CDVCommandStatus_ERROR
                                                    messageAsString:@"Apple Sign In requires iOS 13.0 or later"];
        [self.commandDelegate sendPluginResult:result callbackId:command.callbackId];
    }
}

#pragma mark - ASAuthorizationControllerDelegate

- (void)authorizationController:(ASAuthorizationController *)controller didCompleteWithAuthorization:(ASAuthorization *)authorization API_AVAILABLE(ios(13.0)) {
    if ([authorization.credential isKindOfClass:[ASAuthorizationAppleIDCredential class]]) {
        ASAuthorizationAppleIDCredential *credential = authorization.credential;

        // Build response dictionary
        NSMutableDictionary *response = [[NSMutableDictionary alloc] init];

        // User identifier (required)
        if (credential.user) {
            [response setObject:credential.user forKey:@"id"];
        }

        // Email (may be nil if user chose not to share)
        if (credential.email) {
            [response setObject:credential.email forKey:@"email"];
        }

        // Full name (may be nil if user chose not to share)
        if (credential.fullName) {
            NSMutableDictionary *name = [[NSMutableDictionary alloc] init];
            if (credential.fullName.givenName) {
                [name setObject:credential.fullName.givenName forKey:@"givenName"];
            }
            if (credential.fullName.familyName) {
                [name setObject:credential.fullName.familyName forKey:@"familyName"];
            }
            if (name.count > 0) {
                [response setObject:name forKey:@"name"];
            }
        }

        // Identity token (JWT)
        if (credential.identityToken) {
            NSString *identityToken = [[NSString alloc] initWithData:credential.identityToken encoding:NSUTF8StringEncoding];
            if (identityToken) {
                [response setObject:identityToken forKey:@"idToken"];
            }
        }

        // Authorization code
        if (credential.authorizationCode) {
            NSString *authCode = [[NSString alloc] initWithData:credential.authorizationCode encoding:NSUTF8StringEncoding];
            if (authCode) {
                [response setObject:authCode forKey:@"authorizationCode"];
            }
        }

        // Real user status
        switch (credential.realUserStatus) {
            case ASUserDetectionStatusLikelyReal:
                [response setObject:@"likelyReal" forKey:@"realUserStatus"];
                break;
            case ASUserDetectionStatusUnknown:
                [response setObject:@"unknown" forKey:@"realUserStatus"];
                break;
            case ASUserDetectionStatusUnsupported:
                [response setObject:@"unsupported" forKey:@"realUserStatus"];
                break;
        }

        // Send success result
        CDVPluginResult* result = [CDVPluginResult resultWithStatus:CDVCommandStatus_OK
                                                    messageAsDictionary:[response copy]];
        [self.commandDelegate sendPluginResult:result callbackId:_pendingCallbackId];
        _pendingCallbackId = nil;
    }
}

- (void)authorizationController:(ASAuthorizationController *)controller didCompleteWithError:(NSError *)error API_AVAILABLE(ios(13.0)) {
    NSString *errorMessage;

    if (error.code == ASAuthorizationErrorCanceled) {
        errorMessage = @"User cancelled Apple Sign In";
    } else if (error.code == ASAuthorizationErrorFailed) {
        errorMessage = @"Apple Sign In failed";
    } else if (error.code == ASAuthorizationErrorInvalidResponse) {
        errorMessage = @"Invalid response from Apple Sign In";
    } else if (error.code == ASAuthorizationErrorNotHandled) {
        errorMessage = @"Apple Sign In request not handled";
    } else {
        errorMessage = [NSString stringWithFormat:@"Apple Sign In error: %@", error.localizedDescription];
    }

    CDVPluginResult* result = [CDVPluginResult resultWithStatus:CDVCommandStatus_ERROR
                                                messageAsString:errorMessage];
    [self.commandDelegate sendPluginResult:result callbackId:_pendingCallbackId];
    _pendingCallbackId = nil;
}

#pragma mark - Utility Methods

- (NSString *)generateState {
    NSString *characters = @"abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789";
    NSMutableString *state = [NSMutableString stringWithCapacity:32];

    for (int i = 0; i < 32; i++) {
        [state appendFormat:@"%C", [characters characterAtIndex:arc4random_uniform((uint32_t)[characters length])]];
    }

    return state;
}

- (NSString *)urlEncode:(NSString *)string {
    NSCharacterSet *allowedCharacters = [[NSCharacterSet characterSetWithCharactersInString:@"abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789-._~"] invertedSet];
    return [string stringByAddingPercentEncodingWithAllowedCharacters:allowedCharacters.invertedSet];
}

- (NSString *)extractParameterFromQuery:(NSString *)query parameterName:(NSString *)parameterName {
    NSArray *components = [query componentsSeparatedByString:@"&"];

    for (NSString *component in components) {
        NSArray *pair = [component componentsSeparatedByString:@"="];
        if (pair.count == 2 && [pair[0] isEqualToString:parameterName]) {
            return [pair[1] stringByRemovingPercentEncoding];
        }
    }

    return nil;
}

#pragma mark - ASWebAuthenticationPresentationContextProviding

- (ASPresentationAnchor)presentationAnchorForWebAuthenticationSession:(ASWebAuthenticationSession *)session API_AVAILABLE(ios(13.0)) {
    return self.viewController.view.window;
}

#pragma mark - SFSafariViewControllerDelegate

- (void)safariViewControllerDidFinish:(SFSafariViewController *)controller {
    [controller dismissViewControllerAnimated:YES completion:nil];

    if (_pendingCallbackId) {
        CDVPluginResult* result = [CDVPluginResult resultWithStatus:CDVCommandStatus_ERROR
                                                    messageAsString:@"User cancelled authorization"];
        [self.commandDelegate sendPluginResult:result callbackId:_pendingCallbackId];
        _pendingCallbackId = nil;
    }
}

@end