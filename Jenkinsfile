pipeline {
    environment {
        registry = "linea/dri"
        registryCredential = 'Dockerhub'
        dockerImageBack = ''
        dockerImageFront = ''
	commit = ''
        GIT_COMMIT_SHORT = sh(
                script: "printf \$(git rev-parse --short ${GIT_COMMIT})",
                returnStdout: true
        )
        deployment = 'dri_testing'
		namespace = 'dri_testing'
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
            // when {
            //     expression {
            //        env.BRANCH_NAME.toString().equals('master')
            //     }
            // }
            steps {
              parallel(
              frontend: {
                  dir('frontend') {
                    script{
                        if (env.BRANCH_NAME.toString().equals('master')) {
                            // No caso de um merge em master 
                            // Faz o push da imagem também como latest.
                            
                            docker.withRegistry( '', registryCredential ) {
                                    dockerImageFront.push()
                                    dockerImageFront.push("frontend_latest")
                            }
                            
                        }
                    }
                    //  Para merges em qualquer branch faz o push apenas da imagem com o hash do commit.
                    script {
                        docker.withRegistry( '', registryCredential ) {
                            dockerImageFront.push()
                        }
                    }
                  }
              },
              backend: {
                  dir('api') {
                    script{
                        if (env.BRANCH_NAME.toString().equals('master')) {
                            // No caso de um merge em master 
                            // Faz o push da imagem também como latest.
                            
                            docker.withRegistry( '', registryCredential ) {
                                dockerImageBack.push()
                                dockerImageBack.push("backend_latest")
                            }
                        
                        }
                    }
                    //  Para merges em qualquer branch faz o push apenas da imagem com o hash do commit.
                    script {
                        docker.withRegistry( '', registryCredential ) {
                            dockerImageBack.push()
                        }
                    }
                }
            }
          )
        }
      }
      stage('Deploy Images') {
            steps {
                script {
                    sh """
                    curl -D - -X \"POST\" \
                    -H \"content-type: application/json\" \
                    -H \"X-Rundeck-Auth-Token: $RD_AUTH_TOKEN\" \
                    -d '{\"argString\": \"-namespace $namespace -commit $GIT_COMMIT_SHORT -image $registry:$GIT_COMMIT_SHORT -deployment $deployment\"}' \
                    https://run.linea.gov.br/api/1/job/857f1a42-ca4b-4172-9c92-ace1e1197b8c/executions
                    """
                }
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
