require('util');
require('room.proto');

function containers_at(room_pos) {
	let structures = room_pos.lookFor(LOOK_STRUCTURES);
	return _.filter(structures, {'structureType': STRUCTURE_CONTAINER})
};

Source.prototype.energy_available_at = function(slot) {
	let energy = _.sumBy(slot.lookFor(LOOK_ENERGY), 'amount');
	let containers = containers_at(slot);
	energy += _.reduce(containers,
		(sum, container) => sum + container.store.getUsedCapacity(RESOURCE_ENERGY),
		0);
	return energy;
}

Source.prototype.init = function() {
	if (this.initialized) {
		return;
	}
	let slots = this.room.adjacent_nonwall(this.pos);
	_.forEach(slots, slot => {
		let room_pos = new RoomPosition(slot.x, slot.y, this.room.name);
		this.slots.push(room_pos);
	});
	this.initialized = true;
};

Source.prototype.request_harvesters = function(spawner) {
	let slots = _.filter(this.slots, slot => !slot.requested);
	_.each(slots, slot => {
		spawner.add_build_order([MOVE, WORK, WORK], 'harvester');
		slot.requested = true;
	});
};

Source.prototype.register_harvester = function(harvester) {
	let i = _.findIndex(this.slots, slot => !slot.assigned);
	if (i < 0) {
		return false;
	}
	this.slots[i].assigned = harvester.id;
	harvester.assigned_to = this.id;
	return true;
};

Source.prototype.run_harvesters = function() {
	_.each(this.slots, slot => {
		if (slot.assigned) {
			let harvester = Game.getObjectById(slot.assigned);
			if (!harvester) {
				delete slot.assigned;
				delete slot.requested;
				return;
			}

			let result = harvester.harvest(this);
			if (result == ERR_NOT_IN_RANGE) {
				harvester.moveTo(this);
			}
		}
	});

};