require('proto');

var harvester = require('harvester');
var upgrade_harvester = require('upgrade_harvester');
var spawnfill_harvester = require('spawnfill_harvester');

var roles = {};
roles[harvester.role] = harvester;
roles[upgrade_harvester.role] = upgrade_harvester;
roles[spawnfill_harvester.role] = spawnfill_harvester;

function clean_memory() {
	_.forEach (Memory.creeps, (creep, name) => {
		if (!Game.creeps[name]) {
			delete Memory.creeps[name];
		}
	});
}

module.exports.loop = function () {
	let spawn1 = Game.spawns.Spawn1;
	spawn1.add_initial_build_orders();
	spawn1.buildlist_visual();
	let path = spawn1.room.controller.pos.findPathTo(spawn1, {ignoreCreeps : true, ignoreRoads : true});
	spawn1.room.visual.poly(path, {stroke : 'black'});
	clean_memory();
	_.forEach (Game.creeps, creep => {
		if (creep.spawning) {
			return;
		}
		creep.transition(creep.room, roles, spawnfill_harvester);
		creep.action(creep.room, roles, spawnfill_harvester);
	});
};
