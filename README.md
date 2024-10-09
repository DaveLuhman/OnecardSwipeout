### **Project Name**
**Onecard Swipeout** - Version 1.1.0

### **Purpose**
Onecard Swipeout is an Electron-based desktop application designed to detect and interface with HID (Human Interface Device) readers, particularly MagTek card swipe readers. It processes card swipe data to extract user identification information and displays it to the user, as well as emulating keystrokes of the 7-digit onecard ID# from the swiped card, if available.

### **Target Audience**
This application is intended for use by Madison Area Technical College staff to simplify the collection of data.

### **Overview**
The application automatically detects connected MagTek HID devices, allows the user to select an appropriate device if multiple are available, and listens for card swipe events. The parsed data is displayed in the application interface, the 7-digit Onecard ID number is keystroke-emulated to the user's cursor postion, otherwiswe errors are handled gracefully, displaying actionable information to the user and console.

For more information, please see DOCUMENTATION.md
