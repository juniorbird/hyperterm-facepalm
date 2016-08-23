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
			console.log('typo!');
			store.dispatch({
				type: 'FACEPALM_MODE_ON'
			});
			next(action);
		} else if (action.data.length === 1) {
			console.log('len = 1');
			store.dispatch({
				type: 'FACEPALM_MODE_OFF'
			});
			next(action);
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
		case 'FACEPALM_MODE_ON':
			console.log('on', state);
			return state.set('facepalmMode', true);
		case 'FACEPALM_MODE_OFF':
			delete state.facepalmMode;
			console.log('off', state);
			return state;
		default:
			console.log('default', state);
			// delete state.facepalmMode;
			return state;
	}
	return state;
};

/*
Now we pass it down to the Term
component that will send the burn
*/
exports.mapTermsState = (state, map) => {
	if (state.hasOwnProperty('facepalmMode')) {
		return Object.assign(map, {
			facepalmMode: state.ui.facepalmMode
		});
	}
	return Object.assign(map, {});
};

/*
Sadly the final terminal to style is in an iFrame
Passing down through props is the way to make it the same
*/
exports.getTermProps = (uid, parentProps, props) => {
	if (parentProps.hasOwnProperty('facepalmMode')) {
		return Object.assign(props, {
			facepalmMode: parentProps.facepalmMode
		});
	}
	return Object.assign(props, {});
};

exports.decorateTerm = (Term, { React, notify }) => {
	return class extends React.Component {
		constructor (props, context) {
			super(props, context);
			this._createReaction = this._createReaction.bind(this);
			this._onTerminal = this._onTerminal.bind(this);
			this._showReaction = this._showReaction.bind(this);
		}

		_onTerminal (term) {
			if (this.props.onTerminal) this.props.onTerminal(term);
			console.log('term fpm', this.props.facepalmMode);
			this._createReaction();
			this._showReaction();
		}

		_showReaction () {
			console.log('sr', this.props);
			let viz = this.props.hasOwnProperty('facepalmMode') ? 'visible' : 'hidden';
			this._reaction.style.visibility = viz;
		}

		_createReaction () {
			console.log('rfpm', this.props.facepalmMode);
			// let viz = this.props.facepalmMode ? 'visible' : 'hidden';
			// console.log('viz', viz);
			this._reaction = document.createElement('div');
			this._reaction.style.position = 'absolute';
			this._reaction.style.bottom = 0;
			this._reaction.style.right = 0;
			this._reaction.style.width = '15%';
			this._reaction.style.height = '15%';
			this._reaction.textContent = 'Foo!Bar!!';
			this._reaction.style.backgroundImage = `url('https://media.giphy.com/media/zNrg4ulntLBMk/giphy.gif')`;
			this._reaction.style.backgroundSize = '100% 100%';
			// this._reaction.style.visibility = viz;
			document.body.appendChild(this._reaction);
			this._showReaction();
		};

		componentWillUnmount () {
			document.body.removeChild(this._reaction);
		}

		render () {
			console.log('render is', this.props);
			// if (this.props.facepalmMode) this.forceUpdate();
			return React.createElement(Term, Object.assign({}, this.props, {
				onTerminal: this._onTerminal
			}));
		}
	}
};
