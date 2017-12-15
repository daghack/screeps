add_memory(Source.prototype, 'sources', source => source.id);
memory_property(Source.prototype, 'initialized', false);
memory_property(Source.prototype, 'slots', Array, true);

Source.prototype.init = function() {
	if (this.initialized) {
		return;
	}
	let slots = this.room.adjacent_plains(this.pos);
	_.forEach(slots, slot => {
		let roomPos = new RoomPosition(slot.x, slot.y, this.room.name);
		roomPos.assigned = NONE;
		this.slots.push(roomPos);
	});
	this.initialized = true;
};

Source.prototype.assign_worker = function(harvester) {
	console.log(harvester.name + " being assigned.");
	if(harvester.assigned) {
		return;
	}
	let available_slot = _.findIndex(this.slots, 'assigned', NONE);
	if (available_slot < 0) {
		console.log("NO SLOTS AVAILABLE");
		console.log(available_slot);
		console.log(JSON.stringify(this.slots));
	//#TODO Do something if slots are filled up?
		return;
	}
	this.slots[available_slot].assigned = harvester.name;
	harvester.assigned = true;
};

Source.prototype.schedule_harvester = function(manager) {
	let name = "HARVESTER_" + _.random(0, Number.MAX_SAFE_INTEGER);
	manager.schedule_creep(name, [WORK, WORK, MOVE], {memory : {assigned_to : this.id}});
};

Source.prototype.tick = function(manager) {
	console.log("Source " + this.id + " tick");
	console.log(JSON.stringify(this.memory));
	_.forEach(this.slots, slot => {
		if (slot.assigned && !Game.creeps[slot.assigned]) {
			slot.assigned = NONE;
		}
		if (slot.assigned != NONE) {
			let harvester = Game.creeps[slot.assigned];
			if (harvester.spawning) {
				return;
			}
			if (harvester.harvest(this) == ERR_NOT_IN_RANGE) {
				harvester.moveTo(this, {visualizePathStyle:{}});
			}
		} else if (!slot.requested) {
		}
	});
};
