/**
 * Script de automação e preparação do Python Embedded para o instalador do Toolbox.
 * 
 * Etapas:
 * 1. Baixa a distribuição oficial python-3.12.9-embed-amd64.zip do python.org.
 * 2. Extrai os binários para src-tauri/resources/runtime/python.
 * 3. Habilita import site e site-packages no arquivo python312._pth.
 * 4. Instala as dependências essenciais (pywebview, boto3, requests) em Lib/site-packages.
 * 5. Valida a execução autônoma do interpretador.
 */

import fs from 'node:fs';
import path from 'node:path';
import https from 'node:https';
import { fileURLToPath } from 'node:url';
import { execSync } from 'node:child_process';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const PYTHON_VERSION = '3.12.9';
const PYTHON_EMBED_URL = `https://www.python.org/ftp/python/${PYTHON_VERSION}/python-${PYTHON_VERSION}-embed-amd64.zip`;
const PACKAGES = ['pywebview', 'boto3', 'requests'];

const RUNTIME_DIR = path.resolve(__dirname, '..', 'src-tauri', 'resources', 'runtime');
const TARGET_DIR = path.join(RUNTIME_DIR, 'python');
const ZIP_PATH = path.join(RUNTIME_DIR, `python-${PYTHON_VERSION}-embed.zip`);
const SITE_PACKAGES_DIR = path.join(TARGET_DIR, 'Lib', 'site-packages');

function log(msg) {
  console.log(`[RUNTIME-BUILD] ${msg}`);
}

function downloadFile(url, dest) {
  return new Promise((resolve, reject) => {
    log(`Baixando Python Embedded de: ${url}`);
    const file = fs.createWriteStream(dest);
    
    const request = (targetUrl) => {
      https.get(targetUrl, (response) => {
        if (response.statusCode >= 300 && response.statusCode < 400 && response.headers.location) {
          log(`Redirecionando para: ${response.headers.location}`);
          return request(response.headers.location);
        }

        if (response.statusCode !== 200) {
          return reject(new Error(`Falha no download. HTTP Status: ${response.statusCode}`));
        }

        response.pipe(file);
        file.on('finish', () => {
          file.close(() => {
            log(`Download concluído: ${(fs.statSync(dest).size / (1024 * 1024)).toFixed(2)} MB`);
            resolve();
          });
        });
      }).on('error', (err) => {
        fs.unlink(dest, () => {});
        reject(err);
      });
    };

    request(url);
  });
}

function extractZip(zipPath, targetDir) {
  log(`Extraindo ${path.basename(zipPath)} para ${targetDir}...`);
  if (!fs.existsSync(targetDir)) {
    fs.mkdirSync(targetDir, { recursive: true });
  }

  // Utiliza PowerShell Expand-Archive ou tar no Windows
  try {
    execSync(`powershell -NoProfile -Command "Expand-Archive -Path '${zipPath}' -DestinationPath '${targetDir}' -Force"`, {
      stdio: 'inherit',
    });
    log('Extração concluída com sucesso.');
  } catch (e) {
    log(`Tentando extração via tar: ${e.message}`);
    execSync(`tar -xf "${zipPath}" -C "${targetDir}"`, { stdio: 'inherit' });
  }
}

function configurePthFile(targetDir) {
  log('Configurando arquivo ._pth para suportar módulos e site-packages...');
  const files = fs.readdirSync(targetDir);
  const pthFile = files.find(f => f.endsWith('._pth'));

  if (!pthFile) {
    throw new Error('Arquivo ._pth não encontrado no diretório do Python Embedded!');
  }

  const pthPath = path.join(targetDir, pthFile);
  let content = fs.readFileSync(pthPath, 'utf8');

  // Descomenta 'import site'
  content = content.replace(/^#\s*import site/m, 'import site');
  if (!content.includes('import site')) {
    content += '\nimport site\n';
  }

  // Garante Lib/site-packages e . no path
  const requiredPaths = ['.', 'Lib', 'Lib/site-packages'];
  for (const p of requiredPaths) {
    const regex = new RegExp(`^${p.replace('/', '[\\\\/]')}$`, 'm');
    if (!regex.test(content)) {
      content += `\n${p}\n`;
    }
  }

  fs.writeFileSync(pthPath, content.trim() + '\n', 'utf8');
  log(`Arquivo ${pthFile} configurado com sucesso.`);
}

function installPackages(targetSitePackages) {
  log(`Instalando dependências essenciais: ${PACKAGES.join(', ')}...`);
  if (!fs.existsSync(targetSitePackages)) {
    fs.mkdirSync(targetSitePackages, { recursive: true });
  }

  // Tenta instalar usando o pip do sistema apontando para o diretório target
  const pipCommands = [
    `python -m pip install --target "${targetSitePackages}" --no-user ${PACKAGES.join(' ')}`,
    `py -3 -m pip install --target "${targetSitePackages}" --no-user ${PACKAGES.join(' ')}`,
    `pip install --target "${targetSitePackages}" --no-user ${PACKAGES.join(' ')}`,
  ];

  let installed = false;
  for (const cmd of pipCommands) {
    try {
      log(`Executando: ${cmd}`);
      execSync(cmd, { stdio: 'inherit' });
      installed = true;
      break;
    } catch (e) {
      log(`Comando falhou, tentando alternativa... (${e.message})`);
    }
  }

  if (!installed) {
    throw new Error('Não foi possível instalar os pacotes essenciais via pip.');
  }

  log('Bibliotecas essenciais instaladas com sucesso no site-packages embutido.');
}

function validateEmbeddedPython(targetDir) {
  log('Validando execução do interpretador Python embutido e importação dos módulos...');
  const pythonExe = path.join(targetDir, 'python.exe');

  if (!fs.existsSync(pythonExe)) {
    throw new Error(`Executável python.exe não encontrado em ${pythonExe}`);
  }

  const testScript = "import sys, webview, boto3, requests; print(f'[OK] Embedded Python {sys.version} pronto com pywebview, boto3 e requests!')";
  const out = execSync(`"${pythonExe}" -c "${testScript}"`, {
    encoding: 'utf8',
    env: {
      ...process.env,
      PYTHONHOME: targetDir,
      PYTHONPATH: SITE_PACKAGES_DIR,
      PYTHONIOENCODING: 'utf-8',
    }
  });

  log(out.trim());
}

async function main() {
  log(`=== Iniciando montagem do Python Embedded v${PYTHON_VERSION} ===`);
  const pythonExe = path.join(TARGET_DIR, 'python.exe');
  const pywebviewDir = path.join(SITE_PACKAGES_DIR, 'webview');

  const needsDownload = !fs.existsSync(pythonExe);
  const needsPackages = !fs.existsSync(pywebviewDir);

  if (needsDownload) {
    if (!fs.existsSync(ZIP_PATH)) {
      await downloadFile(PYTHON_EMBED_URL, ZIP_PATH);
    }
    extractZip(ZIP_PATH, TARGET_DIR);
    if (fs.existsSync(ZIP_PATH)) {
      fs.unlinkSync(ZIP_PATH);
    }
  } else {
    log(`✔ Python Embedded já extraído em: ${TARGET_DIR}`);
  }

  configurePthFile(TARGET_DIR);

  if (needsPackages) {
    installPackages(SITE_PACKAGES_DIR);
  } else {
    log(`✔ Dependências (${PACKAGES.join(', ')}) já instaladas em ${SITE_PACKAGES_DIR}`);
  }

  validateEmbeddedPython(TARGET_DIR);
  log('🎉 Setup do Runtime Embutido finalizado com sucesso!');
}

main().catch((err) => {
  console.error(`❌ [RUNTIME-BUILD ERRO] ${err.message}`);
  process.exit(1);
});
