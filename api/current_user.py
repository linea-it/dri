from threading import local

_user = local()


class CurrentUserMiddleware():
    def __init__(self, get_response):
        self.get_response = get_response
        # One-time configuration and initialization.

    def __call__(self, request):
        # Code to be executed for each request before
        # the view (and later middleware) are called.
        response = self.get_response(request)

        _user.value = request.user
        # Code to be executed for each request/response after
        # the view is called.
        return response


def get_current_user():
    try:
        return _user.value
    except:
        return None

