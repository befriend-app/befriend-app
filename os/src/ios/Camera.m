#import "Camera.h"
#import <Cordova/CDVPlugin.h>
#import <MobileCoreServices/MobileCoreServices.h>

@implementation Camera

- (void)takePicture:(CDVInvokedUrlCommand*)command
{
    self.callbackId = command.callbackId;
    NSDictionary* options = [command.arguments objectAtIndex:0];

    self.quality = options[@"quality"] ? [options[@"quality"] integerValue] : 50;
    self.allowsEditing = options[@"allowsEditing"] ? [options[@"allowsEditing"] boolValue] : NO;

    dispatch_async(dispatch_get_main_queue(), ^{
        self.imagePicker = [[UIImagePickerController alloc] init];
        self.imagePicker.delegate = self;
        self.imagePicker.sourceType = UIImagePickerControllerSourceTypeCamera;
        self.imagePicker.allowsEditing = self.allowsEditing;
        self.imagePicker.mediaTypes = @[(NSString*)kUTTypeImage];

        // Check if device has a camera
        if (![UIImagePickerController isSourceTypeAvailable:UIImagePickerControllerSourceTypeCamera]) {
            NSLog(@"Camera not available");
            CDVPluginResult* result = [CDVPluginResult resultWithStatus:CDVCommandStatus_ERROR messageAsString:@"Camera not available"];
            [self.commandDelegate sendPluginResult:result callbackId:self.callbackId];
            return;
        }

        // Present camera
        [self.viewController presentViewController:self.imagePicker animated:YES completion:nil];
    });
}

- (void)getPicture:(CDVInvokedUrlCommand*)command
{
    self.callbackId = command.callbackId;
    NSDictionary* options = [command.arguments objectAtIndex:0];

    self.quality = options[@"quality"] ? [options[@"quality"] integerValue] : 50;
    self.allowsEditing = options[@"allowsEditing"] ? [options[@"allowsEditing"] boolValue] : NO;

    dispatch_async(dispatch_get_main_queue(), ^{
        self.imagePicker = [[UIImagePickerController alloc] init];
        self.imagePicker.delegate = self;
        self.imagePicker.sourceType = UIImagePickerControllerSourceTypePhotoLibrary;
        self.imagePicker.allowsEditing = self.allowsEditing;
        self.imagePicker.mediaTypes = @[(NSString*)kUTTypeImage];

        // Present photo library
        [self.viewController presentViewController:self.imagePicker animated:YES completion:nil];
    });
}

- (void)cleanup:(CDVInvokedUrlCommand*)command
{
    self.callbackId = command.callbackId;

    // Perform any cleanup operations here
    self.imagePicker = nil;

    CDVPluginResult* result = [CDVPluginResult resultWithStatus:CDVCommandStatus_OK];
    [self.commandDelegate sendPluginResult:result callbackId:self.callbackId];
}

#pragma mark - UIImagePickerControllerDelegate

- (void)imagePickerController:(UIImagePickerController *)picker didFinishPickingMediaWithInfo:(NSDictionary<UIImagePickerControllerInfoKey,id> *)info
{
    __block UIImage* image;

    if (self.allowsEditing) {
        image = [info objectForKey:UIImagePickerControllerEditedImage];
    } else {
        image = [info objectForKey:UIImagePickerControllerOriginalImage];
    }

    [picker dismissViewControllerAnimated:YES completion:^{
        if (image) {
            // Process image quality
            NSData *imageData = UIImageJPEGRepresentation(image, (CGFloat)(self.quality / 100.0));
            NSString *base64String = [imageData base64EncodedStringWithOptions:0];

            CDVPluginResult* result = [CDVPluginResult resultWithStatus:CDVCommandStatus_OK messageAsString:base64String];
            [self.commandDelegate sendPluginResult:result callbackId:self.callbackId];
        } else {
            CDVPluginResult* result = [CDVPluginResult resultWithStatus:CDVCommandStatus_ERROR];
            [self.commandDelegate sendPluginResult:result callbackId:self.callbackId];
        }
    }];
}

- (void)imagePickerControllerDidCancel:(UIImagePickerController *)picker
{
    [picker dismissViewControllerAnimated:YES completion:^{
        CDVPluginResult* result = [CDVPluginResult resultWithStatus:CDVCommandStatus_ERROR messageAsString:@"User cancelled"];
        [self.commandDelegate sendPluginResult:result callbackId:self.callbackId];
    }];
}

@end