memory_property(Creep.prototype, 'assigned', false);
memory_property(Creep.prototype, 'assigned_to', NONE);
memory_property(Creep.prototype, 'task', NONE);
memory_property(Creep.prototype, 'target', NONE);
memory_property(Creep.prototype, 'order', NONE);

Creep.prototype.empty = function() {
	return _.sum(this.carry) == 0;
};

Creep.prototype.full = function() {
	return _.sum(this.carry) == this.carryCapacity;
};

Creep.prototype.travelTo = function(t, opts) {
	if (t) {
		if (opts) {
			return this.moveTo(t, opts);
		} else {
			return this.moveTo(t, {ignoreCreeps : true});
		}
	}
};

Creep.prototype.travelToTarget = function(opts) {
	let t = Game.getObjectById(target_id);
	if (t) {
		if (opts) {
			return this.moveTo(t, opts);
		} else {
			return this.moveTo(t, {ignoreCreeps : true});
		}
	}
};
