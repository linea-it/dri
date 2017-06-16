Ext.define('common.SearchField', {
    extend: 'Ext.form.field.Text',

    xtype: 'common-searchfield',

    emptyText: 'Search',

    submitEmptyText: false,

    enableKeyEvents: true,

    listeners: {
        specialkey: function (f,e) {
            if (e.getKey() == e.ENTER) {
                if ((f.isValid()) && (f.getValue() !== '')) {
                    this.fireEvent('search', f.getValue(), this);
                }
            }
        },
        change: function (f) {
            var value = f.getValue();
            if (value.length > 0) {
                f.getTrigger('clear').show();
                f.getTrigger('search').hide();

                if ((this.getMinSearch() > 0) && (f.getValue().length >= this.getMinSearch())) {
                    if ((f.isValid()) && (f.getValue() !== '')) {
                        this.fireEvent('search', f.getValue(), this);
                    }
                }
            } else {
                f.getTrigger('clear').hide();
                f.getTrigger('search').show();
                this.fireEvent('cancel');
            }
        },

        buffer: 500
    },

    triggers: {
        clear: {
            cls: 'x-form-clear-trigger',
            handler: function (f) {

                f.reset();
                this.getTrigger('clear').hide();
                this.getTrigger('search').show();

                this.fireEvent('cancel');
            },
            hidden: true
        },
        search: {
            cls: 'x-form-search-trigger',
            handler: function () {

            }
        }
    },

    config: {
        minSearch: null
    }

});
