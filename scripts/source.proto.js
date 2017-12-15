//if (!Memory.sources) {
//	Memory.sources = {};
//}
//
//Object.defineProperty(Source.prototype, 'memory', {
//	get : function() {
//		if (!Memory.sources[this.id]) {
//			Memory.sources[this.id] = {};
//		}
//		return Memory.sources[this.id];
//	},
//	set : function(x) {
//		Memory.sources[this.id] = x;
//	}
//});
add_memory(Source.prototype, 'sources', source => source.id);
memory_property(Source.prototype, 'initialized', false);
memory_property(Source.prototype, 'assigned_harvesters', Object, true);
memory_property(Source.prototype, 'slots', Array, true);

Source.prototype.init = function(manager) {
	if (this.initialized) {
		return;
	}
	console.log(this.id);
	let slots = this.room.adjacent_plains(this.pos);
	_.forEach(slots, slot => {
		let roomPos = new RoomPosition(slot.x, slot.y, this.room.name);
		roomPos.assigned = NONE;
		this.slots.push(roomPos);
	});
	if (manager) {
		this.request_harvester(manager);
		//#TODO Move road registering here.
	}
	this.initialized = true;
};

Source.prototype.harvesters_needed = function() {
	return this.slots.length - _.size(this.assigned_harvesters);
};

Source.prototype.assign_harvester = function(harvester) {
	this.assigned_harvesters[harvester.name] = harvester;
	let available_slot = _.findIndex(this.slots, 'assigned', NONE);
	if (available_slot < 0) {
	//#TODO Do something if slots are filled up?
		return;
	}
	this.slots[available_slot].assigned = harvester.name;
};

Source.prototype.request_harvester = function(manager) {
	/*
		* manager.request_creep([WORK, WORK, MOVE], {self_managed : false, assigned_to : this.id});
	*/
};

Source.prototype.tick = function(manager) {
	_.forEach(this.slots, slot => {
		if (slot.assigned && !Game.creeps[slot.assigned]) {
			delete slot.assigned;
		}
		if (slot.assigned) {
			let harvester = this.assigned_harvesters[slot.assigned];
			if (harvester.spawning) {
				return;
			}
			if (harvester.harvest(this) == ERR_NOT_IN_RANGE) {
				this.moveTo(this, {visualizePathStyle:{}});
			}
		} else {
		}
	});
};
