pragma solidity ^0.4.18;
// We have to specify what version of compiler this code will compile with

contract Solar {
    struct Planet {
        uint mass;
        uint x;
        uint y;
        uint vx;
        uint vy;
        bytes32 name; // strings are bad.
    }
  
    // mapping (bytes32 => Planet) public planetMap;
    // Planet[] planetList; // = new Planet[](128); // Would like to only allow N

    /** array holding ids of the curret planets*/
    uint32[] public ids;
    /** the id to be given to the net planet **/
    uint32 public nextId;
    /** the planet belonging to a given id */
    mapping(uint32 => Planet) planets;


    /** total number of planets in the game (uint32 because of multiplication issues) */
    uint32 public numPlanets;
    /** The maximum of planets allowed in the game */
    uint16 public maxPlanets;

    /*
     *  adds a single planet
     */
    function addPlanet(bytes32 name, uint x, uint y, uint initialVx, uint initialVy) public payable returns (Planet planet) {
        var momentum = msg.value;
        var velocityMagnitude = sqrt(initialVx*initialVx + initialVy*initialVy);
        // TODO: if velocityMagnitude is 0...
        planet.mass = momentum / velocityMagnitude;
        
        planet.x = x;
        planet.y = y;
        planet.vx = initialVx * velocityMagnitude;
        planet.vy = initialVy * velocityMagnitude;
        planet.name = name;

        addPlanetToStorage(planet);
        return planet;
    }

    function addPlanetToStorage(Planet planet) internal {
        // TODO: use maxPlanets eventually
        var id = numPlanets;
        planets[id] = planet;
        numPlanets++;
    }

    /****************** GETTERS *************************/


    // Cannot return a struct externally
    function getPlanet(uint32 planetId) public constant returns(bytes32 name, uint mass, uint x, uint y, uint vx, uint vy) {
        var planet = planets[planetId];
        return (planet.name, planet.mass, planet.x, planet.y, planet.vx, planet.vy);
    }

    function get10Planets(uint16 startIndex) public constant returns(Planet[10] planetsToReturn) {
        uint32 endIndex = startIndex + 10 > numPlanets ? numPlanets : startIndex + 10;
        for (uint16 i = startIndex; i < endIndex; i++) {
            planetsToReturn[i] = planets[i];
        }
        return planetsToReturn;
    }
    
    /****************** HELPERS *************************/

    // From PR#50
    function sqrt(uint x) pure public returns (uint y) {
        uint z = (x + 1) / 2;
        y = x;
        while (z < y) {
            y = z;
            z = (x / z + z) / 2;
        }
    }
}