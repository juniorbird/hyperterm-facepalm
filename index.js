'use strict';

/*
First, capture if the user has typed a typo
If so, dispatch an action that says "d'oh!"
(Don't dispatch the original one, that one
provided no value and now is done)
*/
exports.middleware = (store) => (next) => (action) => {
	if ('SESSION_ADD_DATA' === action.type) {
		const { data } = action;
		if (/(.*: command not found)|(command not found: .*)/.test(data)) {
			store.dispatch({
				type: 'FACEPALM_MODE_TOGGLE'
			});
			console.log('typo!');
		} else {
			next(action);
		}
	} else {
		next(action);
	}
};

/*
What handles this action? In this case
it's the reducer for the user interface
We set the facepalm mode in state
and then things are looking great!
*/
exports.reduceUI = (state, action) => {
	switch (action.type) {
		case 'FACEPALM_MODE_TOGGLE':
			console.log('facepalm mode set');
			return state.set('facepalmMode', 'true');
	}
	return state;
};

/*
Now we pass it down to the Term
component that will send the burn
*/
exports.mapTermsState = (state, map) => {
	console.log('mapped!');
	return Object.assign(map, {
		facepalmMode: state.ui.facepalmMode
	});
};

/*
Sadly the final terminal to style is in an iFrame
Passing down through props is the way to make it the same
*/
exports.getTermProps = (uid, parentProps, props) => {
	console.log('props gotten!');
	return Object.assign(props, {
		facepalmMode: parentProps.facepalmMode
	});
};

exports.decorateTerm = (Term, { React, notify }) => {
	return class extends React.Component {
		constructor (props, context) {
			super(props, context);
			this._createReaction = this._createReaction.bind(this);
			this._onTerminal = this._onTerminal.bind(this);
			console.log('created!');
		}

		_onTerminal (term) {
			console.log('onTerminal!');
			if (this.props.onTerminal) this.props.onTerminal(term);
			this._div = term.div_;
			this._window = term.document_.defaultView;
			this._createReaction();
		}

		_createReaction () {
			console.log('creating reaction!');
			this._reaction = document.createElement('div');
			this._reaction.style.position = 'absolute';
			this._reaction.style.top = 0;
			this._reaction.style.left = 0;
			this._reaction.width = window.innerWidth;
			this._reaction.height = window.innerHeight;
			this._reaction.textContent = 'Foo!Bar!!';
			this._reaction.backgroundImage = 'url("https://media.giphy.com/media/zNrg4ulntLBMk/giphy.gif")';
			document.body.appendChild(this._reaction);
			console.log('child appended!');
		};

		componentWillReceiveProps (next) {
			if (next.facepalmMode || this.props.facepalmMode) {
				console.log('facepalm such on');
			}
		}

		shouldComponentUpdate (next) {
			console.log('shd update');
		}

		componentWillUpdate (next) {
			console.log('will update');
		}

		componentWillUnmount () {
			console.log('unmounted');
			document.body.removeChild(this._reaction);
		}

		render () {
			console.log('rendered!');
			return React.createElement(Term, Object.assign({}, this.props, {
				onTerminal: this._onTerminal
			}));
		}
	}
};
