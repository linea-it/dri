/**
 * @class QueryManager
 */
Ext.define('UserQuery.view.service.QueryManager', {
    singleton: true,
    alternateClassName: 'QueryManager',

    _activeQuery: null,

    constructor: function() {
        try{
            this._activeQuery = JSON.parse(sessionStorage.getItem('__activeQuery__'));
        }catch(e){
            this._activeQuery = null;
        }
    },

    config: {
        query: null,
    }
});

var Query = {
    id: '',
    name: '',
    sql: '',
    status: ''
}