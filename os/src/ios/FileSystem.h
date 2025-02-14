#import <Cordova/CDVPlugin.h>

@interface FileSystem : CDVPlugin

- (void)getFile:(CDVInvokedUrlCommand*)command;
- (void)readFile:(CDVInvokedUrlCommand*)command;
- (void)writeFile:(CDVInvokedUrlCommand*)command;
- (void)getDataDirectory:(CDVInvokedUrlCommand*)command;

@end