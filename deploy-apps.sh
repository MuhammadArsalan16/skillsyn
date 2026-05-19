#!/bin/bash
RG="skillsync-rg"
ACR="skillsyncacr20260518"
PLAN="skillsync-plan"
DB_SERVER="skillsync-db-20260518"
DB_NAME="skillsync"
BACKEND_APP="skillsync-backend-20260518"
FRONTEND_APP="skillsync-frontend-20260518"
DB_USER="skillsync_user"
DB_PASS="skillsync_pass_123!"

# Wait for DB to finish if it's still creating (it's running in background via another command, but let's assume it finishes soon)
echo "Ensuring Postgres DB exists..."
az postgres flexible-server db create --resource-group $RG --server-name $DB_SERVER --database-name $DB_NAME

echo "Getting ACR password..."
ACR_PASSWORD=$(az acr credential show -n $ACR --query "passwords[0].value" -o tsv)

echo "Deploying Backend Web App..."
az webapp create -g $RG -p $PLAN -n $BACKEND_APP -i $ACR.azurecr.io/backend:latest
az webapp config container set -n $BACKEND_APP -g $RG \
  --docker-custom-image-name $ACR.azurecr.io/backend:latest \
  --docker-registry-server-url https://$ACR.azurecr.io \
  --docker-registry-server-user $ACR \
  --docker-registry-server-password $ACR_PASSWORD

az webapp config appsettings set -n $BACKEND_APP -g $RG --settings \
  DB_HOST=$DB_SERVER.postgres.database.azure.com \
  DB_PORT=5432 \
  DB_USER=$DB_USER \
  DB_PASSWORD=$DB_PASS \
  DB_NAME=$DB_NAME \
  JWT_SECRET=supersecretkey \
  PORT=5000 \
  WEBSITES_PORT=5000

echo "Deploying Frontend Web App..."
az webapp create -g $RG -p $PLAN -n $FRONTEND_APP -i $ACR.azurecr.io/frontend:latest
az webapp config container set -n $FRONTEND_APP -g $RG \
  --docker-custom-image-name $ACR.azurecr.io/frontend:latest \
  --docker-registry-server-url https://$ACR.azurecr.io \
  --docker-registry-server-user $ACR \
  --docker-registry-server-password $ACR_PASSWORD

az webapp config appsettings set -n $FRONTEND_APP -g $RG --settings \
  WEBSITES_PORT=80

echo "Deployment complete!"
