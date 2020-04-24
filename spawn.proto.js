StructureSpawn.prototype.build_heuristic = function(build_order) {
	return 0;
};

StructureSpawn.prototype.add_build_order = function(body, role) {
	let build_order = {'body': body, 'role': role};
	console.log(build_order);
	this.build_orders.push(build_order);
	this.sorted = false;
};

StructureSpawn.prototype.pop_build_order = function() {
	if (this.build_orders.length == 0) {
		return undefined;
	}
	this.sort_builds();
	return this.build_orders.pop();
};

StructureSpawn.prototype.sort_builds = function() {
	if (this.sorted) {
		return;
	}
	this.build_orders = _.sortBy(this.build_orders, this.build_heuristic);
	this.sorted = true;
}

StructureSpawn.prototype.peek_build_order = function() {
	if (this.build_orders.length == 0) {
		return undefined;
	}
	this.sort_builds();
	return this.build_orders[this.build_orders.length - 1];
};

StructureSpawn.prototype.energy_available = function() {
	return this.room.energyAvailable;
};

StructureSpawn.prototype.next_name = function() {
	return this.id + '_' + Game.time.toString();
};

StructureSpawn.prototype.spawn_from_build_order = function() {
	let order = this.peek_build_order();
	if (!order) {
		return;
	}
	let result = this.spawnCreep(order.body, this.next_name(), {'memory': {'role': order.role}});
	if (result == OK) {
		this.pop_build_order();
	}
	return result;
};