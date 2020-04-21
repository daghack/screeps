class Receiver {
	constructor(a) {
		this.accepting = a;
	}

	is_accepting(label) {
		return _.has(this.msg_box, label);
	}

	send_msg(label, msg) {
		console.log(`Received '${label}' event.`);
	}

	sort_by_heuristic(label, h) {
		this.msg_box[label] = _.sortBy(this.msg_box[label], msg => -1 * h(msg));
	}
};

class ParentReceiver {
	constructor() {
		this.registered_receivers = {};
	}

	register_receiver(receiver) {
		_.each(receiver.accepting, function (label) {
			if (!this.registered_receivers[label]) {
				this.registered_receivers[label] = [];
			}
			this.registered_receivers[label].push(receiver);
		}.bind(this));
	}

	broadcast(label, msg) {
		// Send to all receivers, regardless of whether or not they ack.
		_.forEach(this.registered_receivers[label], function(receiver) {
			receiver.send_msg(label, msg);
		});
	}

	send(label, msg) {
		// Send to all receivers until it is acked.
		_.find(this.registered_receivers[label], function(receiver) {
			receiver.send_msg(label, msg);
		});
		// #TODO - Save event if nobody was able to handle it.
	}
};

module.exports = {
	"ParentReceiver": ParentReceiver,
	"Receiver": Receiver,
};
