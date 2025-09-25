pipeline {
    agent any

    environment {
        TOMCAT_HOME = 'C:\\Program Files\\Apache Software Foundation\\Tomcat 9.0'
    }

    stages {

        // ===== FRONTEND BUILD (Next.js) =====
        stage('Build Frontend') {
            steps {
                dir('finally') {
                    bat 'npm install'
                    bat 'npm run export'
                }
            }
        }

        // ===== FRONTEND DEPLOY =====
        stage('Deploy Frontend to Tomcat') {
            steps {
                bat '''
                if exist "%TOMCAT_HOME%\\webapps\\finally" (
                    rmdir /S /Q "%TOMCAT_HOME%\\webapps\\finally"
                )
                mkdir "%TOMCAT_HOME%\\webapps\\finally"
                xcopy /E /I /Y finally\\out\\* "%TOMCAT_HOME%\\webapps\\finally"
                '''
            }
        }

        // ===== BACKEND BUILD =====
        stage('Build Backend') {
            steps {
                dir('BudgetPlannerr (3)') {
                    bat 'mvn clean package -DskipTests'
                }
            }
        }

        // ===== BACKEND DEPLOY =====
        stage('Deploy Backend to Tomcat') {
            steps {
                bat '''
                if exist "%TOMCAT_HOME%\\webapps\\budgetplanner.war" (
                    del /Q "%TOMCAT_HOME%\\webapps\\budgetplanner.war"
                )
                if exist "%TOMCAT_HOME%\\webapps\\budgetplanner" (
                    rmdir /S /Q "%TOMCAT_HOME%\\webapps\\budgetplanner"
                )
                copy "BudgetPlannerr (3)\\target\\*.war" "%TOMCAT_HOME%\\webapps\\budgetplanner.war"
                '''
            }
        }

        // ===== RESTART TOMCAT =====
        stage('Restart Tomcat') {
            steps {
                bat '''
                net stop Tomcat9
                net start Tomcat9
                '''
            }
        }

    }

    post {
        always {
            cleanWs()
        }
        success {
            echo 'Deployment Successful!'
        }
        failure {
            echo 'Pipeline Failed.'
        }
    }
}
