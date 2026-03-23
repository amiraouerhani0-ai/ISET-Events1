#!/bin/bash

# Script de test pour vérifier la connexion au backend Spring Boot

echo "🔍 Test de connexion au backend Spring Boot..."
echo "=================================="

# Configuration
BACKEND_URL="http://localhost:8080/api"

echo "📍 URL du backend: $BACKEND_URL"
echo ""

# Test 1: Vérifier si le backend est accessible
echo "1️⃣ Test de connexion au backend..."
if curl -s -o /dev/null -w "%{http_code}" "$BACKEND_URL/auth/test" | grep -q "200"; then
    echo "✅ Backend accessible!"
    echo ""
    
    # Test 2: Tester l'endpoint de test
    echo "2️⃣ Test de l'endpoint /auth/test..."
    response=$(curl -s "$BACKEND_URL/auth/test")
    echo "Réponse: $response"
    echo ""
    
    # Test 3: Tester l'inscription
    echo "3️⃣ Test d'inscription..."
    timestamp=$(date +%s)
    register_response=$(curl -s -X POST "$BACKEND_URL/auth/register" \
        -H "Content-Type: application/json" \
        -d "{
            \"firstname\": \"Test\",
            \"lastname\": \"User\",
            \"email\": \"test$timestamp@example.com\",
            \"password\": \"password123\",
            \"confirmPassword\": \"password123\",
            \"phone\": \"12345678\",
            \"role\": \"PARTICIPANT\"
        }")
    
    if echo "$register_response" | grep -q "id"; then
        echo "✅ Inscription réussie!"
        echo "Réponse: $register_response"
        
        # Extraire l'email pour le test de login
        test_email="test$timestamp@example.com"
        
        echo ""
        # Test 4: Tester le login
        echo "4️⃣ Test de login..."
        login_response=$(curl -s -X POST "$BACKEND_URL/auth/login" \
            -H "Content-Type: application/json" \
            -d "{
                \"email\": \"$test_email\",
                \"password\": \"password123\"
            }")
        
        if echo "$login_response" | grep -q "token"; then
            echo "✅ Login réussi!"
            echo "Réponse: $login_response"
            
            # Extraire le token
            token=$(echo "$login_response" | grep -o '"token":"[^"]*"' | cut -d'"' -f4)
            
            echo ""
            # Test 5: Tester une route protégée
            echo "5️⃣ Test d'une route protégée..."
            dashboard_response=$(curl -s -X GET "$BACKEND_URL/events/dashboard" \
                -H "Authorization: Bearer $token")
            
            if echo "$dashboard_response" | grep -q "message"; then
                echo "✅ Route protégée accessible!"
                echo "Réponse: $dashboard_response"
            else
                echo "❌ Erreur route protégée: $dashboard_response"
            fi
        else
            echo "❌ Login échoué: $login_response"
        fi
    else
        echo "❌ Inscription échouée: $register_response"
    fi
else
    echo "❌ Backend non accessible!"
    echo ""
    echo "🔧 Solutions possibles:"
    echo "1. Vérifiez que votre backend Spring Boot est démarré"
    echo "2. Vérifiez que le port 8080 est libre"
    echo "3. Vérifiez la configuration CORS dans votre backend"
    echo ""
    echo "📋 Commandes pour vérifier:"
    echo "   - Windows: netstat -an | findstr 8080"
    echo "   - Linux/macOS: netstat -tlnp | grep 8080"
    echo "   - Démarrer le backend: mvn spring-boot:run"
fi

echo ""
echo "=================================="
echo "🏁 Test terminé!"
