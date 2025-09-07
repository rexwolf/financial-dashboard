#!/bin/bash
# Production deployment script for Financial Dashboard
# Author: Claude Code

set -e

# Colors for output
GREEN='\033[0;32m'
YELLOW='\033[0;33m'
RED='\033[0;31m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

echo -e "${GREEN}🚀 Financial Dashboard - Production Deployment${NC}"
echo "================================================"

# Configuration
PROJECT_NAME="financial-dashboard"
AWS_REGION="${AWS_REGION:-us-east-1}"
DOCKER_IMAGE="$PROJECT_NAME:latest"

# Function to check command existence
command_exists() {
    command -v "$1" >/dev/null 2>&1
}

# Check prerequisites
echo -e "${BLUE}🔍 Checking prerequisites...${NC}"

REQUIRED_COMMANDS=("docker" "aws")
for cmd in "${REQUIRED_COMMANDS[@]}"; do
    if ! command_exists "$cmd"; then
        echo -e "${RED}❌ $cmd is not installed${NC}"
        exit 1
    fi
done

echo -e "${GREEN}✅ Prerequisites met${NC}"

# Check AWS credentials
echo -e "${BLUE}🔐 Checking AWS credentials...${NC}"
AWS_ACCOUNT_ID=$(aws sts get-caller-identity --query Account --output text 2>/dev/null) || {
    echo -e "${RED}❌ AWS credentials not configured${NC}"
    echo -e "${YELLOW}💡 Run 'aws configure' to set up your credentials${NC}"
    exit 1
}

echo -e "${GREEN}✅ AWS Account: $AWS_ACCOUNT_ID${NC}"

# Check if infrastructure exists
if [ ! -d "../infrastructure" ]; then
    echo -e "${RED}❌ Infrastructure directory not found${NC}"
    echo -e "${YELLOW}💡 Make sure you're running from the project root${NC}"
    exit 1
fi

# Build production version
echo -e "${BLUE}🏗️  Building production version...${NC}"
./scripts/build.sh

# Build Docker image
echo -e "${BLUE}🐳 Building Docker image...${NC}"
docker build -t "$DOCKER_IMAGE" .
echo -e "${GREEN}✅ Docker image built${NC}"

# Login to ECR
echo -e "${BLUE}🔑 Logging into AWS ECR...${NC}"
aws ecr get-login-password --region "$AWS_REGION" | \
docker login --username AWS --password-stdin "$AWS_ACCOUNT_ID.dkr.ecr.$AWS_REGION.amazonaws.com"

# Check if ECR repository exists
ECR_REPO_URI="$AWS_ACCOUNT_ID.dkr.ecr.$AWS_REGION.amazonaws.com/$PROJECT_NAME"

aws ecr describe-repositories --repository-names "$PROJECT_NAME" --region "$AWS_REGION" >/dev/null 2>&1 || {
    echo -e "${YELLOW}📦 Creating ECR repository...${NC}"
    aws ecr create-repository \
        --repository-name "$PROJECT_NAME" \
        --region "$AWS_REGION" \
        --image-scanning-configuration scanOnPush=true
    echo -e "${GREEN}✅ ECR repository created${NC}"
}

# Tag and push image
echo -e "${BLUE}📤 Pushing image to ECR...${NC}"
docker tag "$DOCKER_IMAGE" "$ECR_REPO_URI:latest"
docker tag "$DOCKER_IMAGE" "$ECR_REPO_URI:$(date +%Y%m%d-%H%M%S)"

docker push "$ECR_REPO_URI:latest"
docker push "$ECR_REPO_URI:$(date +%Y%m%d-%H%M%S)"

echo -e "${GREEN}✅ Images pushed to ECR${NC}"

# Deploy infrastructure
echo -e "${BLUE}☁️  Deploying infrastructure...${NC}"
cd ../infrastructure

# Check if deploy script is executable
if [ ! -x ./deploy.sh ]; then
    chmod +x ./deploy.sh
fi

./deploy.sh

# Get deployment outputs
echo -e "${BLUE}📊 Getting deployment information...${NC}"

# Get CloudFront URL
CLOUDFRONT_URL=$(aws cloudformation describe-stacks \
    --stack-name "$PROJECT_NAME-cloudfront" \
    --region "$AWS_REGION" \
    --query 'Stacks[0].Outputs[?OutputKey==`CloudFrontURL`].OutputValue' \
    --output text 2>/dev/null || echo "N/A")

# Get ALB URL
ALB_URL=$(aws cloudformation describe-stacks \
    --stack-name "$PROJECT_NAME-alb" \
    --region "$AWS_REGION" \
    --query 'Stacks[0].Outputs[?OutputKey==`LoadBalancerURL`].OutputValue' \
    --output text 2>/dev/null || echo "N/A")

echo ""
echo -e "${GREEN}🎉 Deployment Complete!${NC}"
echo "================================================"
echo -e "${BLUE}🌐 Application URLs:${NC}"
echo -e "   CloudFront: ${GREEN}$CLOUDFRONT_URL${NC}"
echo -e "   Load Balancer: ${GREEN}$ALB_URL${NC}"
echo ""
echo -e "${BLUE}📊 Deployment Details:${NC}"
echo -e "   AWS Account: $AWS_ACCOUNT_ID"
echo -e "   Region: $AWS_REGION"
echo -e "   ECR Repository: $ECR_REPO_URI"
echo ""
echo -e "${BLUE}🔍 Monitoring:${NC}"
echo -e "   CloudWatch: https://$AWS_REGION.console.aws.amazon.com/cloudwatch/"
echo -e "   ECS Console: https://$AWS_REGION.console.aws.amazon.com/ecs/"
echo ""
echo -e "${YELLOW}💡 Next Steps:${NC}"
echo -e "   • Update DNS to point to CloudFront URL"
echo -e "   • Configure SSL certificate in CloudFront"
echo -e "   • Set up monitoring alerts"
echo -e "   • Configure domain name"