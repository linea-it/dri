/**
 * Created by glauber on 06/04/16.
 */
Ext.define('Sky.view.search.SearchField', {
    extend: 'Ext.form.field.Text',

    requires: [
        'Sky.view.search.SearchController',
        'Sky.view.search.SearchModel'
    ],

    xtype: 'tile-search-field',

    controller: 'search',

    viewModel: 'search',

    emptyText: 'Search',

    width: 250,

    emptyText: 'eg. 307.0658, -52.6783',

    submitEmptyText: false,

    validateOnBlur: false,

    validateOnChange: false,

    validator: 'checkSearchParams',

    listeners: {
        specialkey: function (f,e) {
            if (e.getKey() == e.ENTER) {
                //f.fireEvent('search', f);
            }
        }
    },

    triggers: {
        //    clear: {
        //        cls: 'x-form-clear-trigger',
        //        handler: this.cancelFilter,
        //        hidden: true
        //    },
        search: {
            cls: 'x-form-search-trigger',
            handler: function () {
                //this.fireEvent('search', this);
            }
        }
    }

});
