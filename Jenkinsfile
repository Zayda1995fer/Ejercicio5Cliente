// Pipeline del microservicio Ejercicio5Cliente (interfaz web, puerto 9080)
// Repositorio: https://github.com/Zayda1995fer/Ejercicio5Cliente
// Requisitos en Jenkins (Administrar Jenkins > Tools):
//   - JDK   con nombre "jdk21"  -> apuntando a un JDK 21
//   - Maven con nombre "maven3" -> version 3.9.x
// En el job: Pipeline script from SCM, Script Path = Jenkinsfile
pipeline {
    agent any

    tools {
        jdk 'jdk21'
        maven 'maven3'
    }

    stages {
        stage('Verificar versiones') {
            steps {
                script {
                    if (isUnix()) {
                        sh 'java -version'
                        sh 'mvn -v'
                    } else {
                        bat 'java -version'
                        bat 'mvn -v'
                    }
                }
            }
        }

        stage('Compilar, probar y empaquetar') {
            steps {
                script {
                    if (isUnix()) {
                        sh 'mvn -B clean package -Dmaven.test.failure.ignore=true'
                    } else {
                        bat 'mvn -B clean package -Dmaven.test.failure.ignore=true'
                    }
                }
            }
        }
    }

    post {
        always {
            junit allowEmptyResults: true, testResults: 'target/surefire-reports/*.xml'
        }
        success {
            archiveArtifacts artifacts: 'target/*.jar', fingerprint: true
        }
    }
}
