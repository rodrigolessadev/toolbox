#!/usr/bin/env python3
import unittest
from main import to_excel_serial, convert_date_time_to_serial


class TestConverterDataDomain(unittest.TestCase):
    def test_to_excel_serial_known_date(self):
        # 1899-12-30 00:00 -> 0.0
        self.assertEqual(to_excel_serial("1899-12-30", "00:00"), 0.0)

    def test_to_excel_serial_half_day(self):
        # 1899-12-30 12:00 -> 0.5
        self.assertEqual(to_excel_serial("1899-12-30", "12:00"), 0.5)

    def test_convert_date_time_to_serial_valid(self):
        res = convert_date_time_to_serial("2025-04-03", "12:00")
        self.assertTrue(res["success"])
        self.assertIsInstance(res["serial"], float)
        self.assertGreater(res["serial"], 45000)

    def test_convert_date_time_to_serial_invalid_date(self):
        res = convert_date_time_to_serial("03/04/2025", "12:00")
        self.assertFalse(res["success"])
        self.assertIn("inválido", res["error"])

    def test_convert_date_time_to_serial_empty(self):
        res = convert_date_time_to_serial("", "")
        self.assertFalse(res["success"])
        self.assertIn("devem ser fornecidas", res["error"])


if __name__ == "__main__":
    unittest.main()
