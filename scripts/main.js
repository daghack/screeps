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
	clean_memory();
	_.forEach(Game.rooms, room => {
		room.buildlist_visual();
		_.forEach(room.buildlist, (build, key) => {
			if (room.createConstructionSite(build.x, build.y, build.struct) == OK) {
				delete room.buildlist[key];
			}
		});
	});
	_.forEach(Game.spawns, spawn => {
		spawn.add_initial_build_orders();
	});
	_.forEach (Game.creeps, creep => {
		if (creep.spawning) {
			return;
		}
		creep.transition(creep.room, roles, spawnfill_harvester);
		creep.action(creep.room, roles, spawnfill_harvester);
	});
};
