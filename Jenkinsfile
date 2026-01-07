pipeline {
    agent any

    parameters {
        booleanParam(name: 'BUILD_FRONTEND', defaultValue: true, description: 'Build Next.js Frontend')
        booleanParam(name: 'BUILD_BACKEND', defaultValue: true, description: 'Build Django Backend')
    }

    environment {
        // --- FRONTEND CONFIG ---
        FE_DIR = "frontend"
        FE_IMAGE = "dn7x7-frontend"
        FE_CONTAINER = "dn7x7-frontend-prod"
        FE_PORT = "3100" // Exposed Host Port

        // --- BACKEND CONFIG ---
        BE_DIR = "backend"
        BE_IMAGE = "dn7x7-backend"
        BE_CONTAINER = "dn7x7-backend-prod"
        BE_PORT = "8100" // Exposed Host Port
        
        // Host path for persistent media storage
        HOST_MEDIA_PATH = "/var/www/dn7x7/media" 
    }

    stages {
        stage('Checkout') {
            steps {
                checkout scm
            }
        }

        stage('Deploy Frontend') {
            when { expression { return params.BUILD_FRONTEND } }
            steps {
                dir("${FE_DIR}") {
                    // Inject Frontend Environment Variables (Build Time)
                    withCredentials([file(credentialsId: 'dn7x7-frontend-env', variable: 'FE_ENV_FILE')]) {
                        script {
                            echo "--- Setting up Frontend Environment ---"
                            // Next.js needs env vars at BUILD time
                            sh "cp \$FE_ENV_FILE .env.production"

                            echo "--- Building Frontend Image ---"
                            sh "docker build -t ${FE_IMAGE} ."

                            echo "--- Deploying Frontend Container ---"
                            sh "docker stop ${FE_CONTAINER} || true"
                            sh "docker rm ${FE_CONTAINER} || true"

                            // Run on Port 3100
                            sh """
                                docker run -d --restart always \\
                                --name ${FE_CONTAINER} \\
                                -p ${FE_PORT}:3100 \\
                                ${FE_IMAGE}
                            """
                        }
                    }
                }
            }
        }

        stage('Deploy Backend') {
            when { expression { return params.BUILD_BACKEND } }
            steps {
                dir("${BE_DIR}") {
                    // Inject Backend Environment Variables (Runtime)
                    withCredentials([file(credentialsId: 'dn7x7-backend-env', variable: 'BE_ENV_FILE')]) {
                        script {
                            echo "--- Preparing Host Directories ---"
                            // Ensure media directory exists on host
                            sh "sudo mkdir -p ${HOST_MEDIA_PATH}"
                            // Adjust permissions so container can write (UID 1000 is standard non-root)
                            // You might need to adjust this depending on your container user
                            sh "sudo chown -R 1000:1000 ${HOST_MEDIA_PATH} || true"
                            
                            echo "--- Preparing Backend Environment ---"
                            sh "cp \$BE_ENV_FILE .env"

                            echo "--- Building Backend Image ---"
                            sh "docker build -t ${BE_IMAGE} ."

                            echo "--- Deploying Backend Container ---"
                            sh "docker stop ${BE_CONTAINER} || true"
                            sh "docker rm ${BE_CONTAINER} || true"

                            // Run on Port 8100
                            // Mount Volume: Host Path -> Container Path
                            sh """
                                docker run -d --restart always \\
                                --name ${BE_CONTAINER} \\
                                --env-file .env \\
                                -p ${BE_PORT}:8100 \\
                                -v ${HOST_MEDIA_PATH}:/app/media \\
                                -e DB_HOST=host.docker.internal \\
                                ${BE_IMAGE}
                            """
                            
                            // Cleanup sensitive file
                            sh "rm .env"

                            // Run migrations & collectstatic
                            sh "docker exec ${BE_CONTAINER} python manage.py migrate"
                            sh "docker exec ${BE_CONTAINER} python manage.py collectstatic --noinput"
                        }
                    }
                }
            }
        }
    }
    
    post {
        always {
            cleanWs()
        }
    }
}