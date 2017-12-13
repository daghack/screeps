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
	let spawn1 = Game.spawns.Spawn1;
	let sources = spawn1.room.find(FIND_SOURCES);
	_.forEach(sources, source => {
		let path = spawn1.pos.findPathTo(source, {ignoreCreeps : true});
		spawn1.room.visual.poly(path, {stroke : 'black'});
	});
	_.forEach(sources, source => {
		let path = spawn1.room.controller.pos.findPathTo(source, {ignoreCreeps : true});
		spawn1.room.visual.poly(path, {stroke : 'black'});
	});
	let path = spawn1.room.controller.pos.findPathTo(spawn1, {ignoreCreeps : true});
	spawn1.room.visual.poly(path, {stroke : 'black'});
	clean_memory();
	_.forEach (Game.creeps, creep => {
		if (creep.spawning) {
			return;
		}
		creep.transition(creep.room, roles, spawnfiller_harvester);
		creep.action(creep.room, roles, spawnfiller_harvester);
	});
};
