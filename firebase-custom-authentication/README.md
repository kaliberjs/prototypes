Start the custom authentication service with the command `node service.js`.

Log in with either '1234' or '5678' and see the secret value. To test if the secretvalue is correctly secured press the 'Get secret value' button when not logged in.

Rules required in database:

```
"testCustomAuthentication": {
  "secureResource": {
    ".read": "auth.token.customAuthenticated === true"
  },
  "request": {
    ".read": "auth.uid === 'custom-auth-service'",
    "$id": {
      ".write": "(auth != null && newData.exists()) || (!newData.exists() && auth.uid === 'custom-auth-service')",
      ".validate": "auth.uid === newData.child('uid').val()"
    }
  },
  "response": {
    ".write": "auth.uid === 'custom-auth-service'",
    "$id": {
      ".read": "!data.exists() || auth.uid === data.child('uid').val()",
      ".write": "auth.uid === data.child('uid').val() && !newData.exists()"
    }
  }
}
```
