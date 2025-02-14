#import "FileSystem.h"

@implementation FileSystem

- (void)getDataDirectory:(CDVInvokedUrlCommand*)command
{
    [self.commandDelegate runInBackground:^{
        NSString* appDocPath = [NSSearchPathForDirectoriesInDomains(NSDocumentDirectory, NSUserDomainMask, YES) objectAtIndex:0];

        // Create directory if it doesn't exist
        NSFileManager* fileManager = [NSFileManager defaultManager];
        NSError* error;

        if (![fileManager fileExistsAtPath:appDocPath]) {
            [fileManager createDirectoryAtPath:appDocPath
                  withIntermediateDirectories:YES
                                   attributes:nil
                                      error:&error];

            if (error) {
                CDVPluginResult* pluginResult = [CDVPluginResult resultWithStatus:CDVCommandStatus_ERROR
                                                              messageAsString:[error localizedDescription]];
                [self.commandDelegate sendPluginResult:pluginResult callbackId:command.callbackId];
                return;
            }
        }

        CDVPluginResult* pluginResult = [CDVPluginResult resultWithStatus:CDVCommandStatus_OK
                                                        messageAsString:appDocPath];
        [self.commandDelegate sendPluginResult:pluginResult callbackId:command.callbackId];
    }];
}

- (void)getFile:(CDVInvokedUrlCommand*)command
{
    [self.commandDelegate runInBackground:^{
        NSString* path = [command.arguments objectAtIndex:0];
        NSDictionary* options = [command.arguments objectAtIndex:1];

        NSString* appDocPath = [NSSearchPathForDirectoriesInDomains(NSDocumentDirectory, NSUserDomainMask, YES) objectAtIndex:0];
        NSString* filePath = [appDocPath stringByAppendingPathComponent:path];

        BOOL create = options[@"create"] ? [options[@"create"] boolValue] : NO;

        NSFileManager* fileManager = [NSFileManager defaultManager];
        BOOL fileExists = [fileManager fileExistsAtPath:filePath];

        if (!fileExists && !create) {
            CDVPluginResult* pluginResult = [CDVPluginResult resultWithStatus:CDVCommandStatus_ERROR
                                                          messageAsString:@"File does not exist"];
            [self.commandDelegate sendPluginResult:pluginResult callbackId:command.callbackId];
            return;
        }

        if (!fileExists && create) {
            [fileManager createFileAtPath:filePath contents:nil attributes:nil];
        }

        NSDictionary* fileInfo = @{
            @"name": [filePath lastPathComponent],
            @"fullPath": filePath,
            @"type": @"text/plain"
        };

        CDVPluginResult* pluginResult = [CDVPluginResult resultWithStatus:CDVCommandStatus_OK
                                                    messageAsDictionary:fileInfo];
        [self.commandDelegate sendPluginResult:pluginResult callbackId:command.callbackId];
    }];
}

- (void)readFile:(CDVInvokedUrlCommand*)command
{
    [self.commandDelegate runInBackground:^{
        NSString* path = [command.arguments objectAtIndex:0];

        NSString* appDocPath = [NSSearchPathForDirectoriesInDomains(NSDocumentDirectory, NSUserDomainMask, YES) objectAtIndex:0];
        NSString* filePath = [appDocPath stringByAppendingPathComponent:path];

        NSError* error;
        NSString* fileContent = [NSString stringWithContentsOfFile:filePath
                                                        encoding:NSUTF8StringEncoding
                                                           error:&error];

        if (error) {
            CDVPluginResult* pluginResult = [CDVPluginResult resultWithStatus:CDVCommandStatus_ERROR
                                                          messageAsString:[error localizedDescription]];
            [self.commandDelegate sendPluginResult:pluginResult callbackId:command.callbackId];
            return;
        }

        CDVPluginResult* pluginResult = [CDVPluginResult resultWithStatus:CDVCommandStatus_OK
                                                        messageAsString:fileContent];
        [self.commandDelegate sendPluginResult:pluginResult callbackId:command.callbackId];
    }];
}

- (void)readFile:(CDVInvokedUrlCommand*)command
{
    [self.commandDelegate runInBackground:^{
        NSString* path = [command.arguments objectAtIndex:0];

        NSString* appDocPath = [NSSearchPathForDirectoriesInDomains(NSDocumentDirectory, NSUserDomainMask, YES) objectAtIndex:0];
        NSString* filePath = [appDocPath stringByAppendingPathComponent:path];

        NSFileManager* fileManager = [NSFileManager defaultManager];
        if (![fileManager fileExistsAtPath:filePath]) {
            NSString* errorMessage = [NSString stringWithFormat:@"File does not exist at path: %@", path];
            CDVPluginResult* pluginResult = [CDVPluginResult resultWithStatus:CDVCommandStatus_ERROR
                                                          messageAsString:errorMessage];
            [self.commandDelegate sendPluginResult:pluginResult callbackId:command.callbackId];
            return;
        }

        NSError* error;
        NSString* fileContent = [NSString stringWithContentsOfFile:filePath
                                                        encoding:NSUTF8StringEncoding
                                                           error:&error];

        if (error) {
            CDVPluginResult* pluginResult = [CDVPluginResult resultWithStatus:CDVCommandStatus_ERROR
                                                          messageAsString:[error localizedDescription]];
            [self.commandDelegate sendPluginResult:pluginResult callbackId:command.callbackId];
            return;
        }

        CDVPluginResult* pluginResult = [CDVPluginResult resultWithStatus:CDVCommandStatus_OK
                                                        messageAsString:fileContent];
        [self.commandDelegate sendPluginResult:pluginResult callbackId:command.callbackId];
    }];
}

- (void)writeFile:(CDVInvokedUrlCommand*)command
{
    [self.commandDelegate runInBackground:^{
        NSString* path = [command.arguments objectAtIndex:0];
        NSString* data = [command.arguments objectAtIndex:1];

        NSString* appDocPath = [NSSearchPathForDirectoriesInDomains(NSDocumentDirectory, NSUserDomainMask, YES) objectAtIndex:0];
        NSString* filePath = [appDocPath stringByAppendingPathComponent:path];

        // Create intermediate directories if they don't exist
        NSString* directoryPath = [filePath stringByDeletingLastPathComponent];
        NSFileManager* fileManager = [NSFileManager defaultManager];
        NSError* dirError;

        if (![fileManager fileExistsAtPath:directoryPath]) {
            [fileManager createDirectoryAtPath:directoryPath
                  withIntermediateDirectories:YES
                                   attributes:nil
                                      error:&dirError];

            if (dirError) {
                CDVPluginResult* pluginResult = [CDVPluginResult resultWithStatus:CDVCommandStatus_ERROR
                                                              messageAsString:[dirError localizedDescription]];
                [self.commandDelegate sendPluginResult:pluginResult callbackId:command.callbackId];
                return;
            }
        }

        NSError* writeError;
        [data writeToFile:filePath
              atomically:YES
                encoding:NSUTF8StringEncoding
                   error:&writeError];

        if (writeError) {
            CDVPluginResult* pluginResult = [CDVPluginResult resultWithStatus:CDVCommandStatus_ERROR
                                                          messageAsString:[writeError localizedDescription]];
            [self.commandDelegate sendPluginResult:pluginResult callbackId:command.callbackId];
            return;
        }

        CDVPluginResult* pluginResult = [CDVPluginResult resultWithStatus:CDVCommandStatus_OK];
        [self.commandDelegate sendPluginResult:pluginResult callbackId:command.callbackId];
    }];
}

@end