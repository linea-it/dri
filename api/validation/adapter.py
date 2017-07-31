from django.conf import settings
from allauth.socialaccount.adapter import DefaultSocialAccountAdapter
from .models import UserEmail
from allauth.account.utils import user_email

class DriAccountAdapter(DefaultSocialAccountAdapter):

    def is_open_for_signup(self, request, sociallogin):
        """
        Checks whether or not the site is open for signups.
        Next to simply returning True/False you can also intervene the
        regular flow by raising an ImmediateHttpResponse
        """
        email = user_email(sociallogin.user)
        try:
            queryset = UserEmail.objects.select_related().get(email=email)
            return True
        except:
            return False
