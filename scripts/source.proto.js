if (!Memory.sources) {
	Memory.sources = {};
}

Object.defineProperty(Source.prototype, 'memory', {
	get : function() {
		console.log("ALL: " + JSON.stringify(Memory.sources));
		if (!Memory.sources[this.id]) {
			Memory.sources[this.id] = {};
		}
		console.log(JSON.stringify("SOLO: " + JSON.stringify(Memory.sources[this.id])));
		return Memory.sources[this.id];
	},
	set : function(x) {
		Memory.sources[this.id] = x;
	}
});

memory_property(Source.prototype, 'initialized', false);
memory_property(Source.prototype, 'assigned_harvesters', {});
memory_property(Source.prototype, 'slots', new Array());

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
