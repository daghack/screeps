memory_property(Room.prototype, 'buildlist', Object, true);

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
