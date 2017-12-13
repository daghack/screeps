require('proto');
var harvester = require('harvester');

function clean_memory() {
	_.forEach (Memory.creeps, (creep, name) => {
		if (!Game.creeps[name]) {
			delete Memory.creeps[name];
		}
	});
};

module.exports.loop = function () {
	clean_memory()
	_.forEach (Game.creeps, creep => {
		if (creep.spawning) {
			return;
		}
		creep.transition();
		creep.action(creep.room);
	});
};
