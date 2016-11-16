;(function(){
var Helper = require.helper, analyseNeedLoadUrls = define.Module.analyseNeedLoadUrls;

function unique(array){
    var obj = {}, ret = [];

    Helper.each(array, function(v){
        if(obj[v]) return;

        obj[v] = true;
        ret.push(v);
    });

    return ret;
}

function dirname(path, onlyDomain){
    var reg = /^(?:https?\:)?\/\/[^\/]+\//, match;

    match = path.match(reg);
    return match ? match[0] : '/';
}

function hasThird(modules){
    var r = false;

    Helper.each(modules || [], function(module){
        if(/(?:^|:)static\/(?:.+?\/)*third\//.test(module)){
            r = true;
        }
    });

    return r;
}

define.Module.analyseNeedLoadUrls = function(deps){
    var needLoadUrlStores = analyseNeedLoadUrls(deps);

    if(!require.config('combo')) return needLoadUrlStores;

    var CSSEXP = /\.(?:css|less)(?:\?|$)/, needCombos = {'css': [], 'js': []}, finalNeedLoadUrlStores = [];
    var combo = require.config('combo') || {}, maps = require.config('map');
    var onlyUnPackFile = combo.onlyUnPackFile, comboMaxUrlLength = combo.maxUrlLength, comboSyntax = combo.syntax;

    Helper.each(needLoadUrlStores, function(urlStore){
        var url = urlStore.url;

        if(maps[url] && (onlyUnPackFile && maps[url].length == 1 || !onlyUnPackFile) && !hasThird(urlStore.modules)){
            if(CSSEXP.test(url)){
                needCombos.css.push(urlStore);
            }else{
                needCombos.js.push(urlStore);
            }
        }else{
            finalNeedLoadUrlStores.push(urlStore);
        }
    });

    Helper.each(needCombos, function(combos, type){
        var combosDirGroup = {};

        Helper.each(combos, function(urlStore){
            var url = urlStore.url, dir = dirname(url);

            if(!combosDirGroup[dir]){
                combosDirGroup[dir] = [];
            }

            combosDirGroup[dir].push(url);
        });

        Helper.each(combosDirGroup, function(urls, dir){
            urls = unique(urls);

            if(urls.length > 1){
                var items = [], tUrlStoreModules = [], dirLength = dir.length, len = 0;

                Helper.each(urls, function(url){
                    len += url.length - dirLength;

                    var part = parseInt(len / comboMaxUrlLength);

                    if(!items[part]){
                        items[part] = [];
                        tUrlStoreModules[part] = [];
                    }

                    items[part].push(url.substring(dirLength));
                    tUrlStoreModules[part].push(define.Module.getUrlStore(url).modules);
                });

                Helper.each(items, function(item, key){
                    var realUrl;

                    if(item.length > 1){
                        realUrl = dir + comboSyntax[0] + item.join(comboSyntax[1]);
                    }else{
                        realUrl = tUrls[key][0];
                    }

                    var comboUrlStore = define.Module.getUrlStore(realUrl);
                    
                    Helper.each(tUrlStoreModules, function(modules){
                        comboUrlStore.modules = comboUrlStore.modules.concat(modules);
                    });

                    finalNeedLoadUrlStores.push(comboUrlStore);
                });
            }else if(urls.length == 1){
                finalNeedLoadUrlStores.push(define.Module.getUrlStore(urls[0]));
            }
        });
    });

    return finalNeedLoadUrlStores;
}
})();