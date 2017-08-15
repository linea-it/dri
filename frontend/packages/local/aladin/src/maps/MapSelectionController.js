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
            cmb_band = me.lookup('cmbBand'),
            store_bands = cmb_band.getStore();

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

        cmb_band.reset();
        store_bands.removeAll();

        //console.log('map_model: ', map_model)

        store.each(function(record) {
            //console.log('record:%o', record);
            //console.log(record.get('prd_class'));
            //console.log(map_model.get('prd_class'));

            if (record.get('id') == map_model.get('id')) {
                store_bands.add(record);
            }
        }, this);
    },

    // onClickBtnMap: function (btn) {
    //     console.log('onClickBtnMap(%o)', btn);

    //     var me = this,
    //         vm = me.getViewModel(),
    //         band_name = btn.band;

    //     //TODO remove
    //     console.log(band_name);
    // }

    onSelectMapBand: function (cmb) {
        //console.log('onSelectMapBand(%o)', cmb);

        var me = this,
            vm = me.getViewModel(),
            view = vm.getView(),
            map_model = cmb.selection,
            aladin_images_store = vm.getStore('aladin_images_store');



        aladin_images_store.addFilter([
            {
                property: 'product',
                value: map_model.get('id')
            }
        ]);

        view.setLoading(true);

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

                    //console.log('survey: %o', survey);
                    mapSurvey = view.getAladin().createImageSurvey(survey);
                    //console.log('mapSurvey: %o', mapSurvey);
                    view.getAladin().setImageSurvey(mapSurvey);
                }

                view.setLoading(false);
            }
        });
    }
});
