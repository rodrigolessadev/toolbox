#!/usr/bin/env python3
"""
Template de Plugin
------------------
Copie esta pasta para plugins/<seu-nome>/, edite plugin.json e main.py,
e cadastre o comando no Toolbox (botão +).

Convenção:
  - plugin.json descreve o plugin.
  - main.py é o entrypoint.
  - O Toolbox spawna o processo a partir desta pasta (cwd = pasta do plugin).
  - Se main.py abrir uma UI, ela roda em janela independente.
  - Para CLI-only, leia sys.argv ou imprima o resultado.
"""

import sys


def run():
    print("Olá do meu plugin! 🛠")
    print("Argumentos recebidos:", sys.argv[1:])


if __name__ == "__main__":
    run()
