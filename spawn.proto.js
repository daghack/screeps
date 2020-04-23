require('proto');

memory_property(StructureSpawn.prototype, 'build_orders', Array, true);

StructureSpawn.prototype.build_heuristic = function(build_order) {
	return 0;
};

StructureSpawn.prototype.add_build_order = function(name, body) {
	let build_order = {'name': name, 'body': body};
	this.build_orders.push(build_order);
};

StructureSpawn.prototype.take_next_build_order = function() {
	if (this.build_order.length == 0) {
		return ERR_INVALID_TARGET;
	}
	this.build_orders = _.sortBy(this.build_orders, this.build_heuristic);
	return this.build_order.pop();
};

StructureSpawn.prototype.energy_available = function() {
	return this.room.energyAvailable;
};
