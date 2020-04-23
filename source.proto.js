require('proto');
require('room.proto');

add_memory(Source.prototype, 'sources', source => source.id);
memory_property(Source.prototype, 'initialized', false);
memory_property(Source.prototype, 'slots', Array, true);

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
	console.log("Initializing Source");
	if (this.initialized) {
		return;
	}
	let slots = this.room.adjacent_nonwall(this.pos);
	_.forEach(slots, slot => {
		let room_pos = new RoomPosition(slot.x, slot.y, this.room.name);
		room_pos.assigned = false;
		this.slots.push(room_pos);
	});
	this.initialized = true;
};

Source.prototype.assign_worker = function(harvester) {
	let available_slot = _.findIndex(this.slots, 'assigned', NONE);
	if (available_slot < 0) {
	//#TODO Do something if slots are filled up?
		return;
	}
	this.slots[available_slot].assigned = harvester.name;
	this.slots[available_slot].requested = false;
	harvester.assigned = true;
};
