require('proto');

var harvester = require('harvester');
var upgrade_harvester = require('upgrade_harvester');
var spawnfiller_harvester = require('spawnfiller_harvester');

var roles = {};
roles[harvester.role] = harvester;
roles[upgrade_harvester.role] = upgrade_harvester;
roles[spawnfiller_harvester.role] = spawnfiller_harvester;

function clean_memory() {
	_.forEach (Memory.creeps, (creep, name) => {
		if (!Game.creeps[name]) {
			delete Memory.creeps[name];
		}
	});
}

module.exports.loop = function () {
	clean_memory();
	_.forEach (Game.creeps, creep => {
		if (creep.spawning) {
			return;
		}
		creep.transition(creep.room, roles, spawnfiller_harvester);
		creep.action(creep.room, roles, spawnfiller_harvester);
	});
};
