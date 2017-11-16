from lib.sqlalchemy_wrapper import DBBase
from sqlalchemy.sql import text


class RawQueryValidator(DBBase):
    def __init__(self, raw_sql, db='catalog'):
        super(RawQueryValidator, self).__init__(db)

        with self.engine.connect() as con:
            try:
                rs = con.execute(text(raw_sql)).fetchone()
                self._is_query_validated = True
                self._validation_error_message = None
            except Exception as e:
                self._is_query_validated = False
                self._validation_error_message = str(e)

    def is_query_validated(self):
        return self._is_query_validated

    def validation_error_message(self):
        return self._validation_error_message

    def get_json_response(self):
        return dict({'is_validated': self._is_query_validated,
                    'error_message': self._validation_error_message})
