pipeline {
    environment {
        registry = "linea/dri"
        registryCredential = 'Dockerhub'
        dockerImageBack = ''
        dockerImageFront = ''
    }
    agent any

    stages {
        stage('Build And Test Images') {
            steps {
              parallel(
              frontend: {
                  dir('frontend') {
                      sh "cp nginx-deploy.conf nginx-proxy.conf"
                      script {
                          dockerImageFront = docker.build registry + ":FRONT$GIT_COMMIT"
                      }
                  }
              },
              backend: {
                  dir('api') {
                      sh "cp dri/settings/jenkins.py dri/settings/local_vars.py"
                      script {
                          dockerImageBack = docker.build registry + ":BACK$GIT_COMMIT"
                          sh "coverage run --source=. --omit='*migrations' manage.py test --verbosity=2"
                      }
                  }
              }
          )
        }
      }
      stage('Push Images') {
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
                          docker.withRegistry( '', registryCredential ) {dockerImageFront.push()}
                      }
                  }
              },
              backend: {
                  dir('api') {
                      script {
                          docker.withRegistry( '', registryCredential ) {dockerImageBack.push()}
                      }
                  }
              }
          )
        }
      }
    }
    post {
        always {
            sh "docker rmi $registry:FRONT$GIT_COMMIT --force"
            sh "docker rmi $registry:BACK$GIT_COMMIT --force"
        }
    }
}