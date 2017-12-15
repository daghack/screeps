add_memory(Source.prototype, 'sources', source => source.id);
memory_property(Source.prototype, 'initialized', false);
memory_property(Source.prototype, 'slots', Array, true);

Source.prototype.init = function() {
	console.log("Initializing Source");
	if (this.initialized) {
		return;
	}
	let slots = this.room.adjacent_nonwall(this.pos);
	_.forEach(slots, slot => {
		let roomPos = new RoomPosition(slot.x, slot.y, this.room.name);
		roomPos.assigned = NONE;
		roomPos.requested = false;
		this.slots.push(roomPos);
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

Source.prototype.schedule_harvester = function(manager, slot) {
	console.log("SOURCE " + this.id + " SCHEDULING HARVESTER");
	let name = "HARVESTER_" + _.random(0, Number.MAX_SAFE_INTEGER);
	manager.schedule_creep(name, [WORK, MOVE], {memory : {assigned_to : this.id}});
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

Source.prototype.tick = function(manager) {
	console.log("Source " + this.id + " Tick");
	_.forEach(this.slots, slot => {
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
				harvester.moveTo(pos, {visualizePathStyle:{}});
			} else {
				harvester.harvest(this);
			}
		} else if (slot.assigned == NONE && !slot.requested) {
			this.schedule_harvester(manager, slot);
		}
	});
};
