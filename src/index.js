import domready from 'domready';

import App from './Game/App';

domready(() => {
    new App('game');
});