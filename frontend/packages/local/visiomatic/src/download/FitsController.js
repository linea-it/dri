Ext.define('visiomatic.download.FitsController', {
    extend: 'Ext.app.ViewController',

    alias: 'controller.fits-files',

    listen: {
        component: {
            'target-download-descut': {
                changeLoadFits: 'onChangeLoadFits'
            }
        }
    },

    listen: {
        component: {
            'target-download-descut': {
                changeLoadFits: 'onChangeLoadFits'
            }
        }
    },

    onChangeLoadFits: function (result) {
        var me = this,
            view = me.getView(),
            vm = view.getViewModel(),
            store = vm.getStore('fitsFiles');

        store.filter([
            {
                property: 'result',
                value: result
            },
        ]);
    },

    onSelect: function (selModel, record) {
        var me = this,
            view = me.getView()

        view.setLoading(true);

        url = record.data.url

        Ext.Ajax.request({
            url: `${Ext.manifest.apiBaseUrl}/dri/api/dataset/get_download_url/`,
            params: {
                file_url: url
            },
            success: function (response) {
                var result = JSON.parse(response.responseText);
                window.open(result.download_url, '_blank');
            },
            failure: function () {
                Ext.Msg.alert('Error', 'Sorry, could not authenticate url. Try again later.');
            },
            callback: function () {
                selModel.deselectAll();
                view.setLoading(false);
            },
        });

    }
});
