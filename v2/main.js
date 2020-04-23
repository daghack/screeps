require('spawn.proto');
require('creep.proto');
require('room.proto');
require('source.proto');

module.exports.loop = function() {
	_.each(Game.spawns, function(spawn) {
	});
	_.each(Game.creeps, function(creep) {
		if (creep.spawning) {
			return;
		}
		if (creep.empty(RESOURCE_ENERGY) && creep.action != 'harvest') {
			creep.action = 'harvest';
			creep.target = _.sample(creep.room.sources).id;
		} else if (creep.full(RESOURCE_ENERGY) && creep.action != 'deposit_energy') {
			creep.action = 'deposit_energy';
			creep.target = _.sample(Game.spawns).id;
		}
		creep.perform_action();
	});
};
