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
            }//,
            // {
            //     fn: function(record) {
            //         return record.get('age') == 24
            //     },
            //     scope: this
            // }
        ]);

        store.load({
            callback: function() {


                // store.aggregate(function(records, a, b){
                //     console.log('records: %o', records);
                //     console.log('a: %o', a);
                //     console.log('b: %o', b);
                //     return a
                // }, 'prd_group')

                // Apagar as stores
                //store.removeAll()
                // Resetar as combos
                //cmb.reset()

                //console.log(
                    //'store: %o',
                    //store.aggregate(function(records, field, separator){
                        //var result = [];
                        //console.log(field)
                        //for (var i=0; i < records.length; ++i) {
                            //result.push('a');//records[i][0]);//.get(field));
                        //}
                        //return result;
                    //}, this, true, ['prd_group', '.'])
                //);

                // store.aggregate(function (field, grouped) {
                //     console.log('field: ', field);
                //     console.log('grouped: ', grouped);
                //     var data = this.getData();
                //     return (grouped && this.isGrouped()) ? data.sumByGroup(field) : data.sum(field);
                // }, true,  'prd_group')

                // store.group('prd_group')
                //store_types.setGroupField('pgr_group');
                //store_types.group('pgr_group');
                // store_types2=store_types.aggregate(function (field, grouped) {
                //     console.log('field: ', field);
                //     console.log('grouped: ', grouped);
                //     var data = this.getData();
                //     return (grouped && this.isGrouped()) ? data.sumByGroup(field) : data.sum(field);
                // }, true,  'pgr_group')

                // store_types.setGroupField('pgr_group');
                // store_types2 = store_types.aggregate(function(records) {
                //     console.log('records: %o', records);
                //     var result = [];
                //     for (var i=0; i < records.length; ++i) {
                //         result.push(records[i][0]);
                //     }
                //     return result;
                // }, this, true, 'pgr_group');

                cmb_type.reset();
                store_types.removeAll();

                store.each(function(record){
                    //console.log('event record:%o', record);
                    //console.log('store_types_field:%o', store_types.findRecord('pgr_group', record.get('pgr_group')));
                    //console.log('record_field %o', record.get('pgr_group'));

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

        // store.addFilter([
        //     {
        //         property: 'release_id',
        //         value: vm.get('release')
        //     },
        //     {
        //         property: 'prd_class',
        //         value: map_model.get('prd_class')
        //     }
        // ]);

        cmb_class.reset();
        store_classes.removeAll();

        //console.log('map_model: ', map_model)

        store.each(function(record) {
            //console.log('record:%o', record);
            //console.log(record.get('pgr_group'));
            //console.log(map_model.get('pgr_group'));

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

        // store.addFilter([
        //     {
        //         property: 'release_id',
        //         value: vm.get('release')
        //     },
        //     {
        //         property: 'prd_class',
        //         value: map_model.get('prd_class')
        //     }
        // ]);

        cmb_filter.reset();
        store_filters.removeAll();

        //console.log('map_model: ', map_model)

        store.each(function(record) {
            //console.log('record:%o', record);
            //console.log(record.get('prd_class'));
            //console.log(map_model.get('prd_class'));

            if (record.get('id') == map_model.get('id')) {
                store_filters.add(record);
            }
        }, this);
    },

    // onClickBtnMap: function (btn) {
    //     console.log('onClickBtnMap(%o)', btn);

    //     var me = this,
    //         vm = me.getViewModel(),
    //         filter_name = btn.filter;

    //     //TODO remove
    //     console.log(filter_name);
    // }

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

                    //console.log('product_id: %o', map_model.get('id'));
                    //console.log('img_url: %o', img_url);

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

                    //console.log('aladin_last_nonmap_survey: %o', vm.get('aladin_last_nonmap_survey'));

                    //console.log('survey: %o', survey);
                    mapSurvey = aladin.createImageSurvey(survey);
                    //console.log('mapSurvey: %o', mapSurvey);
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
