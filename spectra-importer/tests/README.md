Notes for running tests.

Chrome supports the webdriver protocal (https://dvcs.w3.org/hg/webdriver/raw-file/default/webdriver-spec.html) by default.  Other browsers require a plugin which can be installed from here: http://docs.seleniumhq.org/about/platforms.jsp

## Libraries
Selenium Server: http://docs.seleniumhq.org/projects/webdriver/

webdriver.io: http://webdriver.io/

mocha: http://mochajs.org/


## Setup
// install mocha globaly
```
npm install -g mocha
```

// installs webdriverio
```
npm install 
```

// download selenium webdriver server (webdriver.io connects to server which speaks to browser)

http://docs.seleniumhq.org/download/

// latest
```
wget http://selenium-release.storage.googleapis.com/2.44/selenium-server-standalone-2.44.0.jar
```

// startup server
```
java -jar selenium-server-standalone-2.44.0.jar
```

## Run Test
mocha [test].js


## Create Tests
Use Node.JS and webdriver.io who's api is documented here: http://webdriver.io/api.html.

**Note:** The webdriver spec does not currently account for Shadow DOM.  So working with webcomponents is tricky.  injectPolymerHelpers.js will use webdriver.io's client.addCommand() to add custom commands which are useful for working around the lack of Shadow DOM query support.

If you have a <input /> value bound to elements attribute, setting the <input /> value via the webdriver WILL NOT set the elements attribute or fire any valueChanged events!  Instead, you should simply set the elements attribute directly, this will fire valueChanged events and the new value will be reflected in the <input /> tag.

A couple of the helpers:
- setHash(hash, callback): sets the url hash of the app
- polymerSetValue(cssQuery, path, value, callback): Given a cssQuery (can include /deep/), will set the elements attribute, defined by 'path' to 'value'.  Path can be in dot notation, so you can call client.polymerSetValue('my-app /deep/ my-cool-widget', 'data.foo', 'bar') which will set my-cool-widget.data.foo = 'bar'.
- polymerGetValue(cssQuery, path, callback): Just like set, but returns to attribute specified by the CSS query and variable path.
