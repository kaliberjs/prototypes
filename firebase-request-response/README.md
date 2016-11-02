This prototype requires authentication using `?email=...&password=...`

The following rules should be added to the database:

```
"testRequestResponse": {
  "request": {
    // only the service can read, in production this should be a role
    ".read" : "auth.provider === 'password'",
    "$id": {
      // make sure the uid in the request equals the uid of the current user
      ".validate": "auth.uid === newData.child('uid').val()",
      // anyone can write requests, service can remove
      ".write": "(auth != null && newData.exists()) || (!newData.exists() && auth.provider === 'password')"
    }
  },
  "response": {
    // service can write responses
    ".write" : "auth.provider === 'password'",
    "$id": {
      // only responses for the current user can be read
      ".read": "!data.exists() || auth.uid === data.child('uid').val()",
      // current user van remove response
      ".write": "auth.uid === data.child('uid').val() && !newData.exists()"
    }
  }
}
```

The `Request from clientX` buttons test the request response mechanism. You can validate parts of the validation rules by fiddling with the different checkboxes.
