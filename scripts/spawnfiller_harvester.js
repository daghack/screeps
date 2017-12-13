module.exports = {
	role : 'SPAWNFILLER_HARVESTER',
	parts : [WORK, CARRY, CARRY, MOVE, MOVE],
	action : function(creep, room) {
		if (creep.task == HARVEST) {
			creep.harvestRoom(room);
		} else if (creep.task == UPGRADE) {
			creep.spawnfillRoom(room);
		}
	},
	transition : function(creep, room) {
		if (creep.empty()) {
			creep.task = HARVEST;
		} else if (creep.full()) {
			creep.task = UPGRADE;
		}
	}
};
