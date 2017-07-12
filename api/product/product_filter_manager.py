import dri.settings
from dri.settings.local_vars import *
from .models import *
from .serializers import *
from sqlalchemy import create_engine, inspect, MetaData, func, Table
from sqlalchemy.sql import select
from lib.sqlalchemy_wrapper import DBDRIHelper, DBOracle
from sqlalchemy.sql.expression import Executable, ClauseElement
from sqlalchemy.ext.compiler import compiles
import csv
from tabulate import tabulate
import json
from product_register.ImportProcess import Import
from product_register.models import *


class CreateTableAs(Executable, ClauseElement):
    """
    Creates a new table in the database using a query result.
    """
    def __init__(self, schema, name, query):
        self.schema = schema
        self.name = name
        self.query = query


# Os DB que uso podem usar a mesma sintaxe.
@compiles(CreateTableAs)
def _create_table_as(element, compiler, **kw):
    _schema = "%s." % element.schema if element.schema is not None else ''
    return "CREATE TABLE %s%s AS (%s)" % (
        _schema,
        element.name,
        compiler.process(element.query))


class DBPool:
    engine = None

    @staticmethod
    def getConnection():
        if not DBPool.engine:
            print("Creating engine")
            db = DBOracle(DBDRIHelper.prepare_connection("catalog"))
            DBPool.engine = create_engine(db.get_string_connection())
        return DBPool.engine.connect()


class FilterCommand:
    "Implements routines to convert target filter into product"
    def __init__(self, filter_id):        
        self.filter_id = filter_id
        self.conn = DBPool.getConnection()
        self.filter = Filterset.objects.filter(id=filter_id)[0]
        self.filterconditions = FilterCondition.objects.filter(filterset = filter_id)

    def createSQLFromFilter(self):
        ret = " select "
        cols = self.filter.product.productcontent_set.all()
        for col in cols:
            ret += col.pcn_column_name + ","
        ret = ret[:-1]
        ret += " from " + self.filter.product.table.tbl_name
        if len(self.filterconditions) > 0 :
            ret += " where "
            for cond in self.filterconditions:
                ret += str(cond) + " and "
            ret = ret[:-4]
        return ret

    def getHeaders(self):
        return [x.pcn_column_name for x in self.filter.product.productcontent_set.all()]

    def execute(self):
        pass
    
class SaveFilterAsProduct(FilterCommand):
    "Implements routines to convert target filter into product"
    def __init__(self, filter_id, tablename, user, description):
        self.tablename = tablename
        self.description = description
        self.user = user
        super().__init__(filter_id)

    def createTableFromFilter(self):
        self.conn.execute("create table " + self.tablename + " as (" + self.createSQLFromFilter() + ")")

    def registerProductFromFilter(self):
        imp = Import()
        imp.user = self.user
        imp.owner = self.user
        imp.site = imp.get_site(imp.user)
        imp.process = None

        
        product_id = self.filter.product.id
        print(product_id)
        queryset = ProductContentAssociation.objects.select_related().filter(pca_product=product_id)
        
        serializer = AssociationSerializer(queryset, many=True)
        associations = serializer.data
        properties = dict()
        
        for property in associations:
            if property.get('pcc_ucd'):
                properties.update({
                    property.get('pcc_ucd'): property.get('pcn_column_name').lower()
                })

        massoc = []
        for key, value in properties.items():
            maux = {"ucd": key, "property" : value }
            massoc.append(maux)
         
                
        data = [{
            "process_id": 103,
            "display_name": "Filter " + self.filter.fst_name + " - " + self.filter.product.prd_display_name,
            #  "nside": null,
            #  "ordering": null,
            #  "fields": ["Y1A1_COADD_STRIPE82"],
            #  "pypeline_name": "WAZP",
            #  "job_id": 135586,
            #  "filter": null,
            #  "version": 9,
            #  "releases": [],
            "table": self.tablename,
            #   "schema": null,
            "association": massoc,
            "type": "catalog",
            "class": self.filter.product.prd_class.pcl_name,
            "name": "Filter " + self.filter.fst_name + " - " + self.filter.product.prd_display_name,  
        }]
        imp.import_products(data)
        
    def execute(self):
        self.createTableFromFilter()
        self.registerProductFromFilter()
        self.conn.close()

class ExporteFilter(FilterCommand):
    "Implement Methods to export target filter into many formats"
    def __init__(self, filter_id):
        super().__init__(filter_id)

    def export2CSV(self, filename):
        q = self.conn.execute(self.createSQLFromFilter())
        outfile = open(filename, 'w')
        outcsv = csv.writer(outfile)
        outcsv.writerows([self.getHeaders()])
        outcsv.writerows(q.fetchall())
        outfile.close()

    def export2FITS(self):
        pass

    def export2LatexTable(self, filename):
        q = self.conn.execute(self.createSQLFromFilter())
        outfile = open(filename, 'w')
        outfile.write(tabulate(q.fetchall(), self.getHeaders(), tablefmt="latex"))
        outfile.close()

    def export2JSON(self, filename):
        q = self.conn.execute(self.createSQLFromFilter())
        outfile = open(filename, 'w')
        outfile.write(json.dumps({
            'headers': self.getHeaders(),
            'data': [], #TODO
        }))
        outfile.close()
        pass

class ReportFilter(FilterCommand):
    "Implements method to get a report from a target filter"
    def __init__(self, filter_id):
        super().__init__(filter_id)


