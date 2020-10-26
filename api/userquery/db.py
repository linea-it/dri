from lib.sqlalchemy_wrapper import DBBase
from sqlalchemy.sql import text
import logging


class RawQueryValidator(DBBase):
    def __init__(self, raw_sql, db='catalog', use_count=False, maxrows=0):
        super(RawQueryValidator, self).__init__(db)

        self.log = logging.getLogger('userquery')

        self.log.info("Checking if the query is valid:")
        self.log.debug("Original Query: %s" % raw_sql.replace("\n", " "))
        with self.engine.connect() as con:
            try:
                self._count = -1

                if use_count:
                    if maxrows > 0:
                        raw_sql = raw_sql + ' ' + self.database.get_raw_sql_limit(0, maxrows)

                    sql = 'SELECT COUNT(*) FROM (' + raw_sql + ')'

                    self.log.info("Executed Query: %s" % sql.replace("\n", " "))

                    row = con.execute(sql).fetchone()
                    self._count = row[0]
                else:
                    self.log.info("Executed Query: %s" % raw_sql)
                    con.execute(text(raw_sql)).fetchone()

                self._is_query_validated = True
                self._validation_error_message = None
                self.log.info("Query is valid!")
            except Exception as e:
                self._is_query_validated = False
                self._validation_error_message = str(e)
                self.log.warning("Query is NOT valid!")

    def get_sql_count(self):
        return self._count

    def is_query_validated(self):
        return self._is_query_validated

    def validation_error_message(self):
        return self._validation_error_message

    def get_json_response(self):
        return dict({'is_validated': self._is_query_validated,
                     'error_message': self._validation_error_message})
