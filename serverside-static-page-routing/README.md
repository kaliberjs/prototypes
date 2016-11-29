To start the server run the following command `./babel-watch server.js`, this will start the server at port `8000`. Go to http://localhost:8000 to test the application.

Clicking a route in the application should not result in a refresh. Refresing any route should fetch the correct result from the server. When the client loads no flickering should be visible, the only part that should change is 'static text' into 'dynamic text'.
