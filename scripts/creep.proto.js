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
	let goal = {pos : t.pos, range : 1};
	let ret = PathFinder.search(
		this.pos, goal, {
			plainCost : 2,
			swampCost : 6,
			roomCallback : roomname => {
				if (!Game.rooms[roomname]) {
					return new PathFinder.CostMatrix();
				} else {
					return Game.rooms[roomname].cost_matrix;
				}
			}
		}
	);
	if (ret.incomplete) {
		return ERR_NO_PATH;
	}
	let pos = ret.path[0];
	let err = this.move(this.pos.getDirectionTo(pos));
	return err;
//	if (opts) {
//		return this.moveTo(t, opts);
//	} else {
//		//return this.moveTo(t, {ignoreCreeps : true});
//		return this.moveTo(t);
//	}
};

Creep.prototype.travelToTarget = function(opts) {
	let t = Game.getObjectById(this.target);
	if (t) {
		return this.travelTo(t);
	} else {
		return ERR_INVALID_TARGET;
	}
};
