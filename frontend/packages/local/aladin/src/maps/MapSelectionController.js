Ext.define('aladin.maps.MapSelectionController', {
    extend: 'Ext.app.ViewController',

    alias: 'controller.mapselection',

    requires: [
        'common.model.Map',
        'common.store.Maps',
        'aladin.model.Image',
        'aladin.store.Images',
    ],

    listen: {
        component: {
            'aladin-maps-mapselectionwindow': {
                changerelease: 'onChangeRelease',
                beforeclose: 'onBeforeClose'
            },
        }
    },

    onChangeRelease: function (release) {
        //console.log('onChangeRelease(%o)', release);

        var me = this,
            vm = me.getViewModel(),
            view = vm.getView(),
            store = vm.getStore('maps_store'),
            cmb_type = me.lookup('cmbType'),
            cmb_class = me.lookup('cmbClass'),
            store_types = cmb_type.getStore(),
            store_classes = cmb_class.getStore(),
            cmb_filter = me.lookup('cmbFilter'),
            store_filters = cmb_filter.getStore();

        view.setLoading(true);

        store.addFilter([
            {
                property: 'release_id',
                value: release
            },
            {
                property: 'with_image',
                value: true
            }
        ]);

        store.load({
            callback: function () {
                cmb_type.reset();
                store_types.removeAll();
                cmb_class.reset();
                store_classes.removeAll();
                cmb_filter.reset();
                store_filters.removeAll();

                store.each(function (record) {
                    if (
                        store_types.findRecord(
                            'pgr_group', record.get('pgr_group')) == null
                    ) {
                        store_types.add(record);
                    }
                }, this);

                view.setLoading(false);

            }
        });
    },

    onSelectMapType: function (cmb) {
        //console.log('onSelectMapType(%o)', cmb);

        var me = this,
            vm = me.getViewModel(),
            map_model = cmb.selection,
            store = vm.getStore('maps_store'),
            cmb_class = me.lookup('cmbClass'),
            store_classes = cmb_class.getStore(),
            cmb_filter = me.lookup('cmbFilter'),
            store_filters = cmb_filter.getStore();

        cmb_class.reset();
        store_classes.removeAll();
        cmb_filter.reset();
        store_filters.removeAll();

        store.each(function (record) {
            if (
                record.get('pgr_group') == map_model.get('pgr_group') &&
                store_classes.findRecord('prd_class', record.get('prd_class')) == null
            ) {
                store_classes.add(record);
            }
        }, this);
    },

    onSelectMapClass: function (cmb) {
        //console.log('onSelectMapClass(%o)', cmb);

        var me = this,
            vm = me.getViewModel(),
            map_model = cmb.selection,
            store = vm.getStore('maps_store'),
            cmb_filter = me.lookup('cmbFilter'),
            store_filters = cmb_filter.getStore();

        cmb_filter.reset();
        store_filters.removeAll();

        store.each(function (record) {
            if (
                record.get('pgr_group') == map_model.get('pgr_group') &&
                record.get('prd_class') == map_model.get('prd_class')
            ) {
                store_filters.add(record);
            }
        }, this);
    },

    onSelectMapFilter: function (cmb) {
        console.log('onSelectMapFilter(%o)', cmb);

        var me = this,
            vm = me.getViewModel(),
            view = vm.getView(),
            aladin = view.getAladin(),
            map_model = cmb.selection,
            aladin_images_store = vm.getStore('aladin_images_store');

        console.log(map_model)

        aladin_images_store.addFilter([
            {
                property: 'product',
                value: map_model.get('id')
            }
        ]);

        aladin_images_store.load({
            callback: function () {

                if (aladin_images_store.getCount() != 1) {
                    Ext.MessageBox.alert(
                        'Warning',
                        aladin_images_store.getCount().toString() + ' images found for same map!');
                }
                else {
                    // retrieve the first non-map layer to restore
                    aladin_last_nonmap_survey = vm.get('aladin_last_nonmap_survey');

                    if (aladin_last_nonmap_survey == null) {
                        vm.set('aladin_last_nonmap_survey', aladin.getImageSurvey());
                    }

                    var img_url = aladin_images_store.getAt(0).get('img_url');

                    // default survey object
                    survey = {
                        'id': 'map_' + map_model.get('id').toString(),
                        'url': img_url,
                        'name': map_model.get('pcl_display_name'),
                        'filter': map_model.get('prd_filter'),
                        'maxOrder': 3,
                        'frame': 'equatorial',
                        'options': {
                            'imgFormat': 'png'
                        },
                        'map_model': map_model
                    };

                    // retrieving maxOrder value from properties file
                    aladin.readProperties(
                        img_url,
                        function (properties) {
                            survey['maxOrder'] = properties["maxOrder"];
                            me.setMapSurvey(survey);
                        },
                        function (error) {
                            console.log('aladin.readProperties() error: %o', error);
                            me.setMapSurvey(survey);
                        }
                    );
                }
            }
        });
    },

    setMapSurvey: function (survey) {
        //console.log('setMapSurvey(%o)', survey);

        var me = this,
            vm = me.getViewModel(),
            view = vm.getView(),
            aladin = view.getAladin();

        mapSurvey = aladin.createImageSurvey(survey);
        aladin.setImageSurvey(mapSurvey);

        vm.set('aladin_last_map_survey', mapSurvey);
        vm.set('current_map', survey.map_model);
        vm.set('map_selected', true);
    },

    onDisplayOnOff: function (btn) {
        //console.log('onDisplayOff(%o)', btn);

        var me = this,
            vm = me.getViewModel(),
            view = vm.getView(),
            aladin = view.getAladin(),
            aladin_survey = null;

        if (vm.get('map_selected')) {
            aladin_survey = vm.get('aladin_last_map_survey');
        }
        else {
            aladin_survey = vm.get('aladin_last_nonmap_survey');
        }

        aladin.setImageSurvey(aladin_survey);
    },

    onTogglePickerMapSignal: function (btn, state) {
        // console.log("onTogglePickerMapSignal: %o", state);
        var me = this,
            view = me.getView(),
            aladin = view.getAladin();

        // Modificar o estado do Aladin para esperar pela ação de seleção.
        aladin.setPickerMode(state, 'mappickersignal');
    },

    onPickerMapSignal: function (position, aladin) {
        console.log("onPickerMapSignal: %o", position);

        var me = this,
            vm = me.getViewModel(),
            map = vm.get('current_map');

        console.log("Recuperando o valor do signal para o mapa: %o", map.get('prd_display_name'))
        // Aladin Set Loading
        aladin.setLoading(true);

        Ext.Ajax.request({
            url: '/dri/api/map/signal_by_position/',
            method: 'GET',
            headers: {
                'X-CSRFToken': Ext.util.Cookies.get('csrftoken'),
            },
            params: {
                ra: position[0],
                dec: position[1],
                id: map.get('id')
            },
            success: function (response) {
                result = JSON.parse(response.responseText);

                console.log(result)
                vm.set('map_signal', Number.parseFloat(result.signal).toPrecision(4))

                aladin.setLoading(false);

                // TODO Setar o valor Do Signal em algum lugar

            },
            failure: function (response, opts) {
                aladin.setLoading(false);
                console.log("Falhou na Requisição")
            }
        });
    },

    onBeforeClose: function () {
        console.log('onBeforeClose');
        var me = this,
            btn = me.lookup('btnPicker');

        // Sempre Desligar a função de picker ao fechar a janela.
        btn.toggle(false)
    },

    onAladinContextMenu: function () {
        // console.log('onAladinContextMenu')
        var me = this,
            vm = this.getViewModel(),
            btn = me.lookup('btnPicker');

        // Se a função de picker estiver ativa e houver um right click 
        // Desliga a função de picker ao clicar com botão diretio no Aladin.
        if (vm.get('wait_picker') == true) {
            console.log("HAUHDAHSU")
            btn.toggle(false);
        }
    },

    testeMap: function (btn) {
        console.log("Teste Select Map");
        // console.log(this)
        var me = this,
            vm = me.getViewModel(),
            view = vm.getView(),
            store = vm.getStore('maps_store'),
            aladin = view.getAladin(),
            cmb_filter = me.lookup('cmbFilter');


        store.addFilter([
            {
                property: 'release_id',
                value: 26
            },
            {
                property: 'with_image',
                value: true
            }
        ]);

        store.load({
            callback: function () {

                map = store.getById(591);
                // console.log("Map: %o", map);

                cmb_filter.select(map);
                view.getController().onSelectMapFilter(cmb_filter);
            }
        });






        // vm.set('aladin_last_map_survey', map);
        // vm.set('map_selected', true);

        // aladin.setImageSurvey(aladin_survey);


    }

});
