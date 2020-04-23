require('proto');

memory_property(Creep.prototype, 'target', "");
memory_property(Creep.prototype, 'action', "");

Creep.prototype.stored = function(resource_type) {
	return this.store.getUsedCapacity(resource_type);
};

Creep.prototype.capacity = function(resource_type) {
	return this.store.getCapacity(resource_type);
};

Creep.prototype.free_capacity = function(resource_type) {
	return this.store.getFreeCapacity(resource_type);
};

Creep.prototype.full = function(resource_type) {
	return this.free_capacity(resource_type) == 0;
};

Creep.prototype.empty = function(resource_type) {
	return this.stored(resource_type) == 0 && this.capacity(resource_type) > 0;
};

Creep.prototype.move_to = function(target) {
	// This is obviously the LEAST efficient version of this function.
	// It includes neither caching nor any other methods of reducing
	// CPU functionality.
	return this.moveTo(target);
};

Creep.prototype.deposit_to = function(target, resource_type) {
	if (target instanceof RoomPosition) {
		if (!this.pos.isEqualTo(target)) {
			return ERR_NOT_IN_RANGE;
		}
		return this.drop(resource_type);
	} else if (target instanceof Structure || target instanceof Creep) {
		return this.transfer(target, resource_type);
	}
	return ERR_INVALID_TARGET;
};

Creep.prototype.pickup_from = function(target, resource_type) {
	if (target instanceof RoomPosition) {
		if (!this.pos.isNearTo(target)) {
			return ERR_NOT_IN_RANGE;
		}
		let resources = target.lookFor(LOOK_RESOURCES);
		let matching_resources = _.filter(resource, {filter: {'resourceType': resource_type}});
		if (matching_resources.length == 0) {
			return ERR_INVALID_TARGET;
		}
		return this.pickup(matching_resources[0]);
	} else if (target instanceof Structure || target instanceof Creep) {
		return this.withdraw(target, resource_type);
	}
	return ERR_INVALID_TARGET;
};

Creep.prototype.pickup_energy = function(target) {
	return this.pickup_from(target, RESOURCE_ENERGY);
};

Creep.prototype.deposit_energy_to = function(target) {
	return this.deposit_to(target, RESOURCE_ENERGY);
};

Creep.prototype.perform_action = function() {
	if (!this.target || !this.action || !this[this.action]) {
		return ERR_INVALID_TARGET;
	}
	let target = Game.getObjectById(this.target);
	if (!target) {
		return ERR_INVALID_TARGET;
	}
	let result = this[this.action](this.target);
	if (result == ERR_NOT_IN_RANGE) {
		return this.move_to(this.target);
	}
	return result;
};
