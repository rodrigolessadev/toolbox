import sys
import os

# Adiciona o diretório compartilhado ao sys.path
sys.path.insert(0, os.path.abspath(os.path.join(os.path.dirname(__file__), "..", "shared", "python")))

from toolbox_protocol import ToolboxProtocolHandler

def main():
    handler = ToolboxProtocolHandler()
    req = handler.read_request()
    if not req:
        # Erro já enviado pelo handler
        return

    # Emite mensagem de log normal (será capturada como Log Info pelo Toolbox)
    print("Iniciando execução do plugin de referência via protocolo v1.0...")

    # Emite atualizações de progresso
    handler.send_progress(25.0, "Validando parâmetros de entrada...")
    handler.send_progress(75.0, "Executando lógica de processamento...")

    # Registra um aviso de exemplo
    handler.add_warning("Modo demonstrativo do protocolo v1.0 ativo.")

    # Emite resposta de sucesso
    handler.send_success(
        result={
            "output": "Plugin de referência executado com sucesso!",
            "processed_items": 1,
            "status": "OK"
        },
        output_message="Plugin de referência executado com sucesso!"
    )

if __name__ == "__main__":
    main()
