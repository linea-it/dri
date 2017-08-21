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
                changerelease: 'onChangeRelease'
            }
        }
    },

    onChangeRelease: function (release) {
        //console.log('onChangeRelease(%o)', release);

        var me = this,
            vm = me.getViewModel(),
            view = vm.getView(),
            store = vm.getStore('maps_store'),
            cmb_type = me.lookup('cmbType'),
            store_types = cmb_type.getStore();

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
            callback: function() {
                cmb_type.reset();
                store_types.removeAll();

                store.each(function(record){
                    if (store_types.findRecord('pgr_group', record.get('pgr_group')) == null) {
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
            store_classes = cmb_class.getStore();

        cmb_class.reset();
        store_classes.removeAll();

        store.each(function(record) {
            if (record.get('pgr_group') == map_model.get('pgr_group')) {
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

        store.each(function(record) {
            if (record.get('id') == map_model.get('id')) {
                store_filters.add(record);
            }
        }, this);
    },

    onSelectMapFilter: function (cmb) {
        //console.log('onSelectMapFilter(%o)', cmb);

        var me = this,
            vm = me.getViewModel(),
            view = vm.getView(),
            aladin = view.getAladin(),
            map_model = cmb.selection,
            aladin_images_store = vm.getStore('aladin_images_store');



        aladin_images_store.addFilter([
            {
                property: 'product',
                value: map_model.get('id')
            }
        ]);

        aladin_images_store.load({
            callback: function() {

                if (aladin_images_store.getCount() != 1) {
                    Ext.MessageBox.alert(
                        'Warning',
                        aladin_images_store.getCount().toString() + 'Images found!');
                }
                else
                {
                    var img_url = aladin_images_store.getAt(0).get('img_url');

                    survey = {
                        'id': 'map_' + map_model.get('id').toString(),
                        'url': img_url,
                        'name': map_model.get('pcl_display_name'),
                        'filter': map_model.get('prd_filter'),
                        'maxOrder': 11,
                        'frame': 'equatorial',
                        'options': {
                            'imgFormat': 'png'
                        }
                    };

                    // retrieve the first non-map layer to restore
                    aladin_last_nonmap_survey = vm.get('aladin_last_nonmap_survey');

                    if (aladin_last_nonmap_survey == null) {
                        vm.set('aladin_last_nonmap_survey', aladin.getImageSurvey());
                    }

                    mapSurvey = aladin.createImageSurvey(survey);
                    aladin.setImageSurvey(mapSurvey);

                    vm.set('aladin_last_map_survey', mapSurvey);
                    vm.set('map_selected', true);
                }
            }
        });
    },

    onClickBtnRemoveMap: function (btn) {
        console.log('onClickBtnRemoveMap(%o)', btn);

        var me = this,
            vm = me.getViewModel(),
            view = vm.getView(),
            aladin = view.getAladin(),
            cmb_type = me.lookup('cmbType'),
            cmb_class = me.lookup('cmbClass'),
            cmb_filter = me.lookup('cmbFilter');

        aladin_last_nonmap_survey = vm.get('aladin_last_nonmap_survey');
        aladin.setImageSurvey(aladin_last_nonmap_survey); // null value will cleanup the background
        vm.set('aladin_last_nonmap_survey', null);
        vm.set('aladin_last_map_survey', null);
        cmb_filter.reset();
        cmb_class.reset();
        cmb_type.reset();
        vm.set('map_selected', false);
    },

    onClickBtnOnOff: function (btn) {
        //console.log('onClickBtnOnOff(%o)', btn);

        var me = this,
            vm = me.getViewModel(),
            view = vm.getView(),
            aladin = view.getAladin(),
            aladin_survey = null;

        if (vm.get('map_selected')) {
            aladin_survey = vm.get('aladin_last_map_survey');
            vm.set('map_selected', false);
        }
        else
        {
            aladin_survey = vm.get('aladin_last_nonmap_survey');
            vm.set('map_selected', true);
        }

        aladin.setImageSurvey(aladin_survey);
    }

});
