import urllib.parse

import requests


class Comanage:

    def __init__(self, service_url: str, user: str, password: str, coid: int = 2):

        self.service_url = service_url
        self.user = user
        self.password = password
        self.coid = coid

    def request(self, endpoint: str, params: dict):

        try:
            url = urllib.parse.urljoin(self.service_url, endpoint)

            r = requests.get(url, auth=(self.user, self.password), params=params)

            if r.status_code == 200:
                return r.json()
            else:
                raise Exception(f"Request Fail with status code: {r.status_code}")

            # TODO: Tratar os demais códigos de retorno

        except Exception as e:
            raise Exception(e)

    def get_org_identities(self, identifier: str):
        """Recupera a OI da pessoa pelo eppn (identificador)

        Exemplo: GET https://register.linea.org.br/registry/org_identities.json?coid=2&search.identifier=6f9a1fe31eb504c3823b8277f9894f14@ifsc.edu.br
        """
        # Em caso de erro 204 - Significa que não tem nenhum link associado ao eppn
        return self.request(
            "registry/org_identities.json",
            {"coid": self.coid, "search.identifier": identifier},
        )

    def get_org_identity_id(self, identifier: str):
        result = self.get_org_identities(identifier=identifier)

        org_identities = result["OrgIdentities"]
        if len(org_identities) == 0:
            raise Exception(
                f"get_org_identities deveria retornar um ou mais resultados mas retornou {len(org_identities)}"
            )

        return org_identities[0]["Id"]

    def get_org_identities_links(self, identifier: str):
        """Recupera links de CO Person de acordo com a chave `id` da consulta org_identities

        Exemplo: GET https://register.linea.org.br/registry/co_org_identity_links.json?orgidentityid=692
        """

        # orgidentityid
        oi = self.get_org_identity_id(identifier)
        return self.request(
            "registry/co_org_identity_links.json", {"orgidentityid": oi}
        )

    def get_co_person_id(self, identifier: str):

        result = self.get_org_identities_links(identifier)

        identity_links = result["CoOrgIdentityLinks"]
        if len(identity_links) == 0:
            raise Exception(
                f"get_org_identities_links deveria retornar um ou mais resultados mas retornou {len(identity_links)}"
            )

        return identity_links[0]["CoPersonId"]

    def get_identifiers(self, copersonid: int):
        """Recuperar identificadores internos de acordo com `copersonid`
        Exemplo: GET https://register.linea.org.br/registry/identifiers.json?copersonid=412
        """

        result = self.request("registry/identifiers.json", {"copersonid": copersonid})
        return result["Identifiers"]

    def get_names(self, copersonid: int):
        """Recuperar nomes de acordo com `copersonid`
        Exemplo: GET https://register.linea.org.br/registry/names.json?copersonid=412
        """
        result = self.request("registry/names.json", {"copersonid": copersonid})
        return result["Names"]

    def get_emails(self, copersonid: int):
        """Recuperar email de acordo com `copersonid`
        Exemplo: GET https://register.linea.org.br/registry/email_addresses.json?copersonid=412
        """
        result = self.request(
            "registry/email_addresses.json", {"copersonid": copersonid}
        )
        return result["EmailAddresses"]

    def get_groups(self, copersonid: int, include_internal_groups: bool = False):
        """Recuperar Grupos da Pessoa de acordo com `copersonid`
        Exemplo: GET https://register.linea.org.br/registry/co_groups.json?copersonid=412
        """
        result = self.request("registry/co_groups.json", {"copersonid": copersonid})

        if include_internal_groups:
            return result["CoGroups"]
        else:
            groups = []
            for group in result["CoGroups"]:
                if group["Auto"] == False and group["GroupType"] == "S":
                    groups.append(group)
            return groups

    def get_ldap_uid(self, identifier: str):

        copersonid = self.get_co_person_id(identifier=identifier)

        identifiers = self.get_identifiers(copersonid=copersonid)

        for identifie in identifiers:
            if identifie["Type"] == "uid":
                return identifie["Identifier"]

        raise Exception("Não encontrou usuario correspondente no ldap.")
