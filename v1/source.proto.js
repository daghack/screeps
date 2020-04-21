add_memory(Source.prototype, 'sources', source => source.id);
memory_property(Source.prototype, 'initialized', false);
memory_property(Source.prototype, 'slots', Array, true);
memory_property(Source.prototype, 'scheduled_withdraws', Object, true);

function energy_available_at(room_pos) {
	let resources = room_pos.lookFor(LOOK_ENERGY);
	if (resources.length > 0) {
		return resources[0].amount;
	}
	return 0;
}

Source.prototype.init = function() {
	console.log("Initializing Source");
	if (this.initialized) {
		return;
	}
	let slots = this.room.adjacent_nonwall(this.pos);
	_.forEach(slots, slot => {
		let room_pos = new RoomPosition(slot.x, slot.y, this.room.name);
		this.add_slot_build_orders(manager, room_pos);
		room_pos.assigned = NONE;
		room_pos.requested = false;
		room_pos.energy_available = 0;
		this.slots.push(room_pos);
	});
	this.initialized = true;
};

Source.prototype.gather_from_position = function(creep, room_pos) {
	let withdraw_amount = creep.scheduled_withdraw.amount;
	let available = creep.store.getFreeCapacity(RESOURCE_ENERGY);
	let needed = withdraw_amount - available;

	let dropped_energy = room_pos.lookFor(LOOK_ENERGY);
	if (dropped_energy.length > 0) {
		creep.pickup(dropped_energy[0]);
		return;
	}

	let container = room_pos.lookFor(LOOK_STRUCTURES);
	container = _.filter(container, {filter: {'structureType': STRUCTURE_CONTAINER}});
	if (container.length > 0) {
		let stored = container.store.getUsedCapacity(RESOURCE_ENERGY);
		let to_withdraw = _.min([stored, needed]);
		creep.withdraw(container[0], RESOURCE_ENERGY, to_withdraw);
	}
};

Source.prototype.pickup_energy = function(creep) {
	let highest_slot = _.sortByOrder(this.slots, ['energy_available'], ['desc'])[0];
	let slot_pos = new RoomPosition(highest_slot.x, highest_slot.y, highest_slot.roomName);

	if (creep.pos.isNearTo(slot_pos)) {
		this.gather_from_position(creep, slot_pos);
	} else {
		creep.travelTo(slot_pos);
	}
};

Source.prototype.available_resources = function() {
	let gross = _.sum(this.slots, 'energy_available');
	let scheduled = _.sum(this.scheduled_withdraws);
	return gross - scheduled;
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

Source.prototype.schedule_harvester = function(manager, slot) {
	console.log("SOURCE " + this.id + " SCHEDULING HARVESTER");
	let name = _.uniqueId("HARVESTER_");
	manager.schedule_creep(name, [WORK, MOVE], {memory : {assigned_to : this.id}}, [WORK, WORK, MOVE]);
	if (slot) {
		slot.requested = true;
	} else {
		let available_slot = _.findIndex(this.slots, {'assigned':NONE, 'requested':false});
		if (available_slot < 0) {
		//#TODO Do something if slots are filled up?
			return;
		}
		this.slots[available_slot].requested = true;
	}
};

Source.prototype.add_slot_build_orders = function(manager, room_pos) {
	let toremove = room_pos.lookFor(LOOK_CONSTRUCTION_SITES);
	toremove = _.filter(toremove, {filter: a => a.structureType != STRUCTURE_CONTAINER});
	let constr = room_pos.lookFor(LOOK_CONSTRUCTION_SITES);
	constr = _.filter(constr, {filter: {'structureType': STRUCTURE_CONTAINER}});
	if (constr.length == 0) {
		manager.schedule_build(this.room, STRUCTURE_CONTAINER, room_pos, true);
	}

};

Source.prototype.tick = function(manager) {
	console.log("Source " + this.id + " Tick");
	_.forEach(this.slots, slot => {
		let room_pos = new RoomPosition(slot.x, slot.y, this.room.name);
		slot.energy_available = energy_available_at(room_pos);
		if (slot.assigned != NONE && !Game.creeps[slot.assigned]) {
			slot.assigned = NONE;
		}
		if (slot.assigned != NONE) {
			let harvester = Game.creeps[slot.assigned];
			if (harvester.spawning) {
				return;
			}
			if (harvester.pos.x != slot.x || harvester.pos.y != slot.y) {
				let pos = new RoomPosition(slot.x, slot.y, slot.roomName);
				harvester.travelTo(pos);
			} else {
				harvester.harvest(this);
			}
		} else if (slot.assigned == NONE && !slot.requested) {
			this.schedule_harvester(manager, slot);
		}
	});
};

Source.prototype.schedule_withdraw = function(creep, amount) {
	let available = this.available_resources();
	if (available < amount) {
		amount = available;
	}
	if (available > 0) {
		this.schedule_withdraw[creep.name] = amount;
		return amount;
	} else {
		return -1;
	}
};

Source.prototype.complete_withdraw = function(creep) {
	delete this.scheduled_withdraws[creep.name];
};
