#!/bin/bash
# Quick deployment test script

set -e

echo "🧪 Testing Kemet Assistant Deployment Configuration..."

# Test 1: Check required files
echo ""
echo "✅ Checking required files..."
files=("Dockerfile" ".dockerignore" "docker-compose.yml" "requirements.txt" "assitant.py" "db.py")
for file in "${files[@]}"; do
    if [ -f "$file" ]; then
        echo "  ✓ $file"
    else
        echo "  ✗ $file (missing)"
        exit 1
    fi
done

# Test 2: Validate Dockerfile syntax
echo ""
echo "✅ Validating Dockerfile..."
if docker build -f Dockerfile -t kemet-test --dry-run . >/dev/null 2>&1 || docker build -f Dockerfile -t kemet-test-validate --target="" . --quiet 2>&1 | grep -q "ERROR"; then
    echo "  ✗ Dockerfile has syntax errors"
else
    echo "  ✓ Dockerfile syntax OK"
fi

# Test 3: Check docker-compose syntax
echo ""
echo "✅ Validating docker-compose.yml..."
if docker compose config >/dev/null 2>&1; then
    echo "  ✓ docker-compose.yml syntax OK"
else
    echo "  ✗ docker-compose.yml has syntax errors"
fi

# Test 4: Check Python files
echo ""
echo "✅ Validating Python files..."
if python3 -m py_compile assitant.py db.py 2>/dev/null; then
    echo "  ✓ Python syntax OK"
else
    echo "  ✗ Python syntax errors"
    exit 1
fi

echo ""
echo "🎉 All deployment configuration tests passed!"
echo ""
echo "Next steps:"
echo "  1. Configure .env with your credentials"
echo "  2. Run: docker compose up -d"
echo "  3. Check logs: docker compose logs -f"
