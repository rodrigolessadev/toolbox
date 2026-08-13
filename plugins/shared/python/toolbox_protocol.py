import sys
import json
import traceback

class ToolboxProtocolHandler:
    """
    Helper para plugins em Python comunicarem com o Toolbox v1.0 via Protocolo IPC (STDIN/STDOUT).
    
    Lê a requisição JSON do STDIN, permite enviar atualizações de progresso,
    warnings, e envia a resposta final em JSON para o STDOUT sem corromper os logs.
    """
    def __init__(self):
        self.request_data = None
        self.protocol_version = "1.0"
        self.request_id = "req_unknown"
        self.warnings = []

    def read_request(self):
        """Lê e realiza a desserialização da requisição JSON enviada pelo Toolbox via STDIN."""
        try:
            line = sys.stdin.readline()
            if not line:
                return None
            data = json.loads(line.strip())
            self.request_data = data
            self.protocol_version = data.get("protocol_version", "1.0")
            self.request_id = data.get("request_id", "req_unknown")
            return data
        except Exception as e:
            self.send_error("INVALID_MESSAGE", f"Falha ao processar requisição JSON: {str(e)}", traceback.format_exc())
            return None

    def send_progress(self, percent: float, message: str = ""):
        """Envia atualização intermediária de progresso em formato NDJSON."""
        msg = {
            "protocol_version": self.protocol_version,
            "request_id": self.request_id,
            "status": "progress",
            "progress": {
                "percent": percent,
                "message": message
            }
        }
        sys.stdout.write(json.dumps(msg, ensure_ascii=False) + "\n")
        sys.stdout.flush()

    def add_warning(self, warning_message: str):
        """Registra um aviso para inclusão na resposta final."""
        self.warnings.append(warning_message)

    def send_success(self, result: dict = None, output_message: str = "Sucesso"):
        """Envia a resposta final de sucesso ao Toolbox."""
        res = result if result is not None else {}
        if "output" not in res:
            res["output"] = output_message
        msg = {
            "protocol_version": self.protocol_version,
            "request_id": self.request_id,
            "status": "success",
            "result": res,
            "error": None,
            "warnings": self.warnings
        }
        sys.stdout.write(json.dumps(msg, ensure_ascii=False) + "\n")
        sys.stdout.flush()

    def send_error(self, code: str, message: str, details: str = None):
        """Envia a resposta final de erro padronizado ao Toolbox."""
        msg = {
            "protocol_version": self.protocol_version,
            "request_id": self.request_id,
            "status": "error",
            "result": None,
            "error": {
                "code": code,
                "message": message,
                "details": details
            },
            "warnings": self.warnings
        }
        sys.stdout.write(json.dumps(msg, ensure_ascii=False) + "\n")
        sys.stdout.flush()
