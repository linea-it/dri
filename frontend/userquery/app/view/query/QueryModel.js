Ext.define('UserQuery.view.query.QueryModel', {
    extend: 'Ext.app.ViewModel',

    alias: 'viewmodel.query',

    requires: [
        'UserQuery.model.Query',
    ],

    // data: {
    //     // Indica se o formulario é valido: name != '' and sql != ''
    //     formIsValid: false,
    //     saveDisabled: true
    // },

    // formulas: {
    //     // recebe true quando o form é valido e a query foi alterada.
    //     saveDisabled: function (get) {
    //         return !get('formIsValid') || !get('currentQuery').dirty;
    //     }
    // },

    links: {
        currentQuery: {
            type: 'UserQuery.model.Query',
            create: true
        },
    }

});