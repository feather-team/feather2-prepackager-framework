module.exports = function(ret, conf, setting, opt){
    var isPd = /^(?:pd|production)$/.test(feather.project.currentMedia());
    var LIB_ROOT = __dirname + '/lib/';

    ['feather.js', 'pagelet.js'].forEach(function(item){
        var content = feather.util.read(LIB_ROOT + item, true);
        var file = feather.file.wrap(feather.project.getProjectPath() + '/static/' + item);

        if(item == 'feather.js'){
            var config = feather.util.merge({}, feather.config.get('require.config'));
            delete config.rules;

            if(feather.config.get('autoPack.type') == 'combo'){
                config.combo = feather.config.get('autoPack.options');
                content += ';' + feather.util.read(LIB_ROOT + 'feather-combo.js', true);
            }

            var _config = 'require.config(' + feather.util.json(config) + ')';
            content += ';' + _config;
            content += ';' + feather.util.read(LIB_ROOT + 'feather-deps.js', true);

            delete file.useJsWraper;
        }
        
        if(isPd){
            content = require('uglify-js').minify(content, {fromString: true}).code;
        }
        
        file.setContent(content);
        file.id = 'static/' + item;
        ret.pkg[file.subpath] = file;
        ret.map.res[file.id] = {
            uri: file.getUrl()
        };  
    });
};