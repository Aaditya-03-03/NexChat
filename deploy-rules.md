# Deploy Firestore Rules

## Option 1: Using Firebase Console (Recommended for quick setup)

1. Go to [Firebase Console](https://console.firebase.google.com/)
2. Select your project: `nexchat-86e4c`
3. Navigate to **Firestore Database** → **Rules**
4. Copy the contents of `firestore.rules` file
5. Paste it into the rules editor
6. Click **Publish**

## Option 2: Using Firebase CLI

1. Login to Firebase:
   ```bash
   firebase login
   ```

2. Initialize Firebase in your project:
   ```bash
   firebase init firestore
   ```

3. Deploy the rules:
   ```bash
   firebase deploy --only firestore:rules
   ```

## Option 3: Temporary Development Rules

If you want to test quickly, you can use these very permissive rules in the Firebase Console:

```javascript
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    match /{document=**} {
      allow read, write: if true;
    }
  }
}
```

⚠️ **Warning**: The temporary rules allow anyone to read/write to your database. Only use for development and replace with proper rules before production.

## Current Rules

The rules in `firestore.rules` are designed for development with basic security:
- All authenticated users can read/write to chats and messages
- Users can only modify their own user profiles
- Basic authentication required for all operations 