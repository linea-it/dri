import ldap
def get_ldap_username_by_email(email):
    # https://stackoverflow.com/a/29633047/24123418

    AUTH_LDAP_SERVER_URI='ldap://srvlslave01.linea.org.br:389'

    conn = ldap.initialize(AUTH_LDAP_SERVER_URI)

    criteria = f"(&(mail={email}))"

    users = []
    try:
        res =conn.search_s("ou=people,dc=linea,dc=org", ldap.SCOPE_SUBTREE, criteria)

        for dn, entry in res:
            users.append(entry['uid'][0].decode())

    except Exception as error:
        print(error)

    if len(users) == 1:
        return users[0]
    else:
        raise Exception(f"It was not possible to identify the user related to the email. {len(users)} results were found.")

# username = get_ldap_username_by_email("xxx@gmail.com")
# print(username)