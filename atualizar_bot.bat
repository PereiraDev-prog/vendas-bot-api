@echo off
cls
echo ==========================================
echo    ATUALIZADOR AUTOMATICO - NOT STORE
echo ==========================================
echo.
echo 1. Salvando alteracoes locais...
"C:\Program Files\Git\cmd\git.exe" add .

echo 2. Criando pacote de atualizacao...
"C:\Program Files\Git\cmd\git.exe" commit -m "Atualizacao automatica via Script"

echo 3. Enviando para o GitHub/Render...
echo (Se for a primeira vez, uma janela de login pode aparecer)
"C:\Program Files\Git\cmd\git.exe" push -u origin principal

echo.
echo ==========================================
echo   PRONTO! O RENDER VAI ATUALIZAR EM BREVE.
echo ==========================================
pause
