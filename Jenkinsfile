pipeline {
    environment {
        registry = "linea/dri"
        registryCredential = 'Dockerhub'
        dockerImage = ''
    }
    agent any

    stages {
        stage('Build Images') {
            when {
                expression {
                   env.BRANCH_NAME.toString().equals('master')
                }
            }
            steps {
              parallel(
              frontend: {
                  dir('frontend') {
                      script {
                          dockerImage = docker.build registry + ":FRONT$GIT_COMMIT"
                          docker.withRegistry( '', registryCredential ) {
                          dockerImage.push()
                      }
                        sh "docker rmi $registry:FRONT$GIT_COMMIT --force"
                      }
                  }
              },
              backend: {
                  dir('api') {
                      script {
                          dockerImage = docker.build registry + ":BACK$GIT_COMMIT"
                          docker.withRegistry( '', registryCredential ) {
                          dockerImage.push()
                      }
                        sh "docker rmi $registry:BACK$GIT_COMMIT --force"
                      }
                  }
              }
          )
        }
      }
    }
}