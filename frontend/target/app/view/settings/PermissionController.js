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
            },
            '#Workgroups': {
                load: 'onLoadWorkgroups'
            },
            '#Users2': {
                load: 'onLoadUsers2'
            }
        }
    },

    onChangeCatalog: function (currentCatalog) {
        var me = this,
            vm = me.getViewModel(),
            permissionUsers = vm.getStore('permissionUsers'),
            permissionWorkgroups = vm.getStore('permissionWorkgroups'),
            refs = me.getReferences(),
            chk_is_plublic = refs.chkIsPlublic;

        vm.set('currentCatalog', currentCatalog);

        permissionUsers.addFilter([
            {'property': 'prm_product', value: currentCatalog.get('id')}
        ]);

        permissionUsers.load();

        permissionWorkgroups.addFilter([
            {'property': 'product', value: currentCatalog.get('id')}
        ]);

        permissionWorkgroups.load();

        // marcar se o catalogo e publico
        if (currentCatalog.get('prd_is_public') === true) {
            chk_is_plublic.setValue(true);

        } else {
            chk_is_plublic.setValue(false);
        }

    },

    onChangeIsPublic: function (chk, newValue) {
        var me = this,
            vm = me.getViewModel(),
            currentCatalog = vm.get('currentCatalog');

        if (newValue != currentCatalog.get('prd_is_public')) {
            me.changePublic(newValue);
        }

        me.enableDisablePermissions();
    },

    enableDisablePermissions: function () {
        var me = this,
            vm = me.getViewModel(),
            currentCatalog = vm.get('currentCatalog'),
            refs = me.getReferences(),
            usersgrid = refs.permissionUsersGrid,
            workgroupsgrid = refs.permissionWorkgroupsGrid;

        if (currentCatalog.get('prd_is_public')) {
            usersgrid.disable();
            workgroupsgrid.disable();

        } else {
            usersgrid.enable();
            workgroupsgrid.enable();
        }

    },

    changePublic: function (is_public) {
        var me = this,
            vm = me.getViewModel(),
            currentCatalog = vm.get('currentCatalog'),
            data;

        data = {
            prd_is_public: is_public
        };

        // Submit Catalog
        Ext.Ajax.request({
            cors: true,
            method: 'PATCH',
            url: '/dri/api/product/' + currentCatalog.get('id') + '/',
            success: function () {

                currentCatalog.set('prd_is_public', is_public);

                me.enableDisablePermissions();

            },
            failure: function (response) {
                // TODO MENSAGEM DE ERRO E FECHAR A JANELA
                Ext.MessageBox.show({
                    title: 'Server Side Failure',
                    msg: response.status + ' ' + response.statusText,
                    buttons: Ext.MessageBox.OK,
                    icon: Ext.MessageBox.WARNING
                });
            },
            // Headers necessarios para fazer um Post Autheticado no Django
            headers: {
                'Accept': 'application/json',
                'Application': 'application/json',
                'Content-Type': 'application/json',
                'X-CSRFToken': Ext.util.Cookies.get('csrftoken')
            },
            params: Ext.util.JSON.encode(data)
        });

    },

    // ------------------------- Users -------------------------

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
            win;

        win = me.lookupReference('winPermissionUser');

        if (!win) {
            win = Ext.create('Target.view.settings.PermissionUserWindow',{});

            me.getView().add(win);
        }

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

        if (user) {

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
        }
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

    // ------------------------- Workgroup -------------------------

    onLoadWorkgroups: function (workgroups) {
        var me = this,
            vm = me.getViewModel(),
            permissionWorkgroups = vm.getStore('permissionWorkgroups');

        permissionWorkgroups.each(function (workgroup) {

            workgroups.remove(workgroups.getById(workgroup.get('wgu_workgroup')));

        }, this);

    },

    onAddWorkgroup: function () {
        var me = this,
            win;

        win = me.lookupReference('winPermissionWorkgroup');

        if (!win) {
            win = Ext.create('Target.view.settings.PermissionWorkgroupWindow',{});

            me.getView().add(win);
        }

        win.show();

    },

    onCancelPermissionWorkgroup: function () {
        var me = this;

        me.lookupReference('permissionWorkgroupForm').getForm().reset();
        me.lookupReference('winPermissionWorkgroup').close();
    },

    onAddPermissionWorkgroup: function () {
        var me = this,
            view = me.getView(),
            vm = me.getViewModel(),
            permissions = vm.getStore('permissions'),
            product = vm.get('currentCatalog'),
            workgroups = vm.getStore('workgroups'),
            permissionWorkgroups = vm.getStore('permissionWorkgroups'),
            refs = me.getReferences(),
            cmb = refs.cmbPermissionWorkgroup,
            form = refs.permissionWorkgroupForm,
            workgroup = cmb.getValue(),
            record;

        view.setLoading(true);

        record = Ext.create('Target.model.Permission', {
            prm_product: product.get('id'),
            prm_user: null,
            prm_workgroup: workgroup
        });

        permissions.add(record);

        permissions.sync({
            callback: function () {
                permissionWorkgroups.load();

                workgroups.remove(workgroups.getById(workgroup));

                form.reset();

                view.setLoading(false);
            }
        });

    },

    onRemoveWorkgroup: function () {
        var me = this;

        Ext.MessageBox.confirm('Confirm', 'Are you sure you want to remove this Workgroup?', me.onRemovePermissionWorkgroup, me);

    },

    onRemovePermissionWorkgroup: function () {
        var me = this,
            view = me.getView(),
            vm = me.getViewModel(),
            permissions = vm.getStore('permissions'),
            currentCatalog = vm.get('currentCatalog'),
            refs = me.getReferences(),
            grid = refs.permissionWorkgroupsGrid,
            workgroup = grid.selection;

        if (workgroup) {
            view.setLoading(true);

            permissions.addFilter([
                {'property': 'prm_product', value: currentCatalog.get('id')},
                {'property': 'prm_workgroup', value: workgroup.get('wgu_workgroup')}
            ]);

            permissions.load({
                callback: function () {

                    if (this.count() === 1) {

                        this.remove(this.first());

                        this.sync({
                            callback: function () {
                                view.setLoading(false);
                                me.deleteWorkgroupSucces();
                            }
                        });
                    }
                }
            });
        }
    },

    deleteWorkgroupSucces:function () {
        var me = this,
            vm = me.getViewModel(),
            permissions = vm.getStore('permissions'),
            permissionWorkgroups = vm.getStore('permissionWorkgroups');

        permissionWorkgroups.load();

        permissions.clearFilter(true);
        permissions.removeAll();

    },

    // ------------------------ Manage Workgroup ------------------------

    onCreateWorkgroup: function () {
        var me = this,
            win;

        win = Ext.create('Target.view.settings.AddWorkgroupWindow',{});

        me.getView().add(win);

        win.show();

    },

    onCancelCreateWorkgroup: function () {
        var me = this;

        me.lookupReference('createWorkgroupForm').getForm().reset();
        me.lookupReference('winAddWorkgroup').close();
    },

    onInsertWorkgroup: function () {
        console.log('onInsertWorkgroup');
        var me = this,
            view = me.getView(),
            vm = me.getViewModel(),
            workgroups = vm.getStore('workgroups'),
            txt_workgroup_name = me.lookupReference('txtWorkgroupName'),
            workgroup_name = txt_workgroup_name.getValue(),
            flag = true,
            record,
            created;

        view.setLoading(true);

        if ((workgroup_name !== null) && (workgroup_name !== '')) {

            workgroups.each(function (r) {
                if (workgroup_name === r.get('wgp_workgroup')) {
                    flag = false;
                }

            }, this);

            if (flag) {
                record = Ext.create('Target.model.Workgroup', {
                    wgp_workgroup: workgroup_name
                });

                workgroups.add(record);

                workgroups.sync({
                    callback: function (a, b, c) {
                        workgroups.load({
                            callback: function () {
                                this.each(function (r) {
                                    if (workgroup_name === r.get('wgp_workgroup')) {
                                        created = r;

                                        vm.set('newWorkgroup', created);

                                        me.onSuccesCreateWorkgroup(created);

                                        view.setLoading(false);
                                    }
                                }, this);
                            }
                        });

                    }
                });
            } else {
                Ext.MessageBox.alert('', 'Workgroup already exists');
            }
        }
    },

    onSuccesCreateWorkgroup: function (created) {
        var me = this,
            vm = me.getViewModel(),
            workgroup = vm.get('newWorkgroup'),
            workgroupUsers = vm.getStore('workgroupUsers'),
            refs = me.getReferences(),
            cmbAddWorkgroupUser = refs.cmbAddWorkgroupUser,
            btnCreateWorkgroup = refs.btnCreateWorkgroup;

        workgroupUsers.addFilter([
            {'property': 'wgu_workgroup', value: created.get('id')}
        ]);

        workgroupUsers.load();

        // Enable add User
        cmbAddWorkgroupUser.enable();

        // Disable create button
        btnCreateWorkgroup.disable();

    },

    onAddUserInWorkgroup: function () {
        console.log('onAddUserInWorkgroup');
        var me = this,
            view = me.getView(),
            vm = me.getViewModel(),
            workgroup = vm.get('newWorkgroup'),
            workgroupUsers = vm.getStore('workgroupUsers'),
            users = vm.getStore('users2'),
            refs = me.getReferences(),
            cmb = refs.cmbAddWorkgroupUser,
            user = cmb.getValue(),
            record;

        view.setLoading(true);

        console.log('workgroup', '=', workgroup);

        if (user) {

            record = Ext.create('Target.model.WorkgroupUser', {
                wgu_workgroup: workgroup.get('id'), // HARDCODED HARDCODED HARDCODED HARDCODED HARDCODED HARDCODED HARDCODED HARDCODED
                wgu_user: user
            });

            workgroupUsers.add(record);

            workgroupUsers.sync({
                callback: function () {
                    workgroupUsers.load();

                    users.remove(users.getById(user));

                    cmb.setValue(null);

                    view.setLoading(false);
                }
            });
        }
    },

    onRemoveUserInWorkgroup: function () {
        console.log('onRemoveUserInWorkgroup');
        var me = this,
            view = me.getView(),
            vm = me.getViewModel(),
            workgroupUsers = vm.getStore('workgroupUsers'),
            users = vm.getStore('users2'),
            refs = me.getReferences(),
            grid = refs.WorkgroupUsersGrid,
            workgroupUser = grid.selection;

        view.setLoading(true);

        if (workgroupUser) {

            workgroupUsers.remove(workgroupUser);

            workgroupUsers.sync({
                callback: function () {
                    workgroupUsers.load();

                    users.load();

                    view.setLoading(false);
                }
            });

        }

    },

    onLoadUsers2: function (user2) {
        var me = this,
            vm = me.getViewModel(),
            workgroupUsers = vm.getStore('workgroupUsers');

        // toda vez que store de usuarios do mesmo grupo que o usuario logado, carregar
        // remover os usuarios que ja estao na store de workgroupUsers
        workgroupUsers.each(function (user) {

            user2.remove(user2.getById(user.get('wgu_user')));

        }, this);

    }

});
