import unittest
import io
import json
import sys
from toolbox_protocol import ToolboxProtocolHandler

class TestToolboxProtocolHandler(unittest.TestCase):
    def test_read_request_success(self):
        req_json = json.dumps({
            "protocol_version": "1.0",
            "request_id": "req_test_123",
            "action": "execute",
            "payload": {"args": []}
        })
        sys.stdin = io.StringIO(req_json + "\n")
        handler = ToolboxProtocolHandler()
        req = handler.read_request()
        
        self.assertIsNotNone(req)
        self.assertEqual(handler.protocol_version, "1.0")
        self.assertEqual(handler.request_id, "req_test_123")

    def test_send_progress(self):
        handler = ToolboxProtocolHandler()
        handler.protocol_version = "1.0"
        handler.request_id = "req_prog_1"
        
        buf = io.StringIO()
        old_stdout = sys.stdout
        sys.stdout = buf
        try:
            handler.send_progress(50.0, "Carregando...")
        finally:
            sys.stdout = old_stdout

        out = buf.getvalue().strip()
        data = json.loads(out)
        self.assertEqual(data["status"], "progress")
        self.assertEqual(data["progress"]["percent"], 50.0)

    def test_send_success(self):
        handler = ToolboxProtocolHandler()
        handler.protocol_version = "1.0"
        handler.request_id = "req_succ_1"
        handler.add_warning("Aviso de teste")

        buf = io.StringIO()
        old_stdout = sys.stdout
        sys.stdout = buf
        try:
            handler.send_success({"output": "OK", "count": 10})
        finally:
            sys.stdout = old_stdout

        out = buf.getvalue().strip()
        data = json.loads(out)
        self.assertEqual(data["status"], "success")
        self.assertEqual(data["result"]["output"], "OK")
        self.assertEqual(data["warnings"], ["Aviso de teste"])

    def test_send_error(self):
        handler = ToolboxProtocolHandler()
        handler.protocol_version = "1.0"
        handler.request_id = "req_err_1"

        buf = io.StringIO()
        old_stdout = sys.stdout
        sys.stdout = buf
        try:
            handler.send_error("INVALID_INPUT", "Dado inválido", "Stacktrace here")
        finally:
            sys.stdout = old_stdout

        out = buf.getvalue().strip()
        data = json.loads(out)
        self.assertEqual(data["status"], "error")
        self.assertEqual(data["error"]["code"], "INVALID_INPUT")
        self.assertEqual(data["error"]["message"], "Dado inválido")

if __name__ == "__main__":
    unittest.main()
