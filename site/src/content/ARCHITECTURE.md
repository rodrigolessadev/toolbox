---
title: "Como o Toolbox funciona"
description: "Entenda a estrutura do aplicativo e onde encontrar cada coisa."
---

O Toolbox é um **launcher** (abridor de comandos) feito para Windows. Você aperta um atalho, digita o que quer abrir e ele executa. Parece simples, mas por baixo tem três camadas: o app em si, o motor que descobre plugins e o lugar onde tudo fica salvo.

## As três camadas

| Camada | O que é | Para que serve |
|---|---|---|
| **Aplicativo** | A janela que aparece quando você aperta `Ctrl+Space` | Você digita aqui e escolhe o que executar |
| **Comandos** | A lista de coisas que o app sabe abrir (links, apps, plugins) | É o "catálogo" que aparece quando você digita |
| **Plugins** | Pastas extras com `plugin.json` + um script | Acrescentam comandos novos sem mexer no app principal |

## Onde os arquivos ficam no seu computador

Quando você instala o Toolbox, ele cria uma pasta com esta cara:

```
C:\Users\SeuNome\AppData\Roaming\Toolbox\
├── commands.json          ← sua lista de comandos (o principal)
├── logs\
│   └── history.json       ← últimos 100 comandos que você rodou
└── plugins\               ← plugins extras que você instalou
    ├── cpf\
    ├── gerador-json\
    └── _template\         ← modelo para criar o seu
```

Você **não precisa** mexer nesses arquivos no dia a dia — o app tem uma interface para tudo. Mas se algo der errado, é aqui que vale a pena olhar.

## Como o app decide o que fazer quando você escolhe um comando

Quando você digita `git` e dá Enter, acontecem cinco coisas em sequência:

1. O app filtra a lista de comandos pelo que você digitou
2. Você confirma qual quer (geralmente aparece um só)
3. O app olha o **tipo** do comando: é link, aplicativo ou plugin?
4. O motor de execução abre da forma correta (navegador, executa o `.exe` ou roda o script)
5. O comando é registrado no histórico para você ver depois

Você não vê nada disso acontecer — leva milissegundos.

## O atalho global

O `Ctrl+Space` é o atalho principal. Aperte uma vez para abrir, outra vez para fechar. O app também **se esconde sozinho** quando você clica fora dele — isso é proposital, é o jeito mais rápido de usar.

> **Dica:** se o `Ctrl+Space` atrapalha em algum outro programa, dá para trocar o atalho. Veja a página de [Configurações](#) para saber como.

## Os três tipos de comando

### Link
É um endereço da internet (ex.: `https://github.com`). Quando você escolhe, o Toolbox abre no seu navegador padrão.

### Aplicativo
É um `.exe` instalado no seu computador (ex.: `C:\Program Files\Notepad++\notepad++.exe`). Quando você escolhe, o Toolbox executa.

### Plugin
É um script (Python, Node, Rust ou outro `.exe`) que mora na pasta `plugins\`. Quando você escolhe, o Toolbox roda esse script. Os plugins podem abrir janelas, gerar arquivos, validar dados — você decide.

## Como os plugins são descobertos

Você não precisa "instalar" um plugin no sentido tradicional. Basta:

1. Colocar uma pasta dentro de `plugins\` (veja o [Guia de Plugins](/docs/plugins))
2. Reiniciar o Toolbox (ou ele descobre sozinho na próxima execução)
3. Cadastrar o plugin como um comando (veja [Como cadastrar comandos](#))

O Toolbox varre a pasta `plugins\` quando abre, lê o `plugin.json` de cada subpasta e adiciona à lista de comandos.

## Tema claro e escuro

Aperte o botão de tema no canto superior direito para alternar. Sua escolha fica salva — o Toolbox vai lembrar na próxima vez que você abrir.

## Próximos passos

- [Como cadastrar comandos](/docs/commands) — adicionar links, apps e plugins
- [Guia de Plugins](/docs/plugins) — criar seus próprios plugins
- [Roadmap](/docs/roadmap) — o que vem por aí
