@echo off
REM Script de test pour vérifier la connexion au backend Spring Boot (Windows)

echo 🔍 Test de connexion au backend Spring Boot...
echo ==================================

REM Configuration
set BACKEND_URL=http://localhost:8080/api

echo 📍 URL du backend: %BACKEND_URL%
echo.

REM Test 1: Vérifier si le backend est accessible
echo 1️⃣ Test de connexion au backend...
curl -s -o nul -w "%%{http_code}" "%BACKEND_URL%/auth/test" | findstr "200" >nul
if %errorlevel% equ 0 (
    echo ✅ Backend accessible!
    echo.
    
    REM Test 2: Tester l'endpoint de test
    echo 2️⃣ Test de l'endpoint /auth/test...
    curl -s "%BACKEND_URL%/auth/test"
    echo.
    echo.
    
    REM Test 3: Tester l'inscription
    echo 3️⃣ Test d'inscription...
    set TIMESTAMP=%date:~6,4%%date:~3,2%%date:~0,2%%time:~0,2%%time:~3,2%%time:~6,2%
    set TIMESTAMP=%TIMESTAMP: =0%
    
    curl -s -X POST "%BACKEND_URL%/auth/register" ^
        -H "Content-Type: application/json" ^
        -d "{\"firstname\":\"Test\",\"lastname\":\"User\",\"email\":\"test%TIMESTAMP%@example.com\",\"password\":\"password123\",\"confirmPassword\":\"password123\",\"phone\":\"12345678\",\"role\":\"PARTICIPANT\"}" > register_response.txt
    
    findstr "id" register_response.txt >nul
    if %errorlevel% equ 0 (
        echo ✅ Inscription réussie!
        echo Réponse:
        type register_response.txt
        echo.
        
        set TEST_EMAIL=test%TIMESTAMP%@example.com
        
        REM Test 4: Tester le login
        echo 4️⃣ Test de login...
        curl -s -X POST "%BACKEND_URL%/auth/login" ^
            -H "Content-Type: application/json" ^
            -d "{\"email\":\"%TEST_EMAIL%\",\"password\":\"password123\"}" > login_response.txt
        
        findstr "token" login_response.txt >nul
        if %errorlevel% equ 0 (
            echo ✅ Login réussi!
            echo Réponse:
            type login_response.txt
            echo.
            
            REM Extraire le token (simplifié)
            for /f "tokens=2 delims=:\"" %%a in ('findstr "token" login_response.txt') do set TOKEN=%%a
            
            REM Test 5: Tester une route protégée
            echo 5️⃣ Test d'une route protégée...
            curl -s -X GET "%BACKEND_URL%/events/dashboard" ^
                -H "Authorization: Bearer %TOKEN%" > dashboard_response.txt
            
            findstr "message" dashboard_response.txt >nul
            if %errorlevel% equ 0 (
                echo ✅ Route protégée accessible!
                echo Réponse:
                type dashboard_response.txt
            ) else (
                echo ❌ Erreur route protégée:
                type dashboard_response.txt
            )
        ) else (
            echo ❌ Login échoué:
            type login_response.txt
        )
    ) else (
        echo ❌ Inscription échouée:
        type register_response.txt
    )
    
    REM Nettoyer
    del register_response.txt login_response.txt dashboard_response.txt 2>nul
) else (
    echo ❌ Backend non accessible!
    echo.
    echo 🔧 Solutions possibles:
    echo 1. Vérifiez que votre backend Spring Boot est démarré
    echo 2. Vérifiez que le port 8080 est libre
    echo 3. Vérifiez la configuration CORS dans votre backend
    echo.
    echo 📋 Commandes pour vérifier:
    echo    - netstat -an | findstr 8080
    echo    - Démarrer le backend: mvn spring-boot:run
)

echo.
echo ==================================
echo 🏁 Test terminé!
pause
