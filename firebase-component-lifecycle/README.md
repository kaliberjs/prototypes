This prototype requires an `email` and `password` as query string.

To test if it functions, adjust the `test` property at the root of the database in the console
and see it change in the application.

The `test` property in the database should have the following security: `".read": "auth != null"`

After that, press the `Toggle` button and change the property again. There should be no
new `console.log` entry.
