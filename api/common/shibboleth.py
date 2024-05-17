
import logging

from django.contrib.auth.models import Group

from shibboleth.middleware import ShibbolethRemoteUserMiddleware

# from common.linea_ldap import get_ldap_username_by_email
from common.comanage import Comanage
from django.conf import settings

class ShibbolethMiddleware(ShibbolethRemoteUserMiddleware):

    def make_profile(self, user, shib_meta):
        """
        This is here as a stub to allow subclassing of ShibbolethRemoteUserMiddleware
        to include a make_profile method that will create a Django user profile
        from the Shib provided attributes.  By default it does nothing.
        """
        log = logging.getLogger('shibboleth')
        log.debug("Starting authentication with Shibboleth")

        log.debug(f"Shib Meta: {shib_meta}")

        # eppn identity from shib meta atributes
        eppn = shib_meta['username']

        # Sempre atualiza o email do usuario do usuario
        user.email = shib_meta['email']
        user.save()

        try:
            # Instantiate Commange
            co = Comanage(
                service_url=settings.COMANAGE_SERVER_URL,
                user=settings.COMANAGE_USER,
                password=settings.COMANAGE_PASSWORD,
                coid=settings.COMANAGE_COID
            )

            log.debug("Retriving ldap uid from comanage.") 
            ldap_uid = co.get_ldap_uid(identifier=eppn)
            log.debug(f"LDAP UID: {ldap_uid}")

            log.debug("Updating user.profile.display_name.") 
            user.profile.display_name = ldap_uid
            user.profile.save()
            log.debug(f"Changed display name to {user.profile.display_name}")

        except Exception as e:
            msg = f"Failed on retrive ldap uid from COmanager. Error: {e}"
            log.error(msg) 
            raise Exception(msg)
        
        self.setup_groups(user, shib_meta)

        log.debug("".rjust(40, '-'))

        return

    def setup_groups(self, user, shib_meta):
        log = logging.getLogger('shibboleth')

        log.debug("Setup User Groups")

        # eppn identity from shib meta atributes
        eppn = shib_meta['username']

        # Add a custom group shibboleth for mark this user make login using shibboleth.
        groups = ['Shibboleth']

        # Recupera os grupos do usuario 
        # TODO: deveria usar o metodo: update_user_groups
        # https://github.com/Brown-University-Library/django-shibboleth-remoteuser/blob/main/shibboleth/middleware.py#L86
        try:

            # Instantiate Commange
            co = Comanage(
                service_url=settings.COMANAGE_SERVER_URL,
                user=settings.COMANAGE_USER,
                password=settings.COMANAGE_PASSWORD,
                coid=settings.COMANAGE_COID
            )

            log.error("Retriving User Groups from COmanage.") 
            personid= co.get_co_person_id(eppn)
            cogroups = co.get_groups(personid)

            for group in cogroups:
                groups.append(group['Name'])

        except Exception as e:
            msg = f"Failed on retrive groups from COmanage. Error: {e}"
            log.error(msg)
            raise Exception(msg) 

        # Remove the user from all groups that are not specified in the shibboleth metadata
        for group in user.groups.all():
            if group.name not in groups:
                group.user_set.remove(user)
                log.debug(f"User has been removed from the group {group.name}")

        # Add the user to all groups in the shibboleth metadata
        for g in groups:
            group, created = Group.objects.get_or_create(name=g)
            group.user_set.add(user)

        log.debug("User has been added to the following groups")
        log.debug(f"Groups: {groups}")



