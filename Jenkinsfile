// ============================================================
// AlertCart – Jenkinsfile (Declarative Pipeline)
// ============================================================

pipeline {

    agent any

    environment {
        APP_NAME     = 'alertcart'
        IMAGE_NAME   = "alertcart/app"
        IMAGE_TAG    = "${BUILD_NUMBER}"
        REGISTRY     = "docker.io"                       // Change to your registry
        DOCKER_CREDS = credentials('docker-hub-creds')  // Jenkins credentials ID
        MONGO_URI    = credentials('alertcart-mongo-uri')
        EMAIL_USER   = credentials('alertcart-email-user')
        EMAIL_PASS   = credentials('alertcart-email-pass')
    }

    options {
        buildDiscarder(logRotator(numToKeepStr: '10'))
        timeout(time: 30, unit: 'MINUTES')
        timestamps()
    }

    stages {

        // ── Stage 1: Checkout ──────────────────────────────
        stage('Checkout') {
            steps {
                echo "📥 Cloning repository..."
                checkout scm
                sh 'echo "Branch: $(git branch --show-current)"'
                sh 'echo "Commit: $(git rev-parse --short HEAD)"'
            }
        }

        // ── Stage 2: Install Dependencies ─────────────────
        stage('Install Dependencies') {
            steps {
                echo "📦 Installing Node.js dependencies..."
                sh '''
                    node --version
                    npm --version
                    npm ci --omit=dev
                '''
            }
        }

        // ── Stage 3: Run Tests ─────────────────────────────
        stage('Run Tests') {
            steps {
                echo "🧪 Running tests..."
                sh 'npm test'
            }
            post {
                failure {
                    echo "❌ Tests failed! Stopping pipeline."
                }
            }
        }

        // ── Stage 4: Code Quality (Optional) ──────────────
        stage('Code Quality Check') {
            when {
                branch 'main'
            }
            steps {
                echo "🔍 Checking code quality..."
                sh '''
                    # Install ESLint if not present
                    npm install eslint --save-dev 2>/dev/null || true
                    npx eslint . --ext .js --ignore-pattern node_modules/ || true
                '''
            }
        }

        // ── Stage 5: Build Docker Image ────────────────────
        stage('Build Docker Image') {
            steps {
                echo "🐳 Building Docker image: ${IMAGE_NAME}:${IMAGE_TAG}"
                sh '''
                    docker build \
                        --tag ${IMAGE_NAME}:${IMAGE_TAG} \
                        --tag ${IMAGE_NAME}:latest \
                        --label "build.number=${BUILD_NUMBER}" \
                        --label "git.commit=$(git rev-parse --short HEAD)" \
                        --label "build.date=$(date -u +%Y-%m-%dT%H:%M:%SZ)" \
                        .
                '''
            }
        }

        // ── Stage 6: Security Scan ─────────────────────────
        stage('Security Scan') {
            steps {
                echo "🔒 Running security scan..."
                sh '''
                    # Audit npm dependencies for vulnerabilities
                    npm audit --audit-level=high || true
                    echo "Security scan complete."
                '''
            }
        }

        // ── Stage 7: Push to Registry ──────────────────────
        stage('Push Image') {
            when {
                anyOf {
                    branch 'main'
                    branch 'master'
                }
            }
            steps {
                echo "📤 Pushing image to registry..."
                sh '''
                    echo ${DOCKER_CREDS_PSW} | docker login -u ${DOCKER_CREDS_USR} --password-stdin
                    docker push ${IMAGE_NAME}:${IMAGE_TAG}
                    docker push ${IMAGE_NAME}:latest
                    echo "✅ Image pushed: ${IMAGE_NAME}:${IMAGE_TAG}"
                '''
            }
        }

        // ── Stage 8: Deploy with Docker Compose ───────────
        stage('Deploy') {
            when {
                anyOf {
                    branch 'main'
                    branch 'master'
                }
            }
            steps {
                echo "🚀 Deploying AlertCart..."
                sh '''
                    # Create .env file from Jenkins credentials
                    cat > .env << EOF
MONGO_URI=${MONGO_URI}
EMAIL_USER=${EMAIL_USER}
EMAIL_PASS=${EMAIL_PASS}
EMAIL_FROM=AlertCart <${EMAIL_USER}>
CRON_SCHEDULE=0 */6 * * *
PORT=3000
EOF

                    # Pull latest images and restart
                    docker-compose pull mongo
                    docker-compose up -d --build --remove-orphans

                    # Wait for app to be healthy
                    echo "⏳ Waiting for application to start..."
                    sleep 15

                    # Health check
                    curl -f http://localhost:3000/health || (echo "❌ Health check failed!" && exit 1)
                    echo "✅ AlertCart deployed and healthy!"
                '''
            }
        }

        // ── Stage 9: Smoke Test ────────────────────────────
        stage('Smoke Test') {
            when {
                anyOf {
                    branch 'main'
                    branch 'master'
                }
            }
            steps {
                echo "💨 Running smoke tests against deployed app..."
                sh '''
                    # Test health endpoint
                    curl -sf http://localhost:3000/health | grep -q "OK"
                    echo "✅ Health endpoint: OK"

                    # Test products API
                    STATUS=$(curl -o /dev/null -s -w "%{http_code}" http://localhost:3000/api/products)
                    [ "$STATUS" = "200" ] && echo "✅ Products API: OK" || (echo "❌ Products API failed with $STATUS" && exit 1)

                    echo "🎉 Smoke tests passed!"
                '''
            }
        }

    } // end stages

    post {

        success {
            echo """
            ╔══════════════════════════════════════╗
            ║   ✅ ALERTCART PIPELINE SUCCESS       ║
            ║   Build: #${BUILD_NUMBER}             ║
            ║   Image: ${IMAGE_NAME}:${IMAGE_TAG}   ║
            ╚══════════════════════════════════════╝
            """
        }

        failure {
            echo """
            ╔══════════════════════════════════════╗
            ║   ❌ ALERTCART PIPELINE FAILED        ║
            ║   Build: #${BUILD_NUMBER}             ║
            ║   Check logs for details.             ║
            ╚══════════════════════════════════════╝
            """
        }

        always {
            echo "🧹 Cleaning up workspace..."
            sh '''
                # Remove dangling images
                docker image prune -f || true
                # Remove .env file for security
                rm -f .env
            '''
            cleanWs()
        }

    }

} // end pipeline
