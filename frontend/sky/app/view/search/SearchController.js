/**
 * Created by glauber on 06/04/16.
 */
Ext.define('Sky.view.search.SearchController', {
    extend: 'Ext.app.ViewController',

    requires: [
        'Sky.view.search.SearchResultGrid'
    ],

    alias: 'controller.search',

    listen: {
        component: {
            'tile-search-field': {
                search: 'onSearch'
            }
        },
        store: {
            '#search-tiles': {
                load: 'onLoadSearch'
            }
        }
    },

    onSearch: function (searchField) {
        this.search(searchField);

    },

    search: function (searchField) {
        var params;

        this.checkStores();

        if ((searchField.isValid()) && (searchField.getValue() != '')) {
            params = this.getSearchParams(searchField);

            if (params) {

                this.loadSearch(params);

            }
        }
    },

    checkStores: function () {
        var vm = this.getViewModel(),
            fields = vm.getStore('tags'),
            releases = vm.getStore('releases');

        if (!releases.isLoaded()) {
            releases.load();
        }

        if (!fields.isLoaded()) {
            fields.load();

        }
    },

    loadSearch: function (params) {
        var me = this,
            vm = me.getViewModel(),
            store = vm.getStore('search');

        store.filter(params);

    },

    onLoadSearch: function (store) {
        if (store.count() == 1) {
            this.onlySkyFound(store.first());

        } else if (store.count() > 1) {
            this.manySkysFound(store);

        } else {
            this.noSkysFound();

        }

    },

    manySkysFound: function (store) {
        this.windowResults = this.createWindowResult();
        this.windowResults.show();

    },

    onlySkyFound: function (record) {
        this.showSkyInSkyDetail(record.get('id'));

    },

    noSkysFound: function () {
        Ext.MessageBox.show({
            title: 'Search',
            msg: 'No matches found.',
            buttons: Ext.MessageBox.OK
        });
    },

    createWindowResult: function () {
        var vm = this.getViewModel(),
            store = vm.getStore('search');

        // Cria a janela de resultado mais nao exibe
        // adciona a store a janela de pesquisa
        return Ext.create('Ext.window.Window', {
            title: 'Search',
            closeAction:'destroy',
            width: 600,
            height: 400,
            modal: true,
            constrainHeader:true,
            layout: 'fit',
            autoScroll: true,
            items:[
                {
                    xtype:'tile-search-resultgrid',
                    store: store,
                    listeners: {
                        scope: this,
                        rowdblclick: this.onDbClickResult
                    }
                }
            ]
        });

    },

    onDbClickResult: function (view, record) {
        // Fechar a janela de resultados
        this.windowResults.close();
        //console.log(record)
        this.showSkyInSkyDetail(record.get('id'));

    },

    showSkyInSkyDetail: function (id) {
        var hash = 'td/' + id;

        this.redirectTo(hash);
    },

    checkSearchParams: function (value) {
        // Value is not empty
        if (value == '') {
            // return 'This field is required.';
            // return false;
            return true;
        }

        if (value.search(',') != -1) {
            // Um par de coordenadas
            // verifica se tem mais de um par.
            var aValue = value.split(',');
            if (aValue.length != 2) {
                // ra e dec estao no formato errado
                return 'More than one RA and Dec.';
            }

            var ra = aValue[0].trim();

            if (/^(\d+(\.\d+)?)$/.test(ra)) {
                if ((ra < 0) || (ra > 360)) {
                    // RA deve esta entre 0 e 360
                    return 'RA must be between 0 and 360.';
                }
            } else if (value.search(':') == -1) {
                return 'RA use degrees or hh:mm:ss.';
            }

            var dec = aValue[1].trim();
            // Checar se e uma coordenada em graus
            if (/^(\-?\d+(\.\d+)?)$/.test(dec)) {
                if ((dec < -90) || (dec > 90)) {
                    // Dec deve esta entre -90 e 90
                    return 'Dec must be between -90 and 90.';
                }
            } else if (value.search(':') == -1) {
                return 'Dec use degrees or dd:mm:ss.';
            }

            if ((!ra) && (!dec)) {
                return 'RA and Dec coordinates must be separated by commas.' +
                            '<br> eg. 300.8660,-50.8345 or HH:MM:SS,DD:MM:SS';
            }

            return true;
        } else if (/^((DES|des|Des)[0-9]{4}(\+|-)[0-9]{4})$/.test(value)) {
            // Skyname
            return true;
        } else {
            return 'The value in this field is invalid';
        }
    },

    getSearchParams: function (searchField) {
        var value = searchField.getValue(),
            params = [],
            coordinates = [],
            aValue, ra, dec, objRa, objDec;

        if (value.search(',') != -1) {

            params.type = 'coordinates';

            aValue = value.split(',');
            ra = aValue[0].trim();
            dec = aValue[1].trim();

            objRa = this.parseRa(ra);
            objDec = this.parseDec(dec);

            if (objRa.error) {
                searchField.markInvalid(objRa.error);
                return false;
            }
            if (objDec.error) {
                searchField.markInvalid(objDec.error);
                return false;
            }

            coordinates.push(objRa.value);
            coordinates.push(objDec.value);

            params.push(
                {
                    property: 'position',
                    value: coordinates.join()
                }
            );

            return params;

        } else if (/^((DES|des|Des)[0-9]{4}(\+|-)[0-9]{4})$/.test(value)) {
            params.push({
                property: 'tli_tilename',
                value: value
            });

            return params;
        }

        return false;

    },

    parseRa: function (ra) {

        var obj = {
            value: null,
            error: null
        };

        // Checar se e uma coordenada em graus
        if (/^(\d+(\.\d+)?)$/.test(ra)) {

            if ((ra < 0) || (ra > 360)) {
                // RA deve esta entre 0 e 360
                obj.error = 'RA must be between 0 and 360.';
                return obj;
            }

            obj.value = ra.trim();
        } else if (ra.search(':') != -1) {
            // Converter para degrees antes de criar a url
            var value = (this.sexagesimal2decimal(ra.trim()) * 15);
            obj.value = value;
        } else {
            obj.error = 'invalid value for RA.';
            return obj;
        }

        return obj;
    },

    parseDec: function (dec) {

        var obj = {
            value: null,
            error: null
        };

        // Checar se e uma coordenada em graus
        if (/^(\-?\d+(\.\d+)?)$/.test(dec)) {

            if ((dec < -90) || (dec > 90)) {
                // Dec deve esta entre 0 e 90
                obj.error = 'Dec must be between -90 and 90.';
                return obj;
            }
            obj.value = dec.trim();
        } else if (dec.search(':') != -1) {
            // Converter para degrees antes de criar a url
            var value = this.sexagesimal2decimal(dec.trim());
            obj.value = value;
        } else {
            obj.error = 'invalid value for Dec.';
            return obj;
        }

        return obj;
    },

    /**
     * Converts a sexagesimal coordinate to decimal format
     *
     * @param {float} sexagesimal coordinate
     * @return {string} Decimal value (XX.XXXX)
     */
    sexagesimal2decimal: function (sexagesimal) {

        var grau = 0, min = 0, sec = 0;

        data = sexagesimal.split(':');

        if (data[0] < 0) {
            sign = -1;
            grau = parseFloat(data[0] / 1) * -1;
        } else {
            sign = 1;
            grau = parseFloat(data[0] / 1);
        }

        min = parseFloat(data[1] / 60.0);
        sec = parseFloat(data[2] / 3600.0) || 0;

        var dec = ((grau + min + sec) * sign).toFixed(4);

        return dec;
    }
});
