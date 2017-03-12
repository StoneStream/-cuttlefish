import Home from '../pages/home.js'
// import About from '../pages/about.js'

if (process.env.NODE_ENV==='production') {
	require('./pwa');
}

import Router from 'react-router';
import AsyncRoute from 'preact-async-route';

const Main = () => (
    <Router>
        <Home path="/" />
        <AsyncRoute path="/about"  component={ () => import('../pages/about.js') } />
    </Router>
);

ReactDom.render(<Main />, document.body);
