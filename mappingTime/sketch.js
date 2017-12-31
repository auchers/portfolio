/* Adapted from https://processing.org/examples/clock.html */
// var SunCalc = require('suncalc');

var w = window.innerWidth,
    h = window.innerHeight;

var cx, cy; // center position of canvas

// Radius for hands of the clock
var hourCirclePos;
var minCirclePos;
var clockDiameter;
var hourDiameter;
var minDiameter;

// Colors
var night;
var dayC;
var sunrise;
var sunset;
var backgroundC;
var sunriseTime;
var sunsetTime;

// boolean to control second flashing
var flash;

function setup() {
  createCanvas(w, h);
  // stroke(255);
  frameRate(1);

  // Colors
  night = color('rgb(29, 55, 80)');
  dayC = color('rgb(238, 215, 135)');
  sunrise = color('rgb(224, 123, 129)');
  sunset = color('rgb(229, 154,	131)');
  backgroundC = color('rgb(35, 35, 35)');
  sunriseTime = 6;
  sunsetTime = 18;
  flash = true;

  var radius = min(width, height) / 2; // this is the maximum possible radius
  clockDiameter = radius * 1.7; // make slightly smaller than maximum allowed
  hourDiameter = ((clockDiameter * TWO_PI) / (24 * 2)) * .95; // largest diameter for 24
  minDiameter = (hourDiameter * TWO_PI) / (60 * 2);
  hourCirclePos = clockDiameter / 2;
  minCirclePos = hourDiameter / 2;

  cx = width / 2; // centers the clock
  cy = height / 2;
  frameRate(2);
}

function draw() {
  background(backgroundC);

  // Angles for sin() and cos() start at 3 o'clock;
  // subtract HALF_PI to make them start at the top
  var m = radians(map(minute(), 0, 60, 0, 360)) - HALF_PI;
  var h = radians(map(hour(), 0, 24, 0, 360)) - HALF_PI;

  // Draw the minute ticks
    beginShape(POINTS);
    var circleNumber = 0;
    for (var a = 0; a <360; a+= 360/24) {
        var angle = radians(a) - HALF_PI;
        var x = cx + cos(angle) * hourCirclePos;
        var y = cy - sin(angle) * hourCirclePos; // subtract sine to get counterclockwise
        strokeWeight(3);
        fill(getHourFill(h, angle, circleNumber)); // fill with color if hour has past
        ellipse(x, y, hourDiameter, hourDiameter);

        for (var b = 0; b < 360; b+= 360/60){
            var subangle = radians(b) - HALF_PI;
            var subx = x + cos(subangle) * minCirclePos;
            var suby = y - sin(subangle) * minCirclePos;
            noStroke();
            fill(getMinFill(h, m, angle, subangle, circleNumber));
            ellipse(subx, suby, minDiameter, minDiameter);
        }
        circleNumber+=1;
  }
  endShape();
}

function getHourFill(h, angle, circleNumber){
  var c = backgroundC;
  // if current circle angle is past the hour angle
  if (angle < h) {
      c = calculateColor(circleNumber);
  } else if (angle == h) {
      var thisColor = calculateColor(circleNumber);
      // opacity related part of the hour that has past already
      var opacity = map(minute(), 0, 60, 0, 255);
      thisColor = color(thisColor.levels[0], thisColor.levels[1], thisColor.levels[2], opacity);
      c = thisColor;
  }
  return c;
}

function getMinFill(h, m, angle, subangle, circleNumber){
  var c = backgroundC;
  // if current circle angle is past the hour angle
  if (angle < h) {
    c = calculateColor(circleNumber);
  }
    else if (angle.toFixed(1) === h.toFixed(1) && subangle < m) {// current hour, minute that has past
    c = calculateColor(circleNumber);
  }
    else if (angle.toFixed(1) === h.toFixed(1) && subangle === m){// current hour, current minute
      if (flash == true){
          var thisColor = calculateColor(circleNumber);
          // opacity related part of the minute that has past already
          var opacity = map(second(), 0, 60, 0, 255);
          thisColor = color(thisColor.levels[0], thisColor.levels[1], thisColor.levels[2], opacity);
          c = thisColor;
      }
      flash = !flash;
  }

  return c;
}

function calculateColor(circleNumber){
  var startColor = night;
  var endColor = dayC;
  var colorScale = 0;
  var gradientPadding = 2; // hours for the color transition

  if (circleNumber > (sunsetTime + gradientPadding || circleNumber < (sunriseTime - gradientPadding))){// Night
    startColor = night;
    endColor = night;
    colorScale = 0;

  } else if (circleNumber >= (sunriseTime - gradientPadding) && circleNumber < (sunriseTime)) {
    // Night>Sunrise
    startColor = night;
    endColor = sunrise;
    colorScale = map ((circleNumber), sunriseTime - gradientPadding, sunriseTime, 0, 1);

  } else if (circleNumber >= (sunriseTime) && circleNumber < (sunriseTime + gradientPadding)) {
    // Sunrise>Noon
    startColor = sunrise;
    endColor = dayC;
    colorScale = map ((circleNumber), sunriseTime, sunriseTime + gradientPadding, 0, 1);

  } else if (circleNumber >= sunriseTime + gradientPadding && circleNumber < (sunsetTime - gradientPadding)) {
    // Noon
    startColor = dayC;
    endColor = dayC;
    colorScale = 0;

  } else if (circleNumber >= (sunsetTime - gradientPadding) && circleNumber < (sunsetTime + gradientPadding)) {
    // Noon>Sunset
    startColor = dayC;
    endColor = sunset;
    colorScale = map ((circleNumber), sunsetTime - gradientPadding, sunsetTime + gradientPadding, 0, 1);

  } else if (circleNumber >= (sunsetTime)) {
    // Sunset>Night
    startColor = sunset;
    endColor = night;
    colorScale = map ((circleNumber), sunsetTime, 21, 0, 1);
  }

  hourColor = lerpColor(startColor, endColor, colorScale);
  return hourColor;
}
