# **Electron HID Device Listener Application Documentation**

## ** Introduction**

### **Project Name**
**Wolfpack Guestbook** - Version 1.0.0

### **Purpose**
Wolfpack Guestbook is an Electron-based desktop application designed to track attendance volume as a fully-enclosed software solution.  It processes card swipe data or specific keystrokes to extract user identification information, optionally display the result to the screen, and store it to a local-only SQLite3 database. This can later be exported to CSV for further examination and analysis.

### **Target Audience**
This application is intended for internal use by staff managing attendance of events at Madison Area Technical College.

### **Overview**
The application automatically detects connected MagTek HID devices, allows the user to select an appropriate device if multiple are available. Once a HID device is selected, the application listens for card swipe events and key-press events for "F24". An anonymous entry is entered on F24, and on card swipe the parsed data is inserted to the database as well as displayed for the user.

For more information, please see DOCUMENTATION.md
