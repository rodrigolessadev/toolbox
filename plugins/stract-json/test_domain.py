#!/usr/bin/env python3
import unittest
from main import extract_field, process_json_extraction


class TestStractJsonDomain(unittest.TestCase):
    def test_extract_field_simple_dict(self):
        data = {"id": 101, "name": "Alice"}
        res = extract_field(data, "id")
        self.assertEqual(res, ["101"])

    def test_extract_field_nested_list(self):
        data = [
            {"colaborador": {"numeroCadastro": 123}},
            {"colaborador": {"numeroCadastro": 456}},
            {"other": [{"numeroCadastro": 789}]},
        ]
        res = extract_field(data, "numeroCadastro")
        self.assertEqual(res, ["123", "123", "456", "456", "789"])

    def test_process_json_extraction_success(self):
        raw = '{"users": [{"id": 1, "code": "A1"}, {"id": 2, "code": "B2"}]}'
        res = process_json_extraction(raw, "code")
        self.assertTrue(res["success"])
        self.assertEqual(res["values"], ["'A1'", "'B2'"])
        self.assertEqual(res["result_str"], "'A1', 'B2'")

    def test_process_json_extraction_empty_json(self):
        res = process_json_extraction("", "code")
        self.assertFalse(res["success"])
        self.assertIn("vazio", res["error"])

    def test_process_json_extraction_invalid_json(self):
        res = process_json_extraction("{invalid_json}", "code")
        self.assertFalse(res["success"])
        self.assertIn("JSON inválido", res["error"])

    def test_process_json_extraction_not_found(self):
        raw = '{"name": "Test"}'
        res = process_json_extraction(raw, "nonexistent")
        self.assertTrue(res["success"])
        self.assertEqual(res["values"], [])
        self.assertIn("não encontrado", res["result_str"])


if __name__ == "__main__":
    unittest.main()
