Start the services with the command `node services.js`.

To test this prototype, click the button in a rapid fashion. The response should be shown and the log file should only report a single service for each entry.

The following rules should be added to the database:

```
// these might be more strict and more elaborate (check the firebase queue documentation)
"testServiceRedundancy": {
  "request": {
    ".indexOn": "_state",
    ".read" : "auth.uid === 'custom-redundancy-service'",
    ".write": "(auth != null && newData.exists()) || auth.uid === 'custom-redundancy-service'",
    "$id": {
      ".validate": "auth.uid === newData.child('uid').val() || auth.uid === 'custom-redundancy-service'"
    }
  },
  "response": {
    ".write" : "auth.uid === 'custom-redundancy-service'",
    "$id": {
      ".read": "!data.exists() || auth.uid === data.child('uid').val()",
      ".write": "auth.uid === data.child('uid').val() && !newData.exists()"
    }
  },
  "specs" : {
    ".read": "auth.uid === 'custom-redundancy-service'",
    ".write": "auth.uid === 'custom-redundancy-service'"
  }
}
```
