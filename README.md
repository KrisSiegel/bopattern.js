# BoPattern.js
An easy to use pattern of life control that simply takes a 2 dimensional array of values and outputs a responsive and interactive pattern of life graph.

## Installation
You can grab BoPattern.js in one of two ways.

- Use bower to install ```bower install bopattern --save```

- Manually download either file in the ```./dist/``` directory. ```bopattern.js``` is the full code necessary where as ```bopattern.min.js``` is the same but minified.

- Include the CSS from the dist folder should you wish to use html sprites (currently just tooltips).

## Quick start
Simply set this folder to be served through a static web server then navigate to any of the HTML files contained within ```examples/```. This will load up the example page showing BoPattern.js working with a button that generates a random data set. Simple!

## Running the examples
There is an included static file server when you pull down the repo that can be started by running ```npm start``` (**note** you must first run ```npm install```). Each of the example files are available at:

```http://localhost:8080/examples/example-all-sources.html``` -> This page manually includes each JavaScript and CSS file required to run BoPattern.js. Use this if you're a developer and you want to modify BoPattern.js without rebuilding it constantly.

```http://localhost:8080/examples/example-concat-sources.html``` -> This page includes only the concatenated sources. This is handle should you want to debug something but not develop against it.

```http://localhost:8080/examples/example-min-sources.html``` -> This page includes only minified sources. This is good for quick testing and verifying of functionality.

## Usage
BoPattern.js will put a BoPattern function at the top level (attached to window). This method allows you to create as many instances of BoPattern as necessary.

```javascript
var bopat = BoPattern("div#selector"); // Accepts an HTML element or selector
bopat.load([
    [0, 1, 15, 46, 34, 23],
    [17, 4, 16, 10, 8, 18],
    [6, 6, 53, 64, 34, 19],
    [54, 13, 55, 23, 34, 38],
    [32, 88, 12, 52, 65, 45],
]);
```

If the provided selector or HTML element is NOT a canvas then BoPattern will create its own canvas constrained to the selector's element provided.

Loading data accepts a simple 2 dimensional array of input which are then rendered, vertically, for each row. Data can be in either of the following formats:

```javascript
// Plain 2 dimensional array of values
[
    [1, 2, 3],
    [4, 5, 6]
]

// 2 dimensional array of objects
[
    [
        { value: 1, label: "something" },
        { value: 2, label: "something" },
        { value: 3, label: "something" }
    ],
    [
        { value: 4, label: "something" },
        { value: 5, label: "something" },
        { value: 6, label: "something" }
    ]
]
```

Also note that there is an optional, second parameter for specifying options. At the moment this is limited to toggling tooltips on and off and can be done via:

```javascript
var bopat = BoPattern("div#selector"); // Accepts an HTML element or selector
bopat.load([
    [0, 1, 15, 46, 34, 23],
    [17, 4, 16, 10, 8, 18],
    [6, 6, 53, 64, 34, 19],
    [54, 13, 55, 23, 34, 38],
    [32, 88, 12, 52, 65, 45],
], {
    tooltip: {
        display: false
    }
});
```

## Debugging
So debugging drawing can be a huge pain. There exists a debug mode for BoPattern to help make this a tiny, tiny bit easier. To enable simply set the debug property to true. Once set the bounded area of the graph will be outlines, the user's active mouse movements will be displayed and a tiny bit of other information will be listed showing you the min and max values of the current set of data and how many tiles are currently on this.

Another aspect of the debug mode is it exposes the internal object, an object which contains all current calculations and rendering objects, to the outside world so developers can examine its contents for issues. When debug is set to true then ```myBoPattern.internal``` is where the internal stuff exists. This property will be removed should debug mode be set back to false.

```javascript
var bopat = BoPattern("div#selector");
console.log(bopat.internal); // Prints undefined
bopat.debug = true;
console.log(bopat.internal); // Prints internal object
```

## Extending
BoPattern supports adding extensions that run in each instance of the control (as opposed to a more global level). There is a ```BoPattern.extend(fn)``` method which will execute at the initialization of each instance of a BoPattern. The function executed is given access to the internal data structure that allows access to real time updated constraints and information about the current rendering.

This essentially allows you to extend BoPattern to do just about anything you want. Let's take a look at an example where you can extend BoPattern to draw a rectangle on top of everything just...because.

```javascript
BoPattern.extend(function(internal) {
  internal.addObject("overlay", (function() {
      var x;
      var y;
      var width = 100;
      var height = 50;

      return {
          type: "rect",
          render: function(ctx) {
              if (x && y) {
                  ctx.beginPath();
                  ctx.globalAlpha = 1;
                  ctx.fillStyle = "black";
                  ctx.fillRect(x, y, width, height);
                  ctx.closePath();
              }
          },
          update: function(ctx) {
              x = ((internal.screenWidth / 2) - (width / 2));
              y = ((internal.screenHeight / 2) - (height / 2));
          }
      }
  }()));
});
```

As you can see objects which are rendered can be rendered on one of three z indexes: "background", "foreground" and "overlay". Objects to be rendered must contain a render and an update method. As with typical game loops all calculations should be done within the update loop while any drawing code should be done within the render method.

Easy, right?

# License
Licensed to the Apache Software Foundation (ASF) under one or more contributor license agreements. See the NOTICE file distributed with this work for additional information regarding copyright ownership. The ASF licenses this file to you under the Apache License, Version 2.0 (the "License"); you may not use this file except in compliance with the License. You may obtain a copy of the License at

http://www.apache.org/licenses/LICENSE-2.0

Unless required by applicable law or agreed to in writing, software distributed under the License is distributed on an "AS IS" BASIS, WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied. See the License for the specific language governing permissions and limitations under the License.
