module.exports = JSON.stringify({
  rules: {
    '.read': false,
    '.write': false,
    test: {
      ".read": "auth != null"
    },
    "testRules": {
      ".read": "auth.uid === 'some rule'"
    },
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
    },
    "testRequestResponse": {
      "request": {
        ".read" : "auth.provider === 'password'",
        "$id": {
          ".validate": "auth.uid === newData.child('uid').val()",
          ".write": "(auth != null && newData.exists()) || (!newData.exists() && auth.provider === 'password')"
        }
      },
      "response": {
        ".write" : "auth.provider === 'password'",
        "$id": {
          ".read": "!data.exists() || auth.uid === data.child('uid').val()",
          ".write": "auth.uid === data.child('uid').val() && !newData.exists()"
        }
      }
    },
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
  }
})
