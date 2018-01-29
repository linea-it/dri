from lib.sqlalchemy_wrapper import DBBase
from sqlalchemy.sql import text


class RawQueryValidator(DBBase):
    def __init__(self, raw_sql, db='catalog', use_count=False, maxrows=0):
        super(RawQueryValidator, self).__init__(db)

        with self.engine.connect() as con:
            try:
                self._count = -1

                if use_count:
                    if maxrows>0:
                        raw_sql = raw_sql + ' ' + self.database.get_raw_sql_limit(0, maxrows)

                    sql = 'SELECT COUNT(*) FROM (' + raw_sql + ')'

                    row = con.execute(sql).fetchone()
                    self._count = row[0]
                else:
                    con.execute(text(raw_sql)).fetchone()

                self._is_query_validated = True
                self._validation_error_message = None
            except Exception as e:
                self._is_query_validated = False
                self._validation_error_message = str(e)

    def get_sql_count(self):
        return self._count

    def is_query_validated(self):
        return self._is_query_validated

    def validation_error_message(self):
        return self._validation_error_message

    def get_json_response(self):
        return dict({'is_validated': self._is_query_validated,
                    'error_message': self._validation_error_message})
