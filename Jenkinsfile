// PRACTICA 3 - Pipeline FRONTEND: microservicio Ejercicio5Cliente (interfaz web Thymeleaf/JS, puerto 9080)
// Repositorio: https://github.com/Zayda1995fer/Ejercicio5Cliente   Script Path: Jenkinsfile
// Requisitos en Jenkins (Administrar Jenkins > Tools):
//   - JDK   con nombre "jdk21"  -> apuntando a un JDK 21
//   - Maven con nombre "maven3" -> version 3.9.x
//   - Node.js 18 o superior en el PATH del agente (pruebas JavaScript con Jest)
//   - (Analisis Sonar)  credencial "Secret text" con ID "sonar-token" y SonarQube en SONAR_HOST_URL
//   - (Escaneo Trivy)   Docker Desktop encendido en el agente
// Las pruebas simulan el API (MockRestServiceServer y $.ajax de Jest): NO se necesita el backend encendido.
def run(String cmd) {
    if (isUnix()) { sh cmd } else { bat cmd }
}

// Trivy en Docker sobre la carpeta del proyecto; excluye target/ (compilacion) y node_modules/ y coverage/ (generados).
// src/ con HTML/JS, pom.xml y pruebas-js/package-lock.json SI se escanean
def trivy(String opciones) {
    String ws = isUnix() ? '$WORKSPACE' : '%WORKSPACE%'
    // Se monta el repositorio local de Maven para que Trivy resuelva tambien las dependencias transitivas (Tomcat, Jackson...)
    String m2 = isUnix() ? '$HOME/.m2' : '%USERPROFILE%\\.m2'
    run "docker run --rm -v \"${ws}\":/src -v \"${m2}\":/root/.m2 -v trivy-cache:/root/.cache aquasec/trivy:0.58.1 fs --no-progress --include-dev-deps --skip-dirs target --skip-dirs pruebas-js/node_modules --skip-dirs pruebas-js/coverage ${opciones} /src"
}

pipeline {
    agent any

    tools {
        jdk 'jdk21'
        maven 'maven3'
    }

    parameters {
        booleanParam(name: 'PRUEBAS_JS', defaultValue: true, description: 'Ejecutar las pruebas JavaScript (Jest) de login.js e inicio.js')
        booleanParam(name: 'ANALISIS_SONAR', defaultValue: true, description: 'Ejecutar analisis de calidad con SonarQube')
        string(name: 'SONAR_HOST_URL', defaultValue: 'http://localhost:9000', description: 'URL de SonarQube')
        booleanParam(name: 'ESCANEO_TRIVY', defaultValue: true, description: 'Escanear vulnerabilidades con Trivy (Docker)')
    }

    stages {
        stage('Verificar versiones') {
            steps {
                run 'java -version'
                run 'mvn -v'
            }
        }

        stage('Compilar') {
            steps {
                run 'mvn -B clean compile'
            }
        }

        stage('Pruebas Java y cobertura') {
            steps {
                // verify = Surefire (pruebas) + JaCoCo report + JaCoCo check (100% lineas y ramas)
                run 'mvn -B verify'
            }
            post {
                always {
                    junit allowEmptyResults: true, testResults: 'target/surefire-reports/*.xml'
                    archiveArtifacts artifacts: 'target/site/jacoco/**', allowEmptyArchive: true
                }
            }
        }

        stage('Pruebas JavaScript y cobertura') {
            when { expression { params.PRUEBAS_JS } }
            steps {
                dir('pruebas-js') {
                    run 'node -v'
                    run 'npm ci'
                    // coverageThreshold en package.json: falla si login.js o inicio.js bajan del 100%
                    run 'npm run test:cobertura'
                }
            }
            post {
                always {
                    archiveArtifacts artifacts: 'pruebas-js/coverage/**', allowEmptyArchive: true
                }
            }
        }

        stage('Analisis de codigo (SonarQube)') {
            when { expression { params.ANALISIS_SONAR } }
            steps {
                withCredentials([string(credentialsId: 'sonar-token', variable: 'SONAR_TOKEN')]) {
                    // sonar.exclusions: no se analiza target/, librerias de terceros (bootstrap/jquery/popper) ni lo generado por npm; el codigo propio si se analiza
                    run "mvn -B sonar:sonar -Dsonar.host.url=${params.SONAR_HOST_URL} -Dsonar.projectKey=Ejercicio5Cliente -Dsonar.exclusions=**/target/**,**/static/js/bootstrap*,**/static/js/jquery*,**/static/js/popper*,**/static/css/bootstrap*,pruebas-js/node_modules/**,pruebas-js/coverage/** -Dsonar.coverage.jacoco.xmlReportPaths=target/site/jacoco/jacoco.xml -Dsonar.javascript.lcov.reportPaths=pruebas-js/coverage/lcov.info -Dsonar.qualitygate.wait=true"
                }
            }
        }

        stage('Escaneo de vulnerabilidades (Trivy)') {
            when { expression { params.ESCANEO_TRIVY } }
            steps {
                trivy '--scanners vuln,secret,misconfig --format table --output /src/trivy-frontend.txt'
                // Falla el pipeline solo si hay vulnerabilidades CRITICAS sin atender
                trivy '--scanners vuln --severity CRITICAL --exit-code 1'
            }
            post {
                always {
                    archiveArtifacts artifacts: 'trivy-frontend.txt', allowEmptyArchive: true
                }
            }
        }

        stage('Empaquetar') {
            steps {
                run 'mvn -B package -DskipTests -Djacoco.skip=true'
            }
        }
    }

    post {
        success {
            archiveArtifacts artifacts: 'target/*.jar', fingerprint: true
        }
    }
}
