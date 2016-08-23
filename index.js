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
			// delete state.facepalmMode;
			return state.set('facepalmMode', false);
			console.log('off', state);
			return state;
		default:
			console.log('default', state);
			return state;
	}
	return state;
};

/*
Now we pass it down to the Term
component that will send the burn
*/
exports.mapTermsState = (state, map) => {
	return Object.assign(map, {
		facepalmMode: state.ui.facepalmMode
	});
};

/*
Sadly the final terminal to style is in an iFrame
Passing down through props is the way to make it the same
*/
exports.getTermProps = (uid, parentProps, props) => {
	return Object.assign(props, {
		facepalmMode: parentProps.facepalmMode
	});
};

exports.decorateTerm = (Term, { React, notify }) => {

	return class extends React.Component {
		constructor (props, context) {
			super(props, context);
		}

		render () {
			let viz = this.props.facepalmMode
			console.log('viz', viz);

			let facepalmStyle = {
				position: 'absolute',
				bottom: 0,
				right: 0,
				width: '40%',
				height: '40%',
				backgroundImage: `url('https://media.giphy.com/media/zNrg4ulntLBMk/giphy.gif')`,
				backgroundSize: '100% 100%',
				visibility: 'visible',
			};

			this.props.customChildren = (viz) ? React.createElement('div', { style: facepalmStyle, className: "facepalm" }, '') : null;

			console.log('ccs', this.props.customChildren);

		  return (
				React.createElement(Term, Object.assign(Term, this.props))
			);
		}
	}
};
