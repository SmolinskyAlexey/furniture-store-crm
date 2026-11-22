"""SQLite-backed test adapter; translates only the MySQL syntax used by OverheadCash."""
import json
import sqlite3
import sys

db = sqlite3.connect(':memory:', isolation_level=None)
db.row_factory = sqlite3.Row
db.executescript('''
CREATE TABLE warehouses (id INTEGER PRIMARY KEY);
CREATE TABLE services (id INTEGER PRIMARY KEY);
CREATE TABLE payment_methods (id INTEGER PRIMARY KEY);
CREATE TABLE shifts (id INTEGER PRIMARY KEY, warehouse_id INTEGER, closed_at TEXT);
CREATE TABLE overhead_expenses (id INTEGER PRIMARY KEY, warehouse_id INTEGER, service_id INTEGER, amount NUMERIC, date TEXT, actual_expense_date TEXT, comment TEXT, manager_id INTEGER, cash_payment_method_id INTEGER, cash_movement_id INTEGER, cash_version INTEGER NOT NULL DEFAULT 0);
CREATE TABLE cash_movements (id INTEGER PRIMARY KEY, shift_id INTEGER, order_id INTEGER, direction TEXT, mov_type TEXT, amount NUMERIC, payment_method INTEGER, comment TEXT, warehouse_id INTEGER, created_by INTEGER, created_at TEXT);
CREATE TABLE overhead_expense_cash_movements (id INTEGER PRIMARY KEY, expense_id INTEGER, movement_id INTEGER UNIQUE, operation TEXT);
INSERT INTO warehouses VALUES (1),(2);
INSERT INTO services VALUES (1);
INSERT INTO payment_methods VALUES (1),(2);
INSERT INTO shifts VALUES (1,1,NULL),(2,2,NULL);
''')
for line in sys.stdin:
    try:
        request = json.loads(line)
        sql = request['sql'].replace(' FOR UPDATE', '').replace('NOW()', 'CURRENT_TIMESTAMP').replace('CURDATE()', "DATE('now', 'localtime')")
        cursor = db.execute(sql)
        rows = [dict(row) for row in cursor.fetchall()] if cursor.description else []
        print(json.dumps({'ok': True, 'rows': rows, 'insert_id': cursor.lastrowid}), flush=True)
    except Exception as exc:
        print(json.dumps({'ok': False, 'error': str(exc)}), flush=True)
