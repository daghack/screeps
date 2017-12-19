Room.prototype.sources = function() {
	return this.find(FIND_SOURCES);
};

Room.prototype.add_to_build = function(position, structure) {
	let index = to_str(position);
	if (!this.buildlist[index]) {
		this.buildlist[index] = { x : position.x, y : position.y, struct : structure };
	}
};

Room.prototype.adjacent_nonwall = function(pos) {
	let top_b = Math.max(0, pos.y-1);
	let bottom_b = Math.min(49, pos.y+1);
	let left_b = Math.max(0, pos.x-1);
	let right_b = Math.min(49, pos.x+1);
	let area = this.lookAtArea(top_b, left_b, bottom_b, right_b, true);
	return _.filter(area, obj => {
		return obj.type == 'terrain' && obj.terrain != 'wall';
	});
};

Object.defineProperty(Room.prototype, 'cost_matrix', {
	get : function() {
		console.log("FETCHING COST_MATRIX");
		if(!this._cost_matrix) {
			let cmatrix = new PathFinder.CostMatrix();
			this.find(FIND_STRUCTURES).forEach(function(struct) {
				if (struct.structureType == STRUCTURE_ROAD) {
					cmatrix.set(struct.pos.x, struct.pos.y, 1);
				} else if (struct.structureType != STRUCTURE_CONTAINER &&
					(struct.structureType != STRUCTURE_RAMPART || !struct.my)) {
					cmatrix.set(struct.pos.x, struct.pos.y, 255);
				}
			});
			_.forEach(this.sources(), source => {
				_.forEach(source.slots, slot => {
					cmatrix.set(slot.x, slot.y, 255);
				});
			});
			this._cost_matrix = cmatrix;
			console.log("COST MATRIX RETURNED:", JSON.stringify(this._cost_matrix.serialize()));
			return this._cost_matrix;
		} else {
			console.log("COST MATRIX EXISTS:", JSON.stringify(this._cost_matrix.serialize()));
			return this._cost_matrix;
		}
	},
	set : function(cmatrix) {
		this._cost_matrix = matrix;
	}
});