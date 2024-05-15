
import logging

from django.contrib.auth.models import Group

from shibboleth.middleware import ShibbolethRemoteUserMiddleware

from common.linea_ldap import get_ldap_username_by_email

class ShibbolethMiddleware(ShibbolethRemoteUserMiddleware):

    def make_profile(self, user, shib_meta):
        """
        This is here as a stub to allow subclassing of ShibbolethRemoteUserMiddleware
        to include a make_profile method that will create a Django user profile
        from the Shib provided attributes.  By default it does nothing.
        """
        log = logging.getLogger('shibboleth')
        # log.debug("Shib Meta:")
        # log.debug(shib_meta)

        # log.debug("User:")
        # log.debug(user)

        # Guardar o email do usuario
        user.email = shib_meta['email']
        user.save()

        try:
            log.error("Retriving username from ldap.") 
            username = get_ldap_username_by_email(email=user.email)
            log.error(f"LDAP username: {username}")


            # NAO funcionou alterar o username. 
            # até cria o usuario corretamente, mas ao fazer logout e login novamente
            # Duplica o usuario e o segundo fica com username do eppn
            # user.username = username
            # user.save()
            # log.info("Changed username.")            

            user.profile.display_name = username
            user.profile.save()
            log.info("Changed display name.")            

        except Exception as e:
            log.error("Failed on retrive username from ldap. Error: %s" % e) 
        
        # # Adiciona um display name para o usuario
        # if user.profile.display_name is None or user.profile.display_name == user.username:
        #     user.profile.display_name = user.email.split('@')[0]
        #     user.profile.save()
        #     log.info("Added user profile display name")



        # Adicionar o usuario ao grupo Shibboleth
        try:
            group, created = Group.objects.get_or_create(name='Shibboleth')
            group.user_set.add(user)
            log.info("Added user to Shibboleth group")
        except Exception as e:
            log.error("Failed on add user to group shibboleth. Error: %s" % e)

        log.debug("--------------------------")

        return