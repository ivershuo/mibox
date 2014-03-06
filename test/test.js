var MI = require('../lib/mi.js');

MI.getTvs().then(function(tvs){
    var mi = new MI(tvs[0]);
    mi.volumeup();
});
