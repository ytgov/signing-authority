pipeline {
    agent any
    environment {
        USER_CREDENTIALS = credentials('srv-jenkins')
        DB_NAME = "mongodb"
	WEB_NAME = "web"
        VERSION = "${env.BUILD_ID}-${env.GIT_COMMIT}"
        IMAGE = "${NAME}:${VERSION}"
        HARBOR_URL = "10.230.7.2"
        HARBOR_PROJECT = "fin-prd-ns"
    }

    triggers {
        githubPush()
    }


    stages {
        stage('Build and Push') {
            steps {
                script {
                    def web = docker.build("${HARBOR_URL}/${HARBOR_PROJECT}/${WEB_NAME}:${VERSION}", "-f ${env.WORKSPACE}/Dockerfile .")
                    docker.withRegistry("https://${HARBOR_URL}", "srv-jenkins-domain") {
                        web.push()
                        web.push("latest")
                    }

                }
            }
        }

        stage('Remove local image') {
            steps {
                sh "docker rmi ${HARBOR_URL}/${HARBOR_PROJECT}/${WEB_NAME}:${VERSION}"
            }
        }

        stage('Deploy') {

            steps {
                sh 'tkc=$(curl -XPOST -u $USER_CREDENTIALS_USR@ynet.gov.yk.ca:$USER_CREDENTIALS_PSW https://10.230.7.1/wcp/login -k -d \'{"guest_cluster_name":"fin-prd-cluster"}\' -H "Content-Type: application/json"); tkc_server=$(echo $tkc | jq -r .guest_cluster_server); tkc_session=$(echo $tkc | jq -r .session_id); kubectl config set-cluster $tkc_server --server=https://$tkc_server:6443 --insecure-skip-tls-verify=true; kubectl config set-context tkc-context-prod --cluster=$tkc_server; kubectl --context tkc-context-prod apply -f yaml/ -n signing-authority --token=$tkc_session'
            }
        }

        stage('Refresh deployments') {

            steps {
                sh 'tkc=$(curl -XPOST -u $USER_CREDENTIALS_USR@ynet.gov.yk.ca:$USER_CREDENTIALS_PSW https://10.230.7.1/wcp/login -k -d \'{"guest_cluster_name":"fin-prd-cluster"}\' -H "Content-Type: application/json"); tkc_server=$(echo $tkc | jq -r .guest_cluster_server); tkc_session=$(echo $tkc | jq -r .session_id); kubectl config set-cluster $tkc_server --server=https://$tkc_server:6443 --insecure-skip-tls-verify=true; kubectl config set-context tkc-context-prod --cluster=$tkc_server; kubectl --context tkc-context-prod -n signing-authority rollout restart deployment mongodb --token=$tkc_session'
                sh 'tkc=$(curl -XPOST -u $USER_CREDENTIALS_USR@ynet.gov.yk.ca:$USER_CREDENTIALS_PSW https://10.230.7.1/wcp/login -k -d \'{"guest_cluster_name":"fin-prd-cluster"}\' -H "Content-Type: application/json"); tkc_server=$(echo $tkc | jq -r .guest_cluster_server); tkc_session=$(echo $tkc | jq -r .session_id); kubectl config set-cluster $tkc_server --server=https://$tkc_server:6443 --insecure-skip-tls-verify=true; kubectl config set-context tkc-context-prod --cluster=$tkc_server; kubectl --context tkc-context-prod -n signing-authority rollout restart deployment web --token=$tkc_session'
            }
        }

    }
    post {
        always {
            emailext (
                to: 'shu-jun.lin@yukon.ca',
                subject: '$DEFAULT_SUBJECT',
                body: '$DEFAULT_CONTENT',
                mimeType: 'text/html'
            );
        }

        success {
            emailext (
                to: 'michael@icefoganalytics.com,ryanjagar@hey.com',
                subject: '$DEFAULT_SUBJECT',
                body: 'build number ${BUILD_NUMBER} with Git commit hash ${GIT_REVISION} has succeeded',
                mimeType: 'text/html'
            );
            echo 'Build complete'
        }
        failure {
            emailext (
                to: 'michael@icefoganalytics.com,ryanjagar@hey.com',
                subject: '$DEFAULT_SUBJECT',
                body: 'build number ${BUILD_NUMBER} with Git commit hash ${GIT_REVISION} has failed',
                mimeType: 'text/html'
            );
            echo 'Build failed'
        }
    }
}
