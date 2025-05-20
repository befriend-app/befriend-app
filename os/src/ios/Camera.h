#import <Cordova/CDVPlugin.h>
#import <Cordova/CDVInvokedUrlCommand.h>

@interface Camera : CDVPlugin <UIImagePickerControllerDelegate, UINavigationControllerDelegate>

@property (nonatomic, strong) UIImagePickerController *imagePicker;
@property (nonatomic, copy) NSString *callbackId;
@property (nonatomic, assign) NSInteger quality;
@property (nonatomic, assign) BOOL allowsEditing;

- (void)takePicture:(CDVInvokedUrlCommand*)command;
- (void)getPicture:(CDVInvokedUrlCommand*)command;
- (void)cleanup:(CDVInvokedUrlCommand*)command;

@end