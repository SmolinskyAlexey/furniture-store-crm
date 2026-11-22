import sqlite3
import subprocess
import sys
from pathlib import Path

root = Path(__file__).resolve().parents[1]
php = sys.argv[1] if len(sys.argv) > 1 else 'php'
capture = r'''namespace Models {
class _Base_ {} class CashMovements { public static string $table_name = 'cash_movements'; }
class PaymentMethods { public static string $default_sorting = 'order_by ASC'; }
} namespace {
class FakeDB { function getAllResults($query) { echo $query; return []; } }
$SQL = new FakeDB(); require $argv[1];
\Models\DailyCashBalance::getCurrentBalancesGroupedByPaymentMethod(strtotime('2026-11-22'));
}'''
sql = subprocess.check_output([php, '-r', capture, str(root / 'Models' / 'DailyCashBalance.php')], text=True)
db = sqlite3.connect(':memory:')
db.executescript('''
CREATE TABLE daily_cash_balance(date TEXT, payment_method INTEGER, balance NUMERIC);
CREATE TABLE cash_movements(created_at TEXT, payment_method INTEGER, direction TEXT, amount NUMERIC);
CREATE TABLE payment_methods(id INTEGER, name TEXT, order_by INTEGER);
INSERT INTO payment_methods VALUES (1, 'cash', 1);
INSERT INTO daily_cash_balance VALUES ('2026-03-25', 1, 100);
INSERT INTO daily_cash_balance VALUES ('2026-11-21', 1, 100);
INSERT INTO cash_movements VALUES ('2026-11-22 12:00:00', 1, 'cash_in', 20);
''')

def check(expected):
    rows = db.execute(sql).fetchall()
    actual = tuple(rows[0][2:6])
    assert actual == expected, (actual, expected)

check((100, 20, 0, 120))
db.execute("INSERT INTO cash_movements VALUES ('2026-11-19 00:00:00', 1, 'cash_in', 50)")
check((150, 20, 0, 170))
db.execute("UPDATE cash_movements SET amount=70 WHERE created_at='2026-11-19 00:00:00'")
check((170, 20, 0, 190))
db.execute("UPDATE cash_movements SET created_at='2026-11-22 08:00:00' WHERE amount=70")
check((100, 90, 0, 190))
db.execute('DELETE FROM cash_movements WHERE amount=70')
check((100, 20, 0, 120))
print('Cash balance regression passed')
