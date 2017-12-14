if (!Memory.sources) {
	Memory.sources = {};
}

Object.defineProperty(Source.prototype, 'memory', {
	writeable : true,
	get : function() {
		if (!Memory.sources[this.id]) {
			Memory.sources[this.id] = {};
		}
		return Memory.sources[this.id];
	},
	set : function(x) {
		Memory.sources[this.id] = x;
	}
});

Source.prototype.slots = function() {
	return this.room.adjacent_plains(this.pos);
};

Source.prototype.init = function() {
	//Move road registering here eventually.
};
