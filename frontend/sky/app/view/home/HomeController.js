/**
 * This class is the controller for the main view for the application. It is specified as
 * the "controller" of the Main view class.
 *
 * TODO - Replace this content of this view to suite the needs of your application.
 */
Ext.define('Sky.view.home.HomeController', {
    extend: 'Ext.app.ViewController',

    alias: 'controller.home',

    listen: {
        store: {
            '#releases': {
                load: 'onLoadReleases'
            },
        }
    },

    onLoadReleases: function (store) {
        // console.log('onLoadReleases(%o)', store)
        var me = this;
        // Se so houver um release redireciona direto para o sky
        if (store.count() == 1) {
            me.onChooseRelease(store.first().get('id'));
        }
    },

    onRowDblClick: function (grid, record) {
        var me = this;

        me.onChooseRelease(record.get('id'));

    },

    onChooseRelease: function (release) {
        var me = this,
            hash;

        hash = 'sky/' + release;

        me.redirectTo(hash);

    },

    refreshAndClear: function () {
        var me = this,
            txtSearch = me.getReferences().txtSearch,
            store = me.getView().getStore();

        if (txtSearch.getValue()){
            txtSearch.setValue('');
        }else{
            store.clearFilter(true);
            store.load();
        }
    },

    cancelFilter: function (field) {
        field.getTrigger('clear').hide();
        this.refreshAndClear();
    },

    filterByname: function (field) {
        var me = this,
            store = me.getView().getStore(),
            value = field.getValue();

        if (value.length > 0) {

            field.getTrigger('clear').show();

            store.addFilter([
                {
                    property: 'search',
                    value: value
                }
            ]);

            store.load();

        } else {
            field.getTrigger('clear').hide();
            me.cancelFilter(field);
        }
    },

    onActivate: function(){
        //console.log('home is active')
    }

});
