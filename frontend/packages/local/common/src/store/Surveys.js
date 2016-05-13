Ext.define('common.store.Surveys', {
    extend: 'common.store.MyStore',

    /**
     * @requires common.model.Survey
     */
    requires: [
        'common.model.Survey'
    ],

    alias: 'store.surveys',

    model: 'common.model.Survey',

    autoLoad: false,

    remoteFilter: true,

    remoteSort: true,

    pageSize: 0,

    proxy: {
        type: 'django',
        url: '/dri/api/surveys/'
    }

});
