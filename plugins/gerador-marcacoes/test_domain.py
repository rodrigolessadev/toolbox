#!/usr/bin/env python3
import unittest
from datetime import date
from main import (
    time_to_minutes,
    escape_sql,
    format_date,
    format_value,
    date_range,
    gerar_inserts,
    process_gerar_marcacoes,
)


class TestGeradorMarcacoesDomain(unittest.TestCase):
    def test_time_to_minutes(self):
        self.assertEqual(time_to_minutes("08:00"), "480")
        self.assertEqual(time_to_minutes("12:30"), "750")
        self.assertEqual(time_to_minutes("00:00"), "0")

    def test_escape_sql(self):
        self.assertEqual(escape_sql("O'Reilly"), "O''Reilly")

    def test_format_date_sqlserver(self):
        val = format_date("03-04-2025 00:00:00.000", "sqlserver")
        self.assertEqual(val, "'03-04-2025 00:00:00.000'")

    def test_format_date_oracle(self):
        val = format_date("03-04-2025 00:00:00.000", "oracle")
        self.assertEqual(val, "TO_DATE('03-04-2025 00:00:00', 'DD-MM-YYYY HH24:MI:SS')")

    def test_date_range_filter(self):
        # 2025-04-01 is Tuesday (JS: 2), 2025-04-02 is Wednesday (JS: 3), 2025-04-03 is Thursday (JS: 4)
        start = date(2025, 4, 1)
        end = date(2025, 4, 3)
        # Select Tuesdays (2) and Thursdays (4)
        days = date_range(start, end, {2, 4})
        self.assertEqual(len(days), 2)
        self.assertEqual(days[0], date(2025, 4, 1))
        self.assertEqual(days[1], date(2025, 4, 3))

    def test_process_gerar_marcacoes_success(self):
        res = process_gerar_marcacoes(
            fields={"NUMCRA": "600000010"},
            horarios=["08:00", "12:00"],
            datas=[date(2025, 4, 3)],
            banco="sqlserver",
        )
        self.assertTrue(res["success"])
        self.assertEqual(res["count"], 2)
        self.assertIn("INSERT INTO R070ACC", res["sql"])
        self.assertIn("480", res["sql"])  # 08:00
        self.assertIn("720", res["sql"])  # 12:00

    def test_process_gerar_marcacoes_invalid_banco(self):
        res = process_gerar_marcacoes(
            fields={},
            horarios=["08:00"],
            banco="postgres",
        )
        self.assertFalse(res["success"])
        self.assertIn("não suportado", res["error"])

    def test_process_gerar_marcacoes_empty_horarios(self):
        res = process_gerar_marcacoes(
            fields={},
            horarios=[],
            banco="sqlserver",
        )
        self.assertFalse(res["success"])
        self.assertIn("Ao menos um horário", res["error"])


if __name__ == "__main__":
    unittest.main()
