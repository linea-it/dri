pipeline {
    environment {
        registry = "linea/dri"
        registryCredential = 'Dockerhub'
        dockerImageBack = ''
        dockerImageFront = ''
        GIT_COMMIT_SHORT = sh(
                script: "printf \$(git rev-parse --short ${GIT_COMMIT})",
                returnStdout: true
        )
    }
    agent any

    stages {
        stage('Build Images') {
            steps {
              parallel(
              frontend: {
                  dir('frontend') {
                      sh "cp nginx-deploy.conf nginx-proxy.conf"
                      script {
                          dockerImageFront = docker.build registry + ":frontend_$GIT_COMMIT_SHORT"
                      }
                  }
              },
              backend: {
                  dir('api') {
                      sh "cp dri/settings/jenkins.py dri/settings/local_vars.py"
                      script {
                          dockerImageBack = docker.build registry + ":backend_$GIT_COMMIT_SHORT"
                      }
                  }
              }
          )
        }
      }
      stage('Test Backend') {
          steps {
            sh "docker run $registry:backend_$GIT_COMMIT_SHORT coverage run --source=. --omit='*migrations' manage.py test --verbosity=2"
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
                            docker.withRegistry( '', registryCredential ) {
                              dockerImageFront.push()
                              dockerImageFront.push("frontend_latest")
                            }
                      }
                  }
              },
              backend: {
                  dir('api') {
                      script {
                            docker.withRegistry( '', registryCredential ) {
                                dockerImageBack.push()
                                dockerImageBack.push("backend_latest")
                            }
                      }
                  }
              }
          )
        }
      }
    }
    post {
        always {
            sh "docker rmi $registry:frontend_$GIT_COMMIT_SHORT --force"
            sh "docker rmi $registry:backend_$GIT_COMMIT_SHORT --force"
        }
    }
}