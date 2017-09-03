Ext.define('common.token.GetToken', {
    extend: 'Ext.app.Controller',
    init: function () {
        var csrf = Ext.util.Cookies.get('csrftoken'),
            token;

        Ext.Ajax.request({
            url: `${window.location.origin}/dri/api/get_token`,
            method: 'GET',
            params: {
                csrfmiddlewaretoken: csrf
            },
            success: function (response) {
                token = JSON.parse(response.responseText).token;
                window.localStorage.setItem('token', token);
            },
            failure: function (response, opts) {}
        });
    }
});
