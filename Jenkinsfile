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
                      sh "cp nginx-deploy.conf nginx-proxy.conf"
                      script {
                          dockerImage = docker.build registry + ":FRONT$GIT_COMMIT"
                          docker.withRegistry( '', registryCredential ) {
                          dockerImage.push()
                      }
                      }
                  }
              },
              backend: {
                  dir('api') {
                      sh "cp dri/settings/jenkins.py dri/settings/local_vars.py"
                      script {
                          dockerImage = docker.build registry + ":BACK$GIT_COMMIT"
                          sh "coverage run --source=. --omit='*migrations' manage.py test --verbosity=2"
                          docker.withRegistry( '', registryCredential ) {
                          dockerImage.push()
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
            sh "docker rmi $registry:FRONT$GIT_COMMIT --force"
            sh "docker rmi $registry:BACK$GIT_COMMIT --force"
        }
    }
}