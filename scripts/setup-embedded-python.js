/**
 * Script de preparação do Embedded Python para o bundle do Toolbox.
 * Verifica e estrutura o diretório src-tauri/resources/runtime/python.
 */
const fs = require('fs');
const path = require('path');

const targetDir = path.resolve(__dirname, '..', 'src-tauri', 'resources', 'runtime', 'python');

function checkRuntime() {
  if (!fs.existsSync(targetDir)) {
    fs.mkdirSync(targetDir, { recursive: true });
  }

  const exePath = path.join(targetDir, 'python.exe');
  if (fs.existsSync(exePath)) {
    console.log(`✔ [RUNTIME EMBEDDED] Python encontrado em: ${exePath}`);
  } else {
    console.log(`ℹ [RUNTIME EMBEDDED] Diretório de runtime pronto em: ${targetDir}`);
    console.log(`ℹ [RUNTIME EMBEDDED] No ambiente local, o Toolbox utilizará o Python do sistema como fallback.`);
  }
}

checkRuntime();
