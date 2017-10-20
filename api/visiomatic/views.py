from django.shortcuts import render
import requests
from rest_framework.response import Response
from rest_framework.decorators import api_view, permission_classes
from rest_framework.permissions import IsAuthenticated
from io import StringIO
import csv

@api_view(['GET'])
@permission_classes([IsAuthenticated])
def vizier_2mass(request):
    if request.method == 'GET':
        """
        
        Documentacao do Visizer
        http://vizier.u-strasbg.fr/vizier/doc/vizquery.htx
        
        Exemplo de uma URL
        http://vizier.u-strasbg.fr/viz-bin/asu-tsv?&-mime=csv&-source=II/246&-out=2MASS, RAJ2000, DEJ2000, Jmag, Hmag, Kmag&-out.meta=&-c.eq=J2000.0&-c=335.445459,-0.465377&-c.bd=0.0782,0.0595&-out.max=10001
        
        Params a serem enviados. Nao estou enviando os parametros pelo atributo params do request, por que 
        nao funcionou, por que a lib requests encoda os parametros e API do visier nao aceita.
        {
            "-mime": "csv",
            "-source": "II/246",
            "-out": "2MASS, RAJ2000, DEJ2000, Jmag, Hmag, Kmag",
            "-out.meta": "",
            "-c.eq": "J2000.0",
            "-c:": "335.445459, -0.465377",
            "-c.bd": "0.0782, 0.0595",
            "-out.max": "10001"
        }        
        """

        # As 3 primeiras propriedades sempre serao (ID, RA, DEC)
        fieldnames = list(["2MASS", "RAJ2000", "DEJ2000", "Jmag", "Hmag", "Kmag"])

        entry_point = "http://vizier.u-strasbg.fr/viz-bin/asu-tsv"

        # Parametros
        params = tuple([
            ("-mime", "csv"),
            ("-source", "II/246"),
            ("-out", ",".join(fieldnames)),
            ("-out.meta", ''),
            ("-c.eq", "J2000.0"),
            ("-c", "335.445459,-0.465377"),
            ("-c.bd", "0.0782,0.0595"),
            ("-out.max", "10001")
        ])

        # Criar uma string com os parametros
        payload_str = "&".join("%s=%s" % (k, v) for k, v in params)

        print(params)

        print("--------- Disparando Request -----------------")

        try:
            response = requests.get(
                entry_point + "?" + payload_str,
                headers={
                    "Accept": "text/tab-separated-values",
                },
            )

            print(response.url)

            print(response.text)

            # Converter o CSV para Json
            csv_str = StringIO(response.text)
            #reader = csv.reader(csv_str, delimiter=';')


            # remover as linhas da resposta que estao comentadas e a linha que separa os dados
            lines = list()
            for l in csv_str:
                if not l.startswith("#") and not l.startswith("---"):
                    lines.append(l)


            rows = list()

            reader = csv.DictReader(lines, fieldnames=fieldnames, delimiter=';')
            for row in reader:
                row.update({
                    "_meta_id": row.get(fieldnames[0]),
                    "_meta_ra": row.get(fieldnames[1]),
                    "_meta_dec": row.get(fieldnames[2]),
                })
                print(row)

                rows.append(row)


            return Response(
                dict({
                    "count": len(rows),
                    "results": rows
                }))

        except Exception as e:
            print(e)





