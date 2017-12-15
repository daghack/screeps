require('proto');
require('source.proto');
var m = require('manager');

var harvester = require('harvester');
var upgrade_harvester = require('upgrade_harvester');
var spawnfill_harvester = require('spawnfill_harvester');

var roles = {};
roles[harvester.role] = harvester;
roles[upgrade_harvester.role] = upgrade_harvester;
roles[spawnfill_harvester.role] = spawnfill_harvester;

function clean_memory() {
	if (!Memory.init) {
		Memory = {init : true};
	}
	_.forEach (Memory.creeps, (creep, name) => {
		if (!Game.creeps[name]) {
			delete Memory.creeps[name];
		}
	});
}

module.exports.loop = function () {
	clean_memory();
	let manager = new m.Manager('main manager', 15);
	_.forEach(Game.spawns, spawn => {
		manager.initialize(spawn.room);
		manager.tick();
		return;
	});
};
