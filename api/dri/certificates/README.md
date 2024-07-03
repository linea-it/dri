# Diretório contendo os certificados

Inclua no diretório seus certificados para assinatura e encriptação das asserções SAML.

Caso não possua certificados válidos gere um certificado autoassinado através do comando abaixo:

```bash
# criando chave
$ openssl genrsa -out mykey.key 2048

# mudando permissões de leitura e escrita da chave
$ chmod 600 mykey.key

# criando certificado a partir da chave
$ openssl req -new -key mykey.key -out mycert.csr
$ openssl x509 -req -days 365 -in mycert.csr -signkey mykey.key -out mycert.crt

$  cp mycert.key mykey.pem
$  cp mycert.crt mycert.pem
```
