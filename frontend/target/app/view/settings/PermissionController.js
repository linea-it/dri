Ext.define('Target.view.settings.PermissionController', {
    extend: 'Ext.app.ViewController',

    alias: 'controller.permission',

    listen: {
        component: {
            'targets-permission': {
                changecatalog: 'onChangeCatalog'
            }
        },
        store: {
            '#Users': {
                load: 'onLoadUsers'
            }
        }
    },

    onChangeCatalog: function (currentCatalog) {
        var me = this,
            vm = me.getViewModel(),
            permissionUsers = vm.getStore('permissionUsers'),
            permissionWorkgroups = vm.getStore('permissionWorkgroups');

        vm.set('currentCatalog', currentCatalog);

        permissionUsers.addFilter([
            {'property': 'prm_product', value: currentCatalog.get('id')}
        ]);

        permissionUsers.load();

        permissionWorkgroups.addFilter([
            {'property': 'product', value: currentCatalog.get('id')}
        ]);

        permissionWorkgroups.load();

    },

    onLoadUsers: function (users) {
        var me = this,
            vm = me.getViewModel(),
            permissionUsers = vm.getStore('permissionUsers');

        // toda vez que store de usuarios do mesmo grupo que o usuario logado, carregar
        // remover os usuarios que ja estao na store de permissionUsers
        permissionUsers.each(function (user) {

            users.remove(users.getById(user.get('prm_user')));

        }, this);
    },

    onAddUser: function () {
        var me = this,
            vm = me.getViewModel(),
            win;

        win = Ext.create('Target.view.settings.PermissionUserWindow',{});

        me.getView().add(win);

        win.show();

    },

    onCancelPermissionUser: function () {
        var me = this;

        me.lookupReference('permissionUserForm').getForm().reset();
        me.lookupReference('winPermissionUser').close();
    },

    onAddPermissionUser: function () {
        var me = this,
            view = me.getView(),
            vm = me.getViewModel(),
            permissions = vm.getStore('permissions'),
            product = vm.get('currentCatalog'),
            users = vm.getStore('users'),
            permissionUsers = vm.getStore('permissionUsers'),
            refs = me.getReferences(),
            cmb = refs.cmbPermissionUser,
            form = refs.permissionUserForm,
            user = cmb.getValue(),
            record;

        view.setLoading(true);

        record = Ext.create('Target.model.Permission', {
            prm_product: product.get('id'),
            prm_user: user,
            prm_workgroup: null
        });

        permissions.add(record);

        permissions.sync({
            callback: function () {
                permissionUsers.load();

                users.remove(users.getById(user));

                form.reset();

                view.setLoading(false);
            }
        });

    },

    onRemoveUser: function () {
        var me = this;

        Ext.MessageBox.confirm('Confirm', 'Are you sure you want to remove this user?', this.onRemovePermissionUser, this);

    },

    onRemovePermissionUser:function () {
        var me = this,
            view = me.getView(),
            vm = me.getViewModel(),
            permissions = vm.getStore('permissions'),
            currentCatalog = vm.get('currentCatalog'),
            refs = me.getReferences(),
            grid = refs.permissionUsersGrid,
            user = grid.selection;

        if (user) {
            view.setLoading(true);

            permissions.addFilter([
                {'property': 'prm_product', value: currentCatalog.get('id')},
                {'property': 'prm_user', value: user.get('prm_user')}
            ]);

            permissions.load({
                callback: function () {

                    if (this.count() === 1) {

                        this.remove(this.first());

                        this.sync({
                            callback: function () {
                                view.setLoading(false);
                                me.deleteSucces();
                            }
                        });
                    }
                }
            });
        }
    },

    deleteSucces:function () {
        var me = this,
            vm = me.getViewModel(),
            permissions = vm.getStore('permissions'),
            permissionUsers = vm.getStore('permissionUsers');

        permissionUsers.load();

        permissions.clearFilter(true);
        permissions.removeAll();

    },

    onCancelPermissionUser: function () {
        var me = this,
            refs = me.getReferences(),
            win = refs.winPermissionUser;

        win.close();
    }

});
