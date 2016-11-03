Start the custom authentication service with the command `node service.js`.

Log in with either '1234' or '5678' and see the secret value. To test if the secretvalue is correctly secured press the 'Get secret value' button when not logged in.

Once you log in with one of the above credentials again after logging out, the id's should remain the same, an example of correct output:

```
- Vuv5695nMLYhMyth0GEEKv0XLO43-anonymous
- Vuv5695nMLYhMyth0GEEKv0XLO43-custom
- nk6JJSJhmGgIoLOSw25fEqt7nsr1-anonymous
- Vuv5695nMLYhMyth0GEEKv0XLO43-custom
```

An example of incorrect output:

```
- Vuv5695nMLYhMyth0GEEKv0XLO43-anonymous
- Vuv5695nMLYhMyth0GEEKv0XLO43-custom
- nk6JJSJhmGgIoLOSw25fEqt7nsr1-anonymous
- nk6JJSJhmGgIoLOSw25fEqt7nsr1-custom
```

Rules required in database:

```
"testCustomAuthentication": {
  "secureResource": {
    ".read": "auth.token.customAuthenticated === true"
  },
  "uids": {
    ".read": "auth.uid === 'custom-auth-service'",
    ".write": "auth.uid === 'custom-auth-service'"
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
