// Import the page's CSS. Webpack will know what to do with it.
import "../stylesheets/app.css";

// Import libraries we need.
import { default as Web3} from 'web3';
import { default as contract } from 'truffle-contract'

// Import our contract artifacts and turn them into usable abstractions.
import solar_artifacts from '../../build/contracts/Solar.json'

// Solar is our usable abstraction, which we'll use through the code below.
var Solar = contract(solar_artifacts);

// The following code is simple to show off interacting with your contracts.
// As your needs grow you will likely need to change its form and structure.
// For application bootstrapping, check out window.addEventListener below.

var account;
var accounts;
var numPlanets;
var planets;

function Planet(id, name, mass, x, y, vx, vy) {
  this.id = id;
  this.x = x;
  this.y = y;
  this.vx = vx;
  this.vy = vy;
  this.mass = mass;
  this.name = name;
}
window.App = {
  start: function() {
    var self = this;

//     // Bootstrap the MetaCoin abstraction for Use.
    Solar.setProvider(web3.currentProvider);

//     // Get the initial account balance so it can be displayed.
    web3.eth.getAccounts(function(err, accs) {
      if (err != null) {
        alert("There was an error fetching your accounts.");
        return;
      }

      if (accs.length == 0) {
        alert("Couldn't get any accounts! Make sure your Ethereum client is configured correctly.");
        return;
      }

      accounts = accs;
      account = accounts[0];

      self.populatePlanets();
    });
  },

  createPlanet: function() {
    var self = this;

    var amount = parseInt(document.getElementById("amount").value);
    var receiver = document.getElementById("receiver").value;

    this.setStatus("Initiating transaction... (please wait)");

    var solar;
    Solar.deployed().then(function(instance) {
      solar = instance;

      // TODO ...
      var momentum = 2000000000000000
      var x = Math.floor(Math.random()*100);
      var y = Math.floor(Math.random()*100);
      var initialVx = Math.floor(Math.random()*100);
      var initialVy = Math.floor(Math.random()*100);

      var name = 'erf #' + Math.floor(Math.random()*100);
      return solar.addPlanet(name, x, y, initialVx, initialVy, { value: momentum, from: account } );
    }).then(function(data) {
      self.setStatus("Transaction complete!");
    }).catch(function(e) {
      console.log(e);
      self.setStatus("Error sending coin; see log.");
    });
  },

  populatePlanets: function() {
    var self = this;

    this.setStatus("Initiating transaction... (please wait)");
    var solar;

    // get number of plannets
    planets = [];
    Solar.deployed().then(function(instance) {
      solar = instance;
      return solar.numPlanets({ from: account } );
    }).then(function(data) {
      numPlanets = data;
      // now iterate
      for (var planetId = 0; planetId <= numPlanets; planetId++) {
        self.loadPlanet(planetId)
        // TODO Would rather return them here but i cant seem to.        
      }
      self.setStatus(numPlanets + " Planets loaded.")      
    }).catch(function(e) {
      console.log(e);
      self.setStatus("Error sending coin; see log.");
    });

  },

  loadPlanet: function(planetId) {
    var self = this;
    var solar;
    Solar.deployed().then(function(instance) {
        solar = instance;
        return solar.getPlanet(planetId, { from: account } );
      }).then(function(data) {
        // debugger;
        var name = web3.toAscii(data[0])
        console.log(name);
        var planet = new Planet(planetId, name, data[1], data[2], data[3], data[4], data[5]);
        planets.push(planet);
        if (typeof planets != 'undefined' && planets.length >= numPlanets) {
          window.Graphics.start();
        }
      }).catch(function(e) {
        console.log(e);
        self.setStatus("Error. See log.");
      });
  },

  setStatus: function(message) {
    var status = document.getElementById("status");
    status.innerHTML = message;
  },

};

window.Physics = {};

var two

window.Graphics = {
  start: function() {
    
    var elem = document.getElementById('viewport');
    two = new Two({ width: 500, height: 800 }).appendTo(elem);
    
    var circle = two.makeCircle(-70, 0, 50);
    var self = this;

    planets.map(function(planet) { 
      // var radius = planet.mass // simple, for now.
      // var circle = two.makeCircle(planet.x, planet.y, radius);

      self.drawPlanet(planet); // WHY DOES THIS NO TWORK
    });

    circle.fill = '#FF8000';

    var group = two.makeGroup(circle);
    group.translation.set(two.width / 2, two.height / 2);
    group.scale = 0;
    group.noStroke();

    // Bind a function to scale and rotate the group
    // to the animation loop.
    two.bind('update', function(frameCount) {
      // This code is called everytime two.update() is called.
      // Effectively 60 times per second.
      if (group.scale > 0.9999) {
        group.scale = group.rotation = 0;
      }
      var t = (1 - group.scale) * 0.125;
      group.scale += t;
      group.rotation += t * 4 * Math.PI;
    }).play();  // Finally, start the animation loop
  },

  drawPlanet: function(planet) {
    var radius = planet.mass // simple, for now.
    var circle = two.makeCircle(planet.x, planet.y, radius);
    circle.fill = '#FF8000';
  },
};

window.addEventListener('load', function() {
  // Checking if Web3 has been injected by the browser (Mist/MetaMask)
  if (typeof web3 !== 'undefined') {
    console.warn("Using web3 detected from external source.")
    // Use Mist/MetaMask's provider
    window.web3 = new Web3(web3.currentProvider);
  } else {
    console.warn("No web3 detected")
  }

  App.start();
  // Graphics.start();
});
