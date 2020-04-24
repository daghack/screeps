require('spawn.proto');
require('creep.proto');
require('room.proto');
require('source.proto');

var util = require('util');

module.exports.loop = function() {
	util.add_memory_property(Source, 'sources', source => source.id);
	util.memory_property(Source, 'initialized', Boolean);
	util.memory_property(Source, 'slots', Array);
	util.memory_property(StructureSpawn, 'build_orders', Array);
	util.memory_property(StructureSpawn, 'sorted', Boolean);
	util.memory_property(Creep, 'role', String);
	util.memory_property(Creep, 'assigned_to', String)
	_.each(Game.spawns, function(spawn) {
		console.log(spawn.spawn_from_build_order());
	});
	_.each(Game.creeps, function(creep) {
		if (creep.spawning) {
			return;
		}
		if (creep.role == 'harvester') {
			if(!creep.assigned_to) {
				let sources = creep.room.sources();
				_.findIndex(sources, source => source.register_harvester(creep));
			}
		}
	});
	_.each(Game.rooms, room => {
		_.each(room.sources(), source => {
			source.init();
			source.request_harvesters(_.sample(Game.spawns));
			source.run_harvesters();
		});
	});
};
